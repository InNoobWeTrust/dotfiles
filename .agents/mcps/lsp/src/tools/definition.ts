import type { McpServer } from "@modelcontextprotocol/sdk@1/server/mcp.js"
import { toLspPosition } from "../edits.ts"
import { caps, normalizeLocations, positionParams, requireCapability } from "../semantics.ts"
import {
  error,
  locationDigest,
  positionShape,
  readOnly,
  result,
  type ToolContext,
} from "./shared.ts"

export function registerDefinitionTool(server: McpServer, context: ToolContext) {
  server.registerTool(
    "definition",
    {
      description:
        "Go-to-definition for a 1-based file position. Returns compact path:line:col locations with preview lines. Starts and syncs the language server automatically.",
      inputSchema: positionShape,
      annotations: readOnly,
    },
    async ({ file: target, line, character }) => {
      try {
        const acquired = await context.sessions.acquire(target)
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
        return result(
          found.length === 0
            ? { ...digest, note: "No definition found at this position." }
            : digest,
        )
      } catch (cause) {
        return error(cause)
      }
    },
  )
}
