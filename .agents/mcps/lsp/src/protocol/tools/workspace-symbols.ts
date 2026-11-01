import { z } from "zod@4"
import type { McpServer } from "@modelcontextprotocol/sdk@1/server/mcp.js"
import { caps, workspaceSymbolDigest } from "../../language-service/protocol/semantics.ts"
import { displayUri } from "../../workspace/paths.ts"
import {
  badArgumentError,
  error,
  lspFailure,
  providerResult,
  readOnly,
  result,
  type ToolContext,
  validateTarget,
} from "./context.ts"

export function registerWorkspaceSymbolsTool(server: McpServer, context: ToolContext) {
  server.registerTool(
    "workspace_symbols",
    {
      description:
        "Workspace-wide symbol search by query. Returns a one-element array with the selected server's matches; pass file (or server) to pick a server.",
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
      if (target !== undefined) {
        try {
          await validateTarget(context.cwd, target)
        } catch (cause) {
          return error(cause)
        }
      }
      try {
        const found = await context.sessions.workspaceSymbols({
          query,
          file: target,
          server: serverId,
        })
        const root = await context.sessions.root()
        const digest = workspaceSymbolDigest(
          found.items,
          (uri) => displayUri(root, uri),
          caps.workspaceSymbols,
        )
        return result([providerResult(found.session.recipeId, digest, "pull")])
      } catch (cause) {
        if (badArgumentError(cause)) return error(cause)
        return result([lspFailure(cause)])
      }
    },
  )
}
