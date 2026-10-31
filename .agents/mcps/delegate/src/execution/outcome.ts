/** Classifies retained process output and constructs the delegated-turn result. */
import { createReadStream } from "node:fs"
import { type DelegateOutput, delegateOutputSchema } from "../protocol/contracts.ts"
import { DelegatedTurnError } from "./errors.ts"
import type { RunResult } from "./process/execute.ts"

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

/** Replace the prompt argument so a recorded argv never replays a whole task. */
function redactPrompt(argv: string[], prompt: string): string[] {
  return argv.map((arg) => (arg === prompt ? `<prompt ${Buffer.byteLength(prompt)} bytes>` : arg))
}

export async function completeTurn(context: {
  result: RunResult
  harness: string
  executable: string
  cwd: string
  argv: string[]
  prompt: string
  promptBytes: number
  depth: number
}): Promise<DelegateOutput> {
  const { result, harness, executable, cwd, argv, prompt, promptBytes, depth } = context
  const executionOk =
    result.stop === "exited" && result.exitCode === 0 && result.error === undefined
  // Match AGY's actual headless diagnostic, not arbitrary worker prose.
  let blocked =
    harness === "agy" && AGY_HEADLESS_DENIAL.every((pattern) => pattern.test(result.stderr))
  let outcome: DelegateOutput["outcome"] = "answered"
  let outcomeError: string | undefined
  let hasAnswer = result.stdoutBytes > 0 && result.stdout.trim() !== ""
  if (executionOk && result.truncated) {
    try {
      if (!hasAnswer && result.stdoutBytes > 0) {
        hasAnswer = await streamMatches(result.stdoutPath, [/\S/u])
      }
      if (harness === "agy" && !blocked) {
        blocked = await streamMatches(result.stderrPath, AGY_HEADLESS_DENIAL)
      }
    } catch (error) {
      outcome = "failed"
      outcomeError = `Could not verify retained streams: ${String(error)}`
    }
  }
  if (!executionOk || outcomeError !== undefined) {
    outcome = "failed"
    if (result.stop === "cancelled") {
      outcomeError = "Delegated run was cancelled by the MCP client; partial output is retained."
    }
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
    harness,
    executable,
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
    argv: redactPrompt(argv, prompt),
    promptBytes,
    depth,
  })

  // Execution failure: wrap with DelegatedTurnError so respond() can retain
  // the partial output alongside ok=false and MCP isError=true.
  if (!data.ok) throw new DelegatedTurnError(data, result.error ?? outcomeError)
  return data
}
