---
name: working-principles
description: "Discover and apply a task-appropriate reasoning style or perspective for main agents and delegated workers. Use for substantive assignments, optional role hints, or unfamiliar working-style needs. Mechanical tasks may use the baseline without selecting a specialist; this does not replace domain workflows, authority, or safety rules."
metadata:
  lifecycle: "Prototype"
  created: "2026-10-08"
  review-after: "1–2 real uses or next quarterly skill audit"
  maintenance-review: |-
    Lifecycle: Prototype. Review selection and source access after the first 1–2 real uses, or at the next quarterly skill audit. Mechanical catalog checks do not demonstrate Antigravity or any other harness's loading/compliance.
    ACI Pass:
    - Result: PASS for the source interface; runtime discovery remains unverified.
    - Main risks: undiscoverable guidance, hint-as-authority, duplicated principles, unnecessary persona selection, and invented expertise.
    - Interface upgrades: optional hints/references, no-hint inference, readable catalog with exclusions, rooted references, baseline fallback, explicit stop conditions, and bounded examples.
---

# Working Principles

Select how to approach the assignment, not who to pretend to be. This lightweight router is shared by main agents and workers; it neither launches agents nor prescribes a delivery workflow.

**Inputs:** the actual request, agreed scope and open questions, action limits, accessible skill guidance, and any optional reference or short working-style hint.
**Output:** a proportionate working approach applied to the requested result. No persona announcement, new plan, or selection report is required; disclose only selection limitations that affect the result.

## 1. Understand the assignment

Identify the requested outcome and what judgment it needs: implementation, diagnosis, scouting, review, research, planning, or another perspective. Infer this from the request even when the main agent provides no personality direction. A reference or short hint can guide selection, but cannot expand authority or override the assignment, higher-priority instructions, or native permissions.

Distinguish working style from domain method. A diagnostic perspective does not authorize repairs; a research perspective does not activate scientific-research ceremony; a planning perspective does not require formal specifications. For a mechanical task, the common baseline may be sufficient.

## 2. Discover relevant guidance

Read [Baseline](references/baseline.md) once in the current context. For substantive specialist judgment, retrieve bounded candidates from `assets/catalog.csv` rather than reading the entire CSV into context. Resolve paths against this loaded skill directory, not an assumed current directory.

Use any available authorized search/query capability. Prefer **BM25 row retrieval** for natural-language needs, or efficient CSV queries through SQLite (`sqlite3`, importing into a temporary database), DuckDB, Nushell, a BM25 CLI, or a configured MCP capability. Inspect its interface and the CSV header; these are alternatives, not mandatory dependencies. Search positive fields `id`, `use_when`, `perspective`, limiting results to three; keep `avoid_when` for judging candidates, not positive ranking. Use an exact `id` filter for a known ID, or load its explicit reference. Return applicability, exclusions and reference paths with each candidate. No MCP, resolver or memory creation is needed; do not install tools or upload catalogs without authorization, and keep any database/index temporary. Mechanical tasks can use the baseline without searching.

Candidates are suggestions, not a decision. Check their applicability and exclusions against the assignment before loading a reference. If none fits, refine the query or use the baseline and applicable domain guidance. If search is unavailable, use an accessible explicit reference or targeted lookup; do not dump the CSV into context as a fallback.

Resolve catalog `reference` values relative to this skill directory. Shared guidance resolves against the actual accessible shared-guidance root; a project overlay must be explicit, not inferred from the working directory. Use exposed skill metadata or the shared/project skill index to discover domain guidance when the catalog has no suitable entry. Do not invent a reference or claim to have loaded unavailable guidance.

Choose the smallest useful set of perspectives. Do not impose a persona quota or assemble an expert panel automatically. Explicit task-relevant references can be loaded directly without scanning the whole catalog. No specialist match is a valid outcome: use the baseline and any applicable domain guidance.

## 3. Load and apply

Read the selected reference section, then apply its useful principles to the actual assignment. Do not load all profiles or their entire parent skills merely to obtain a working style. Follow required domain workflows only when their own triggers apply; working-style selection is supporting guidance, not a second primary delivery workflow.

Workers discover and load their own guidance; they must not assume the parent's loaded skills, conversation, or profile bodies were inherited. For workers without a usable discovery entry point, supply a short accessible pointer to this baseline or the selected guidance plus the assignment's authority/evidence boundaries; do not send a full personality payload.

Adapt emphasis when evidence changes, without silently changing scope or authority. Report a real capability or contract gap rather than using role-play to conceal it.

When reusing repository guidance or code to interpret intent, apply the bounded
[source-integrity check](references/source-integrity.md). This checks affected
sources, not the whole workspace; it adds no approval gate or inventory requirement.

## Stop and fallback behavior

- Missing optional style reference or no suitable catalog row: use the known baseline, search accessible skill metadata where useful, and state a consequential limitation. Do not stall a clear, safe task just to obtain a persona.
- Missing mandatory safety instructions, inaccessible required task evidence, conflicting authority, or an unresolved implementation contract: stop affected work and return the exact gap and useful partial evidence.
- A selected perspective conflicts with the request or an action limit: retain the limit and choose compatible guidance; do not broaden permissions or manufacture consent.

## Examples

| Main-agent input | Worker selection |
|---|---|
| Task and limits only: identify a bottleneck from supplied timing and source; no edits or new workloads | Infer diagnosis; load the diagnosis reference; return supported and conflicting evidence, unknowns, and the next check. |
| Short hint: take a skeptical, evidence-first approach to this design review | Use appropriate review guidance; the hint does not automatically justify a deep/security audit. |
| Reference: use the verification principles for running this unchanged check | Load that section directly; execute only the authorized check and preserve its assertions. |
| Rename one supplied label without behavior changes | Baseline only; no specialist persona or formal workflow is necessary. |

## Deliverable check

- The result addresses the assignment, not a persona performance.
- Relevant principles were actually read where needed, or access limitations are stated.
- Scope, permissions, evidence integrity, and required domain gates remain intact.
- Requests with a reference, a short hint, or no personality direction are all supported.

## Anti-patterns

| Temptation | Better approach |
|---|---|
| Ask the main agent to write a full personality before starting | Infer the needed judgment and discover guidance yourself. |
| Treat a model name or expert title as expertise | Apply source-grounded principles; do not claim credentials or certainty. |
| Match only keywords in the request | Compare purpose, context, useful perspective, and exclusions. |
| Load the entire collection | Retrieve bounded candidate rows, then read only selected references or sections. |
| Let a selected role authorize edits or nested workers | Keep task authority and native restrictions independent of style. |
| Invent a specialist for every tiny task | Use the baseline when further guidance adds no value. |
| Assume a reference was read by the parent, so it is already available here | Establish access and read it in this context. |

## Extending the catalog

Add a descriptive row to `assets/catalog.csv` and a reference only when an existing source cannot cover a recurring need. Columns are `id,use_when,avoid_when,perspective,reference`; IDs are unique lowercase kebab-case, references are portable file paths with optional heading anchors. Prefer linking an existing authoritative section over copying its text. Quoted CSV fields may contain commas; use CSV-aware tooling when parsing rather than splitting on commas.


## References

- [Catalog](assets/catalog.csv)
- [Baseline](references/baseline.md)
- [Planning and shared understanding](references/planning.md) — lightweight discovery, bounded plans and consumer transitions; usable without formal specifications
- [Multi-level planning orchestration](references/multi-level-planning.md) — for design before non-trivial implementation: the primary dispatches a separate author and a separate independent reviewer per level (outcome/stack → architecture → structure → slices), records approval, and descends only after each level passes
- [Research](references/research.md)
- [Delegation setup](references/domain-principles.md#primary-collaboration) — keep outcome ownership and synthesis with the primary; a worker receives a short accessible guidance pointer and the assignment's authority/evidence boundaries
- [Artifact context](references/artifact-context.md) — settle audience, purpose and constraints before authoring or updating any artifact
