import { z } from "zod@4"
import type { McpServer } from "@modelcontextprotocol/sdk@1/server/mcp.js"
import { applyWorkspaceEdit } from "../edits.ts"
import { formattingParams, requireCapability } from "../semantics.ts"
import { error, fileShape, mutating, result, type ToolContext } from "./shared.ts"

export function registerFormatTool(server: McpServer, context: ToolContext) {
  server.registerTool(
    "format",
    {
      description:
        "Format a whole file: validates the language server's edits and APPLIES them to disk, then reports changed files. Null or empty results mean no changes.",
      inputSchema: {
        ...fileShape,
        tab_size: z
          .number()
          .int()
          .min(1)
          .default(2)
          .describe("Indentation width sent to the server."),
        insert_spaces: z.boolean().default(true).describe("true sends spaces, false sends tabs."),
      },
      annotations: mutating,
    },
    async ({ file: target, tab_size, insert_spaces }) => {
      try {
        const acquired = await context.sessions.acquire(target)
        requireCapability(
          acquired.session.client.capabilities,
          "documentFormattingProvider",
          "textDocument/formatting",
          acquired.session.name,
        )
        const edits = await acquired.session.client.call(
          "textDocument/formatting",
          formattingParams(acquired.file.uri, { tabSize: tab_size, insertSpaces: insert_spaces }),
        )
        if (!Array.isArray(edits) || edits.length === 0)
          return result({
            applied: false,
            note: "The language server returned no formatting changes.",
          })
        const applied = await applyWorkspaceEdit(
          context.cwd,
          { changes: { [acquired.file.uri]: edits } },
          { synced: (uri) => context.sessions.syncedContent(uri) },
        )
        await context.sessions.notifyModified(
          applied.files.map((file) => ({ uri: file.uri, content: file.after })),
        )
        return result({
          applied: true,
          files: applied.files.map((file) => ({
            file: file.display,
            edits: file.edits.length,
            changed: file.after !== file.before,
          })),
          operations: applied.operations.map(({ kind, file, from, to }) => ({
            kind,
            file,
            from,
            to,
          })),
          totalEdits: applied.totalEdits,
        })
      } catch (cause) {
        return error(cause)
      }
    },
  )
}
