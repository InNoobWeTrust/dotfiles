import type { McpServer } from "@modelcontextprotocol/sdk@1/server/mcp.js"
import { caps, requireCapability, symbolDigest } from "../../language-service/protocol/semantics.ts"
import type { AcquiredSession } from "../../language-service/sessions.ts"
import { displayUri } from "../../workspace/paths.ts"
import {
  error,
  fileShape,
  lspFailure,
  providerFailure,
  providerResult,
  readOnly,
  result,
  type ToolContext,
  validateTarget,
} from "./context.ts"

export function registerSymbolsTool(server: McpServer, context: ToolContext) {
  server.registerTool(
    "symbols",
    {
      description:
        "Document outline for a file. Returns a one-element array with the selected server's hierarchical symbol digest.",
      inputSchema: fileShape,
      annotations: readOnly,
    },
    async ({ file: target }) => {
      try {
        await validateTarget(context.cwd, target)
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
        return result([providerResult(acquired.session.recipeId, digest, "pull")])
      } catch (cause) {
        return result([providerFailure(acquired.session.recipeId, cause)])
      }
    },
  )
}
