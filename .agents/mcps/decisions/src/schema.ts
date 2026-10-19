import { z } from "zod@4"

import { MODEL, FALLBACK_MODEL, MERCURY_MODEL, GPT_MODEL, OPENROUTER_RESPONSE_MODELS } from "./providers.ts"
export { MODEL, FALLBACK_MODEL } from "./providers.ts"
export type DecisionModel = typeof MODEL | typeof FALLBACK_MODEL | typeof MERCURY_MODEL | typeof GPT_MODEL

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

export type EvaluateArgs = z.infer<typeof evaluateSchema>

const probability = z.number().min(0).max(1)
const probabilities = z.record(z.string(), probability)
const responseSchema = z.object({
  model: z.enum([MODEL, FALLBACK_MODEL, MERCURY_MODEL, GPT_MODEL]),
  answers: z.record(z.string(), z.discriminatedUnion("type", [
    z.object({ type: z.literal("choice"), choice: z.string(), probabilities: probabilities.optional(), confidence: probability.optional() }),
    z.object({ type: z.literal("score"), score: z.number(), probabilities: probabilities.optional(), confidence: probability.optional() }),
    z.object({ type: z.literal("noul"), noul: probability }),
  ])),
  usage: z.object({
    input_tokens: z.number().nonnegative().optional(),
    output_tokens: z.number().nonnegative().optional(),
  }).optional(),
})

export type ResponsePayload = z.infer<typeof responseSchema>

/** Parse and validate raw input from the MCP tool call. Throws ZodError on invalid input. */
export function parseEvaluateInput(input: unknown): EvaluateArgs {
  return evaluateSchema.parse(input)
}

/** Parse raw HTTP response body as JSON and validate schema. Throws SyntaxError (invalid JSON) or ZodError (schema mismatch). */
export function parseResponseBody(rawText: string, expectedModel: DecisionModel = MODEL): ResponsePayload {
  const raw = JSON.parse(rawText)
  if (expectedModel !== MODEL) {
    const payload = responseSchema.extend({ model: z.string().refine(
      value => OPENROUTER_RESPONSE_MODELS[expectedModel].some(model => model === value),
      "Unexpected OpenRouter decision model",
    ) }).parse(raw)
    // Keep the exact upstream identity in response.json; expose the requested route.
    return { ...payload, model: expectedModel }
  }
  return responseSchema.extend({ model: z.literal(expectedModel) }).refine(
    value => Object.values(value.answers).every(answer => answer.type === "noul" || answer.probabilities !== undefined),
    "Native decision answers require probabilities",
  ).parse(raw)
}
