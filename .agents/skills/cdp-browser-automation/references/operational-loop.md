# operational-loop

## The Operational Loop

Every action follows this four-step pattern — never skip step 3:

```
1. ORIENT    → take_screenshot() or take_snapshot()  # what is on screen?
2. ACT       → js("el.click()") / type / key / click(x,y)
3. VERIFY    → take_screenshot() or take_snapshot()  # did it work?
4. NAVIGATE  → goto(url) + wait_for_selector(...)    # only when moving pages
```

**How to orient as an agent running inside Kilo:**
- Use `chrome-devtools_take_snapshot` to get the a11y tree — it returns
  structured text with element UIDs you can act on directly.
- Use `chrome-devtools_take_screenshot` to get the image inline (returned as
  an attachment, not a file path) — use this when visual layout matters.
- The `screenshot()` helper in `cdp-snippets.md` writes to a file for
  **human inspection only**. It does not return image bytes to the agent.

**Why this loop still beats pure selector approaches:**
- Screenshots/snapshots reveal hidden overlays, popups, and loading states
- Verification catches silent failures: clicks that miss, forms that reject
- The a11y snapshot gives stable semantic UIDs without fragile CSS selectors

---

## Decision Table

| Situation | Approach | Reason |
|-----------|----------|--------|
| Unknown page state | `screenshot()` first | See what is actually rendered |
| Click standard HTML control (button, link, input) | `js("document.querySelector('…').click()")` | Fires DOM event listeners; compositor click won't |
| Click canvas / WebGL / compositor-only target | `click(x, y)` from screenshot | Compositor-level; no DOM needed |
| Click inside cross-origin iframe | `click(x, y)` — compositor passes through | Can't reach cross-origin DOM; coords still work |
| Click inside same-origin iframe / shadow DOM | prefer `js()` with shadow/iframe selector; fallback `click(x, y)` | DOM click preferred; coord click as fallback |
| Verify action succeeded | `screenshot()` again | Never assume; menus open, errors appear |
| Static pages, bulk fetch | `httpx` + threads | No browser overhead; 100s of pages/second |
| Known API endpoint (JSON) | `http_get` directly | Skip the UI entirely |
| Read page content / extract data | `Runtime.evaluate` + JS | When clicking is the wrong tool |
| Action helper is missing | Write it, add to your CDP class | Self-heal rather than fail |
| Nothing else works | Raw `cdp.send("Domain.method", ...)` | CDP is the full protocol surface |
| Auth wall hit | Inject saved session cookies via `Network.setCookies`; surface structured error if none available | Never type credentials from screenshots |
| Diagnose performance / CWV / leaks | Emulate first, then use trace capture and insights for diagnosis; use Lighthouse audit only for supported non-performance categories (accessibility, best-practices, SEO) | Performance debugging needs trace detail; see `references/performance-diagnostics.md` |

---

## Tab Management

Use `new_tab()` when opening URLs for automation — never `goto()` unless you
explicitly intend to replace the current page. `Target.createTarget` +
`Target.attachToTarget` opens a fresh target without clobbering user tabs.
Filter `Target.getTargets` to `type == "page"` and exclude `chrome://` / `devtools://` internals.

See [`cdp-snippets.md`](cdp-snippets.md) for `new_tab`,
`list_tabs`, and `switch_tab` implementations.

---

## Handling Common DOM Complexity

### Iframes
For **cross-origin** iframes, `click(x, y)` is the only option — you cannot
reach their DOM from the main document. For **same-origin** iframes, prefer
`js()` with a selector for reliability; use `click(x, y)` as fallback.
To read content inside any iframe: find it via `Target.getTargets`
(`type == "iframe"`), attach with `Target.attachToTarget`, then send CDP
commands through that `sessionId`.

### Shadow DOM
For clicks: prefer `js("el.shadowRoot.querySelector('…').click()")` — this
fires DOM listeners. Coordinate clicks work as a fallback when the shadow root
element cannot be reached by selector. For JS reads:
`document.querySelector('host').shadowRoot.querySelector('inner')`.

### Dialogs (alert / confirm / beforeunload)
`Page.handleJavaScriptDialog` with `accept: true/false`. Call it *before*
triggering the action that opens the dialog. See snippets reference for the
full pattern.

---

## Wait Patterns

`document.readyState == 'complete'` is **not sufficient** for SPAs — spinners
dismiss before async data fetches finish. Never use it as your only wait condition.

Prefer in order:
1. `wait_for_selector(selector)` — most reliable; waits for a known stable element
2. `wait_for_text(text)` — when you know exact visible text that appears on success
3. `wait_for_load()` — network-idle heuristic (no in-flight XHR/fetch for 500 ms);
   use as a fallback when you have no stable selector to poll

All available in [`cdp-snippets.md`](cdp-snippets.md).
Never use `asyncio.sleep(N)` with a fixed delay — it is either too slow or races.

---

## Common Failure Modes

### 1. Action appeared to work but didn't
**Root**: No visual verification after click.
**Fix**: Always `screenshot()` after every meaningful action before continuing.

### 2. Selector broke after site update
**Root**: CSS module class names are auto-generated and change on every build.
**Fix**: Use `data-*`, `aria-*`, `role`, and semantic element attributes — these
are stable by design. Never target obfuscated class names.

### 3. Click lands in wrong place after layout change
**Root**: Saved hardcoded coordinates instead of re-deriving from a fresh screenshot.
**Fix**: Coordinates are valid only within the screenshot they were derived from.
Re-screenshot, re-derive. For flows that repeat the same click, prefer a stable
selector (`js("document.querySelector('…').click()")`) — it survives re-renders.
Coordinates are a per-screenshot interaction tool, not a durable automation primitive.

### 4. iframe interaction fails
**Root**: Tried to target iframe content via main document DOM.
**Fix**: Try `click(x, y)` first (compositor pass-through). If that fails, attach
to the iframe's Target and send CDP commands through that session.

### 5. Chrome not responding to CDP
**Root candidates**: Port not yet listening, stale websocket, profile picker open.
**Fix sequence**:
1. Poll the port for up to 30 seconds before assuming failure
2. Re-read `DevToolsActivePort` — port can change between Chrome launches
3. If websocket closes mid-session, reconnect and reattach to the target

### 6. Context window bloating from page state
**Root**: Printing/logging full DOM snapshots or raw screenshot data.
**Fix**: Write screenshots to `/tmp/` (for human inspection only), not to
stdout. Read only what you need from the DOM — targeted `querySelector` over
full `getDocument`.

### 7. CAPTCHA or anti-bot wall encountered
**Root**: Site detected automation and presented a CAPTCHA or JS challenge.
**Fix**: Surface a structured error and halt. Do not attempt to solve or bypass
CAPTCHAs programmatically. Cloudflare JS challenges sometimes clear on retry
after a short delay — retry once with `wait_for_selector` before escalating.
Log the URL and challenge type in the domain knowledge file.

### 8. Sensitive data in screenshots or logs
**Root**: Screenshots captured a form with credentials or PII; cookies/tokens
logged in full.
**Fix**: Write screenshots to ephemeral paths (`/tmp/`) and delete after use.
Never log full cookie values or auth tokens — log only names/domains. The Three
Gates in `references/knowledge-system.md` prohibit PII in stored knowledge;
enforce the same at the automation layer.

---

## Bulk HTTP (No Browser Needed)

For static pages, JSON APIs, and anything that doesn't require JS rendering:
`httpx` + `ThreadPoolExecutor`. 100+ pages per second, no Chrome overhead.
See [`cdp-snippets.md`](cdp-snippets.md) for the
`http_get` / `bulk_get` implementation.

`httpx` is required (not `urllib.request`) — it follows redirects for all
methods by default. `urllib.request` does not follow POST redirects and will
silently return a 301/302 with no body.

**Rule**: Open a browser tab only when the page requires JS execution or user
interaction. For everything else, HTTP is 10–100x faster.

---
