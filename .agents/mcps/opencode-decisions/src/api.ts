import { z } from "zod@4"

export const ENDPOINT = "https://opencode.ai/zen/v1/systemone"
export const MODEL = "jev-1.13-free"
const MAX_REQUEST_BYTES = 256 * 1024
const MAX_RESPONSE_BYTES = 1024 * 1024
const label = z.string().min(1).max(100)
const instructions = z.string().min(1).max(8000)
  .describe("The decision question and judging criteria. Ask one focused question; do not request chat prose or tool actions.")
const criterion = z.string().max(8000).nullable()
  .describe("A neutral option or scale-point description; null omits its description.")
const choiceCriteria = z.record(label, criterion).refine(
  (value) => Object.keys(value).length >= 1 && Object.keys(value).length <= 255,
  "Choice requires 1–255 options",
).describe("1–255 answer labels mapped to comparable, neutrally worded alternatives. Include plausible alternatives; avoid steering toward a preselected answer.")
const question = z.discriminatedUnion("type", [
  z.object({ type: z.literal("choice"), instructions, criteria: choiceCriteria }).strict(),
  z.object({
    type: z.literal("score"), instructions,
    criteria: z.array(criterion).min(2).max(10)
      .describe("2–10 scale points in order, e.g. [Low, Moderate, High]. The returned score ranges from 0 to length minus 1 and may be fractional."),
  }).strict(),
  z.object({
    type: z.literal("boolean"),
    instructions,
    criteria: z.object({ true: criterion.optional(), false: criterion.optional() }).strict().optional()
      .describe("Optional descriptions of the true and false outcomes. The answer is the estimated probability of true, not a yes/no verdict."),
  }).strict(),
])
export const evaluateSchema = z.object({
  state: z.string().min(1).max(64000).refine((value) => value.trim().length > 0, "State must not be blank")
    .describe("Self-contained decision context: relevant facts, goals, constraints, evidence and uncertainties. The model cannot see this chat, repository, files or tools; gather needed evidence first. Do not include secrets."),
  questions: z.record(label, question).refine(
    (value) => Object.keys(value).length >= 1 && Object.keys(value).length <= 16,
    "Supply 1–16 questions",
  ).describe("1–16 named decision questions. Batch related questions into one call; each answer uses the same name. Use choice for alternatives, score for an ordered scale, boolean for probability of true."),
  timeoutMs: z.number().int().min(1000).max(120000).default(20000)
    .describe("Request timeout in milliseconds; default 20000. Does not cap spend or guarantee upstream generation stops."),
}).strict()

const probability = z.number().min(0).max(1)
const probabilities = z.record(z.string(), probability)
const responseSchema = z.object({
  model: z.literal(MODEL),
  answers: z.record(z.string(), z.discriminatedUnion("type", [
    z.object({ type: z.literal("choice"), choice: z.string(), probabilities, confidence: probability.optional() }),
    z.object({ type: z.literal("score"), score: z.number(), probabilities, confidence: probability.optional() }),
    z.object({ type: z.literal("noul"), noul: probability }),
  ])),
  usage: z.object({
    input_tokens: z.number().nonnegative().optional(),
    output_tokens: z.number().nonnegative().optional(),
  }).optional(),
})

class ApiFailure extends Error {
  constructor(readonly code: string, message: string, readonly status?: number) {
    super(message)
  }
}

/** Sanitize errors: never return headers, credentials, request content or provider error bodies. */
export function failure(error: unknown) {
  if (error instanceof ApiFailure) {
    return { ok: false as const, error: { code: error.code, message: error.message, status: error.status } }
  }
  if (error instanceof z.ZodError) {
    return {
      ok: false as const,
      error: { code: "INVALID_PAYLOAD", message: "Input or System One response does not match the expected schema." },
    }
  }
  if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
    return {
      ok: false as const,
      error: {
        code: "CANCELLED_OR_TIMED_OUT",
        message: "Evaluation cancelled or timed out. Upstream work may still continue; no retry was attempted.",
      },
    }
  }
  return {
    ok: false as const,
    error: {
      code: "CONNECTION_FAILED",
      message: "System One connection failed. Check network access and the inherited Zen account credential.",
    },
  }
}

async function readResponse(response: Response) {
  const reader = response.body?.getReader()
  if (!reader) throw new ApiFailure("INVALID_RESPONSE", "System One returned no response body.")
  const chunks: BlobPart[] = []
  let bytes = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      bytes += value.byteLength
      if (bytes > MAX_RESPONSE_BYTES) {
        throw new ApiFailure("RESPONSE_TOO_LARGE", "System One response exceeds the 1 MiB transport limit.")
      }
      chunks.push(new Uint8Array(value))
    }
  } finally {
    await reader.cancel()
    reader.releaseLock()
  }
  try {
    return JSON.parse(await new Blob(chunks).text())
  } catch {
    throw new ApiFailure("INVALID_RESPONSE", "System One returned invalid JSON.")
  }
}

/** Evaluate one stateless decision batch using the existing inherited Zen key, with no retries/fallback. */
export async function evaluate(input: unknown, callerSignal: AbortSignal) {
  const args = evaluateSchema.parse(input)
  const key = process.env.OPENCODE_API_KEY
  if (!key) {
    throw new ApiFailure("AUTH_UNAVAILABLE",
      "OPENCODE_API_KEY is not inherited. Supply your existing Zen key outside chat and launch OpenCode with it; no anonymous fallback is used.")
  }
  const questions = Object.fromEntries(Object.entries(args.questions).map(([id, value]) =>
    [id, value.type === "boolean" ? { ...value, type: "noul" } : value],
  ))
  const body = JSON.stringify({ model: MODEL, state: args.state, questions })
  if (new TextEncoder().encode(body).byteLength > MAX_REQUEST_BYTES) {
    throw new ApiFailure("REQUEST_TOO_LARGE", "Decision request exceeds 256 KiB.")
  }
  const signal = AbortSignal.any([callerSignal, AbortSignal.timeout(args.timeoutMs)])
  signal.throwIfAborted()
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body,
    signal,
    redirect: "error",
  })
  if (!response.ok) {
    await response.body?.cancel()
    throw new ApiFailure("HTTP_ERROR",
      "Zen rejected the System One request. Check account access, rate limits and endpoint compatibility.",
      response.status)
  }
  const payload = responseSchema.parse(await readResponse(response))
  if (Object.keys(payload.answers).length !== Object.keys(args.questions).length) {
    throw new ApiFailure("INVALID_RESPONSE", "System One returned a different set of questions.")
  }
  const answers = Object.fromEntries(Object.entries(args.questions).map(([id, requested]) => {
    const answer = payload.answers[id]
    const nativeType = requested.type === "boolean" ? "noul" : requested.type
    if (!answer || answer.type !== nativeType) {
      throw new ApiFailure("INVALID_RESPONSE", "System One returned a missing or mismatched answer.")
    }
    if (answer.type === "choice" && requested.type === "choice" && !Object.hasOwn(requested.criteria, answer.choice)) {
      throw new ApiFailure("INVALID_RESPONSE", "System One chose an option that was not supplied.")
    }
    if (answer.type === "score" && requested.type === "score" && (answer.score < 0 || answer.score > requested.criteria.length - 1)) {
      throw new ApiFailure("INVALID_RESPONSE", "System One returned a score outside the supplied scale.")
    }
    return [id, answer.type === "noul" ? { type: "boolean" as const, probability: answer.noul } : answer]
  }))
  return { ok: true as const, model: payload.model, answers, usage: payload.usage }
}
