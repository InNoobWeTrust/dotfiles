// Evaluation request orchestration, provider attempts and normalized answers.
import { readFileSync } from "node:fs"
import type { ZodError } from "zod@4"
import type { DecisionModel, EvaluateArgs, ResponsePayload } from "./schema.ts"
import { INLINE_OUTPUT_BYTES, ResponseCapture } from "./capture/response.ts"
import { ENDPOINT, MODEL, FALLBACK_MODEL, MERCURY_MODEL, GPT_MODEL, OPENROUTER_ENDPOINT } from "./providers/config.ts"

export { ENDPOINT, MODEL } from "./providers/config.ts"
const MAX_REQUEST_BYTES = 256 * 1024
// Conservative headroom for Clef's smallest listed OpenRouter backend (16K tokens).
// This is a byte guard, not an exact tokenizer measurement; never truncate context.
const MAX_CLEF_BYTES = 12000

/** Adapt nullable/partial criteria to OpenRouter's documented Decisions schema. */
function openRouterRequest(args: EvaluateArgs, model: typeof FALLBACK_MODEL | typeof MERCURY_MODEL | typeof GPT_MODEL) {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) return
  if (model === FALLBACK_MODEL && Object.values(args.questions).some(
    question => question.type === "choice" && Object.keys(question.criteria).length < 2,
  )) return
  const questions = Object.fromEntries(Object.entries(args.questions).map(([id, question]) => {
    if (question.type === "boolean") {
      return [id, { ...question, type: "noul", ...(question.criteria ? {
        criteria: { true: question.criteria.true ?? "true", false: question.criteria.false ?? "false" },
      } : {}) }]
    }
    if (question.type === "score") {
      return [id, { ...question, criteria: question.criteria.map((value, index) => value ?? String(index)) }]
    }
    return [id, question]
  }))
  const body = JSON.stringify({ model, state: args.state, questions })
  if (Buffer.byteLength(body, "utf8") > (model === FALLBACK_MODEL ? MAX_CLEF_BYTES : MAX_REQUEST_BYTES)) return
  return { endpoint: OPENROUTER_ENDPOINT, key, body }
}

class ApiFailure extends Error {
  /** Set once ResponseCapture is created; null only when creation itself failed. */
  responsePath: string | null = null
  /** Set when the sanitized payload was successfully persisted to disk. */
  resultPath: string | null = null
  constructor(readonly code: string, message: string, readonly status?: number) {
    super(message)
  }
}

function isZodError(err: unknown): err is ZodError {
  return err instanceof Error && err.constructor.name === "ZodError"
}

function isAbortOrTimeout(err: unknown): err is Error {
  return err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError")
}

/** Sanitize errors: never return headers, credentials, request content or provider error bodies. */
export function failure(error: unknown) {
  const responsePath = error instanceof ApiFailure ? (error.responsePath ?? null) : null
  const resultPath = error instanceof ApiFailure ? (error.resultPath ?? null) : null
  const paths = { responsePath, resultPath, truncated: false }
  if (error instanceof ApiFailure) {
    return { ok: false as const, error: { code: error.code, message: error.message, status: error.status }, ...paths }
  }
  if (isZodError(error)) {
    return {
      ok: false as const,
      error: { code: "INVALID_PAYLOAD", message: "Input or System One response does not match the expected schema." },
      ...paths,
    }
  }
  if (isAbortOrTimeout(error)) {
    return {
      ok: false as const,
      error: {
        code: "CANCELLED_OR_TIMED_OUT",
        message: "Evaluation cancelled or timed out. Upstream work may still continue; no retry was attempted.",
      },
      ...paths,
    }
  }
  return {
    ok: false as const,
    error: {
      code: "CONNECTION_FAILED",
      message: "Decision connection failed. Check network access and the inherited provider credentials.",
    },
    ...paths,
  }
}

async function streamBody(capture: ResponseCapture, response: Response): Promise<void> {
  const reader = response.body?.getReader()
  if (!reader) return
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      // Only capture.write() failures become OUTPUT_CAPTURE_FAILED; reader.read()
      // network or abort errors propagate naturally so the caller can classify them.
      try {
        capture.write(value)
      } catch {
        throw new ApiFailure("OUTPUT_CAPTURE_FAILED",
          "Failed to write response body to cache. Check XDG_CACHE_HOME and available disk space.")
      }
    }
  } finally {
    await reader.cancel().catch(() => {})
    reader.releaseLock()
  }
}

/**
 * Evaluate on Zen; advance through Clef, Mercury Free, then GPT only on HTTP 429.
 *
 * validateResponse parses and validates the raw HTTP body string; it is injected by the server
 * so that api.ts itself carries no runtime zod@4 dependency (enabling direct unit testing).
 */
export async function evaluate(
  args: EvaluateArgs,
  callerSignal: AbortSignal,
  validateResponse: (rawText: string, expectedModel?: DecisionModel) => ResponsePayload,
) {
  // Create cache directory before all other logic so every error path can persist a resultPath.
  let capture: ResponseCapture
  try {
    capture = new ResponseCapture(process.env)
  } catch {
    throw new ApiFailure("OUTPUT_CAPTURE_FAILED",
      "Failed to create response cache. Check XDG_CACHE_HOME and available disk space.")
  }

  try {
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
    let response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body,
      signal,
      redirect: "error",
    })

    // Stream full body to cache before parsing; HTTP error bodies are persisted privately and never echoed.
    // capture.write() failures surface as OUTPUT_CAPTURE_FAILED; reader.read() network/abort errors propagate.
    await streamBody(capture, response)
    try {
      capture.close()
    } catch {
      throw new ApiFailure("OUTPUT_CAPTURE_FAILED",
        "Failed to flush response cache. Check XDG_CACHE_HOME and available disk space.")
    }

    let selectedModel: DecisionModel = MODEL
    const fallbacks = [FALLBACK_MODEL, MERCURY_MODEL, GPT_MODEL] as const
    for (const model of fallbacks) {
      if (response.status !== 429) break
      const fallback = openRouterRequest(args, model)
      if (fallback) {
        signal.throwIfAborted()
        // Retain the primary raw capture; final paths belong to the selected attempt.
        try {
          capture = new ResponseCapture(process.env)
        } catch {
          throw new ApiFailure("OUTPUT_CAPTURE_FAILED", "Failed to create fallback response cache.")
        }
        selectedModel = model
        response = await fetch(fallback.endpoint, {
          method: "POST",
          headers: { authorization: `Bearer ${fallback.key}`, "content-type": "application/json" },
          body: fallback.body,
          signal,
          redirect: "error",
        })
        await streamBody(capture, response)
        try {
          capture.close()
        } catch {
          throw new ApiFailure("OUTPUT_CAPTURE_FAILED", "Failed to flush fallback response cache.")
        }
      }
    }

    if (!response.ok) {
      throw new ApiFailure("HTTP_ERROR",
        `${selectedModel === MODEL ? "Zen" : `OpenRouter ${selectedModel}`} rejected the decision request. Check account access, rate limits and endpoint compatibility.`,
        response.status)
    }

    // Parse and validate the response body via the injected validator.
    let payload: ResponsePayload
    try {
      payload = validateResponse(readFileSync(capture.responsePath, "utf-8"), selectedModel)
    } catch (err) {
      if (isZodError(err)) throw new ApiFailure("INVALID_PAYLOAD", "System One response does not match the expected schema.")
      throw new ApiFailure("INVALID_RESPONSE", "System One returned invalid JSON.")
    }

    if (payload.model !== selectedModel) {
      throw new ApiFailure("INVALID_RESPONSE", "Decision provider returned an unexpected model.")
    }
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

    // Serialize the normalized result to disk; path is always returned, never fabricated.
    const normalized = { model: payload.model, answers, usage: payload.usage }
    let resultPath: string
    try {
      ;({ resultPath } = capture.serializeResult(normalized))
    } catch {
      throw new ApiFailure("OUTPUT_CAPTURE_FAILED", "Failed to write result cache.")
    }

    // Inline threshold applies to the complete serialized envelope, including path metadata.
    // Paths appear before answer content so they remain discoverable under any downstream clipping.
    const fullEnvelope = {
      ok: true as const,
      model: payload.model,
      responsePath: capture.responsePath,
      resultPath,
      truncated: false as const,
      answers,
      usage: payload.usage,
    }
    const truncated = Buffer.from(JSON.stringify(fullEnvelope), "utf-8").byteLength > INLINE_OUTPUT_BYTES
    if (truncated) {
      return {
        ok: true as const,
        model: payload.model,
        responsePath: capture.responsePath,
        resultPath,
        truncated: true as const,
      }
    }
    return fullEnvelope
  } catch (err) {
    // Flush partial response data. If close() fails (fsync error), surface OUTPUT_CAPTURE_FAILED
    // immediately — the file is not reliably flushed and the original error loses relevance.
    try {
      capture.close()
    } catch {
      const closeErr = new ApiFailure("OUTPUT_CAPTURE_FAILED",
        "Failed to flush response cache.")
      closeErr.responsePath = capture.responsePath
      throw closeErr
    }

    // Normalize to ApiFailure and attach responsePath from the capture.
    let apiErr: ApiFailure
    if (err instanceof ApiFailure) {
      err.responsePath ??= capture.responsePath
      apiErr = err
    } else if (isAbortOrTimeout(err)) {
      apiErr = new ApiFailure("CANCELLED_OR_TIMED_OUT",
        "Evaluation cancelled or timed out. Upstream work may still continue; no retry was attempted.")
      apiErr.responsePath = capture.responsePath
    } else if (isZodError(err)) {
      apiErr = new ApiFailure("INVALID_PAYLOAD",
        "Input or System One response does not match the expected schema.")
      apiErr.responsePath = capture.responsePath
    } else {
      apiErr = new ApiFailure("CONNECTION_FAILED",
        "Decision connection failed. Check network access and the inherited provider credentials.")
      apiErr.responsePath = capture.responsePath
    }

    // Persist the sanitized error envelope; resultPath null only when disk write is impossible.
    if (!apiErr.resultPath) {
      try {
        const errorPayload = { ok: false as const, error: { code: apiErr.code, message: apiErr.message, status: apiErr.status } }
        const { resultPath } = capture.serializeResult(errorPayload)
        apiErr.resultPath = resultPath
      } catch {
        // Storage write failure: escalate so the caller knows result persistence failed.
        const cacheErr = new ApiFailure("OUTPUT_CAPTURE_FAILED",
          "Failed to persist error response cache.")
        cacheErr.responsePath = apiErr.responsePath
        throw cacheErr
      }
    }

    throw apiErr
  }
}
