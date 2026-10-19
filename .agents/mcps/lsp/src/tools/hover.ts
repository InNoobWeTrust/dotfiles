import type { McpServer } from "@modelcontextprotocol/sdk@1/server/mcp.js"
import { toLspPosition } from "../edits.ts"
import { hoverText, positionParams, requireCapability } from "../semantics.ts"
import { error, positionShape, readOnly, result, type ToolContext } from "./shared.ts"

export function registerHoverTool(server: McpServer, context: ToolContext) {
  server.registerTool(
    "hover",
    {
      description:
        "Hover documentation/type text for a 1-based file position. Returns trimmed text; starts and syncs the language server automatically.",
      inputSchema: positionShape,
      annotations: readOnly,
    },
    async ({ file: target, line, character }) => {
      try {
        const acquired = await context.sessions.acquire(target)
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
        return result(
          text ? { hover: text } : { hover: "", note: "No hover information at this position." },
        )
      } catch (cause) {
        return error(cause)
      }
    },
  )
}
