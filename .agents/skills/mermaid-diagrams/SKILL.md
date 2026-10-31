---
name: mermaid-diagrams
description: "Use this skill to select and author readable Mermaid diagrams in Markdown, check syntax, and decide whether the intended target can render them. Activate when choosing a diagram type, creating or revising Mermaid blocks, or diagnosing a broken diagram. Syntax parsing does not verify rendering; use an authorized renderer when available, and disclose when target rendering remains unverified."
metadata:
  lifecycle: "Prototype: review after 1–2 real uses."
  aci-result: "Source-level interface checked; runtime parsing and target rendering unverified."
  aci-risks: "Dated diagram status, host-version mismatch, and unavailable parser dependencies."
  aci-upgrades: "Intent catalog, explicit exclusions, portable paths, and separate syntax/render/semantic evidence."
---

# Mermaid Diagrams

Choose a diagram only when it communicates better than concise prose, a list, or a
table. Keep the diagram legible in its Markdown context and validate syntax before
embedding it. This bundle provides a choice catalog and a parser; neither guarantees
that a particular Markdown host can render the result.

## Workflow

1. **Select** a type by the message, audience, and target constraints. Use
   `references/selection-and-compatibility.md`; prefer prose/table when a diagram
   adds no clarity. Use only documented non-beta types from the bundled catalog.
2. **Author** a small diagram with descriptive labels, a clear direction or grouping,
   and no decorative complexity. Make the relationship or sequence apparent without
   relying on color alone. Use `references/selection-and-compatibility.md` for
   authoring and source-version caveats.
3. **Parse** the exact source intended for embedding with the bundled validator when
   Bun and its dependencies are already available or dependency resolution is
   explicitly authorized. See `references/validation.md` for commands, exit codes,
   and failure handling. Otherwise perform a manual syntax review and label parsing
   unverified.
4. **Inspect the target** only through an available authorized renderer or the actual
   destination preview. A successful parse is not a render check. If target
   rendering cannot be checked, disclose that limitation; for an image deliverable,
   an authorized rendering capability is required.
5. **Embed** the validated source as a fenced `mermaid` block. Preserve a nearby
   concise text/table alternative when the diagram is important and the target
   renderer is unknown or inaccessible.

## Stop Conditions

- A diagram type is beta/excluded, or its support in the destination is unknown and
  the user requires a guaranteed visual result: choose a documented non-beta type,
  prose/table, or report the unmet render requirement.
- Parser setup is missing or dependency acquisition is unauthorized: do not install;
  use manual syntax review and report parsing as unverified.
- Parsing fails: correct the source and parse again before claiming syntax-checked.
- Rendering is unavailable but an image is required: stop with the rendering gap;
  the parser cannot produce or verify an image.

## Anti-Patterns

| Temptation | Why Wrong | Correct Path |
|---|---|---|
| Add a diagram where a short list is clearer | Visual syntax adds reading and rendering cost | Prefer the simplest form that communicates the relationship |
| Treat a catalog row as proof of host support | Catalog documents type intent and caveats, not target renderer capability | Inspect the actual target with an authorized renderer or disclose unknown support |
| Use a beta type because a page exists | A syntax page can describe experimental functionality | Consult the included/excluded catalogs; select a documented non-beta type |
| Treat parse success as visual or semantic proof | The bundled tool parses source only | Separately inspect target rendering and review meaning against the facts |
| Skip checks because the diagram looks plausible | Small syntax errors can break rendering | Parse with the bundled tool when available; otherwise label manual review unverified |
| Guess a script path from the project root | A copied skill may live elsewhere | Resolve the absolute loaded skill root and use both script paths from it |
| Install missing packages to make a check pass | Dependency resolution can access a registry and alter caches | Proceed only with already-available dependencies or explicit authorization |


## References

- `references/selection-and-compatibility.md` — catalog retrieval, diagram intent, target compatibility, and source freshness
- `references/validation.md` — exact parser commands, exit codes, and fallback contract
- `references/implementation-notes.md` — DOM rationale and parser coverage limitations
- `assets/diagram-types.csv` — documented non-beta diagram family catalog
- `assets/excluded-types.csv` — beta diagram families excluded from the selectable catalog
- `scripts/validate-mermaid.ts` and `scripts/happy-dom-preload.ts` — syntax parser and DOM preload
