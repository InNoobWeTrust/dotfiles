# Setting Up & Using `serena-mcp` for Semantic Agent Context

`serena` is an intelligent semantic code indexer, language-server tool, and context engine for AI coding agents. Running `serena-mcp` as a Model Context Protocol (MCP) server provides your AI agents with precise, AST-aware code navigation and project memory—eliminating token-wasting manual file scans.

---

## Why Use `serena-mcp`?

Standard AI agents rely on blunt tools like `grep` or reading entire source files into their context window. This creates two problems:
1. **High Token Consumption**: Reading full files rapidly exhausts context limits.
2. **Lack of Semantic Understanding**: Plain text search misses cross-file references, type definitions, and AST structure.

`serena-mcp` solves this by giving your agent direct access to Language Server Protocol (LSP) and JetBrains IDE capabilities:
- **Symbol Search & Jump to Definition**: Instantly locate classes, methods, and type declarations across large codebases.
- **Reference & Call Graph Tracing**: Find all usages of a symbol across package boundaries.
- **AST-Aware Exploration**: Query code structure without loading redundant boilerplates.
- **Project Configuration Memory**: Persist workspace settings and symbol indexes locally under `.serena/`.

---

## Setup Guide

### 1. Requirements

- **Python 3.13+** installed on host.
- [`uv`](https://github.com/astral-sh/uv) CLI installed (providing `uvx`).

### 2. Configure MCP Locations

Add the `serena` MCP server definition to your project or global MCP configuration:

- **Project-Level Config** (`.agents/mcp.json` or `.mcp.json`):
- **Antigravity CLI (`agy`) Global Config** (`~/.gemini/config/mcp_config.json`):

```json
{
  "mcpServers": {
    "serena": {
      "command": "uvx",
      "args": [
        "-p",
        "3.13",
        "--from",
        "git+https://github.com/oraios/serena",
        "serena",
        "start-mcp-server",
        "--project-from-cwd"
      ]
    }
  }
}
```

*Key argument:* `--project-from-cwd` automatically initializes or binds Serena to the active project root directory where the agent is running.

---

## Workspace Configuration (`.serena/project.yml`)

When Serena activates in a repository, it reads `.serena/project.yml` at the project root for project-specific indexing rules.

Example `.serena/project.yml`:

```yaml
project_name: "dotfiles"
encoding: "utf-8"
ignore_all_files_in_gitignore: true

# Language backend to use (LSP or JetBrains)
language_backend:

# Workspace subfolders to index (defaults to root ".")
ls_workspace_folders:
  - "."

# Additional folders to register for cross-package reference resolution
ls_additional_workspace_folders: []

# Custom paths to exclude from indexing
ignored_paths:
  - "node_modules/**"
  - ".git/**"

read_only: false
```

> [!TIP]
> Ensure `/.serena/` (except `.serena/project.yml`) is added to your root `.gitignore` to avoid committing local cache and logs.

---

## How Agents Use `serena-mcp` in Practice

Once enabled in `.agents/mcp.json`, AI agents automatically detect Serena's MCP tools during startup:

1. **Exploring Unfamiliar Code**: Instead of reading dozens of files, the agent queries Serena to outline symbol hierarchies or trace incoming call chains.
2. **Refactoring & Symbol Renaming**: The agent uses Serena to find all exact usages across workspace folders before making multi-file modifications.
3. **Paired with Skills**: Skills like `codebase-exploration`, `code-craft`, and `systematic-investigation` seamlessly leverage Serena MCP tools for zero-hallucination code navigation.
