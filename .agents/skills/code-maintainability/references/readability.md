# Readability Assessment

Assess only the changed working surface and enough consumers to understand it.
This is a report-first method under [Code Maintainability](../SKILL.md), not an
implementation checklist or permission to change behavior. Use supplied evidence,
the governing structure standard and the project's configured gates when authorized.
Do not install tools yourself; report missing gates as a foundation gap.

## Questions driven by reader cost

| Question | Concrete evidence | Avoid mistaking for a defect |
|---|---|---|
| Can a reader locate the relevant rule? | Names or boundaries cause a traced wrong turn or force reading unrelated logic | Personal naming preference or a missing ceremonial comment |
| Can the decision be followed? | Nested expressions, boolean flags or unexplained data transformations conceal an important branch | Idiomatic concise code; length within the governing limit |
| Are effects and failures understandable? | A helper unexpectedly writes state, suppresses an error or changes ordering | Assuming every helper must be pure; use [flow assessment](flow-assessment.md) for the affected path |
| Are rules duplicated? | Copies implement the same business rule and already diverge or require coordinated edits | Similar syntax with independent meaning |
| Are types and interfaces useful? | Repeated casts, ambiguous values or oversized interfaces burden actual callers | Introducing a DTO, class or runtime schema for every internal value |
| Does structure reduce effort? | Tiny wrappers, managers or layers add hops without owning a meaningful contract | Helper count or SOLID score as a verdict; configured limits come from the governing standard, not taste |
| Can callers use the contract? | Missing input/error/ownership information makes a real call ambiguous | Requiring docstrings for every function or a README for every file |
| Is navigation trustworthy? | Existing map entries contradict actual symbols or consequential edges | Treating a header as proof of complete codebase understanding |

Configured gates and the standard's limits are the threshold: a breach of the
governing standard is a **structural** finding, not a lead to argue away. Below the
limits, a metric warning is a lead: trace the reader/change cost and check for a
legitimate language or framework convention before recommending a change.

## Classify, then record

For each finding, name the source location, the violated rule or observed cost,
the smallest behavior-preserving adjustment and its risk/effort. Classify it with
the root skill: **structural** (standard violation inside the footprint; mandatory
cleanup after lock), **optional** (needs approval) or **defect**. Do not invent
future consumers or require an exhaustive inventory of untouched code.

Example: `parseRecord` repeats the same field-normalization rule in two accepted
input paths introduced by this task; a new field already required matching fixes in
both. That is a duplicated business rule → structural: move the rule to the import
feature's service layer once, with lock checks covering both paths. If the copies
predate the task, record them as out-of-footprint remediation instead.

Keep correctness, safety, data-integrity and required-compatibility defects
separate. Return **nothing to clean** when the footprint already meets the standard.
Cleanup writes follow the root skill's lock, stack-receipt and revalidation gates.
