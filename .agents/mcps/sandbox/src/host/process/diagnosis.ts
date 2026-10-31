/** Keep supervisor observations distinct from signal/diagnostic evidence and inferred causes. */
import { constants } from "node:os"

export function diagnoseFailure(
  termination: string,
  code: number | null,
  signal: string | null,
  stderr: string,
): string | undefined {
  if (termination === "timeout")
    return "Elapsed-time budget exceeded; process-group termination was requested. Check cleanup errors and investigate before requesting a larger budget."
  if (termination === "setup_error")
    return "Required limits could not be installed. Inspect the setup error and stderr; do not silently retry without protection."
  if (code === 0 && signal === null) return
  const cpuSignal = constants.signals.SIGXCPU
  const fileSignal = constants.signals.SIGXFSZ
  if (signal === "SIGXCPU" || code === 128 + cpuSignal)
    return "SIGXCPU evidence suggests a per-process CPU limit failure; a shell exit code alone is not proof. Investigate before escalation."
  if (signal === "SIGXFSZ" || code === 128 + fileSignal)
    return "SIGXFSZ evidence suggests a per-file size limit failure, not an aggregate disk quota. Investigate before escalation."
  if (/File too large|File size limit exceeded|CPU time limit exceeded/i.test(stderr)) {
    return "Diagnostics suggest a per-file size or CPU-time limit failure; verify against the selected budget before escalation."
  }
  if (
    /MemoryError|heap out of memory|Cannot allocate memory|Resource temporarily unavailable|Too many open files/i.test(
      stderr,
    )
  ) {
    return "Allocation/process/file-descriptor failure may indicate a resource limit or host pressure; stderr does not prove the configured limit was responsible. Investigate before escalation."
  }
  if (/Read-only file system|Operation not permitted|Permission denied/i.test(stderr)) {
    return "An access restriction or ordinary permission failure may have occurred. Inspect stderr and intended side effects; do not automatically switch modes or raise budgets."
  }
}
