import type { McpServer } from "@modelcontextprotocol/sdk@1/server/mcp.js"
import { displayUri } from "../paths.ts"
import { caps, requireCapability, symbolDigest } from "../semantics.ts"
import { error, fileShape, readOnly, result, type ToolContext } from "./shared.ts"

export function registerSymbolsTool(server: McpServer, context: ToolContext) {
  server.registerTool(
    "symbols",
    {
      description:
        "Document symbols for a file, as a compact hierarchical digest with kinds and 1-based selection starts. Starts and syncs the language server automatically.",
      inputSchema: fileShape,
      annotations: readOnly,
    },
    async ({ file: target }) => {
      try {
        const acquired = await context.sessions.acquire(target)
        requireCapability(
          acquired.session.client.capabilities,
          "documentSymbolProvider",
          "textDocument/documentSymbol",
          acquired.session.name,
        )
        const digest = symbolDigest(
          await acquired.session.client.call("textDocument/documentSymbol", {
            textDocument: { uri: acquired.file.uri },
          }),
          acquired.file.uri,
          (uri) => displayUri(acquired.file.root, uri),
          caps.symbols,
        )
        return result(digest)
      } catch (cause) {
        return error(cause)
      }
    },
  )
}
