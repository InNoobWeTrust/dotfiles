/** Resolve invocation roots; capture the server launch directory eagerly, before startup engine probing. */
import { realpath, stat } from "node:fs/promises"
import type { McpServer } from "@modelcontextprotocol/sdk@1/server/mcp.js"

const launchDirectory = process.cwd()

export async function resolveWorkdir(
  server: McpServer,
  workdir?: string,
): Promise<{ cwd: string; source: string }> {
  let directory = workdir ?? launchDirectory
  let source = workdir
    ? "explicit workdir"
    : "inferred server launch directory; client roots unsupported"
  if (!workdir && server.server.getClientCapabilities()?.roots) {
    // Query on every invocation: a long-lived client can switch workspaces.
    const { roots } = await server.server.listRoots({}, { timeout: 5000 })
    if (roots.length > 1)
      throw new Error("Multiple MCP roots; provide an absolute workdir. No command executed.")
    if (roots.length === 1) {
      const uri = new URL(roots[0].uri)
      if (uri.protocol !== "file:" || (uri.hostname && uri.hostname !== "localhost")) {
        throw new Error("MCP root is not a local file URI; provide an absolute workdir.")
      }
      directory = Bun.fileURLToPath(uri)
      source = "client MCP root"
    } else {
      source = "inferred server launch directory; client roots empty"
    }
  }
  const cwd = await realpath(directory)
  if (!(await stat(cwd)).isDirectory())
    throw new Error("workdir/MCP root must be an existing directory; provide an absolute workdir.")
  return { cwd, source }
}
