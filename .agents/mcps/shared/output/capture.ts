import { closeSync, fsyncSync, mkdirSync, mkdtempSync, openSync, rmSync, writeSync } from "node:fs"
import { homedir } from "node:os"
import { isAbsolute, join } from "node:path"

export const INLINE_OUTPUT_BYTES = 65_536

/** Never inflate malformed or split UTF-8 into replacement characters. Raw files remain authoritative. */
export function decodePreview(buffer: Buffer): string {
  for (let trim = 0; trim <= Math.min(3, buffer.length); trim++) {
    try {
      return new TextDecoder("utf-8", { fatal: true }).decode(
        buffer.subarray(0, buffer.length - trim),
      )
    } catch {
      // Only an incomplete trailing codepoint can be repaired by removing up to three bytes.
    }
  }
  return ""
}

/** Raw streams are persisted before any inline-preview reduction. */
export class OutputCapture {
  readonly directory: string
  readonly stdoutPath: string
  readonly stderrPath: string
  private readonly files: Partial<Record<"stdout" | "stderr", number>> = {}
  private readonly chunks = { stdout: [] as Buffer[], stderr: [] as Buffer[] }
  private readonly previewEnded = { stdout: false, stderr: false }
  readonly bytes = { stdout: 0, stderr: 0 }
  private retained = 0
  truncated = false

  constructor(
    env: Record<string, string>,
    private readonly inlineBytes: number = INLINE_OUTPUT_BYTES,
    namespace: string = "delegate",
  ) {
    const cache = env.XDG_CACHE_HOME
    const home = env.HOME && isAbsolute(env.HOME) ? env.HOME : homedir()
    const root = join(cache && isAbsolute(cache) ? cache : join(home, ".cache"), namespace)
    mkdirSync(root, { recursive: true, mode: 0o700 })
    this.directory = mkdtempSync(join(root, "run-"))
    this.stdoutPath = join(this.directory, "stdout")
    this.stderrPath = join(this.directory, "stderr")
    try {
      this.files.stdout = openSync(this.stdoutPath, "wx", 0o600)
      this.files.stderr = openSync(this.stderrPath, "wx", 0o600)
    } catch (error) {
      try {
        this.close()
      } finally {
        rmSync(this.directory, { recursive: true, force: true })
      }
      throw error
    }
  }

  append(stream: "stdout" | "stderr", chunk: Buffer): void {
    const fd = this.files[stream]
    if (fd === undefined) throw new Error("Output cache is closed")
    let offset = 0
    while (offset < chunk.length) {
      const written = writeSync(fd, chunk, offset, chunk.length - offset)
      if (written === 0) throw new Error("Output cache write made no progress")
      offset += written
      this.bytes[stream] += written
    }
    if (this.previewEnded[stream]) return
    // Count JSON escaping, too: a NUL byte becomes six bytes ("\\u0000") on the wire.
    // This keeps control-heavy output as safe as ordinary prose without touching the raw files.
    let end = 0
    let cost = 0
    const available = Math.max(0, this.inlineBytes - this.retained)
    while (end < chunk.length) {
      const byte = chunk[end]
      const encoded =
        byte < 0x20
          ? byte === 8 || byte === 9 || byte === 10 || byte === 12 || byte === 13
            ? 2
            : 6
          : byte === 0x22 || byte === 0x5c
            ? 2
            : 1
      if (cost + encoded > available) break
      cost += encoded
      end++
    }
    const kept = chunk.subarray(0, end)
    if (kept.length) this.chunks[stream].push(Buffer.from(kept))
    this.retained += cost
    if (kept.length < chunk.length) {
      this.previewEnded[stream] = true
      this.truncated = true
    }
  }

  preview(stream: "stdout" | "stderr"): Buffer {
    return Buffer.concat(this.chunks[stream])
  }

  /** Close both streams even if flushing one fails; no paths advertised before this. */
  close(): void {
    let failure: unknown
    for (const stream of ["stdout", "stderr"] as const) {
      const fd = this.files[stream]
      if (fd === undefined) continue
      delete this.files[stream]
      try {
        fsyncSync(fd)
      } catch (error) {
        failure ??= error
      }
      try {
        closeSync(fd)
      } catch (error) {
        failure ??= error
      }
    }
    if (failure) throw failure
  }

  discard(): void {
    rmSync(this.directory, { recursive: true })
  }
}
