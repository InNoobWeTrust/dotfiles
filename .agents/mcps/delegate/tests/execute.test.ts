import { afterAll, describe, expect, test } from "bun:test"
import { mkdtempSync } from "node:fs"
import { mkdtemp, readFile, realpath, rm, stat } from "node:fs/promises"
import { join } from "node:path"
import { firstLine, runProcess } from "../src/execute.ts"
import { OutputCapture } from "../src/output.ts"

const testCache = mkdtempSync(join(process.env.TMPDIR ?? "/tmp", "delegate-tests-"))
afterAll(() => rm(testCache, { recursive: true, force: true }))

const base = {
  cwd: process.cwd(),
  env: {
    PATH: process.env.PATH ?? "",
    HOME: process.env.HOME ?? "/tmp",
    XDG_CACHE_HOME: testCache,
  },
  wallTimeMs: 10_000,
  maxOutputBytes: 1_048_576,
}

const sh = (script: string, options: Partial<typeof base> = {}) =>
  runProcess("/bin/sh", ["-c", script], { ...base, ...options })

describe("runProcess", () => {
  test("cache retains multi-chunk raw bytes with bounded previews and private files", async () => {
    const capture = new OutputCapture({ XDG_CACHE_HOME: testCache }, 7)
    const stdout = Buffer.from(`${"architecture: 🌍\n".repeat(300_000)}FINAL`)
    const stderr = Buffer.from("FINAL-ERROR")
    for (let i = 0; i < stdout.length; i += 4096) {
      capture.append("stdout", stdout.subarray(i, i + 4096))
    }
    capture.append("stderr", stderr)
    capture.close()
    expect(await readFile(capture.stdoutPath)).toEqual(stdout)
    expect(await readFile(capture.stderrPath)).toEqual(stderr)
    expect(capture.bytes.stdout).toBe(stdout.length)
    expect(capture.bytes.stderr).toBe(stderr.length)
    expect(capture.preview("stdout").length + capture.preview("stderr").length).toBe(7)
    expect(capture.truncated).toBe(true)
    expect((await stat(capture.stdoutPath)).mode & 0o777).toBe(0o600)
    expect((await stat(capture.directory)).mode & 0o777).toBe(0o700)
    capture.discard()
  })

  test("captures both streams and the exact exit code", async () => {
    const result = await sh("printf 'out'; printf 'err' >&2; exit 3")
    expect(result.stop).toBe("exited")
    expect(result.exitCode).toBe(3)
    expect(result.signal).toBeNull()
    expect(result.stdout).toBe("out")
    expect(result.stderr).toBe("err")
    expect(result.truncated).toBe(false)
    expect(result.durationMs).toBeGreaterThanOrEqual(0)
    if (!result.stdoutPath || !result.stderrPath) throw new Error("Missing raw stream paths")
    expect(await readFile(result.stdoutPath, "utf8")).toBe("out")
    expect(await readFile(result.stderrPath, "utf8")).toBe("err")
  })

  test("cache always retains small and empty streams and bounds JSON escaping", async () => {
    const capture = new OutputCapture({ XDG_CACHE_HOME: testCache })
    const raw = Buffer.alloc(100_000)
    capture.append("stdout", raw)
    capture.close()
    expect(await readFile(capture.stdoutPath)).toEqual(raw)
    expect(await readFile(capture.stderrPath)).toEqual(Buffer.alloc(0))
    expect(
      Buffer.byteLength(JSON.stringify(capture.preview("stdout").toString("utf8"))) - 2,
    ).toBeLessThanOrEqual(65_536)
    expect(capture.truncated).toBe(true)
    capture.discard()
    const empty = new OutputCapture({ XDG_CACHE_HOME: testCache })
    empty.close()
    expect(await readFile(empty.stdoutPath)).toEqual(Buffer.alloc(0))
    expect(await readFile(empty.stderrPath)).toEqual(Buffer.alloc(0))
    empty.discard()
  })

  test("runs in the requested working directory", async () => {
    const result = await runProcess("/bin/sh", ["-c", "pwd -P"], { ...base, cwd: "/tmp" })
    expect(result.stdout.trim()).toBe(await realpath("/tmp"))
  })

  test("closes stdin, so a reader exits instead of waiting for a writer", async () => {
    // Mirrors the codex exec hang (openai/codex#20919): with an inherited open
    // pipe and no writer, `cat` would block until the wall-clock limit.
    const result = await sh("cat", { wallTimeMs: 5_000 })
    expect(result.stop).toBe("exited")
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("")
    if (!result.stdoutPath || !result.stderrPath) throw new Error("Missing empty stream paths")
    expect(await readFile(result.stdoutPath)).toEqual(Buffer.alloc(0))
    expect(await readFile(result.stderrPath)).toEqual(Buffer.alloc(0))
  })

  test("kills the process group at the wall-clock limit", async () => {
    const result = await sh("sleep 30", { wallTimeMs: 300 })
    expect(result.stop).toBe("wall_time")
    expect(result.durationMs).toBeLessThan(5_000)
  })

  test("escalates past a child that ignores SIGTERM", async () => {
    const result = await sh("trap '' TERM; sleep 30", { wallTimeMs: 200 })
    expect(result.stop).toBe("wall_time")
    expect(result.durationMs).toBeLessThan(8_000)
  })

  test("preserves oversized streams byte-for-byte and lets the worker finish", async () => {
    const cache = await mkdtemp(join(process.env.TMPDIR ?? "/tmp", "delegate-output-"))
    try {
      const result = await sh(
        "head -c 20000 /dev/zero; printf 'FINAL'; head -c 9000 /dev/zero >&2; printf 'ERROR-END' >&2",
        {
          maxOutputBytes: 4_096,
          env: { ...base.env, XDG_CACHE_HOME: cache },
        },
      )
      expect(result.stop).toBe("exited")
      expect(result.exitCode).toBe(0)
      expect(result.truncated).toBe(true)
      expect(
        Buffer.byteLength(result.stdout) + Buffer.byteLength(result.stderr),
      ).toBeLessThanOrEqual(4_096)
      expect(result.stdoutPath).toStartWith(join(cache, "delegate", "run-"))
      if (!result.stdoutPath || !result.stderrPath) throw new Error("Missing output cache paths")
      expect(await readFile(result.stdoutPath, "utf8")).toBe(`${"\0".repeat(20000)}FINAL`)
      expect(await readFile(result.stderrPath, "utf8")).toBe(`${"\0".repeat(9000)}ERROR-END`)
      expect(result.stdoutBytes).toBe(20005)
      expect(result.stderrBytes).toBe(9009)
      expect((await stat(result.stdoutPath)).mode & 0o777).toBe(0o600)
      expect((await stat(join(result.stdoutPath, ".."))).mode & 0o777).toBe(0o700)
    } finally {
      await rm(cache, { recursive: true, force: true })
    }
  })

  test("reports cache creation failure without launching a worker", async () => {
    const result = await sh("printf 'must not run'", {
      env: { ...base.env, XDG_CACHE_HOME: "/dev/null" },
    })
    expect(result.stop).toBe("capture_failed")
    expect(result.stdout).toBe("")
    expect(result.stdoutPath).toBeNull()
    expect(result.error).toContain("output cache")
  })

  test("cache is closed and reported when spawn throws synchronously", async () => {
    const result = await runProcess("/bin/sh", ["\0"], base)
    expect(result.stop).toBe("spawn_failed")
    expect(result.error).toBeDefined()
    if (!result.stdoutPath || !result.stderrPath) throw new Error("Missing failure artifacts")
    expect((await readFile(result.stdoutPath)).length).toBe(0)
    expect((await readFile(result.stderrPath)).length).toBe(0)
  })

  test("keeps raw bytes when small successful output is not lossless UTF-8", async () => {
    for (const bytes of ["\\342\\202", "\\200"]) {
      const result = await sh(`printf 'ok${bytes}'`)
      expect(result.stop).toBe("exited")
      expect(result.exitCode).toBe(0)
      expect(result.truncated).toBe(true)
      if (!result.stdoutPath) throw new Error("Missing raw output path")
      const raw = await readFile(result.stdoutPath)
      expect(raw.length).toBe(result.stdoutBytes)
      expect(raw.subarray(0, 2).toString()).toBe("ok")
      expect(Buffer.byteLength(result.stdout)).toBeLessThanOrEqual(raw.length)
    }
  })

  test("reports a launch failure instead of throwing", async () => {
    const result = await runProcess("/nonexistent/delegate-binary", [], base)
    expect(result.stop).toBe("spawn_failed")
    expect(result.exitCode).toBeNull()
    expect(result.error).toBeTruthy()
  })

  test("passes arguments literally without a shell", async () => {
    const result = await runProcess("/bin/sh", ["-c", 'printf "%s" "$1"', "sh", "; rm -rf /"], base)
    expect(result.stdout).toBe("; rm -rf /")
  })

  test("reaps a SIGTERM-ignoring descendant before the run resolves", async () => {
    // The parent exits 0 straight away, so the only teardown is the one this
    // module owns. The descendant ignores SIGTERM, so it survives the grace
    // period and is removed by the SIGKILL escalation. That has to have
    // happened by the time the promise resolves, not after it: a caller
    // releases the concurrency slot the moment the run is reported done.
    const result = await sh("trap '' TERM; sleep 30 >/dev/null 2>&1 & printf '%s' $!")
    const pid = Number(result.stdout)
    expect(result.exitCode).toBe(0)
    expect(result.stop).toBe("exited")
    expect(pid).toBeGreaterThan(0)
    // A killed-but-unreaped process still answers signal 0; only a live one
    // lets the call succeed.
    expect(() => process.kill(pid, 0)).toThrow()
    expect(result.error).toBeUndefined()
  })
})

describe("firstLine", () => {
  test("returns the first non-empty line, trimmed and bounded", () => {
    expect(firstLine("\n\n  2.1.91 (Claude Code)\nsecond")).toBe("2.1.91 (Claude Code)")
    expect(firstLine("   \n\t\n")).toBeNull()
    expect(firstLine("")).toBeNull()
    expect(firstLine("x".repeat(500))).toHaveLength(200)
  })
})
