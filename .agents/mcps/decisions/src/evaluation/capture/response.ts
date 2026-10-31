import { closeSync, fsyncSync, mkdirSync, mkdtempSync, openSync, rmSync, writeSync } from "node:fs"
import { homedir } from "node:os"
import { isAbsolute, join } from "node:path"
// Private raw-response and normalized-result cache ownership.
import { INLINE_OUTPUT_BYTES } from "../../../../shared/output/capture.ts"

export { INLINE_OUTPUT_BYTES }

function cacheRoot(env: Record<string, string | undefined>): string {
  const xdg = env.XDG_CACHE_HOME
  const home = env.HOME && isAbsolute(env.HOME) ? env.HOME : homedir()
  const base = xdg && isAbsolute(xdg) ? xdg : join(home, ".cache")
  return join(base, "decisions")
}

/**
 * Manages private XDG cache storage for one HTTP exchange.
 *
 * Creates a 0700 run directory before any network call and opens a 0600 response file.
 * Paths are valid after close() returns without error; partial data is retained on failure.
 */
export class ResponseCapture {
  readonly directory: string
  readonly responsePath: string
  private fd: number
  private _closed = false

  constructor(env: Record<string, string | undefined>) {
    const root = cacheRoot(env)
    mkdirSync(root, { recursive: true, mode: 0o700 })
    this.directory = mkdtempSync(join(root, "req-"))
    this.responsePath = join(this.directory, "response.json")
    try {
      this.fd = openSync(this.responsePath, "wx", 0o600)
    } catch (err) {
      rmSync(this.directory, { recursive: true, force: true })
      throw err
    }
  }

  /** Write a raw HTTP body chunk to the response file. */
  write(chunk: Uint8Array): void {
    let offset = 0
    while (offset < chunk.length) {
      const written = writeSync(this.fd, chunk, offset, chunk.length - offset)
      if (written === 0) throw new Error("Response cache write stalled")
      offset += written
    }
  }

  /** Fsync and close the response file. Safe to call multiple times. */
  close(): void {
    if (this._closed) return
    this._closed = true
    try {
      fsyncSync(this.fd)
    } finally {
      closeSync(this.fd)
    }
  }

  /**
   * Write a JSON payload to result.json in the capture directory.
   * Opens a separate fd; call after close(). Returns the resultPath.
   */
  serializeResult(payload: object): { resultPath: string } {
    const encoded = Buffer.from(JSON.stringify(payload), "utf-8")
    const resultPath = join(this.directory, "result.json")
    const fd = openSync(resultPath, "wx", 0o600)
    try {
      let offset = 0
      while (offset < encoded.length) {
        const written = writeSync(fd, encoded, offset, encoded.length - offset)
        if (written === 0) throw new Error("Result cache write stalled")
        offset += written
      }
      fsyncSync(fd)
    } finally {
      closeSync(fd)
    }
    return { resultPath }
  }
}

/**
 * Write a standalone JSON payload to a private cache file without an associated response stream.
 * Used for errors that arise before any HTTP exchange (e.g. BUSY).
 * Returns the resultPath on success, null if the cache cannot be created or written.
 */
export function serializeAnonymousError(env: Record<string, string | undefined>, payload: object): string | null {
  try {
    const root = cacheRoot(env)
    mkdirSync(root, { recursive: true, mode: 0o700 })
    const dir = mkdtempSync(join(root, "err-"))
    const resultPath = join(dir, "result.json")
    const encoded = Buffer.from(JSON.stringify(payload), "utf-8")
    const fd = openSync(resultPath, "wx", 0o600)
    try {
      let offset = 0
      while (offset < encoded.length) {
        const written = writeSync(fd, encoded, offset, encoded.length - offset)
        if (written === 0) throw new Error("write stalled")
        offset += written
      }
      fsyncSync(fd)
    } finally {
      closeSync(fd)
    }
    return resultPath
  } catch {
    return null
  }
}
