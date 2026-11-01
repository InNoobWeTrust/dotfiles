import type { McpServer } from "@modelcontextprotocol/sdk@1/server/mcp.js"
import {
  caps,
  normalizeLocations,
  positionParams,
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

export function registerDefinitionTool(server: McpServer, context: ToolContext) {
  server.registerTool(
    "definition",
    {
      description:
        "Go-to-definition at a 1-based position. Returns a one-element array with the selected server's path:line:col locations and preview lines.",
      inputSchema: positionShape,
      annotations: readOnly,
    },
    async ({ file: target, line, character }) => {
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
          "definitionProvider",
          "textDocument/definition",
          acquired.session.name,
        )
        const position = toLspPosition(acquired.content, { line, character })
        const found = normalizeLocations(
          await acquired.session.client.call(
            "textDocument/definition",
            positionParams(acquired.file.uri, position),
          ),
        )
        const digest = await locationDigest(acquired.file.root, found, caps.definition)
        return result([
          providerResult(
            acquired.session.recipeId,
            found.length === 0
              ? { ...digest, note: "No definition found at this position." }
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
