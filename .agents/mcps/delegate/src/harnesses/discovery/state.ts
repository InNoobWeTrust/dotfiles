/** Owns the current discovery snapshot and its singleflight refresh. */
import { type DetectionResult, detectHarnesses } from "./detect.ts"
import type { InspectionGate } from "./inspection.ts"

export function createDiscoveryState(options: {
  launchDirectory: string
  inspectionGate: InspectionGate
  initialSnapshot: DetectionResult
}) {
  const { launchDirectory, inspectionGate } = options
  let snapshot = options.initialSnapshot
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
    refreshFlight = detectHarnesses({
      cwd: launchDirectory,
      env: process.env,
      gate: inspectionGate,
    })
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

  return { getSnapshot: () => snapshot, performRefresh, waitForRefresh }
}
