---
description: Sync the canonical MCP server config to the current AI agent's config file
---

# Sync MCP Config

The user maintains a single canonical MCP server configuration at `~/.agents/mcp.json`.
When this workflow is triggered, you (the AI agent) read the canonical config and write it
to **your own** config file, adapting the format as needed.

## Canonical config format

`~/.agents/mcp.json` uses the standard MCP `mcpServers` schema:

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

## Steps

1. Read `~/.agents/mcp.json` and parse the `mcpServers` object.

2. Determine which agent you are and locate **your own** config file (see the table below).

3. If the config file already exists, read it and **merge** the `mcpServers` key
   from the canonical config into it, preserving all other existing settings.
   If the file does not exist, create it with `{ "mcpServers": ... }`.

4. Write the updated config back to disk.

5. Confirm to the user what changed (servers added, removed, or updated).

## Agent config reference

| Agent | Config path | Merge strategy |
|---|---|---|
| Claude Code | `~/.claude.json` | Merge `mcpServers` key, preserve other settings |
| Gemini CLI | `~/.gemini/settings.json` | Merge `mcpServers` key, preserve other settings |
| GitHub Copilot | `~/.copilot/mcp-config.json` | Standalone `{ "mcpServers": ... }` file |

> [!NOTE]
> If you are an agent **not listed** above, ask the user where your MCP config
> should be written and what format it expects.

## Notes

- You should only sync your own config — do not try to sync all agents at once.
- If `~/.agents/mcp.json` does not exist, prompt the user to create it first.
- If the user wants to add, remove, or edit an MCP server, edit `~/.agents/mcp.json`
  first, then re-run this workflow.
