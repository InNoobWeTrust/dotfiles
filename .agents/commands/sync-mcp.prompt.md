**Sync MCP Config** — The user maintains a single canonical MCP server configuration at `../mcp.json`.
When this command is triggered, you (the AI agent) read the canonical config and write it
to **your own** config file, adapting the format as needed.

## Canonical config format

`../mcp.json` uses the standard MCP `mcpServers` schema.
**Important**: Use **absolute paths** or globally installed commands (available on `$PATH`). Relative paths will break because different agents execute MCP servers from different working directories!

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

## Agent config reference

> [!WARNING]  
> Agent config paths change between versions, and new agents appear frequently. If your config path isn't listed, or doesn't work, ask the user where your MCP config should be written.

| Agent                  | Config path                                                       | Merge strategy                                  |
| ---------------------- | ----------------------------------------------------------------- | ----------------------------------------------- |
| Claude Code            | `~/.claude.json`                                                  | Merge `mcpServers` key, preserve other settings |
| Claude Desktop (macOS) | `~/Library/Application Support/Claude/claude_desktop_config.json` | Merge `mcpServers` key, preserve other settings |
| Gemini CLI             | `~/.gemini/settings.json`                                         | Merge `mcpServers` key, preserve other settings |
| Antigravity CLI             | `~/.gemini/antigravity-cli/mcp_config.json`                                         | Merge `mcpServers` key, preserve other settings |
| GitHub Copilot         | `~/.copilot/mcp-config.json`                                      | Standalone `{ "mcpServers": ... }` file         |
| Kilo Code (≥v7.3)      | `~/.config/kilo/kilo.jsonc` `"mcp"` key (or project `.kilo/kilo.jsonc`) | Merge `"mcp"` key, convert format (see below)   |
| Antigravity            | Check agent docs                                                  | Merge `mcpServers` key if supported             |
| Cursor                 | `~/.cursor/mcp.json`                                              | Standalone `{ "mcpServers": ... }` file         |

## Kilo Code format conversion

Kilo Code (≥v7.3) uses a different MCP schema inside its main config file (`kilo.jsonc`):

- `"type": "local"` is required for each server
- `"command"` is a **single array** (command + args combined) instead of separate fields
- `"environment"` replaces `"env"` for env vars

**Canonical → Kilo conversion example:**

```json
// Canonical (../mcp.json)
{
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["-y", "some-mcp-server"],
      "env": { "API_KEY": "..." }
    }
  }
}

// Kilo (inside kilo.jsonc "mcp" key)
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

## Steps

1. Read `../mcp.json`. If the file is missing, contains malformed JSON, or doesn't have an `mcpServers` object, **stop** and prompt the user to fix it before proceeding.
2. Determine which agent you are and locate **your own** config file using the reference table above.
3. If your config file already exists, read it and **merge** the `mcpServers` key from the canonical config into it, preserving all other existing settings. If the file does not exist, create it with `{ "mcpServers": ... }`. **For Kilo Code**: convert each server entry to the Kilo format (see above) and merge into the `"mcp"` key of `kilo.jsonc`.
4. Write the updated config back to disk. Be careful: if you are attempting to modify an active configuration file that your own host process writes to on exit, ensure you do not create a race condition.
5. Confirm to the user what changed (servers added, removed, or updated).

6. **Crucial**: Remind the user that they may need to **restart** the agent (or reload the IDE window) for the new MCP configuration to take effect!

## Notes

- You should only sync your own config — do not try to sync all agents at once.
- If the user wants to add, remove, or edit an MCP server, edit `../mcp.json` first, then re-run this command.

---

## Invocation Arguments

Additional command input, if any, appears below exactly as provided:

```text
$ARGUMENTS
```

Use the block above as raw additional user input. Preserve whitespace, blank lines, and quoting exactly. If the block is empty, rely on the conversation context instead.

Follow the instructions above to work on the user's actual request right below.

---
