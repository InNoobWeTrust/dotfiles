import { randomBytes } from "node:crypto"
import { Hono, type Context } from "hono@4.13.13"
import type { ContentfulStatusCode } from "hono@4.13.13/utils/http-status"
import { BoardError, BoardStore, catalogInput, eventInput } from "../sessions/store.ts"
import type { Session } from "../sessions/store.ts"
import { HostDocument, FrameDocument, DashboardDocument } from "./documents.tsx"
import browserJS from "../browser/shell.js" with { type: "text" }
import frameJS from "../browser/frame.js" with { type: "text" }
import browserCSS from "../browser/shell.css" with { type: "text" }
import { CATALOG_ID } from "../catalog/identity.ts"

const commonHeaders = {
  "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff",
}
type HTTPEnv = { Variables: { session: Session; base: string; origin: string } }

// Explicit MIME and common headers also cover middleware errors and router misses.
const json = (c: Context<HTTPEnv>, value: unknown, status = 200) =>
  c.newResponse(JSON.stringify(value), status as ContentfulStatusCode, { ...commonHeaders, "Content-Type": "application/json" })

/** Read streaming input under a byte AND time bound, independent of Content-Length. */
async function readJSON(request: Request, max: number) {
  if (request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() !== "application/json")
    throw new BoardError("application_json_required", 415)
  if (!request.body) throw new BoardError("invalid_json")
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let length = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  const deadline = new Promise<never>((_, reject) => { timer = setTimeout(() => { void reader.cancel(); reject(new BoardError("body_timeout", 408)) }, 5000) })
  try {
    while (true) {
      const { done, value } = await Promise.race([reader.read(), deadline])
      if (done) break
      length += value.byteLength
      if (length > max) { void reader.cancel(); throw new BoardError("body_too_large", 413) }
      chunks.push(value)
    }
    try { return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks))) }
    catch { throw new BoardError("invalid_json") }
  } finally { clearTimeout(timer); reader.releaseLock() }
}

/** Lazy loopback listener owned by the attached stdio server, never a detached process. */
export class StudioHTTP {
  private listener?: ReturnType<typeof Bun.serve>
  private app = new Hono<HTTPEnv>({ strict: true })

  constructor(private store: BoardStore, private assets: { bundle: string; bundleCSS: string }) {
    this.app.use("*", async (c, next) => {
      for (const [name, value] of Object.entries(commonHeaders)) c.header(name, value)
      const request = c.req.raw
      const host = request.headers.get("host")
      if (host !== `127.0.0.1:${this.listener?.port}` && host !== `localhost:${this.listener?.port}`)
        throw new BoardError("invalid_host", 403)
      const origin = `http://${host}`
      // Reject HEAD before Hono can fall back to GET; no automatic OPTIONS/405.
      if (request.method !== "GET" && request.method !== "POST") throw new BoardError("not_found", 404)
      const path = new URL(request.url).pathname
      if (path === "/" || path === "/dashboard.css") {
        if (request.method !== "GET") throw new BoardError("not_found", 404)
        const site = request.headers.get("sec-fetch-site")
        if (site && site !== "none" && site !== "same-origin") throw new BoardError("cross_site_denied", 403)
        c.set("origin", origin)
        await next()
        return
      }
      const match = /^\/board\/([a-f0-9]{64})(?:\/(.*))?$/.exec(path)
      if (!match) throw new BoardError("not_found", 404)
      const session = this.store.byToken(match[1])
      const route = match[2] ?? ""
      const publicAsset = request.method === "GET" && (route === "bundle.js" || route === "bundle.css")
      const site = request.headers.get("sec-fetch-site")
      if (!publicAsset && site && site !== "none" && site !== "same-origin") throw new BoardError("cross_site_denied", 403)
      if (request.method === "POST" && request.headers.get("origin") !== origin) throw new BoardError("invalid_origin", 403)
      // Validate RAW resource spelling after the security guards, before handlers
      // consume decoded params. This is not a redirect or a decoded-path alias.
      if (!/^(?:|snapshot|bundle\.js|bundle\.css|browser\.js|browser\.css|catalog|events|frame\/(?:0|[1-9][0-9]*)\/[a-f0-9]{32})$/.test(route))
        throw new BoardError("not_found", 404)
      c.set("session", session)
      c.set("base", `/board/${session.token}`)
      c.set("origin", origin)
      await next()
    })

    this.app.onError((cause, c) => {
      if (cause instanceof BoardError) return json(c, { error: cause.code, ...cause.details }, cause.status)
      if (cause.name === "ZodError") return json(c, { error: "invalid_payload" }, 400)
      console.error("ui-studio HTTP failure:", cause.message)
      return json(c, { error: "internal_error" }, 500)
    })
    this.app.notFound((c) => json(c, { error: "not_found" }, 404))

    this.app.get("/", (c) => {
      c.header("Content-Security-Policy", "default-src 'none'; style-src 'self'; frame-ancestors 'none'; form-action 'none'; base-uri 'none'")
      return c.html(`<!doctype html>${DashboardDocument({ boards: this.store.list() })}`, 200, { "Content-Type": "text/html; charset=utf-8" })
    })
    this.app.get("/dashboard.css", (c) => c.body(`${this.assets.bundleCSS}\n${browserCSS}`, 200, { "Content-Type": "text/css" }))

    this.app.post("/board/:token/catalog", async (c) =>
      json(c, this.store.setCatalog(c.get("session").session_id, catalogInput.parse(await readJSON(c.req.raw, 800 * 1024)))))
    this.app.post("/board/:token/events", async (c) =>
      json(c, this.store.record(c.get("session").session_id, eventInput.parse(await readJSON(c.req.raw, 32 * 1024)))))
    this.app.get("/board/:token/snapshot", (c) => json(c, this.store.inspect(c.get("session").session_id, 0, true)))
    this.app.get("/board/:token/bundle.js", (c) => c.body(this.assets.bundle, 200, {
      "Content-Type": "text/javascript", "Cross-Origin-Resource-Policy": "cross-origin",
    }))
    this.app.get("/board/:token/bundle.css", (c) => c.body(this.assets.bundleCSS, 200, {
      "Content-Type": "text/css", "Cross-Origin-Resource-Policy": "cross-origin",
    }))
    this.app.get("/board/:token/browser.js", (c) => c.body(browserJS, 200, { "Content-Type": "text/javascript" }))
    this.app.get("/board/:token/browser.css", (c) => c.body(browserCSS, 200, { "Content-Type": "text/css" }))
    // Both the bare capability path and its single trailing slash were host pages.
    this.app.get("/board/:token", (c) => this.host(c))
    this.app.get("/board/:token/", (c) => this.host(c))
    this.app.get("/board/:token/frame/:revision/:channel", (c) => {
      const session = c.get("session")
      const revision = Number(c.req.param("revision"))
      const draft = session.revisions.find((r) => r.revision === revision)
      if (revision !== 0 && !draft) throw new BoardError("revision_unavailable", 404)
      const nonce = randomBytes(16).toString("hex")
      c.header("Content-Security-Policy", `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline' ${c.get("origin")}${c.get("base")}/bundle.css; img-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'; frame-ancestors ${c.get("origin")}`)
      return c.html(`<!doctype html>${FrameDocument({ base: c.get("base"), nonce, catalogID: CATALOG_ID, source: draft?.source ?? null, channel: c.req.param("channel"), frameJS })}`, 200, { "Content-Type": "text/html; charset=utf-8" })
    })
  }

  start() {
    this.listener ??= Bun.serve({ hostname: "127.0.0.1", port: 0, idleTimeout: 10,
      maxRequestBodySize: 800 * 1024, fetch: (request) => this.app.fetch(request),
    })
    return `http://127.0.0.1:${this.listener.port}`
  }

  stop() { this.listener?.stop(true); this.listener = undefined }

  private host(c: Context<HTTPEnv>) {
    const nonce = randomBytes(16).toString("hex")
    c.header("Content-Security-Policy", `default-src 'none'; script-src 'nonce-${nonce}' 'self'; style-src 'self'; connect-src 'self'; frame-src 'self'; frame-ancestors 'none'; form-action 'none'; base-uri 'none'`)
    return c.html(`<!doctype html>${HostDocument({ base: c.get("base"), nonce, catalogID: CATALOG_ID, title: c.get("session").title })}`, 200, { "Content-Type": "text/html; charset=utf-8" })
  }
}
