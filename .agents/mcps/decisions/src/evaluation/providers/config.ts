// Fixed provider endpoints, route identities and accepted upstream aliases.
export const ENDPOINT = "https://opencode.ai/zen/v1/systemone"
export const MODEL = "jev-1.13-free"
export const FALLBACK_MODEL = "cloudflare/clef-flash"
export const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/alpha/decisions"
export const GEMINI_MODEL = "google/gemini-decision-1"
export const GPT_MODEL = "openai/gpt-6-luna-decisions"
// Exact catalog aliases, not prefixes: never accept another selected model.
export const OPENROUTER_RESPONSE_MODELS = {
  [FALLBACK_MODEL]: [FALLBACK_MODEL],
  [GEMINI_MODEL]: [GEMINI_MODEL, "google/gemini-decision-1-20261111"],
  [GPT_MODEL]: [GPT_MODEL, "openai/gpt-6-luna-decisions-20261006"],
} as const
