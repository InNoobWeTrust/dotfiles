#!/usr/bin/env -S bun --no-env-file
/** Composition, startup discovery/instructions and stdio lifetime. */
import { McpServer } from "@modelcontextprotocol/sdk@1/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk@1/server/stdio.js"
import { createDelegateRun, DEPTH_ENV, MAX_DEPTH } from "./execution/run.ts"
import { resolveWorkdir } from "./execution/workdir.ts"
import { assertRegistryInvariants } from "./harnesses/catalog/registry.ts"
import { detectHarnesses } from "./harnesses/discovery/detect.ts"
import { createInspectionGate } from "./harnesses/discovery/inspection.ts"
import { listModels } from "./harnesses/discovery/models.ts"
import { createDiscoveryState } from "./harnesses/discovery/state.ts"
import { onceAsync } from "./lifecycle.ts"
import { registerDelegateTools } from "./protocol/tools.ts"

// A malformed registry entry would misbuild argv for a real delegated turn, so
// it stops the server here rather than surfacing as one odd command line later.
assertRegistryInvariants()

const launchDirectory = process.cwd()

function readDepth(raw: string | undefined): number {
  const parsed = Number.parseInt(raw ?? "", 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0
}

const depth = readDepth(process.env[DEPTH_ENV])

const inspectionGate = createInspectionGate()
const initialSnapshot = await detectHarnesses({
  cwd: launchDirectory,
  env: process.env,
  gate: inspectionGate,
})

const { getSnapshot, performRefresh, waitForRefresh } = createDiscoveryState({
  launchDirectory,
  inspectionGate,
  initialSnapshot,
})

// --- Instructions ---

function instructions(): string {
  const names = initialSnapshot.detected.map((h) => h.spec.id)
  const headline =
    names.length === 0
      ? "External AI subagent delegation is available, but no CLI was configured at startup. Use delegate_status for current readiness and refusal reasons."
      : `Spawn an external AI subagent for one bounded task. Configured CLI workers at startup: ${names.join(", ")}. Use delegate_status for current readiness.`
  return [
    headline,
    "delegate_run executes exactly one non-interactive turn in a detached process group and returns that external AI subagent's final message as the result; nothing is chained or shared between subagents.",
    "Choose between configured external workers and native subagents by task suitability, capabilities, interface needs and observed availability. No harness or provider has a fixed priority. Keep tightly coupled work with the main agent.",
    "delegate_status discovers configured CLI IDs, readiness, permissions and OpenCode Zen base-model hints whose name or ID contains 'free' (case-insensitive). Use delegate_models with harness and optional literal text filter to explicitly list OpenCode or AGY selectors; pass an exact selector as delegate_run.model. Other models are never automatically listed. Hints are name matches, not verified pricing, access or quota. Status is authoritative for readiness; these instructions remain a startup snapshot. Pass refresh:true after account/config changes; discovery runs no model task.",
    "The prompt supplies the goal, the necessary context, the allowed actions, the exact paths, the acceptance criteria, and the output format. No parent conversation, follow-up question, or resumable session is supplied, so the subagent sees only your prompt and cannot ask one.",
    "AGY and Codex can generate images through their native image-generation capabilities when available for the installed CLI and account; readiness does not verify image access or headless support. Before delegating image generation to agy or codex, obtain an explicit absolute output file path from the caller if missing, and include it in the prompt. Require the worker to save the image there and return the actual absolute path, or report a capability/save failure without claiming success. Delegate returns text and retained streams, not image attachments. Existing permission, quota, billing and service-terms constraints still apply; capability is not authorization.",
    "Use the 900000 ms (15-minute) whole-turn default for substantive AGY work unless task evidence justifies another bound. Include CLI startup, model/tool round trips, internal swarm coordination and synthesis, not only one model response. A fast model does not imply a two-minute end-to-end task. Shorter deadlines need a concrete task-specific reason; a caller-imposed timeout alone does not establish a broken route. Prompt effort guidance must fit inside the actual wallTimeMs; writing a longer budget in the prompt does not change the runner deadline.",
    "For non-AGY harnesses, default keeps native policy (not read-only isolation), acceptEdits permits unattended edits, and bypassPermissions requires explicit human permission. Scope the prompt instead of raising authority; the child cannot be supervised from here once it starts.",
    "AGY is configured to ALWAYS pass --mode accept-edits --dangerously-skip-permissions for every permissionMode, including read-only tasks. Use AGY only within authorization for this all-tool autoapproval profile; permissionMode cannot restrict it. agySandbox:true independently adds --sandbox; false/omitted adds no sandbox flag and does not disable saved settings. No settings are edited. Terminal restrictions do not make native tools/MCP read-only. Check outcome and retained stderr even on exit 0; answered is not proof of task completion. Do not silently downgrade independent research to synthesis of supplied excerpts.",
    "Raising wallTimeMs can raise cost, since a longer turn keeps a model session alive. Inline previews are fixed at 64 KiB combined by the server; original stdoutPath/stderrPath are always returned, even for small output. Output size never limits generation or execution lifetime.",
    `Delegation depth is ${depth} of a maximum ${MAX_DEPTH}; a nested server refuses further hops to stop runaway chains.`,
    "Output volume never kills a delegated turn. Oversized replies are preserved in private XDG cache files; truncated means the inline preview is shortened, so read stdoutPath and stderrPath for the original output. Wall-clock expiry, cache IO failure or request cancellation stops the process group and is reported explicitly; cancellation sends SIGINT, then SIGKILL after the grace period if needed. Those files contain only output captured before the stop. Cache files are retained until the user removes them.",
  ].join(" ")
}

const server = new McpServer(
  { name: "delegate", version: "1.0.0" },
  { instructions: instructions() },
)

const delegateRun = createDelegateRun({
  depth,
  launchDirectory,
  inspectionGate,
  getSnapshot,
  waitForRefresh,
  resolveWorkdir: (workdir) => resolveWorkdir(server, workdir, launchDirectory),
})

// --- Tool registration ---

registerDelegateTools(server, {
  getSnapshot,
  performRefresh,
  delegateRun,
  delegateModels: async (input) => {
    const cwd = await resolveWorkdir(server, input.workdir, launchDirectory)
    return listModels(input, { cwd, env: process.env, gate: inspectionGate })
  },
  depth,
  maxDepth: MAX_DEPTH,
})

// --- Transport and shutdown ---

const transport = new StdioServerTransport()
// Detached harness process groups are deliberately left alone: a turn already
// paid for should be allowed to finish instead of being cut off mid-edit.
const close = onceAsync(() => transport.close())
server.server.onclose = () => {
  void close()
}
for (const event of ["end", "close", "error"] as const) {
  process.stdin.once(event, () => {
    void close()
  })
}
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
