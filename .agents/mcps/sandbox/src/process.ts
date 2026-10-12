import { spawn } from "node:child_process"
import { decodePreview, INLINE_OUTPUT_BYTES, OutputCapture } from "../../shared/output.ts"

export interface ProcessResult {
  exitCode: number | null
  /** Complete raw stdout path in the private cache; null only when capture setup failed. */
  stdoutPath: string | null
  /** Complete raw stderr path in the private cache; null only when capture setup failed. */
  stderrPath: string | null
  stdoutBytes: number
  stderrBytes: number
  stdout: string
  stderr: string
  stop: "exited" | "timeout" | "capture_failed"
  /** Whether the inline preview omitted bytes; the raw file always holds the complete stream. */
  truncated: { stdout: boolean; stderr: boolean }
  error?: string
}

const DEFAULT_WALL_TIME_MS = 10_000

/**
 * Forwarded to child container CLI processes. Limited to what the selected
 * engine (Podman or Docker) requires; avoids exposing the full host
 * environment including secrets.
 */
const FORWARDED_ENV_KEYS = [
  "PATH",
  "HOME",
  "DOCKER_HOST",
  "DOCKER_TLS_VERIFY",
  "DOCKER_CERT_PATH",
  "DOCKER_CONFIG",
  "DOCKER_CONTEXT",
  "USER",
  // Podman connection/runtime configuration for rootless and remote engines.
  "XDG_RUNTIME_DIR",
  "XDG_CONFIG_HOME",
  "XDG_DATA_HOME",
  "CONTAINER_HOST",
  "CONTAINER_CONNECTION",
  "SSH_AUTH_SOCK",
] as const

/** Cache location inputs only; the child engine never sees them. */
const CAPTURE_ENV_KEYS = ["XDG_CACHE_HOME", "HOME"] as const

/** A preview that cannot round-trip its own bytes omitted something. */
function previewOmittedBytes(preview: Buffer, text: string, retainedBytes: number): boolean {
  return preview.length < retainedBytes || !Buffer.from(text).equals(preview)
}

/**
 * Spawn args[0] with the remaining elements as arguments. Never uses a shell.
 *
 * Both streams are written to the private output cache before any preview is
 * derived, so output volume never stops the command and the complete raw bytes
 * survive. `stdout`/`stderr` are bounded previews only; `stdoutPath`/`stderrPath`
 * and the byte counts describe the retained files. Only a genuine capture or
 * spawn failure, and the wall-clock limit, stop the process — the default is
 * 10 s wall time and a 64 KiB combined preview. `inlineBytes` is an internal
 * allowance for engine CLI calls whose response must still be parsed; it is
 * never an output or process limit.
 */
export async function run(
  args: string[],
  options?: { wallTimeMs?: number; inlineBytes?: number },
): Promise<ProcessResult> {
  if (args.length === 0) throw new Error("run: args must not be empty")

  const wallTimeMs = options?.wallTimeMs ?? DEFAULT_WALL_TIME_MS
  const [cmd, ...rest] = args

  const env: Record<string, string> = {}
  for (const k of FORWARDED_ENV_KEYS) {
    const v = process.env[k]
    if (v !== undefined) env[k] = v
  }
  const captureEnv: Record<string, string> = {}
  for (const k of CAPTURE_ENV_KEYS) {
    const v = process.env[k]
    if (v !== undefined) captureEnv[k] = v
  }

  let output: OutputCapture
  try {
    output = new OutputCapture(captureEnv, options?.inlineBytes ?? INLINE_OUTPUT_BYTES, "sandbox")
  } catch (error) {
    // Nothing can be preserved, so no command is launched.
    return {
      exitCode: null,
      stdoutPath: null,
      stderrPath: null,
      stdoutBytes: 0,
      stderrBytes: 0,
      stdout: "",
      stderr: "",
      stop: "capture_failed",
      truncated: { stdout: false, stderr: false },
      error: `Could not create output cache: ${(error as Error).message}`,
    }
  }

  return new Promise<ProcessResult>((resolve) => {
    const child = spawn(cmd, rest, { shell: false, env, stdio: ["ignore", "pipe", "pipe"] })

    let settled = false
    let aborting = false
    let stop: ProcessResult["stop"] = "exited"
    let spawnError: string | undefined
    let drainTimer: ReturnType<typeof setTimeout> | undefined

    const settle = (code: number | null) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      clearTimeout(drainTimer)
      const stdoutPreview = output.preview("stdout")
      const stderrPreview = output.preview("stderr")
      const stdout = decodePreview(stdoutPreview)
      const stderr = decodePreview(stderrPreview)
      // A capture that cannot be closed is not durable, so it fails explicitly.
      try {
        output.close()
      } catch (error) {
        stop = "capture_failed"
        spawnError = `Could not finalize output cache: ${(error as Error).message}`
      }
      resolve({
        exitCode: code,
        stdoutPath: output.stdoutPath,
        stderrPath: output.stderrPath,
        stdoutBytes: output.bytes.stdout,
        stderrBytes: output.bytes.stderr,
        stdout,
        stderr,
        stop,
        truncated: {
          stdout: previewOmittedBytes(stdoutPreview, stdout, output.bytes.stdout),
          stderr: previewOmittedBytes(stderrPreview, stderr, output.bytes.stderr),
        },
        ...(spawnError !== undefined ? { error: spawnError } : {}),
      })
    }

    const abort = (reason?: "timeout" | "capture_failed") => {
      if (settled || aborting) return
      aborting = true
      if (reason) stop = reason
      try {
        child.kill("SIGKILL")
      } catch (error) {
        spawnError = `CLI termination failed: ${(error as Error).message}`
      }
      drainTimer = setTimeout(() => {
        spawnError ??=
          "CLI termination or output drain could not be confirmed; a process may remain running"
        child.stdout?.destroy()
        child.stderr?.destroy()
        child.unref()
        settle(null)
      }, 250)
    }

    const timer = setTimeout(() => abort("timeout"), wallTimeMs)

    const capture = (stream: "stdout" | "stderr", chunk: Buffer) => {
      if (settled) return
      try {
        output.append(stream, chunk)
      } catch (error) {
        spawnError = `Could not preserve output: ${(error as Error).message}`
        abort("capture_failed")
      }
    }

    // A stream error during an abort must not replace the reason already recorded.
    const streamFailed = (error: Error) => {
      if (settled || aborting) return
      spawnError = error.message
      abort("capture_failed")
    }

    child.stdout.on("data", (chunk: Buffer) => capture("stdout", chunk))
    child.stderr.on("data", (chunk: Buffer) => capture("stderr", chunk))
    child.stdout.on("error", streamFailed)
    child.stderr.on("error", streamFailed)
    child.on("error", (err) => {
      spawnError = err.message
    })
    child.on("close", (code) => settle(code))
  })
}
