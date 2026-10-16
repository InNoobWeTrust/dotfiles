import type { JsonObject } from "./client.ts"

export interface Method {
  method: string
  notification?: boolean
  description: string
}

const providers: [string, string][] = [
  ["textDocument/hover", "hoverProvider"],
  ["textDocument/definition", "definitionProvider"],
  ["textDocument/declaration", "declarationProvider"],
  ["textDocument/typeDefinition", "typeDefinitionProvider"],
  ["textDocument/implementation", "implementationProvider"],
  ["textDocument/references", "referencesProvider"],
  ["textDocument/documentSymbol", "documentSymbolProvider"],
  ["textDocument/completion", "completionProvider"],
  ["textDocument/signatureHelp", "signatureHelpProvider"],
  ["textDocument/documentHighlight", "documentHighlightProvider"],
  ["textDocument/foldingRange", "foldingRangeProvider"],
  ["textDocument/selectionRange", "selectionRangeProvider"],
  ["textDocument/formatting", "documentFormattingProvider"],
  ["textDocument/rangeFormatting", "documentRangeFormattingProvider"],
  ["textDocument/diagnostic", "diagnosticProvider"],
  ["workspace/symbol", "workspaceSymbolProvider"],
]

function isObject(value: unknown): value is JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value)
}

const nativeParams =
  "Supply native LSP params with exact document URIs and zero-based UTF-16 positions; results are returned unchanged."

/** Only exposes the fixed native-method surface advertised by this server. */
export function supportedMethods(capabilities: JsonObject): Method[] {
  const methods: Method[] = []
  for (const [method, provider] of providers) {
    const capability = capabilities[provider]
    if (capability !== true && !isObject(capability)) continue
    const edits =
      method === "textDocument/formatting" || method === "textDocument/rangeFormatting"
        ? " Returned edits are not applied."
        : ""
    methods.push({ method, description: `${method}. ${nativeParams}${edits}` })
  }

  for (const [method, provider] of [
    ["completionItem/resolve", "completionProvider"],
    ["workspaceSymbol/resolve", "workspaceSymbolProvider"],
  ] as const) {
    const capability = capabilities[provider]
    if (isObject(capability) && capability.resolveProvider === true) {
      methods.push({
        method,
        description: `${method}. Pass the original native item as params, preserving its data. ${nativeParams}`,
      })
    }
  }

  const sync = capabilities.textDocumentSync
  const openClose =
    typeof sync === "number" ? sync !== 0 : isObject(sync) && sync.openClose === true
  const change = typeof sync === "number" ? sync : isObject(sync) ? sync.change : 0
  if (openClose) {
    methods.push({
      method: "textDocument/didOpen",
      notification: true,
      description:
        "Open a document explicitly with native textDocument {uri, languageId, version, text}. Supply exact text and integer version; duplicate opens are rejected. No file is read or written.",
    })
    methods.push({
      method: "textDocument/didClose",
      notification: true,
      description:
        "Close a previously explicitly opened document using native textDocument {uri}. No file is read or written.",
    })
  }
  if (typeof change === "number" && change !== 0) {
    methods.push({
      method: "textDocument/didChange",
      notification: true,
      description: `Change a previously opened document using native textDocument {uri, version} and contentChanges. Version must be an increasing integer. ${change === 1 ? "Full-sync server: supply full replacement text only." : "Incremental server: supply full replacement text or native ranged changes using zero-based UTF-16 positions."} No edits are applied to files.`,
    })
  }
  return methods
}
