import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs"
import { join } from "node:path"
import { evaluate, failure, getCloudflareCooldown } from "../src/api.ts"
import { ENDPOINT, FALLBACK_MODEL, MODEL } from "../src/providers.ts"
import type { DecisionModel, EvaluateArgs, ResponsePayload } from "../src/schema.ts"

const envNames = ["OPENCODE_API_KEY", "CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_API_TOKEN", "XDG_CACHE_HOME"] as const
const originalFetch = globalThis.fetch
let savedEnv: (string | undefined)[]
let cache: string
let accountSequence = 0
let calls: { url: string; init: RequestInit }[]
type Reply = Response | Error | ((init: RequestInit) => Promise<Response>)
let replies: Reply[]
let unexpectedRequests: number

function freshAccount() {
  return (++accountSequence).toString(16).padStart(32, "0")
}

beforeEach(() => {
  savedEnv = envNames.map(name => process.env[name])
  cache = mkdtempSync(join(process.env.TMPDIR ?? "/tmp/opencode", "decisions-fallback-"))
  process.env.XDG_CACHE_HOME = cache
  process.env.OPENCODE_API_KEY = "fake-zen-key"
  process.env.CLOUDFLARE_ACCOUNT_ID = freshAccount()
  process.env.CLOUDFLARE_API_TOKEN = "fake-cf-token"
  calls = []
  replies = []
  unexpectedRequests = 0
  // Never delegate to the original fetch, even for unexpected URLs or extra attempts.
  globalThis.fetch = (async (url: string | URL | Request, init: RequestInit = {}) => {
    calls.push({ url: String(url), init })
    const reply = replies.shift()
    if (!reply) {
      unexpectedRequests++
      throw new Error("Unexpected mocked request; real network is forbidden")
    }
    if (reply instanceof Error) throw reply
    return typeof reply === "function" ? reply(init) : reply
  }) as typeof fetch
})

afterEach(() => {
  globalThis.fetch = originalFetch
  envNames.forEach((name, index) => {
    if (savedEnv[index] === undefined) delete process.env[name]
    else process.env[name] = savedEnv[index]
  })
  rmSync(cache, { recursive: true, force: true })
  expect(unexpectedRequests).toBe(0)
  expect(replies).toHaveLength(0)
})

const args: EvaluateArgs = {
  state: "Choose safely",
  questions: { "public choice / α": { type: "choice", instructions: "Pick", criteria: { a: null, b: "Beta" } } },
  timeoutMs: 1000,
}
const choice = { type: "choice" as const, choice: "a", probabilities: { a: 0.75, b: 0.25 } }
const primary429 = () => new Response("private-primary-quota", { status: 429 })
const cf = (answers: Record<string, unknown> = { q0: choice }, model: DecisionModel = FALLBACK_MODEL) =>
  new Response(JSON.stringify({ success: true, result: { model, answers } }))

// Mirror the CF envelope boundary without importing runtime zod or resolving packages.
function validate(raw: string, expectedModel: DecisionModel = MODEL): ResponsePayload {
  const parsed = JSON.parse(raw)
  if (expectedModel === FALLBACK_MODEL) {
    if (parsed.success !== true || !parsed.result) throw new Error("Invalid CF envelope")
    return parsed.result
  }
  return parsed
}

async function run(input = args, signal = new AbortController().signal) {
  const result = await evaluate(input, signal, validate)
  if (result.truncated) throw new Error("Small test fixture unexpectedly truncated")
  return result
}

async function failed(input = args, signal = new AbortController().signal) {
  try {
    await run(input, signal)
  } catch (error) {
    return failure(error)
  }
  throw new Error("Expected evaluation to fail")
}

describe("429-only Clef fallback security and state", () => {
  test("one fixed CF request isolates keys, disallows redirects, shares signal and retains both raw captures", async () => {
    replies.push(primary429(), cf())
    const result = await run()
    expect(result.ok).toBe(true)
    expect(calls).toHaveLength(2)
    expect(calls[0].url).toBe(ENDPOINT)
    expect(calls[1].url).toBe(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/cloudflare/clef-flash`)
    expect(new Headers(calls[0].init.headers).get("authorization")).toBe("Bearer fake-zen-key")
    expect(new Headers(calls[1].init.headers).get("authorization")).toBe("Bearer fake-cf-token")
    for (const call of calls) {
      expect(call.init.redirect).toBe("error")
      expect(call.init.method).toBe("POST")
      expect(new Headers(call.init.headers).get("content-type")).toBe("application/json")
    }
    expect(calls[0].init.signal).toBe(calls[1].init.signal)
    expect(JSON.stringify(calls[0].init)).not.toContain("fake-cf-token")
    expect(JSON.stringify(calls[1].init)).not.toContain("fake-zen-key")
    expect(result.model).toBe(FALLBACK_MODEL)
    expect(result.answers).toEqual({ "public choice / α": choice })
    const raw = readFileSync(result.responsePath!, "utf8")
    expect(JSON.parse(raw).result.model).toBe(FALLBACK_MODEL)
    expect(JSON.parse(readFileSync(result.resultPath!, "utf8")).answers).toEqual(result.answers)
    // Discover capture filenames through the returned path, not a private naming assumption.
    const filename = result.responsePath!.split("/").at(-1)!
    const bodies = readdirSync(cache, { recursive: true }).filter(path => String(path).endsWith(filename))
      .map(path => readFileSync(join(cache, String(path)), "utf8"))
    expect(bodies).toHaveLength(2)
    expect(bodies).toContain("private-primary-quota")
    expect(bodies).toContain(raw)
  })

  test("native choice, noul and fractional score fixtures restore arbitrary public IDs", async () => {
    const input: EvaluateArgs = { ...args, questions: {
      "choice with spaces": args.questions["public choice / α"],
      "__proto__?": { type: "boolean", instructions: "Likely?", criteria: { true: null, false: "No" } },
      "score/非ASCII": { type: "score", instructions: "Rate", criteria: [null, "Middle", "High"] },
    } }
    const score = { type: "score", score: 1.5, probabilities: { "0": 0.1, "1": 0.3, "2": 0.6 } }
    replies.push(primary429(), cf({ q0: choice, q1: { type: "noul", noul: 0.7 }, q2: score }))
    const result = await run(input)
    expect(result.answers).toEqual({ "choice with spaces": choice, "__proto__?": { type: "boolean", probability: 0.7 }, "score/非ASCII": score })
    const sent = JSON.parse(String(calls[1].init.body))
    expect(Object.keys(sent.questions)).toEqual(["q0", "q1", "q2"])
    expect(sent.questions.q1.type).toBe("noul")
    expect(sent.model).toBe(FALLBACK_MODEL)
  })

  test("normal Zen success and every representative non-429 failure never contact CF", async () => {
    replies.push(new Response(JSON.stringify({ model: MODEL, answers: { "public choice / α": choice } })))
    expect((await run()).model).toBe(MODEL)
    for (const status of [400, 401, 403, 500, 503]) {
      replies.push(new Response("private-primary-error", { status }))
      const result = await failed()
      expect(result.error.code).toBe("HTTP_ERROR")
      expect(result.error.status).toBe(status)
    }
    replies.push(new TypeError("private transport detail"))
    expect((await failed()).error.code).toBe("CONNECTION_FAILED")
    expect(calls).toHaveLength(7)
    expect(calls.every(call => call.url === ENDPOINT)).toBe(true)
  })

  test("missing or malformed CF configuration preserves original 429 and private raw body", async () => {
    for (const [account, token] of [[undefined, "fake"], ["a".repeat(32), undefined], ["a".repeat(31), "fake"], ["g".repeat(32), "fake"], ["../attacker", "fake"], ["a".repeat(32), ""]]) {
      if (account === undefined) delete process.env.CLOUDFLARE_ACCOUNT_ID
      else process.env.CLOUDFLARE_ACCOUNT_ID = account
      if (token === undefined) delete process.env.CLOUDFLARE_API_TOKEN
      else process.env.CLOUDFLARE_API_TOKEN = token
      replies.push(primary429())
      const result = await failed()
      expect(result.error.status).toBe(429)
      expect(result.error.code).toBe("HTTP_ERROR")
      expect(readFileSync(result.responsePath!, "utf8")).toBe("private-primary-quota")
    }
    expect(calls).toHaveLength(6)
  })

  test("UTF-8 body over 20000 bytes and single-option choices skip fallback without truncation", async () => {
    const large = { ...args, state: "界".repeat(7000) }
    expect(large.state.length).toBeLessThan(20000)
    expect(Buffer.byteLength(large.state)).toBeGreaterThan(20000)
    const single: EvaluateArgs = { ...args, questions: { only: { type: "choice", instructions: "Pick", criteria: { a: null } } } }
    for (const input of [large, single]) {
      replies.push(primary429())
      expect((await failed(input)).error.status).toBe(429)
    }
    expect(calls).toHaveLength(2)
    expect(JSON.parse(String(calls[0].init.body)).state).toBe(large.state)
  })

  test("CF 429 numeric/date/default Retry-After persists account cooldown without erasing other accounts", async () => {
    const accounts: string[] = []
    for (const header of ["120", new Date(Date.now() + 180000).toUTCString(), null, "invalid"]) {
      const account = freshAccount()
      accounts.push(account)
      process.env.CLOUDFLARE_ACCOUNT_ID = account
      const start = Date.now()
      replies.push(primary429(), new Response("private-cf-quota", { status: 429, headers: header === null ? {} : { "retry-after": header } }))
      const result = await failed()
      expect(result.error.status).toBe(429)
      expect(result.error.message).toContain("Cloudflare")
      const cooldown = getCloudflareCooldown(account)!
      const target = header === "120" ? start + 120000 : header && header !== "invalid" ? Date.parse(header) : start + 60000
      expect(cooldown).toBeGreaterThanOrEqual(target)
      expect(cooldown).toBeLessThanOrEqual(target + 1000)
      replies.push(primary429())
      const skipped = await failed()
      expect(skipped.error.message).toContain("Zen")
      expect(readFileSync(skipped.responsePath!, "utf8")).toBe("private-primary-quota")
      for (const old of accounts) expect(getCloudflareCooldown(old)).toBeGreaterThan(Date.now())
    }
    expect(calls).toHaveLength(12)
  })

  test("CF HTTP errors are final, sanitized and retain CF raw response rather than primary raw", async () => {
    for (const status of [401, 403, 500]) {
      replies.push(primary429(), new Response("private-cf-body fake-cf-token", { status }))
      const result = await failed()
      expect(result.error.code).toBe("HTTP_ERROR")
      expect(result.error.status).toBe(status)
      expect(JSON.stringify(result)).not.toContain("private-cf-body")
      expect(JSON.stringify(result)).not.toContain("fake-cf-token")
      expect(readFileSync(result.responsePath!, "utf8")).toBe("private-cf-body fake-cf-token")
      expect(JSON.parse(readFileSync(result.resultPath!, "utf8")).error.code).toBe("HTTP_ERROR")
    }
    expect(calls).toHaveLength(6)
  })

  test("CF connection, malformed JSON and unsuccessful envelope failures do not retry", async () => {
    for (const [reply, code] of [[new TypeError("fake-cf-token private detail"), "CONNECTION_FAILED"], [new Response("private malformed"), "INVALID_RESPONSE"], [new Response('{"success":false,"errors":["private"]}'), "INVALID_RESPONSE"]] as const) {
      replies.push(primary429(), reply)
      const result = await failed()
      expect(result.error.code).toBe(code)
      expect(JSON.stringify(result.error)).not.toContain("private")
      expect(JSON.stringify(result.error)).not.toContain("fake-cf-token")
    }
    expect(calls).toHaveLength(6)
  })

  test("selected model, remapped question set, choice labels and score range are enforced", async () => {
    const invalid = [cf({ q0: choice }, MODEL), cf({ wrong: choice }), cf({ q0: choice, q1: choice }), cf({ q0: { ...choice, choice: "injected" } })]
    for (const reply of invalid) {
      replies.push(primary429(), reply)
      expect((await failed()).error.code).toBe("INVALID_RESPONSE")
    }
    const scoreArgs: EvaluateArgs = { ...args, questions: { rating: { type: "score", instructions: "Rate", criteria: [null, null] } } }
    replies.push(primary429(), cf({ q0: { type: "score", score: 2, probabilities: {} } }))
    expect((await failed(scoreArgs)).error.code).toBe("INVALID_RESPONSE")
    expect(calls).toHaveLength(10)
  })

  test("CF schema rejection is explicit INVALID_PAYLOAD with sanitized persisted error", async () => {
    class ZodError extends Error {}
    replies.push(primary429(), cf())
    let caught: unknown
    try {
      await evaluate(args, new AbortController().signal, (raw, expectedModel) => {
        expect(expectedModel).toBe(FALLBACK_MODEL)
        expect(JSON.parse(raw).success).toBe(true)
        throw new ZodError("private-schema-detail fake-cf-token")
      })
    } catch (error) {
      caught = error
    }
    expect(caught).toBeInstanceOf(Error)
    const result = failure(caught)
    expect(result.error.code).toBe("INVALID_PAYLOAD")
    expect(JSON.stringify(result)).not.toContain("private-schema-detail")
    expect(JSON.stringify(result)).not.toContain("fake-cf-token")
    expect(JSON.parse(readFileSync(result.resultPath!, "utf8")).error.code).toBe("INVALID_PAYLOAD")
    expect(calls).toHaveLength(2)
  })

  test("fallback uses remaining shared deadline rather than starting another timeout", async () => {
    let fallbackStarted = 0
    replies.push(async () => {
      await Bun.sleep(650)
      return primary429()
    }, async init => {
      fallbackStarted = Date.now()
      const signal = init.signal!
      return new Promise<Response>((_, reject) => {
        if (signal.aborted) reject(signal.reason)
        else signal.addEventListener("abort", () => reject(signal.reason), { once: true })
      })
    })
    const result = await failed()
    expect(result.error.code).toBe("CANCELLED_OR_TIMED_OUT")
    expect(calls).toHaveLength(2)
    expect(calls[0].init.signal).toBe(calls[1].init.signal)
    expect(Date.now() - fallbackStarted).toBeLessThan(800)
  })

  test("caller cancellation after primary 429 prevents CF request", async () => {
    const controller = new AbortController()
    replies.push(async () => {
      controller.abort(new DOMException("private cancel reason", "AbortError"))
      return primary429()
    })
    const result = await failed(args, controller.signal)
    expect(result.error.code).toBe("CANCELLED_OR_TIMED_OUT")
    expect(result.error.message).not.toContain("private")
    expect(calls).toHaveLength(1)
  })
})
