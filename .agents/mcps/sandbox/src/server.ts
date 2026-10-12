#!/usr/bin/env -S bun --no-env-file
import { z } from "zod@4"
import { randomUUID } from "node:crypto"
import { McpServer } from "@modelcontextprotocol/sdk@1/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk@1/server/stdio.js"
import { acquireSchema, DEFAULT_IMAGE, execSchema, type Owner, tokenSchema } from "./contracts"
import { ContainerCliRuntime } from "./docker"
import { detectEngine } from "./engine"
import { hostInstructions, registerHostTools } from "./host"
import { ContainerManager } from "./manager"

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
const CONTAINER_INSTRUCTIONS =
  "For a clean Linux environment or another local Linux image, use " +
  "container_acquire, container_exec, container_release. Acquire without workspace mounts no host files. " +
  "Pass the returned container handle to exec/release. Each exec automatically refreshes inactivity expiry. " +
  "Expired or missing container? Simply acquire a new one. No renew/status/attach workflow. " +
  "Containers default to no network and non-root execution with bounded writable scratch. " +
  "Obtain human permission before increasing budgets or exposing writable host files/network. " +
  "Output volume has no limit: complete stdout/stderr are always retained in the private cache and bounded previews point to those files. " +
  "A command timeout or an output-cache failure destroys only its container; workspace writes are not rolled back."

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
// Container tools exist only with a startup-selected engine; input/output
// contracts are unchanged from the previous Docker-only server.
if (engine !== undefined && manager !== undefined) {
  server.registerTool(
    "container_acquire",
    {
      description:
        `Start a lightweight isolated Linux sandbox. Default: clean writable /workspace scratch, no host mounts/network. ` +
        `Default image ${DEFAULT_IMAGE}; missing images are pulled automatically from the registry using normal engine credentials before container creation — ` +
        `image fetch uses the host network, separate from the container workload network which remains none by default. ` +
        `Optional image selects another Linux distribution; optional workspace explicitly binds host files (ro by default). ` +
        `Returns data.container for exec/release. Inactivity expiry and cleanup are automatic.`,
      inputSchema: acquireSchema.shape,
      outputSchema,
    },
    (input, context) => respond(() => manager.acquire(acquireSchema.parse(input), owner(context))),
  )
  server.registerTool(
    "container_exec",
    {
      description:
        "Execute command using the acquired container handle. Automatically refreshes idle lifetime; no renewal required. Non-root /workspace, bounded time, separate streams and exact exit code. Complete output is always retained in the private cache with bounded previews; stdoutPath/stderrPath and byte counts point to the raw files. Missing/expired? Acquire a new container. Timeout or output-cache failure destroys this container.",
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
          .catch((error) => console.error("Container cleanup failed:", error.message))
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
      console.error("Container shutdown incomplete; expiry fallback remains:", error.message)
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
