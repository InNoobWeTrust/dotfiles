import type { McpServer } from "@modelcontextprotocol/sdk@1/server/mcp.js"
import { astGrepInput } from "../../syntax-search/ast-grep.ts"
import { error, readOnly, result, type ToolContext } from "./context.ts"

export function registerAstGrepSearchTool(server: McpServer, context: ToolContext) {
  server.registerTool(
    "ast_grep_search",
    {
      description:
        "Read-only polyglot AST search via an installed ast-grep >=0.51 CLI (never sg), no LSP needed. Returns native matches/byte ranges/metavariables and optional CLI-rendered rewrite previews; never edits. Syntax matching, NOT semantic rename. Availability/version problems are reported here. Explicit workspace paths, exactly one pattern or kind. 30s/4MiB stdout/64KiB stderr; one request at a time.",
      inputSchema: astGrepInput,
      annotations: readOnly,
    },
    async (input) => {
      try {
        return result(await context.astGrep.search(input))
      } catch (cause) {
        return error(cause)
      }
    },
  )
}
