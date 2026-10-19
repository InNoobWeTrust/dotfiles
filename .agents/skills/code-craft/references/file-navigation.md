# Code-file Navigation

Give humans and agents a quick, source-local map of what a file does and where its
important behavior lives. This is navigation, not an API contract, execution
report, module README, or proof of whole-codebase integrity.

**Inputs:** the file, repository conventions, relevant imports/callers and changed
behavior. **Output:** a compact native file docstring/comment with verified symbol
anchors, maintained with the code. Use ordinary source/symbol tools; no generator,
new documentation system or special integration is required.

## When and how much

- **New hand-maintained files:** include a purpose header. Expand it into a small
  file map when multiple meaningful flows, responsibilities or boundaries need
  navigation. For a tiny linear file, one sentence is enough.
- **Existing files:** add or refresh the relevant map when a change adds or moves
  a responsibility, consequential dependency edge or consumer-visible flow.
  Otherwise check existing entries affected by the edit and correct stale ones.
  A typo or local bug fix does not require an unrelated header retrofit.
- **Scope:** write the header with the change, not as an upfront design phase or
  later polishing exercise. Do not sweep untouched files. Report out-of-scope
  stale maps rather than silently broadening the work.

## What belongs in the header

Use the file's existing top-level documentation rather than creating a duplicate.
State its purpose, group the important entry-point symbols by responsibility or
flow, and name consequential dependencies, consumers, effects or state ownership
where these guide safe changes. Include only relevant constraints; do not copy
every helper, signature, import, line number or generated symbol index.

Illustrative shapes below use hypothetical symbols; replace them with names and
relationships checked in the actual source:

```python
"""Accept orders and persist receipts.

Map: submit_order -> validate_order -> commit_receipt.
Boundary: checkout handlers call submit_order; ReceiptStore owns persistence.
"""
```

```ts
/**
 * Load configuration and expose validated settings to the application.
 * Map: loadSettings -> parseSettings -> validateSettings.
 * Edges: loadSettings reads the filesystem; bootstrap consumes the result.
 */
```

Keep task/session IDs, agent attribution, review chatter, research history,
secrets and sensitive operational details out of the map. Preserve legitimate
licenses, copyright notices, citations and technical constraints the code needs.

## Native placement and exceptions

| Language | Safe form; preserve existing toolchain ordering |
|---|---|
| Python | Real module docstring after shebang/encoding comments, before `from __future__` and imports. |
| TypeScript/JavaScript | Leading block comment, not a string expression. Use `@packageDocumentation` only where already conventional; preserve directives and their required positions. |
| Rust | `//!` inner documentation before items, without moving required inner attributes or disrupting existing documentation conventions. |
| Go | Ordinary file-local comment after the `package` clause; do not create competing package documentation in every file. Preserve build tags, blank lines and directive adjacency. |
| Shell/other source | Native comments in a toolchain-safe position, preserving shebangs, pragmas, licenses and directives. |

Do not hand-edit generated, vendored or minified files. If no native-safe header
is possible, skip it and explain the limit in the existing change summary/handoff,
not in a new companion document. Use existing accepted companion navigation only
where appropriate; never claim the file has an in-file map when it does not.
Check the first representative insertion with the repository's existing formatter,
parser/build or documentation tooling as applicable; do not install tooling just
to enforce this convention. Report unavailable checks rather than claim success.

## Use the map, then verify the source

Before relying on a map for an edit, review or conclusion, check the named symbols,
actual imports/wiring, relevant callers and consequential normal/error paths.
Follow affected cross-file contracts far enough to assess the change's impact;
state what was checked and what remains unknown, not that the whole graph is proven.
Correct affected header entries when symbols move, responsibilities change or
dependencies change. Missing legacy headers alone are not defects.

The file header is local navigation. Task inspection/check evidence belongs in the
existing change summary/handoff; a module README remains an optional consumer
entry point. Update affected entries of an existing authoritative project map when
needed, but create no new project map merely to satisfy this convention.

## ACI check and first use

- **Source interface:** inputs, output, examples, placement and exception paths are explicit; runtime compliance and navigation benefit remain unverified.
- **Risks addressed:** stale summaries, toolchain damage, context leakage and documentation sprawl; maps remain hints, not coverage claims.
- **Pilot:** on the first 1–2 representative uses, check native tooling and whether the reader can locate the main flows and affected consumers without the chat.
