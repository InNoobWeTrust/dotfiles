import { run } from "./process.ts"

export type ContainerEngine = "podman" | "docker"

/** Built-in startup priority: Podman first, then Docker. */
const CANDIDATES: readonly ContainerEngine[] = ["podman", "docker"]

const PROBE_WALL_TIME_MS = 5_000
// Internal allowance only: an engine must answer `info` in full for the probe to
// count. It never bounds command output or process lifetime.
const PROBE_INLINE_BYTES = 4 * 1024 * 1024

/**
 * Probe candidates in priority order and return the first engine that answers
 * `info` cleanly: exit 0 with no spawn error, timeout, or omitted preview bytes.
 * Every unsuccessful probe is skipped with a terse name/status-only diagnostic;
 * raw CLI output and environment values never reach server stderr. Returning
 * undefined keeps the server host-only — a missing engine is not a startup
 * failure.
 *
 * CLI connectivity is a reachability probe, not lifecycle certification: image
 * availability and resource enforcement stay unverified, and acquisition keeps
 * its fail-closed inspect verification for the selected engine.
 */
export async function detectEngine(): Promise<ContainerEngine | undefined> {
  for (const engine of CANDIDATES) {
    const probe = await run([engine, "info"], {
      wallTimeMs: PROBE_WALL_TIME_MS,
      inlineBytes: PROBE_INLINE_BYTES,
    })
    if (
      !probe.error &&
      probe.stop === "exited" &&
      probe.exitCode === 0 &&
      !probe.truncated.stdout &&
      !probe.truncated.stderr
    ) {
      return engine
    }
    console.error(`sandbox: skipping container engine "${engine}": ${probeStatus(probe)}`)
  }
  return undefined
}

/** Status-only probe summary; never includes CLI output, streams, or environment values. */
function probeStatus(probe: Awaited<ReturnType<typeof run>>): string {
  if (probe.error !== undefined) return "executable could not be run"
  if (probe.stop === "timeout") return "probe timed out"
  if (probe.stop === "capture_failed") return "probe output could not be preserved"
  return `probe exited with status ${String(probe.exitCode)}`
}
