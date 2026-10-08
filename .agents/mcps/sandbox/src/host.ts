#!/usr/bin/env -S bun

/**
 * MCP command sandbox: Bubblewrap on Linux, Seatbelt (sandbox-exec) on macOS.
 * Both expose host files for reading; this is not a clean hostile-code environment.
 * Exposes mode-specific tools across MCP-compatible AI agent harnesses:
 * Claude Code, OpenAI Codex, Google Antigravity (AGY), OpenCode, Cursor, and Kilo.
 */

import { z } from "zod@4"
import { spawn } from "node:child_process"
import { mkdtemp, open, realpath, rm, stat } from "node:fs/promises"
import { constants, tmpdir } from "node:os"
import path from "node:path"
import type { McpServer } from "@modelcontextprotocol/sdk@1/server/mcp.js"
import type { CallToolResult } from "@modelcontextprotocol/sdk@1/types.js"

export const hostInstructions =
  "Use sandbox_ro for read-only commands needing network, sandbox_pure for offline checks, and sandbox_rw only for intentional, authorized workspace writes. " +
  "Tools accept command and optional absolute workdir; shells never load login profiles. " +
  "Without workdir, use one client-provided MCP directory root, or the server launch directory when roots are unsupported or empty. " +
  "Multiple or unusable roots require explicit workdir. Results report the chosen directory and source; launch-directory inference is not verified agent context. " +
  "Specify workdir whenever the default is uncertain, especially for sandbox_rw. Use $TMPDIR for scratch/cache writes. " +
  "On a restriction or unavailable backend, inspect and report the failure; do not retry unsandboxed or escalate to rw just to make a read-only command pass. " +
  "Resource budgets apply to every invocation. Investigate boundary failures before retrying; obtain human permission before raising budgets, then pass explicit limits for that invocation. " +
  "The MCP applies requested budgets; human approval belongs to the calling harness and conversation, not an MCP approval flag. " +
  "Host files and inherited environment remain readable: never dump secrets or treat this as hostile-code isolation. Native read/edit tools do not need wrapping."

type SandboxMode = "ro" | "pure" | "rw"
const launchDirectory = process.cwd()
const positiveInteger = z.number().int().positive().max(Number.MAX_SAFE_INTEGER)
const limitsObjectSchema = z
  .object({
    wallTimeMs: positiveInteger
      .max(2147483647)
      .describe("Elapsed milliseconds, including setup; default 120000."),
    maxOutputBytes: positiveInteger.describe(
      "Combined stdout/stderr bytes; default 4194304. Excess output stops the command.",
    ),
    cpuSeconds: positiveInteger.describe(
      "Per-process soft CPU seconds; default 60, not aggregate or elapsed time.",
    ),
    cpuHardSeconds: positiveInteger.describe(
      "Per-process hard CPU seconds; default 120, must be at least cpuSeconds.",
    ),
    maxFileBytes: positiveInteger
      .multipleOf(1024)
      .describe("Per-file bytes; default 104857600, not a total storage quota."),
    maxOpenFiles: positiveInteger.describe("Per-process file descriptors; default 256."),
    coreBytes: z
      .number()
      .int()
      .nonnegative()
      .max(Number.MAX_SAFE_INTEGER)
      .multipleOf(1024)
      .describe("Core-file bytes; default 0 (disabled)."),
    maxProcesses: positiveInteger
      .optional()
      .describe("Optional user-wide process ceiling; existing user processes count. No default."),
    addressSpaceBytes: positiveInteger
      .multipleOf(1024)
      .optional()
      .describe(
        "Optional Linux-only per-process virtual address-space bytes, not physical RAM. No default; can break runtime reservations.",
      ),
  })
  .strict()
const limitsSchema = limitsObjectSchema.refine(
  (value) => value.cpuSeconds <= value.cpuHardSeconds,
  "cpuSeconds must not exceed cpuHardSeconds",
)
type ResourceLimits = z.infer<typeof limitsSchema>
const defaultLimits: ResourceLimits = {
  wallTimeMs: 120000,
  maxOutputBytes: 4 * 1024 * 1024,
  cpuSeconds: 60,
  cpuHardSeconds: 120,
  maxFileBytes: 100 * 1024 * 1024,
  maxOpenFiles: 256,
  coreBytes: 0,
}
const inputSchema = {
  command: z.string().min(1).describe("Shell command to execute inside the sandbox"),
  workdir: z
    .string()
    .refine(path.isAbsolute, "workdir must be absolute")
    .optional()
    .describe(
      "Absolute working directory. Defaults to a single MCP directory root, otherwise the inferred server launch directory. Multiple roots require this argument.",
    ),
  limits: limitsObjectSchema
    .partial()
    .optional()
    .describe(
      "Invocation-only resource overrides. Investigate failures and obtain human permission before raising defaults. " +
        "Milliseconds: wallTimeMs. Bytes: maxOutputBytes (combined streams), maxFileBytes/coreBytes (multiples of 1024), addressSpaceBytes (Linux only, multiple of 1024). " +
        "CPU seconds: cpuSeconds/cpuHardSeconds. Counts: maxOpenFiles, optional maxProcesses (user-wide, not command-tree).",
    ),
}

const outputSchema = {
  exitCode: z
    .number()
    .int()
    .nullable()
    .describe("Sandbox process exit code; null if execution could not complete."),
  stdout: z
    .string()
    .describe("Captured standard output; bounded prefix when output limit is exceeded."),
  stderr: z
    .string()
    .describe("Captured standard error; bounded prefix when output limit is exceeded."),
  workdir: z
    .string()
    .nullable()
    .describe("Resolved working directory; null if directory discovery failed."),
  workdirSource: z.string().nullable(),
  error: z.string().optional().describe("Sandbox setup or execution error, not command stderr."),
  restrictionHint: z
    .string()
    .optional()
    .describe("Possible restriction guidance; not a confirmed diagnosis."),
  limits: limitsSchema
    .optional()
    .describe("Selected invocation budget; inherited OS ceilings may prevent application."),
  limitsApplied: z
    .boolean()
    .optional()
    .describe(
      "Launcher confirmed that requested OS limits were installed before sandbox execution.",
    ),
  termination: z
    .enum(["exited", "signal", "timeout", "output_limit", "setup_error", "execution_error"])
    .optional(),
  signal: z
    .string()
    .nullable()
    .optional()
    .describe("Observed process termination signal; never inferred from exit code alone."),
  truncated: z.object({ stdout: z.boolean(), stderr: z.boolean() }).optional(),
}
type SandboxOutput = z.infer<z.ZodObject<typeof outputSchema>>
type ExecutionOutput = Omit<SandboxOutput, "workdir" | "workdirSource">

async function resolveWorkdir(
  server: McpServer,
  workdir?: string,
): Promise<{ cwd: string; source: string }> {
  let directory = workdir ?? launchDirectory
  let source = workdir
    ? "explicit workdir"
    : "inferred server launch directory; client roots unsupported"
  if (!workdir && server.server.getClientCapabilities()?.roots) {
    // Query on every invocation: a long-lived client can switch workspaces.
    const { roots } = await server.server.listRoots({}, { timeout: 5000 })
    if (roots.length > 1)
      throw new Error("Multiple MCP roots; provide an absolute workdir. No command executed.")
    if (roots.length === 1) {
      const uri = new URL(roots[0].uri)
      if (uri.protocol !== "file:" || (uri.hostname && uri.hostname !== "localhost")) {
        throw new Error("MCP root is not a local file URI; provide an absolute workdir.")
      }
      directory = Bun.fileURLToPath(uri)
      source = "client MCP root"
    } else {
      source = "inferred server launch directory; client roots empty"
    }
  }
  const cwd = await realpath(directory)
  if (!(await stat(cwd)).isDirectory())
    throw new Error("workdir/MCP root must be an existing directory; provide an absolute workdir.")
  return { cwd, source }
}

async function executeSandbox(
  command: string,
  mode: SandboxMode,
  cwd: string,
  limits: ResourceLimits,
): Promise<ExecutionOutput> {
  const isMac = process.platform === "darwin"
  const backend = isMac ? "sandbox-exec" : "bwrap"
  const sandboxBin = Bun.which(backend)
  if (!sandboxBin || (!isMac && process.platform !== "linux")) {
    return {
      exitCode: null,
      stdout: "",
      stderr: "",
      error: `Sandbox backend unavailable: ${backend} on ${process.platform}. Refusing unsandboxed execution.`,
      limits,
      limitsApplied: false,
      termination: "setup_error",
    }
  }
  let tempDir: string | undefined

  // 2. Build sandbox arguments
  const bwrapArgs: string[] = [
    "--ro-bind",
    "/",
    "/",
    "--dev",
    "/dev",
    "--proc",
    "/proc",
    "--tmpfs",
    "/tmp",
    "--tmpfs",
    "/var/tmp",
    "--unshare-all",
    "--die-with-parent",
    "--chdir",
    cwd,
  ]

  switch (mode) {
    case "rw":
      // System read-only, working directory is writable
      bwrapArgs.push("--bind", cwd, cwd)
      bwrapArgs.push("--share-net")
      break
    case "pure":
      // Offline air-gapped: network namespace remains unshared
      break
    default:
      // Strict read-only everywhere, network enabled
      bwrapArgs.push("--share-net")
      break
  }

  // Skip login profiles but retain the inherited environment and PATH.
  const userShell = Bun.env.SHELL || "/bin/sh"
  const shellArgs = [userShell, "-c", command]

  bwrapArgs.push("--", ...shellArgs)

  // Both backends inherit the environment. macOS has no private mounts;
  // only its per-invocation scratch directory is writable outside the workspace.
  let output: ExecutionOutput
  try {
    tempDir = await mkdtemp(path.join(tmpdir(), "sandbox-"))
    const readyFile = path.join(tempDir, "limits-ready")
    let sandboxArgs = bwrapArgs
    let childEnv = { ...Bun.env }
    if (isMac) {
      const canonicalTemp = await realpath(tempDir)
      const canonicalCwd = await realpath(cwd)
      const profile = path.resolve(import.meta.dir, "../../../../.config/sandbox/command.sb")
      sandboxArgs = [
        "-D",
        `MODE=${mode}`,
        "-D",
        `WORKSPACE=${canonicalCwd}`,
        "-D",
        `TEMP_DIR=${canonicalTemp}`,
        "-f",
        profile,
        ...shellArgs,
      ]
      childEnv = { ...childEnv, TMPDIR: canonicalTemp, TMP: canonicalTemp, TEMP: canonicalTemp }
    }
    const launch = buildLimitedLaunch([sandboxBin, ...sandboxArgs], limits, isMac, readyFile)
    output = await superviseCommand(launch, cwd, childEnv, limits, readyFile)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    output = {
      exitCode: null,
      stdout: "",
      stderr: "",
      error: `Failed to execute ${backend} sandbox: ${message}`,
      limits,
      limitsApplied: false,
      termination: "setup_error",
    }
  }
  if (tempDir) {
    try {
      await rm(tempDir, { recursive: true, force: true })
    } catch (err) {
      const previousError = output.error ? `${output.error}; ` : ""
      output.error = `${previousError}Scratch cleanup failed: ${String(err)}`
      output.termination = "execution_error"
    }
  }
  return output
}

/** Install inherited hard ceilings in a child launcher, never in the MCP server. */
function buildLimitedLaunch(
  sandboxArgs: string[],
  limits: ResourceLimits,
  isMac: boolean,
  readyFile: string,
): string[] {
  // A marker in the private invocation scratch directory avoids extra-pipe races in Bun.
  // The path and command are positional arguments, never interpolated shell code.
  const ready = 'printf ready > "$1" || exit 125; shift; exec "$@"'
  if (!isMac) {
    const prlimit = Bun.which("prlimit")
    if (!prlimit) throw new Error("prlimit unavailable; refusing execution without resource limits")
    const args = [
      prlimit,
      `--cpu=${limits.cpuSeconds}:${limits.cpuHardSeconds}`,
      `--fsize=${limits.maxFileBytes}:${limits.maxFileBytes}`,
      `--nofile=${limits.maxOpenFiles}:${limits.maxOpenFiles}`,
      `--core=${limits.coreBytes}:${limits.coreBytes}`,
    ]
    if (limits.maxProcesses !== undefined)
      args.push(`--nproc=${limits.maxProcesses}:${limits.maxProcesses}`)
    if (limits.addressSpaceBytes !== undefined)
      args.push(`--as=${limits.addressSpaceBytes}:${limits.addressSpaceBytes}`)
    return [...args, "--", "/bin/sh", "-c", ready, "sandbox-launcher", readyFile, ...sandboxArgs]
  }
  if (limits.addressSpaceBytes !== undefined) {
    throw new Error(
      "addressSpaceBytes is Linux-only; macOS has no verified equivalent memory ceiling",
    )
  }
  const setup = [
    `ulimit -S -H -t ${limits.cpuHardSeconds}`,
    `ulimit -S -t ${limits.cpuSeconds}`,
    // Apple's /bin/sh uses 1024-byte blocks for file/core limits.
    `ulimit -S -H -f ${limits.maxFileBytes / 1024}`,
    `ulimit -S -H -n ${limits.maxOpenFiles}`,
    `ulimit -S -H -c ${limits.coreBytes / 1024}`,
  ]
  if (limits.maxProcesses !== undefined) setup.push(`ulimit -S -H -u ${limits.maxProcesses}`)
  // Braces keep limits in the exec'ing shell rather than a subshell.
  return [
    "/bin/sh",
    "-c",
    `{ ${setup.join(" && ")}; } || exit 125; ${ready}`,
    "sandbox-launcher",
    readyFile,
    ...sandboxArgs,
  ]
}

/** Own one process group and bounded streams until command exit or a supervisor stop. */
async function superviseCommand(
  args: string[],
  cwd: string,
  env: NodeJS.ProcessEnv,
  limits: ResourceLimits,
  readyFile: string,
): Promise<ExecutionOutput> {
  const child = spawn(args[0], args.slice(1), {
    cwd,
    env,
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
  })
  let stopReason: "timeout" | "output_limit" | undefined
  let executionError: string | undefined
  let cleanupFailure: NodeJS.ErrnoException | undefined
  let retainedBytes = 0
  const chunks: { stdout: Buffer[]; stderr: Buffer[] } = { stdout: [], stderr: [] }
  const truncated = { stdout: false, stderr: false }
  let drainTimer: ReturnType<typeof setTimeout> | undefined
  let exitObserved = false
  type ProcessResult = { code: number | null; signal: NodeJS.Signals | null }
  let resolveResult: ((result: ProcessResult) => void) | undefined
  const killGroup = () => {
    if (!child.pid) return
    try {
      process.kill(-child.pid, "SIGKILL")
    } catch (err) {
      const failure = err as NodeJS.ErrnoException
      // Darwin can report EPERM for a zombie-only group before the child is reaped.
      // Clear it only when a later attempt confirms that the group no longer exists.
      if (failure.code === "ESRCH" && cleanupFailure?.code === "EPERM") cleanupFailure = undefined
      else if (failure.code !== "ESRCH") cleanupFailure = failure
    }
    // An escaped descendant can keep inherited pipes open. Never wait indefinitely.
    drainTimer ??= setTimeout(() => {
      for (const stream of ["stdout", "stderr"] as const) {
        const pipe = child[stream]
        if (!pipe.readableEnded) {
          truncated[stream] = true
          executionError ??=
            "Output pipe remained open after process-group cleanup; capture was stopped. A descendant may have escaped the process group."
          pipe.destroy()
        }
      }
      if (!exitObserved) {
        const previousError = executionError ? `${executionError}; ` : ""
        executionError = `${previousError}Command did not exit after cleanup; processes may remain running.`
        child.unref()
        resolveResult?.({ code: null, signal: null })
      }
    }, 250)
  }
  const timer = setTimeout(() => {
    stopReason ??= "timeout"
    killGroup()
  }, limits.wallTimeMs)
  const capture = (stream: "stdout" | "stderr", chunk: Buffer) => {
    const available = Math.max(0, limits.maxOutputBytes - retainedBytes)
    const kept = chunk.subarray(0, available)
    if (kept.length) {
      chunks[stream].push(Buffer.from(kept))
      retainedBytes += kept.length
    }
    if (kept.length < chunk.length) {
      truncated[stream] = true
      stopReason ??= "output_limit"
      killGroup()
    }
  }
  child.stdout.on("data", (chunk) => capture("stdout", chunk))
  child.stderr.on("data", (chunk) => capture("stderr", chunk))
  for (const pipe of [child.stdout, child.stderr]) {
    pipe.on("error", (err) => {
      executionError = `Capture failed: ${err.message}`
      killGroup()
    })
  }
  const pipesDrained = Promise.all(
    [child.stdout, child.stderr].map(
      (pipe) =>
        new Promise<void>((resolve) => {
          pipe.once("end", resolve)
          pipe.once("close", resolve)
          pipe.once("error", resolve)
        }),
    ),
  )
  // A command is synchronous: remaining children in this group are not background services.
  child.on("exit", () => {
    exitObserved = true
    killGroup()
  })
  const result = await new Promise<ProcessResult>((resolve) => {
    resolveResult = resolve
    child.on("error", (err) => {
      executionError = err.message
      killGroup()
    })
    child.on("close", (code, signal) => resolve({ code, signal }))
  })
  await pipesDrained
  clearTimeout(timer)
  clearTimeout(drainTimer)
  const stdout = Buffer.concat(chunks.stdout).toString("utf8")
  const stderr = Buffer.concat(chunks.stderr).toString("utf8")
  let limitsApplied = false
  try {
    const marker = await open(readyFile, "r")
    try {
      const bytes = Buffer.alloc(5)
      const { bytesRead } = await marker.read(bytes, 0, bytes.length, 0)
      limitsApplied = bytesRead === 5 && bytes.toString() === "ready"
    } finally {
      await marker.close()
    }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT")
      executionError = `Could not read limit setup marker: ${String(err)}`
  }
  if (cleanupFailure) {
    const previousError = executionError ? `; ${executionError}` : ""
    executionError = `Process-group cleanup failed: ${String(cleanupFailure)}${previousError}`
  }
  const termination =
    stopReason ??
    (executionError
      ? "execution_error"
      : !limitsApplied
        ? "setup_error"
        : result.signal
          ? "signal"
          : "exited")
  const restrictionHint = diagnoseFailure(termination, result.code, result.signal, stderr)
  return {
    exitCode: result.code,
    stdout,
    stderr,
    limits,
    limitsApplied,
    termination,
    signal: result.signal,
    truncated,
    ...(executionError
      ? { error: executionError }
      : !limitsApplied && !stopReason
        ? {
            error:
              "Resource launcher did not confirm limit installation. Inspect setup diagnostics before retrying.",
          }
        : {}),
    ...(restrictionHint ? { restrictionHint } : {}),
  }
}

/** Keep supervisor observations distinct from signal/diagnostic evidence and inferred causes. */
function diagnoseFailure(
  termination: string,
  code: number | null,
  signal: string | null,
  stderr: string,
): string | undefined {
  if (termination === "timeout")
    return "Elapsed-time budget exceeded; process-group termination was requested. Check cleanup errors and investigate before requesting a larger budget."
  if (termination === "output_limit")
    return "Combined stdout/stderr budget exceeded; captured output is truncated and process-group termination was requested. Check cleanup errors and investigate excessive output before escalation."
  if (termination === "setup_error")
    return "Required limits could not be installed. Inspect the setup error and stderr; do not silently retry without protection."
  if (code === 0 && signal === null) return
  const cpuSignal = constants.signals.SIGXCPU
  const fileSignal = constants.signals.SIGXFSZ
  if (signal === "SIGXCPU" || code === 128 + cpuSignal)
    return "SIGXCPU evidence suggests a per-process CPU limit failure; a shell exit code alone is not proof. Investigate before escalation."
  if (signal === "SIGXFSZ" || code === 128 + fileSignal)
    return "SIGXFSZ evidence suggests a per-file size limit failure, not an aggregate disk quota. Investigate before escalation."
  if (/File too large|File size limit exceeded|CPU time limit exceeded/i.test(stderr)) {
    return "Diagnostics suggest a per-file size or CPU-time limit failure; verify against the selected budget before escalation."
  }
  if (
    /MemoryError|heap out of memory|Cannot allocate memory|Resource temporarily unavailable|Too many open files/i.test(
      stderr,
    )
  ) {
    return "Allocation/process/file-descriptor failure may indicate a resource limit or host pressure; stderr does not prove the configured limit was responsible. Investigate before escalation."
  }
  if (/Read-only file system|Operation not permitted|Permission denied/i.test(stderr)) {
    return "An access restriction or ordinary permission failure may have occurred. Inspect stderr and intended side effects; do not automatically switch modes or raise budgets."
  }
}

const tools: { name: string; mode: SandboxMode; description: string }[] = [
  {
    name: "sandbox_ro",
    mode: "ro",
    description:
      "Read-only host/workspace with network access: inspections and queries needing network.",
  },
  {
    name: "sandbox_pure",
    mode: "pure",
    description:
      "Offline read-only host/workspace: git status/diff, searches, and non-mutating checks without network.",
  },
  {
    name: "sandbox_rw",
    mode: "rw",
    description:
      "Authorized workspace writes with network access: builds, edits, and bounded side effects. The resolved workdir becomes writable; specify it if uncertain.",
  },
]

export function registerHostTools(server: McpServer): void {
  for (const { name, mode, description } of tools) {
    server.registerTool(
      name,
      {
        description: `${description} Non-login shell, writable scratch at $TMPDIR. Resource budgets always apply; limits overrides affect only this invocation and require human permission when raising budgets. Synchronous commands only; remaining process-group children are targeted for termination and cleanup failures are reported. Host files/environment remain readable; not hostile-code isolation. Investigate denials; never silently retry unrestricted.`,
        inputSchema,
        outputSchema,
      },
      async ({ command, workdir, limits: overrides }): Promise<CallToolResult> => {
        let output: SandboxOutput
        let cwd: string | null = null
        let source: string | null = null
        let limits: ResourceLimits | undefined
        try {
          limits = limitsSchema.parse({ ...defaultLimits, ...overrides })
          const resolved = await resolveWorkdir(server, workdir)
          cwd = resolved.cwd
          source = resolved.source
          const result = await executeSandbox(command, mode, cwd, limits)
          output = { ...result, workdir: cwd, workdirSource: source }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err)
          output = {
            exitCode: null,
            stdout: "",
            stderr: "",
            workdir: cwd,
            workdirSource: source,
            error: `Sandbox request failed: ${message}. No command executed.`,
            ...(limits ? { limits } : {}),
            limitsApplied: false,
            termination: "setup_error",
          }
        }
        return {
          structuredContent: output,
          // MCP recommends serialized JSON for clients without structured output support.
          content: [{ type: "text", text: JSON.stringify(output) }],
          isError:
            output.exitCode !== 0 ||
            output.error !== undefined ||
            output.termination === "timeout" ||
            output.termination === "output_limit",
        }
      },
    )
  }
}
