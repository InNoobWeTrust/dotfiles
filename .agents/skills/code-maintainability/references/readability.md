# Readability Assessment

Assess only the changed working surface and enough consumers to understand it.
This is a report-only method under [Code Maintainability](../SKILL.md), not an
implementation checklist or permission to refactor. Use only supplied evidence
and explicitly authorized checks; do not install tools or require new scanners.

## Questions driven by reader cost

| Question | Concrete evidence | Avoid mistaking for a defect |
|---|---|---|
| Can a reader locate the relevant rule? | Names or boundaries cause a traced wrong turn or force reading unrelated logic | Personal naming preference or a missing ceremonial comment |
| Can the decision be followed? | Nested expressions, boolean flags or unexplained data transformations conceal an important branch | Idiomatic concise code or a cohesive long function |
| Are effects and failures understandable? | A helper unexpectedly writes state, suppresses an error or changes ordering | Assuming every helper must be pure; use [flow assessment](flow-assessment.md) for the affected path |
| Are rules duplicated? | Copies implement the same business rule and already diverge or require coordinated edits | Similar syntax with independent meaning |
| Are types and interfaces useful? | Repeated casts, ambiguous values or oversized interfaces burden actual callers | Introducing a DTO, class or runtime schema for every internal value |
| Does structure reduce effort? | Tiny wrappers, managers or layers add hops without owning a meaningful contract | Treating a line count, helper count or SOLID score as a pass/fail threshold |
| Can callers use the contract? | Missing input/error/ownership information makes a real call ambiguous | Requiring docstrings for every function or a README for every file |
| Is navigation trustworthy? | Existing map entries contradict actual symbols or consequential edges | Treating a header as proof of complete codebase understanding |

Use repository-configured metrics only when authorized and relevant. A warning
is a lead, not a finding: trace the reader/change cost and check for a legitimate
language or framework convention before recommending a change.

## Record, do not repair

For each worthwhile suggestion, name the source location, observed cost,
smallest adjustment, benefit, risk/effort and condition that would justify doing
it. Preserve behavior and caller contracts in the proposal; do not invent future
consumers or require an exhaustive debt inventory.

Example: `parseRecord` repeats the same field-normalization rule in two accepted
input paths; a new field required matching fixes in both. Record a shared rule as
a candidate for the next format change, including error-ordering risk—not an
automatic helper extraction now.

Keep correctness, safety, data-integrity and required-compatibility defects
separate from deferred suggestions. Return **no worthwhile refinement** when
readability is already sufficient. Actual refinement requires the root skill's
usefulness, explicit approval and current-source revalidation gates.
