// Native quality-provider contracts shared by execution and MCP result adapters.
export type ProviderStatus = "ok" | "unavailable" | "not-applicable" | "error"
export type Mechanism = "lsp" | "cli"

export interface DiagnosticRecord {
  location: string
  severity: "Error" | "Warning" | "Information" | "Hint"
  message: string
  rule?: string
  tool: string
}

export interface ProviderResult<T = unknown> {
  provider: string
  mechanism: Mechanism
  status: ProviderStatus
  data?: T
  diagnostics?: DiagnosticRecord[]
  totalDiagnostics?: number
  truncated?: boolean
  caps?: {
    timeoutMs?: number
    stdoutBytes?: number
    stderrBytes?: number
    diagnostics?: number
  }
  evidence: { source: "pull" | "push" | "cache" | "cli"; tool?: string; version?: string }
  note?: string
}

export interface QualityOutput {
  stdout: string
  stderr: string
}

export interface QualityProvider {
  id: string
  extensions: readonly string[]
  basenames?: readonly string[]
  scope: "file" | "project"
  feedStdin?: boolean
  defaultTimeoutMs: number
  argv(absoluteFile: string): readonly string[]
  findingsExitCodes: readonly number[]
  needs: readonly ("eslint-config" | "stylelint-config" | "go-module" | "cargo-manifest")[]
  parse(output: QualityOutput, ctx: { root: string; absoluteFile: string }): DiagnosticRecord[]
}
