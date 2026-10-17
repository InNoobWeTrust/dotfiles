import { afterEach, expect, test } from "bun:test"
import { discoverProviders } from "../src/availability.ts"
import { MODEL, FALLBACK_MODEL } from "../src/providers.ts"
import type { DecisionModel, ResponsePayload } from "../src/schema.ts"

const originalFetch = globalThis.fetch
afterEach(() => { globalThis.fetch = originalFetch })
const zenEnv = { OPENCODE_API_KEY: "fake-zen-key" }
const bothEnv = { ...zenEnv, CLOUDFLARE_ACCOUNT_ID: "0123456789abcdef0123456789abcdef", CLOUDFLARE_API_TOKEN: "fake-cf-token" }
// Unit coverage for discovery's own safety boundaries. Actual Zod parsing and
// Cloudflare envelope validation run in the real-launcher E2E tests.
const validate = (text: string, model?: DecisionModel): ResponsePayload => {
  const parsed = JSON.parse(text)
  return model === FALLBACK_MODEL ? parsed.result : parsed
}
function success(model: DecisionModel) {
  const result: ResponsePayload = { model, answers: { q0: { type: "choice", choice: "a", probabilities: { a: 0.5, b: 0.5 } } } }
  return new Response(JSON.stringify(model === FALLBACK_MODEL ? { success: true, result } : result))
}
test("missing or invalid configuration sends no requests and cannot enable evaluate", async () => {
  let calls = 0
  globalThis.fetch = async () => { calls++; throw new Error("No HTTP permitted") }
  const missing = await discoverProviders(validate, {})
  expect(missing.evaluateAvailable).toBe(false)
  expect(missing.providers.zen.status).toBe("unconfigured")
  expect(missing.providers.cloudflare.status).toBe("unconfigured")
  const invalid = await discoverProviders(validate, { CLOUDFLARE_ACCOUNT_ID: "invalid", CLOUDFLARE_API_TOKEN: "fake-token" })
  expect(invalid.providers.cloudflare.status).toBe("configuration_invalid")
  expect(invalid.evaluateAvailable).toBe(false)
  expect(calls).toBe(0)
})
for (const [zenStatus, cfStatus, enabled, classification] of [
  [200, 200, true, "available"], [429, 200, true, "rate_limited"],
  [401, 200, false, "unauthorized"], [403, 200, false, "unauthorized"],
  [500, 200, false, "http_error"], [429, 401, false, "rate_limited"],
] as const) {
  test(`discovery gate: Zen ${zenStatus}, CF ${cfStatus}`, async () => {
    let calls = 0
    globalThis.fetch = async (url, init) => {
      calls++
      const zen = String(url).includes("opencode.ai")
      const status = zen ? zenStatus : cfStatus
      expect(init?.method).toBe("POST")
      expect(init?.redirect).toBe("error")
      expect(new Headers(init?.headers).get("authorization")).toBe(zen ? "Bearer fake-zen-key" : "Bearer fake-cf-token")
      const body = JSON.parse(init!.body as string)
      expect(body.state).toBe("Public startup availability probe. No user data.")
      expect(Object.keys(body.questions)).toEqual(["q0"])
      expect(Object.keys(body.questions.q0.criteria)).toEqual(["a", "b"])
      return status === 200 ? success(zen ? MODEL : FALLBACK_MODEL) : new Response("private error body", { status })
    }
    const result = await discoverProviders(validate, bothEnv)
    expect(result.evaluateAvailable).toBe(enabled)
    expect(result.providers.zen.status).toBe(classification)
    expect(result.providers.zen.httpStatus).toBe(zenStatus)
    expect(calls).toBe(2)
    expect(JSON.stringify(result)).not.toContain("private error body")
  })
}
test("Cloudflare alone is not an authentication fallback", async () => {
  let calls = 0
  globalThis.fetch = async () => { calls++; return success(FALLBACK_MODEL) }
  const result = await discoverProviders(validate, { CLOUDFLARE_ACCOUNT_ID: bothEnv.CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN: "fake-cf-token" })
  expect(result.providers.cloudflare.available).toBe(true)
  expect(result.evaluateAvailable).toBe(false)
  expect(calls).toBe(1)
})
for (const payload of [
  { model: MODEL, answers: {} },
  { model: MODEL, answers: { q0: { type: "choice", choice: "c" } } },
  { model: "wrong", answers: { q0: { type: "choice", choice: "a" } } },
  { model: MODEL, answers: { q0: { type: "choice", choice: "a" }, extra: {} } },
]) {
  test(`invalid probe contract fails closed: ${JSON.stringify(payload)}`, async () => {
    globalThis.fetch = async () => new Response(JSON.stringify(payload))
    const result = await discoverProviders(validate, zenEnv)
    expect(result.providers.zen.status).toBe("invalid_response")
    expect(result.evaluateAvailable).toBe(false)
  })
}
test("validator exceptions and oversized replies fail closed", async () => {
  globalThis.fetch = async () => success(MODEL)
  const rejected = await discoverProviders(() => { throw new Error("schema mismatch") }, zenEnv)
  expect(rejected.providers.zen.status).toBe("invalid_response")
  let validated = false
  let cancelled = false
  globalThis.fetch = async () => new Response(new ReadableStream({
    start(controller) { controller.enqueue(new Uint8Array(16385)) },
    cancel() { cancelled = true },
  }))
  const oversized = await discoverProviders((text, model) => { validated = true; return validate(text, model) }, zenEnv)
  expect(oversized.providers.zen.status).toBe("invalid_response")
  expect(oversized.evaluateAvailable).toBe(false)
  expect(validated).toBe(false)
  expect(cancelled).toBe(true)
})
test("network failure is sanitized and never enables evaluate", async () => {
  globalThis.fetch = async () => { throw new Error("private network detail") }
  const result = await discoverProviders(validate, zenEnv)
  expect(result.providers.zen.status).toBe("unreachable")
  expect(result.evaluateAvailable).toBe(false)
  expect(JSON.stringify(result)).not.toContain("private network detail")
})
test("two stalled probes run concurrently and abort at the four-second bound", async () => {
  let calls = 0
  globalThis.fetch = async (_url, init) => {
    calls++
    return new Promise<Response>((_resolve, reject) => {
      const signal = init!.signal!
      if (signal.aborted) reject(signal.reason)
      else signal.addEventListener("abort", () => reject(signal.reason), { once: true })
    })
  }
  const start = performance.now()
  const result = await discoverProviders(validate, bothEnv)
  expect(calls).toBe(2)
  expect(performance.now() - start).toBeGreaterThanOrEqual(3900)
  expect(performance.now() - start).toBeLessThan(5500)
  expect(result.providers.zen.status).toBe("unreachable")
  expect(result.providers.cloudflare.status).toBe("unreachable")
  expect(result.evaluateAvailable).toBe(false)
}, 6000)
test("caller abort terminates both probes without retry", async () => {
  const controller = new AbortController()
  let calls = 0
  globalThis.fetch = async (_url, init) => {
    calls++
    init!.signal!.throwIfAborted()
    throw new Error("Expected already-aborted signal")
  }
  controller.abort()
  const result = await discoverProviders(validate, bothEnv, controller.signal)
  expect(calls).toBe(2)
  expect(result.providers.zen.status).toBe("unreachable")
  expect(result.providers.cloudflare.status).toBe("unreachable")
})
test("Cloudflare 429 cooldown skips later probes on that account", async () => {
  const env = { ...bothEnv, CLOUDFLARE_ACCOUNT_ID: "abcdefabcdefabcdefabcdefabcdefab" }
  let calls = 0
  globalThis.fetch = async url => {
    calls++
    return String(url).includes("opencode.ai") ? success(MODEL) : new Response("", { status: 429, headers: { "retry-after": "60" } })
  }
  const first = await discoverProviders(validate, env)
  expect(first.providers.cloudflare.status).toBe("rate_limited")
  expect(calls).toBe(2)
  const second = await discoverProviders(validate, env)
  expect(calls).toBe(3)
  expect(second.providers.cloudflare.status).toBe("rate_limited")
  expect(Date.parse(second.providers.cloudflare.retryAt!)).toBeGreaterThan(Date.now())
})
