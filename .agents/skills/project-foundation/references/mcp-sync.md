# MCP Configuration Synchronization (`mcp-sync`)

Synchronize the project's canonical Model Context Protocol (MCP) server configuration to the active AI agent harness's configuration file.

The project maintains a single canonical MCP configuration at `.agents/mcp.json`. When an agent is initialized, or when MCP servers are added or updated, agents read the canonical file and synchronize the entries into their own configuration file, adapting format variations.

---

## Canonical Configuration Format

Canonical configuration is stored at `.agents/mcp.json` using the standard MCP `mcpServers` schema:

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "some-mcp-server"],
      "env": { "API_KEY": "..." }
    }
  }
}
```

> [!IMPORTANT]
> **Use absolute paths or commands on `$PATH`**: Relative paths break because different agent harnesses execute MCP servers from different working directories.

### Default browser policy

Browser interaction uses [terminal-browser](../../cdp-browser-automation/references/terminal-browser.md), not an always-on MCP. The shared `.agents/mcp.json` intentionally omits `chrome-devtools`, so consumers that do not understand disable flags cannot start it accidentally. Harness-specific Chrome definitions may remain **disabled** for explicit special-case use; synchronization must not re-enable them or add a terminal-browser MCP.

If a canonical entry uses `enabled: false`, preserve that intent using the target's native disable control; omit it when no verified control exists. Do not copy `enabled` blindly into a consumer that ignores it. Existing Kilo and OpenCode-compatible configs use `enabled: false`; native OpenCode V2 uses `mcp.servers.<name>.disabled: true`; this repo's Gemini/Antigravity MCP config uses `disabled: true`.

---

## Agent Configuration Matrix

| Agent | Config Path | Merge Strategy |
|---|---|---|
| **Claude Code** | `~/.claude.json` | Merge `mcpServers` key, preserve other settings |
| **Claude Desktop (macOS)** | `~/Library/Application Support/Claude/claude_desktop_config.json` | Merge `mcpServers` key, preserve other settings |
| **Gemini CLI** | `~/.gemini/settings.json` | Merge `mcpServers` key, preserve other settings |
| **Antigravity CLI** | `~/.gemini/antigravity-cli/mcp_config.json` | Merge `mcpServers` key, preserve other settings |
| **GitHub Copilot** | `~/.copilot/mcp-config.json` | Standalone `{ "mcpServers": ... }` file |
| **Kilo Code (≥v7.3)** | `~/.config/kilo/kilo.jsonc` or project `.kilo/kilo.jsonc` | Merge into `"mcp"` key with schema conversion (see below) |
| **Cursor** | `~/.cursor/mcp.json` | Standalone `{ "mcpServers": ... }` file |

> [!WARNING]
> Agent config paths may change across versions. If the active agent's config path is not listed or fails to resolve, ask the user for the preferred target path.

---

## Kilo Code Schema Conversion

Kilo Code (≥v7.3) stores MCP configuration inside its main JSONC config file under the `"mcp"` key with specific schema differences:

1. `"type": "local"` is required for each local server.
2. `"command"` is a **single combined array** (executable + arguments) rather than separate `command` and `args` fields.
3. `"environment"` replaces `"env"` for environment variables.

### Conversion Example

```json
// Canonical (.agents/mcp.json)
{
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["-y", "some-mcp-server"],
      "env": { "API_KEY": "..." }
    }
  }
}

// Kilo Code (kilo.jsonc under "mcp")
{
  "mcp": {
    "my-server": {
      "type": "local",
      "command": ["npx", "-y", "some-mcp-server"],
      "environment": { "API_KEY": "..." },
      "enabled": true
    }
  }
}
```

---

## Synchronization Protocol

1. **Read Canonical Config**: Read `.agents/mcp.json`. If missing, unparseable, or missing the `mcpServers` object, halt and prompt the user.
2. **Identify Active Agent**: Determine which harness is currently executing and locate its config file using the matrix above.
3. **Merge**:
    - If the agent config file exists, read it and merge the `mcpServers` (or converted `"mcp"`) key, preserving all other existing configurations.
    - If the file does not exist, create it with the required structure.
    - Honor disabled/default-excluded servers. Do not turn an existing disabled Chrome definition on as a side effect of merging.
4. **Write**: Save the updated configuration to disk. If modifying an active file that the host process flushes on exit, avoid clobbering or race conditions.
5. **Report**: Confirm specific changes to the user (servers added, updated, or removed).
6. **Restart Reminder**: Inform the user that restarting the agent or reloading the IDE window is required for changes to take effect.

---

## Operational Rules

- **Sync Only Active Agent**: Only update the configuration of the current agent harness unless the user explicitly requests syncing all harnesses.
- **Edit Source First**: When adding, editing, or removing an MCP server, modify `.agents/mcp.json` first, then run synchronization.
