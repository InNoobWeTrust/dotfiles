import { afterAll, describe, expect, test } from "bun:test"
import { mkdtempSync } from "node:fs"
import { mkdtemp, readFile, rm, stat } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { run } from "../src/execution/process.ts"

// Capture integrity protects lossless recovery: complete raw bytes must always
// survive on disk, bounded previews must never exceed the combined allowance,
// and small or empty output must still be retained. These run a real /bin/sh
// with finite output; no container engine or host process group is involved.
const cache = mkdtempSync(join(tmpdir(), "sandbox-output-"))
process.env.XDG_CACHE_HOME = cache
afterAll(() => rm(cache, { recursive: true, force: true }))

const sh = (script: string, options?: { wallTimeMs?: number; inlineBytes?: number }) =>
  run(["/bin/sh", "-c", script], options)

describe("lossless output capture", () => {
  test("combined preview stays within the fixed allowance while raw files hold everything", async () => {
    const cacheDir = await mkdtemp(join(tmpdir(), "sandbox-big-"))
    const previous = process.env.XDG_CACHE_HOME
    process.env.XDG_CACHE_HOME = cacheDir
    try {
      // 100 KiB stdout + 100 KiB stderr: both exceed the preview, both retained.
      const result = await run(
        [
          "/bin/sh",
          "-c",
          "head -c 100000 /dev/zero | tr '\\0' 'a'; head -c 100000 /dev/zero | tr '\\0' 'b' >&2",
        ],
        { wallTimeMs: 10_000 },
      )
      expect(result.stop).toBe("exited")
      expect(result.exitCode).toBe(0)
      expect(result.truncated).toEqual({ stdout: true, stderr: true })
      expect(result.stdoutBytes).toBe(100_000)
      expect(result.stderrBytes).toBe(100_000)
      if (!result.stdoutPath || !result.stderrPath) throw new Error("Missing raw stream paths")
      // Previews are bounded by the combined allowance.
      const previewBytes = Buffer.byteLength(result.stdout) + Buffer.byteLength(result.stderr)
      expect(previewBytes).toBeLessThanOrEqual(65_536)
      // Raw files hold the complete streams.
      expect((await readFile(result.stdoutPath)).length).toBe(100_000)
      expect((await readFile(result.stderrPath)).length).toBe(100_000)
      expect((await stat(result.stdoutPath)).mode & 0o777).toBe(0o600)
    } finally {
      process.env.XDG_CACHE_HOME = previous
      await rm(cacheDir, { recursive: true, force: true })
    }
  })

  test("small and empty output are still retained with real files", async () => {
    const result = await sh("printf 'out'; printf 'err' >&2")
    expect(result.stop).toBe("exited")
    expect(result.stdout).toBe("out")
    expect(result.stderr).toBe("err")
    expect(result.truncated).toEqual({ stdout: false, stderr: false })
    expect(result.stdoutBytes).toBe(3)
    expect(result.stderrBytes).toBe(3)
    if (!result.stdoutPath || !result.stderrPath) throw new Error("Missing raw stream paths")
    expect(await readFile(result.stdoutPath, "utf8")).toBe("out")
    expect(await readFile(result.stderrPath, "utf8")).toBe("err")

    const empty = await sh("true")
    expect(empty.stop).toBe("exited")
    expect(empty.stdout).toBe("")
    expect(empty.stderrBytes).toBe(0)
    if (!empty.stdoutPath || !empty.stderrPath) throw new Error("Missing empty stream paths")
    expect((await readFile(empty.stdoutPath)).length).toBe(0)
    expect((await readFile(empty.stderrPath)).length).toBe(0)
  })

  test("output volume never stops the command and a real capture failure is explicit", async () => {
    // A large writer exits 0 on its own; capture must not terminate it.
    const result = await sh("head -c 150000 /dev/zero | tr '\\0' 'c'", { wallTimeMs: 10_000 })
    expect(result.stop).toBe("exited")
    expect(result.exitCode).toBe(0)
    expect(result.stdoutBytes).toBe(150_000)
    if (!result.stdoutPath) throw new Error("Missing raw stdout path")
    expect((await readFile(result.stdoutPath)).length).toBe(150_000)

    // A non-existent cache root makes capture setup fail before launch.
    const previous = process.env.XDG_CACHE_HOME
    process.env.XDG_CACHE_HOME = "/proc/1/cannot-create-here"
    try {
      const failed = await sh("printf must-not-run")
      expect(failed.stop).toBe("capture_failed")
      expect(failed.stdoutPath).toBeNull()
      expect(failed.stderrPath).toBeNull()
      expect(failed.error).toContain("output cache")
    } finally {
      process.env.XDG_CACHE_HOME = previous
    }
  })
})
