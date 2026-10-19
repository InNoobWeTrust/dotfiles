import { z } from "zod@4"
import type { McpServer } from "@modelcontextprotocol/sdk@1/server/mcp.js"
import { error, mutating, result, type ToolContext } from "./shared.ts"

export function registerRequestTool(server: McpServer, context: ToolContext) {
  server.registerTool(
    "request",
    {
      description:
        "Advanced raw LSP escape hatch: send one native JSON-RPC request. Pass file (and optionally server) to start/sync first, or server alone for a warm/named session. Managed sync/lifecycle methods are rejected.",
      inputSchema: {
        method: z.string().min(1).describe("Native LSP method, e.g. textDocument/signatureHelp."),
        params: z.unknown().optional().describe("Raw LSP params, passed through unchanged."),
        file: z
          .string()
          .min(1)
          .optional()
          .describe("File to start/sync before sending the request."),
        server: z.string().min(1).optional().describe("Installed recipe ID to force."),
      },
      annotations: mutating,
    },
    async ({ method, params, file: target, server: serverId }) => {
      try {
        return result(
          await context.sessions.request({ method, params, file: target, server: serverId }),
        )
      } catch (cause) {
        return error(cause)
      }
    },
  )
}
