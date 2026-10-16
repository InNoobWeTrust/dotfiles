---
audience: Maintainers extending or wiring the remote-memory MCP
purpose: Document the actual resolver/search APIs, boundaries and verification
scope: Scoped external-memory resolution plus read-only BM25 index/search; no file management
---

# remote-memory MCP

Scoped external-memory resolver and read-only search. `resolve_root` returns the absolute path of one
external memory scope so the agent reads, edits and manages Markdown/YAML there directly; this server
never writes memory files (only its own scope metadata on creation). Project knowledge stays direct at
`<git-root>/.agents/memories`; this server handles the four external scope kinds only.

```text
agent → resolve_root(scope, identities) → absolute path (+ .scope.md on create)
agent → index/search(target) → in-process MiniSearch BM25+ ranking + csv-parse CSV parsing
     ← counts/skips/paths or BM25 results ← fresh in-memory corpus every call; no persistent index
```

## Run and verify

`bin/mcp-remote-memory` needs Bun only — the engine runs in-process, so no Python, SQLite or
other child process is involved. Bun resolves the pinned libraries directly from versioned imports;
there is no subproject installation step or local dependency tree:

```sh
bun --no-env-file tests/e2e.ts        # real stdio SDK initialize/list/call suite
bunx --bun --package @biomejs/biome@2.5.15 biome check .
```

Bun resolves `minisearch@7.2.0`, `csv-parse@7.0.3/sync`, SDK@1 and Zod@4 at
runtime; `--no-install` is deliberately absent so Bun can resolve versioned imports.
A first run needs network access if the libraries are not yet
in Bun's cache; subsequent cached runs can be offline. No `bun install` is required. Strict typechecking
needs the available Node declarations and versioned-import mappings appropriate to the environment.
The E2E suite forwards `BUN_INSTALL_CACHE_DIR` to its SDK-spawned server, so a writable scratch cache
can be used without changing the checkout. It also searches the five real skill CSV catalogs.
For a genuinely cold server check, set `REMOTE_MEMORY_E2E_SERVER_CACHE_DIR` to a different empty
writable cache directory; otherwise the client's imports may have warmed the server's dependencies.
Reuse both cache directories for a subsequent offline run.

## Tools

`resolve_root({scope, ...identities, create?})` — scopes and required identity fields:
`harness`→`harness`, `repository`→`repo_id`, `task`→`repo_id,task_id`, `session`→`harness,session_id`.
IDs match `[A-Za-z0-9][A-Za-z0-9._-]{0,127}`. Irrelevant identity fields are rejected. Returns
`structuredContent {path, scope, identities…, schema_version:1}`; the migration client relies on
`structuredContent.path`. Only `create:true` creates the default base and scope subtree (0700) and writes
`.scope.md` (flat YAML: `schema_version`, `scope`, exactly the identity fields). Metadata is verified on
every resolve/index/search call and mismatches fail closed; nonempty directories without metadata are
never adopted.

`index({target})` / `search({target, query?, limit?10, fields?, filters?})` — targets are exactly:
`{kind:"memory", scope, ...identities, subdirectory?:"."}` (verified scope, Markdown only, `.scope.md`
excluded) or `{kind:"directory", path:absolute, files?:relativePaths[]}` (canonicalized root; exact
relative files, not patterns). Directory mode deliberately bypasses scope metadata and is not an
authorization boundary. `query` (≤512 chars, 1..32 Unicode word tokens, OR-joined) is required unless
nonempty `filters` retrieve CSV rows deterministically with score 0. `fields` selects CSV searchable
columns (not output projection); `filters` are case-sensitive exact equality ANDed before ranking; both
error on non-CSV candidates. Text hits carry path, 1-based line range and a bounded snippet (4096 UTF-8 bytes,
`truncated` flag); CSV hits carry full relative path, 1-based record number, optional `id`, bounded row
data (4096 serialized UTF-8 bytes; trailing columns omitted when necessary) and `truncated`. Ranking is
MiniSearch's BM25+ at library defaults (`k` 1.2, `b` 0.7, `d` 0.5), terms OR-combined with no prefix or
fuzzy expansion; library scores are negated only to keep the lower-is-better wire order, then deterministic
score/path/locator tie-break is applied before `limit`. `index` returns counts, bytes, skip
reasons and indexed relative paths.

### Example calls

Resolve a task directory, then read/edit Markdown directly at the returned absolute path:

```json
{"scope":"task","repo_id":"dotfiles","task_id":"release-notes","create":true}
```

Search only that task's `decisions` subtree (which must already exist):

```json
{"target":{"kind":"memory","scope":"task","repo_id":"dotfiles","task_id":"release-notes","subdirectory":"decisions"},"query":"deployment rollback","limit":3}
```

For a skill catalog, call `search` with an absolute directory and an exact file, not a glob.
Replace `/home/agent/.agents` with your actual shared skill location:

```json
{"target":{"kind":"directory","path":"/home/agent/.agents/skills/working-principles","files":["catalog.csv"]},"query":"surgical","fields":["id","use_when","perspective"],"limit":3}
```

The matching `implementation` row includes its record number and full row (including `reference`);
`fields` changes what is searched, not which columns are returned. To retrieve that exact row without
ranking, omit `query` and pass `"filters":{"id":"implementation"}` instead. Resolve catalog reference
paths relative to the selected skill directory. Existing specialized CLI searches remain available;
their scores, aliases and shortcuts are not reproduced here.

## Environment and safety

Base: `MEMORY_ROOT` (absolute, must already exist — a missing custom mount is never recreated or
replaced) else `${XDG_DATA_HOME:-$HOME/.local/share}/agent-memory`. The base is canonicalized once per
process, must stay present, and is refused inside a Git worktree. Paths:
`harnesses/<h>/global`, `repos/<repo>/private`, `repos/<repo>/tasks/<task>`, `harnesses/<h>/sessions/<s>`.
Scope conventions are not filesystem ACLs; host-local paths need the same filesystem namespace or a
user-supplied mount, and normal filesystem permissions still apply.

Encounters: memory walks fail closed on symlinks below the root, non-UTF-8 Markdown and unreadable or
changed files. Custom recursive walks skip and count hidden entries, the documented build/dependency
names (`.git`, `node_modules`, `__pycache__`, `.venv`, `venv`, `dist`, `build`, `target`), symlinks,
binary/non-UTF-8 and unreadable/changed files; explicit custom files allow hidden text but reject
`.git` internals, symlinks, escapes and unreadable files (binary content is skipped and counted). Hard
bounds: 2000 files, 10000 entries, depth 16, 1 MiB/file, 32 MiB total, 20000 chunks/rows; violations
error without partial success. Each index/search builds one ephemeral in-process corpus under those same
bounds; in-process search is synchronous and therefore has **no hard preemptive timeout** — the former
30-second subprocess deadline and 8 MiB stdout / 64 KiB stderr caps were process-specific semantics of the
deleted child process and are not replaced by a fake timer around synchronous work.

## Boundaries

No consolidation, hooks, reminders, sync, auth, cloud adapters, glob/grep, file management or persistent
database. No score/boost/alias/shortcut parity with the older CLI catalog scripts; those scripts remain
for specialized operations, and skills may prefer generic CSV search. `src/scope.ts` owns base/scope/metadata,
`src/corpus.ts` the bounded FS walk, change detection, chunking and strict CSV parsing, `src/engine.ts` the
ephemeral MiniSearch BM25+ ranking, response bounds and strict Zod validation, and `src/server.ts`
wire schemas and registration. Startup loads the SDK before dynamically importing the engine;
the [shared startup guard](../README.md#startup-coordination) also prevents competing MCP dependency
loads from racing over Bun's cold cache.
Extend by documented schema/engine behavior with an
advertised or rejected test branch; do not add generic RPC or arbitrary executable arguments.
