import { describe, expect, test } from "bun:test"
import { realpath } from "node:fs/promises"
import { firstLine, runProcess } from "../src/execute.ts"

const base = {
  cwd: process.cwd(),
  env: { PATH: process.env.PATH ?? "", HOME: process.env.HOME ?? "/tmp" },
  wallTimeMs: 10_000,
  maxOutputBytes: 1_048_576,
}

const sh = (script: string, options: Partial<typeof base> = {}) =>
  runProcess("/bin/sh", ["-c", script], { ...base, ...options })

describe("runProcess", () => {
  test("captures both streams and the exact exit code", async () => {
    const result = await sh("printf 'out'; printf 'err' >&2; exit 3")
    expect(result.stop).toBe("exited")
    expect(result.exitCode).toBe(3)
    expect(result.signal).toBeNull()
    expect(result.stdout).toBe("out")
    expect(result.stderr).toBe("err")
    expect(result.truncated).toBe(false)
    expect(result.durationMs).toBeGreaterThanOrEqual(0)
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

  test("truncates at the output budget and kills the run", async () => {
    const result = await sh("yes delegate", { maxOutputBytes: 4_096 })
    expect(result.stop).toBe("output_limit")
    expect(result.truncated).toBe(true)
    expect(Buffer.byteLength(result.stdout)).toBeLessThanOrEqual(4_096)
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
