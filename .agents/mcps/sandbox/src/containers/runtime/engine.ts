/** Bounded startup engine detection; selected engines never hot-fallback during lifecycle operations. */

import type { ContainerEngine } from "../../execution/contracts.ts"
import { preserveFailure } from "../../execution/diagnostics.ts"
import { CliStageError } from "../../execution/errors.ts"
import { run } from "../../execution/process.ts"

/** Built-in startup priority: Podman first, then Docker. */
const CANDIDATES: readonly ContainerEngine[] = ["podman", "docker"]

const PROBE_WALL_TIME_MS = 5_000
// Internal allowance only: an engine must answer `info` in full for the probe to
// count. It never bounds command output or process lifetime.
const PROBE_INLINE_BYTES = 4 * 1024 * 1024

/**
 * Probe candidates in priority order and return the first engine that answers
 * `info` cleanly: exit 0 with no spawn error, timeout, or omitted preview bytes.
 * Every unsuccessful probe is skipped with a terse name/status/trace diagnostic;
 * raw CLI output and environment values never reach server stderr. Returning
 * undefined keeps the server host-only — a missing engine is not a startup
 * failure.
 *
 * CLI connectivity is a reachability probe, not lifecycle certification: image
 * availability and resource enforcement stay unverified, and acquisition keeps
 * its fail-closed inspect verification for the selected engine.
 */
export async function detectEngine(
  execute: typeof run = run,
): Promise<ContainerEngine | undefined> {
  for (const engine of CANDIDATES) {
    let probe: Awaited<ReturnType<typeof run>>
    try {
      probe = await execute([engine, "info"], {
        wallTimeMs: PROBE_WALL_TIME_MS,
        inlineBytes: PROBE_INLINE_BYTES,
      })
    } catch (error) {
      const trace = preserveFailure("engine detection", error)
      console.error(
        `sandbox: skipping container engine "${engine}": probe failed ${JSON.stringify(trace)}`,
      )
      continue
    }
    if (
      !probe.error &&
      probe.stop === "exited" &&
      probe.exitCode === 0 &&
      !probe.truncated.stdout &&
      !probe.truncated.stderr
    ) {
      return engine
    }
    const trace = preserveFailure(
      "engine detection",
      new CliStageError(engine, "startup info", probe),
    )
    console.error(
      `sandbox: skipping container engine "${engine}": ${probeStatus(probe)} ${JSON.stringify(trace)}`,
    )
  }
  return undefined
}

/** Status-only probe summary; never includes CLI output, streams, or environment values. */
function probeStatus(probe: Awaited<ReturnType<typeof run>>): string {
  if (probe.error !== undefined) return "executable could not be run"
  if (probe.stop === "timeout") return "probe timed out"
  if (probe.stop === "capture_failed") return "probe output could not be preserved"
  if (probe.truncated.stdout || probe.truncated.stderr) return "probe preview was incomplete"
  return `probe exited with status ${String(probe.exitCode)}`
}
