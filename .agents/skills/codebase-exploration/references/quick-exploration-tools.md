# Quick Exploration Tools Reference

Purpose: choose concise, existing capabilities for 2–3-turn reconnaissance. A short recon locates the next question; it does not prove whole-system understanding.

## Discover capabilities, do not fetch tools implicitly

Prefer native path/search/read tools, then trusted installed AST/LSP clients. Inspect actual tool schemas or installed-command documentation before use. Package runners such as `npx`, `bunx`, `uvx` or `pkgx` may download and execute code; these examples grant no installation, network or execution authority. Missing tools are a reason to use an available alternative or report a gap, not to install them.

For LSP definitions/references, bridge lifecycle and fallback, use [Structural tracing](structural-tracing.md). A language server executable is not a generic `symbols` CLI. Never assume server-specific methods or flags.

## Select by question

| Question | Smallest useful evidence |
|---|---|
| Where does this behavior live? | Bounded path search, then search entrypoint/feature names and read candidate functions |
| What does this file expose? | Available document symbols or installed AST parser, followed by exports and their consumers |
| Which declaration/callers does this name mean? | Supported LSP definition/reference methods; otherwise source/AST tracing with binding uncertainty explicit |
| Which modules depend on this? | Imports/re-exports plus alias/config resolution; do not equate text matches with resolved edges |
| Which workspace/external packages enter the slice? | Existing manifests, lockfiles and authorized installed resolver output for relevant targets/features |
| How is runtime behavior wired? | Composition roots, routes, callbacks/registration, state ownership and normal/error flows |
| Is a new edge safe? | Shared [structural integrity method](../../architecture-design/references/structural-integrity.md); follow reverse reachability through unchanged nodes |

Package metadata/resolver commands can execute project code, write caches or access the network. Inspect their effects and applicable execution policy before running; read manifests/lockfiles when command execution is unsuitable. A shallow dependency listing is not a transitive or module graph.

## Bounded installed-tool examples

Use only when these commands are actually installed and execution is authorized; native equivalents are equally valid:

```sh
fd auth --type=f --max-results=10
rg 'authenticate' src/auth --max-count=3 --no-heading --with-filename
rg --files src/auth
```

Restrict directories and patterns first. `--max-count` limits matches per file, not total output; use tool-level result limits or further narrow scope. Truncated output is partial evidence, not “no more edges.” For AST tools, inspect the installed interface rather than guessing package/flag recipes; syntax matching is not semantic resolution.

## Recon sequence and fallback

1. Locate a few candidate files and manifests.
2. Inspect symbols/exports and read the relevant implementation and consumers.
3. Identify entry/registration and next dependency/flow question. Answer a bounded location question with source evidence, or select a deeper exploration strategy.

For slow/failing tools, preserve the failure, narrow scope and use an available simpler capability. Do not kill unrelated user processes. A missing LSP method is not proof of repository complexity or a reason to launch a worker merely to retry it. Do not run a full build for quick reconnaissance; where verification is later required, apply its authorized execution workflow.

Return source paths, what was actually established and unresolved coverage. Avoid source dumps, guessed CLI syntax and success claims based solely on symbols, diagnostics or compilation.

## References

- [Language Server Protocol](https://microsoft.github.io/language-server-protocol/)
- [ast-grep](https://ast-grep.github.io/)
- [ripgrep](https://github.com/BurntSushi/ripgrep)
- [fd](https://github.com/sharkdp/fd)
