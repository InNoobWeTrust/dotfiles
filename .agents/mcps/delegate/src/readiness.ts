import { type RunResult, runProcess } from "./execute.ts"
import type { HarnessSpec } from "./registry.ts"

export interface ReadinessResult {
  readiness: "configured" | "not_configured" | "unknown"
  reason: string
  models: string[]
}

export interface InspectionOptions {
  cwd: string
  env: NodeJS.ProcessEnv
  run?: typeof runProcess
}

type ConnectionStatus = { status: "needs_auth"; message: string; url?: string }
type InspectionConnection =
  | {
      type: "credential"
      id: string
      label: string
      method: "key" | "oauth" | "external"
      status?: ConnectionStatus
    }
  | {
      type: "env"
      name: string
      status?: ConnectionStatus
    }
type IntegrationInspection = { id: string; connections: InspectionConnection[] }
type ProviderInspection = {
  id: string
  integrationID?: string
  activation: "auto" | "enabled" | "disabled"
}
type ModelInspection = {
  id: string
  providerID: string
  enabled: boolean
  status: "alpha" | "beta" | "deprecated" | "active"
  variants: Array<{ id: string }>
}
type InspectionResponse<T> = { data: T[] }

const AGGREGATE_WALL_TIME_MS = 8_000
const MAX_OUTPUT_BYTES = 4_194_304
const INSPECTION_MARKER = "DELEGATE_INSPECTION"

const CLAUDE_CONFIGURED_REASON =
  "Claude Code reports a local signed-in session; custom model availability still depends on Claude's own account settings."
const CLAUDE_NOT_CONFIGURED_REASON =
  "Claude Code is installed but not logged in here; run `claude auth login` and rerun the startup check."
const CLAUDE_UNKNOWN_REASON =
  "Claude Code readiness could not be determined from `claude auth status`; rerun that command manually to inspect the local session."

const CODEX_CONFIGURED_REASON =
  "Codex reports a local logged-in session; custom provider compatibility still depends on Codex's own configuration."
const CODEX_NOT_CONFIGURED_REASON =
  "Codex is installed but not logged in here; run `codex login` and rerun the startup check."
const CODEX_UNKNOWN_REASON =
  "Codex readiness could not be determined from `codex login status`; rerun that command manually to inspect the local session."

const OPENCODE_CONFIGURED_REASON =
  "OpenCode has at least one enabled non-deprecated model on an active inspected connection."
const OPENCODE_NOT_CONFIGURED_REASON =
  "OpenCode has no enabled non-deprecated model on an active inspected connection; check `/api/integration`, `/api/provider`, and `/api/model`."
const OPENCODE_UNKNOWN_REASON =
  "OpenCode readiness could not be determined from its documented API inspection endpoints; inspect `/api/integration`, `/api/provider`, and `/api/model` manually."

const UNKNOWN_REASONS: Partial<Record<HarnessSpec["id"], string>> = {
  agy: "Antigravity CLI readiness is unknown: its documented `models` output is a catalog, not account proof, and no dedicated non-model auth checker is verified.",
  amp: "Sourcegraph Amp readiness is unknown: `amp account list` does not prove which saved account or environment override will actually run.",
  cursor:
    "Cursor CLI readiness is unknown: `agent status` exists, but no stable output contract is verified for automatic parsing yet.",
  crush:
    "Charm Crush readiness is unknown: no verified non-model CLI account or provider inspection command is documented.",
  droid:
    "Factory Droid readiness is unknown: no verified non-model CLI account or provider inspection command is documented.",
  gemini:
    "Gemini CLI readiness is unknown: no verified non-model CLI account or provider inspection command is documented.",
  hermes:
    "Hermes Agent readiness is unknown: no verified non-model CLI account or provider inspection command is documented.",
  kilo: "Kilo Code readiness is unknown: no verified non-model CLI account or provider inspection command is documented.",
  qwen: "Qwen Code readiness is unknown: the removed auth command is not a usable checker, and no verified non-model inspection contract remains.",
}

const KNOWN_ACTIVATIONS = new Set<string>(["auto", "enabled", "disabled"])
const KNOWN_MODEL_STATUSES = new Set<string>(["alpha", "beta", "deprecated", "active"])
const KNOWN_CREDENTIAL_METHODS = new Set<string>(["key", "oauth", "external"])

type IntegrationState = "connected" | "inactive" | "unknown"
type ProviderState = "connected" | "inactive" | "unknown"
type ConnectionActivity = "active" | "inactive"

function isKnownCredentialMethod(
  value: unknown,
): value is Extract<InspectionConnection, { type: "credential" }>["method"] {
  return typeof value === "string" && KNOWN_CREDENTIAL_METHODS.has(value)
}

function isKnownActivation(value: unknown): value is ProviderInspection["activation"] {
  return typeof value === "string" && KNOWN_ACTIVATIONS.has(value)
}

function isKnownModelStatus(value: unknown): value is ModelInspection["status"] {
  return typeof value === "string" && KNOWN_MODEL_STATUSES.has(value)
}

function result(
  readiness: ReadinessResult["readiness"],
  reason: string,
  models: string[] = [],
): ReadinessResult {
  return { readiness, reason, models }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isInspectionResponse<T>(value: unknown): value is InspectionResponse<T> {
  return isRecord(value) && Array.isArray(value.data)
}

function nonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null
}

function inspectionEnv(env: NodeJS.ProcessEnv): Record<string, string> {
  const inherited: Record<string, string> = {}
  for (const [key, value] of Object.entries(env)) {
    if (value !== undefined) inherited[key] = value
  }
  inherited[INSPECTION_MARKER] = "1"
  return inherited
}

function parseJsonObject(text: string): Record<string, unknown> | null {
  if (text.trim().length === 0) return null
  try {
    const parsed: unknown = JSON.parse(text)
    return isRecord(parsed) ? parsed : null
  } catch {
    return null
  }
}

function parseJsonFromRun(run: RunResult): Record<string, unknown> | null {
  return parseJsonObject(run.stdout) ?? parseJsonObject(run.stderr)
}

function isCleanExit(run: RunResult): boolean {
  return (
    run.stop === "exited" &&
    run.exitCode === 0 &&
    run.signal === null &&
    !run.truncated &&
    !run.error
  )
}

function isParseableExit(run: RunResult): boolean {
  return run.stop === "exited" && run.signal === null && !run.truncated && !run.error
}

function outputLines(run: RunResult): string[] {
  return `${run.stdout}\n${run.stderr}`.split(/\r?\n/)
}

function createProbe(executable: string, options: InspectionOptions) {
  const run = options.run ?? runProcess
  const deadline = performance.now() + AGGREGATE_WALL_TIME_MS
  const env = inspectionEnv(options.env)

  return async (args: string[]): Promise<RunResult | null> => {
    const remaining = Math.ceil(deadline - performance.now())
    if (remaining <= 0) return null
    return run(executable, args, {
      cwd: options.cwd,
      env,
      wallTimeMs: remaining,
      maxOutputBytes: MAX_OUTPUT_BYTES,
    })
  }
}

async function inspectClaude(
  executable: string,
  options: InspectionOptions,
): Promise<ReadinessResult> {
  const probe = createProbe(executable, options)
  const run = await probe(["auth", "status"])
  if (!run || !isParseableExit(run)) return result("unknown", CLAUDE_UNKNOWN_REASON)

  const parsed = parseJsonFromRun(run)
  if (!parsed || typeof parsed.loggedIn !== "boolean") {
    return result("unknown", CLAUDE_UNKNOWN_REASON)
  }
  if (parsed.loggedIn === false) return result("not_configured", CLAUDE_NOT_CONFIGURED_REASON)
  if (run.exitCode === 0) return result("configured", CLAUDE_CONFIGURED_REASON)
  return result("unknown", CLAUDE_UNKNOWN_REASON)
}

async function inspectCodex(
  executable: string,
  options: InspectionOptions,
): Promise<ReadinessResult> {
  const probe = createProbe(executable, options)
  const run = await probe(["login", "status"])
  if (!run || !isCleanExit(run)) return result("unknown", CODEX_UNKNOWN_REASON)

  let loggedIn = false
  let notLoggedIn = false
  for (const line of outputLines(run)) {
    if (/^Logged in using .+/.test(line)) loggedIn = true
    if (/^Not logged in(?:$|\b.*$)/.test(line)) notLoggedIn = true
  }

  if (loggedIn && !notLoggedIn) return result("configured", CODEX_CONFIGURED_REASON)
  if (notLoggedIn && !loggedIn) return result("not_configured", CODEX_NOT_CONFIGURED_REASON)
  return result("unknown", CODEX_UNKNOWN_REASON)
}

function parseDataArray(run: RunResult): unknown[] | null {
  if (!isCleanExit(run)) return null
  const parsed = parseJsonFromRun(run)
  if (!isInspectionResponse(parsed)) return null
  return parsed.data
}

function isConnectionStatus(value: unknown): value is ConnectionStatus {
  return (
    isRecord(value) &&
    value.status === "needs_auth" &&
    typeof value.message === "string" &&
    (value.url === undefined || typeof value.url === "string")
  )
}

function isInspectionConnection(value: unknown): value is InspectionConnection {
  if (!isRecord(value) || typeof value.type !== "string") return false
  if (value.status !== undefined && !isConnectionStatus(value.status)) return false

  if (value.type === "credential") {
    return (
      nonEmptyString(value.id) !== null &&
      typeof value.label === "string" &&
      isKnownCredentialMethod(value.method)
    )
  }

  if (value.type === "env") {
    return nonEmptyString(value.name) !== null
  }

  return false
}

function isIntegrationInspection(value: unknown): value is IntegrationInspection {
  return (
    isRecord(value) &&
    nonEmptyString(value.id) !== null &&
    Array.isArray(value.connections) &&
    value.connections.every(isInspectionConnection)
  )
}

function isProviderInspection(value: unknown): value is ProviderInspection {
  return (
    isRecord(value) &&
    nonEmptyString(value.id) !== null &&
    isKnownActivation(value.activation) &&
    (value.integrationID === undefined || typeof value.integrationID === "string")
  )
}

function isModelVariant(value: unknown): value is ModelInspection["variants"][number] {
  return isRecord(value) && typeof value.id === "string"
}

function classifyConnectionStatus(value: unknown): ConnectionActivity | null {
  if (value === undefined) return "active"
  if (!isRecord(value)) return null
  if (value.status !== "needs_auth") return null
  if (typeof value.message !== "string") return null
  if (value.url !== undefined && typeof value.url !== "string") return null
  return "inactive"
}

function classifyConnection(
  value: unknown,
):
  | { kind: "credential"; activity: ConnectionActivity }
  | { kind: "env"; activity: ConnectionActivity }
  | null {
  if (!isInspectionConnection(value)) return null
  const activity = classifyConnectionStatus(value.status)
  if (activity === null) return null

  if (value.type === "credential") {
    return { kind: "credential", activity }
  }

  if (value.type === "env") {
    if (!nonEmptyString(value.name)) return null
    return { kind: "env", activity }
  }

  return null
}

function inspectConnections(connections: unknown[]): IntegrationState {
  if (connections.length === 0) return "inactive"

  const credentials: ConnectionActivity[] = []
  let hasActiveEnv = false

  for (const connection of connections) {
    const classified = classifyConnection(connection)
    if (classified === null) return "unknown"
    if (classified.kind === "credential") {
      credentials.push(classified.activity)
      continue
    }
    if (classified.activity === "active") hasActiveEnv = true
  }

  if (credentials.length > 1) return "unknown"
  if (credentials.length === 1) {
    return credentials[0] === "active" ? "connected" : "inactive"
  }
  return hasActiveEnv ? "connected" : "inactive"
}

function parseIntegrations(data: unknown[]): {
  states: Map<string, IntegrationState>
  unknown: boolean
} {
  const states = new Map<string, IntegrationState>()
  let unknown = false

  for (const entry of data) {
    if (!isIntegrationInspection(entry) || states.has(entry.id)) {
      unknown = true
      continue
    }
    states.set(entry.id, inspectConnections(entry.connections))
  }

  return { states, unknown }
}

function parseProviders(
  data: unknown[],
  integrations: ReadonlyMap<string, IntegrationState>,
): { states: Map<string, ProviderState>; unknown: boolean } {
  const states = new Map<string, ProviderState>()
  let unknown = false

  for (const entry of data) {
    if (!isProviderInspection(entry) || states.has(entry.id)) {
      unknown = true
      continue
    }

    const id = entry.id
    if (entry.activation === "disabled") {
      states.set(id, "inactive")
      continue
    }

    if (entry.integrationID === undefined) {
      states.set(id, "unknown")
      unknown = true
      continue
    }

    const integrationID = nonEmptyString(entry.integrationID)
    if (!integrationID) {
      states.set(id, "unknown")
      unknown = true
      continue
    }

    const integrationState = integrations.get(integrationID)
    if (integrationState === undefined || integrationState === "unknown") {
      states.set(id, "unknown")
      unknown = true
      continue
    }

    states.set(id, integrationState === "connected" ? "connected" : "inactive")
  }

  return { states, unknown }
}

function baseSelector(providerID: string, modelID: string): string | null {
  if (providerID.includes("/") || providerID.includes("#")) return null
  if (modelID.length === 0 || modelID.includes("#")) return null
  return modelID.startsWith(`${providerID}/`) ? modelID : `${providerID}/${modelID}`
}

function addModel(result: string[], seen: Set<string>, selector: string): void {
  if (seen.has(selector)) return
  seen.add(selector)
  result.push(selector)
}

function evaluateModels(
  data: unknown[],
  providers: ReadonlyMap<string, ProviderState>,
): { models: string[]; unknown: boolean } {
  const models: string[] = []
  const seen = new Set<string>()
  let unknown = false

  for (const entry of data) {
    if (!isRecord(entry)) {
      unknown = true
      continue
    }

    const providerID = nonEmptyString(entry.providerID)
    if (!providerID) {
      unknown = true
      continue
    }

    const providerState = providers.get(providerID)
    if (providerState === undefined) continue
    if (providerState === "unknown") {
      unknown = true
      continue
    }
    if (providerState === "inactive") continue

    if (typeof entry.enabled !== "boolean" || !isKnownModelStatus(entry.status)) {
      unknown = true
      continue
    }
    if (!entry.enabled || entry.status === "deprecated") continue

    if (typeof entry.id !== "string") {
      unknown = true
      continue
    }

    const base = baseSelector(providerID, entry.id)
    if (base === null) {
      unknown = true
      continue
    }
    addModel(models, seen, base)

    if (!Array.isArray(entry.variants)) {
      unknown = true
      continue
    }
    for (const variant of entry.variants) {
      if (!isModelVariant(variant)) {
        unknown = true
        continue
      }
      if (variant.id.length === 0) continue
      if (variant.id.includes("#")) {
        unknown = true
        continue
      }
      addModel(models, seen, `${base}#${variant.id}`)
    }
  }

  return { models, unknown }
}

async function inspectOpenCode(
  executable: string,
  options: InspectionOptions,
): Promise<ReadinessResult> {
  const probe = createProbe(executable, options)

  const integrationsRun = await probe([
    "api",
    "get",
    "/api/integration",
    "--standalone",
    "--log-level",
    "none",
  ])
  if (!integrationsRun) return result("unknown", OPENCODE_UNKNOWN_REASON)
  const integrationsData = parseDataArray(integrationsRun)
  if (!integrationsData) return result("unknown", OPENCODE_UNKNOWN_REASON)

  const providersRun = await probe([
    "api",
    "get",
    "/api/provider",
    "--standalone",
    "--log-level",
    "none",
  ])
  if (!providersRun) return result("unknown", OPENCODE_UNKNOWN_REASON)
  const providersData = parseDataArray(providersRun)
  if (!providersData) return result("unknown", OPENCODE_UNKNOWN_REASON)

  const modelsRun = await probe(["api", "get", "/api/model", "--standalone", "--log-level", "none"])
  if (!modelsRun) return result("unknown", OPENCODE_UNKNOWN_REASON)
  const modelsData = parseDataArray(modelsRun)
  if (!modelsData) return result("unknown", OPENCODE_UNKNOWN_REASON)

  const integrations = parseIntegrations(integrationsData)
  const providers = parseProviders(providersData, integrations.states)
  const evaluation = evaluateModels(modelsData, providers.states)

  if (evaluation.models.length > 0) {
    return result("configured", OPENCODE_CONFIGURED_REASON, evaluation.models)
  }
  if (integrations.unknown || providers.unknown || evaluation.unknown) {
    return result("unknown", OPENCODE_UNKNOWN_REASON)
  }
  return result("not_configured", OPENCODE_NOT_CONFIGURED_REASON)
}

export async function inspectReadiness(
  spec: HarnessSpec,
  executable: string,
  options: InspectionOptions,
): Promise<ReadinessResult> {
  switch (spec.id) {
    case "claude":
      return inspectClaude(executable, options)
    case "codex":
      return inspectCodex(executable, options)
    case "opencode":
      return inspectOpenCode(executable, options)
    case "agy":
    case "amp":
    case "cursor":
    case "crush":
    case "droid":
    case "gemini":
    case "hermes":
    case "kilo":
    case "qwen":
      return result("unknown", UNKNOWN_REASONS[spec.id] ?? "Readiness is unknown.")
    default:
      return result(
        "unknown",
        `${spec.label} readiness is unknown: no dedicated non-model inspection strategy is implemented for this harness.`,
      )
  }
}
