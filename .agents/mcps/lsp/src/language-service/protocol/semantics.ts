/** Pure helpers: capability checks, request builders, position math and digest normalizers. */

export interface Position0 {
  line: number
  character: number
}

export const caps = {
  definition: 10,
  references: 100,
  symbols: 200,
  workspaceSymbols: 50,
  diagnostics: 100,
  hover: 1000,
  preview: 120,
  message: 300,
}

const SYMBOL_KINDS: Record<number, string> = {
  1: "File",
  2: "Module",
  3: "Namespace",
  4: "Package",
  5: "Class",
  6: "Method",
  7: "Property",
  8: "Field",
  9: "Constructor",
  10: "Enum",
  11: "Interface",
  12: "Function",
  13: "Variable",
  14: "Constant",
  15: "String",
  16: "Number",
  17: "Boolean",
  18: "Array",
  19: "Object",
  20: "Key",
  21: "Null",
  22: "EnumMember",
  23: "Struct",
  24: "Event",
  25: "Operator",
  26: "TypeParameter",
}

const SEVERITIES: Record<number, string> = {
  1: "Error",
  2: "Warning",
  3: "Information",
  4: "Hint",
}

export function kindName(kind: number): string {
  return SYMBOL_KINDS[kind] ?? "Unknown"
}

export function severityName(severity: number): string {
  return SEVERITIES[severity] ?? "Unknown"
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function position(value: unknown): Position0 | undefined {
  if (!isObject(value)) return undefined
  const { line, character } = value
  if (typeof line !== "number" || typeof character !== "number") return undefined
  return { line, character }
}

/** 1-based display location: `path:line:character`. */
export function locationText(display: string, at: Position0): string {
  return `${display}:${at.line + 1}:${at.character + 1}`
}

export function clamp(value: string, limit: number): string {
  return value.length <= limit ? value : value.slice(0, limit)
}

export function trimmed(value: string, limit: number): string {
  return value.length <= limit ? value : `${value.slice(0, limit)} …(truncated)`
}

/** Throws a self-describing error when the server never advertised the provider. */
export function requireCapability(
  capabilities: unknown,
  provider: string,
  method: string,
  server: string,
): void {
  const record = isObject(capabilities) ? capabilities : {}
  if (!record[provider])
    throw new Error(
      `Server '${server}' does not support ${method} (capability ${provider} is missing).`,
    )
}

export function textDocument(uri: string) {
  return { textDocument: { uri } }
}

export function positionParams(uri: string, at: Position0) {
  return { ...textDocument(uri), position: at }
}

export function referencesParams(uri: string, at: Position0, includeDeclaration: boolean) {
  return { ...positionParams(uri, at), context: { includeDeclaration } }
}

export function renameParams(uri: string, at: Position0, newName: string) {
  return { ...positionParams(uri, at), newName }
}

export function formattingParams(uri: string, options: { tabSize: number; insertSpaces: boolean }) {
  return { ...textDocument(uri), options }
}

export interface LocationEntry {
  uri: string
  /** 0-based LSP range start; use locationText for display. */
  start: Position0
}

/** Accepts Location | LocationLink arrays (or a single item) and drops malformed entries. */
export function normalizeLocations(result: unknown): LocationEntry[] {
  const items = Array.isArray(result)
    ? result
    : result === null || result === undefined
      ? []
      : [result]
  const entries: LocationEntry[] = []
  for (const item of items) {
    if (!isObject(item)) continue
    const link = typeof item.targetUri === "string"
    const uri = link ? item.targetUri : typeof item.uri === "string" ? item.uri : undefined
    if (typeof uri !== "string") continue
    const raw = link
      ? (isObject(item.targetSelectionRange) && item.targetSelectionRange) ||
        (isObject(item.targetRange) && item.targetRange) ||
        undefined
      : isObject(item.range) && item.range
        ? item.range
        : undefined
    const start = isObject(raw) ? position(raw.start) : undefined
    if (!start) continue
    entries.push({ uri, start })
  }
  return entries
}

/** Flattens Hover contents (string | {value} | MarkedString[]) to trimmed text. */
export function hoverText(result: unknown): string {
  const source = isObject(result) ? result.contents : result
  const parts: string[] = []
  const push = (value: unknown) => {
    if (typeof value === "string") parts.push(value)
    else if (isObject(value) && typeof value.value === "string") parts.push(value.value)
  }
  if (Array.isArray(source)) for (const item of source) push(item)
  else push(source)
  return trimmed(parts.join("\n").trim(), caps.hover)
}

export interface SymbolEntry {
  kind: string
  name: string
  location: string
  container?: string
  children?: SymbolEntry[]
}

function symbolFields(
  node: Record<string, unknown>,
  uri: string,
  displayOf: (uri: string) => string,
) {
  const anchor = isObject(node.selectionRange)
    ? position(node.selectionRange.start)
    : isObject(node.location) && isObject(node.location.range)
      ? position(node.location.range.start)
      : undefined
  if (!anchor) return undefined
  const located =
    isObject(node.location) && typeof node.location.uri === "string" ? node.location.uri : uri
  return {
    kind: typeof node.kind === "number" ? kindName(node.kind) : "Unknown",
    name: typeof node.name === "string" ? node.name : "<unnamed>",
    location: locationText(displayOf(located), anchor),
  }
}

/** Hierarchical DocumentSymbol[] | SymbolInformation[] digest with a global entry budget. */
export function symbolDigest(
  result: unknown,
  fallbackUri: string,
  displayOf: (uri: string) => string,
  cap = caps.symbols,
): { symbols: SymbolEntry[]; totalSymbols: number; truncated: boolean } {
  const items = Array.isArray(result) ? result : []
  let total = 0
  const count = (nodes: unknown[]) => {
    for (const node of nodes) {
      if (!isObject(node)) continue
      total += 1
      if (Array.isArray(node.children)) count(node.children)
    }
  }
  count(items)
  let budget = cap
  let built = 0
  const build = (nodes: unknown[]): SymbolEntry[] => {
    const entries: SymbolEntry[] = []
    for (const node of nodes) {
      if (budget <= 0) return entries
      if (!isObject(node)) continue
      const fields = symbolFields(node, fallbackUri, displayOf)
      if (!fields) continue
      budget -= 1
      built += 1
      const entry: SymbolEntry = fields
      if (typeof node.containerName === "string") entry.container = node.containerName
      if (Array.isArray(node.children) && node.children.length > 0) {
        const children = build(node.children)
        if (children.length > 0) entry.children = children
      }
      entries.push(entry)
    }
    return entries
  }
  const symbols = build(items)
  return { symbols, totalSymbols: total, truncated: total > built }
}

/** WorkspaceSymbol[] digest; entries may carry only a bare {uri}. */
export function workspaceSymbolDigest(
  result: unknown,
  displayOf: (uri: string) => string,
  cap = caps.workspaceSymbols,
): { symbols: SymbolEntry[]; totalSymbols: number; truncated: boolean } {
  const items = Array.isArray(result) ? result : []
  const total = items.length
  let built = 0
  const symbols: SymbolEntry[] = []
  for (const node of items) {
    if (symbols.length >= cap) break
    if (!isObject(node)) continue
    if (typeof node.location !== "object" || node.location === null) continue
    const location = node.location
    if (!isObject(location) || typeof location.uri !== "string") continue
    const at = isObject(location.range) ? position(location.range.start) : undefined
    const entry: SymbolEntry = {
      kind: typeof node.kind === "number" ? kindName(node.kind) : "Unknown",
      name: typeof node.name === "string" ? node.name : "<unnamed>",
      location: at ? locationText(displayOf(location.uri), at) : displayOf(location.uri),
    }
    if (typeof node.containerName === "string") entry.container = node.containerName
    symbols.push(entry)
    built += 1
  }
  return { symbols, totalSymbols: total, truncated: total > built }
}

export interface DiagnosticEntry {
  location: string
  severity: string
  message: string
  source?: string
  code?: string | number
}

/** Diagnostics list digest for one document. */
export function diagnosticsDigest(
  uri: string,
  result: unknown,
  displayOf: (uri: string) => string,
  cap = caps.diagnostics,
): { diagnostics: DiagnosticEntry[]; totalDiagnostics: number; truncated: boolean } {
  const items = Array.isArray(result) ? result : []
  const total = items.length
  const name = displayOf(uri)
  const diagnostics: DiagnosticEntry[] = []
  for (const item of items) {
    if (diagnostics.length >= cap) break
    if (!isObject(item)) continue
    const at = isObject(item.range) ? position(item.range.start) : undefined
    if (!at) continue
    const entry: DiagnosticEntry = {
      location: locationText(name, at),
      severity: typeof item.severity === "number" ? severityName(item.severity) : "Unknown",
      message: trimmed(typeof item.message === "string" ? item.message : "", caps.message),
    }
    if (typeof item.source === "string") entry.source = item.source
    if (typeof item.code === "string" || typeof item.code === "number") entry.code = item.code
    diagnostics.push(entry)
  }
  return { diagnostics, totalDiagnostics: total, truncated: total > diagnostics.length }
}
