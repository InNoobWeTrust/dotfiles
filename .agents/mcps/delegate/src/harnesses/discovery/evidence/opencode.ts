/** Pure validation and selector evaluation for captured OpenCode API evidence. */
export type OpenCodeReadiness = "configured" | "not_configured" | "unknown"

export interface OpenCodeEvidence {
  integrations: unknown[]
  providers: unknown[]
  models: unknown[]
}

export interface OpenCodeCatalogEntry {
  selector: string
  label: string | null
}

export interface OpenCodeEvidenceEvaluation {
  readiness: OpenCodeReadiness
  models: string[]
  evidence: OpenCodeEvidence
  modelHints: string[]
  modelHintsState: "available" | "empty" | "unknown"
  catalog: OpenCodeCatalogEntry[]
  catalogValid: boolean
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
  | { type: "env"; name: string; status?: ConnectionStatus }
type IntegrationInspection = { id: string; connections: InspectionConnection[] }
type ProviderInspection = {
  id: string
  integrationID?: string
  activation: "auto" | "enabled" | "disabled"
}
const KNOWN_ACTIVATIONS = new Set<string>(["auto", "enabled", "disabled"])
const KNOWN_MODEL_STATUSES = new Set<string>(["alpha", "beta", "deprecated", "active"])
const KNOWN_CREDENTIAL_METHODS = new Set<string>(["key", "oauth", "external"])

type IntegrationState = "connected" | "inactive" | "unknown"
type ProviderState = "connected" | "inactive" | "unknown"
type ConnectionActivity = "active" | "inactive"
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function nonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null
}
function isKnownCredentialMethod(
  value: unknown,
): value is Extract<InspectionConnection, { type: "credential" }>["method"] {
  return typeof value === "string" && KNOWN_CREDENTIAL_METHODS.has(value)
}

function isKnownActivation(value: unknown): value is ProviderInspection["activation"] {
  return typeof value === "string" && KNOWN_ACTIVATIONS.has(value)
}

function isKnownModelStatus(value: unknown): value is "alpha" | "beta" | "deprecated" | "active" {
  return typeof value === "string" && KNOWN_MODEL_STATUSES.has(value)
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
  if (value.type === "env") return nonEmptyString(value.name) !== null
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

function isModelVariant(value: unknown): value is { id: string; [key: string]: unknown } {
  return isRecord(value) && nonEmptyString(value.id) !== null
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
): { kind: "credential" | "env"; activity: ConnectionActivity } | null {
  if (!isInspectionConnection(value)) return null
  const activity = classifyConnectionStatus(value.status)
  if (activity === null) return null
  return { kind: value.type, activity }
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
  if (credentials.length === 1) return credentials[0] === "active" ? "connected" : "inactive"
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
    if (entry.activation === "disabled") {
      states.set(entry.id, "inactive")
      continue
    }
    if (entry.integrationID === undefined) {
      states.set(entry.id, "unknown")
      unknown = true
      continue
    }
    const integrationID = nonEmptyString(entry.integrationID)
    if (!integrationID) {
      states.set(entry.id, "unknown")
      unknown = true
      continue
    }
    const integrationState = integrations.get(integrationID)
    if (integrationState === undefined || integrationState === "unknown") {
      states.set(entry.id, "unknown")
      unknown = true
      continue
    }
    states.set(entry.id, integrationState === "connected" ? "connected" : "inactive")
  }
  return { states, unknown }
}

function baseSelector(providerID: string, modelID: string): string | null {
  if (providerID.includes("/") || providerID.includes("#")) return null
  if (modelID.length === 0 || modelID.includes("#")) return null
  return modelID.startsWith(`${providerID}/`) ? modelID : `${providerID}/${modelID}`
}
type EligibleModel = { selector: string; base: string; model: Record<string, unknown> }

function eligibleModelBase(
  entry: unknown,
  providers: ReadonlyMap<string, ProviderState>,
): {
  model: Record<string, unknown> | null
  base: string | null
  unknown: boolean
  catalogValid: boolean
} {
  if (!isRecord(entry)) return { model: null, base: null, unknown: true, catalogValid: false }
  const providerID = nonEmptyString(entry.providerID)
  if (!providerID) return { model: null, base: null, unknown: true, catalogValid: false }
  const state = providers.get(providerID)
  if (state === undefined) return { model: null, base: null, unknown: false, catalogValid: false }
  if (state === "unknown") return { model: null, base: null, unknown: true, catalogValid: false }
  if (state === "inactive") return { model: null, base: null, unknown: false, catalogValid: true }
  if (typeof entry.enabled !== "boolean" || !isKnownModelStatus(entry.status)) {
    return { model: null, base: null, unknown: true, catalogValid: false }
  }
  if (!entry.enabled || entry.status === "deprecated") {
    return { model: null, base: null, unknown: false, catalogValid: true }
  }
  if (typeof entry.id !== "string")
    return { model: null, base: null, unknown: true, catalogValid: false }
  const base = baseSelector(providerID, entry.id)
  return base === null
    ? { model: null, base: null, unknown: true, catalogValid: false }
    : { model: entry, base, unknown: false, catalogValid: true }
}

function selectorsFor(
  model: Record<string, unknown>,
  base: string,
): { selectors: string[]; unknown: boolean; valid: boolean } {
  if (!Array.isArray(model.variants)) return { selectors: [base], unknown: true, valid: false }
  const selectors = [base]
  let unknown = false
  let valid = true
  for (const variant of model.variants) {
    if (!isRecord(variant) || typeof variant.id !== "string") {
      unknown = true
      valid = false
      continue
    }
    if (variant.id.length === 0) continue
    if (variant.id.includes("#")) {
      unknown = true
      valid = false
      continue
    }
    selectors.push(`${base}#${variant.id}`)
  }
  return { selectors, unknown, valid }
}

function evaluateModels(
  data: unknown[],
  providers: ReadonlyMap<string, ProviderState>,
): { models: string[]; eligible: EligibleModel[]; unknown: boolean; catalogValid: boolean } {
  const models: string[] = []
  const seen = new Set<string>()
  const eligible: EligibleModel[] = []
  let unknown = false
  let catalogValid = true
  for (const entry of data) {
    const baseResult = eligibleModelBase(entry, providers)
    unknown ||= baseResult.unknown
    catalogValid &&= baseResult.catalogValid
    if (!baseResult.model || !baseResult.base) continue
    const selectorResult = selectorsFor(baseResult.model, baseResult.base)
    unknown ||= selectorResult.unknown
    catalogValid &&= selectorResult.valid
    for (const selector of selectorResult.selectors) {
      if (!seen.has(selector)) {
        seen.add(selector)
        models.push(selector)
      }
      eligible.push({ selector, base: baseResult.base, model: baseResult.model })
    }
  }
  return { models, eligible, unknown, catalogValid }
}

function catalogFor(eligible: EligibleModel[]): {
  catalog: OpenCodeCatalogEntry[]
  valid: boolean
} {
  const catalog: OpenCodeCatalogEntry[] = []
  const selectors = new Set<string>()
  let valid = true
  const labels = new Map<string, string>()
  for (const item of eligible) {
    const label = nonEmptyString(item.model.name)
    const existing = labels.get(item.base)
    if (label === null || (existing !== undefined && existing !== label)) valid = false
    else labels.set(item.base, label)
    if (!selectors.has(item.selector)) {
      selectors.add(item.selector)
      catalog.push({ selector: item.selector, label })
    }
    if (
      !Array.isArray(item.model.variants) ||
      item.model.variants.some((variant) => !isModelVariant(variant))
    ) {
      valid = false
    }
  }
  return { catalog, valid }
}

function freeModelHints(
  eligible: EligibleModel[],
  evidence: OpenCodeEvidence,
  providerStates: ReadonlyMap<string, ProviderState>,
  structurallyIncomplete: boolean,
): { hints: string[]; state: "available" | "empty" | "unknown" } {
  let incomplete = structurallyIncomplete
  const hints = new Set<string>()
  for (const item of eligible) {
    if (item.selector.includes("#")) continue
    const sourceProvider = nonEmptyString(item.model.providerID)
    if (sourceProvider !== "opencode" || providerStates.get(sourceProvider) !== "connected")
      continue
    const name = nonEmptyString(item.model.name) ?? ""
    const nativeID = nonEmptyString(item.model.id) ?? ""
    if (`${name}\n${nativeID}`.toLowerCase().includes("free")) hints.add(item.base)
  }
  // A malformed or unjoinable model/provider record means absence of a hint is not complete.
  if (
    evidence.models.some(
      (model) =>
        !isRecord(model) ||
        !nonEmptyString(model.providerID) ||
        providerStates.get(String(model.providerID)) === undefined,
    )
  ) {
    incomplete = true
  }
  if (providerStates.get("opencode") === "unknown") incomplete = true
  if (hints.size > 0) return { hints: [...hints], state: incomplete ? "unknown" : "available" }
  return { hints, state: incomplete ? "unknown" : "empty" }
}

/** Evaluates captured evidence without I/O and preserves the source arrays verbatim. */
export function evaluateOpenCodeEvidence(evidence: OpenCodeEvidence): OpenCodeEvidenceEvaluation {
  const integrations = parseIntegrations(evidence.integrations)
  const providers = parseProviders(evidence.providers, integrations.states)
  const evaluation = evaluateModels(evidence.models, providers.states)
  const catalogResult = catalogFor(evaluation.eligible)
  const hints = freeModelHints(
    evaluation.eligible,
    evidence,
    providers.states,
    integrations.unknown || providers.unknown || evaluation.unknown,
  )
  const readiness: OpenCodeReadiness =
    evaluation.models.length > 0
      ? "configured"
      : integrations.unknown || providers.unknown || evaluation.unknown
        ? "unknown"
        : "not_configured"
  return {
    readiness,
    models: evaluation.models,
    evidence,
    modelHints: integrations.unknown || providers.unknown ? [] : hints.hints,
    modelHintsState: hints.state,
    catalog: catalogResult.catalog,
    catalogValid:
      !integrations.unknown && !providers.unknown && evaluation.catalogValid && catalogResult.valid,
  }
}
