import { z } from "zod@4"
import type { McpServer } from "@modelcontextprotocol/sdk@1/server/mcp.js"
import {
  caps,
  normalizeLocations,
  referencesParams,
  requireCapability,
} from "../../language-service/protocol/semantics.ts"
import type { AcquiredSession } from "../../language-service/sessions.ts"
import { toLspPosition } from "../../workspace/edits.ts"
import {
  error,
  locationDigest,
  lspFailure,
  positionShape,
  providerFailure,
  providerResult,
  readOnly,
  result,
  type ToolContext,
  validateTarget,
} from "./context.ts"

export function registerReferencesTool(server: McpServer, context: ToolContext) {
  server.registerTool(
    "references",
    {
      description:
        "Find references at a 1-based position. Returns a one-element array with the selected server's path:line:col locations and preview lines; include_declaration defaults to true.",
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
        const validated = await validateTarget(context.cwd, target)
        toLspPosition(validated.content, { line, character })
      } catch (cause) {
        return error(cause)
      }
      let acquired: AcquiredSession
      try {
        acquired = await context.sessions.acquire(target)
      } catch (cause) {
        return result([lspFailure(cause)])
      }
      try {
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
        return result([
          providerResult(
            acquired.session.recipeId,
            found.length === 0
              ? { ...digest, note: "No references found at this position." }
              : digest,
            "pull",
          ),
        ])
      } catch (cause) {
        return result([providerFailure(acquired.session.recipeId, cause)])
      }
    },
  )
}
