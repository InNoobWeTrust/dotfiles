import {
  createMessageConnection,
  StreamMessageReader,
  StreamMessageWriter,
} from "vscode-jsonrpc@8/node"

const connection = createMessageConnection(
  new StreamMessageReader(process.stdin),
  new StreamMessageWriter(process.stdout),
)
let initialized = false
let options: Record<string, unknown> = {}
const calls: string[] = []
connection.onRequest(
  "initialize",
  (params: { initializationOptions?: Record<string, unknown> }) => {
    options = params.initializationOptions ?? {}
    if (options.stubborn) process.on("SIGTERM", () => {})
    return {
      capabilities: {
        positionEncoding: options.encoding ?? "utf-16",
        textDocumentSync: { openClose: true, change: 2 },
        hoverProvider: true,
        definitionProvider: false,
        completionProvider: { resolveProvider: true },
      },
    }
  },
)
connection.onNotification("initialized", () => {
  initialized = true
})
connection.onNotification("textDocument/didOpen", (params) => {
  calls.push("open")
  connection.sendNotification("textDocument/publishDiagnostics", {
    uri: params.textDocument.uri,
    diagnostics: [],
  })
})
connection.onNotification("textDocument/didChange", () => {
  calls.push("change")
})
connection.onNotification("textDocument/didClose", () => {
  calls.push("close")
})
connection.onRequest("textDocument/hover", async (params) => {
  if (!initialized) throw new Error("missing initialized")
  if (options.crash) process.exit(3)
  if (options.hang) return new Promise(() => {})
  const configuration = await connection.sendRequest("workspace/configuration", {
    items: [{ section: "test.answer" }, { section: "missing" }],
  })
  const edit = await connection.sendRequest("workspace/applyEdit", { edit: {} })
  return { params, calls: [...calls], configuration, edit, processId: process.pid }
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
