import type { McpServer } from "@modelcontextprotocol/sdk@1/server/mcp.js"
import { registerAstGrepSearchTool } from "./ast-grep-search.ts"
import { registerDefinitionTool } from "./definition.ts"
import { registerDiagnosticsTool } from "./diagnostics.ts"
import { registerFormatTool } from "./format.ts"
import { registerHoverTool } from "./hover.ts"
import { registerReferencesTool } from "./references.ts"
import { registerRenameTool } from "./rename.ts"
import { registerRequestTool } from "./request.ts"
import type { ToolContext } from "./shared.ts"
import { registerSymbolsTool } from "./symbols.ts"
import { registerWorkspaceSymbolsTool } from "./workspace-symbols.ts"

/** Registers every task-facing MCP tool. Each tool lives in its own module. */
export function registerTools(server: McpServer, context: ToolContext) {
  registerDefinitionTool(server, context)
  registerReferencesTool(server, context)
  registerHoverTool(server, context)
  registerSymbolsTool(server, context)
  registerDiagnosticsTool(server, context)
  registerWorkspaceSymbolsTool(server, context)
  registerRenameTool(server, context)
  registerFormatTool(server, context)
  registerRequestTool(server, context)
  registerAstGrepSearchTool(server, context)
}
