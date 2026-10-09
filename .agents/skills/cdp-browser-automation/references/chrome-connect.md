# Chrome/CDP — Special Cases Only

[terminal-browser](terminal-browser.md) is the default. Load this reference only for an explicit Chrome task or a demonstrated missing capability, such as Chrome Performance traces, Lighthouse tooling, or heap snapshots. Ordinary browsing, forms, screenshots, and QA do not require Chrome DevTools MCP.

## Exception gate

1. State the specific capability and why the default CLI cannot satisfy it.
2. Establish authority for any separate browser launch, install, MCP enablement, or harness restart; do not treat a failed CLI action as permission.
3. Prefer an available approved tool. Discover its actual commands instead of assuming the Kilo-specific names in the diagnostics guide exist in every harness.
4. Use an isolated task-owned profile and loopback-only debugging endpoint; never expose or attach a personal browser profile without explicit authority.

## MCP defaults and opt-in

- Shared `.agents/mcp.json` (also linked by `.claude/mcp.json`) intentionally has **no** Chrome server entry. A generic `enabled: false` is not portable across all MCP consumers.
- This repo's Kilo and OpenCode-compatible definitions retain `mcp.chrome-devtools.enabled: false`; Gemini/Antigravity retains `mcpServers.chrome-devtools.disabled: true`. Native OpenCode V2 uses `mcp.servers.chrome-devtools.disabled: true`.
- For an authorized temporary exception, change only the appropriate native control, or add a **scoped** definition when absent. Leave shared defaults alone; record the change and restore the prior disabled/absent state afterward. Ask the user to reload/restart when needed rather than doing so unexpectedly.

An optional local MCP definition, only for an approved exception:

```json
{
  "command": "npx",
  "args": [
    "-y",
    "chrome-devtools-mcp@latest",
    "--no-usage-statistics",
    "--browser-url=http://127.0.0.1:19222"
  ]
}
```

Adapt to the harness schema; this is not a default setup instruction. Verify the endpoint matches the actual Chrome instance. Installs and changes outside the authorized config scope remain separate decisions.

## Connecting to an isolated Chrome instance

All shell commands still require the sandbox. Follow process ownership and `agent-*` tmux/screen rules for persistent agent-started processes; the examples below show launch flags, not permission to start them. Reuse only an approved task-owned Chrome instance.

```sh
# Linux: fresh test-only profile, matching the retained MCP port
PROFILE=$(mktemp -d "${TMPDIR:-/tmp}/agent-qa-chrome.XXXXXX")
google-chrome \
  --remote-debugging-address=127.0.0.1 \
  --remote-debugging-port=19222 \
  --user-data-dir="$PROFILE" \
  --no-first-run --no-default-browser-check \
  --disable-notifications --disable-extensions \
  --headless=new
```

```sh
# macOS: separate instance/profile, never the personal profile
PROFILE=$(mktemp -d "${TMPDIR:-/tmp}/agent-qa-chrome.XXXXXX")
open -na "Google Chrome" --args \
  --remote-debugging-address=127.0.0.1 \
  --remote-debugging-port=19222 \
  --user-data-dir="$PROFILE" \
  --no-first-run --no-default-browser-check \
  --disable-notifications --disable-extensions
```

Poll the selected endpoint with a bounded readiness timeout before attaching. If using a dynamic port, read `DevToolsActivePort` from **that isolated profile**; do not search other profiles. A missing endpoint is a connection failure to investigate, not a reason to attach a different browser.

Use [CDP snippets](cdp-snippets.md) only when an approved tool does not expose the needed protocol operation. Temporary Python scripts require `uv` and the indicated `websockets`/`httpx` dependencies; run outside the repo through the sandbox, e.g. `uv run --with websockets --with httpx python "$TMPDIR/agent-cdp-script.py"`. Do not install globally. Close only task-owned targets/processes and remove only your temporary profile after the process has exited.
