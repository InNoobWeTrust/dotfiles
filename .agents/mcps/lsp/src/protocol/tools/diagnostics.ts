import type { McpServer } from "@modelcontextprotocol/sdk@1/server/mcp.js"
import { caps, diagnosticsDigest } from "../../language-service/protocol/semantics.ts"
import { displayUri } from "../../workspace/paths.ts"
import { error, fileShape, readOnly, result, type ToolContext } from "./context.ts"

export function registerDiagnosticsTool(server: McpServer, context: ToolContext) {
  server.registerTool(
    "diagnostics",
    {
      description:
        "Diagnostics for a file. Pull servers are asked directly; push servers use the cache, waiting briefly for a fresh publish after a sync. Reports its source.",
      inputSchema: fileShape,
      annotations: readOnly,
    },
    async ({ file: target }) => {
      try {
        const acquired = await context.sessions.acquire(target)
        const diagnostics = await context.sessions.diagnosticsFor(acquired)
        const digest = diagnosticsDigest(
          acquired.file.uri,
          diagnostics.items,
          (uri) => displayUri(acquired.file.root, uri),
          caps.diagnostics,
        )
        return result({
          ...digest,
          source: diagnostics.source,
          ...(diagnostics.note ? { note: diagnostics.note } : {}),
        })
      } catch (cause) {
        return error(cause)
      }
    },
  )
}
