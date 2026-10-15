import { createHash } from "node:crypto"

/** Per-child, per-prompt state; fingerprints contain no retained tool payloads. */
export interface HealthState {
  retries: number
  waitMs: number
  lastFingerprint?: string
  repeats: number
  stopped?: string
}

/** Hash JSON-compatible boundary data with stable object-key order; throws on cycles. */
export function canonicalHash(value: unknown): string {
  const json = JSON.stringify(value, (_key, item) => {
    if (item === null || typeof item !== "object" || Array.isArray(item)) return item
    return Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b)))
  })
  if (json === undefined) throw new Error("Non-JSON tool payload")
  return createHash("sha256").update(json).digest("hex")
}

/** Charge a proposed retry before scheduling; returns a sanitized terminal reason. */
export function retryDecision(state: HealthState, attempt: number, delay: number): string | undefined {
  state.retries = Math.max(state.retries + 1, attempt)
  if (!Number.isFinite(delay) || delay < 0) return "invalid provider retry delay"
  const projectedWait = state.waitMs + delay
  if (state.retries >= 3 || projectedWait >= 60_000) {
    return `provider retry budget reached (decisions=${state.retries}, projectedWaitMs=${projectedWait})`
  }
  state.waitMs = projectedWait
}

/** Count consecutive identical tool/input/outcome fingerprints; changed evidence resets. */
export function toolDecision(state: HealthState, fingerprint: string): string | undefined {
  state.repeats = state.lastFingerprint === fingerprint ? state.repeats + 1 : 1
  state.lastFingerprint = fingerprint
  if (state.repeats >= 3) return "three consecutive identical tool/input/outcome fingerprints"
}
