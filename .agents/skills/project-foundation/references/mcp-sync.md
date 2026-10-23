# MCP Configuration Management (`mcp-sync`)

Each AI agent harness maintains its own dedicated MCP configuration file. These files are the authoritative source for their respective harness.

**No shared canonical `.agents/mcp.json` exists — its absence is intentional and not a blocker.** When MCP servers are added or updated, edit the relevant harness config file(s) directly.

---

## Known Harness Configurations

| Harness | Config Path | Schema |
|---|---|---|
| **OpenCode** | `~/.config/opencode/opencode.jsonc` | OpenCode JSONC (`"mcp"` key) |
| **Claude Code (via launcher wrapper)** | `~/.claude/mcp.json` | MCP JSON projected through a launcher wrapper |
| **Gemini CLI (example config path)** | `~/.gemini/config/mcp_config.json` | MCP JSON with `disabled` |
| **Codex** | `~/.codex/config.toml` | Codex TOML (`[mcp_servers.*]`) |

> [!NOTE]
> These are example tracked locations for one installation; they are not universal harness defaults. In particular, do not assume Claude auto-discovers `~/.claude/mcp.json` or that Gemini CLI uses this config path. Discover the actual consumer and launch adapter in your installation first. `XDG_CONFIG_HOME` can change OpenCode's path; `CODEX_HOME` can change Codex's. For other harnesses, consult their official docs and existing launch configuration.

In dotfiles setups, config files are often managed at a source path and symlinked to the live location. Edit the source file and verify the link is active with `ls -la <live-path>` before assuming the edit applies immediately; this is deployment-specific, not universal.

---

## Harness Schemas

> [!IMPORTANT]
> **Use absolute paths or commands on `$PATH` for all harnesses**: Relative paths break because harnesses execute MCP servers from different working directories. Ensure MCP server executables are on `$PATH` or referenced by absolute path; how executables are installed and made available on `$PATH` is deployment-specific (for example, a dotfiles setup might add an `mcps/*/bin` directory to PATH via its shell configuration).

### Claude Code

Native MCP entries have no `disabled` field. Use the harness's supported disable control or omit an entry from the config supplied to it. Preserve any deployment-specific disable metadata instead of deleting it blindly.

If your Claude Code installation uses a launcher wrapper, that wrapper reads the MCP JSON file, filters entries with `enabled = false` / `disabled = true`, strips those adapter fields, and passes the result via `--mcp-config`. Discover your launcher wrapper's actual path from your shell configuration or harness setup documentation. The wrapper, not automatic discovery, makes this dedicated file effective. Keep that projection and its metadata intact.

```json
{
  "mcpServers": {
    "server-name": {
      "command": "executable-on-PATH",
      "args": []
    }
  }
}
```

### Gemini CLI (example config)

Existing entries use optional `"disabled"` per entry. Preserve this deployed format; verify the actual harness's schema before applying it elsewhere.

```json
{
  "mcpServers": {
    "server-name": {
      "command": "executable-on-PATH",
      "args": [],
      "disabled": false
    }
  }
}
```

### OpenCode

MCP configuration lives under the `"mcp"` key inside the main JSONC config file:

```jsonc
// Inside opencode.jsonc
{
  "mcp": {
    "servers": {
      "server-name": {
        "type": "local",
        "command": ["executable-on-PATH"],
        "disabled": false
      }
    }
  }
}
```

Differences from the standard MCP schema:
1. `"type": "local"` is required for each local server.
2. `"command"` is a **single combined array** (executable + arguments), not separate `command` and `args` fields.
3. The MCP block is **nested inside the main config file**; preserve all other settings at the top level.
4. Some entries carry OpenCode-specific optional fields (e.g. `"codemode"`, `"timeout"`); preserve them.

### Codex

Uses TOML with one `[mcp_servers.<name>]` section per server. Codex supports `enabled = false` to retain a disabled definition; do not infer unsupported fields merely from their absence in an existing config.

```toml
[mcp_servers.server-name]
command = "executable-on-PATH"
args = []
```

---

## Default Browser Policy

Browser interaction defaults to terminal-browser (the browser automation skill's default mode), not an always-on MCP. Do not add browser MCPs as a configuration-sync side effect. Chrome/CDP requires an explicit Chrome task or demonstrated-capability-gap exception and the necessary authorization. If a harness config already has a disabled Chrome definition, preserve that state unless its change is separately authorized.

Each harness uses its own native disable control:

| Harness | Disable control |
|---|---|
| OpenCode | `"disabled": true` on the server entry |
| Claude Code | Native supported disable control; if a launcher wrapper is in use, it may also filter disabled entries before passing the config |
| Gemini-family config shown above | Preserve the existing `"disabled": true` format; verify other consumers separately |
| Codex | `enabled = false` in `[mcp_servers.<name>]` |

---

## Edit Protocol

1. **Identify target harness(es)**: By default, edit only the active harness config. When the user explicitly requests all tracked harnesses, update each relevant file.
2. **Read the target file**: Inspect its current structure, schema, and existing server entries.
3. **Merge the change**: Add or update the server entry using the harness's native schema. Preserve all unrelated settings, env references, `disabled` flags, and other configuration.
4. **Write**: Save the updated file. If the config path is a symlink, the edit applies to the live location immediately — verify with `ls -la <path>` before assuming this, as it is deployment-specific.
5. **Report**: State each change made (server added, updated, or removed) per file.
6. **Restart Reminder**: Inform the user that restarting the harness or reloading the IDE window is required for new or changed servers to register.

---

## Operational Rules

- **No canonical source file**: Do not create `.agents/mcp.json`; its absence is intentional.
- **Harness authority**: Manage each harness's definitions in its own configuration, respecting native global/project precedence and launch adapters. Do not derive one harness's config from another's.
- **Default to active harness**: Update the requesting harness's config unless the user explicitly asks for all tracked harnesses.
- **No auto restart**: Do not start, stop, or restart harness processes; remind the user to reload instead.
- **Preserve disabled state**: When a server entry has a disabled flag, preserve the intent using the target harness's native control; do not silently re-enable it.
- **Preserve server-specific options**: Fields like `"codemode"`, `"timeout"` blocks, or other harness-specific entries are not standard MCP; preserve them when present.

Schema reference for Codex's `enabled` control: [official configuration schema](https://github.com/openai/codex/blob/main/codex-rs/core/config.schema.json), `RawMcpServerConfig`. Check the installed harness version when adapting examples.
