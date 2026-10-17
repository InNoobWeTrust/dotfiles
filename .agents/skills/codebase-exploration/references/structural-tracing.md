# Source-backed structural tracing

For architecture, dependency or change-placement questions, apply the shared [structural integrity method](../../architecture-design/references/structural-integrity.md). Start with the affected slice; follow relevant edges through untouched code, not a repository dump.

## Evidence path

1. Locate entrypoints, manifests, module exports and registration/composition roots with existing path/text tools. Read owning code and consumers, not just search snippets.
2. Discover available semantic capabilities. When an authorized LSP client/integration is available, inspect its supported language, workspace and methods; use definitions, references or symbols where actually supported to resolve bindings and callers. Do not invent generic `language-server symbols` commands, assume call hierarchy exists, or install a server implicitly.
3. If managing a server through a bridge, start only trusted installed recipes in the intended workspace. Discover/relist supported methods after start. Synchronize exact current document text with `didOpen` and increasing-version `didChange` before requests; use file URIs and the server's position encoding (the usual LSP default is UTF-16). Drain diagnostics with any dropped-message limitations. Close documents and stop only sessions you own when done. A managed client may handle this lifecycle itself; do not duplicate it.
4. Complement semantic results with actual imports/re-exports, alias/resolver configuration, manifests, features/targets, relevant lockfile paths and runtime wiring. LSP references are not a workspace/external dependency graph. Diagnostics or compilation are not a boundary review.
5. If LSP is unavailable, crashes or lacks a method, use existing AST/text tools and manual source tracing. AST matches establish syntax, not binding identity; AST byte offsets are not LSP character positions. Mark ambiguity and missing graph coverage; absence of LSP alone does not make a source-proven edge unverified. Do not install, reconfigure services or bypass execution restrictions.

## Compact handoff

Return source identity, question/scope, responsibilities/placement, representative normal/error flow and state/effects, relevant graph edges with path:symbol or current line evidence, searched exclusions and unresolved edges. For an architecture report, populate the existing report template rather than creating a parallel format. Label facts, proposals and unknowns distinctly.

For cross-agent reuse, use [source-map capture/recall](../../memory/references/source-maps.md) within authorized scope, or carry the compact map inline when persistence is unavailable/not authorized. The recipient must validate freshness and inspect source edges relevant to its assignment; a remembered map is a navigation aid, not architectural authority.
