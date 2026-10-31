/**
 * Terminate the exact container on the selected engine and confirm removal, including auto-remove races.
 */
import type { ContainerEngine } from "../../../execution/contracts.ts"
import { CliStageError } from "../../../execution/errors.ts"
import type { run } from "../../../execution/process.ts"
import { assertOk, isNotFound, retainCleanupFailure } from "./results.ts"
import { CLI_PREVIEW_BYTES, T_INSPECT, T_KILL, T_RM } from "./settings.ts"

type RunResult = Awaited<ReturnType<typeof run>>

export async function destroyContainer(
  engine: ContainerEngine,
  id: string,
  execute: typeof run,
): Promise<void> {
  const failures: unknown[] = []
  const killed = await execute([engine, "kill", id], {
    wallTimeMs: T_KILL,
    inlineBytes: CLI_PREVIEW_BYTES,
  })
  const killError = retainCleanupFailure(killed, engine, "kill")
  if (killError) failures.push(killError)
  const removed = await execute([engine, "rm", "--force", id], {
    wallTimeMs: T_RM,
    inlineBytes: CLI_PREVIEW_BYTES,
  })
  if (isNotFound(removed)) return
  const removeError = retainCleanupFailure(removed, engine, "remove")
  if (removeError) failures.push(removeError)
  // --rm and explicit removal can race. Only observed absence proves cleanup,
  // not the CLI acknowledgement or an "already removing" error.
  const end = Date.now() + 5000
  let remaining: RunResult
  do {
    remaining = await execute([engine, "inspect", "--format", "{{.Id}}", id], {
      wallTimeMs: T_INSPECT,
      inlineBytes: CLI_PREVIEW_BYTES,
    })
    if (isNotFound(remaining)) return
    try {
      assertOk(remaining, engine, "cleanup confirmation")
    } catch (error) {
      throw new AggregateError([...failures, error], "Container cleanup confirmation failed.")
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  } while (Date.now() < end)
  throw new AggregateError(
    [
      ...failures,
      new CliStageError(
        engine,
        "cleanup confirmation",
        remaining,
        new Error("Container removal was not confirmed"),
      ),
    ],
    "Container removal was not confirmed",
  )
}
