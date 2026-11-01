import { z } from "zod@4"
import type { McpServer } from "@modelcontextprotocol/sdk@1/server/mcp.js"
import { caps, diagnosticsDigest } from "../../language-service/protocol/semantics.ts"
import type { AcquiredSession } from "../../language-service/sessions.ts"
import type { ProviderResult } from "../../quality/contracts.ts"
import { displayUri } from "../../workspace/paths.ts"
import {
  badArgumentError,
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

export function registerDiagnosticsTool(server: McpServer, context: ToolContext) {
  server.registerTool(
    "diagnostics",
    {
      description:
        "Diagnostics for a file as one array: the selected server's row first, then one row per applicable native linter. Filter CLI tools with tools, force a server, or raise timeoutMs for slow project checks.",
      inputSchema: {
        ...fileShape,
        server: z.string().min(1).optional().describe("Optional installed recipe ID to force."),
        tools: z
          .array(z.string().min(1))
          .optional()
          .describe(
            "Optional native tool IDs to run (e.g. ruff, eslint); defaults to all applicable.",
          ),
        timeoutMs: z
          .number()
          .int()
          .positive()
          .optional()
          .describe("Optional per-tool timeout in milliseconds; no upper clamp."),
      },
      annotations: readOnly,
    },
    async ({ file: target, server: serverId, tools, timeoutMs }) => {
      let resolved: Awaited<ReturnType<typeof validateTarget>>
      try {
        resolved = await validateTarget(context.cwd, target)
      } catch (cause) {
        return error(cause)
      }
      const rows: ProviderResult[] = []
      let acquired: AcquiredSession | undefined
      try {
        acquired = await context.sessions.acquire(target, serverId ? { server: serverId } : {})
      } catch (cause) {
        if (badArgumentError(cause) && serverId !== undefined) return error(cause)
        rows.push(lspFailure(cause))
      }
      if (acquired) {
        try {
          const diagnostics = await context.sessions.diagnosticsFor(acquired)
          const digest = diagnosticsDigest(
            acquired.file.uri,
            diagnostics.items,
            (uri) => displayUri(acquired.file.root, uri),
            caps.diagnostics,
          )
          rows.push(
            providerResult(
              acquired.session.recipeId,
              {
                ...digest,
                source: diagnostics.source,
                ...(diagnostics.note ? { note: diagnostics.note } : {}),
              },
              diagnostics.source,
            ),
          )
        } catch (cause) {
          rows.push(providerFailure(acquired.session.recipeId, cause))
        }
      }
      try {
        rows.push(
          ...(await context.quality.runAll(resolved.path, resolved.root, {
            ...(tools ? { tools } : {}),
            ...(timeoutMs !== undefined ? { timeoutMs } : {}),
          })),
        )
      } catch (cause) {
        rows.push(providerFailure("quality-runner", cause))
      }
      return result(rows)
    },
  )
}
