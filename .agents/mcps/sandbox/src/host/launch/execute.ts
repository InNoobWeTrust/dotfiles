/** Build the platform sandbox and own invocation scratch/capture setup, supervision and final cleanup. */
import { mkdtemp, realpath, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { INLINE_OUTPUT_BYTES, OutputCapture } from "../../../../shared/output/capture.ts"
import { superviseCommand } from "../process/supervise.ts"
import type { ExecutionOutput, ResourceLimits, SandboxMode } from "../protocol/contracts.ts"
import { buildLimitedLaunch } from "./limits.ts"

export async function executeSandbox(
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
      stdoutPath: null,
      stderrPath: null,
      stdoutBytes: 0,
      stderrBytes: 0,
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
  let capture: OutputCapture | undefined
  try {
    // Paths exist only after this succeeds, so pre-exec failure leaves them null.
    capture = new OutputCapture(Bun.env as Record<string, string>, INLINE_OUTPUT_BYTES, "sandbox")
    tempDir = await mkdtemp(path.join(tmpdir(), "sandbox-"))
    const readyFile = path.join(tempDir, "limits-ready")
    let sandboxArgs = bwrapArgs
    let childEnv = { ...Bun.env }
    if (isMac) {
      const canonicalTemp = await realpath(tempDir)
      const canonicalCwd = await realpath(cwd)
      const profile = path.resolve(import.meta.dir, "../../../../../../.config/sandbox/command.sb")
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
    output = await superviseCommand(launch, cwd, childEnv, limits, readyFile, capture)
  } catch (err: unknown) {
    let message = err instanceof Error ? err.message : String(err)
    try {
      capture?.close()
    } catch (closeError: unknown) {
      message += `; Failed to flush output cache: ${String(closeError)}`
    }
    output = {
      exitCode: null,
      stdoutPath: capture?.stdoutPath ?? null,
      stderrPath: capture?.stderrPath ?? null,
      stdoutBytes: capture?.bytes.stdout ?? 0,
      stderrBytes: capture?.bytes.stderr ?? 0,
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
