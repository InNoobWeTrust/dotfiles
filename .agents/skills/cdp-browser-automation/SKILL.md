---
name: cdp-browser-automation
description: "Direct browser automation via Chrome DevTools Protocol — scraping, clicking, form-filling, login flows, file download/upload, DOM interaction, and end-to-end page testing without external services. Also covers web performance diagnostics: Core Web Vitals, Lighthouse audits, memory leaks, slow loads, long tasks, CDP traces, throttling, and network emulation. Activate on \"open browser\", \"automate this website\", \"scrape\", \"click on\", \"fill this form\", \"download from\", \"test this page\", \"check performance\", or any task requiring real browser interaction. Also activate when building site-specific browser knowledge (selectors, URL patterns, API endpoints)."
---

# CDP Browser Automation

Direct browser control via Chrome DevTools Protocol. Dependencies: running Chrome + a websocket client. No framework/SDK subscription.

## Intention routing

| Intent | Load |
|---|---|
| UI automation, scrape, login, DOM, files | This skill + `references/cdp-snippets.md` |
| Performance / Lighthouse / CWV / leaks / traces | `references/performance-diagnostics.md` |
| Capture reusable site knowledge | `references/knowledge-system.md` |
| Connect Chrome / flags / port | `references/chrome-connect.md` |
| Loop, waits, iframes, failures, bulk HTTP | `references/operational-loop.md` |
| Knowledge + design constraints | `references/knowledge-and-constraints.md` |

## Core mental model

> A page is a **visual surface first**, DOM second, HTTP third.

1. Start with `screenshot()` — see what is rendered.
2. Standard controls: `Runtime.evaluate` → `element.click()` (fires DOM listeners).
3. Canvas / WebGL / compositor-only: coordinate `Input.dispatchMouseEvent` as fallback.
4. Prefer HTTP only for static content or known APIs.

**Why:** compositor mouse events do not guarantee DOM `click` listeners. Default to JS `element.click()`; use coordinates only when the DOM cannot reach the target.

## Mandatory operational loop

Every action: **observe → act → verify → (recover)**. Never skip verify. Full pattern, wait strategies, failure modes: `references/operational-loop.md`.

## Constraints (always)

- No CAPTCHA bypass; stop and report anti-bot walls.
- Do not log or screenshot secrets; redaction required.
- Prefer concise page state over dumping full HTML into context.
- Prefer site knowledge files over re-discovering selectors every run (`knowledge-system.md`).
