// Fixed provider endpoints, route identities and accepted upstream aliases.
export const ENDPOINT = "https://opencode.ai/zen/v1/systemone"
export const MODEL = "jev-1.13-free"
export const FALLBACK_MODEL = "cloudflare/clef-flash"
export const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/alpha/decisions"
export const MERCURY_MODEL = "inception/mercury-decide:free"
export const GPT_MODEL = "openai/gpt-6-luna-decisions"
// Exact catalog aliases, not prefixes: never accept another selected model.
export const OPENROUTER_RESPONSE_MODELS = {
  [FALLBACK_MODEL]: [FALLBACK_MODEL],
  [MERCURY_MODEL]: [MERCURY_MODEL, "inception/mercury-decide-20260930"],
  [GPT_MODEL]: [GPT_MODEL, "openai/gpt-6-luna-decisions-20261006"],
} as const
