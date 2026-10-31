import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs"
import { join } from "node:path"
import { evaluate, failure } from "../src/evaluation/api.ts"
import { ENDPOINT, FALLBACK_MODEL, MODEL, MERCURY_MODEL, GPT_MODEL, OPENROUTER_ENDPOINT } from "../src/evaluation/providers/config.ts"
import type { DecisionModel, EvaluateArgs, ResponsePayload } from "../src/evaluation/schema.ts"

const envNames = ["OPENCODE_API_KEY", "CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_API_TOKEN", "OPENROUTER_API_KEY", "XDG_CACHE_HOME"] as const
const originalFetch = globalThis.fetch
let savedEnv: (string | undefined)[]
let cache: string
let calls: { url: string; init: RequestInit }[]
type Reply = Response | Error | ((init: RequestInit) => Promise<Response>)
let replies: Reply[]
let unexpectedRequests: number

beforeEach(() => {
  savedEnv = envNames.map(name => process.env[name])
  cache = mkdtempSync(join(process.env.TMPDIR ?? "/tmp/opencode", "decisions-fallback-"))
  process.env.XDG_CACHE_HOME = cache
  process.env.OPENCODE_API_KEY = "fake-zen-key"
  delete process.env.CLOUDFLARE_ACCOUNT_ID
  delete process.env.CLOUDFLARE_API_TOKEN
  process.env.OPENROUTER_API_KEY = "fake-router-key"
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
const cf = (answers: Record<string, unknown> = { "public choice / α": choice }, model: DecisionModel = FALLBACK_MODEL) =>
  new Response(JSON.stringify({ model, answers }))

// Actual Zod/alias validation runs in the real-launcher E2E suite.
function validate(raw: string, _expectedModel: DecisionModel = MODEL): ResponsePayload {
  const parsed = JSON.parse(raw)
  if (typeof parsed.model !== "string" || !parsed.answers) throw new Error("Invalid decision payload")
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
  test("Clef uses fixed OpenRouter endpoint and key, shares signal and retains both raw captures", async () => {
    replies.push(primary429(), cf())
    const result = await run()
    expect(result.ok).toBe(true)
    expect(calls).toHaveLength(2)
    expect(calls[0].url).toBe(ENDPOINT)
    expect(calls[1].url).toBe(OPENROUTER_ENDPOINT)
    expect(new Headers(calls[0].init.headers).get("authorization")).toBe("Bearer fake-zen-key")
    expect(new Headers(calls[1].init.headers).get("authorization")).toBe("Bearer fake-router-key")
    for (const call of calls) {
      expect(call.init.redirect).toBe("error")
      expect(call.init.method).toBe("POST")
      expect(new Headers(call.init.headers).get("content-type")).toBe("application/json")
    }
    expect(calls[0].init.signal).toBe(calls[1].init.signal)
    expect(JSON.stringify(calls[0].init)).not.toContain("fake-router-key")
    expect(JSON.stringify(calls[1].init)).not.toContain("fake-zen-key")
    expect(result.model).toBe(FALLBACK_MODEL)
    expect(result.answers).toEqual({ "public choice / α": choice })
    const raw = readFileSync(result.responsePath!, "utf8")
    expect(JSON.parse(raw).model).toBe(FALLBACK_MODEL)
    expect(JSON.parse(readFileSync(result.resultPath!, "utf8")).answers).toEqual(result.answers)
    // Discover capture filenames through the returned path, not a private naming assumption.
    const filename = result.responsePath!.split("/").at(-1)!
    const bodies = readdirSync(cache, { recursive: true }).filter(path => String(path).endsWith(filename))
      .map(path => readFileSync(join(cache, String(path)), "utf8"))
    expect(bodies).toHaveLength(2)
    expect(bodies).toContain("private-primary-quota")
    expect(bodies).toContain(raw)
  })

  test("Clef choice, noul and fractional score fixtures preserve arbitrary public IDs", async () => {
    const input: EvaluateArgs = { ...args, questions: {
      "choice with spaces": args.questions["public choice / α"],
      "__proto__?": { type: "boolean", instructions: "Likely?", criteria: { true: null, false: "No" } },
      "score/非ASCII": { type: "score", instructions: "Rate", criteria: [null, "Middle", "High"] },
    } }
    const score = { type: "score", score: 1.5, probabilities: { "0": 0.1, "1": 0.3, "2": 0.6 } }
    replies.push(primary429(), cf({ "choice with spaces": choice, "__proto__?": { type: "noul", noul: 0.7 }, "score/非ASCII": score }))
    const result = await run(input)
    expect(result.answers).toEqual({ "choice with spaces": choice, "__proto__?": { type: "boolean", probability: 0.7 }, "score/非ASCII": score })
    const sent = JSON.parse(String(calls[1].init.body))
    expect(Object.keys(sent.questions)).toEqual(["choice with spaces", "__proto__?", "score/非ASCII"])
    expect(sent.questions["__proto__?"].type).toBe("noul")
    expect(sent.model).toBe(FALLBACK_MODEL)
  })

  test("normal Zen success and every representative non-429 failure never contact OpenRouter", async () => {
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

  test("missing OpenRouter key skips all fallbacks even if legacy Cloudflare variables are set", async () => {
    process.env.CLOUDFLARE_ACCOUNT_ID = "a".repeat(32)
    process.env.CLOUDFLARE_API_TOKEN = "unused-cf-token"
    for (const key of [undefined, ""]) {
      if (key === undefined) delete process.env.OPENROUTER_API_KEY
      else process.env.OPENROUTER_API_KEY = key
      replies.push(primary429())
      const result = await failed()
      expect(result.error.status).toBe(429)
      expect(result.error.code).toBe("HTTP_ERROR")
      expect(readFileSync(result.responsePath!, "utf8")).toBe("private-primary-quota")
    }
    expect(calls).toHaveLength(2)
  })

  test("UTF-8 body over 12000 bytes and single-option choices skip Clef to Mercury without truncation", async () => {
    const large = { ...args, state: "界".repeat(4100) }
    expect(large.state.length).toBeLessThan(12000)
    expect(Buffer.byteLength(large.state)).toBeGreaterThan(12000)
    const single: EvaluateArgs = { ...args, questions: { only: { type: "choice", instructions: "Pick", criteria: { a: null } } } }
    for (const input of [large, single]) {
      const id = Object.keys(input.questions)[0]
      replies.push(primary429(), cf({ [id]: choice }, MERCURY_MODEL))
      expect((await run(input)).model).toBe(MERCURY_MODEL)
      expect(JSON.parse(String(calls.at(-1)!.init.body)).state).toBe(input.state)
      expect(JSON.parse(String(calls.at(-1)!.init.body)).questions).toEqual(input.questions)
    }
    expect(calls).toHaveLength(4)
    expect(JSON.parse(String(calls[0].init.body)).state).toBe(large.state)
  })

  test("Clef 429 advances to Mercury without retaining a Workers AI account cooldown", async () => {
    for (const header of ["120", new Date(Date.now() + 180000).toUTCString(), null, "invalid"]) {
      replies.push(primary429(), new Response("private-clef-quota", { status: 429, headers: header === null ? {} : { "retry-after": header } }), cf(undefined, MERCURY_MODEL))
      expect((await run()).model).toBe(MERCURY_MODEL)
    }
    expect(calls).toHaveLength(12)
    expect(calls.filter(call => JSON.parse(String(call.init.body)).model === FALLBACK_MODEL)).toHaveLength(4)
  })

  test("Clef HTTP errors are final, sanitized and retain the last raw response", async () => {
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

  test("Clef connection, malformed JSON and obsolete Workers AI envelope failures do not retry", async () => {
    for (const [reply, code] of [[new TypeError("fake-cf-token private detail"), "CONNECTION_FAILED"], [new Response("private malformed"), "INVALID_RESPONSE"], [new Response('{"success":false,"errors":["private"]}'), "INVALID_RESPONSE"]] as const) {
      replies.push(primary429(), reply)
      const result = await failed()
      expect(result.error.code).toBe(code)
      expect(JSON.stringify(result.error)).not.toContain("private")
      expect(JSON.stringify(result.error)).not.toContain("fake-cf-token")
    }
    expect(calls).toHaveLength(6)
  })

  test("selected model, original question set, choice labels and score range are enforced", async () => {
    const invalid = [cf(undefined, MODEL), cf({ wrong: choice }), cf({ "public choice / α": choice, extra: choice }), cf({ "public choice / α": { ...choice, choice: "injected" } })]
    for (const reply of invalid) {
      replies.push(primary429(), reply)
      expect((await failed()).error.code).toBe("INVALID_RESPONSE")
    }
    const scoreArgs: EvaluateArgs = { ...args, questions: { rating: { type: "score", instructions: "Rate", criteria: [null, null] } } }
    replies.push(primary429(), cf({ rating: { type: "score", score: 2, probabilities: {} } }))
    expect((await failed(scoreArgs)).error.code).toBe("INVALID_RESPONSE")
    expect(calls).toHaveLength(10)
  })

  test("Clef schema rejection is explicit INVALID_PAYLOAD with sanitized persisted error", async () => {
    class ZodError extends Error {}
    replies.push(primary429(), cf())
    let caught: unknown
    try {
      await evaluate(args, new AbortController().signal, (raw, expectedModel) => {
        expect(expectedModel).toBe(FALLBACK_MODEL)
        expect(JSON.parse(raw).model).toBe(FALLBACK_MODEL)
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

  test("caller cancellation after primary 429 prevents any OpenRouter request", async () => {
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

describe("ordered OpenRouter fallbacks and spending boundary", () => {
  const router = (model: DecisionModel, answers = { "public choice / α": choice }) =>
    new Response(JSON.stringify({ model, answers }))

  test("Clef byte eligibility checks the final serialized request including normalized criteria", async () => {
    const empty = JSON.stringify({ model: FALLBACK_MODEL, state: "", questions: args.questions })
    const boundary = { ...args, state: "x".repeat(12000 - Buffer.byteLength(empty)) }
    replies.push(primary429(), router(FALLBACK_MODEL))
    expect((await run(boundary)).model).toBe(FALLBACK_MODEL)
    expect(Buffer.byteLength(String(calls.at(-1)!.init.body))).toBe(12000)

    replies.push(primary429(), router(MERCURY_MODEL))
    expect((await run({ ...boundary, state: boundary.state + "x" })).model).toBe(MERCURY_MODEL)

    const questions: EvaluateArgs["questions"] = { flag: { type: "boolean", instructions: "Likely?", criteria: { true: null } } }
    const native = { flag: { ...questions.flag, type: "noul" } }
    const beforeNormalization = JSON.stringify({ model: FALLBACK_MODEL, state: "", questions: native })
    const input = { ...args, questions, state: "x".repeat(12000 - Buffer.byteLength(beforeNormalization)) }
    replies.push(primary429(), new Response(JSON.stringify({ model: MERCURY_MODEL, answers: { flag: { type: "noul", noul: 0.5 } } })))
    expect((await run(input)).model).toBe(MERCURY_MODEL)
    expect(JSON.parse(String(calls.at(-1)!.init.body)).questions.flag.criteria).toEqual({ true: "true", false: "false" })
  })

  test("429 chain is Zen → OpenRouter Clef → Mercury Free → GPT with isolated credentials and one deadline", async () => {
    process.env.OPENROUTER_API_KEY = "fake-router-key"
    replies.push(primary429(), primary429(), primary429(), router(GPT_MODEL))
    const result = await run()
    expect(result.model).toBe(GPT_MODEL)
    expect(calls.map(call => JSON.parse(String(call.init.body)).model)).toEqual([MODEL, FALLBACK_MODEL, MERCURY_MODEL, GPT_MODEL])
    expect(calls.slice(1).map(call => call.url)).toEqual([OPENROUTER_ENDPOINT, OPENROUTER_ENDPOINT, OPENROUTER_ENDPOINT])
    expect(calls.map(call => new Headers(call.init.headers).get("authorization"))).toEqual([
      "Bearer fake-zen-key", "Bearer fake-router-key", "Bearer fake-router-key", "Bearer fake-router-key",
    ])
    for (const call of calls) {
      expect(call.init.signal).toBe(calls[0].init.signal)
      expect(call.init.redirect).toBe("error")
    }
    expect(JSON.stringify(calls[0].init)).not.toContain("fake-router-key")
    for (const call of calls.slice(1)) {
      expect(JSON.stringify(call.init)).not.toContain("fake-zen-key")
      expect(JSON.stringify(call.init)).not.toContain("fake-cf-token")
    }
    expect(readdirSync(join(cache, "decisions"))).toHaveLength(4)
    expect(JSON.parse(readFileSync(result.responsePath, "utf8")).model).toBe(GPT_MODEL)
  })

  test("Mercury success after Clef 429 never spends on GPT", async () => {
    process.env.OPENROUTER_API_KEY = "fake-router-key"
    replies.push(primary429(), primary429(), router(MERCURY_MODEL))
    expect((await run()).model).toBe(MERCURY_MODEL)
    expect(calls).toHaveLength(3)
  })

  test("Mercury non-429 errors never escalate to paid GPT", async () => {
    process.env.OPENROUTER_API_KEY = "fake-router-key"
    for (const status of [400, 401, 402, 403, 500, 503]) {
      replies.push(primary429(), primary429(), new Response("private router failure fake-router-key", { status }))
      const result = await failed()
      expect(result.error.status).toBe(status)
      expect(JSON.stringify(result)).not.toContain("fake-router-key")
    }
    for (const reply of [new TypeError("private network"), new Response("bad json"), router(GPT_MODEL)]) {
      replies.push(primary429(), primary429(), reply)
      expect((await failed()).ok).toBe(false)
    }
    expect(calls).toHaveLength(27)
    expect(calls.every(call => JSON.parse(String(call.init.body)).model !== GPT_MODEL)).toBe(true)
  })

  test("Clef non-429 errors stop before Mercury and GPT", async () => {
    process.env.OPENROUTER_API_KEY = "fake-router-key"
    replies.push(primary429(), new Response("private", { status: 401 }))
    expect((await failed()).error.status).toBe(401)
    expect(calls).toHaveLength(2)
  })

  test("OpenRouter codec preserves question IDs and normalizes nullable criteria without truncation", async () => {
    process.env.OPENROUTER_API_KEY = "fake-router-key"
    const input: EvaluateArgs = { ...args, questions: {
      optional: { type: "boolean", instructions: "Likely?" },
      partial: { type: "boolean", instructions: "Likely?", criteria: { true: null } },
      rating: { type: "score", instructions: "Rate", criteria: [null, "High"] },
    } }
    replies.push(primary429(), new Response(JSON.stringify({ model: FALLBACK_MODEL, answers: {
      optional: { type: "noul", noul: 0.6 }, partial: { type: "noul", noul: 0.7 },
      rating: { type: "score", score: 1, probabilities: { "1": 1 } },
    } })))
    const result = await run(input)
    const sent = JSON.parse(String(calls[1].init.body))
    expect(sent.state).toBe(input.state)
    expect(sent.questions.optional).toEqual({ type: "noul", instructions: "Likely?" })
    expect(sent.questions.partial.criteria).toEqual({ true: "true", false: "false" })
    expect(sent.questions.rating.criteria).toEqual(["0", "High"])
    expect(result.answers.optional).toEqual({ type: "boolean", probability: 0.6 })
  })

  test("abort after Mercury 429 prevents GPT", async () => {
    process.env.OPENROUTER_API_KEY = "fake-router-key"
    const controller = new AbortController()
    replies.push(primary429(), primary429(), async () => {
      controller.abort(new DOMException("cancel", "AbortError"))
      return primary429()
    })
    expect((await failed(args, controller.signal)).error.code).toBe("CANCELLED_OR_TIMED_OUT")
    expect(calls).toHaveLength(3)
  })
})
