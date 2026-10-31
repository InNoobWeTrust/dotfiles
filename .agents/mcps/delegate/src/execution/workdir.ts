/** Resolves explicit workdirs and MCP roots against the captured launch directory. */
import { realpath, stat } from "node:fs/promises"
import type { McpServer } from "@modelcontextprotocol/sdk@1/server/mcp.js"

/**
 * Pick the directory a delegated harness runs in.
 *
 * An explicit `workdir` always wins. Otherwise the client's MCP roots are
 * queried on every call, because a long-lived client can switch workspaces while
 * this server keeps running. `launchDirectory` is the last resort.
 */
export async function resolveWorkdir(
  server: McpServer,
  workdir: string | undefined,
  launchDirectory: string,
): Promise<string> {
  let directory = workdir ?? launchDirectory
  if (!workdir && server.server.getClientCapabilities()?.roots) {
    const { roots } = await server.server.listRoots({}, { timeout: 5_000 })
    if (roots.length > 1) {
      throw new Error(
        "The client exposed more than one MCP root. Pass an absolute 'workdir' to say which one to use.",
      )
    }
    if (roots.length === 1) {
      const uri = new URL(roots[0].uri)
      if (uri.protocol !== "file:" || (uri.hostname && uri.hostname !== "localhost")) {
        throw new Error("The MCP root is not a local file URI. Pass an absolute 'workdir' instead.")
      }
      directory = Bun.fileURLToPath(uri)
    }
  }
  const cwd = await realpath(directory)
  if (!(await stat(cwd)).isDirectory()) {
    throw new Error("'workdir' must name an existing directory. No harness was started.")
  }
  return cwd
}
