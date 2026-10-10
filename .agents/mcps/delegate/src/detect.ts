import { type InspectionOptions, inspectReadiness, type ReadinessResult } from "./readiness.ts"
import { HARNESSES, type HarnessSpec } from "./registry.ts"

export interface DetectedHarness {
  spec: HarnessSpec
  executable: string
  version: string | null
  readiness: "configured"
  reason: string
  models: string[]
}

export interface UnavailableHarness {
  id: string
  executable: string | null
  readiness: "missing" | "not_configured" | "unknown"
  reason: string
}

export interface DetectionResult {
  detected: DetectedHarness[]
  unavailable: UnavailableHarness[]
}

export type WhichFn = (name: string) => string | null

/** PATH lookup that also resolves the platform's executable extensions. */
export const defaultWhich: WhichFn = (name) => Bun.which(name) ?? null

export interface DetectOptions {
  harnesses?: HarnessSpec[]
  which?: WhichFn
  cwd?: string
  env?: NodeJS.ProcessEnv
  inspect?: (
    spec: HarnessSpec,
    executable: string,
    options: InspectionOptions,
  ) => Promise<ReadinessResult>
}

const INSPECTION_CONCURRENCY = 2
const NESTED_INSPECTION_REASON =
  "Readiness inspection is already running in this process tree; skipping nested readiness probes until the outer startup check finishes."

/** First candidate binary name that resolves on PATH, or null when none do. */
export function locate(spec: HarnessSpec, which: WhichFn = defaultWhich): string | null {
  for (const binary of spec.binaries) {
    const found = which(binary)
    if (found) return found
  }
  return null
}

/**
 * Resolve every supported harness against PATH, then inspect only the binaries
 * that exist. A binary on PATH is not enough to advertise a harness: it must
 * prove local readiness through a dedicated non-model status check.
 */
export async function detectHarnesses(options: DetectOptions = {}): Promise<DetectionResult> {
  const harnesses = options.harnesses ?? HARNESSES
  const which = options.which ?? defaultWhich
  const cwd = options.cwd ?? process.cwd()
  const env = options.env ?? process.env
  const inspect = options.inspect ?? inspectReadiness

  const found = harnesses.map((spec) => ({ spec, executable: locate(spec, which) }))
  const present = found.filter(
    (entry): entry is { spec: HarnessSpec; executable: string } => entry.executable !== null,
  )

  const inspected = new Map<string, ReadinessResult>()
  if (env.DELEGATE_INSPECTION === undefined) {
    for (let index = 0; index < present.length; index += INSPECTION_CONCURRENCY) {
      const chunk = present.slice(index, index + INSPECTION_CONCURRENCY)
      const ready = await Promise.all(
        chunk.map(
          async (entry) =>
            [entry.spec.id, await inspect(entry.spec, entry.executable, { cwd, env })] as const,
        ),
      )
      for (const [id, result] of ready) inspected.set(id, result)
    }
  }

  const detected: DetectedHarness[] = []
  const unavailable: UnavailableHarness[] = []

  for (const entry of found) {
    if (entry.executable === null) {
      unavailable.push({
        id: entry.spec.id,
        executable: null,
        readiness: "missing",
        reason: `no binary named ${entry.spec.binaries.join(" or ")} on PATH`,
      })
      continue
    }

    if (env.DELEGATE_INSPECTION !== undefined) {
      unavailable.push({
        id: entry.spec.id,
        executable: entry.executable,
        readiness: "unknown",
        reason: NESTED_INSPECTION_REASON,
      })
      continue
    }

    const readiness = inspected.get(entry.spec.id)
    if (!readiness) {
      unavailable.push({
        id: entry.spec.id,
        executable: entry.executable,
        readiness: "unknown",
        reason:
          "Readiness inspection did not return a result; rerun the startup check to verify this harness.",
      })
      continue
    }

    if (readiness.readiness === "configured") {
      detected.push({
        spec: entry.spec,
        executable: entry.executable,
        version: null,
        readiness: "configured",
        reason: readiness.reason,
        models: readiness.models,
      })
      continue
    }

    unavailable.push({
      id: entry.spec.id,
      executable: entry.executable,
      readiness: readiness.readiness,
      reason: readiness.reason,
    })
  }

  return { detected, unavailable }
}
