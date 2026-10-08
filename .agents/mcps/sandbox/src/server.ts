#!/usr/bin/env -S bun --no-env-file
import { z } from "zod@4"
import { randomUUID } from "node:crypto"
import { McpServer } from "@modelcontextprotocol/sdk@1/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk@1/server/stdio.js"
import { acquireSchema, execSchema, type Owner, tokenSchema } from "./contracts"
import { DockerRuntime } from "./docker"
import { hostInstructions, registerHostTools } from "./host"
import { ContainerManager } from "./manager"

const instance = randomUUID()
const manager = new ContainerManager(new DockerRuntime(instance), instance)
const server = new McpServer(
  { name: "sandbox", version: "3.0.0" },
  {
    instructions:
      hostInstructions +
      " For a clean Linux environment or another local Linux image, use " +
      "container_acquire, container_exec, container_release. Acquire without workspace mounts no host files. " +
      "Pass the returned container handle to exec/release. Each exec automatically refreshes inactivity expiry. " +
      "Expired or missing container? Simply acquire a new one. No renew/status/attach workflow. " +
      "Containers default to no network and non-root execution with bounded writable scratch. " +
      "Obtain human permission before increasing budgets or exposing writable host files/network. " +
      "A command timeout/output overflow destroys only its container; workspace writes are not rolled back.",
  },
)
registerHostTools(server)

const outputSchema = { ok: z.boolean(), data: z.unknown().optional(), error: z.string().optional() }
function owner(context: { _meta?: Record<string, unknown> }): Owner {
  const session = context._meta?.["ai.opencode/sessionID"]
  return {
    session: typeof session === "string" && session.length ? session : `transport:${instance}`,
  }
}
async function respond(action: () => Promise<unknown>) {
  let output: { ok: boolean; data?: unknown; error?: string }
  try {
    const data = await action()
    output = { ok: true, data }
    if (data && typeof data === "object" && "exitCode" in data) {
      const result = data as { exitCode: number | null; termination: string; error?: string }
      if (result.exitCode !== 0 || result.termination !== "exited" || result.error) {
        output.ok = false
        output.error =
          result.error ??
          `Command ${result.termination}; exit code ${result.exitCode ?? "unavailable"}. Inspect preserved streams.`
      }
    }
  } catch (error) {
    output = { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
  return {
    structuredContent: output,
    content: [{ type: "text" as const, text: JSON.stringify(output) }],
    isError: !output.ok,
  }
}
server.registerTool(
  "container_acquire",
  {
    description:
      "Start a lightweight isolated Linux sandbox. Default: clean writable /workspace scratch, no host mounts/network. Requires an already-local trusted Linux image; default mcr.microsoft.com/devcontainers/base:ubuntu, never pulled automatically. Optional image selects another Linux distribution; optional workspace explicitly binds host files (ro by default). Returns data.container for exec/release. Inactivity expiry and cleanup are automatic.",
    inputSchema: acquireSchema.shape,
    outputSchema,
  },
  (input, context) => respond(() => manager.acquire(acquireSchema.parse(input), owner(context))),
)
server.registerTool(
  "container_exec",
  {
    description:
      "Execute command using the acquired container handle. Automatically refreshes idle lifetime; no renewal required. Non-root /workspace, bounded time/output, separate streams and exact exit code. Missing/expired? Acquire a new container. Timeout/output overflow destroys this container.",
    inputSchema: execSchema.shape,
    outputSchema,
  },
  (input, context) => respond(() => manager.exec(execSchema.parse(input), owner(context))),
)
server.registerTool(
  "container_release",
  {
    description:
      "Finish and remove your container. Idempotent; safe after expiry. Idle containers also expire automatically. Cleanup failure is reported and can be retried; host workspace writes are not rolled back.",
    inputSchema: { container: tokenSchema },
    outputSchema,
  },
  ({ container }, context) => respond(() => manager.release(container, owner(context))),
)

const transport = new StdioServerTransport()
// WHY: global — one stdio server owns its sweep/shutdown lifecycle.
let sweeping = false
const timer = setInterval(() => {
  if (sweeping) return
  sweeping = true
  void manager
    .sweep()
    .catch((error) => console.error("Container cleanup failed:", error.message))
    .finally(() => {
      sweeping = false
    })
}, 1000)
timer.unref()
let closing: Promise<void> | undefined
function close(): Promise<void> {
  if (closing) return closing
  clearInterval(timer)
  closing = manager
    .close()
    .catch((error) => {
      console.error("Container shutdown incomplete; expiry fallback remains:", error.message)
      process.exitCode = 1
    })
    .finally(() => transport.close())
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
