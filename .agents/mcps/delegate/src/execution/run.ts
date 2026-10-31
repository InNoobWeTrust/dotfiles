/** Prepares delegated turns, owns concurrency slots and invokes process/outcome owners. */
import { INLINE_OUTPUT_BYTES } from "../../../shared/output/capture.ts"
import { assertArgv, harnessById } from "../harnesses/catalog/registry.ts"
import type { DetectionResult } from "../harnesses/discovery/detect.ts"
import type { InspectionGate } from "../harnesses/discovery/inspection.ts"
import { inspectReadiness } from "../harnesses/discovery/readiness.ts"
import {
  DEFAULT_WALL_TIME_MS,
  type DelegateOutput,
  delegateRunSchema,
  MAX_PROMPT_BYTES,
} from "../protocol/contracts.ts"
import { completeTurn } from "./outcome.ts"
import { runProcess } from "./process/execute.ts"

/** Carries the delegation chain depth from a parent server into its children. */
export const DEPTH_ENV = "DELEGATE_DEPTH"
/**
 * A delegated harness gets the same MCP configuration, so it could delegate
 * again. Two hops is deep enough for useful fan-out and shallow enough that a
 * runaway chain stops on its own.
 */
export const MAX_DEPTH = 2
/** Concurrent delegated turns in this server. Each one is a real model session. */
const MAX_CONCURRENT = 6

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

/**
 * These harnesses read project-local configuration (opencode), require a git
 * repo (codex), or enforce workspace trust (cursor), so a different workdir
 * needs its own readiness probe within the same aggregate deadline.
 */
const WORKDIR_SENSITIVE_IDS = new Set<string>(["opencode", "codex", "cursor"])

interface DelegateRunContext {
  depth: number
  launchDirectory: string
  inspectionGate: InspectionGate
  getSnapshot: () => DetectionResult
  waitForRefresh: () => Promise<void>
  resolveWorkdir: (workdir?: string) => Promise<string>
}

interface DelegateRunScope extends DelegateRunContext {
  withSlot: <T>(action: () => Promise<T>) => Promise<T>
}

export function createDelegateRun(
  context: DelegateRunContext,
): (rawInput: unknown, signal?: AbortSignal) => Promise<DelegateOutput> {
  const { depth, launchDirectory, inspectionGate, getSnapshot, waitForRefresh, resolveWorkdir } =
    context
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

  return delegateRun.bind(undefined, {
    depth,
    launchDirectory,
    inspectionGate,
    getSnapshot,
    waitForRefresh,
    resolveWorkdir,
    withSlot,
  })
}

async function delegateRun(
  {
    depth,
    launchDirectory,
    inspectionGate,
    getSnapshot,
    waitForRefresh,
    resolveWorkdir,
    withSlot,
  }: DelegateRunScope,
  rawInput: unknown,
  signal?: AbortSignal,
): Promise<DelegateOutput> {
  signal?.throwIfAborted()
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

  const cwd = await resolveWorkdir(input.workdir)

  // Readiness gate: the harness must be in the current snapshot.
  const detectedHarness = getSnapshot().detected.find((h) => h.spec.id === input.harness)
  if (!detectedHarness) {
    const unavailable = getSnapshot().unavailable.find((h) => h.id === input.harness)
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
      gate: inspectionGate,
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
          "Use delegate_models with a text filter to inspect selectors. Leave 'model' unset to use the harness default.",
      )
    }
  }

  const argv = spec.buildArgs(input, cwd)
  // The startup probe runs each builder without a model; a builder can behave
  // differently once one is supplied, so the real command line is checked too.
  assertArgv(spec, argv, input.prompt)

  return withSlot(async () => {
    // Preparation above may await refresh, workdir resolution or inspection.
    // Do not launch a turn if its MCP request was cancelled in the meantime.
    signal?.throwIfAborted()
    const result = await runProcess(detectedHarness.executable, argv, {
      cwd,
      env: childEnv(depth + 1),
      wallTimeMs: input.wallTimeMs ?? DEFAULT_WALL_TIME_MS,
      maxOutputBytes: INLINE_OUTPUT_BYTES,
      signal,
    })

    return await completeTurn({
      result,
      harness: spec.id,
      executable: detectedHarness.executable,
      cwd,
      argv,
      prompt: input.prompt,
      promptBytes,
      depth: depth + 1,
    })
  })
}
