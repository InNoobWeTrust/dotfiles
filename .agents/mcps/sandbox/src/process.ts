import { spawn } from "node:child_process"

export interface ProcessResult {
  exitCode: number | null
  stdout: string
  stderr: string
  stop: "exited" | "timeout" | "output_limit"
  truncated: { stdout: boolean; stderr: boolean }
  error?: string
}

const DEFAULT_WALL_TIME_MS = 10_000
const DEFAULT_MAX_OUTPUT_BYTES = 1_048_576 // 1 MiB

/**
 * Forwarded to child processes. Limited to what docker CLI requires;
 * avoids exposing the full host environment including secrets.
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
] as const

/**
 * Spawn args[0] with the remaining elements as arguments. Never uses a shell.
 * stdout and stderr share one combined byte budget; whichever fills it first
 * triggers an immediate SIGKILL and returns stop:"output_limit".
 * Defaults: 10 s wall time, 1 MiB combined output.
 */
export async function run(
  args: string[],
  options?: { wallTimeMs?: number; maxOutputBytes?: number },
): Promise<ProcessResult> {
  if (args.length === 0) throw new Error("run: args must not be empty")

  const wallTimeMs = options?.wallTimeMs ?? DEFAULT_WALL_TIME_MS
  const maxOutputBytes = options?.maxOutputBytes ?? DEFAULT_MAX_OUTPUT_BYTES
  const [cmd, ...rest] = args

  const env: Record<string, string> = {}
  for (const k of FORWARDED_ENV_KEYS) {
    const v = process.env[k]
    if (v !== undefined) env[k] = v
  }

  return new Promise<ProcessResult>((resolve) => {
    const child = spawn(cmd, rest, { shell: false, env, stdio: ["ignore", "pipe", "pipe"] })

    let settled = false
    let aborting = false
    let stop: ProcessResult["stop"] = "exited"
    let spawnError: string | undefined
    let drainTimer: ReturnType<typeof setTimeout> | undefined
    let retainedBytes = 0
    const chunks: { stdout: Buffer[]; stderr: Buffer[] } = { stdout: [], stderr: [] }
    const truncated = { stdout: false, stderr: false }

    const settle = (code: number | null) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      clearTimeout(drainTimer)
      resolve({
        exitCode: code,
        stdout: Buffer.concat(chunks.stdout).toString("utf8"),
        stderr: Buffer.concat(chunks.stderr).toString("utf8"),
        stop,
        truncated: { ...truncated },
        ...(spawnError !== undefined ? { error: spawnError } : {}),
      })
    }

    const abort = (reason?: "timeout" | "output_limit") => {
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
      const available = Math.max(0, maxOutputBytes - retainedBytes)
      const kept = chunk.subarray(0, available)
      if (kept.length > 0) {
        chunks[stream].push(Buffer.from(kept))
        retainedBytes += kept.length
      }
      if (kept.length < chunk.length) {
        truncated[stream] = true
        abort("output_limit")
      }
    }

    child.stdout.on("data", (chunk: Buffer) => capture("stdout", chunk))
    child.stderr.on("data", (chunk: Buffer) => capture("stderr", chunk))
    child.stdout.on("error", (err) => {
      spawnError = err.message
      abort()
    })
    child.stderr.on("error", (err) => {
      spawnError = err.message
      abort()
    })
    child.on("error", (err) => {
      spawnError = err.message
    })
    child.on("close", (code) => settle(code))
  })
}
