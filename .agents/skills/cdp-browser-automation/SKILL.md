---
name: cdp-browser-automation
description: "Use this skill for any task requiring real browser interaction — scraping, clicking, form-filling, login flows, file downloads, DOM manipulation, and end-to-end page testing via Chrome DevTools Protocol. Also covers web performance diagnostics (Core Web Vitals, Lighthouse, memory leaks). Activate when the user asks to open a browser, automate a website, scrape data, fill forms, test a page, or check web performance."
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
