/** Foundational CLI results, private trace references and selected-engine data; no container dependencies. */
export interface ProcessResult {
  exitCode: number | null
  /** Complete raw stdout path in the private cache; null only when capture setup failed. */
  stdoutPath: string | null
  /** Complete raw stderr path in the private cache; null only when capture setup failed. */
  stderrPath: string | null
  stdoutBytes: number
  stderrBytes: number
  stdout: string
  stderr: string
  stop: "exited" | "timeout" | "capture_failed"
  /** Whether the inline preview omitted bytes; the raw file always holds the complete stream. */
  truncated: { stdout: boolean; stderr: boolean }
  error?: string
  /** Original runtime exceptions for private diagnostics only; never serialize a ProcessResult on wire. */
  cause?: unknown
}

export interface TraceReference {
  tracePath: string | null
  traceError?: string
}

export type ContainerEngine = "podman" | "docker"
