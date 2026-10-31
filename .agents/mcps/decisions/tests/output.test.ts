import { afterAll, afterEach, beforeEach, describe, expect, test } from "bun:test"
import { mkdtempSync } from "node:fs"
import { readFile, rm, stat } from "node:fs/promises"
import { join } from "node:path"
import { INLINE_OUTPUT_BYTES, ResponseCapture, serializeAnonymousError } from "../src/evaluation/capture/response.ts"
import { evaluate, failure, MODEL } from "../src/evaluation/api.ts"
import type { ResponsePayload } from "../src/evaluation/schema.ts"

// NOTE: api.ts uses only `import type` from zod@4 and schema.ts — no runtime zod dependency.
// evaluate() accepts an injected validateResponse so tests supply a mock without needing zod.

const TMPDIR = process.env.TMPDIR ?? "/tmp"
const testCache = mkdtempSync(join(TMPDIR, "decisions-tests-"))
afterAll(() => rm(testCache, { recursive: true, force: true }))

const originalFetch = globalThis.fetch
const originalKey = process.env.OPENCODE_API_KEY
const originalCacheHome = process.env.XDG_CACHE_HOME

beforeEach(() => {
  process.env.XDG_CACHE_HOME = testCache
  process.env.OPENCODE_API_KEY = "test-key-safe"
})

afterEach(() => {
  globalThis.fetch = originalFetch
  if (originalKey !== undefined) process.env.OPENCODE_API_KEY = originalKey
  else delete process.env.OPENCODE_API_KEY
  if (originalCacheHome !== undefined) process.env.XDG_CACHE_HOME = originalCacheHome
  else delete process.env.XDG_CACHE_HOME
})

const validArgs = {
  state: "test decision context",
  questions: { q1: { type: "choice" as const, instructions: "pick one", criteria: { a: "Alpha", b: "Beta" } } },
  timeoutMs: 5000,
}

// Mock validator: parses JSON and returns as ResponsePayload (no zod needed in tests).
function mockValidate(rawText: string): ResponsePayload {
  return JSON.parse(rawText) as ResponsePayload
}

// Mock validator that always throws a ZodError-like error (to simulate schema mismatch).
function mockValidateZodFail(_rawText: string): ResponsePayload {
  // Do not rename the global Error constructor: other suites share this runtime.
  class ZodError extends Error {}
  const err = new ZodError("ZodError mock")
  throw err
}

function mockOkResponse(answers?: Record<string, unknown>) {
  const body = JSON.stringify({
    model: MODEL,
    answers: answers ?? { q1: { type: "choice", choice: "a", probabilities: { a: 0.9, b: 0.1 } } },
  })
  return new Response(body, { status: 200 })
}

// ── ResponseCapture ──────────────────────────────────────────────────────────

describe("ResponseCapture", () => {
  test("creates 0700 directory and 0600 response file", async () => {
    const capture = new ResponseCapture({ XDG_CACHE_HOME: testCache })
    expect((await stat(capture.directory)).mode & 0o777).toBe(0o700)
    expect((await stat(capture.responsePath)).mode & 0o777).toBe(0o600)
    capture.close()
  })

  test("write() and close() persist exact bytes to responsePath", async () => {
    const capture = new ResponseCapture({ XDG_CACHE_HOME: testCache })
    const data = Buffer.from('{"ok":true,"x":42}')
    capture.write(data)
    capture.close()
    expect(await readFile(capture.responsePath)).toEqual(data)
  })

  test("close() is idempotent", () => {
    const capture = new ResponseCapture({ XDG_CACHE_HOME: testCache })
    capture.close()
    expect(() => capture.close()).not.toThrow()
  })

  test("write() on a closed capture throws", () => {
    const capture = new ResponseCapture({ XDG_CACHE_HOME: testCache })
    capture.close()
    expect(() => capture.write(Buffer.from("x"))).toThrow()
  })

  test("serializeResult() writes 0600 JSON at resultPath", async () => {
    const capture = new ResponseCapture({ XDG_CACHE_HOME: testCache })
    capture.close()
    const payload = { model: MODEL, answers: { q1: { type: "choice", choice: "a" } } }
    const { resultPath } = capture.serializeResult(payload)
    expect(JSON.parse(await readFile(resultPath, "utf-8"))).toEqual(payload)
    expect((await stat(resultPath)).mode & 0o777).toBe(0o600)
  })

  test("serializeResult() second call on same directory throws (exclusive create)", () => {
    const capture = new ResponseCapture({ XDG_CACHE_HOME: testCache })
    capture.close()
    capture.serializeResult({ first: true })
    expect(() => capture.serializeResult({ second: true })).toThrow()
  })

  test("INLINE_OUTPUT_BYTES is 65536", () => {
    expect(INLINE_OUTPUT_BYTES).toBe(65536)
  })
})

// ── serializeAnonymousError ──────────────────────────────────────────────────

describe("serializeAnonymousError", () => {
  test("writes a 0600 result file and returns its path", async () => {
    const payload = { ok: false, error: { code: "BUSY", message: "busy" } }
    const resultPath = serializeAnonymousError({ XDG_CACHE_HOME: testCache }, payload)
    expect(resultPath).toBeString()
    expect(JSON.parse(await readFile(resultPath!, "utf-8"))).toEqual(payload)
    expect((await stat(resultPath!)).mode & 0o777).toBe(0o600)
  })

  test("returns null when cache dir is unwritable", () => {
    expect(serializeAnonymousError({ XDG_CACHE_HOME: "/proc/no-such-path" }, { x: 1 })).toBeNull()
  })
})

// ── evaluate() — inline size and path ordering ───────────────────────────────

describe("evaluate() — inline size and path ordering", () => {
  test("success small: paths before answers, truncated=false, whole envelope within 64 KiB", async () => {
    globalThis.fetch = async () => mockOkResponse()
    const r = await evaluate(validArgs, new AbortController().signal, mockValidate)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.truncated).toBe(false)
    expect(r.responsePath).toBeString()
    expect(r.resultPath).toBeString()
    const keys = Object.keys(r)
    expect(keys.indexOf("responsePath")).toBeLessThan(keys.indexOf("answers"))
    expect(Buffer.from(JSON.stringify(r)).byteLength).toBeLessThanOrEqual(INLINE_OUTPUT_BYTES)
    const disk = JSON.parse(await readFile(r.resultPath!, "utf-8"))
    expect(disk.model).toBe(MODEL)
    expect(disk.answers.q1.choice).toBe("a")
  })

  test("success oversized: full envelope exceeds 64 KiB → metadata-only inline, full answers on disk", async () => {
    const bigProbs: Record<string, number> = {}
    for (let i = 0; i < 700; i++) bigProbs[`opt_${"x".repeat(88)}_${String(i).padStart(3, "0")}`] = 1 / 700
    globalThis.fetch = async () => mockOkResponse({ q1: { type: "choice", choice: "a", probabilities: bigProbs } })
    const r = await evaluate(validArgs, new AbortController().signal, mockValidate)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.truncated).toBe(true)
    expect("answers" in r).toBe(false)
    expect(r.responsePath).toBeString()
    expect(r.resultPath).toBeString()
    const disk = JSON.parse(await readFile(r.resultPath!, "utf-8"))
    expect(disk.answers.q1.choice).toBe("a")
    expect(Object.keys(disk.answers.q1.probabilities)).toHaveLength(700)
  })
})

// ── evaluate() — error persistence: resultPath and responsePath set ───────────

describe("evaluate() — error persistence", () => {
  test("HTTP error: responsePath has body, resultPath has sanitized error, body not echoed in message", async () => {
    const errBody = '{"error":"quota_exceeded"}'
    globalThis.fetch = async () => new Response(errBody, { status: 429 })
    try {
      await evaluate(validArgs, new AbortController().signal, mockValidate)
      expect(false).toBe(true)
    } catch (err: unknown) {
      const e = failure(err)
      expect(e.ok).toBe(false)
      expect(e.error.code).toBe("HTTP_ERROR")
      expect(e.error.status).toBe(429)
      expect(e.error.message).not.toContain("quota_exceeded")
      expect(e.responsePath).toBeString()
      expect(e.resultPath).toBeString()
      expect(await readFile(e.responsePath!, "utf-8")).toBe(errBody)
      const disk = JSON.parse(await readFile(e.resultPath!, "utf-8"))
      expect(disk.ok).toBe(false)
      expect(disk.error.code).toBe("HTTP_ERROR")
    }
  })

  test("invalid JSON: INVALID_RESPONSE, raw body at responsePath, sanitized error at resultPath", async () => {
    const garbage = "not-valid-json-garbage"
    globalThis.fetch = async () => new Response(garbage, { status: 200 })
    try {
      await evaluate(validArgs, new AbortController().signal, mockValidate)
      expect(false).toBe(true)
    } catch (err: unknown) {
      const e = failure(err)
      expect(e.ok).toBe(false)
      expect(e.error.code).toBe("INVALID_RESPONSE")
      expect(e.responsePath).toBeString()
      expect(e.resultPath).toBeString()
      expect(await readFile(e.responsePath!, "utf-8")).toBe(garbage)
      const disk = JSON.parse(await readFile(e.resultPath!, "utf-8"))
      expect(disk.error.code).toBe("INVALID_RESPONSE")
    }
  })

  test("schema mismatch (mocked ZodError): INVALID_PAYLOAD, responsePath set, resultPath set", async () => {
    globalThis.fetch = async () => new Response('{"model":"x","answers":{}}', { status: 200 })
    try {
      await evaluate(validArgs, new AbortController().signal, mockValidateZodFail)
      expect(false).toBe(true)
    } catch (err: unknown) {
      const e = failure(err)
      expect(e.ok).toBe(false)
      expect(e.error.code).toBe("INVALID_PAYLOAD")
      expect(e.responsePath).toBeString()
      expect(e.resultPath).toBeString()
      const disk = JSON.parse(await readFile(e.resultPath!, "utf-8"))
      expect(disk.error.code).toBe("INVALID_PAYLOAD")
    }
  })

  test("AUTH_UNAVAILABLE: responsePath set (empty capture file), resultPath has sanitized error", async () => {
    delete process.env.OPENCODE_API_KEY
    try {
      await evaluate(validArgs, new AbortController().signal, mockValidate)
      expect(false).toBe(true)
    } catch (err: unknown) {
      const e = failure(err)
      expect(e.ok).toBe(false)
      expect(e.error.code).toBe("AUTH_UNAVAILABLE")
      expect(e.responsePath).toBeString()
      expect(e.resultPath).toBeString()
      const disk = JSON.parse(await readFile(e.resultPath!, "utf-8"))
      expect(disk.error.code).toBe("AUTH_UNAVAILABLE")
    }
  })

  test("timeout: CANCELLED_OR_TIMED_OUT, responsePath set, resultPath has sanitized error", async () => {
    globalThis.fetch = (_: unknown, opts: RequestInit) => {
      const sig = opts.signal as AbortSignal
      return new Promise<Response>((_, reject) => {
        if (sig.aborted) { reject(sig.reason); return }
        sig.addEventListener("abort", () => reject(sig.reason), { once: true })
      })
    }
    try {
      // 1000 ms is the schema minimum; the mock never resolves so the timeout fires.
      await evaluate({ ...validArgs, timeoutMs: 1000 }, new AbortController().signal, mockValidate)
      expect(false).toBe(true)
    } catch (err: unknown) {
      const e = failure(err)
      expect(e.ok).toBe(false)
      expect(e.error.code).toBe("CANCELLED_OR_TIMED_OUT")
      expect(e.responsePath).toBeString()
      expect(e.resultPath).toBeString()
      const disk = JSON.parse(await readFile(e.resultPath!, "utf-8"))
      expect(disk.error.code).toBe("CANCELLED_OR_TIMED_OUT")
    }
  })

  test("OUTPUT_CAPTURE_FAILED on creation: both paths null", async () => {
    process.env.XDG_CACHE_HOME = "/proc/no-such-path-test"
    try {
      await evaluate(validArgs, new AbortController().signal, mockValidate)
      expect(false).toBe(true)
    } catch (err: unknown) {
      const e = failure(err)
      expect(e.ok).toBe(false)
      expect(e.error.code).toBe("OUTPUT_CAPTURE_FAILED")
      expect(e.responsePath).toBeNull()
      expect(e.resultPath).toBeNull()
    }
  })
})

// ── evaluate() — capture write/flush failures → OUTPUT_CAPTURE_FAILED ────────

describe("evaluate() — capture write failures → OUTPUT_CAPTURE_FAILED", () => {
  test("write() on a closed fd throws (simulates disk-full mid-stream)", () => {
    const capture = new ResponseCapture({ XDG_CACHE_HOME: testCache })
    capture.close()
    // writing to a closed fd: the system error should surface, not be swallowed
    let threw = false
    try { capture.write(Buffer.from("x")) } catch { threw = true }
    expect(threw).toBe(true)
  })
})

// ── read vs write error classification (defect regression) ───────────────────

describe("evaluate() — read vs write error classification", () => {
  test("reader.read() TypeError mid-body → CONNECTION_FAILED not OUTPUT_CAPTURE_FAILED; partial body at responsePath; error at resultPath", async () => {
    // Mock a body that delivers one chunk then signals a network-layer read error.
    // This exercises the path where reader.read() throws vs capture.write() throws.
    let pulls = 0
    globalThis.fetch = async () => {
      const body = new ReadableStream<Uint8Array>({
        pull(controller) {
          if (pulls === 0) {
            controller.enqueue(new TextEncoder().encode('{"partial":'))
            pulls++
          } else {
            controller.error(new TypeError("network read interrupted"))
          }
        },
      })
      return new Response(body, { status: 200 })
    }
    try {
      await evaluate(validArgs, new AbortController().signal, mockValidate)
      expect(false).toBe(true)
    } catch (err: unknown) {
      const e = failure(err)
      expect(e.ok).toBe(false)
      // Network read error must NOT be mislabeled as OUTPUT_CAPTURE_FAILED
      expect(e.error.code).toBe("CONNECTION_FAILED")
      // Partial body IS retained (one chunk was written before the error)
      expect(e.responsePath).toBeString()
      expect(await readFile(e.responsePath!, "utf-8")).toBe('{"partial":')
      // Sanitized error envelope IS persisted at resultPath
      expect(e.resultPath).toBeString()
      const disk = JSON.parse(await readFile(e.resultPath!, "utf-8"))
      expect(disk.error.code).toBe("CONNECTION_FAILED")
    }
  })

  test("mid-body timeout: partial chunk retained in responsePath, CANCELLED_OR_TIMED_OUT, error at resultPath", async () => {
    // Deliver one chunk then let the timeout fire — the stream errors with the signal reason.
    globalThis.fetch = async (_u: unknown, opts: RequestInit) => {
      const sig = opts.signal as AbortSignal
      let pulls = 0
      const body = new ReadableStream<Uint8Array>({
        pull(controller) {
          if (pulls === 0) {
            controller.enqueue(new TextEncoder().encode('{"timeout_partial":'))
            pulls++
            // When the composite signal (timeout) fires, error the stream with its reason.
            sig.addEventListener("abort", () => controller.error(sig.reason), { once: true })
          }
          // Further reads block here until the abort fires.
        },
      })
      return new Response(body, { status: 200 })
    }
    try {
      await evaluate({ ...validArgs, timeoutMs: 1000 }, new AbortController().signal, mockValidate)
      expect(false).toBe(true)
    } catch (err: unknown) {
      const e = failure(err)
      expect(e.ok).toBe(false)
      expect(e.error.code).toBe("CANCELLED_OR_TIMED_OUT")
      // Partial body retained (close() succeeded on partial data)
      expect(e.responsePath).toBeString()
      expect(await readFile(e.responsePath!, "utf-8")).toBe('{"timeout_partial":')
      // Error envelope persisted at resultPath
      expect(e.resultPath).toBeString()
      const disk = JSON.parse(await readFile(e.resultPath!, "utf-8"))
      expect(disk.error.code).toBe("CANCELLED_OR_TIMED_OUT")
    }
  })

  test("serializeResult() EEXIST throws explicitly — mechanism ensuring error-path serialisation failure surfaces OUTPUT_CAPTURE_FAILED", () => {
    // In evaluate()'s outer catch, capture.serializeResult(errorPayload) can get EEXIST
    // when result.json already exists (e.g. partial write from a prior attempt). That throw
    // is escalated to OUTPUT_CAPTURE_FAILED rather than silently nulled. Verify the mechanism:
    const capture = new ResponseCapture({ XDG_CACHE_HOME: testCache })
    capture.close()
    capture.serializeResult({ first: true })
    let code: string | undefined
    try { capture.serializeResult({ second: true }) } catch (e: unknown) {
      code = (e as { code?: string })?.code
    }
    expect(code).toBe("EEXIST")
  })
})
