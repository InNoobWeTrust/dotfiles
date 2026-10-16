---
audience: Engineers and agents familiar with MCP and native LSP JSON
purpose: Use and extend a minimal installed-LSP bridge
scope: WIP stdio wrappers, not an IDE or Serena migration
---

# LSP MCP — WIP

| Goal | Prerequisite | Boundary |
|---|---|---|
| Discover installed language servers; expose their supported LSP methods as MCP tools | Bun, trusted installed servers, a workspace | No installers, semantic helpers, automatic edits or extra config files |

```text
agent → MCP discover/start → installed LSP initialize
      ← capability-filtered tools ← native LSP results
      → explicit document sync; events → diagnostics/logs
```

OpenCode enables `mcp.servers.lsp` by default; disable it manually when not needed. This bridge has no Serena dependency; other-harness setup is outside this module's scope.
Startup and `discover` have been verified through the running OpenCode service, not only an isolated MCP client.
Live OpenCode catalog refresh, document symbols and diagnostics have also been verified with the installed Bash language server.

## Use

Run `bun run start` here, or execute `bin/mcp-lsp` directly; its shebang needs Bun on PATH.
OpenCode currently launches `mcp-lsp` from PATH. If a running service predates that PATH entry, use `{env:HOME}/.agents/mcps/lsp/bin/mcp-lsp` as the explicit command instead.
The package must first be deployed under `~/.agents/mcps/lsp` using the repository's dotfile links; adding files in this checkout alone does not deploy them.
The process working directory is its workspace; it starts no language servers until asked.
Bun may fetch the three protocol libraries on a cold cache, following the neighboring MCP packages' versioned-import convention; it does not install language servers.
Cold-cache nested dependency resolution failed on tested Bun 1.4.2; the current passing protocol suite used a prewarmed `vscode-jsonrpc` cache. Live startup with installed dependencies works; cold-cache reliability remains WIP.

1. **Discover:** call `discover`; choose an installed recipe ID. It searches nearest project `node_modules/.bin`, `.venv/bin`, `venv/bin`, `.pixi/envs/default/bin`, then inherited PATH, stopping at `.git`, filesystem root or 12 ancestors.
2. **Start:** call `start` with `{"id":"ty"}` and optional native `initializationOptions` / `settings`. Starting executes installed code with inherited permissions; only use trusted workspace executables.
3. **Relist:** request the MCP tool list. Names such as `lsp_ty_textDocument_hover` or `lsp_bash_language_server_textDocument_hover` appear only for supported advertised capabilities.
4. **Synchronize:** send `didOpen` with exact text, language ID and version; send increasing-version `didChange` after edits and `didClose` when done. These tools appear only when the server requests synchronization.
5. **Call:** supply `{"params":{...}}` using native LSP JSON, `file://` URIs and zero-based **UTF-16 code-unit** positions. Results are unchanged protocol values encoded as MCP text JSON; inspect returned edits yourself.
6. **Drain / stop:** `events` with `{"session":"s1"}` drains bounded diagnostics/logs; `stop` removes wrappers and shuts down that child.

At most four sessions run concurrently. Unknown methods, `workspace/executeCommand`, dynamic LSP registrations, file watching and automatic edits are deliberately absent.
Notification history is bounded to 100 entries / 256 KB per session; check the returned `dropped` count.

### Readable server names

Wrappers use `lsp_<Mason package name>_<native method>`, replacing punctuation with underscores; `start` returns that canonical name as `server`.
Names follow the [Mason registry](https://github.com/mason-org/mason-registry/tree/main/packages), whose [Neovim mapping](https://github.com/mason-org/mason-lspconfig.nvim/blob/main/lua/mason-lspconfig/mappings.lua) distinguishes package names from editor aliases such as `bashls`.
This bridge borrows those identities, not Mason's installer or a claimed Mason MCP convention.

| Canonical package | Invoked executable |
|---|---|
| `pyright` / `basedpyright` | `pyright-langserver` / `basedpyright-langserver` |
| `dockerfile-language-server` | `docker-langserver` |
| `json-lsp` / `html-lsp` / `css-lsp` | `vscode-{json,html,css}-language-server` |

Wrapper names identify a server recipe and remain stable across restarts; they do not fence a particular session instance.
Only one session per recipe may run; `events` and `stop` still require the current session ID returned by `start`.

## Installed-server recipes

| Scope | Executable and arguments | Important limitation |
|---|---|---|
| JS/TS, React | `typescript-language-server --stdio` | Requires TypeScript/tsserver |
| Python (preference order) | `ty server`, `pyrefly lsp`, `pyright-langserver --stdio`, `basedpyright-langserver --stdio` | Discovery preserves this order; starting a server remains explicit. Interpreter settings may be needed |
| Rust / Go | `rust-analyzer`, `gopls` | Workspace/toolchain configuration remains server-owned |
| Bash | `bash-language-server start` | **Not zsh**; no vetted zsh recipe found |
| Dockerfile | `docker-langserver --stdio` | Fixed legacy package recipe |
| Markdown / Typst | `marksman server`, `tinymist` | Marksman cross-file features need git or `.marksman.toml` |
| Makefile | `autotools-language-server` | Documentation-only launch evidence |
| Kubernetes YAML | `yaml-language-server --stdio` | Configure `yaml.schemas`; schema stores may access network |
| JSON / HTML / CSS | `vscode-{json,html,css}-language-server --stdio` | From vscode-langservers-extracted; formatter/snippets may require options |
| Vue | `vue-language-server --stdio` | Modern hybrid TS features need companion TypeScript server/plugin; no bridge routing |
| Tailwind | `tailwindcss-language-server --stdio` | Recognizable workspace and version-specific configuration needed |

Discovery is intentionally a fixed recipe allowlist, not an exhaustive package/runtime scan. Activate your environment before starting MCP if its bins are not on PATH.
The bridge itself downloads no LSPs; an installed language server may run tools, load plugins or access network under its own behavior.
Python launch commands follow the official [ty CLI](https://docs.astral.sh/ty/reference/cli/#ty-server) and [Pyrefly editor integration](https://pyrefly.org/en/docs/IDE/#vimneovim--cocnvim) documentation. `ty` is already declared/exposed in this repository's Pixi manifest; a fallback recipe does not install Pyrefly.

## Why these boundaries

The learning task was to implement discovery → initialization → capability-gated raw call, with an unsupported-capability/encoding boundary case.
Assumed baseline: MCP familiarity, but no prior LSP-client implementation knowledge; the costly mistakes are stale document state, position-unit errors, unsupported calls and orphaned children.

| Conditional judgment | Prefer / avoid | Evidence and limit |
|---|---|---|
| When adapting stdio LSP | Reuse `vscode-jsonrpc`; initialize once, then send `initialized` | [LSP initialization](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#initialize); protocol source, not field validation |
| When exposing capabilities | Filter a known method registry; capabilities do not describe parameter schemas | [LSP server capabilities](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#serverCapabilities) |
| Before document requests | Explicit synchronization and UTF-16 positions; reject unsupported encoding rather than guess | [Document sync](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocument_synchronization), [encoding](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#positionEncodingKind) |
| After start/stop | Register/remove SDK tools and notify catalog changes; do not assume every host refreshes | [MCP tools](https://modelcontextprotocol.io/specification/2025-06-18/server/tools), actual SDK registerTool/remove API |
| When practitioner advice conflicts with the wire contract | Reject malformed encoding, isolate the server; do not silently reinterpret positions | [Public Python extension incident #25710](https://github.com/microsoft/vscode-python/issues/25710): reporter's SDK serialization failure, one anecdote, not general consensus |

Recipe grounding: [nvim-lspconfig configurations](https://github.com/neovim/nvim-lspconfig/blob/master/doc/configs.md), [YAML server](https://github.com/redhat-developer/yaml-language-server), [Marksman](https://github.com/artempyanykh/marksman), [extracted VS Code servers](https://github.com/hrsh7th/vscode-langservers-extracted), [Bash zsh limitation](https://github.com/bash-lsp/bash-language-server/issues/689).
Most recipes share the lspconfig evidence origin; they are not independent runtime confirmations. No practitioner interview occurred; public incident evidence is limited and recipe research stopped at its bounded source budget.

### Lessons from Serena's core

Source inspection of [SolidLSP file buffers](https://github.com/oraios/serena/blob/main/src/solidlsp/ls.py#L125-L176) reinforces explicit open/change/close ownership and increasing versions: its maintainers note stale-version ambiguity in rust-analyzer and Pyright.
Its [process layer](https://github.com/oraios/serena/blob/main/src/solidlsp/ls_process.py#L251-L275) bounds graceful shutdown, rejects pending requests on failure and returns `MethodNotFound` for unknown client requests; this bridge keeps those essentials but leaves retries and semantic normalization to the agent.
Its [initialization builder](https://github.com/oraios/serena/blob/main/src/solidlsp/initialize_params.py#L60-L84) documents server-specific duplicate-indexing risks from workspace roots; this WIP supports one workspace and has not validated every server's root handling.
These are source observations, not a run of Serena or independent confirmation of every maintainer comment; no Serena code or dependency was copied.

## Verification and extension

`bun run test` exercises the real MCP entrypoint against a deterministic fake stdio LSP: discovery precedence, Python preference/launch arguments, stable server-named wrappers, restart/multiserver isolation, capability filtering, raw forwarding, explicit sync, server configuration requests, edit refusal, encoding isolation, child death, request timeout and forced cleanup.
This is executed protocol practice once the suite passes, **not** proof that every real recipe works. Real Bash-server checks confirmed document synchronization, diagnostics, symbols and live OpenCode catalog refresh; other real servers still need individual checks.

Maintainer boundaries: `discovery.ts` owns bounded lookup, `recipes.ts` launch facts, `client.ts` transport/lifecycle/document state, `methods.ts` capability mapping, and `server.ts` MCP session/catalog adaptation.
To extend, add a documented recipe or a method mapping, then test its advertised/absent branches. Do not add arbitrary executable arguments or a generic RPC bypass.

Next useful check: select a trusted installed server for another supported language, open a known document and verify its native results, then stop it.
This remains a package README, **not a new reusable skill**: broad server compatibility and zsh/Vue orchestration are unvalidated.
