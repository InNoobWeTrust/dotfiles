---
name: cdp-browser-automation
description: "Use this skill for real browser interaction — scraping, clicks, forms, login flows, downloads, DOM inspection, live repros, screenshots, and page testing — using terminal-browser by default, side-by-side with the agent. Chrome/CDP is an opt-in exception for explicit Chrome tasks or demonstrated capability gaps such as performance traces, Lighthouse, or heap snapshots. Activate when the user asks to open or control a browser, automate a website, reproduce behavior, verify a page live, or diagnose web performance."
---

# Browser Automation — terminal-browser First

Use [terminal-browser](https://terminal-browser.com/) and its `action` CLI to control a browser visible beside the agent. Ordinary interaction needs no browser MCP, separately launched Chrome, or custom CDP client. Keep Chrome DevTools MCP disabled unless an authorized task specifically needs it.

## Intention routing

| Intent | Load |
|---|---|
| UI automation, scrape, login, DOM, files, screenshots | `references/terminal-browser.md` |
| Quick live repro / mechanical page verification | `references/terminal-browser.md` + `references/operational-loop.md` |
| Performance / Lighthouse / CWV / leaks / Chrome traces | Establish the Chrome exception below, then `references/performance-diagnostics.md` |
| Capture reusable site knowledge | `references/knowledge-system.md` |
| Explicit Chrome/CDP task or demonstrated CLI capability gap | `references/chrome-connect.md`; `references/cdp-snippets.md` only if raw CDP is needed |
| Loop, waits, iframes, failures, bulk HTTP | `references/operational-loop.md` |
| Knowledge + design constraints | `references/knowledge-and-constraints.md` |

## Core mental model

> A page is a **visual surface first**, DOM second, HTTP third.

1. Discover the intended browser/tab with `terminal-browser ls --json`; pin both selectors for every action.
2. Observe a compact `snapshot -i`; capture and inspect a screenshot when layout or appearance matters.
3. Use CLI `click`, `fill`, and keyboard commands with fresh element refs; use targeted `eval` for inspection, not to bypass normal user interaction in QA.
4. Use HTTP for static content or known APIs only when no browser behavior needs proving.

## Chrome exception

An explicit Chrome task or a verified missing CLI capability can justify Chrome/CDP. Name the required capability first; load only the relevant exception reference. Do not install software, re-enable MCP, restart a harness, or touch a personal Chrome profile without authorization. Missing terminal integration or a failed click is not by itself a Chrome requirement.

## Mandatory operational loop

Every action: **observe → act → verify → (recover)**. Never skip verify. Full pattern, wait strategies, failure modes: `references/operational-loop.md`.

## Constraints (always)

- No CAPTCHA bypass; stop and report anti-bot walls.
- Do not log or screenshot secrets; redaction required.
- Prefer concise page state over dumping full HTML into context.
- Respect tab/process ownership: do not replace user tabs or run `terminal-browser shutdown` as cleanup.
- Run shell commands through the available sandbox; stop and report missing CLI, terminal access, or permissions rather than bypassing them.
- Prefer site knowledge files over re-discovering selectors every run (`knowledge-system.md`).
