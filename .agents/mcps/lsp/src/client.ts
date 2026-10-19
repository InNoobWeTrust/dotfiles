import {
  CancellationTokenSource,
  createMessageConnection,
  ErrorCodes,
  type MessageConnection,
  ResponseError,
  StreamMessageReader,
  StreamMessageWriter,
} from "vscode-jsonrpc@8"
import { type ChildProcessWithoutNullStreams, spawn } from "node:child_process"
import { pathToFileURL } from "node:url"

export type JsonObject = Record<string, unknown>

interface ClientOptions {
  executable: string
  args: string[]
  cwd: string
  initializationOptions?: JsonObject
  settings?: JsonObject
  onEvent: (method: string, params: unknown) => void
  onExit: () => void
  requestTimeoutMs?: number
}

function isObject(value: unknown): value is JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value)
}

function isPosition(value: unknown): value is { line: number; character: number } {
  return (
    isObject(value) &&
    Number.isInteger(value.line) &&
    Number(value.line) >= 0 &&
    Number.isInteger(value.character) &&
    Number(value.character) >= 0
  )
}

function validateChanges(changes: unknown, fullSync: boolean): void {
  if (!Array.isArray(changes) || changes.length === 0) {
    throw new Error("contentChanges must be a nonempty native LSP array")
  }
  for (const change of changes) {
    if (!isObject(change) || typeof change.text !== "string") {
      throw new Error("Each content change requires text")
    }
    if (change.range === undefined) {
      if (change.rangeLength !== undefined) throw new Error("rangeLength requires a range")
      continue
    }
    if (fullSync) throw new Error("Full-sync servers require full text replacements")
    if (
      !isObject(change.range) ||
      !isPosition(change.range.start) ||
      !isPosition(change.range.end)
    ) {
      throw new Error("Change ranges require nonnegative integer UTF-16 positions")
    }
    const { start, end } = change.range
    if (end.line < start.line || (end.line === start.line && end.character < start.character)) {
      throw new Error("Change range end precedes start")
    }
    if (
      change.rangeLength !== undefined &&
      (!Number.isInteger(change.rangeLength) || Number(change.rangeLength) < 0)
    ) {
      throw new Error("rangeLength must be a nonnegative integer")
    }
  }
}

/** One owned stdio server. Calls are serialized; document contents never touch disk. */
export class LspClient {
  public capabilities: JsonObject = {}
  private child?: ChildProcessWithoutNullStreams
  private connection?: MessageConnection
  private initialized = false
  private initializing?: Promise<void>
  private stopping?: Promise<void>
  private stopped = false
  private exited = false
  private transportClosed = false
  private queue: Promise<void> = Promise.resolve()
  private documents = new Map<string, number>()
  private readonly workspace: { uri: string; name: string }

  constructor(private readonly options: ClientOptions) {
    const uri = pathToFileURL(options.cwd).href
    this.workspace = { uri, name: options.cwd.split(/[\\/]/).filter(Boolean).at(-1) ?? options.cwd }
  }

  /** Initializes once, rejecting unsupported position encodings and cleaning up on failure. */
  async initialize(): Promise<void> {
    if (this.stopped || this.stopping) throw new Error("LSP client is stopped")
    this.initializing ??= this.start()
    return this.initializing
  }

  private async start(): Promise<void> {
    try {
      const child = spawn(this.options.executable, this.options.args, {
        cwd: this.options.cwd,
        stdio: ["pipe", "pipe", "pipe"],
        shell: false,
      })
      this.child = child
      const connection = createMessageConnection(
        new StreamMessageReader(child.stdout),
        new StreamMessageWriter(child.stdin),
      )
      this.connection = connection
      child.stderr.on("data", (chunk: Buffer) => {
        this.options.onEvent("lsp/stderr", {
          text: chunk.subarray(0, 8192).toString("utf8"),
          truncated: chunk.length > 8192,
        })
      })
      child.on("error", (error) => this.failTransport(error))
      child.on("exit", (code, signal) => {
        this.failTransport(new Error(`LSP process exited (code=${code}, signal=${signal})`))
      })
      connection.onClose(() => this.failTransport(new Error("LSP transport closed")))
      connection.onError(([error]) => this.failTransport(error))
      connection.onNotification((method, params) => this.options.onEvent(method, params))
      connection.onRequest((method, params) => this.serverRequest(method, params))
      connection.listen()

      const result = await this.request(
        "initialize",
        {
          processId: process.pid,
          clientInfo: { name: "agents-lsp", version: "0.1.0" },
          rootUri: this.workspace.uri,
          workspaceFolders: [this.workspace],
          capabilities: {
            workspace: { configuration: true, workspaceFolders: true },
            general: { positionEncodings: ["utf-16"] },
          },
          initializationOptions: this.options.initializationOptions,
        },
        15000,
      )
      if (!isObject(result) || !isObject(result.capabilities))
        throw new Error("LSP initialize returned no capabilities object")
      const encoding = result.capabilities.positionEncoding
      if (encoding !== undefined && encoding !== "utf-16") {
        throw new Error(
          `Unsupported LSP position encoding ${JSON.stringify(encoding)}; this bridge requires utf-16`,
        )
      }
      this.capabilities = result.capabilities
      await this.bounded(
        connection.sendNotification("initialized", {}),
        15000,
        "initialized notification",
      )
      if (this.stopping || this.transportClosed)
        throw new Error("LSP stopped during initialization")
      this.initialized = true
    } catch (error) {
      await this.stop()
      throw error
    }
  }

  private serverRequest(method: string, params: unknown): unknown {
    switch (method) {
      case "workspace/configuration": {
        if (!isObject(params) || !Array.isArray(params.items)) {
          throw new ResponseError(ErrorCodes.InvalidParams, "configuration requires items")
        }
        return params.items.map((item: unknown) => {
          if (!isObject(item)) return null
          let value: unknown = this.options.settings ?? null
          if (typeof item.section === "string" && item.section.length > 0) {
            for (const part of item.section.split(".")) {
              value = isObject(value) && Object.hasOwn(value, part) ? value[part] : null
            }
          }
          return value ?? null
        })
      }
      case "workspace/workspaceFolders":
        return [this.workspace]
      case "workspace/applyEdit":
        // Server -> client reverse request, not an MCP tool. The initialize
        // capabilities omit workspace.applyEdit, so conforming servers must not
        // send this; the explicit refusal covers servers that do anyway. Edits
        // must flow through the bridge tools (rename/format) so they are
        // validated, applied, and reported. This response goes back to the
        // language server, never to the MCP agent, and costs no agent context.
        return {
          applied: false,
          failureReason:
            "Server-initiated workspace edits are refused; use the bridge's rename/format tools",
        }
      case "window/showMessageRequest":
      case "window/workDoneProgress/create":
        return null
      default:
        throw new ResponseError(ErrorCodes.MethodNotFound, `Unsupported server request: ${method}`)
    }
  }

  /** Native feature request or validated explicit sync notification; never filters capabilities. */
  async call(method: string, params: JsonObject): Promise<unknown> {
    if (this.stopping || this.stopped) throw new Error("LSP client is stopped")
    const operation = this.queue.then(async () => {
      if (!this.initialized || this.transportClosed || this.stopping)
        throw new Error("LSP client is not running")
      if (!isObject(params)) throw new Error("Native LSP params must be an object")
      if (
        ["textDocument/didOpen", "textDocument/didChange", "textDocument/didClose"].includes(method)
      ) {
        return this.syncDocument(method, params)
      }
      return this.request(method, params, this.options.requestTimeoutMs ?? 30000)
    })
    // Recover only the ordering tail; the caller still receives the original rejection.
    this.queue = operation.then(
      () => undefined,
      () => undefined,
    )
    return operation
  }

  private async syncDocument(method: string, params: JsonObject): Promise<null> {
    const document = params.textDocument
    if (!isObject(document) || typeof document.uri !== "string" || document.uri.length === 0) {
      throw new Error("textDocument.uri must be a nonempty URI")
    }
    try {
      new URL(document.uri)
    } catch {
      throw new Error("textDocument.uri must be an absolute URI")
    }
    const previous = this.documents.get(document.uri)
    if (method === "textDocument/didOpen") {
      if (previous !== undefined) throw new Error("Document is already open")
      if (
        typeof document.languageId !== "string" ||
        typeof document.text !== "string" ||
        !Number.isInteger(document.version)
      ) {
        throw new Error("didOpen requires languageId, text, and an integer version")
      }
    } else {
      if (previous === undefined) throw new Error("Document must be explicitly opened first")
      if (method === "textDocument/didChange") {
        if (!Number.isInteger(document.version) || Number(document.version) <= previous) {
          throw new Error("didChange version must be an increasing integer")
        }
        const sync = this.capabilities.textDocumentSync
        const changeMode = isObject(sync) ? sync.change : sync
        validateChanges(params.contentChanges, changeMode === 1)
      }
    }
    const connection = this.connection
    if (!connection) throw new Error("LSP transport is unavailable")
    try {
      await this.bounded(
        connection.sendNotification(method, params),
        this.options.requestTimeoutMs ?? 30000,
        method,
      )
    } catch (error) {
      // A partially written notification leaves server document state uncertain.
      this.failTransport(error instanceof Error ? error : new Error(String(error)))
      throw error
    }
    if (this.transportClosed) throw new Error("LSP transport closed during document sync")
    if (method === "textDocument/didClose") this.documents.delete(document.uri)
    else this.documents.set(document.uri, Number(document.version))
    return null
  }

  private async request(
    method: string,
    params: JsonObject | null,
    timeoutMs: number,
  ): Promise<unknown> {
    const connection = this.connection
    if (!connection || this.transportClosed) throw new Error("LSP transport is unavailable")
    const cancellation = new CancellationTokenSource()
    try {
      return await this.bounded(
        connection.sendRequest<unknown>(method, params, cancellation.token),
        timeoutMs,
        method,
        () => cancellation.cancel(),
      )
    } finally {
      cancellation.dispose()
    }
  }

  private async bounded<T>(
    operation: Promise<T>,
    timeoutMs: number,
    label: string,
    onTimeout?: () => void,
  ): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
      return await Promise.race([
        operation,
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => {
            reject(new Error(`LSP ${label} timed out after ${timeoutMs}ms`))
            onTimeout?.()
          }, timeoutMs)
        }),
      ])
    } finally {
      clearTimeout(timer)
    }
  }

  private failTransport(error: Error): void {
    if (this.transportClosed) return
    this.transportClosed = true
    this.initialized = false
    this.documents.clear()
    this.connection?.dispose()
    this.options.onEvent("lsp/transportClosed", { message: error.message })
    this.notifyExit()
    // Also reap a child that closed stdout without exiting.
    if (!this.stopping)
      void this.stop().catch((failure: unknown) => {
        this.options.onEvent("lsp/cleanupError", { message: String(failure) })
      })
  }

  private notifyExit(): void {
    if (this.exited) return
    this.exited = true
    this.options.onExit()
  }

  /** Idempotent bounded shutdown/exit, then TERM/KILL of this client's child only. */
  async stop(): Promise<void> {
    this.stopping ??= this.shutdown()
    return this.stopping
  }

  private async shutdown(): Promise<void> {
    // Start asynchronously so stopping is assigned before any lifecycle callbacks.
    await Promise.resolve()
    const child = this.child
    try {
      if (this.initialized && !this.transportClosed) {
        try {
          await this.request("shutdown", null, 2000)
        } catch (error) {
          this.options.onEvent("lsp/shutdownError", { message: String(error) })
        }
        if (!this.transportClosed && this.connection) {
          try {
            await this.bounded(this.connection.sendNotification("exit"), 500, "exit notification")
          } catch (error) {
            this.options.onEvent("lsp/shutdownError", { message: String(error) })
          }
        }
      }
      this.transportClosed = true
      this.connection?.dispose()
      if (child?.pid && !(await this.waitForExit(child, 500))) {
        child.kill("SIGTERM")
        if (!(await this.waitForExit(child, 1000))) {
          child.kill("SIGKILL")
          if (!(await this.waitForExit(child, 1000)))
            throw new Error("Owned LSP child did not exit after SIGKILL")
        }
      }
    } finally {
      this.initialized = false
      this.stopped = true
      this.documents.clear()
      this.notifyExit()
    }
  }

  private async waitForExit(
    child: ChildProcessWithoutNullStreams,
    timeoutMs: number,
  ): Promise<boolean> {
    if (child.exitCode !== null || child.signalCode !== null) return true
    return new Promise<boolean>((resolve) => {
      const finish = (exited: boolean) => {
        clearTimeout(timer)
        child.off("exit", onExit)
        resolve(exited)
      }
      const onExit = () => finish(true)
      const timer = setTimeout(() => finish(false), timeoutMs)
      child.once("exit", onExit)
    })
  }
}
