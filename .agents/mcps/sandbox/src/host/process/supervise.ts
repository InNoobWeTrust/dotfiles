/** Own one process group and write both streams to the cache until command exit or a supervisor stop. */
import { spawn } from "node:child_process"
import { open } from "node:fs/promises"
import { decodePreview, type OutputCapture } from "../../../../shared/output/capture.ts"
import type { ExecutionOutput, ResourceLimits } from "../protocol/contracts.ts"
import { diagnoseFailure } from "./diagnosis.ts"

export async function superviseCommand(
  args: string[],
  cwd: string,
  env: NodeJS.ProcessEnv,
  limits: ResourceLimits,
  readyFile: string,
  capture: OutputCapture,
): Promise<ExecutionOutput> {
  const child = spawn(args[0], args.slice(1), {
    cwd,
    env,
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
  })
  let stopReason: "timeout" | undefined
  let executionError: string | undefined
  let cleanupFailure: NodeJS.ErrnoException | undefined
  // Set only when capture itself stopped early; byte counts also mark preview omission.
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
  const captureStream = (stream: "stdout" | "stderr", chunk: Buffer) => {
    // Output volume never stops the command; only a real cache write failure does.
    try {
      capture.append(stream, chunk)
    } catch (err) {
      executionError = `Output capture failed: ${String(err)}`
      killGroup()
    }
  }
  child.stdout.on("data", (chunk: Buffer) => captureStream("stdout", chunk))
  child.stderr.on("data", (chunk: Buffer) => captureStream("stderr", chunk))
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
  const stdoutPreview = capture.preview("stdout")
  const stderrPreview = capture.preview("stderr")
  const stdout = decodePreview(stdoutPreview)
  const stderr = decodePreview(stderrPreview)
  // Both byte-level omission and non-representable bytes keep the raw file authoritative.
  if (stdoutPreview.length < capture.bytes.stdout || !Buffer.from(stdout).equals(stdoutPreview))
    truncated.stdout = true
  if (stderrPreview.length < capture.bytes.stderr || !Buffer.from(stderr).equals(stderrPreview))
    truncated.stderr = true
  // Advertise paths only after both files are flushed and closed.
  try {
    capture.close()
  } catch (err) {
    executionError = `Output capture failed: ${String(err)}`
  }
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
    stdoutPath: capture.stdoutPath,
    stderrPath: capture.stderrPath,
    stdoutBytes: capture.bytes.stdout,
    stderrBytes: capture.bytes.stderr,
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
