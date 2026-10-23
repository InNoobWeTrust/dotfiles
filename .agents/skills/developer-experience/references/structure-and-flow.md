# Structure, flow and contribution discoverability

This is a **selection and labeling layer**, not a second architecture or tracing
method. Locate current source with bounded path/search/read and available semantic
tools; inspect owners, consumers, imports, manifests and runtime wiring rather
than relying on snippets or generated maps. Separate import, workspace/package,
external-dependency and runtime-wiring evidence. Placement/dependency decisions
require the accountable architecture owner to settle responsibilities, allowed
edge direction, proposed edge changes and affected consumers. If that evidence or
owner capability is unavailable, label the view partial/UNVERIFIED and do not
claim a safe boundary. Do not turn a quick DX map into mandatory full C4 documentation.
Source lineage: [sources](sources.md), “Comprehension and structure.”

## Select the question and scales

For the selected feature/task, account explicitly for:

| View | Project internals | Module internals |
|---|---|---|
| Dependencies | Packages/modules/services and relevant dependency direction | Selected module's files/classes/functions and relevant relationships |
| Dataflow/responsibility | Entry/input → responsible building blocks → output/effects | Selected module's input → transforms/state/effects → output and failure path |

For a tiny program the same view may cover both scales: say which nodes do so.
Otherwise mark a scale not applicable or deferred with a reason, not silently
absent. A narrow request can defer unrelated views; a broad assessment must expose
coverage gaps. Scale is a question of useful abstraction, not a fixed node count.

## Expose existing evidence usefully

1. Reuse an existing graph/source-navigation command or authorized integration. Inspect its actual interface, traversal scope and omissions; do not assume import aliases, generated code, plugins or reflection are represented.
2. Select a focus and bounded neighborhood that answers the developer's question. Prefer filters/grouping/on-demand views to unreadable whole-repo hairballs.
3. Use the existing owners above for source traces and architectural interpretation. When a graph generator is absent, a focused manual source-backed diagram or relationship list is a valid fallback; label it partial. Missing runtime access remains a gap, not invented observations.
4. Make the refresh path discoverable: exact command/tool, project-relative scope, source revision/snapshot and relevant configuration/filter. Commit derived views only when the project needs a durable snapshot and can keep it fresh.

Every delivered view labels:
- **Question and scope:** focus, boundary, granularity and exclusions.
- **Evidence:** static imports/calls, source-traced possible path, or observed runtime execution; distinguish these even when drawn together.
- **Direction/meaning:** what an edge means, data/contract crossing it and responsible building block; do not imply every edge carries data.
- **Flow details:** input/output, transformation, state/read/write or external effect, representative error/branch, and unknown dynamic boundaries.
- **Freshness/limits:** source locator or runtime context, regeneration path and unverified coverage.

An import graph cannot prove execution order, observed data movement or a single
responsibility. A cycle/high fan-out is an investigation lead, not a mandate to
split a component. Changing ownership requires evidence of responsibilities and
independent change drivers, then the architecture owner and bounded authorization.
When Mermaid syntax validation is requested, use an available validator against
the diagram source; syntax validation does not render or verify diagram meaning.
If no authorized validator is available, state that limitation rather than
claiming validation or installing one.

## Make the next contribution predictable

Identify the project's existing convention owner: language/framework conventions,
nearest contributor guide/AGENTS guidance, module owner or established code pattern.
Link the current source of truth instead of adding a conflicting DX style guide.
If sources conflict, clarify with the owner before enforcing a new convention.

Check a representative new contributor task without unsolicited edits:
1. Where would the entry point, domain behavior and external adapter belong?
2. What are the expected file/symbol names, visibility and dependency direction?
3. Which existing extension point/component is reused, and where is its check run?
4. Can the contributor discover these answers through current commands/docs/source?

Record specific ambiguity and its owner. Improve the relevant entry point/example
or scoped guideline when authorized. Preserve public names/import paths, generated
files and stable vocabulary. Broader cleanup stays a proposal; working-code
refinement assessment belongs to a separate report-only maintainability assessor
after working behavior is verified; implementation needs an approved behavior and
scope contract; foundation-wide changes need an authorized foundation owner and
current materialization state. Missing capability leaves that work pending.

Verify one real representative dependency and data path against source/runtime as
available, then follow the contribution path. Report coverage and unknown edges;
do not claim architecture quality from a tidy diagram alone.
