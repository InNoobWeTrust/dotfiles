import type { McpServer } from "@modelcontextprotocol/sdk@1/server/mcp.js"
import {
  hoverText,
  positionParams,
  requireCapability,
} from "../../language-service/protocol/semantics.ts"
import type { AcquiredSession } from "../../language-service/sessions.ts"
import { toLspPosition } from "../../workspace/edits.ts"
import {
  error,
  lspFailure,
  positionShape,
  providerFailure,
  providerResult,
  readOnly,
  result,
  type ToolContext,
  validateTarget,
} from "./context.ts"

export function registerHoverTool(server: McpServer, context: ToolContext) {
  server.registerTool(
    "hover",
    {
      description:
        "Hover documentation/type text at a 1-based position. Returns a one-element array with the selected server's trimmed text.",
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
          "hoverProvider",
          "textDocument/hover",
          acquired.session.name,
        )
        const position = toLspPosition(acquired.content, { line, character })
        const text = hoverText(
          await acquired.session.client.call(
            "textDocument/hover",
            positionParams(acquired.file.uri, position),
          ),
        )
        return result([
          providerResult(
            acquired.session.recipeId,
            text ? { hover: text } : { hover: "", note: "No hover information at this position." },
            "pull",
          ),
        ])
      } catch (cause) {
        return result([providerFailure(acquired.session.recipeId, cause)])
      }
    },
  )
}
