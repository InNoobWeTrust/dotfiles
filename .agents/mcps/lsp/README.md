---
audience: Engineers and agents familiar with MCP
purpose: Semantic code queries and applied refactors through installed language servers, plus structural AST search
scope: Task-shaped LSP tools with managed sessions and disk sync, not an IDE
---

# LSP MCP — WIP

| Goal | Prerequisite | Boundary |
|---|---|---|
| Code intelligence and refactors: definition/references/hover/symbols/diagnostics, applied rename/format, AST search | Bun, trusted installed LSPs, workspace | Fixed recipes; no installers, dynamic registration or server-initiated edits |

```text
agent → definition references hover symbols diagnostics workspace_symbols
      → rename / format            (edits applied to disk, all-or-nothing)
      → request                    (raw escape hatch)
      → ast_grep_search            (syntax-only, no LSP)
      ← compact digests: 1-based path:line:col, previews, caps
sessions start automatically by file type; the file on disk is the source of truth
```

There is no discover/start/stop/events ceremony: sessions begin on the first call for a file, are reused across calls, and are stopped by idle expiry, LRU eviction, or process shutdown. OpenCode enables `mcp.servers.lsp` by default; other-harness setup is outside this module's scope.

## Use

Run `bun run start` here, or execute `bin/mcp-lsp` directly; the executable is a POSIX shim that needs `sh` and Bun on PATH and selects this server's private Bun package cache.
OpenCode launches `mcp-lsp` from PATH; the package must be deployed under `~/.agents/mcps/lsp` with the repository's dotfile links.
The process working directory is its workspace. Starting a language server executes installed code with inherited permissions; only use trusted workspace executables.
The executable uses the [shared startup guard](../README.md#startup-coordination): a warm-marker fast path over a per-MCP lock for initial dependencies, and the per-MCP lock for the later JSON-RPC import.

| Tool | Input | Returns |
|---|---|---|
| `definition` | `file`, 1-based `line`, `character` | Up to 10 `locations` (`path:line:col`) with previews |
| `references` | as above, optional `include_declaration` (default true) | Up to 100 reference locations |
| `hover` | as above | `hover` text (trimmed to 1000 chars) |
| `symbols` | `file` | Nested document symbols (up to 200) with kinds and locations |
| `diagnostics` | `file` | Pull diagnostics (`textDocument/diagnostic`) when advertised, otherwise cached push results; reports `source` (`pull`/`push`/`cache`) |
| `workspace_symbols` | `query`, optional `file`/`server` hint | Up to 50 workspace symbols |
| `rename` | as `definition`, plus `new_name` | **Applies** the server's `WorkspaceEdit` to disk; reports changed files |
| `format` | `file`, optional `tab_size` (2), `insert_spaces` (true) | **Applies** formatting edits to disk; reports changed files |
| `request` | `server`?/`file`?, `method`, `params` | Raw native LSP JSON passthrough (advanced) |
| `ast_grep_search` | `language`, `paths`, one of `pattern`/`kind`, optional `selector`/`rewrite`/`maxMatches` | CLI matches/previews; edits are never applied |

Positions are 1-based `line`/`character` in UTF-16 code units (editor and grep convention); conversion to zero-based LSP positions is internal. Paths are workspace-relative; absolute paths inside the workspace are also accepted. Outputs use `path:line:col` and short previews, capped and flagged with `truncated`.

### Sessions and synchronization

The first call for a file picks the highest-preference **installed** recipe for its type, starts it and keeps it warm; up to four sessions run (least-recently-used is stopped), idle sessions expire after ~15 minutes, and a crashed server respawns on the next call.
The file on disk is the source of truth: it is read at call time and re-synchronized (full-text `didChange`) only when its content changed. Open documents are tracked per session (bounded LRU with `didClose`).
Diagnostics merge the pull model (`textDocument/diagnostic`) when advertised; otherwise the cached push result is returned, waiting up to ~1s for a fresh `publishDiagnostics` only right after a synchronization.

### Applied edits

`rename` and `format` apply the server's text edits themselves, pictured as `agent → tool → disk`:

- `TextDocumentEdit` / legacy `changes` and resource operations (`create`, `rename`, `delete` file) are applied in `documentChanges` order; options `overwrite` / `ignoreIfExists` / `ignoreIfNotExists` are honored. Only regular files are supported: directories are refused explicitly.
- All target files are validated and rendered in memory first, then written; a write failure rolls back already-written files on a best-effort basis.
- If a file was read by the language server and changed on disk since, the apply aborts with `File changed on disk since the language server read it`; nothing is written.
- Server-initiated `workspace/applyEdit` requests remain refused, so edits only happen through your explicit tool calls.
- `request` rejects methods the bridge manages (`didOpen`/`didChange`/`didClose`, `initialize`/`initialized`/`shutdown`/`exit`); pass `file` instead to synchronize a document.

### Structural retrieval without an LSP

`ast_grep_search` runs the trusted PATH `ast-grep` CLI (>=0.51, never Unix `sg`); availability problems are reported by the call itself.

Call it, inspect matches, then apply selected changes with ordinary file tools:

```json
{"language":"javascript","paths":["src"],"pattern":"console.log($A)","rewrite":"logger($A)","maxMatches":50}
```

Supply exactly one `pattern` or `kind`; `selector`/`rewrite` are optional.
The CLI renders `replacement`/`replacementOffsets`; this bridge never applies them.
AST matching is **not binding resolution**: same-name rewrites may hit unrelated symbols; use `rename` for semantic renames.

| Result / boundary | Meaning |
|---|---|
| `matches`, `totalMatches`, `truncated`, `warnings` | Native context/metavariables and **byte** offsets (not UTF-16); default 50 / max 200 matches |
| Paths | Workspace-relative (absolute inside the workspace accepted); no `..`, symlink components or `.git` |
| Traversal | Native defaults: matching-language hidden files can appear; hidden directories/ignore rules still apply; no symlink following |
| Limits | One request; 30s/process, stdout4MiB/stderr64KiB; overflow, JSON/process failures return errors, not partial success; narrow the query |

See upstream [CLI](https://ast-grep.github.io/reference/cli/run.html) and [JSON fields](https://ast-grep.github.io/guide/tools/json.html).

## Installed-server recipes

| Scope | Executable and arguments | Important limitation |
|---|---|---|
| JS/TS, React | `typescript-language-server --stdio` | Requires TypeScript/tsserver |
| Python (preference order) | `ty server`, `pyrefly lsp`, `pyright-langserver --stdio`, `basedpyright-langserver --stdio` | First installed recipe wins. Interpreter settings may be needed |
| Rust / Go | `rust-analyzer`, `gopls` | Workspace/toolchain configuration remains server-owned |
| Bash | `bash-language-server start` | **Not zsh**; no vetted zsh recipe found |
| Dockerfile | `docker-langserver --stdio` | Fixed legacy package recipe |
| Markdown / Typst | `marksman server`, `tinymist` | Marksman cross-file features need git or `.marksman.toml` |
| Makefile | `autotools-language-server` | Documentation-only launch evidence |
| Kubernetes YAML | `yaml-language-server --stdio` | Configure `yaml.schemas`; schema stores may access network |
| JSON / HTML / CSS | `vscode-{json,html,css}-language-server --stdio` | From vscode-langservers-extracted; formatter/snippets may require options |
| Vue | `vue-language-server --stdio` | Modern hybrid TS features need companion TypeScript server/plugin; no bridge routing |
| Tailwind | `tailwindcss-language-server --stdio` | Shadowed by earlier recipes for its extensions; recognizable workspace and version-specific configuration needed |

Discovery is a fixed recipe allowlist, not an exhaustive scan: it searches nearest project `node_modules/.bin`, `.venv/bin`, `venv/bin`, `.pixi/envs/default/bin` up to 12 ancestors (stopping at `.git` or the filesystem root), then PATH.
The bridge itself downloads no LSPs; an installed language server may run tools, load plugins or access network under its own behavior.
Python launch commands follow the official [ty CLI](https://docs.astral.sh/ty/reference/cli/#ty-server) and [Pyrefly editor integration](https://pyrefly.org/en/docs/IDE/#vimneovim--cocnvim) documentation.

## Why these boundaries

The redesign target was agent economics and safety: task-shaped tools instead of a protocol procedure, centralized session/sync state, compact digests instead of raw JSON dumps, and edit application with explicit guards. Assumed baseline: MCP familiarity, but no prior LSP-client implementation knowledge; the costly mistakes are stale document state, position-unit errors, unsupported calls, orphaned children and half-applied edits.

| Conditional judgment | Prefer / avoid | Evidence and limit |
|---|---|---|
| When calling a server | Capability-check each method (`Server 'x' does not support …`); return semantic errors, not protocol dumps | [Server capabilities](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#serverCapabilities) |
| Position units | Accept 1-based UTF-16 input, convert internally; reject out-of-bounds before sending | [Encoding](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#positionEncodingKind); the client rejects non-UTF-16 encodings |
| Applying edits | Validate/plan all file and text operations in memory, then write in order; support file create/rename/delete for regular files; drift-guard synced files; roll back best-effort | [WorkspaceEdit](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#workspaceEdit) |
| Session lifecycle | Auto-select by file type (preference-ordered recipes), reuse warm sessions, LRU/TTL bounds, respawn after crashes | LSP lifecycle; recipes verified against [nvim-lspconfig configurations](https://github.com/neovim/nvim-lspconfig/blob/master/doc/configs.md) |
| Practitioner advice vs wire contract | Reject malformed encoding, isolate the server; do not silently reinterpret positions | [Public Python extension incident #25710](https://github.com/microsoft/vscode-python/issues/25710): one anecdote, not general consensus |

Recipe grounding: [YAML server](https://github.com/redhat-developer/yaml-language-server), [Marksman](https://github.com/artempyanykh/marksman), [extracted VS Code servers](https://github.com/hrsh7th/vscode-langservers-extracted), [Bash zsh limitation](https://github.com/bash-lsp/bash-language-server/issues/689).
Most recipes share the lspconfig evidence origin; they are not independent runtime confirmations.

## Verification and extension

`bun run test` exercises the real MCP entrypoint against a deterministic fake stdio LSP: recipe metadata and discovery precedence, session reuse and disk-drift synchronization, 1-based↔0-based conversion (including multibyte), digest caps and previews, diagnostics push/pull/cache, capability errors, multi-file rename and format application with drift guard and rollback, raw request rules, crash respawn, session LRU and folded ast-grep errors.
Text math unit tests cover terminators, UTF-16 edges, overlap/bounds rejection and workspace-edit refusal rules.
AST fixtures plus optional real-CLI checks (skipped without the CLI; require them with `bun --no-env-file tests/ast-grep.ts /absolute/path/ast-grep`) cover structural search and failure modes.
This is executed protocol practice once the suite passes, **not** proof that every real recipe works.

Maintainer boundaries: `workspace/paths.ts` owns workspace containment/symlink policy, `language-service/protocol/semantics.ts` capability checks, param builders and digest normalizers, `workspace/edits.ts` text math and the WorkspaceEdit engine, `language-service/sessions.ts` session lifecycle/sync/diagnostics, `language-service/protocol/client.ts` transport/lifecycle/document validation, `language-service/discovery/discovery.ts` LSP lookup, `language-service/discovery/recipes.ts` launch facts and language mapping, `syntax-search/ast-grep.ts` structural CLI requests, `protocol/tools/` owns MCP tool adaptation.
To extend, add a documented recipe or a semantic tool with its capability branch, then test both advertised and absent cases. Do not add arbitrary executable arguments or a generic RPC bypass; `request` is the deliberate escape hatch and still refuses managed methods.

This remains a package README, **not a new reusable skill**: broad server compatibility and zsh/Vue orchestration are unvalidated. Live smoke (2026-10-19) covered TypeScript, Python (`ty`), Rust, Bash, YAML, JSON and Typst servers; other recipes still need individual checks.
