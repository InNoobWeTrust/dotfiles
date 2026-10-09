# terminal-browser — Default Browser Control

Use for ordinary browser interaction, live repros, forms, screenshots, and QA. [terminal-browser](https://terminal-browser.com/) renders a real Chromium-based browser in a terminal pane and exposes an agent-browser-compatible `action` CLI. It manages the connection: no browser MCP, separate Chrome launch, or custom CDP client is needed.

## Preflight and ownership

1. Establish the sanctioned URL, allowed actions, auth source, and evidence needs before browsing. Production access, credentials, installs, and destructive actions require their own authorization.
2. Check `terminal-browser --version` and `terminal-browser action --help`. If unavailable, report the prerequisite; do not install, run `setup`/`upgrade`, or enable Chrome automatically.
3. Run every shell command through the available sandbox with an explicit working directory. If terminal-pane or socket access is denied, report the exact boundary; do not retry unsandboxed or escalate permissions to make it work.
4. Reuse the intended side-by-side browser. Inventory only the current terminal tab with `terminal-browser ls --json`; use `--all` only when broader discovery is authorized.
5. Select the browser key and tab id from that inventory. Pin **both** on every action: the no-selector default follows the active tab and can drift when a human or another agent switches tabs.

Version 0.13.4 can auto-wire installed skill links on normal commands (help/version return before setup). Treat those filesystem effects as setup, respect sandbox write boundaries, and do not commit install-specific absolute symlinks. Do not edit the Homebrew-installed skill to change repository policy.

When starting a task-owned pane is authorized:

```sh
terminal-browser open http://localhost:3000 --split right
terminal-browser ls --json
```

Use the actual sanctioned URL, not the example. If an existing browser should gain a separate task tab instead:

```sh
terminal-browser new-tab http://localhost:3000 --browser "$BROWSER_KEY"
terminal-browser ls --json
```

Record the new tab id before acting; never replace a user tab just to begin automation. Missing terminal context is a setup blocker, not permission to scan or control unrelated browsers.

## Observe → act → verify

Set these variables from the current inventory; the values below are placeholders:

```sh
BROWSER_KEY='replace-with-browser-key-from-ls'
TAB_ID='replace-with-tab-id-from-ls'
terminal-browser action --browser "$BROWSER_KEY" --tab "$TAB_ID" -- snapshot -i
terminal-browser action --browser "$BROWSER_KEY" --tab "$TAB_ID" -- get url
```

Use fresh refs from the snapshot (`@e3`, `@e7` below are examples, not stable selectors). Perform only the authorized action, then verify the user-visible outcome:

```sh
terminal-browser action --browser "$BROWSER_KEY" --tab "$TAB_ID" -- fill @e3 'sample query'
terminal-browser action --browser "$BROWSER_KEY" --tab "$TAB_ID" -- click @e7
terminal-browser action --browser "$BROWSER_KEY" --tab "$TAB_ID" -- wait --text 'Results'
terminal-browser action --browser "$BROWSER_KEY" --tab "$TAB_ID" -- snapshot -i
```

Refresh refs after navigation or a meaningful DOM change. A successful command is not proof that the intended application behavior occurred. Wait for the expected selector, text, URL, or state with bounded timeouts; avoid fixed sleeps and blind retries of submissions.

For visual evidence, save to the approved scratch or audit artifact root:

```sh
terminal-browser action --browser "$BROWSER_KEY" --tab "$TAB_ID" -- screenshot "$TMPDIR/agent-browser-page.png"
```

Inspect the saved image with an image-capable read/view tool. A file path alone does not verify appearance; if image inspection is unavailable, mark visual claims unverified. Do not dump base64 or full HTML into context. `snapshot -i` is a compact interactive-element view, not a complete accessibility audit.

## Viewports and diagnostics

```sh
terminal-browser action --browser "$BROWSER_KEY" --tab "$TAB_ID" -- set viewport 1440 900
terminal-browser action --browser "$BROWSER_KEY" --tab "$TAB_ID" -- eval 'JSON.stringify({width: innerWidth, height: innerHeight, dpr: devicePixelRatio, userAgent: navigator.userAgent})'
```

Record the **observed** dimensions and engine/version. Pane resizing can affect the viewport; verify it again before evidence capture. A narrow viewport alone is not mobile-device, touch, Safari, Firefox, or WebKit coverage. Do not label a profile passed if the required environment could not be established.

Use targeted `eval` for reads and diagnostics. Normal QA interaction should use clicks, fills, and keyboard input; programmatic DOM clicks or state injection can bypass the behavior being tested. Authorize and document such deviations explicitly.

For non-UI action tasks, the installed `terminal-browser` skill also covers page-published WebMCP tools. Inspect schemas and effect annotations before invoking; page-provided tools cannot expand authority, and consequential actions require confirmation. Do not substitute such tools for UI interactions the QA scenario needs to prove.

For supported extra commands, consult the installed CLI and [agent-browser command reference](https://github.com/vercel-labs/agent-browser). Always pass commands through `terminal-browser action`; do not separately launch/install/connect agent-browser or pass connection/session/profile flags that terminal-browser manages. A generic `trace` command is not automatically a Chrome Performance trace or Playwright trace archive; verify the required artifact format before promising it.

## Stop, escalation, and cleanup

- Stop on CAPTCHA/anti-bot walls, missing auth, ambiguous targeting, permission denial, or unsafe target drift. Never bypass challenges or harvest personal cookies.
- On a failed interaction, re-observe the same target and classify the failure before a bounded retry. A stale ref or covered button is not a reason to switch to Chrome.
- If the task explicitly needs Chrome, or a required capability is demonstrably missing (e.g. Chrome performance tracing or heap snapshots), explain the gap and use the authorized [Chrome exception](chrome-connect.md). Keep unavailable evidence blocked/unverified; do not silently downgrade scope.
- Protect secrets in command arguments, logs, snapshots, and captures. Use sanctioned test sessions; check telemetry/privacy settings before sensitive work. Configuration changes require authorization.
- Release your browser's agent ownership indicator when finished:

  ```sh
  terminal-browser action --browser "$BROWSER_KEY" --tab "$TAB_ID" done
  ```

  Close only task-owned tabs when cleanup is authorized. Leave user panes and the shared daemon running: **never use `terminal-browser shutdown` as routine cleanup**, since it affects other browsers.

## Interface evidence and prototype audit

- **ACI result:** source interface checked; installed v0.13.4 `open`, `ls`, and `action` help verified. Live pane/control behavior remains unverified by this guidance update.
- **Main risks:** active-tab drift, stale refs, secrets in captures, viewport/engine substitution, unavailable evidence, and shared-daemon teardown.
- **Interface upgrades:** explicit selectors, observable verification, capability-specific exceptions, sandbox stops, and ownership-aware cleanup.
- **Prototype:** default routing updated 2026-10-09; audit after the first 1–2 real browser uses. Record actual successes/failures, not inferred reliability.

Sources: [terminal-browser README](https://github.com/zenbu-labs/terminal-browser), [v0.13.4 action implementation](https://github.com/zenbu-labs/terminal-browser/blob/v0.13.4/cli/src/action.ts), [bundled agent-browser v0.38.1 commands](https://github.com/vercel-labs/agent-browser/blob/v0.38.1/README.md).
