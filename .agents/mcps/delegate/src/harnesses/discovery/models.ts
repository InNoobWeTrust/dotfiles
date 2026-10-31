/** Explicit model catalog discovery and context-bounded presentation. */
import { devNull } from "node:os"
import { INLINE_OUTPUT_BYTES } from "../../../../shared/output/capture.ts"
import { type ModelsInput, type ModelsOutput, modelsInputSchema } from "../../protocol/contracts.ts"
import { harnessById } from "../catalog/registry.ts"
import { locate, type WhichFn } from "./detect.ts"
import { evaluateOpenCodeEvidence } from "./evidence/opencode.ts"
import {
  createProbe,
  DiscoveryBusyError,
  type InspectionGate,
  type InspectionOptions,
  isCleanExit,
} from "./inspection.ts"
import { inspectOpenCodeEvidence } from "./readiness.ts"

type ModelRow = ModelsOutput["models"][number]

export function supportsModelListing(harness: string): boolean {
  return harness === "opencode" || harness === "agy"
}

type ListingContext = InspectionOptions & { gate: InspectionGate; which?: WhichFn }

async function discoverRows(
  harness: string,
  executable: string,
  context: ListingContext,
): Promise<ModelRow[]> {
  if (harness === "opencode") {
    const evidence = await inspectOpenCodeEvidence(executable, context)
    if (!evidence)
      throw new Error("INSPECTION_FAILED: OpenCode catalog inspection failed or timed out.")
    const evaluation = evaluateOpenCodeEvidence(evidence)
    if (!evaluation.catalogValid)
      throw new Error("CATALOG_INVALID: OpenCode catalog evidence is incomplete or malformed.")
    return evaluation.catalog
  }
  return context.gate.run(async () => {
    const probe = createProbe(executable, {
      ...context,
      env: { ...context.env, AGY_CLI_DISABLE_AUTO_UPDATE: "true" },
    })
    const run = await probe(["--log-file", devNull, "models"])
    if (!run || !isCleanExit(run))
      throw new Error("INSPECTION_FAILED: AGY catalog inspection failed or timed out.")
    return parseAgyModels(run.stdout)
  })
}

export async function listModels(
  rawInput: ModelsInput,
  context: ListingContext,
): Promise<ModelsOutput> {
  const input = modelsInputSchema.parse(rawInput)
  const spec = harnessById(input.harness)
  if (!spec) throw new Error("UNKNOWN_HARNESS: No registered harness has this ID.")
  if (!supportsModelListing(spec.id))
    throw new Error("LISTING_UNSUPPORTED: This harness has no supported model catalog inspector.")
  const executable = locate(spec, context.which)
  if (!executable)
    throw new Error("HARNESS_MISSING: No executable for this harness was found on PATH.")
  if (context.env.DELEGATE_INSPECTION !== undefined) {
    throw new Error("INSPECTION_FAILED: Nested catalog inspection is disabled.")
  }
  let rows: ModelRow[]
  try {
    rows = await discoverRows(spec.id, executable, context)
  } catch (error) {
    if (error instanceof DiscoveryBusyError) throw error
    if (error instanceof Error && /^(INSPECTION_FAILED|CATALOG_INVALID):/u.test(error.message))
      throw error
    throw new Error("INSPECTION_FAILED: Native catalog inspection could not complete.")
  }
  return presentModels(input, context.cwd, rows)
}

/** Native AGY TSV is treated strictly: format drift is not an empty catalog. */
export function parseAgyModels(stdout: string): ModelRow[] {
  const rows: ModelRow[] = []
  for (const line of stdout.split(/\r?\n/u)) {
    if (line.trim() === "") continue
    const fields = line.split("\t")
    const [selector, label] = fields
    if (
      fields.length !== 2 ||
      !selector ||
      selector.startsWith("-") ||
      /[\s\p{Cc}]/u.test(selector) ||
      !label?.trim() ||
      /\p{Cc}/u.test(label)
    ) {
      throw new Error("CATALOG_INVALID: AGY model listing did not match the expected TSV format.")
    }
    rows.push({ selector, label })
  }
  return rows
}

/** Pagination counts the normalized snapshot, and advances only by delivered rows. */
export function presentModels(input: ModelsInput, cwd: string, rows: ModelRow[]): ModelsOutput {
  const unique = [...new Map(rows.map((row) => [row.selector, row])).values()].sort(
    (left, right) => (left.selector < right.selector ? -1 : left.selector > right.selector ? 1 : 0),
  )
  const text = input.text?.toLowerCase()
  const matched =
    text === undefined
      ? unique
      : unique.filter(
          (row) =>
            row.selector.toLowerCase().includes(text) || row.label?.toLowerCase().includes(text),
        )
  const page: ModelsOutput = {
    harness: input.harness,
    workdir: cwd,
    models: [],
    total: unique.length,
    matched: matched.length,
    offset: input.offset,
    nextOffset: null,
  }
  for (const row of matched.slice(input.offset, input.offset + input.limit)) {
    page.models.push(row)
    const next = input.offset + page.models.length
    page.nextOffset = next < matched.length ? next : null
    if (Buffer.byteLength(JSON.stringify({ ok: true, data: page })) <= INLINE_OUTPUT_BYTES) continue
    page.models.pop()
    if (page.models.length === 0)
      throw new Error("CATALOG_TOO_LARGE: A model row exceeds the response budget.")
    page.nextOffset = input.offset + page.models.length
    break
  }
  if (Buffer.byteLength(JSON.stringify({ ok: true, data: page })) > INLINE_OUTPUT_BYTES) {
    throw new Error("CATALOG_TOO_LARGE: Catalog response metadata exceeds the response budget.")
  }
  return page
}
