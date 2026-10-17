export const ENDPOINT = "https://opencode.ai/zen/v1/systemone"
export const MODEL = "jev-1.13-free"
export const FALLBACK_MODEL = "clef-flash"

/** Shared fixed destinations and credential checks for probes and evaluations. */
export function getCloudflareConfiguration(env: Record<string, string | undefined>) {
  const account = env.CLOUDFLARE_ACCOUNT_ID
  const key = env.CLOUDFLARE_API_TOKEN
  if (!account || !/^[a-f0-9]{32}$/i.test(account) || !key) return
  return {
    account, key,
    endpoint: `https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/@cf/cloudflare/${FALLBACK_MODEL}`,
  }
}
