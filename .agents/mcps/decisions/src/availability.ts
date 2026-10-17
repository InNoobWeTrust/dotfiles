import { getCloudflareCooldown, recordCloudflareCooldown } from "./api.ts"
import { ENDPOINT, MODEL, FALLBACK_MODEL, getCloudflareConfiguration } from "./providers.ts"
import type { DecisionModel, ResponsePayload } from "./schema.ts"

type Status = "unconfigured" | "configuration_invalid" | "available" | "rate_limited" | "unauthorized" | "unreachable" | "invalid_response" | "http_error"
export interface ProviderAvailability {
  model: DecisionModel
  available: boolean
  status: Status
  httpStatus?: number
  retryAt?: string
}
type Validator = (text: string, model?: DecisionModel) => ResponsePayload
const PROBE_TIMEOUT_MS = 4000
const MAX_PROBE_BYTES = 16384

/** Read only a small, non-private health reply; never expose provider error bodies. */
async function probeBody(response: Response) {
  if (!response.body) throw new Error("Missing probe body")
  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let bytes = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      bytes += value.byteLength
      if (bytes > MAX_PROBE_BYTES) throw new Error("Probe body too large")
      chunks.push(value)
    }
    return Buffer.concat(chunks).toString("utf8")
  } finally {
    await reader.cancel().catch(() => {})
    reader.releaseLock()
  }
}

async function probe(
  model: DecisionModel, endpoint: string, key: string, validate: Validator,
  callerSignal: AbortSignal, account?: string,
): Promise<ProviderAvailability> {
  const unavailable = (status: Status, httpStatus?: number): ProviderAvailability => ({ model, available: false, status, httpStatus })
  const signal = AbortSignal.any([callerSignal, AbortSignal.timeout(PROBE_TIMEOUT_MS)])
  let response: Response | undefined
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        model, state: "Public startup availability probe. No user data.",
        questions: { q0: { type: "choice", instructions: "Choose either label.", criteria: { a: "First label", b: "Second label" } } },
      }),
      signal,
      redirect: "error",
    })
    if (response.status === 429) {
      if (account) recordCloudflareCooldown(account, response)
      return unavailable("rate_limited", 429)
    }
    if (response.status === 401 || response.status === 403) return unavailable("unauthorized", response.status)
    if (!response.ok) return unavailable("http_error", response.status)
    try {
      const payload = validate(await probeBody(response), model)
      const answer = payload.answers.q0
      if (payload.model !== model || Object.keys(payload.answers).length !== 1 ||
          answer?.type !== "choice" || !["a", "b"].includes(answer.choice)) {
        return unavailable("invalid_response", response.status)
      }
      return { model, available: true, status: "available", httpStatus: response.status }
    } catch {
      return unavailable(signal.aborted ? "unreachable" : "invalid_response", response.status)
    }
  } catch {
    return unavailable("unreachable")
  } finally {
    // Non-2xx replies are not read, cached or logged; cancel their bodies too.
    if (response?.body && !response.body.locked) await response.body.cancel().catch(() => {})
  }
}

/** At most two parallel, tiny inference requests. No retries, environment-file reads or background polling. */
export async function discoverProviders(
  validate: Validator,
  env: Record<string, string | undefined> = process.env,
  signal: AbortSignal = new AbortController().signal,
) {
  const cloudflare = getCloudflareConfiguration(env)
  const cooldown = cloudflare && getCloudflareCooldown(cloudflare.account)
  const [zen, cf] = await Promise.all([
    env.OPENCODE_API_KEY
      ? probe(MODEL, ENDPOINT, env.OPENCODE_API_KEY, validate, signal)
      : Promise.resolve<ProviderAvailability>({ model: MODEL, available: false, status: "unconfigured" }),
    cloudflare
      ? cooldown
        ? Promise.resolve<ProviderAvailability>({ model: FALLBACK_MODEL, available: false, status: "rate_limited", retryAt: new Date(cooldown).toISOString() })
        : probe(FALLBACK_MODEL, cloudflare.endpoint, cloudflare.key, validate, signal, cloudflare.account)
      : Promise.resolve<ProviderAvailability>({ model: FALLBACK_MODEL, available: false,
        status: env.CLOUDFLARE_ACCOUNT_ID && env.CLOUDFLARE_API_TOKEN ? "configuration_invalid" : "unconfigured" }),
  ])
  // CF is not an auth/network fallback: only a verified Zen 429 can reach it.
  const evaluateAvailable = zen.available || (zen.status === "rate_limited" && cf.available)
  return { checkedAt: new Date().toISOString(), evaluateAvailable, providers: { zen, cloudflare: cf } }
}
