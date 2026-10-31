import { z } from "zod@4"
import type { McpServer } from "@modelcontextprotocol/sdk@1/server/mcp.js"
import { caps, workspaceSymbolDigest } from "../../language-service/protocol/semantics.ts"
import { displayUri } from "../../workspace/paths.ts"
import { error, readOnly, result, type ToolContext } from "./context.ts"

export function registerWorkspaceSymbolsTool(server: McpServer, context: ToolContext) {
  server.registerTool(
    "workspace_symbols",
    {
      description:
        "Workspace-wide symbol search by query. Pass file (or server) to pick a server; with no session warm and exactly one server installed, that one is used.",
      inputSchema: {
        query: z.string().min(1).describe("Query text, e.g. a symbol name or prefix."),
        file: z
          .string()
          .min(1)
          .optional()
          .describe("Optional workspace file hint; also starts/syncs that server."),
        server: z.string().min(1).optional().describe("Optional installed recipe ID to force."),
      },
      annotations: readOnly,
    },
    async ({ query, file: target, server: serverId }) => {
      try {
        const found = await context.sessions.workspaceSymbols({
          query,
          file: target,
          server: serverId,
        })
        const root = await context.sessions.root()
        return result(
          workspaceSymbolDigest(found.items, (uri) => displayUri(root, uri), caps.workspaceSymbols),
        )
      } catch (cause) {
        return error(cause)
      }
    },
  )
}
