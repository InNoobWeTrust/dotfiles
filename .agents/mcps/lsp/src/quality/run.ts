import { type ChildProcess, spawn } from "node:child_process"
import { constants } from "node:fs"
import { access, readFile, stat } from "node:fs/promises"
import { delimiter, dirname, isAbsolute, join, relative, resolve } from "node:path"
import { isExecutable } from "../language-service/discovery/executable.ts"
import { resolveWorkspacePath, within } from "../workspace/paths.ts"
import type { ProviderResult, QualityOutput, QualityProvider } from "./contracts.ts"
import { checkApplicability, providersForFile } from "./registry.ts"

const stdoutLimit = 4 * 1024 * 1024
const stderrLimit = 64 * 1024
const diagnosticLimit = 100
const timerLimit = 2_147_483_647

function validateTimeout(timeoutMs?: number): void {
  if (timeoutMs !== undefined && (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0))
    throw new Error("timeoutMs must be a positive safe integer")
}

/** Owns native CLI children only; project jobs share a single serial queue. */
export class QualityRunner {
  private closing = false
  private projectTail: Promise<unknown> = Promise.resolve()
  private fileRunning = 0
  private readonly fileWaiters: (() => void)[] = []
  private readonly active = new Set<Promise<ProviderResult>>()
  private readonly children = new Set<ChildProcess>()

  constructor(private readonly cwd: string) {}

  private async paths(file: string, root: string) {
    // Feed even absolute operands through the existing relative-component checks.
    const workspace = await resolveWorkspacePath(this.cwd, ".", { directory: true })
    const operand = (input: string) => {
      if (input.split(/[\\/]/).includes("..")) throw new Error(`Unsafe path: ${input}`)
      return isAbsolute(input) ? relative(workspace.path, input) || "." : input
    }
    const target = await resolveWorkspacePath(workspace.path, operand(file))
    const boundary = await resolveWorkspacePath(workspace.path, operand(root), { directory: true })
    if (!(await stat(boundary.path)).isDirectory())
      throw new Error("Expected a workspace root directory")
    if (!within(boundary.path, target.path)) throw new Error("File is outside the requested root")
    await access(target.path, constants.R_OK)
    await access(boundary.path, constants.R_OK | constants.X_OK)
    return { file: target.path, root: boundary.path }
  }

  async runProvider(
    provider: QualityProvider,
    file: string,
    root: string,
    options?: { timeoutMs?: number },
  ): Promise<ProviderResult> {
    validateTimeout(options?.timeoutMs)
    if (this.closing) throw new Error("Quality runner is closed")
    const operation = (async () => {
      const paths = await this.paths(file, root)
      const run = () => this.execute(provider, paths.file, paths.root, options?.timeoutMs)
      if (provider.scope !== "project") return this.runFile(run, provider, options?.timeoutMs)
      const queued = this.projectTail.then(run)
      this.projectTail = queued.catch(() => {})
      return queued
    })()
    this.active.add(operation)
    try {
      return await operation
    } finally {
      this.active.delete(operation)
    }
  }

  async runAll(
    file: string,
    root: string,
    options?: { tools?: string[]; timeoutMs?: number },
  ): Promise<ProviderResult[]> {
    validateTimeout(options?.timeoutMs)
    if (this.closing) throw new Error("Quality runner is closed")
    const paths = await this.paths(file, root)
    const providers = providersForFile(paths.file, paths.root).filter(
      (provider) => !options?.tools || options.tools.includes(provider.id),
    )
    const results = await Promise.allSettled(
      providers.map((provider) => this.runProvider(provider, paths.file, paths.root, options)),
    )
    return results.map((result, index) => {
      if (result.status === "fulfilled") return result.value
      return this.result(providers[index], options?.timeoutMs, "error", String(result.reason))
    })
  }

  private async runFile(
    run: () => Promise<ProviderResult>,
    provider: QualityProvider,
    override?: number,
  ): Promise<ProviderResult> {
    while (!this.closing && this.fileRunning >= 4)
      await new Promise<void>((resolve) => this.fileWaiters.push(resolve))
    if (this.closing) return this.result(provider, override, "error", "Quality runner is closed")
    this.fileRunning++
    try {
      return await run()
    } finally {
      this.fileRunning--
      this.fileWaiters.shift()?.()
    }
  }

  private result(
    provider: QualityProvider,
    override: number | undefined,
    status: ProviderResult["status"],
    note?: string,
  ): ProviderResult {
    return {
      provider: provider.id,
      mechanism: "cli",
      status,
      caps: {
        timeoutMs: override ?? provider.defaultTimeoutMs,
        stdoutBytes: stdoutLimit,
        stderrBytes: stderrLimit,
        diagnostics: diagnosticLimit,
      },
      evidence: { source: "cli", tool: provider.id },
      ...(note ? { note } : {}),
    }
  }

  private async executionDirectory(provider: QualityProvider, file: string, root: string) {
    if (provider.scope === "file") return dirname(file)
    const manifest = provider.needs.includes("cargo-manifest") ? "Cargo.toml" : "go.mod"
    let dir = dirname(file)
    while (within(root, dir)) {
      try {
        if ((await stat(join(dir, manifest))).isFile()) return dir
      } catch {}
      if (dir === root) break
      dir = dirname(dir)
    }
    throw new Error(`No ${manifest} found inside requested root`)
  }

  private async executable(
    name: string,
    directory: string,
    root: string,
  ): Promise<string | undefined> {
    let dir = directory
    while (within(root, dir)) {
      for (const bin of ["node_modules/.bin", ".venv/bin", "venv/bin", ".pixi/envs/default/bin"]) {
        const candidate = join(dir, bin, name)
        // Retain the launcher path: Node shims may depend on it.
        if (await isExecutable(candidate)) return candidate
      }
      if (dir === root) break
      dir = dirname(dir)
    }
    for (const entry of (process.env.PATH ?? "").split(delimiter).filter(Boolean)) {
      const candidate = resolve(this.cwd, entry, name)
      if (await isExecutable(candidate)) return candidate
    }
    return undefined
  }

  private async execute(
    provider: QualityProvider,
    file: string,
    root: string,
    override?: number,
  ): Promise<ProviderResult> {
    const result = this.result(provider, override, "error")
    try {
      if (this.closing) throw new Error("Quality runner is closed")
      const applicable = await checkApplicability(provider, file, root)
      if (applicable !== "ready") return { ...result, ...applicable }
      const directory = provider.feedStdin
        ? root
        : await this.executionDirectory(provider, file, root)
      const argv = provider.argv(file)
      const executable = await this.executable(argv[0], dirname(file), root)
      if (!executable)
        return {
          ...result,
          status: "unavailable",
          note: "executable not found in workspace bins or PATH",
        }
      const timeoutMs = override ?? provider.defaultTimeoutMs
      validateTimeout(timeoutMs)
      const output = await this.spawn(
        executable,
        argv.slice(1),
        directory,
        timeoutMs,
        override !== undefined,
        provider.feedStdin ? await readFile(file) : undefined,
      )
      if (provider.id === "stylelint" && output.code === 78)
        return {
          ...result,
          status: "not-applicable",
          note: `native stylelint configuration unavailable: ${output.stderr.slice(0, 4096)}`,
        }
      if (output.code !== 0 && !provider.findingsExitCodes.includes(output.code ?? -1))
        throw new Error(`exited ${output.code}: ${output.stderr.slice(0, 4096)}`)
      if (
        ["ruff", "eslint", "shellcheck", "stylelint"].includes(provider.id) &&
        !(output.stdout.trim() || (provider.id === "stylelint" && output.stderr.trim()))
      )
        throw new Error("native JSON output was empty")
      // Native relative paths are execution-directory-relative, not workspace-relative.
      const parsed = provider.parse(output, { root: directory, absoluteFile: file })
      if (output.code !== 0 && parsed.length === 0)
        throw new Error(
          `exited ${output.code} without parseable findings: ${output.stderr.slice(0, 4096)}`,
        )
      const normalized = parsed.map((diagnostic) => {
        const match = /^(.*):(\d+):(\d+)$/.exec(diagnostic.location)
        if (!match) throw new Error("invalid native diagnostic location")
        const absolute = resolve(directory, match[1])
        return {
          absolute,
          diagnostic: {
            ...diagnostic,
            location: `${relative(root, absolute)}:${match[2]}:${match[3]}`,
          },
        }
      })
      const selected = normalized
        .filter((item) => item.absolute === file)
        .map((item) => item.diagnostic)
      const other = parsed.length - selected.length
      const note = [
        provider.feedStdin
          ? "readonly stdin mode; workspace root markdownlint-cli2 configuration applied; subdirectory overrides are not applied"
          : undefined,
        other
          ? `+${other} findings in other files; run the tool directly for the full package report`
          : undefined,
      ]
        .filter(Boolean)
        .join("; ")
      return {
        ...result,
        status: "ok",
        diagnostics: selected.slice(0, diagnosticLimit),
        totalDiagnostics: selected.length,
        truncated: selected.length > diagnosticLimit,
        ...(note ? { note } : {}),
      }
    } catch (cause) {
      return { ...result, note: cause instanceof Error ? cause.message : String(cause) }
    }
  }

  private kill(child: ChildProcess): void {
    if (!child.pid) return
    try {
      process.kill(-child.pid, "SIGKILL")
    } catch {
      child.kill("SIGKILL")
    }
  }

  private spawn(
    executable: string,
    args: readonly string[],
    directory: string,
    timeoutMs: number,
    overridden: boolean,
    input?: Buffer,
  ): Promise<QualityOutput & { code: number | null }> {
    if (this.closing) return Promise.reject(new Error("Quality runner is closed"))
    return new Promise((resolve, reject) => {
      // Every invocation owns a group, including file tools that launch helper processes.
      const child = spawn(executable, [...args], {
        cwd: directory,
        shell: false,
        detached: true,
        stdio: [input === undefined ? "ignore" : "pipe", "pipe", "pipe"],
      })
      this.children.add(child)
      const stdout: Buffer[] = [],
        stderr: Buffer[] = []
      let stdoutBytes = 0,
        stderrBytes = 0
      let failure: Error | undefined
      const fail = (message: string) => {
        failure ??= new Error(message)
        this.kill(child)
      }
      const started = performance.now()
      let timer: ReturnType<typeof setTimeout>
      // Node timers overflow above 2^31-1. Re-arm bounded timer segments, never clamp the deadline.
      const arm = () => {
        const remaining = timeoutMs - (performance.now() - started)
        if (remaining <= 0)
          fail(
            `timed out after ${timeoutMs}ms (bound: ${overridden ? "caller override" : "provider default"})`,
          )
        else timer = setTimeout(arm, Math.min(remaining, timerLimit))
      }
      arm()
      if (input !== undefined) {
        child.stdin?.on("error", (cause) => fail(`stdin write failed: ${cause.message}`))
        child.stdin?.end(input)
      }
      child.stdout.on("data", (chunk: Buffer) => {
        stdoutBytes += chunk.length
        if (stdoutBytes > stdoutLimit) fail("stdout exceeded 4MiB")
        else stdout.push(chunk)
      })
      child.stderr.on("data", (chunk: Buffer) => {
        stderrBytes += chunk.length
        if (stderrBytes > stderrLimit) fail("stderr exceeded 64KiB")
        else stderr.push(chunk)
      })
      child.once("error", (cause) => {
        failure ??= cause
      })
      child.once("close", (code, signal) => {
        clearTimeout(timer)
        // Reap remaining descendants even if the native launcher exited first.
        this.kill(child)
        this.children.delete(child)
        if (failure) reject(failure)
        else if (this.closing) reject(new Error("Quality runner is closed"))
        else if (signal) reject(new Error(`terminated by ${signal}`))
        else
          resolve({
            code,
            stdout: Buffer.concat(stdout).toString("utf8"),
            stderr: Buffer.concat(stderr).toString("utf8"),
          })
      })
    })
  }

  async close(): Promise<void> {
    this.closing = true
    for (const resume of this.fileWaiters.splice(0)) resume()
    for (const child of this.children) this.kill(child)
    await Promise.allSettled([...this.active])
  }
}
