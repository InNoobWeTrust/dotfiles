import { z } from "zod@4"
import type { McpServer } from "@modelcontextprotocol/sdk@1/server/mcp.js"
import { renameParams, requireCapability } from "../../language-service/protocol/semantics.ts"
import { applyWorkspaceEdit, toLspPosition } from "../../workspace/edits.ts"
import { error, mutating, positionShape, result, type ToolContext } from "./context.ts"

export function registerRenameTool(server: McpServer, context: ToolContext) {
  server.registerTool(
    "rename",
    {
      description:
        "Semantic rename at a 1-based position: validates the language server's WorkspaceEdit and APPLIES it to disk in order, including create/rename/delete file operations. Reports changed files and applied operations.",
      inputSchema: {
        ...positionShape,
        new_name: z.string().min(1).describe("Replacement identifier to rename to."),
      },
      annotations: mutating,
    },
    async ({ file: target, line, character, new_name }) => {
      try {
        const acquired = await context.sessions.acquire(target)
        requireCapability(
          acquired.session.client.capabilities,
          "renameProvider",
          "textDocument/rename",
          acquired.session.name,
        )
        const position = toLspPosition(acquired.content, { line, character })
        const edit = await acquired.session.client.call(
          "textDocument/rename",
          renameParams(acquired.file.uri, position, new_name),
        )
        if (edit === null || edit === undefined)
          return result({ applied: false, note: "The language server returned no rename edits." })
        const applied = await applyWorkspaceEdit(context.cwd, edit, {
          synced: (uri) => context.sessions.syncedContent(uri),
        })
        await context.sessions.forget(applied.operations.flatMap((operation) => operation.uris))
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
