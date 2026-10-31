/** MCP tool registration, response envelopes and public status projection. */

import { z } from "zod@4"
import type { McpServer } from "@modelcontextprotocol/sdk@1/server/mcp.js"
import { DelegatedTurnError } from "../execution/errors.ts"
import type { DetectionResult } from "../harnesses/discovery/detect.ts"
import { supportsModelListing } from "../harnesses/discovery/models.ts"
import {
  type DelegateOutput,
  delegateOutputSchema,
  delegateRunSchema,
  type ModelsInput,
  type ModelsOutput,
  modelsInputSchema,
  modelsOutputSchema,
  resultEnvelope,
  type StatusOutput,
  statusOutputSchema,
} from "./contracts.ts"

export interface DelegateToolHandlers {
  getSnapshot: () => DetectionResult
  performRefresh: () => Promise<void>
  delegateRun: (rawInput: unknown, signal?: AbortSignal) => Promise<DelegateOutput>
  delegateModels: (input: ModelsInput) => Promise<ModelsOutput>
  depth: number
  maxDepth: number
}

export function registerDelegateTools(server: McpServer, handlers: DelegateToolHandlers): void {
  server.registerTool(
    "delegate_status",
    {
      description:
        "Discover configured external AI subagents, readiness, permission modes and OpenCode Zen base-model hints whose display name or native ID contains 'free' (case-insensitive). This is not price verification or a billing guarantee. Hints are not the full catalog or a quota/access guarantee; use delegate_models for explicit model discovery. Status is authoritative for readiness; startup instructions are not regenerated. Pass refresh:true after account/config changes; discovery runs no model task.",
      inputSchema: {
        refresh: z
          .boolean()
          .optional()
          .default(false)
          .describe(
            "Re-run startup detection and return the updated snapshot; the server's startup instructions are not regenerated. Concurrent callers share one detection run. Default false.",
          ),
      },
      outputSchema: resultEnvelope(statusOutputSchema),
    },
    (input) =>
      respond(async () => {
        if (input.refresh) await handlers.performRefresh()
        return statusData(handlers.getSnapshot(), handlers.depth, handlers.maxDepth)
      }),
  )

  server.registerTool(
    "delegate_models",
    {
      description:
        "Explicitly inspect available model selectors for OpenCode or AGY, with optional literal case-insensitive text filtering and pagination. Does not run a model or enable delegation. Each call gets a fresh snapshot; returned selectors can be passed to delegate_run.model. Unsupported discovery and failed inspection return errors, distinct from a valid empty catalog.",
      inputSchema: modelsInputSchema.shape,
      outputSchema: resultEnvelope(modelsOutputSchema),
    },
    (input) => respond(() => handlers.delegateModels(input)),
  )

  server.registerTool(
    "delegate_run",
    {
      description:
        "Spawn an external AI subagent for one bounded task and return its result. Choose external workers or native subagents by task suitability, capabilities, interface needs and observed availability, without a fixed harness or provider priority. Check delegate_status first. Supply a self-contained prompt: no parent chat, follow-up or resumable session is provided. Output size never ends a turn: oversized replies have bounded inline previews and full XDG cache paths to read. Wall-clock expiry, capture failure or client cancellation can return partial output; cancellation sends SIGINT to the process group and escalates to SIGKILL after the grace period if needed.",
      inputSchema: delegateRunSchema.shape,
      outputSchema: resultEnvelope(delegateOutputSchema),
    },
    (input, extra) => respond(() => handlers.delegateRun(input, extra.signal)),
  )
}

async function respond(action: () => Promise<unknown>) {
  let output: { ok: boolean; data?: unknown; error?: string }
  try {
    output = { ok: true, data: await action() }
  } catch (error) {
    if (error instanceof DelegatedTurnError) {
      // Execution failure: retain the partial DelegateOutput alongside the error.
      output = { ok: false, data: error.data, error: error.message }
    } else {
      output = { ok: false, error: error instanceof Error ? error.message : String(error) }
    }
  }
  return {
    structuredContent: output,
    content: [{ type: "text" as const, text: JSON.stringify(output) }],
    isError: !output.ok,
  }
}

function statusData(snapshot: DetectionResult, depth: number, maxDepth: number): StatusOutput {
  return statusOutputSchema.parse({
    ok: snapshot.detected.length > 0,
    harnesses: snapshot.detected.map((entry) => ({
      id: entry.spec.id,
      executable: entry.executable,
      version: entry.version,
      readiness: entry.readiness,
      reason: entry.reason,
      models: entry.spec.id === "opencode" ? (entry.modelHints ?? []) : [],
      modelHintsState:
        entry.spec.id === "opencode" ? (entry.modelHintsState ?? "unknown") : "not_applicable",
      modelListing: supportsModelListing(entry.spec.id) ? "supported" : "unsupported",
      permissionModes: entry.spec.permissionModes,
      modelSupported: entry.spec.modelSupported,
      depth: depth + 1,
    })),
    unsupported: snapshot.unavailable.map((entry) => ({
      id: entry.id,
      executable: entry.executable,
      readiness: entry.readiness,
      reason: entry.reason,
    })),
    maxDepth,
    depth,
  })
}
