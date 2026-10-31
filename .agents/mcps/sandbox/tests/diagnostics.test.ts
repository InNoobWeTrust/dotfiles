import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { preserveFailure } from "../src/execution/diagnostics.ts"

// Diagnostic persistence keeps original failures private and available after cleanup.
let scratch: string
let previousCacheHome: string | undefined
let cacheHome: string

beforeEach(async () => {
  previousCacheHome = process.env.XDG_CACHE_HOME
  scratch = await mkdtemp(path.join(tmpdir(), "sandbox-diagnostics-"))
  cacheHome = path.join(scratch, "cache")
  process.env.XDG_CACHE_HOME = cacheHome
})

afterEach(async () => {
  if (previousCacheHome === undefined) delete process.env.XDG_CACHE_HOME
  else process.env.XDG_CACHE_HOME = previousCacheHome
  await rm(scratch, { recursive: true, force: true })
})

async function persistedFailure(error: unknown) {
  const result = preserveFailure("diagnostics test", error)
  expect(result.tracePath).not.toBeNull()
  expect(result.traceError).toBeUndefined()
  if (!result.tracePath) throw new Error("Expected a persisted trace")
  const tracePath = result.tracePath
  const content = await readFile(tracePath, "utf8")
  return { result, tracePath, content }
}

describe("private failure diagnostics", () => {
  test("persists nested Error and AggregateError messages and stacks", async () => {
    const root = new Error("root-marker")
    const nested = new Error("nested-marker", { cause: root })
    const aggregate = new AggregateError([new Error("member-marker")], "aggregate-marker", {
      cause: nested,
    })
    const failure = new Error("outer-marker", { cause: aggregate })
    const { tracePath, content } = await persistedFailure(failure)
    expect(() => JSON.parse(content)).not.toThrow()
    for (const marker of [
      "root-marker",
      "nested-marker",
      "member-marker",
      "aggregate-marker",
      "outer-marker",
    ]) {
      expect(content).toContain(marker)
    }
    expect(failure.stack).toBeDefined()
    expect(content).toContain(JSON.stringify(failure.stack).slice(1, -1))
    expect((await stat(path.dirname(tracePath))).mode & 0o777).toBe(0o700)
    expect((await stat(tracePath)).mode & 0o777).toBe(0o600)
  })

  test("serializes circular causes safely", async () => {
    const first = new Error("cycle-first-marker")
    const second = new Error("cycle-second-marker")
    first.cause = second
    second.cause = first
    const { content } = await persistedFailure(first)
    expect(() => JSON.parse(content)).not.toThrow()
    expect(content).toContain("cycle-first-marker")
    expect(content).toContain("cycle-second-marker")
  })

  test("reports an unusable cache root without an invented trace path or raw error", async () => {
    const cacheFile = path.join(scratch, "cache-root-file")
    await writeFile(cacheFile, "not a directory", { mode: 0o600 })
    process.env.XDG_CACHE_HOME = cacheFile
    const marker = "private-cache-failure-marker"
    const result = preserveFailure("diagnostics test", new Error(marker))
    expect(result.tracePath).toBeNull()
    expect(result.traceError).toBeTruthy()
    expect(result.traceError).not.toContain(marker)
    expect(result.tracePath).not.toBe(cacheFile)
    expect(await stat(cacheFile).then((value) => value.isFile())).toBe(true)
  })
})
