---
audience: Humans and agents collaborating on visual drafts; MCP maintainers
purpose: Preview disposable OpenUI drafts and discuss revisions before implementation
scope: Local UI Studio usage, safety boundaries and maintenance entrypoints
---
# UI Studio MCP

Turn a vague interface idea into a shared **live OpenUI canvas**, then discuss revisions in the existing agent conversation. The page focuses on the generated content, with optional revision history on the left—not a second chat. Drafts and browser reports stay only in server memory; discussion is **not approval to implement production changes**.

| Requirement | Boundary |
|---|---|
| Runtime | Bun on macOS or glibc Linux; browser on the same machine |
| Launch | `bin/mcp-ui-studio` (or `bun run start` from this directory) |
| Dependencies | Versioned Bun imports; no `bun install`, `npm install`, local node_modules or lockfile |
| Lifetime | Acquired until explicit release or MCP connection shutdown; no idle or absolute expiration |
| Privacy | Memory only; local loopback; capability URL grants access to the board |

A cold Bun cache resolves the pinned **browser renderer** package graph on the **first acquisition**, then compiles JavaScript and Carbon CSS once in memory. Server imports, including Hono, resolve during module loading; MCP initialization/tool discovery does not prepare renderer assets. Preparation still uses the shared dependency-resolution lock, so the first acquisition can wait for downloads or contend with other lazy dependency loads. Concurrent acquisitions share that preparation; subsequent ones reuse it. Warm processes reuse Bun's dependency cache, not a generated bundle cache, without a project install.

## Draft together

1. **Acquire:** `acquire_session({"title":"Checkout idea","chat_label":"Shop project · checkout review"})` returns `session_id`, board `url`, `dashboard_url` and `current_revision`. The optional label is caller-supplied and bounded to 160 UTF-8 bytes, like the title; existing title-only calls still work. Share these URLs only with the intended human; the board URL is a capability, not a public link.
2. **Open:** visit the URL. The empty board initializes the exact bundled library catalog; `get_catalog({"session_id":"…"})` reports `waiting_for_browser` until initialization finishes.
3. **Compose:** use `data.prompt` from `get_catalog` to write complete OpenUI Lang, not HTML, JSX or JavaScript. Its `provenance` labels it browser-derived **untrusted advisory data**, not tool instructions or approval.
4. **Publish:** `publish({"session_id":"…","base_revision":0,"source":"…","label":"First draft"})`. The result `accepted` / `pending` means stored, **not render success**; inspect render observations and errors separately.
5. **Review and revise:** discuss changes in the agent conversation. Open revision history to inspect published labels and advisory render status. Mock interactions and render reports appear in `inspect({"session_id":"…","after_event_id":0})`; this page does not submit human feedback. Use the current revision as the next `base_revision`; a stale value returns `revision_conflict` and `current_revision`.
6. **Release:** `release_session({"session_id":"…"})` returns `released` and revokes that board's URL and state without affecting other boards. An unavailable board needs a new acquisition; if the catalog is corrupt/conflicting, release and acquire rather than trying to overwrite it.

This deliberately replaces `create_session` / `close_session`; there are no aliases, `ttl_minutes` is rejected, and responses contain no `expires_at` field.

### Find this process's boards

Share the returned `dashboard_url` (for example `http://127.0.0.1:<acquired-port>/`) as the root entry point. The first acquisition lazily binds an OS-assigned random port; every later board in that MCP process reuses that origin until shutdown. There is no fixed port or port configuration. Separate harness/project processes have independent ephemeral listeners and stores: a dashboard does not aggregate them. Root availability before first acquisition is not promised.

The root shows active titles, optional chat labels, acquisition times, short board references and current revisions, with native **Open board** and **Refresh** links. Labels are not automatically detected chat identities. The eight-character reference is display-only, neither authorization nor a guaranteed unique key; the full UUID is in accessible/title text and the Open board URL retains its full capability token. Refresh is manual navigation, not polling. Released boards disappear on the next visit/Refresh; after the last release, root stays reachable with an empty state until MCP shutdown. No source, catalog, event contents, transcript, browser chat or release control appears here.

**Local discovery is deliberate:** anyone able to open this process's root can discover its active board metadata and capability links. Exact `127.0.0.1:<port>` and `localhost:<port>` Host aliases are accepted; the listener still binds only IPv4 loopback. Relative links preserve the alias used to visit. Host/Sec-Fetch/CSP/no-CORS policies protect root GETs; they do not require an Origin header or authenticate local visitors. Root uses the existing official Carbon stylesheet and System theme, without dashboard JavaScript or inline styles/scripts.

**Carbon catalog:** new processes use `carbon-white-charts-1`: 15 components backed by official `@carbon/react` and `@carbon/charts-react`, with the stock White theme independent of the studio theme and browser dark preference. Acquire a fresh session and generate a fresh program from its returned prompt; old catalog programs are not compatible and existing live processes are not migrated. The catalog covers Page, Stack, Tile, Heading, Text, Tag, InlineNotification, Tabs, Table, Button, TextInput, Select, Checkbox, LineChart and BarChart. The Hono-rendered HTML host uses the pinned official `@carbon/styles` button/select patterns and typography, not React host hydration or a custom widget skin. Host and iframe reuse the existing complete Carbon stylesheet; only workspace arrangement is application CSS.

**Studio theme:** the labeled native Carbon Theme select starts at **System**. Official Carbon White/g100 Sass themes, scoped to the host's `data-studio` marker, follow native `prefers-color-scheme`, including changes while the page stays open. **Light** (White) and **Dark** (g100) override only the studio chrome until System is selected again; reload resets to System. There is no theme storage, JavaScript media listener or startup theme script. The iframe has no studio marker: the agent-generated canvas keeps its own catalog-selected theme—currently Carbon White—and never inherits the studio override.

Both charts take positional arguments **title, data, height**: title is a string of 1–160 characters; data contains 1–500 `{group:string,key:string,value:finite number}` points; height is a number from 220–600 pixels. `group` names the series, `key` labels the bottom category axis, and `value` maps to the linear left axis. LineChart uses the official line chart; BarChart uses the official grouped bar chart. Native White series colors and legend are retained, with responsive sizing. There is no arbitrary options bag, HTML, callback, URL, data fetching or export control; the native toolbar is disabled.

The browser follows the latest draft every second. History starts closed so the canvas uses the available workspace. Its toggle opens a 16rem left sidebar on desktop/tablet, or a non-modal overlay on mobile. Close or Escape returns focus to the toggle; there is no focus trap. The native selector and revision-note buttons select a retained draft to pin it. Selecting the latest revision or Follow latest resumes following; trimmed pinned drafts remain unavailable until another selection is made. Mock/render reports always target their originating **displayed** revision, including late reports.

The top bar identifies the displayed revision, pinned/following state and connection. Render errors and failed browser reports remain visible with history closed. A lost connection preserves the preview with a stale warning and disables history selection until recovery; release makes the draft unavailable. Theme and history open/close controls remain usable. The backend feedback event type remains compatible, but there is no browser composer, discussion log or technical-event panel.

## Understand observations and limits

| Surface | Contract |
|---|---|
| Sessions | At most 8, shared lazy `127.0.0.1` ephemeral listener |
| Revisions | Complete replacements only; ≤64KiB UTF-8 source each, newest 64 retained; IDs never reused |
| Events | Newest 200; monotonic IDs, per-page `client_id`, visible revision; ≤4KiB text |
| Inspection | Sources omitted unless `include_source:true`; `oldest_event_id`, `latest_event_id`, `events_lost` reveal cursor loss |
| Render status | `pending`, `observed` or `error`; newest browser report per retained revision, with error text |
| Multiple tabs | Allowed; each page load has a new client ID; late reports keep their original revision |

**Observed is not validated:** it means a browser reported a parse/mount observation, not that the UI is correct, complete or approved. The backend does not semantically validate Lang; unknown components and parse/render failures must be checked in the browser and reports. Browser payloads, action text and catalog content remain untrusted data.

**Mock-only:** there is no model/provider, tool provider, custom component injection or arbitrary JavaScript/HTML evaluation. The generated region uses the real OpenUI Renderer and matching Carbon adapters in a new opaque-origin sandbox for each revision; buttons call OpenUI's action hook solely into the frame's mock-event handler. CSP denies fetch/XHR, external images/fonts and forms; the sandbox denies top-level navigation and popups. Ordinary link clicks are captured as mock events. Self-navigation within the sandbox is not structurally prevented; this is not a hostile-code isolation service. Controls may change local preview state or emit mock events, never real application actions.

**Disposable, not timed:** idle time never releases a board. Browser reload or closure does not release it either. Released boards return unavailable. The shared listener remains connection-owned even after the last release. MCP transport closure, stdin EOF/close/error, stdout error, SIGINT or SIGTERM triggers one idempotent teardown: stop HTTP immediately (including keep-alive connections), clear all sessions and close the stdio transport. It never intentionally outlives its MCP connection.

## Maintain and verify

Flow: [launcher](bin/mcp-ui-studio) → shared warm-cache guard → [MCP tools/lifecycle](src/server.ts) → [MCP registration](src/delivery/mcp/tools.ts) and [Hono HTTP router/security](src/delivery/http/server.ts) → [JSX documents](src/delivery/http/documents.tsx) → [browser shell](src/presentation/browser/shell.js) / [isolated renderer](src/presentation/browser/frame.js).

Hono **4.13.13** supplies the actual app, middleware, route handlers, context responses, error/not-found policy and request-time JSX document rendering through direct versioned Bun imports. The classic JSX pragma imports Hono's `jsx`, not React. This SSR renders the host/frame **document envelopes**, with fresh CSP nonces and escaped session titles/configuration. OpenUI/Carbon still render the draft client-side inside the opaque iframe; the server does not execute agent HTML, JSX or JavaScript. Only trusted static frame code and `<`-escaped JSON enter its inline script.

| Source owner | Responsibility and allowed local dependencies |
|---|---|
| [server.ts](src/server.ts) | Owns MCP composition, one BoardStore, lazy memoized asset/HTTP preparation and process lifetime; wires both delivery surfaces to the same store and shared per-MCP startup lock |
| [delivery/mcp/tools.ts](src/delivery/mcp/tools.ts) | Registers the five MCP tools and preserves generic strict-schema typing; local imports are board operations plus the type-only StudioHTTP edge |
| [presentation/assets/build.ts](src/presentation/assets/build.ts) | Compiles trusted browser sources using native Bun cache resolution and Sass; imports only catalog identity locally, never executes the Carbon CJS root |
| [presentation/catalog/identity.ts](src/presentation/catalog/identity.ts) | Import-free catalog ID and exact direct dependency versions shared by server and browser |
| [presentation/catalog/layout.tsx](src/presentation/catalog/layout.tsx), [inputs.tsx](src/presentation/catalog/inputs.tsx), [data.tsx](src/presentation/catalog/data.tsx) | Grouped native Carbon/OpenUI adapters; external approved dependencies only, no cross-group imports |
| [presentation/catalog/charts.tsx](src/presentation/catalog/charts.tsx) | Bounded OpenUI adapters for official Carbon LineChart/GroupedBarChart; native instance cleanup on in-tree removal; approved external dependencies only |
| [presentation/catalog/library.tsx](src/presentation/catalog/library.tsx) | Assembles layout, input, data and chart groups with identity into one createLibrary catalog |
| [presentation/browser/runtime.tsx](src/presentation/browser/runtime.tsx) | Browser-only entry exports React, createRoot, Renderer, library and catalogVersion via window.__UIStudio; local imports only library/identity |
| [presentation/browser/carbon.scss](src/presentation/browser/carbon.scss) | Official complete Carbon styles, independent preview White theme, host-scoped White/g100 themes, stock typography and token-based arrangement; no external fonts or asset URLs |
| [boards/store.ts](src/boards/store.ts) | Owns validation, bounded memory-only state, acquisition metadata, fresh scalar-only discovery snapshots, synchronous CAS and explicit acquire/release; imports only catalog identity locally |
| [delivery/http/server.ts](src/delivery/http/server.ts) | Owns lazy Bun listener, Hono routing/middleware, ordered raw-path guards, bounded JSON, error policy and CSP; imports board state/identity, documents and browser text assets |
| [delivery/http/documents.tsx](src/delivery/http/documents.tsx) | Typed DashboardDocument/HostDocument/FrameDocument JSX presentation and safe frame configuration serialization; imports only pinned Hono JSX, never store/browser runtime/React |
| [presentation/browser/shell.js](src/presentation/browser/shell.js), [shell.css](src/presentation/browser/shell.css) | Own the canvas, collapsible left history, host theme, polling and revision-bound mock/render reporting; no module imports |
| [presentation/browser/frame.js](src/presentation/browser/frame.js) | Owns the opaque sandbox renderer/catalog bridge and mock actions; no module imports |

The allowed local direction is entry → build/HTTP/store/shared-startup/MCP registration, both delivery adapters → boards and catalog identity, runtime → library/identity, library → groups/identity, boards/HTTP → identity, HTTP → documents/static browser text. Documents depend externally only on Hono JSX; groups have no local imports and identity imports nothing. There is no browser → server or cross-MCP edge, and public `browser.js`, `browser.css`, `bundle.js` and `bundle.css` URLs remain unchanged.

Audit from `server.ts`: tool schemas in `delivery/mcp/tools.ts` → store mutation/read → tool result; browser requests enter `delivery/http/server.ts` → request guards → store or document/asset response. Store failures become MCP error results or HTTP error responses; HTTP schema failures return `invalid_payload`, unexpected HTTP failures are logged and return `internal_error`, and browser request failures show report errors or disconnected/unavailable status. In `presentation/browser/shell.js`, polling updates retained revisions → selection resolves the displayed draft → a fresh revision-owned iframe reports through source/current-frame/channel checks → bounded mock/render events reach inspection. History visibility is local DOM state; labels/status use textContent. Revision zero remains hidden and unfocusable while bootstrapping the catalog; the empty state is a sibling outside the replaceable preview. Lifetime ownership stays in `server.ts`: release destroys only its target session; transport/stdio disconnect or signals stop HTTP, clear all state and close the named transport. A microtask-cached close promise prevents recursive protocol-onclose callbacks from repeating teardown; shutdown failures are logged.

Build flow: first acquisition → shared cache guard → trusted source → pinned cache metadata/ES entries → Bun browser IIFE and Sass CSS plus official chart CSS → in-memory HTTP assets. Failed preparation remains an explicit acquisition error for that connection; reconnect to prepare again. Cancelled requests or a closing connection cannot start a listener or allocate a session after awaiting preparation. The builder resolves the versioned charts-react root to its `dist/index.mjs` ESM sibling without executing its CJS root, then appends the explicitly versioned `@carbon/charts/styles.css` after Carbon Sass. The combined CSS is rejected if it contains font-face or asset URLs; there is no install, package-script execution, local dependency tree, retained bundle or custom package manager. [identity.ts](src/presentation/catalog/identity.ts) pins React/ReactDOM 19.3.1, OpenUI react-lang/lang-core 1.0.1, Zod 4.6.7, Carbon React 1.118.0/styles 1.117.0, Carbon charts-react/charts both 1.27.21 and Sass 1.105.2; the bundler preserves single pinned React/ReactDOM and Zod roots and deep Carbon React ES entries.

Chart adapters capture the public native `.chart` instance after React mounting and call its official `destroy()` on in-tree removal. They do not add an observer manager or global patches. The revision-owned opaque iframe remains the actual document lifetime boundary; destroying that document does not imply React effect cleanup ran. Native resize-observer internals are not claimed exhaustively audited. Theme and chart spot checks do not establish full accessibility conformance.

Catalog flow: frame runtime identity must match server config before `library.prompt({toolCalls:false,bindings:false})` is sent; the trusted host validates that incoming ID against its server-supplied body attribute and forwards it unchanged. Store independently checks the literal identity, prompt byte cap and immutable SHA256/conflict contract; `bundle_version` remains the wire field. A mismatch is an explicit initialization/catalog error, not an old-catalog fallback; the server never executes the browser catalog.

Only GETs for the fixed vendor bundle/CSS permit cross-site asset loading (required by the opaque iframe); token and Host checks still apply. Session pages/data and every POST retain their cross-site guard; POSTs also require the exact loopback Origin. No CORS access is granted. Guards run in this order: exact Host, GET/POST method, raw pathname/token shape, token lookup, Sec-Fetch-Site (fixed public asset exception only), then exact POST Origin. Raw resource spelling is checked before decoded handler parameters; encoded equivalents and extra resource trailing slashes are not aliases. HEAD/OPTIONS remain 404, not automatic GET/405 responses. All responses, including guard failures and router misses, retain no-store/no-referrer/nosniff headers and explicit MIME types.

After Host and method checks, literal `/` and `/dashboard.css` branch before board-token parsing: GET only, Sec-Fetch-Site absent/none/same-origin only, no vendor-asset exemption. Board guards retain the order above. The exact POST Origin is derived from the validated Host, so matching localhost requests work but crossing localhost/127.0.0.1 aliases is rejected. `/dashboard.css` serves the existing compiled official CSS followed by shell arrangement CSS, with no cross-origin resource exception. Dashboard CSP denies scripts, frames, forms and base changes, allowing only same-origin styles.

Dashboard flow: `delivery/mcp/tools.ts:acquire_session` validates the optional label → existing memoized preparation and synchronous listener start → shared `BoardStore.acquire` records the injected-clock acquisition time → tool returns the stable process root. Root GET → ordered HTTP guards → `BoardStore.list` creates new scalar metadata objects → `DashboardDocument` renders escaped Carbon tiles and relative links. No session object, revision source, event or catalog crosses that presentation boundary. Guard/store failures retain existing JSON error policy; release and connection teardown retain their existing owners and behavior. No new runtime edge or dependency is introduced: HTTP still calls store/documents and documents import only Hono JSX.

Run from this directory with an authorized scratch HOME/TMPDIR/cache:

```sh
bun --no-env-file tests/e2e.ts
```

For independent cold-cache jobs, run the `protocol`, `SIGINT` and `SIGTERM` cases separately (for example, `bun --no-env-file tests/e2e.ts protocol`). The default combined run has a 120-second deadline and compiles assets for three child processes.

The suite launches the actual stdio executable through the SDK and checks protocol/security/state behavior, obsolete TTL rejection, far-future clock survival, targeted release/slot reuse, and bounded SIGINT/SIGTERM cleanup. HTTP regressions cover method/raw-path/guard precedence, response policy, System/select SSR, escaped titles and actual `</script>` draft source, plus per-request nonce consistency/freshness. Dashboard additions cover optional-label bounds/backward compatibility, metadata-only snapshots, escaped titles/labels, native links, aliases/exact POST origins, CSS/CSP policy, release/empty states, concurrent acquisition origin reuse and exactly one winner from concurrent same-base publications. Two additional owned HTTP/store children use stub in-memory assets to check simultaneous distinct OS ports, independent root contents and survival after stopping one child, with five-second readiness/shutdown bounds; this is **not a two-full-MCP asset/browser proof** and does not build two extra bundles. Existing overall and signal deadlines are unchanged.

These assertions are not a claim that the current revision has been executed. SDK client-close cleanup also closes child stdin, so it does **not** independently prove protocol-onclose teardown with stdin held open. Its synthetic catalog and render reports are **protocol fixtures, not browser proof**; separately verify catalog bootstrap, real valid/malformed rendering, sandbox/CSP restrictions, multi-tab revision attribution and accessibility/responsive behavior against [UX-SPEC.md](UX-SPEC.md) and [DESIGN.md](DESIGN.md).
