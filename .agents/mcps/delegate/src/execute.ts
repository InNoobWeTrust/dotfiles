import { spawn } from "node:child_process"

/** Why a delegated process stopped. Anything but `exited` is a budget or launch failure. */
export type StopReason = "exited" | "wall_time" | "output_limit" | "spawn_failed"

export interface RunOptions {
  /** Directory the child starts in. */
  cwd: string
  /** Environment handed to the child. */
  env: Record<string, string>
  /** Hard wall-clock limit. */
  wallTimeMs: number
  /** Combined stdout+stderr budget. */
  maxOutputBytes: number
}

export interface RunResult {
  exitCode: number | null
  signal: string | null
  stop: StopReason
  stdout: string
  stderr: string
  durationMs: number
  truncated: boolean
  error?: string
}

const GRACE_MS = 2_000
const DRAIN_MS = 250
const POLL_MS = 50

/**
 * Decode a retained buffer, dropping a trailing incomplete UTF-8 sequence. The
 * budget is counted in raw bytes, so a cut can land mid-character; decoding that
 * anyway would emit U+FFFD and return more bytes than the caller allowed.
 */
function decode(buffer: Buffer): string {
  let end = buffer.length
  // A UTF-8 sequence is at most four bytes, so at most three can be dangling.
  for (let back = 1; back <= 3 && end - back >= 0; back++) {
    const byte = buffer[end - back]
    if ((byte & 0xc0) === 0x80) continue // continuation byte, keep walking back
    const needed = byte >= 0xf0 ? 4 : byte >= 0xe0 ? 3 : byte >= 0xc0 ? 2 : 1
    if (needed > back) end -= back
    break
  }
  return buffer.subarray(0, end).toString("utf8")
}

/**
 * Spawn `file` with `args`, never through a shell, as the leader of its own
 * process group so the whole tree can be torn down. stdin is closed rather than
 * inherited: `codex exec` blocks forever on an open pipe with no writer.
 *
 * The group is brought down on every exit path — a wall-clock or output-budget
 * abort, and a clean exit that left background descendants behind — and the run
 * is not reported until that teardown has finished, so a caller never releases
 * a concurrency slot or starts a new run while something is still working.
 * Partial output is returned rather than lost.
 */
export function runProcess(file: string, args: string[], options: RunOptions): Promise<RunResult> {
  return new Promise<RunResult>((resolve) => {
    const startedAt = Date.now()
    const child = spawn(file, args, {
      cwd: options.cwd,
      env: options.env,
      shell: false,
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
    })

    let settled = false
    let aborting = false
    let stop: StopReason = "exited"
    let truncated = false
    let spawnError: string | undefined
    let exit: { code: number | null; signal: NodeJS.Signals | null } | undefined
    let retainedBytes = 0
    const stdout: Buffer[] = []
    const stderr: Buffer[] = []
    const pending = new Set<ReturnType<typeof setTimeout>>()

    /** Later, cancellable. Every timer the teardown owns is tracked so none outlives the run. */
    const later = (action: () => void, ms: number) => {
      const timer = setTimeout(() => {
        pending.delete(timer)
        action()
      }, ms)
      pending.add(timer)
      return timer
    }

    /** Whether any process still holds this group. EPERM means alive, just not ours. */
    const groupExists = (): boolean => {
      if (child.pid === undefined) return false
      try {
        process.kill(-child.pid, 0)
        return true
      } catch (error) {
        return (error as NodeJS.ErrnoException).code !== "ESRCH"
      }
    }

    const signalGroup = (signal: NodeJS.Signals) => {
      if (child.pid === undefined) return
      try {
        process.kill(-child.pid, signal)
      } catch (error) {
        const code = (error as NodeJS.ErrnoException).code
        // ESRCH just means the group is already gone, which is the goal.
        if (code !== "ESRCH") {
          spawnError ??= `Could not signal the delegated process group: ${(error as Error).message}`
        }
      }
    }

    /**
     * Stop every member of the child's process group and resolve once the group
     * has actually gone, escalating SIGTERM to SIGKILL after the grace period.
     *
     * Completion is polled rather than assumed from a fixed timer, so nothing is
     * signalled once the group has disappeared and no delayed kill is left
     * behind to land on a recycled process-group id. POSIX gives no way to prove
     * a group id still refers to this run's own descendants, so an id recycled
     * inside the grace window remains a residual risk this cannot remove.
     */
    const stopGroup = (): Promise<void> =>
      new Promise<void>((done) => {
        if (!groupExists()) {
          done()
          return
        }
        signalGroup("SIGTERM")
        const escalateAt = Date.now() + GRACE_MS
        const poll = () => {
          if (!groupExists()) {
            done()
            return
          }
          if (Date.now() < escalateAt) {
            later(poll, POLL_MS)
            return
          }
          signalGroup("SIGKILL")
          const giveUpAt = Date.now() + DRAIN_MS
          const drain = () => {
            if (!groupExists()) {
              done()
              return
            }
            if (Date.now() >= giveUpAt) {
              spawnError ??=
                "The delegated process group did not exit after SIGTERM and SIGKILL; partial output was returned and a process may still be running."
              done()
              return
            }
            later(drain, POLL_MS)
          }
          later(drain, POLL_MS)
        }
        later(poll, POLL_MS)
      })

    /**
     * Teardown happens once per run. Abort and clean exit both ask for it, and
     * whoever arrives second joins the teardown already in flight rather than
     * starting a second one — a late signal could otherwise land on a group id
     * that has since been recycled.
     */
    let teardown: Promise<void> | undefined
    const teardownGroup = (): Promise<void> => {
      teardown ??= stopGroup()
      return teardown
    }

    const finish = () => {
      if (settled) return
      settled = true
      for (const timer of pending) clearTimeout(timer)
      pending.clear()
      resolve({
        exitCode: exit?.code ?? null,
        signal: exit?.signal ?? null,
        stop,
        stdout: decode(Buffer.concat(stdout)),
        stderr: decode(Buffer.concat(stderr)),
        durationMs: Date.now() - startedAt,
        truncated,
        ...(spawnError !== undefined ? { error: spawnError } : {}),
      })
    }

    const abort = (reason: "wall_time" | "output_limit") => {
      if (settled || aborting) return
      aborting = true
      stop = reason
      void teardownGroup().then(() => {
        // `finish` is idempotent and reports whatever the OS actually delivered,
        // so a `close` that lands first during the teardown still wins.
        child.stdout?.destroy()
        child.stderr?.destroy()
        finish()
      })
    }

    later(() => abort("wall_time"), options.wallTimeMs)

    const capture = (chunks: Buffer[], chunk: Buffer) => {
      if (settled) return
      const available = Math.max(0, options.maxOutputBytes - retainedBytes)
      const kept = chunk.subarray(0, available)
      if (kept.length > 0) {
        chunks.push(Buffer.from(kept))
        retainedBytes += kept.length
      }
      if (kept.length < chunk.length) {
        truncated = true
        abort("output_limit")
      }
    }

    child.stdout.on("data", (chunk: Buffer) => capture(stdout, chunk))
    child.stderr.on("data", (chunk: Buffer) => capture(stderr, chunk))
    child.stdout.on("error", () => {})
    child.stderr.on("error", () => {})
    child.on("error", (error: Error) => {
      spawnError = error.message
      stop = "spawn_failed"
      finish()
    })
    child.on("close", (code, signal) => {
      exit = { code, signal }
      if (settled) return
      // A harness can leave background children in its group with their streams
      // detached and then exit 0. Nothing supervises them once this call returns
      // and the concurrency slot is released, so the rest of the group is torn
      // down before the run is reported as finished. Teardown already in flight
      // from an abort is joined rather than repeated.
      void teardownGroup().then(finish)
    })
  })
}

/** First non-empty line of a version probe, trimmed to a single readable line. */
export function firstLine(text: string): string | null {
  for (const line of text.split("\n")) {
    const trimmed = line.trim()
    if (trimmed.length > 0) return trimmed.length > 200 ? `${trimmed.slice(0, 199)}…` : trimmed
  }
  return null
}
