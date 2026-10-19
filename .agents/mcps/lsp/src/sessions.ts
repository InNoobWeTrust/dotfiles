import { readFile } from "node:fs/promises"
import { basename } from "node:path"
import { withStartupLock } from "../../shared/startup.ts"
import type { LspClient } from "./client.ts"
import { type Discovered, discover } from "./discovery.ts"
import { resolveWorkspacePath, type WorkspacePath } from "./paths.ts"
import { recipeLanguages } from "./recipes.ts"
import { requireCapability } from "./semantics.ts"

/** Methods the bridge owns; raw requests for them are rejected. */
const MANAGED_METHODS = new Set([
  "textDocument/didOpen",
  "textDocument/didChange",
  "textDocument/didClose",
  "initialize",
  "initialized",
  "shutdown",
  "exit",
])

interface OpenDocument {
  content: string
  version: number
  languageId: string
  lastUsed: number
}

export interface WarmSession {
  recipeId: string
  name: string
  client: LspClient
  documents: Map<string, OpenDocument>
  /** In-flight document syncs, coalescing parallel tool calls on the same file. */
  syncing: Map<string, Promise<boolean>>
  diagnostics: Map<string, { items: unknown[]; receivedAt: number }>
  listeners: Map<string, Set<(items: unknown[]) => void>>
  lastUsed: number
  dead: boolean
}

export interface AcquiredSession {
  session: WarmSession
  file: WorkspacePath
  content: string
  /** True when the language server was sent a didOpen/didChange in this call. */
  synced: boolean
  /** Timestamp captured before syncing; used to tell fresh pushes from stale cache. */
  syncedAt: number
}

export interface DiagnosticsResult {
  items: unknown[]
  source: "pull" | "push" | "cache"
  note?: string
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function positiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

/**
 * Owns warm language server sessions: recipe selection by file, automatic disk
 * syncing, diagnostics caching, LRU/TTL eviction and crash recovery. The client
 * module is imported lazily so read-only tools keep working without it.
 */
export class SessionManager {
  private readonly sessions = new Map<string, WarmSession>()
  private readonly starting = new Map<string, Promise<void>>()
  private discoveryCache?: { at: number; found: Discovered[] }
  private cachedRoot?: string
  private closing = false
  private readonly maxSessions: number
  private readonly idleTtlMs: number
  private readonly maxDocuments = 50
  private readonly diagnosticsWaitMs = 1000

  constructor(private readonly cwd: string) {
    this.maxSessions = positiveInt(process.env.LSP_MAX_SESSIONS, 4)
    this.idleTtlMs = positiveInt(process.env.LSP_IDLE_TTL_MS, 900_000)
  }

  async root(): Promise<string> {
    this.cachedRoot ??= (await resolveWorkspacePath(this.cwd, ".", { directory: true })).path
    return this.cachedRoot
  }

  private live(): WarmSession[] {
    return [...this.sessions.values()].filter((session) => !session.dead)
  }

  private installedList(found: Discovered[]): string {
    return found.map((recipe) => recipe.id).join(", ") || "none"
  }

  private async found(): Promise<Discovered[]> {
    const now = Date.now()
    if (!this.discoveryCache || now - this.discoveryCache.at > 10_000)
      this.discoveryCache = { at: now, found: await discover(this.cwd) }
    return this.discoveryCache.found
  }

  private async recipeById(id: string): Promise<Discovered> {
    const found = await this.found()
    const recipe = found.find((item) => item.id === id)
    if (!recipe)
      throw new Error(
        `Language server '${id}' is not installed; installed: ${this.installedList(found)}`,
      )
    return recipe
  }

  private async recipeFor(
    path: string,
    server?: string,
  ): Promise<{ recipe: Discovered; languageId: string }> {
    const name = basename(path)
    if (server !== undefined) {
      const recipe = await this.recipeById(server)
      const extension = name.includes(".") ? name.slice(name.lastIndexOf(".")) : ""
      const languageId =
        recipe.languages[name] ??
        (extension ? recipe.languages[extension] : undefined) ??
        recipe.languageIds[0] ??
        "plaintext"
      return { recipe, languageId }
    }
    const candidates = recipeLanguages(name)
    if (candidates.length === 0)
      throw new Error(`No language server recipe is registered for '${name}'`)
    const found = await this.found()
    const installedIds = new Set(found.map((recipe) => recipe.id))
    for (const candidate of candidates) {
      if (!installedIds.has(candidate.recipe.id)) continue
      const installed = found.find((recipe) => recipe.id === candidate.recipe.id)
      if (installed) return { recipe: installed, languageId: candidate.languageId }
    }
    throw new Error(
      `No installed language server for '${name}'; candidates: ${candidates.map((candidate) => candidate.recipe.id).join(", ")}`,
    )
  }

  /** Stops idle sessions; TTL is only evaluated on acquire, never on a timer. */
  private sweep(): void {
    const now = Date.now()
    for (const session of this.live()) {
      if (now - session.lastUsed <= this.idleTtlMs) continue
      this.sessions.delete(session.recipeId)
      session.client.stop().catch(() => undefined)
    }
  }

  private async evictIfNeeded(): Promise<void> {
    while (this.live().length >= this.maxSessions) {
      const oldest = this.live().reduce((left, right) =>
        left.lastUsed <= right.lastUsed ? left : right,
      )
      this.sessions.delete(oldest.recipeId)
      await oldest.client.stop().catch(() => undefined)
    }
  }

  private onEvent(session: WarmSession, method: string, params: unknown): void {
    if (method !== "textDocument/publishDiagnostics" || !isObject(params)) return
    const uri = params.uri
    if (typeof uri !== "string") return
    const items = Array.isArray(params.diagnostics) ? params.diagnostics : []
    session.diagnostics.set(uri, { items, receivedAt: Date.now() })
    for (const listener of [...(session.listeners.get(uri) ?? [])]) listener(items)
  }

  private onExit(session: WarmSession): void {
    session.dead = true
    if (this.sessions.get(session.recipeId) === session) this.sessions.delete(session.recipeId)
  }

  private async launch(recipe: Discovered): Promise<WarmSession> {
    await this.evictIfNeeded()
    const { LspClient } = await withStartupLock(() => import("./client.ts"), { name: "lsp" })
    const session: WarmSession = {
      recipeId: recipe.id,
      name: recipe.name,
      client: undefined as unknown as LspClient,
      documents: new Map(),
      syncing: new Map(),
      diagnostics: new Map(),
      listeners: new Map(),
      lastUsed: Date.now(),
      dead: false,
    }
    const client = new LspClient({
      executable: recipe.executable,
      args: recipe.args,
      cwd: this.cwd,
      onEvent: (method, params) => this.onEvent(session, method, params),
      onExit: () => this.onExit(session),
    })
    session.client = client
    try {
      await client.initialize()
    } catch (cause) {
      await client.stop().catch(() => undefined)
      throw cause
    }
    this.sessions.set(recipe.id, session)
    return session
  }

  private async ensure(recipe: Discovered): Promise<WarmSession> {
    if (this.closing) throw new Error("Server is closing")
    this.sweep()
    for (;;) {
      const existing = this.sessions.get(recipe.id)
      if (existing && !existing.dead) {
        existing.lastUsed = Date.now()
        return existing
      }
      if (existing) this.sessions.delete(recipe.id)
      const pending = this.starting.get(recipe.id)
      if (pending) {
        await pending.catch(() => undefined)
        continue
      }
      const launch = this.launch(recipe)
      this.starting.set(
        recipe.id,
        launch.then(
          () => undefined,
          () => undefined,
        ),
      )
      try {
        return await launch
      } finally {
        this.starting.delete(recipe.id)
      }
    }
  }

  private async syncDocument(
    session: WarmSession,
    file: WorkspacePath,
    content: string,
    languageId: string,
  ): Promise<boolean> {
    const inflight = session.syncing.get(file.uri)
    if (inflight) {
      await inflight.catch(() => undefined)
      return this.syncDocument(session, file, content, languageId)
    }
    const existing = session.documents.get(file.uri)
    if (existing && existing.content === content) {
      existing.lastUsed = Date.now()
      return false
    }
    const sync = this.performSync(session, file, content, languageId, existing)
    session.syncing.set(file.uri, sync)
    try {
      return await sync
    } finally {
      session.syncing.delete(file.uri)
    }
  }

  private async performSync(
    session: WarmSession,
    file: WorkspacePath,
    content: string,
    languageId: string,
    existing: OpenDocument | undefined,
  ): Promise<boolean> {
    if (!existing) {
      await session.client.call("textDocument/didOpen", {
        textDocument: { uri: file.uri, languageId, version: 1, text: content },
      })
      session.documents.set(file.uri, { content, version: 1, languageId, lastUsed: Date.now() })
      await this.trimDocuments(session)
      return true
    }
    const version = existing.version + 1
    await session.client.call("textDocument/didChange", {
      textDocument: { uri: file.uri, version },
      contentChanges: [{ text: content }],
    })
    existing.content = content
    existing.version = version
    return true
  }

  private async trimDocuments(session: WarmSession): Promise<void> {
    if (session.documents.size <= this.maxDocuments) return
    const ordered = [...session.documents.entries()].sort(
      (left, right) => left[1].lastUsed - right[1].lastUsed,
    )
    const excess = session.documents.size - this.maxDocuments
    for (const [uri] of ordered.slice(0, excess)) {
      session.documents.delete(uri)
      session.diagnostics.delete(uri)
      await session.client
        .call("textDocument/didClose", { textDocument: { uri } })
        .catch(() => undefined)
    }
  }

  /** Resolves the file, picks a recipe, syncs its disk content and returns the session. */
  async acquire(file: string, options: { server?: string } = {}): Promise<AcquiredSession> {
    const resolved = await resolveWorkspacePath(this.cwd, file)
    const content = await readFile(resolved.path, "utf8")
    const { recipe, languageId } = await this.recipeFor(resolved.path, options.server)
    const session = await this.ensure(recipe)
    const syncedAt = Date.now()
    const synced = await this.syncDocument(session, resolved, content, languageId)
    return { session, file: resolved, content, synced, syncedAt }
  }

  /** Expected on-disk content for documents the language server has seen. */
  syncedContent(uri: string): string | undefined {
    for (const session of this.live()) {
      const document = session.documents.get(uri)
      if (document) return document.content
    }
    return undefined
  }

  /** Pushes bridge-applied edit results back to every session holding the document open. */
  /**
   * Forgets open documents that a workspace edit renamed or deleted, so a
   * stale URI is never reused for a later didChange.
   */
  async forget(uris: string[]): Promise<void> {
    if (uris.length === 0) return
    for (const session of this.live()) {
      for (const uri of uris) {
        if (!session.documents.has(uri)) continue
        try {
          await session.client.call("textDocument/didClose", { textDocument: { uri } })
        } catch {
          // A dead transport already lost the document; forget it locally.
        }
        session.documents.delete(uri)
        session.diagnostics.delete(uri)
        session.listeners.delete(uri)
      }
    }
  }

  async notifyModified(files: Array<{ uri: string; content: string }>): Promise<void> {
    for (const file of files) {
      for (const session of this.live()) {
        const document = session.documents.get(file.uri)
        if (!document || document.content === file.content) continue
        const version = document.version + 1
        await session.client.call("textDocument/didChange", {
          textDocument: { uri: file.uri, version },
          contentChanges: [{ text: file.content }],
        })
        document.content = file.content
        document.version = version
      }
    }
  }

  /**
   * Diagnostics for one acquired document. Pull servers are asked directly;
   * push servers use the cache when fresh (received after the sync started),
   * otherwise wait once for a bounded time for the next publish.
   */
  async diagnosticsFor(acquired: AcquiredSession): Promise<DiagnosticsResult> {
    const { session, file, synced, syncedAt } = acquired
    if (isObject(session.client.capabilities) && session.client.capabilities.diagnosticProvider) {
      const result = await session.client.call("textDocument/diagnostic", {
        textDocument: { uri: file.uri },
      })
      const items = isObject(result) && Array.isArray(result.items) ? result.items : []
      session.diagnostics.set(file.uri, { items, receivedAt: Date.now() })
      return { items, source: "pull" }
    }
    const cached = session.diagnostics.get(file.uri)
    if (!synced) return { items: cached?.items ?? [], source: "cache" }
    if (cached && cached.receivedAt >= syncedAt) return { items: cached.items, source: "push" }
    const items = await new Promise<unknown[] | undefined>((resolve) => {
      const listeners = session.listeners.get(file.uri) ?? new Set<(items: unknown[]) => void>()
      let timer: ReturnType<typeof setTimeout>
      const listener = (value: unknown[]) => {
        listeners.delete(listener)
        clearTimeout(timer)
        resolve(value)
      }
      listeners.add(listener)
      session.listeners.set(file.uri, listeners)
      timer = setTimeout(() => {
        listeners.delete(listener)
        resolve(undefined)
      }, this.diagnosticsWaitMs)
    })
    if (items) return { items, source: "push" }
    return {
      items: cached?.items ?? [],
      source: "cache",
      note: `no fresh diagnostics were published within ${this.diagnosticsWaitMs}ms; results may be stale`,
    }
  }

  /**
   * Raw LSP escape hatch. Managed sync/lifecycle methods are refused; a file
   * hint acquires and syncs that document first, otherwise a warm or named
   * session is used.
   */
  async request(input: {
    server?: string
    file?: string
    method: string
    params?: unknown
  }): Promise<unknown> {
    if (MANAGED_METHODS.has(input.method))
      throw new Error(
        `Method ${input.method} is managed by this bridge; pass file to sync a document.`,
      )
    if (input.file !== undefined) {
      const acquired = await this.acquire(input.file, { server: input.server })
      return acquired.session.client.call(input.method, input.params ?? null)
    }
    if (input.server !== undefined) {
      const session = await this.ensure(await this.recipeById(input.server))
      return session.client.call(input.method, input.params ?? null)
    }
    const live = this.live()
    if (live.length === 1) {
      live[0].lastUsed = Date.now()
      return live[0].client.call(input.method, input.params ?? null)
    }
    if (live.length === 0)
      throw new Error("No language server session is warm yet; pass file or server to choose one.")
    throw new Error(
      `Several language server sessions are warm (${live.map((session) => session.recipeId).join(", ")}); pass server or file to choose one.`,
    )
  }

  /** workspace/symbol against a file-hinted, named, warm or single installed server. */
  async workspaceSymbols(input: { query: string; file?: string; server?: string }): Promise<{
    session: WarmSession
    items: unknown
  }> {
    let session: WarmSession
    if (input.file !== undefined) {
      session = (await this.acquire(input.file, { server: input.server })).session
    } else if (input.server !== undefined) {
      session = await this.ensure(await this.recipeById(input.server))
    } else {
      const live = this.live()
      if (live.length === 1) {
        session = live[0]
        session.lastUsed = Date.now()
      } else if (live.length > 1)
        throw new Error(
          `Several language server sessions are warm (${live.map((item) => item.recipeId).join(", ")}); pass server or file to choose one.`,
        )
      else {
        const found = await this.found()
        if (found.length !== 1)
          throw new Error(
            `No session is warm and no single server can be inferred; pass file or server (installed: ${this.installedList(found)}).`,
          )
        session = await this.ensure(found[0])
      }
    }
    requireCapability(
      session.client.capabilities,
      "workspaceSymbolProvider",
      "workspace/symbol",
      session.name,
    )
    return { session, items: await session.client.call("workspace/symbol", { query: input.query }) }
  }

  /** Stops every session this manager owns. */
  async close(): Promise<void> {
    this.closing = true
    const sessions = [...this.sessions.values()]
    this.sessions.clear()
    await Promise.allSettled(sessions.map((session) => session.client.stop()))
  }
}
