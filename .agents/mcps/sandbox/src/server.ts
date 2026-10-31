#!/usr/bin/env -S bun --no-env-file
/** Compose host/container tools and own the startup engine snapshot, sweeper, transport and shutdown. */
import { randomUUID } from "node:crypto"
import { McpServer } from "@modelcontextprotocol/sdk@1/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk@1/server/stdio.js"
import { ContainerManager } from "./containers/manager"
import { CONTAINER_INSTRUCTIONS, registerContainerTools } from "./containers/protocol/tools"
import { ContainerCliRuntime } from "./containers/runtime/cli"
import { detectEngine } from "./containers/runtime/engine"
import { preserveFailure } from "./execution/diagnostics"
import { hostInstructions, registerHostTools } from "./host/protocol/tools"

const instance = randomUUID()
// Startup snapshot: one probe before initialize keeps instructions, the tool
// catalog, and lifecycle pinned to the same engine (Podman, then Docker). With
// neither usable the server stays host-only; there is no later engine fallback.
const engine = await detectEngine()
const manager =
  engine === undefined
    ? undefined
    : new ContainerManager(new ContainerCliRuntime(instance, engine), instance)

// Agent instructions are scoped blocks: the host block is always present and
// the container block is appended only when its tools are registered, so no
// instruction ever references a tool the server does not expose.
const server = new McpServer(
  { name: "sandbox", version: "3.0.0" },
  {
    instructions:
      `<host_sandbox>\n${hostInstructions}\n</host_sandbox>` +
      (engine === undefined
        ? ""
        : `\n<container_sandbox engine="${engine}">\n` +
          `${CONTAINER_INSTRUCTIONS}\n</container_sandbox>`),
  },
)
registerHostTools(server)

// Container tools exist only with a startup-selected engine. Failure envelopes add private trace references.
if (engine !== undefined && manager !== undefined) {
  registerContainerTools(server, manager, instance)
}

const transport = new StdioServerTransport()
// WHY: global — one stdio server owns its sweep/shutdown lifecycle.
let sweeping = false
const timer =
  manager === undefined
    ? undefined
    : setInterval(() => {
        if (sweeping) return
        sweeping = true
        void manager
          .sweep()
          .catch((error) => {
            console.error(
              "Container cleanup failed:",
              JSON.stringify(preserveFailure("container sweep", error)),
            )
          })
          .finally(() => {
            sweeping = false
          })
      }, 1000)
timer?.unref()
let closing: Promise<void> | undefined
function close(): Promise<void> {
  if (closing) return closing
  if (timer !== undefined) clearInterval(timer)
  // Shutdown stays safe and idempotent with or without a manager.
  closing = Promise.resolve(
    manager?.close().catch((error) => {
      console.error(
        "Container shutdown incomplete; expiry fallback remains:",
        JSON.stringify(preserveFailure("container close", error)),
      )
      process.exitCode = 1
    }),
  ).finally(() => transport.close())
  return closing
}
server.server.onclose = () => {
  void close()
}
for (const event of ["end", "close", "error"] as const)
  process.stdin.once(event, () => {
    void close()
  })
process.stdout.once("error", () => {
  void close()
})
process.once("SIGTERM", () => {
  void close()
})
process.once("SIGINT", () => {
  void close()
})
await server.connect(transport)
