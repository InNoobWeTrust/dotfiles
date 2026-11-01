import { z } from "zod@4"
import { readFile } from "node:fs/promises"
import {
  caps,
  clamp,
  type LocationEntry,
  locationText,
} from "../../language-service/protocol/semantics.ts"
import type { SessionManager } from "../../language-service/sessions.ts"
import type { ProviderResult, ProviderStatus } from "../../quality/contracts.ts"
import type { QualityRunner } from "../../quality/run.ts"
import type { AstGrep } from "../../syntax-search/ast-grep.ts"
import {
  absoluteFromUri,
  displayUri,
  resolveWorkspacePath,
  type WorkspacePath,
  within,
} from "../../workspace/paths.ts"

/** Dependencies shared by every tool registration. */
export interface ToolContext {
  cwd: string
  sessions: SessionManager
  astGrep: AstGrep
  quality: QualityRunner
}

export const result = (value: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(value ?? null) }],
})

export const error = (cause: unknown) => ({
  ...result({ error: cause instanceof Error ? cause.message : String(cause) }),
  isError: true,
})

export const causeText = (cause: unknown) =>
  cause instanceof Error ? cause.message : String(cause)

/** Wraps an existing LSP digest as one readonly provider row. */
export function providerResult<T>(
  provider: string,
  data: T,
  source: "pull" | "push" | "cache",
): ProviderResult<T> {
  return { provider, mechanism: "lsp", status: "ok", data, evidence: { source } }
}

/** One explicit failure row; never used for path or argument errors. */
export function providerFailure(
  provider: string,
  cause: unknown,
  status: ProviderStatus = "error",
): ProviderResult {
  return {
    provider,
    mechanism: "lsp",
    status,
    evidence: { source: "pull" },
    note: causeText(cause),
  }
}

const missingServer = /^No (?:installed language server|language server recipe)/
const badArgument =
  /^(?:Language server '.*' is not installed|No language server session is warm yet|Several language server sessions are warm|No session is warm and no single server can be inferred)/

/** True for caller mistakes that stay call-level errors instead of provider rows. */
export function badArgumentError(cause: unknown): boolean {
  return badArgument.test(causeText(cause))
}

/** Missing server degrades to not-applicable; launch and capability failures stay errors. */
export function lspFailure(cause: unknown): ProviderResult {
  return providerFailure(
    "lsp",
    cause,
    missingServer.test(causeText(cause)) ? "not-applicable" : "error",
  )
}

/**
 * Resolves and reads the target before any provider work, so containment and
 * unreadable-file failures stay call-level errors rather than provider rows.
 */
export async function validateTarget(
  cwd: string,
  file: string,
): Promise<WorkspacePath & { content: string }> {
  const resolved = await resolveWorkspacePath(cwd, file)
  return { ...resolved, content: await readFile(resolved.path, "utf8") }
}

export const readOnly = { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
export const mutating = { readOnlyHint: false, destructiveHint: true, openWorldHint: false }

export const fileShape = {
  file: z
    .string()
    .min(1)
    .describe("Workspace-relative path; absolute paths inside the workspace are also accepted."),
}

export const positionShape = {
  ...fileShape,
  line: z.number().int().min(1).describe("1-based line number."),
  character: z.number().int().min(1).describe("1-based character offset in UTF-16 code units."),
}

/** Reads up to 30 distinct target files, attaching one clamped preview line per location. */
export async function locationDigest(root: string, found: LocationEntry[], limit: number) {
  const files = new Map<string, string[] | undefined>()
  const locations: Array<{ location: string; preview?: string }> = []
  for (const entry of found.slice(0, limit)) {
    const digest: { location: string; preview?: string } = {
      location: locationText(displayUri(root, entry.uri), entry.start),
    }
    const absolute = absoluteFromUri(entry.uri)
    if (absolute !== undefined && within(root, absolute) && files.size < 30) {
      if (!files.has(entry.uri)) {
        files.set(
          entry.uri,
          await readFile(absolute, "utf8").then(
            (content) => content.split(/\r\n|\n|\r/),
            () => undefined,
          ),
        )
      }
      const lines = files.get(entry.uri)
      const text = lines?.[entry.start.line]
      if (text !== undefined) digest.preview = clamp(text.trim(), caps.preview)
    }
    locations.push(digest)
  }
  return { locations, totalLocations: found.length, truncated: found.length > limit }
}
