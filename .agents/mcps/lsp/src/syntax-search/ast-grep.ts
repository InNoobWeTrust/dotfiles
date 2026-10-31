import { z } from "zod@4"
import { type ChildProcess, spawn } from "node:child_process"
import { resolveWorkspacePath } from "../workspace/paths.ts"

const offsets = z.object({
  start: z.number().int().nonnegative(),
  end: z.number().int().nonnegative(),
})
const position = z.object({
  line: z.number().int().nonnegative(),
  column: z.number().int().nonnegative(),
})
const matchesSchema = z.array(
  z
    .object({
      text: z.string(),
      file: z.string(),
      language: z.string(),
      range: z.object({ byteOffset: offsets, start: position, end: position }),
      replacement: z.string().optional(),
      replacementOffsets: offsets.optional(),
    })
    .passthrough(),
)

export const astGrepInput = {
  language: z
    .string()
    .min(1)
    .describe("Built-in ast-grep language, e.g. typescript, python or rust."),
  paths: z
    .array(z.string().min(1))
    .min(1)
    .describe(
      "Explicit workspace-relative paths (absolute paths inside the workspace are also accepted); no symlink components, traversal or .git.",
    ),
  pattern: z
    .string()
    .min(1)
    .optional()
    .describe("AST pattern; supply exactly one of pattern or kind."),
  kind: z.string().min(1).optional().describe("Native AST kind/selector; alternative to pattern."),
  selector: z
    .string()
    .min(1)
    .optional()
    .describe("Native selector to extract a sub-node of the pattern."),
  rewrite: z.string().optional().describe("CLI-rendered replacement preview only; never applied."),
  maxMatches: z.number().int().min(1).max(200).default(50),
}
type SearchInput = z.infer<z.ZodObject<typeof astGrepInput>>

// Keep the complete CLI allowlist visible; values are option-attached, paths follow `--`.
function searchArguments(input: SearchInput, paths: string[]): string[] {
  const args = [
    "run",
    "--custom-languages",
    "ignore",
    "--json=compact",
    "--threads",
    "2",
    "--color",
    "never",
    `--lang=${input.language}`,
  ]
  if (input.pattern !== undefined) args.push(`--pattern=${input.pattern}`)
  if (input.kind !== undefined) args.push(`--kind=${input.kind}`)
  if (input.selector !== undefined) args.push(`--selector=${input.selector}`)
  if (input.rewrite !== undefined) args.push(`--rewrite=${input.rewrite}`)
  return [...args, "--", ...paths]
}

/** Owns the sole structural request/child; never starts an LSP or writes source files. */
export class AstGrep {
  private active?: Promise<void>
  private child?: ChildProcess
  private closing = false

  constructor(private readonly cwd: string) {}

  private async exclusive<T>(operation: () => Promise<T>): Promise<T> {
    if (this.closing) throw new Error("Server is closing")
    if (this.active) throw new Error("An ast-grep request is already active")
    let finish!: () => void
    this.active = new Promise<void>((resolve) => {
      finish = resolve
    })
    try {
      return await operation()
    } finally {
      this.active = undefined
      finish()
    }
  }

  /** Version probes obey the same process caps as searches. No shell or user-supplied flags. */
  private run(
    executable: string,
    args: string[],
  ): Promise<{ code: number | null; stdout: string; stderr: string }> {
    if (this.closing) throw new Error("Server is closing")
    return new Promise((resolve, reject) => {
      const child = spawn(executable, args, { cwd: this.cwd, stdio: ["ignore", "pipe", "pipe"] })
      this.child = child
      const output: Buffer[] = []
      const errors: Buffer[] = []
      let stdoutBytes = 0
      let stderrBytes = 0
      let failure: Error | undefined
      const fail = (cause: Error) => {
        failure ??= cause
        child.kill("SIGKILL")
      }
      const timeout = setTimeout(() => fail(new Error("ast-grep timed out after 30000ms")), 30_000)
      child.stdout.on("data", (chunk: Buffer) => {
        stdoutBytes += chunk.length
        if (stdoutBytes > 4 * 1024 * 1024)
          fail(new Error("ast-grep stdout exceeded 4MiB; narrow paths/query"))
        else output.push(chunk)
      })
      child.stderr.on("data", (chunk: Buffer) => {
        stderrBytes += chunk.length
        if (stderrBytes > 64 * 1024) fail(new Error("ast-grep stderr exceeded 64KiB"))
        else errors.push(chunk)
      })
      child.once("error", (cause) => {
        failure ??= cause
      })
      child.once("close", (code, signal) => {
        clearTimeout(timeout)
        this.child = undefined
        if (failure) reject(failure)
        else if (this.closing) reject(new Error("Server is closing"))
        else if (signal) reject(new Error(`ast-grep terminated by ${signal}`))
        else
          resolve({
            code,
            stdout: Buffer.concat(output).toString("utf8"),
            stderr: Buffer.concat(errors).toString("utf8"),
          })
      })
    })
  }

  private async installed() {
    // Never fall back to `sg`: that name also identifies Unix's group-switch utility.
    const executable = Bun.which("ast-grep")
    if (!executable)
      return {
        available: false as const,
        executable: null,
        version: null,
        supported: false,
        minimumVersion: "0.51.0",
      }
    const probe = await this.run(executable, ["--version"])
    if (probe.code !== 0)
      throw new Error(`ast-grep version probe exited ${probe.code}: ${probe.stderr}`)
    const version = /^ast-grep (\d+)\.(\d+)\.(\d+)\s*$/.exec(probe.stdout)
    if (!version) throw new Error("Invalid ast-grep --version output")
    return {
      available: true as const,
      executable,
      version: `${version[1]}.${version[2]}.${version[3]}`,
      supported: Number(version[1]) > 0 || Number(version[2]) >= 51,
      minimumVersion: "0.51.0",
    }
  }

  private async paths(inputs: string[]): Promise<string[]> {
    const paths: string[] = []
    for (const entry of inputs) {
      const resolved = await resolveWorkspacePath(this.cwd, entry, { directory: true })
      // Absolute validated operands avoid option ambiguity, including leading-dash file names.
      paths.push(resolved.path)
    }
    return paths
  }

  /** Returns bounded native matches, including byte offsets and CLI-rendered replacement previews. */
  search(input: SearchInput) {
    return this.exclusive(async () => {
      if ((input.pattern !== undefined) === (input.kind !== undefined))
        throw new Error("Supply exactly one of pattern or kind")
      const paths = await this.paths(input.paths)
      const installed = await this.installed()
      if (!installed.available)
        throw new Error("ast-grep not found on PATH; install a trusted ast-grep >=0.51.0 (not sg)")
      if (!installed.supported)
        throw new Error(`ast-grep >=0.51.0 required; found ${installed.version}`)
      const response = await this.run(installed.executable, searchArguments(input, paths))
      if (response.code !== 0 && response.code !== 1)
        throw new Error(`ast-grep exited ${response.code}: ${response.stderr}`)
      const matches = matchesSchema.parse(JSON.parse(response.stdout))
      if (response.code === 1 && matches.length !== 0)
        throw new Error("ast-grep no-match exit contained matches")
      return {
        matches: matches.slice(0, input.maxMatches),
        totalMatches: matches.length,
        truncated: matches.length > input.maxMatches,
        warnings: response.stderr,
      }
    })
  }

  /** Refuses new work and kills only this adapter's active child, waiting for cleanup. */
  async close(): Promise<void> {
    this.closing = true
    this.child?.kill("SIGKILL")
    await this.active
  }
}
