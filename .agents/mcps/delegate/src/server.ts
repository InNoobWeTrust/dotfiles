#!/usr/bin/env -S bun --no-env-file
import { z } from "zod@4"
import { createReadStream } from "node:fs"
import { McpServer } from "@modelcontextprotocol/sdk@1/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk@1/server/stdio.js"
import { INLINE_OUTPUT_BYTES } from "../../shared/output.ts"

import {
  DEFAULT_WALL_TIME_MS,
  type DelegateOutput,
  delegateOutputSchema,
  delegateRunSchema,
  MAX_PROMPT_BYTES,
  resultEnvelope,
  type StatusOutput,
  statusOutputSchema,
} from "./contracts.ts"
import { type DetectionResult, detectHarnesses } from "./detect.ts"
import { runProcess } from "./execute.ts"
import { onceAsync } from "./lifecycle.ts"
import { inspectReadiness } from "./readiness.ts"
import { assertArgv, assertRegistryInvariants, harnessById } from "./registry.ts"
import { resolveWorkdir } from "./workdir.ts"

const AGY_HEADLESS_DENIAL = [
  /jetski: no output produced/i,
  /headless mode cannot prompt for/i,
  /auto-denied/i,
]

/** Scan retained streams without loading arbitrarily large answers into memory. */
async function streamMatches(path: string | null, patterns: RegExp[]): Promise<boolean> {
  if (path === null) throw new Error("Retained stream unavailable for outcome verification.")
  const matched = patterns.map(() => false)
  let tail = ""
  for await (const chunk of createReadStream(path, { encoding: "utf8" })) {
    const text = tail + chunk
    for (const [index, pattern] of patterns.entries()) {
      matched[index] ||= pattern.test(text)
    }
    if (matched.every(Boolean)) return true
    // Known diagnostic fragments are shorter than this overlap.
    tail = text.slice(-256)
  }
  return false
}

// A malformed registry entry would misbuild argv for a real delegated turn, so
// it stops the server here rather than surfacing as one odd command line later.
assertRegistryInvariants()

const launchDirectory = process.cwd()

/** Carries the delegation chain depth from a parent server into its children. */
const DEPTH_ENV = "DELEGATE_DEPTH"
/**
 * A delegated harness gets the same MCP configuration, so it could delegate
 * again. Two hops is deep enough for useful fan-out and shallow enough that a
 * runaway chain stops on its own.
 */
const MAX_DEPTH = 2
/** Concurrent delegated turns in this server. Each one is a real model session. */
const MAX_CONCURRENT = 6

function readDepth(raw: string | undefined): number {
  const parsed = Number.parseInt(raw ?? "", 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0
}

const depth = readDepth(process.env[DEPTH_ENV])

/**
 * Harnesses authenticate themselves from the user's own config files and API
 * keys, so the child needs the environment it would have had on a terminal. The
 * one thing added is the depth counter.
 */
function childEnv(nextDepth: number): Record<string, string> {
  const env: Record<string, string> = {}
  for (const [key, value] of Object.entries(process.env)) {
    if (value !== undefined) env[key] = value
  }
  env[DEPTH_ENV] = String(nextDepth)
  return env
}

/** Replace the prompt argument so a recorded argv never replays a whole task. */
function redactPrompt(argv: string[], prompt: string): string[] {
  return argv.map((arg) => (arg === prompt ? `<prompt ${Buffer.byteLength(prompt)} bytes>` : arg))
}

let snapshot: DetectionResult = await detectHarnesses({ cwd: launchDirectory, env: process.env })

// --- Singleflight refresh ---

/**
 * Settles with null on success and with the Error on detection failure.
 * Having the error as a resolved value (rather than a rejection) means
 * waitForRefresh can await the same promise without a catch.
 */
type RefreshFlight = Promise<Error | null>
let refreshFlight: RefreshFlight | null = null

/**
 * Ensure at most one detection is running at a time. Every caller gets the
 * same promise so concurrent refreshes share one underlying detection run.
 */
function ensureFlight(): RefreshFlight {
  if (refreshFlight) return refreshFlight
  refreshFlight = detectHarnesses({ cwd: launchDirectory, env: process.env })
    .then((r) => {
      snapshot = r
      return null
    })
    .catch((err) => {
      // Fail closed: clear all configured harnesses so nothing is selectable.
      snapshot = { detected: [], unavailable: [] }
      return err instanceof Error ? err : new Error(String(err))
    })
    .finally(() => {
      refreshFlight = null
    })
  return refreshFlight
}

/**
 * Trigger a refresh; propagates the error if detection fails.
 * Concurrent callers all await the same detection run.
 */
async function performRefresh(): Promise<void> {
  const err = await ensureFlight()
  if (err)
    throw new Error(
      `Harness re-inspection failed; all harnesses cleared. Run delegate_status to retry. Cause: ${err.message}`,
    )
}

/**
 * Wait for any in-progress refresh before proceeding.
 * Used by delegate_run to see the latest snapshot without surfacing refresh errors.
 */
async function waitForRefresh(): Promise<void> {
  if (refreshFlight) await refreshFlight
}

// --- Instructions ---

function instructions(): string {
  const names = snapshot.detected.map((h) => h.spec.id)
  const headline =
    names.length === 0
      ? "External AI subagent delegation is available, but no CLI was configured at startup. Use delegate_status for current readiness and refusal reasons."
      : `Spawn an external AI subagent for one bounded task. Configured CLI workers at startup: ${names.join(", ")}. Use delegate_status for current readiness.`
  return [
    headline,
    "delegate_run executes exactly one non-interactive turn in a detached process group and returns that external AI subagent's final message as the result; nothing is chained or shared between subagents.",
    "Choose between configured external workers and native subagents by task suitability, capabilities, interface needs and observed availability. No harness or provider has a fixed priority. Keep tightly coupled work with the main agent.",
    "delegate_status discovers the configured external AI subagents and their CLI IDs, models, readiness, and permission modes; the status it returns now is authoritative. These instructions are a startup snapshot that a refresh does not regenerate, so pass refresh:true after an account or config change to re-run detection; discovery runs no model task.",
    "The prompt supplies the goal, the necessary context, the allowed actions, the exact paths, the acceptance criteria, and the output format. No parent conversation, follow-up question, or resumable session is supplied, so the subagent sees only your prompt and cannot ask one.",
    "Use the 900000 ms (15-minute) whole-turn default for substantive AGY work unless task evidence justifies another bound. Include CLI startup, model/tool round trips, internal swarm coordination and synthesis, not only one model response. A fast model does not imply a two-minute end-to-end task. Shorter deadlines need a concrete task-specific reason; a caller-imposed timeout alone does not establish a broken route. Prompt effort guidance must fit inside the actual wallTimeMs; writing a longer budget in the prompt does not change the runner deadline.",
    "For non-AGY harnesses, default keeps native policy (not read-only isolation), acceptEdits permits unattended edits, and bypassPermissions requires explicit human permission. Scope the prompt instead of raising authority; the child cannot be supervised from here once it starts.",
    "AGY is configured to ALWAYS pass --mode accept-edits --dangerously-skip-permissions for every permissionMode, including read-only tasks. Use AGY only within authorization for this all-tool autoapproval profile; permissionMode cannot restrict it. agySandbox:true independently adds --sandbox; false/omitted adds no sandbox flag and does not disable saved settings. No settings are edited. Terminal restrictions do not make native tools/MCP read-only. Check outcome and retained stderr even on exit 0; answered is not proof of task completion. Do not silently downgrade independent research to synthesis of supplied excerpts.",
    "Raising wallTimeMs can raise cost, since a longer turn keeps a model session alive. Inline previews are fixed at 64 KiB combined by the server; original stdoutPath/stderrPath are always returned, even for small output. Output size never limits generation or execution lifetime.",
    `Delegation depth is ${depth} of a maximum ${MAX_DEPTH}; a nested server refuses further hops to stop runaway chains.`,
    "Output volume never kills a delegated turn. Oversized replies are preserved in private XDG cache files; truncated means the inline preview is shortened, so read stdoutPath and stderrPath for the original output. Wall-clock expiry or cache IO failure stops the process group and is reported explicitly; those files contain only output captured before the failure. Cache files are retained until the user removes them.",
  ].join(" ")
}

const server = new McpServer(
  { name: "delegate", version: "1.0.0" },
  { instructions: instructions() },
)

// --- Envelope helpers ---

/**
 * Carries DelegateOutput from a failed turn so the envelope can retain the
 * partial data while still setting ok=false and MCP isError=true.
 */
class DelegatedTurnError extends Error {
  constructor(
    public readonly data: DelegateOutput,
    diagnostic?: string,
  ) {
    super(
      diagnostic === undefined ? "Delegated turn failed" : `Delegated turn failed: ${diagnostic}`,
    )
  }
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

// --- Concurrency slot ---

let inFlight = 0
async function withSlot<T>(action: () => Promise<T>): Promise<T> {
  if (inFlight >= MAX_CONCURRENT) {
    throw new Error(
      `${MAX_CONCURRENT} delegated turns are already running in this server. Wait for one to finish instead of starting another.`,
    )
  }
  inFlight += 1
  try {
    return await action()
  } finally {
    inFlight -= 1
  }
}

// --- Status data builder ---

function statusData(): StatusOutput {
  return statusOutputSchema.parse({
    ok: snapshot.detected.length > 0,
    harnesses: snapshot.detected.map((entry) => ({
      id: entry.spec.id,
      executable: entry.executable,
      version: entry.version,
      readiness: entry.readiness,
      reason: entry.reason,
      models: entry.models,
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
    maxDepth: MAX_DEPTH,
    depth,
  })
}

// --- Workdir-sensitive harnesses require re-inspection when cwd changes ---

/**
 * These harnesses read project-local configuration (opencode), require a git
 * repo (codex), or enforce workspace trust (cursor), so a different workdir
 * needs its own readiness probe within the same aggregate deadline.
 */
const WORKDIR_SENSITIVE_IDS = new Set<string>(["opencode", "codex", "cursor"])

// --- delegate_run implementation ---

async function delegateRun(rawInput: unknown): Promise<DelegateOutput> {
  const input = delegateRunSchema.parse(rawInput)
  if (input.agySandbox !== undefined && input.harness !== "agy") {
    throw new Error("agySandbox is supported only by the agy harness.")
  }

  const promptBytes = Buffer.byteLength(input.prompt, "utf8")
  if (promptBytes > MAX_PROMPT_BYTES) {
    throw new Error(
      `The prompt is ${promptBytes} bytes; this server passes it as one command-line argument and accepts at most ${MAX_PROMPT_BYTES}. Shorten it and point the harness at a file instead.`,
    )
  }

  // Wait for any in-progress refresh before reading the snapshot.
  await waitForRefresh()

  // Validate the harness ID against the registry.
  const spec = harnessById(input.harness)
  if (!spec) {
    throw new Error(
      `Unknown harness ID '${input.harness}'. Use delegate_status to list valid harness IDs.`,
    )
  }

  const cwd = await resolveWorkdir(server, input.workdir, launchDirectory)

  // Readiness gate: the harness must be in the current snapshot.
  const detectedHarness = snapshot.detected.find((h) => h.spec.id === input.harness)
  if (!detectedHarness) {
    const unavailable = snapshot.unavailable.find((h) => h.id === input.harness)
    throw new Error(
      unavailable
        ? `Harness '${input.harness}' is not usable (${unavailable.readiness}): ${unavailable.reason}`
        : `Harness '${input.harness}' is not available in the current snapshot. Run delegate_status(refresh:true) to update.`,
    )
  }

  // Depth guard.
  if (depth >= MAX_DEPTH) {
    throw new Error(
      `Delegation depth ${depth} is the configured maximum. This server was started by another delegate, so it will not start a third one. Run the task here instead.`,
    )
  }

  let models = detectedHarness.models
  // Re-inspect workdir-sensitive harnesses when the resolved cwd differs.
  if (WORKDIR_SENSITIVE_IDS.has(spec.id) && cwd !== launchDirectory) {
    const reinspect = await inspectReadiness(spec, detectedHarness.executable, {
      cwd,
      env: process.env,
    })
    if (reinspect.readiness !== "configured") {
      throw new Error(
        `Harness '${spec.id}' is not ready in the resolved workdir '${cwd}' (${reinspect.readiness}): ${reinspect.reason}`,
      )
    }
    models = reinspect.models
  }

  // Model allowlist: when the inspected list is non-empty, only listed models are allowed.
  if (input.model !== undefined && models.length > 0) {
    if (!models.includes(input.model)) {
      throw new Error(
        `Model '${input.model}' is not in the verified model list for harness '${spec.id}'. ` +
          `Supported: ${models.join(", ")}. Leave 'model' unset to use the harness default.`,
      )
    }
  }

  const argv = spec.buildArgs(input, cwd)
  // The startup probe runs each builder without a model; a builder can behave
  // differently once one is supplied, so the real command line is checked too.
  assertArgv(spec, argv, input.prompt)

  return withSlot(async () => {
    const result = await runProcess(detectedHarness.executable, argv, {
      cwd,
      env: childEnv(depth + 1),
      wallTimeMs: input.wallTimeMs ?? DEFAULT_WALL_TIME_MS,
      maxOutputBytes: INLINE_OUTPUT_BYTES,
    })

    const executionOk =
      result.stop === "exited" && result.exitCode === 0 && result.error === undefined
    // Match AGY's actual headless diagnostic, not arbitrary worker prose.
    let blocked =
      spec.id === "agy" && AGY_HEADLESS_DENIAL.every((pattern) => pattern.test(result.stderr))
    let outcome: DelegateOutput["outcome"] = "answered"
    let outcomeError: string | undefined
    let hasAnswer = result.stdoutBytes > 0 && result.stdout.trim() !== ""
    if (executionOk && result.truncated) {
      try {
        if (!hasAnswer && result.stdoutBytes > 0) {
          hasAnswer = await streamMatches(result.stdoutPath, [/\S/u])
        }
        if (spec.id === "agy" && !blocked) {
          blocked = await streamMatches(result.stderrPath, AGY_HEADLESS_DENIAL)
        }
      } catch (error) {
        outcome = "failed"
        outcomeError = `Could not verify retained streams: ${String(error)}`
      }
    }
    if (!executionOk || outcomeError !== undefined) {
      outcome = "failed"
    } else if (blocked) {
      outcome = "blocked"
      outcomeError =
        "AGY headless tool permission was denied. Inspect retained stderr before retrying. With explicit human approval, agySandbox:true enables terminal sandboxing plus ALL-tool autoapproval without editing user settings. Do not silently escalate authority or substitute supplied excerpts for independent research."
    } else if (!hasAnswer) {
      outcome = "empty"
      outcomeError =
        "Harness exited without an answer; task completion is unverified. Inspect the retained streams before retrying."
    }
    const data = delegateOutputSchema.parse({
      // A teardown that could not finish leaves a process running unsupervised, so
      // it fails the turn even when the harness itself exited 0.
      ok: outcome === "answered",
      outcome,
      harness: spec.id,
      executable: detectedHarness.executable,
      exitCode: result.exitCode,
      signal: result.signal,
      stop: result.stop,
      timedOut: result.stop === "wall_time",
      truncated: result.truncated,
      stdoutPath: result.stdoutPath,
      stderrPath: result.stderrPath,
      stdoutBytes: result.stdoutBytes,
      stderrBytes: result.stderrBytes,
      stdout: result.stdout,
      stderr: result.stderr,
      durationMs: result.durationMs,
      workdir: cwd,
      argv: redactPrompt(argv, input.prompt),
      promptBytes,
      depth: depth + 1,
    })

    // Execution failure: wrap with DelegatedTurnError so respond() can retain
    // the partial output alongside ok=false and MCP isError=true.
    if (!data.ok) throw new DelegatedTurnError(data, result.error ?? outcomeError)
    return data
  })
}

// --- Tool registration ---

server.registerTool(
  "delegate_status",
  {
    description:
      "Discover the configured external AI subagents and their CLI IDs, models, readiness, and supported permission modes, plus why a checked CLI cannot serve as one. The status returned now is authoritative; the server's instructions stay a startup snapshot that this refresh does not regenerate. Pass refresh:true to re-run detection after an account or config change without restarting the server; discovery runs no model task.",
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
      if (input.refresh) await performRefresh()
      return statusData()
    }),
)

server.registerTool(
  "delegate_run",
  {
    description:
      "Spawn an external AI subagent for one bounded task and return its result. Choose external workers or native subagents by task suitability, capabilities, interface needs and observed availability, without a fixed harness or provider priority. Check delegate_status first. Supply a self-contained prompt: no parent chat, follow-up or resumable session is provided. Output size never ends a turn: oversized replies have bounded inline previews and full XDG cache paths to read. A hard wall-clock limit or capture failure can return partial output.",
    inputSchema: delegateRunSchema.shape,
    outputSchema: resultEnvelope(delegateOutputSchema),
  },
  (input) => respond(() => delegateRun(input)),
)

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
