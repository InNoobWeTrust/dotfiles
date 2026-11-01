---
audience: Coding agents and MCP maintainers
purpose: Navigate code and check changes with installed language servers and native linters
scope: Read-only queries and diagnostics; explicit single-server rename and format
---

# LSP MCP

**Pass a file. No setup calls.** The bridge reads current files from disk, selects installed tools, and manages language-server sessions for you.

## Start here

| Need | Call |
|---|---|
| Understand a file without reading all of it | `symbols({file})` |
| Follow code | `definition`, `references`, or `hover` with `file`, `line`, `character` |
| Check a change | `diagnostics({file})` — language-server checks **and native lint** |
| Find a symbol across the project | `workspace_symbols({query, file})` |
| Apply a deliberate edit | `rename` or `format` — these **write files** |

Paths are workspace-relative, or absolute inside the workspace. Positions are **1-based UTF-16** line/character coordinates. Files synchronize automatically; do not send `didOpen` or manage sessions yourself.

```json
{"file":"src/app.py"}
```

Use that input with `diagnostics`. It returns an **array**, for example a language-server result followed by Ruff's lint result. All semantic read-only queries return arrays, even when only one provider answers.

**Read each provider's status:**

| Status | Meaning |
|---|---|
| `ok` | Check completed; inspect its findings, not just the status |
| `unavailable` | Required executable was not found |
| `not-applicable` | No applicable server or required project configuration is missing |
| `error` | Check failed, timed out, or produced invalid output |

Language-server digests are in `data`; native lint findings are in `diagnostics`. Results identify the provider and evidence source. `totalDiagnostics`, `truncated`, and `caps` disclose limits; an unavailable or failed checker is **not a clean check**.

## Native quality checks

`diagnostics` uses the project's own rules. It does not enable every optional rule or replace project configuration.

| Files | Complementary checker |
|---|---|
| Python | Ruff |
| JavaScript / TypeScript | ESLint; requires project configuration and any needed parsers/plugins |
| Bash / sh | ShellCheck — **not zsh** |
| YAML | yamllint; GitHub Actions workflows also use actionlint |
| Markdown | markdownlint-cli2, using read-only stdin input |
| CSS and related stylesheets | Stylelint; requires project configuration |
| Go | Staticcheck, from the containing module |
| Rust | Cargo Clippy, from the containing crate |

Go/Rust analysis is project-scoped; results identify findings outside the requested file. Clippy may compile code and write build artifacts. Linters and language servers execute installed code and may load project plugins: use **trusted workspaces**, just as you would with the tools directly.

Markdown uses stdin and disables configured glob expansion so `fix: true` cannot rewrite source files. This applies workspace-root Markdownlint configuration; subdirectory overrides are not applied, and each result reports that limitation.

Normally, pass only `file`. For a focused check, `diagnostics` also accepts `server` (language-server recipe), `tools` (native checker IDs), and `timeoutMs` (positive execution-time override). Defaults are 30 seconds per file-scoped checker and 120 seconds per project-scoped checker; the effective bound is returned, and a timeout is an error rather than a pass. Override it for a larger project instead of repeatedly retrying at the same bound.

Magic-number rules are useful warnings, **not proof that a limit belongs in the design**. Ruff's `PLR2004`, for example, does not catch every arithmetic threshold and must be enabled in project configuration.

## Edits and advanced calls

- **`rename` / `format`:** One preference-ordered default language server performs the edit. They apply edits to disk, including supported file operations; disk-drift validation and best-effort rollback protect against stale or failed writes. A server lacking the capability returns an error; linters are not edit fallbacks.
- **`ast_grep_search`:** Structural pattern search with native byte offsets, metavariables, and optional replacement previews. It never applies edits and does not resolve symbol bindings.
- **`request`:** Advanced, single-server raw LSP call. Managed synchronization and lifecycle methods are refused. It is not the normal navigation/checking path.

Semantic queries use the first installed matching language-server recipe. Python preference is `ty`, `pyrefly`, `pyright`, then `basedpyright`; quality checkers complement that choice rather than replacing it. Other recipes cover JS/TS, TOML (Tombi), Rust, Go, Bash, Dockerfile, Markdown, Typst, Makefile, YAML, JSON, HTML, CSS, Vue, and Tailwind. See [recipes](src/language-service/discovery/recipes.ts) for exact commands and limitations; a registered recipe is not proof that its server is installed.

## Install and verify

The dotfiles [Pixi manifest](../../../.pixi/manifests/pixi-global.toml) owns the `lsp` environment. From the dotfiles root, `./bootstrap.sh --full` copies that manifest and installs/updates optional environments, **along with its other bootstrap effects**. For an already synchronized live manifest, `pixi global update lsp` updates only this environment. The MCP itself never installs tools.

Run `bin/mcp-lsp` with the intended project as its working directory, or use the existing harness configuration. Bun and the installed executables must be on PATH. Sessions expire automatically and close with the MCP process; no discover/start/stop ceremony is needed.

From this package, `bun run test` runs the regression/E2E checks and `bun run check` runs Biome without fixes. Coverage of a real tool is distinct from the existing protocol fixtures; missing optional tools must be reported, not presented as verified integration.

Maintainers: [tools](src/protocol/tools/) adapt MCP calls, [language-service](src/language-service/) owns LSP discovery/sessions, [quality](src/quality/) runs native checks, and [workspace](src/workspace/) owns paths and edits. The [shared startup guard](../README.md#startup-coordination) and the existing executable launch path are unchanged.
