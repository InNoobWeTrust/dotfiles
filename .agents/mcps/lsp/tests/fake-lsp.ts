import { createMessageConnection, StreamMessageReader, StreamMessageWriter } from "vscode-jsonrpc@8"
import { writeFileSync } from "node:fs"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const pidFile = process.env.LSP_FAKE_PID_FILE
if (pidFile) writeFileSync(pidFile, String(process.pid))

const connection = createMessageConnection(
  new StreamMessageReader(process.stdin),
  new StreamMessageWriter(process.stdout),
)
const envOptions = JSON.parse(process.env.LSP_FAKE_OPTIONS ?? "{}") as Record<string, unknown>
let initialized = false
let options: Record<string, unknown> = { ...envOptions }
const calls: string[] = []
const supports = (name: string) =>
  (options.supports as Record<string, boolean> | undefined)?.[name] !== false
const range = (line = 1, start = 2, end = 5) => ({
  start: { line, character: start },
  end: { line, character: end },
})
const location = (uri: string) => ({ uri, range: range() })

connection.onRequest(
  "initialize",
  (params: { initializationOptions?: Record<string, unknown> }) => {
    options = { ...envOptions, ...(params.initializationOptions ?? {}) }
    if (options.stubborn) process.on("SIGTERM", () => {})
    return {
      capabilities: {
        positionEncoding: options.encoding ?? "utf-16",
        textDocumentSync: { openClose: true, change: 2 },
        hoverProvider: true,
        definitionProvider: supports("definition"),
        referencesProvider: supports("references"),
        documentSymbolProvider: supports("symbols"),
        documentFormattingProvider: supports("formatting"),
        renameProvider: supports("rename"),
        workspaceSymbolProvider: supports("workspaceSymbols"),
        completionProvider: { resolveProvider: true },
        ...(options.pullDiagnostics
          ? { diagnosticProvider: { documentSelector: null, interFileDependencies: false } }
          : {}),
      },
    }
  },
)
connection.onNotification("initialized", () => {
  initialized = true
})
const publish = (uri: string) => {
  const mode = (options.publish as string | undefined) ?? "immediate"
  if (mode === "none") return
  if (mode === "delayed") {
    setTimeout(() => {
      connection.sendNotification("textDocument/publishDiagnostics", {
        uri,
        diagnostics: [
          {
            range: { start: { line: 0, character: 1 }, end: { line: 0, character: 2 } },
            severity: 2,
            message: "delayed warning",
            source: "fake",
          },
        ],
      })
    }, 150)
    return
  }
  connection.sendNotification("textDocument/publishDiagnostics", { uri, diagnostics: [] })
}
connection.onNotification("textDocument/didOpen", (params) => {
  calls.push("open")
  publish(params.textDocument.uri)
})
connection.onNotification("textDocument/didChange", (params) => {
  calls.push("change")
  publish(params.textDocument.uri)
})
connection.onNotification("textDocument/didClose", () => {
  calls.push("close")
})
connection.onRequest(
  "textDocument/hover",
  async (params: { position?: { line: number; character: number } }) => {
    if (!initialized) throw new Error("missing initialized")
    if (options.crash) process.exit(3)
    if (options.hang) return new Promise(() => {})
    const configuration = await connection.sendRequest("workspace/configuration", {
      items: [{ section: "test.answer" }, { section: "missing" }],
    })
    const edit = await connection.sendRequest("workspace/applyEdit", { edit: {} })
    return {
      contents: {
        kind: "markdown",
        value: `pos:${params?.position?.line ?? -1}:${params?.position?.character ?? -1}`,
      },
      params,
      calls: [...calls],
      configuration,
      edit,
      tag: process.env.LSP_FAKE_TAG ?? null,
      processId: process.pid,
    }
  },
)
connection.onRequest("textDocument/definition", (params: { textDocument: { uri: string } }) => {
  calls.push("definition")
  const count = (options.definitions as number | undefined) ?? 1
  return count === 0 ? null : Array.from({ length: count }, () => location(params.textDocument.uri))
})
connection.onRequest("textDocument/references", (params: { textDocument: { uri: string } }) => {
  calls.push("references")
  const count = (options.references as number | undefined) ?? 2
  return Array.from({ length: count }, () => location(params.textDocument.uri))
})
connection.onRequest("textDocument/documentSymbol", () => {
  calls.push("symbols")
  return [
    {
      name: "Widget",
      kind: 5,
      range: { start: { line: 0, character: 0 }, end: { line: 1, character: 0 } },
      selectionRange: { start: { line: 0, character: 6 }, end: { line: 0, character: 12 } },
      children: [
        {
          name: "render",
          kind: 6,
          range: { start: { line: 1, character: 0 }, end: { line: 1, character: 8 } },
          selectionRange: { start: { line: 1, character: 2 }, end: { line: 1, character: 8 } },
        },
      ],
    },
  ]
})
connection.onRequest("workspace/symbol", () => {
  calls.push("workspaceSymbol")
  const count = (options.workspaceSymbols as number | undefined) ?? 2
  const uri = pathToFileURL(join(process.cwd(), "ws.js")).href
  return Array.from({ length: count }, (_, index) => ({
    name: `sym${index}`,
    kind: 12,
    location: { uri, range: range(0, 0, 3) },
  }))
})
connection.onRequest(
  "textDocument/rename",
  (params: { textDocument: { uri: string }; newName: string }) => {
    calls.push("rename")
    const edit = {
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 3 } },
      newText: params.newName,
    }
    if (options.noRename) return null
    if (options.renameFileOps) {
      const target = params.textDocument.uri.endsWith(".vue")
        ? params.textDocument.uri.replace(/\.vue$/, ".moved.vue")
        : `${params.textDocument.uri}.moved`
      return {
        documentChanges: [
          { kind: "rename", oldUri: params.textDocument.uri, newUri: target },
          { textDocument: { uri: target, version: null }, edits: [edit] },
        ],
      }
    }
    return {
      documentChanges: [
        { textDocument: { uri: params.textDocument.uri, version: null }, edits: [edit] },
        {
          textDocument: {
            uri: pathToFileURL(join(process.cwd(), "other.py")).href,
            version: null,
          },
          edits: [edit],
        },
      ],
    }
  },
)
connection.onRequest(
  "textDocument/formatting",
  async (params: { textDocument: { uri: string } }) => {
    calls.push("format")
    const mode = options.formatMode as string | undefined
    if (mode === "none") return null
    if (mode === "empty") return []
    const content = await readFile(fileURLToPath(params.textDocument.uri), "utf8").catch(() => "")
    if (!content.startsWith("bad ")) return null
    return [
      {
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 4 } },
        newText: "good ",
      },
    ]
  },
)
connection.onRequest("textDocument/diagnostic", () => {
  calls.push("diagnostic")
  return {
    kind: "full",
    items: [
      {
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 1 } },
        severity: 1,
        message: "pull problem",
        source: "fake",
      },
    ],
  }
})
connection.onRequest("textDocument/completion", () => [])
connection.onRequest("completionItem/resolve", (params) => params)
connection.onRequest("shutdown", () => (options.stubborn ? new Promise(() => {}) : null))
connection.onNotification("exit", () => {
  if (!options.stubborn) {
    connection.dispose()
    process.exit(0)
  }
})
connection.listen()
