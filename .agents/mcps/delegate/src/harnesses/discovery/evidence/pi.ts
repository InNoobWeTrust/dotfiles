/** Pi readiness evidence from the native model table. */
import type { InspectionOptions } from "../inspection.ts"
import { createProbe, isCleanExit } from "../inspection.ts"

export interface PiReadinessResult {
  readiness: "configured" | "unknown"
  reason: string
  models: string[]
}

const HEADER = ["provider", "model", "context", "max-out", "thinking", "images"]
const UNKNOWN =
  "Pi readiness is unknown: --list-models returned no populated model table; inspect `pi --list-models` manually."
const CONFIGURED =
  "Pi --list-models returned a populated model table; provider access still depends on configured credentials. The probe runs idempotent migrations as a side effect."

export function parsePiListModels(stdout: string): boolean {
  const lines = stdout.split(/\r?\n/).filter((line) => line.trim())
  const header = lines.findIndex((line) => {
    const fields = line.trim().split(/\s{2,}/)
    return fields.length === 6 && fields.every((field, i) => field === HEADER[i])
  })
  return (
    header >= 0 && lines.slice(header + 1).some((line) => line.trim().split(/\s{2,}/).length === 6)
  )
}

export async function inspectPi(
  executable: string,
  options: InspectionOptions,
): Promise<PiReadinessResult> {
  const probe = createProbe(executable, options)
  const run = await probe(["--list-models", "--offline", "--no-extensions", "--no-mcp"])
  if (!run || !isCleanExit(run) || !parsePiListModels(run.stdout))
    return { readiness: "unknown", reason: UNKNOWN, models: [] }
  return { readiness: "configured", reason: CONFIGURED, models: [] }
}
