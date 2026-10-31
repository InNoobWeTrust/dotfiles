import assert from "node:assert/strict"
import { resolve } from "node:path"
import { randomUUID } from "node:crypto"
import { Client } from "@modelcontextprotocol/sdk@1/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk@1/client/stdio.js"
import { BoardStore } from "../src/boards/store.ts"

// Protocol fixtures intentionally do not demonstrate browser catalog generation or render success.
const fixtureCatalog = { prompt: "PROTOCOL FIXTURE ONLY: TextContent(text)", bundle_version: "carbon-white-charts-1" as const }
const fixtureSource = 'root = TextContent("Protocol fixture")'
const fixtureTitle = "E2E <script>alert(1)</script> & draft"
const fixtureChatLabel = 'Chat <img src=x onerror="alert(2)"> & review'
const client = new Client({ name: "ui-studio-e2e", version: "1" })
const launchOptions = {
  command: resolve(import.meta.dir, "../bin/mcp-ui-studio"), args: [],
  cwd: import.meta.dir, stderr: "pipe" as const,
  env: Object.fromEntries(Object.entries({
    PATH: process.env.PATH ?? "", HOME: process.env.HOME, TMPDIR: process.env.TMPDIR,
    XDG_CACHE_HOME: process.env.XDG_CACHE_HOME, BUN_INSTALL_CACHE_DIR: process.env.BUN_INSTALL_CACHE_DIR,
  }).filter((entry): entry is [string, string] => typeof entry[1] === "string")),
}
const transport = new StdioClientTransport(launchOptions)
transport.stderr?.on("data", (chunk: Buffer) => process.stderr.write(chunk))
type Response = Awaited<ReturnType<Client["callTool"]>>
const decode = (response: Response) => JSON.parse((response.content as { text: string }[])[0].text)
const call = (name: string, args: Record<string, unknown>) => client.callTool({ name, arguments: args })
async function toolError(name: string, args: Record<string, unknown>, expected: string) {
  const response = await call(name, args)
  assert.equal(response.isError, true)
  assert.equal(decode(response).error, expected)
  return decode(response)
}

function commonPolicy(response: globalThis.Response) {
  assert.equal(response.headers.get("cache-control"), "no-store")
  assert.equal(response.headers.get("referrer-policy"), "no-referrer")
  assert.equal(response.headers.get("x-content-type-options"), "nosniff")
  assert.equal(response.headers.get("access-control-allow-origin"), null)
}

async function httpError(response: globalThis.Response, status: number, error: string, head = false) {
  assert.equal(response.status, status)
  commonPolicy(response)
  assert.equal(response.headers.get("content-type"), "application/json")
  if (head) assert.equal(await response.text(), "")
  else assert.equal((await response.json()).error, error)
}

function documentNonce(response: globalThis.Response, html: string, expectedCount: number) {
  commonPolicy(response)
  assert.equal(response.headers.get("content-type"), "text/html; charset=utf-8")
  const nonce = /'nonce-([a-f0-9]{32})'/.exec(response.headers.get("content-security-policy") ?? "")?.[1]
  assert(nonce, "CSP must carry a fresh nonce")
  const attributes = [...html.matchAll(/<(?:script|style)\b[^>]*\bnonce="([^"]+)"/g)]
  assert.equal(attributes.length, expectedCount)
  for (const attribute of attributes) assert.equal(attribute[1], nonce)
  assert.equal([...html.matchAll(/<script\b/g)].length, expectedCount === 1 ? 1 : 2)
  return nonce
}

function criticalStoreTransitions() {
  let now = 1000
  const store = new BoardStore(() => now)
  const session = store.acquire("Critical state", "Critical chat")
  assert.equal(session.acquired_at, 1000)
  const listed = store.list()
  assert.deepEqual(listed, [{ session_id: session.session_id, token: session.token, title: "Critical state", chat_label: "Critical chat", acquired_at: 1000, current_revision: 0 }])
  listed[0].title = "Snapshot mutation"
  listed.pop()
  assert.equal(store.list()[0].title, "Critical state")
  store.setCatalog(session.session_id, fixtureCatalog)
  assert.deepEqual(store.setCatalog(session.session_id, fixtureCatalog).status, "catalog_ready")
  assert.throws(() => store.setCatalog(session.session_id, { ...fixtureCatalog, prompt: "conflict" }), /catalog_conflict/)
  for (let revision = 0; revision < 65; revision++) store.publish(session.session_id, revision, fixtureSource)
  assert.equal(session.revisions.length, 64)
  assert.equal(session.revisions[0].revision, 2)
  assert.equal(session.current_revision, 65)
  assert.equal(store.list()[0].current_revision, 65)
  assert.equal(Object.values(store.list()[0]).every((value) => value === undefined || typeof value === "string" || typeof value === "number"), true)
  assert.throws(() => store.publish(session.session_id, 64, fixtureSource), /revision_conflict/)
  assert.throws(() => store.record(session.session_id, { client_id: randomUUID(), revision: 1, kind: "feedback", text: "trimmed" }), /revision_unavailable/)
  const client_id = randomUUID()
  for (let count = 0; count < 205; count++) store.record(session.session_id, { client_id, revision: 2, kind: "feedback", text: "bounded event" })
  const snapshot = store.inspect(session.session_id)
  assert.equal(snapshot.events.length, 200)
  assert.equal(snapshot.oldest_event_id, 6)
  assert.equal(snapshot.latest_event_id, 205)
  assert.equal(snapshot.events_lost, true)
  assert.equal(store.inspect(session.session_id, 5).events_lost, false)
  assert.equal(store.inspect(session.session_id, 204).events.length, 1)
  assert(!("source" in snapshot.revisions[0]))
  assert.equal(store.inspect(session.session_id, 0, true).revisions[0].source, fixtureSource)
  store.record(session.session_id, { client_id, revision: 2, kind: "render_observation", status: "error", text: "unknown component" })
  assert.equal(store.inspect(session.session_id).revisions[0].render_status, "error")
  assert.equal(store.inspect(session.session_id).revisions.at(-1)?.render_status, "pending")
  assert.throws(() => store.publish(session.session_id, 65, "é".repeat(32769)), /byte bound/)
  const other = store.acquire("Other board")
  for (let count = 0; count < 6; count++) store.acquire("Capacity")
  assert.throws(() => store.acquire("Over capacity"), /session_limit/)
  now += 100 * 365 * 24 * 60 * 60_000
  assert.equal(store.get(session.session_id), session)
  assert.equal(store.byToken(session.token), session)
  assert(!("expires_at" in store.inspect(session.session_id)))
  assert.throws(() => store.acquire("Still at capacity after idle"), /session_limit/)
  assert.equal(store.release(session.session_id).status, "released")
  assert.throws(() => store.get(session.session_id), /session_unavailable/)
  assert.throws(() => store.byToken(session.token), /session_unavailable/)
  assert.equal(store.get(other.session_id), other)
  assert.doesNotThrow(() => store.acquire("Released slot reused"))
  store.clear()
  assert.deepEqual(store.list(), [])
  assert.throws(() => store.get(other.session_id), /session_unavailable/)
}

let boardURL: string | undefined
async function protocol() {
  await client.connect(transport)
  assert.equal(client.getServerVersion()?.name, "ui-studio")
  assert.deepEqual((await client.listTools()).tools.map((tool) => tool.name).sort(), ["acquire_session", "get_catalog", "inspect", "publish", "release_session"])
  const oldTTL = await call("acquire_session", { title: "Obsolete TTL rejected", ttl_minutes: 1 })
  assert.equal(oldTTL.isError, true, "obsolete TTL argument must be rejected by the strict schema")
  for (const chat_label of ["", "x".repeat(161), "é".repeat(81)]) {
    assert.equal((await call("acquire_session", { title: "Invalid label", chat_label })).isError, true)
  }
  const [created, concurrent] = await Promise.all([
    call("acquire_session", { title: fixtureTitle, chat_label: fixtureChatLabel }).then(decode),
    call("acquire_session", { title: "Concurrent acquisition" }).then(decode),
  ])
  assert.notEqual(created.session_id, concurrent.session_id)
  assert.equal(new URL(created.url).origin, new URL(concurrent.url).origin, "parallel acquisitions share one prepared listener")
  assert.equal(created.dashboard_url, new URL(created.url).origin + "/")
  assert.equal(concurrent.dashboard_url, created.dashboard_url)
  assert.equal(created.current_revision, 0)
  const initialDashboard = await fetch(created.dashboard_url, { signal: AbortSignal.timeout(5000) })
  assert.equal(initialDashboard.status, 200)
  commonPolicy(initialDashboard)
  assert.equal(initialDashboard.headers.get("content-type"), "text/html; charset=utf-8")
  assert.equal(initialDashboard.headers.get("content-security-policy"), "default-src 'none'; style-src 'self'; frame-ancestors 'none'; form-action 'none'; base-uri 'none'")
  const dashboardHTML = await initialDashboard.text()
  assert.match(dashboardHTML, /data-theme="system"/)
  assert.match(dashboardHTML, /data-studio/)
  assert.match(dashboardHTML, /E2E &lt;script&gt;alert\(1\)&lt;\/script&gt; &amp; draft/)
  assert.match(dashboardHTML, /Chat &lt;img src=x onerror=&quot;alert\(2\)&quot;&gt; &amp; review/)
  assert(!dashboardHTML.includes(fixtureTitle))
  assert(!dashboardHTML.includes(fixtureChatLabel))
  assert(dashboardHTML.includes(new URL(created.url).pathname))
  assert(dashboardHTML.includes(new URL(concurrent.url).pathname))
  assert(dashboardHTML.includes(created.session_id))
  assert(dashboardHTML.includes("Board " + created.session_id.slice(0, 8)))
  assert.match(dashboardHTML, /Revision 0/)
  assert.match(dashboardHTML, /<time datetime="[^"]+">/)
  assert.match(dashboardHTML, /href="\/">Refresh<\/a>/)
  assert.doesNotMatch(dashboardHTML, /<script\b|<style\b|\bstyle=|http-equiv|<iframe\b|<form\b|release_session/)
  assert.equal(decode(await call("release_session", { session_id: concurrent.session_id })).status, "released")
  assert.equal((await fetch(concurrent.url)).status, 404)
  const afterConcurrentRelease = await (await fetch(created.dashboard_url)).text()
  assert(!afterConcurrentRelease.includes(concurrent.session_id))
  assert(afterConcurrentRelease.includes(created.session_id))
  assert(!("expires_at" in created))
  boardURL = created.url
  const args = { session_id: created.session_id }
  assert.match(boardURL!, /^http:\/\/127\.0\.0\.1:\d+\/board\/[a-f0-9]{64}$/)
  assert(!boardURL!.includes(created.session_id))
  assert.equal(decode(await call("get_catalog", args)).status, "waiting_for_browser")
  await toolError("publish", { ...args, base_revision: 0, source: fixtureSource }, "catalog_not_ready")
  const origin = new URL(boardURL!).origin
  const aliasHost = "localhost:" + new URL(boardURL!).port
  const aliasOrigin = "http://" + aliasHost
  assert.equal((await fetch(created.dashboard_url, { headers: { Host: aliasHost }, signal: AbortSignal.timeout(5000) })).status, 200)
  assert.equal((await fetch(boardURL!, { headers: { Host: aliasHost }, signal: AbortSignal.timeout(5000) })).status, 200)
  for (const path of ["/", "/dashboard.css"]) {
    for (const site of ["none", "same-origin"]) {
      assert.equal((await fetch(origin + path, { headers: { "Sec-Fetch-Site": site } })).status, 200)
    }
    for (const site of ["cross-site", "same-site"]) {
      await httpError(await fetch(origin + path, { headers: { "Sec-Fetch-Site": site } }), 403, "cross_site_denied")
    }
    for (const method of ["HEAD", "OPTIONS", "PUT", "POST"]) {
      await httpError(await fetch(origin + path, { method, headers: { "Sec-Fetch-Site": "cross-site" } }), 404, "not_found", method === "HEAD")
    }
    await httpError(await fetch(origin + path, { headers: { Host: "evil.example:" + new URL(boardURL!).port } }), 403, "invalid_host")
  }
  for (const path of ["/dashboard.css/", "/%64ashboard.css", "/Dashboard.css"]) {
    await httpError(await fetch(origin + path), 404, "not_found")
  }
  // Bun canonicalizes leading duplicate slashes before exposing Request.url.
  // The normalized resource must still pass the dashboard security guards.
  assert.equal((await fetch(origin + "//dashboard.css")).status, 200)
  await httpError(await fetch(origin + "//dashboard.css", { headers: { "Sec-Fetch-Site": "cross-site" } }), 403, "cross_site_denied")
  const dashboardCSS = await fetch(origin + "/dashboard.css")
  commonPolicy(dashboardCSS)
  assert.equal(dashboardCSS.headers.get("content-type"), "text/css")
  assert.equal(dashboardCSS.headers.get("cross-origin-resource-policy"), null)
  const dashboardStyles = await dashboardCSS.text()
  assert(dashboardStyles.startsWith(await (await fetch(boardURL + "/bundle.css")).text()))
  assert(dashboardStyles.endsWith(await (await fetch(boardURL + "/browser.css")).text()))
  const post = (route: string, value: unknown, headers: Record<string, string> = { Origin: origin }) => fetch(boardURL + "/" + route, {
    method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: typeof value === "string" ? value : JSON.stringify(value), signal: AbortSignal.timeout(5000),
  })
  assert.equal((await fetch(boardURL!, { signal: AbortSignal.timeout(5000) })).status, 200)
  const shellResponse = await fetch(boardURL!, { signal: AbortSignal.timeout(5000) })
  const shell = await shellResponse.text()
  assert.match(shell, /Waiting for agent draft/)
  assert.match(shell, /data-catalog-version="carbon-white-charts-1"/)
  assert.match(shell, /<html\b(?=[^>]*\blang="en")(?=[^>]*\bdata-theme="system")(?=[^>]*\bdata-studio)[^>]*>/)
  assert.match(shell, /<label\b(?=[^>]*\bfor="theme-mode")(?=[^>]*\bclass="cds--label")[^>]*>Theme<\/label>/)
  assert.match(shell, /<select\b(?=[^>]*\bid="theme-mode")(?=[^>]*\bclass="cds--select-input")[^>]*>/)
  assert(shell.indexOf('/bundle.css"') < shell.indexOf('/browser.css"'), "official Carbon styles load before studio layout")
  assert.match(shell, /<option value="system" selected(?:="")?>System<\/option>/)
  assert.match(shell, /<option value="light">Light<\/option>/)
  assert.match(shell, /<option value="dark">Dark<\/option>/)
  assert.doesNotMatch(shell, /theme-toggle|aria-pressed/)
  assert.match(shell, /<h1 id="title">E2E &lt;script&gt;alert\(1\)&lt;\/script&gt; &amp; draft<\/h1>/)
  assert.match(shell, /<title>E2E &lt;script&gt;alert\(1\)&lt;\/script&gt; &amp; draft · UI Studio<\/title>/)
  assert(!shell.includes(fixtureTitle), "untrusted title must not become markup")
  const hostNonce = documentNonce(shellResponse, shell, 1)
  const anotherHost = await fetch(boardURL!)
  assert.notEqual(documentNonce(anotherHost, await anotherHost.text(), 1), hostNonce)
  assert.equal((await fetch(boardURL + "/")).status, 200, "single host trailing slash remains supported")
  const snapshotHeaders = (await fetch(boardURL + "/snapshot")).headers
  assert.equal(snapshotHeaders.get("cache-control"), "no-store")
  assert.equal(snapshotHeaders.get("referrer-policy"), "no-referrer")
  assert.equal(snapshotHeaders.get("x-content-type-options"), "nosniff")
  assert.equal(snapshotHeaders.get("access-control-allow-origin"), null)
  assert.equal((await fetch(boardURL + "/not-a-route")).status, 404)
  assert.equal((await fetch(origin + "/board/" + "0".repeat(64))).status, 404)
  assert.equal((await fetch(boardURL!, { headers: { Host: "evil.example:" + new URL(boardURL!).port } })).status, 403)
  assert.equal((await fetch(boardURL!, { headers: { "Sec-Fetch-Site": "cross-site" } })).status, 403)
  for (const method of ["HEAD", "OPTIONS", "PUT"]) {
    await httpError(await fetch(boardURL!, { method }), 404, "not_found", method === "HEAD")
  }
  const rawPaths = [
    "/snapshot/", "/%73napshot", "/Snapshot", "//snapshot", "/bundle.js/", "/%62undle.js",
    "/frame/00/" + "a".repeat(32), "/frame/%30/" + "a".repeat(32),
    "/frame/0/%61" + "a".repeat(31),
    "/frame/0/" + "a".repeat(32) + "/", "/frame/0/" + "A".repeat(32),
  ]
  for (const path of rawPaths) await httpError(await fetch(boardURL + path), 404, "not_found")
  const boardPath = new URL(boardURL!).pathname
  const encodedToken = boardPath.replace(/([a-f0-9])$/, (char) => "%" + char.charCodeAt(0).toString(16))
  await httpError(await fetch(origin + encodedToken), 404, "not_found")
  await httpError(await fetch(origin + boardPath.replace("/board/", "/%62oard/")), 404, "not_found")
  // Guard precedence is observable, even for unknown paths and router misses.
  await httpError(await fetch(origin + "/invalid", { method: "OPTIONS", headers: { Host: "evil.example:" + new URL(boardURL!).port } }), 403, "invalid_host")
  await httpError(await fetch(origin + "/invalid", { method: "OPTIONS", headers: { "Sec-Fetch-Site": "cross-site" } }), 404, "not_found")
  await httpError(await fetch(origin + "/invalid", { headers: { "Sec-Fetch-Site": "cross-site" } }), 404, "not_found")
  await httpError(await fetch(origin + "/board/" + "0".repeat(64), { headers: { "Sec-Fetch-Site": "cross-site" } }), 404, "session_unavailable")
  await httpError(await fetch(boardURL + "/not-a-route", { headers: { "Sec-Fetch-Site": "cross-site" } }), 403, "cross_site_denied")
  await httpError(await post("not-a-route", {}, {}), 403, "invalid_origin")
  await httpError(await post("not-a-route", {}, { Origin: "null", "Sec-Fetch-Site": "cross-site" }), 403, "cross_site_denied")
  await httpError(await post("snapshot", {}), 404, "not_found")
  await httpError(await fetch(boardURL + "/catalog"), 404, "not_found")
  // Opaque sandbox subresources are cross-site; only fixed public vendor bytes may pass.
  for (const asset of ["bundle.js", "bundle.css"]) {
    const response = await fetch(boardURL + "/" + asset, { headers: { "Sec-Fetch-Site": "cross-site" } })
    assert.equal(response.status, 200)
    commonPolicy(response)
    assert.equal(response.headers.get("content-type"), asset === "bundle.js" ? "text/javascript" : "text/css")
    assert.equal(response.headers.get("cross-origin-resource-policy"), "cross-origin")
  }
  for (const route of ["bundle.js/", "%62undle.js", "browser.js", "browser.css", "frame/0/" + "a".repeat(32)]) {
    await httpError(await fetch(boardURL + "/" + route, { headers: { "Sec-Fetch-Site": "cross-site" } }), 403, "cross_site_denied")
  }
  assert.equal((await fetch(boardURL + "/snapshot", { headers: { "Sec-Fetch-Site": "cross-site" } })).status, 403)
  assert.equal((await post("catalog", fixtureCatalog, {})).status, 403)
  assert.equal((await post("catalog", fixtureCatalog, { Origin: "null" })).status, 403)
  assert.equal((await post("catalog", fixtureCatalog, { Origin: "https://attacker.invalid" })).status, 403)
  assert.equal((await post("catalog", "{invalid")).status, 400)
  assert.equal((await post("catalog", fixtureCatalog, { Origin: origin, "Content-Type": "text/plain" })).status, 415)
  assert.equal((await post("events", "x".repeat(33 * 1024))).status, 413)
  assert.equal((await post("catalog", { ...fixtureCatalog, unknown: true })).status, 400)
  await httpError(await post("catalog", "{invalid"), 400, "invalid_json")
  await httpError(await post("catalog", { ...fixtureCatalog, unknown: true }), 400, "invalid_payload")
  await httpError(await post("events", "x".repeat(33 * 1024)), 413, "body_too_large")
  await httpError(await post("catalog", fixtureCatalog, { Origin: origin, "Content-Type": "text/plain" }), 415, "application_json_required")
  await httpError(await fetch(boardURL + "/events", { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: new Uint8Array([0xff]) }), 400, "invalid_json")
  await httpError(await post("catalog", fixtureCatalog, { Host: aliasHost, Origin: origin }), 403, "invalid_origin")
  await httpError(await post("catalog", fixtureCatalog, { Origin: aliasOrigin }), 403, "invalid_origin")
  assert.equal((await post("catalog", fixtureCatalog, { Host: aliasHost, Origin: aliasOrigin })).status, 200)
  assert.equal((await post("catalog", fixtureCatalog)).status, 200)
  const catalog = decode(await call("get_catalog", args))
  assert.equal(catalog.status, "catalog_ready")
  assert.equal(catalog.data.prompt, fixtureCatalog.prompt)
  assert.equal(catalog.provenance.trust, "UNTRUSTED ADVISORY")
  assert.match(catalog.provenance.sha256, /^[a-f0-9]{64}$/)
  assert.equal((await post("catalog", fixtureCatalog)).status, 200)
  assert.equal((await post("catalog", { ...fixtureCatalog, prompt: "changed" })).status, 409)
  assert.deepEqual(decode(await call("publish", { ...args, base_revision: 0, source: fixtureSource, label: "first" })), { revision: 1, status: "accepted", render_status: "pending" })
  assert.equal((await toolError("publish", { ...args, base_revision: 0, source: fixtureSource }, "revision_conflict")).current_revision, 1)
  assert.equal(decode(await call("publish", { ...args, base_revision: 1, source: fixtureSource })).revision, 2)
  const client_id = randomUUID()
  assert.equal((await post("events", { client_id, revision: 1, kind: "feedback", text: "Older visible draft" })).status, 200)
  assert.equal((await post("events", { client_id, revision: 1, kind: "mock_action", text: "Mock only" })).status, 200)
  assert.equal((await post("events", { client_id, revision: 1, kind: "render_observation", status: "error", text: "Protocol fixture render report, not actual browser evidence" })).status, 200)
  assert.equal((await post("events", { client_id, revision: 500, kind: "feedback", text: "unknown revision" })).status, 409)
  assert.equal((await post("events", { client_id, revision: 1, kind: "feedback", text: "é".repeat(2049) })).status, 400)
  const inspected = decode(await call("inspect", args))
  assert.equal(inspected.current_revision, 2)
  assert.equal(inspected.events[0].revision, 1)
  assert.equal(inspected.events[0].client_id, client_id)
  assert.equal(inspected.revisions[0].render_status, "error")
  assert.equal(inspected.revisions[1].render_status, "pending")
  assert.equal(inspected.events_lost, false)
  assert.equal(decode(await call("inspect", { ...args, after_event_id: 2 })).events.length, 1)
  assert.equal(decode(await call("inspect", { ...args, include_source: true })).revisions[0].source, fixtureSource)
  const populatedDashboard = await (await fetch(created.dashboard_url)).text()
  assert.match(populatedDashboard, /Revision 2/)
  for (const privateText of [fixtureSource, fixtureCatalog.prompt, "Older visible draft", "Mock only", "Protocol fixture render report"]) {
    assert(!populatedDashboard.includes(privateText), "dashboard must omit source, catalog and events")
  }
  const raced = await Promise.all([
    call("publish", { ...args, base_revision: 2, source: fixtureSource, label: "CAS contender A" }),
    call("publish", { ...args, base_revision: 2, source: fixtureSource, label: "CAS contender B" }),
  ])
  assert.equal(raced.filter((response) => !response.isError).length, 1, "same-base concurrent publications have exactly one winner")
  assert.deepEqual(decode(raced.find((response) => !response.isError)!), { revision: 3, status: "accepted", render_status: "pending" })
  assert.equal(decode(raced.find((response) => response.isError)!).error, "revision_conflict")
  assert.equal(decode(raced.find((response) => response.isError)!).current_revision, 3)
  assert.equal(decode(await call("inspect", args)).current_revision, 3)
  const frameResponse = await fetch(boardURL + "/frame/1/" + "a".repeat(32))
  assert.equal(frameResponse.status, 200)
  assert.match(frameResponse.headers.get("Content-Security-Policy")!, /connect-src 'none'/)
  const frameHTML = await frameResponse.text()
  const frameNonce = documentNonce(frameResponse, frameHTML, 3)
  assert.notEqual(frameNonce, hostNonce)
  const anotherFrame = await fetch(boardURL + "/frame/1/" + "a".repeat(32))
  assert.notEqual(documentNonce(anotherFrame, await anotherFrame.text(), 3), frameNonce)
  assert.match(frameHTML, /publishObservability: false/)
  assert.match(frameHTML, /<html lang="en" data-carbon-theme="white"/)
  assert.match(frameHTML, /color-scheme:only light/)
  assert.match(frameHTML, /background:var\(--cds-background\)/)
  assert.match(frameHTML, /color:var\(--cds-text-primary\)/)
  assert.match(frameHTML, /"catalog_id":"carbon-white-charts-1"/)
  const other = decode(await call("acquire_session", { title: "Independent board" }))
  assert.equal(new URL(other.url).origin, origin)
  assert.equal(other.dashboard_url, created.dashboard_url)
  assert.equal(decode(await call("release_session", args)).status, "released")
  assert.equal((await fetch(boardURL!)).status, 404) // listener remains connection-owned
  await toolError("inspect", args, "session_unavailable")
  assert.equal((await fetch(other.url)).status, 200)
  assert.equal(decode(await call("inspect", { session_id: other.session_id })).title, "Independent board")
  const releasedDashboard = await (await fetch(created.dashboard_url)).text()
  assert(!releasedDashboard.includes(created.session_id))
  assert(releasedDashboard.includes(other.session_id))
  assert.equal((await fetch(other.url + "/catalog", { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: JSON.stringify(fixtureCatalog) })).status, 200)
  const hostileSource = 'root = TextContent("</script><script>alert(1)</script><img src=x>")'
  assert.equal(decode(await call("publish", { session_id: other.session_id, base_revision: 0, source: hostileSource })).revision, 1)
  const escapedFrame = await fetch(other.url + "/frame/1/" + "b".repeat(32))
  const escapedHTML = await escapedFrame.text()
  documentNonce(escapedFrame, escapedHTML, 3)
  assert(!escapedHTML.includes(hostileSource), "source must not break out of the config script")
  assert(!escapedHTML.includes("<script>alert(1)"))
  assert(!escapedHTML.includes("<img src=x>"))
  assert.match(escapedHTML, /\\u003c\/script>/)
  const configJSON = /const config=(\{[^\n]+\});\n/.exec(escapedHTML)?.[1]
  assert(configJSON, "frame must contain its escaped JSON config")
  assert.deepEqual(JSON.parse(configJSON), { source: hostileSource, channel: "b".repeat(32), catalog_id: fixtureCatalog.bundle_version })
  assert.equal(decode(await call("release_session", { session_id: other.session_id })).status, "released")
  const emptyDashboard = await (await fetch(created.dashboard_url)).text()
  assert.match(emptyDashboard, /No active boards/)
  assert.match(emptyDashboard, /acquire a board/)
  assert(!emptyDashboard.includes(other.session_id))
  assert(!emptyDashboard.includes("/board/"))
  const shutdownBoard = decode(await call("acquire_session", { title: "Independent board" }))
  assert.equal(shutdownBoard.dashboard_url, created.dashboard_url)
  boardURL = shutdownBoard.url // leave a live board for connection shutdown to revoke
}

/** Owned HTTP/store children with stub assets: process independence, NOT two full MCP/browser builds. */
async function independentHTTPProcesses() {
  const storeModule = new URL("../src/boards/store.ts", import.meta.url).href
  const httpModule = new URL("../src/delivery/http/server.ts", import.meta.url).href
  const spawn = (title: string) => Bun.spawn({
    cmd: [process.execPath, "--no-env-file", "--eval", `
      import { BoardStore } from ${JSON.stringify(storeModule)};
      import { StudioHTTP } from ${JSON.stringify(httpModule)};
      const store = new BoardStore();
      const board = store.acquire(${JSON.stringify(title)});
      const http = new StudioHTTP(store, { bundle: "/* fixture */", bundleCSS: "/* fixture CSS */" });
      const origin = http.start();
      console.log(JSON.stringify({ origin, id: board.session_id, title: board.title }));
      try { await new Response(Bun.stdin.stream()).text(); }
      finally { http.stop(); store.clear(); }
    `],
    cwd: import.meta.dir, env: launchOptions.env, stdin: "pipe", stdout: "pipe", stderr: "inherit",
  })
  const children: ReturnType<typeof spawn>[] = []
  const stopped = new Set<number>()
  async function ready(child: typeof children[number]) {
    const reader = child.stdout.getReader()
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
      return await Promise.race([(async () => {
        let text = ""
        const decoder = new TextDecoder()
        while (!text.includes("\n")) {
          const { done, value } = await reader.read()
          assert(!done, "HTTP fixture exited before readiness")
          text += decoder.decode(value, { stream: true })
          assert(text.length < 4096, "bounded fixture readiness record")
        }
        const record = JSON.parse(text.split("\n")[0]) as { origin: string; id: string; title: string }
        assert.match(record.origin, /^http:\/\/127\.0\.0\.1:\d+$/)
        return record
      })(), new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("HTTP fixture readiness exceeded 5s")), 5000) })])
    } finally { clearTimeout(timer); void reader.cancel() }
  }
  async function stop(index: number) {
    if (stopped.has(index)) return
    const child = children[index]
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
      child.stdin.end()
      const code = await Promise.race([child.exited, new Promise<never>((_, reject) => {
        timer = setTimeout(() => { child.kill("SIGKILL"); reject(new Error("HTTP fixture shutdown exceeded 5s")) }, 5000)
      })])
      assert.equal(code, 0)
      stopped.add(index)
    } finally {
      clearTimeout(timer)
      if (!stopped.has(index)) child.kill("SIGKILL")
    }
  }
  try {
    // Retain each handle immediately so a subsequent spawn failure still cleans up owned children.
    for (const title of ["HTTP process A", "HTTP process B"]) children.push(spawn(title))
    const [a, b] = await Promise.all(children.map(ready))
    assert.notEqual(new URL(a.origin).port, new URL(b.origin).port, "simultaneous processes receive distinct OS ports")
    for (const [own, other] of [[a, b], [b, a]]) {
      const response = await fetch(own.origin + "/", { signal: AbortSignal.timeout(5000) })
      assert.equal(response.status, 200)
      const html = await response.text()
      assert(html.includes(own.id))
      assert(html.includes(own.title))
      assert(!html.includes(other.id))
      assert(!html.includes(other.title))
    }
    await stop(0)
    await assertListenerStopped(a.origin + "/")
    assert.equal((await fetch(b.origin + "/", { signal: AbortSignal.timeout(5000) })).status, 200)
  } finally {
    const cleanup = await Promise.allSettled(children.map((_, index) => stop(index)))
    for (const result of cleanup) if (result.status === "rejected") throw result.reason
  }
}

async function assertListenerStopped(url: string) {
  for (let attempt = 0; attempt < 20; attempt++) {
    try { await fetch(url, { signal: AbortSignal.timeout(200) }) }
    catch { return }
    await Bun.sleep(50)
  }
  assert.fail("HTTP listener must stop with the attached MCP transport")
}

async function signalShutdown(signal: "SIGINT" | "SIGTERM") {
  const signalClient = new Client({ name: "ui-studio-signal-e2e", version: "1" })
  const signalTransport = new StdioClientTransport(launchOptions)
  signalTransport.stderr?.on("data", (chunk: Buffer) => process.stderr.write(chunk))
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    await signalClient.connect(signalTransport)
    const acquired = decode(await signalClient.callTool({ name: "acquire_session", arguments: { title: signal + " cleanup" } }))
    const closed = new Promise<void>((resolve) => { signalClient.onclose = resolve })
    assert(signalTransport.pid, "launcher child PID must be available")
    process.kill(signalTransport.pid, signal)
    await Promise.race([closed, new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(signal + " shutdown exceeded 5s")), 5000)
    })])
    await assertListenerStopped(acquired.url)
  } finally {
    clearTimeout(timer)
    await signalClient.close()
    await signalTransport.close()
  }
}

let deadline: ReturnType<typeof setTimeout> | undefined
// Cold asset builds make separate bounded invocations useful in constrained runners.
// The default still executes every case; selecting a case never removes its assertions.
const selected = process.argv[2] ?? "all"
assert(["all", "protocol", "SIGINT", "SIGTERM"].includes(selected), "unknown E2E case")
try {
  criticalStoreTransitions()
  await Promise.race([(async () => {
    if (selected === "all" || selected === "protocol") {
      await protocol()
      await independentHTTPProcesses()
      console.log("PASS protocol: acquire/release, guards/bounds, catalog identity/CAS, feedback and connection cleanup")
      console.log("PASS owned HTTP/store fixture: independent ephemeral processes; not full two-MCP asset/browser proof")
    }
    for (const signal of ["SIGINT", "SIGTERM"] as const) {
      if (selected === "all" || selected === signal) {
        await signalShutdown(signal)
        console.log("PASS " + signal + " listener cleanup")
      }
    }
  })(), new Promise<never>((_, reject) => { deadline = setTimeout(() => reject(new Error("E2E 120s deadline exceeded")), 120_000) })])
  console.log("PASS " + selected + "; critical no-expiration/history/event/session bounds")
  console.log("UNVERIFIED by this suite: actual browser catalog generation, OpenUI rendering, a11y/responsive/iframe runtime security")
} finally {
  clearTimeout(deadline)
  await client.close()
  await transport.close()
  // SDK client/transport close also closes child stdin; this is not isolated protocol-onclose proof.
  if (boardURL) await assertListenerStopped(boardURL)
}
