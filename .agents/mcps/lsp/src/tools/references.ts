import { z } from "zod@4"
import type { McpServer } from "@modelcontextprotocol/sdk@1/server/mcp.js"
import { toLspPosition } from "../edits.ts"
import { caps, normalizeLocations, referencesParams, requireCapability } from "../semantics.ts"
import {
  error,
  locationDigest,
  positionShape,
  readOnly,
  result,
  type ToolContext,
} from "./shared.ts"

export function registerReferencesTool(server: McpServer, context: ToolContext) {
  server.registerTool(
    "references",
    {
      description:
        "Find references for a 1-based file position. Returns compact path:line:col locations with preview lines; include_declaration defaults to true.",
      inputSchema: {
        ...positionShape,
        include_declaration: z
          .boolean()
          .default(true)
          .describe("Include the declaration itself in the results."),
      },
      annotations: readOnly,
    },
    async ({ file: target, line, character, include_declaration }) => {
      try {
        const acquired = await context.sessions.acquire(target)
        requireCapability(
          acquired.session.client.capabilities,
          "referencesProvider",
          "textDocument/references",
          acquired.session.name,
        )
        const position = toLspPosition(acquired.content, { line, character })
        const found = normalizeLocations(
          await acquired.session.client.call(
            "textDocument/references",
            referencesParams(acquired.file.uri, position, include_declaration),
          ),
        )
        const digest = await locationDigest(acquired.file.root, found, caps.references)
        return result(
          found.length === 0
            ? { ...digest, note: "No references found at this position." }
            : digest,
        )
      } catch (cause) {
        return error(cause)
      }
    },
  )
}
