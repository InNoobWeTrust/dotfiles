# Diagram Selection and Compatibility

Use a diagram when spatial relationships, sequence, hierarchy, comparison, or
change-over-time are easier to understand visually than in prose or a table. First
identify the audience, the question the diagram should answer, and the Markdown
destination. Prefer the least complex representation that answers that question;
do not force one family to represent unrelated facts.

## Retrieve a Catalog Entry

The bundled `assets/diagram-types.csv` is the authoritative choice catalog for
documented non-beta diagram families; `assets/excluded-types.csv` lists beta types
not to select by default. Resolve both paths from the loaded skill root. If an
available authorized search/CSV tool exists, query by the required communication
intent and keywords, then inspect `avoid`, `compatibility`, and source fields for a
few candidate IDs. Otherwise read the header and a bounded relevant set of rows;
do not dump the full catalog into working context merely to select one type.

Use each row's official diagram documentation URL for detailed syntax. The catalog
records documentation version 12.2.0 and collection date 2026-10-31. Recheck the
official page and current beta registry when current support matters; catalog
metadata is a dated snapshot, not a promise about a host or later release. The
beta/exclusion classification uses the official pinned Mermaid registry at
`https://raw.githubusercontent.com/mermaid-js/mermaid/0e805c70a3b6d8587796a8003911ee54042db6da/packages/mermaid/src/docs/.vitepress/betaDiagrams.ts`.
That registry takes precedence over sidebar completeness or a `-beta` spelling;
Treemap and Ishikawa are non-beta entries even though optional legacy `-beta`
aliases exist.

## Compatibility Field Contract

`compatibility` is free text from source-level evidence, not a tested renderer
matrix. It describes only explicit qualifications such as a documented minimum
Mermaid version, plugin requirement, incomplete layout, experimental feature, or
alias/status distinction. A stated version minimum applies only to the feature
named in the caveat, not to the whole diagram family. `Unknown` means the cited
source did not establish a minimum or guarantee for that family; it must not be
interpreted as “all versions supported.” Do not infer an unspecified version floor.
Host applications may bundle a different Mermaid version, disable features, or
have additional rendering constraints.

Specific caveats:

- C4 documents five variants, but their layout behavior is partial and manually
  expressed in PlantUML style; do not imply complete automatic layout.
- ZenUML requires an external plugin and is not supported by the bundled unmodified
  validator. Use only when that plugin is available and target rendering is checked.
- Packet is documented for Mermaid 11+; Event Modeling for 11.15+; Ishikawa for
  11.12.3+. These are family documentation minimums, not parser test results.
- Mindmap icons are experimental; avoid them by default.
- Treemap and Ishikawa are non-beta in the pinned registry despite optional `-beta`
  aliases. Do not exclude a family by suffix alone.

## Author and Target Check

Write a minimal example whose nodes, edges, order, or grouping encode the intended
meaning. Use short labels, a stable reading direction, and explicit labels for
ambiguous links. Avoid relying on color, undocumented syntax, experimental features,
or visual distinctions that disappear in plain text. Check that the diagram's
claims match source facts; successful parsing cannot establish semantic truth.

Before embedding, inspect the intended Markdown target with its actual preview or an
available authorized rendering capability. A syntax parser and a syntax-page
example cannot establish target support. If rendering is unavailable, say so and
offer a text/table fallback when a usable visual cannot be guaranteed. Generating
an SVG/PNG requires an available authorized renderer; the bundled parser does not
render or export images.
