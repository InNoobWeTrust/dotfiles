/** Interpret engine CLI results and retain tolerated cleanup failures without owning lifecycle state. */
import type { ContainerEngine, ProcessResult } from "../../../execution/contracts.ts"
import { preserveFailure } from "../../../execution/diagnostics.ts"
import { CliStageError } from "../../../execution/errors.ts"

type RunResult = ProcessResult

/**
 * True only when the selected engine CLI reports the object does not exist.
 * Distinguishes absence from an engine reachability or permission error.
 */
export function isNotFound(r: RunResult): boolean {
  return (
    !r.error &&
    r.stop === "exited" &&
    r.exitCode !== 0 &&
    /no such (container|object)/i.test(r.stderr)
  )
}

/**
 * True only when the engine CLI confirms the image is not present locally.
 * Positive absence: nonzero exit, no transport error, and a recognised absence message.
 * Any other inspection failure is not treated as absence.
 */
export function isImageAbsent(r: RunResult): boolean {
  return (
    !r.error &&
    r.stop === "exited" &&
    r.exitCode !== 0 &&
    /no such image|image not known/i.test(r.stderr)
  )
}

/**
 * Throw a descriptive error naming the selected engine when the result is not a
 * clean success. Callers that must distinguish "not found" should check isNotFound first.
 */
export function assertOk(r: RunResult, engine: ContainerEngine, op: string): void {
  if (!r.error && r.stop === "exited" && r.exitCode === 0) return
  throw new CliStageError(engine, op, r)
}

/** Tolerated cleanup failures still need an artifact, even when later removal succeeds. */
export function retainCleanupFailure(
  r: RunResult,
  engine: ContainerEngine,
  stage: string,
): Error | undefined {
  if ((!r.error && r.stop === "exited" && r.exitCode === 0) || isNotFound(r)) return
  const error = new CliStageError(engine, stage, r)
  const trace = preserveFailure(`container cleanup ${stage}`, error)
  console.error(`sandbox: ${engine} cleanup ${stage} failed: ${JSON.stringify(trace)}`)
  return error
}
