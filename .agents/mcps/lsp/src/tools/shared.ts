import { z } from "zod@4"
import { readFile } from "node:fs/promises"
import type { AstGrep } from "../ast-grep.ts"
import { absoluteFromUri, displayUri, within } from "../paths.ts"
import { caps, clamp, type LocationEntry, locationText } from "../semantics.ts"
import type { SessionManager } from "../sessions.ts"

/** Dependencies shared by every tool registration. */
export interface ToolContext {
  cwd: string
  sessions: SessionManager
  astGrep: AstGrep
}

export const result = (value: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(value ?? null) }],
})

export const error = (cause: unknown) => ({
  ...result({ error: cause instanceof Error ? cause.message : String(cause) }),
  isError: true,
})

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
