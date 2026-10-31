#!/usr/bin/env -S bun

/**
 * Host MCP instructions and registration; workdir/launch/process effects live below this protocol boundary.
 * Both expose host files for reading; this is not a clean hostile-code environment.
 * Exposes mode-specific tools across MCP-compatible AI agent harnesses:
 * Claude Code, OpenAI Codex, Google Antigravity (AGY), OpenCode, Cursor, and Kilo.
 */

import type { McpServer } from "@modelcontextprotocol/sdk@1/server/mcp.js"
import type { CallToolResult } from "@modelcontextprotocol/sdk@1/types.js"
import { executeSandbox } from "../launch/execute.ts"
import { resolveWorkdir } from "../launch/workdir.ts"
import {
  defaultLimits,
  inputSchema,
  limitsSchema,
  outputSchema,
  type ResourceLimits,
  type SandboxMode,
  type SandboxOutput,
} from "./contracts.ts"

export const hostInstructions =
  "Use sandbox_ro for read-only commands needing network, sandbox_pure for offline checks, and sandbox_rw only for intentional, authorized workspace writes. " +
  "Tools accept command and optional absolute workdir; shells never load login profiles. " +
  "Without workdir, use one client-provided MCP directory root, or the server launch directory when roots are unsupported or empty. " +
  "Multiple or unusable roots require explicit workdir. Results report the chosen directory and source; launch-directory inference is not verified agent context. " +
  "Specify workdir whenever the default is uncertain, especially for sandbox_rw. Use $TMPDIR for scratch/cache writes. " +
  "On a restriction or unavailable backend, inspect and report the failure; do not retry unsandboxed or escalate to rw just to make a read-only command pass. " +
  "Resource budgets apply to every invocation. Investigate boundary failures before retrying; obtain human permission before raising budgets, then pass explicit limits for that invocation. " +
  "The MCP applies requested budgets; human approval belongs to the calling harness and conversation, not an MCP approval flag. " +
  "Host files and inherited environment remain readable: never dump secrets or treat this as hostile-code isolation. Native read/edit tools do not need wrapping. " +
  "Output volume has no limit: complete stdout/stderr are always retained in the private cache, and bounded previews point to those files."

const tools: { name: string; mode: SandboxMode; description: string }[] = [
  {
    name: "sandbox_ro",
    mode: "ro",
    description:
      "Read-only host/workspace with network access: inspections and queries needing network.",
  },
  {
    name: "sandbox_pure",
    mode: "pure",
    description:
      "Offline read-only host/workspace: git status/diff, searches, and non-mutating checks without network.",
  },
  {
    name: "sandbox_rw",
    mode: "rw",
    description:
      "Authorized workspace writes with network access: builds, edits, and bounded side effects. The resolved workdir becomes writable; specify it if uncertain.",
  },
]

export function registerHostTools(server: McpServer): void {
  for (const { name, mode, description } of tools) {
    server.registerTool(
      name,
      {
        description: `${description} Non-login shell, writable scratch at $TMPDIR. Resource budgets always apply; limits overrides affect only this invocation and require human permission when raising budgets. Synchronous commands only; remaining process-group children are targeted for termination and cleanup failures are reported. Host files/environment remain readable; not hostile-code isolation. Investigate denials; never silently retry unrestricted.`,
        inputSchema,
        outputSchema,
      },
      async ({ command, workdir, limits: overrides }): Promise<CallToolResult> => {
        let output: SandboxOutput
        let cwd: string | null = null
        let source: string | null = null
        let limits: ResourceLimits | undefined
        try {
          limits = limitsSchema.parse({ ...defaultLimits, ...overrides })
          const resolved = await resolveWorkdir(server, workdir)
          cwd = resolved.cwd
          source = resolved.source
          const result = await executeSandbox(command, mode, cwd, limits)
          output = { ...result, workdir: cwd, workdirSource: source }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err)
          output = {
            exitCode: null,
            stdoutPath: null,
            stderrPath: null,
            stdoutBytes: 0,
            stderrBytes: 0,
            stdout: "",
            stderr: "",
            workdir: cwd,
            workdirSource: source,
            error: `Sandbox request failed: ${message}. No command executed.`,
            ...(limits ? { limits } : {}),
            limitsApplied: false,
            termination: "setup_error",
          }
        }
        return {
          structuredContent: output,
          // MCP recommends serialized JSON for clients without structured output support.
          content: [{ type: "text", text: JSON.stringify(output) }],
          isError:
            output.exitCode !== 0 || output.error !== undefined || output.termination === "timeout",
        }
      },
    )
  }
}
