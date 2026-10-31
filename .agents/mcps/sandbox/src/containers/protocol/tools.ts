/** Container MCP instructions, owner binding and failure envelopes over the shared lease manager. */
import { z } from "zod@4"
import type { McpServer } from "@modelcontextprotocol/sdk@1/server/mcp.js"
import type { TraceReference } from "../../execution/contracts.ts"
import { preserveFailure } from "../../execution/diagnostics.ts"
import {
  acquireSchema,
  DEFAULT_IMAGE,
  type ExecResult,
  execSchema,
  type Owner,
  tokenSchema,
} from "../contracts.ts"
import type { ContainerManager } from "../manager.ts"

export const CONTAINER_INSTRUCTIONS =
  "For a clean Linux environment or another local Linux image, use " +
  "container_acquire, container_exec, container_release. Acquire without workspace mounts no host files. " +
  "Pass the returned container handle to exec/release. Each exec automatically refreshes inactivity expiry. " +
  "Expired or missing container? Simply acquire a new one. No renew/status/attach workflow. " +
  "Containers default to no network and non-root execution with bounded writable scratch. " +
  "Obtain human permission before increasing budgets or exposing writable host files/network. " +
  "Output volume has no limit: complete stdout/stderr are always retained in the private cache and bounded previews point to those files. " +
  "A command timeout or an output-cache failure destroys only its container; workspace writes are not rolled back."

const outputSchema = {
  ok: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  tracePath: z.string().nullable().optional(),
  traceError: z.string().optional(),
}
async function respond(operation: string, action: () => Promise<unknown>) {
  let output: { ok: boolean; data?: unknown; error?: string } & Partial<TraceReference>
  try {
    const data = await action()
    output = { ok: true, data }
    if (data && typeof data === "object" && "exitCode" in data) {
      const result = data as ExecResult
      if (result.tracePath !== undefined) output.tracePath = result.tracePath
      if (result.traceError !== undefined) output.traceError = result.traceError
      if (result.exitCode !== 0 || result.termination !== "exited" || result.error) {
        output.ok = false
        output.error =
          result.error ??
          `Command ${result.termination}; exit code ${result.exitCode ?? "unavailable"}. Inspect preserved streams.`
      }
    }
  } catch (error) {
    output = {
      ok: false,
      // Manager errors expose fixed public messages; raw runtime exceptions are in their causes only.
      error:
        error instanceof Error
          ? error.message
          : "Sandbox operation failed; inspect the private trace.",
      ...preserveFailure(operation, error),
    }
  }
  return {
    structuredContent: output,
    content: [{ type: "text" as const, text: JSON.stringify(output) }],
    isError: !output.ok,
  }
}

export function registerContainerTools(
  server: McpServer,
  manager: ContainerManager,
  instance: string,
): void {
  function owner(context: { _meta?: Record<string, unknown> }): Owner {
    const session = context._meta?.["ai.opencode/sessionID"]
    return {
      session: typeof session === "string" && session.length ? session : `transport:${instance}`,
    }
  }
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
    (input, context) =>
      respond("container_acquire", () =>
        manager.acquire(acquireSchema.parse(input), owner(context)),
      ),
  )
  server.registerTool(
    "container_exec",
    {
      description:
        "Execute command using the acquired container handle. Automatically refreshes idle lifetime; no renewal required. Non-root /workspace, bounded time, separate streams and exact exit code. Complete output is always retained in the private cache with bounded previews; stdoutPath/stderrPath and byte counts point to the raw files. Missing/expired? Acquire a new container. Timeout or output-cache failure destroys this container.",
      inputSchema: execSchema.shape,
      outputSchema,
    },
    (input, context) =>
      respond("container_exec", () => manager.exec(execSchema.parse(input), owner(context))),
  )
  server.registerTool(
    "container_release",
    {
      description:
        "Finish and remove your container. Idempotent; safe after expiry. Idle containers also expire automatically. Cleanup failure is reported and can be retried; host workspace writes are not rolled back.",
      inputSchema: { container: tokenSchema },
      outputSchema,
    },
    ({ container }, context) =>
      respond("container_release", () => manager.release(container, owner(context))),
  )
}
