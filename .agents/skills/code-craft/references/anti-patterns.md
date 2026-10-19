# Design decision anti-patterns (code-craft)

## Design Decision Anti-Patterns

Use when a concrete implementation decision risks one of these failures; not as
a pre-write checklist or an assessment library. Keep the simplest working path.

| Temptation | Why It's Wrong | Correct Path |
|---|---|---|
| "I'll add this method to the existing class — it's already there" | Existing placement does not establish responsibility | Keep it there if it belongs to the cohesive domain; otherwise use a meaningful boundary, not an automatic service class |
| "I'll add another parameter to handle the new case" | Mode flags can hide different responsibilities and complicate callers; a parameter is not inherently wrong | Keep straightforward domain parameters; use composition or a strategy only when distinct behavior warrants it |
| "I'll copy this logic here — it's only used twice" | Repeating the same domain invariant risks drift; similar-looking code is not necessarily the same rule | Share a cohesive rule when its identity is clear; do not merge unrelated responsibilities merely to reduce lines |
| "I'll use a dict/map here — it's flexible" | Hides structure; readers cannot see what fields exist | Use a typed struct, dataclass, or interface at production domain boundaries; native maps remain valid for simple scripts and local lookups |
| "The function is getting long but it all belongs together" | Length can signal mixed responsibilities, but an arbitrary cutoff does not establish them | Inspect responsibilities, nesting and reader effort; extract meaningful stages when that clarifies flow, and keep cohesive linear logic together |
| "I'll extract this 2-line calculation/lookup into a helper function to keep the caller extremely short" | Trivial wrappers add navigation without hiding meaningful complexity | Keep trivial calculations and lookups inline; a short helper is justified only by a meaningful domain contract or effect boundary |
| "I'll put the business rule in the controller/handler" | Entangling decisions with framework or I/O behavior makes both harder to inspect and test | Separate decision logic from effects using existing functions/modules; add a service class only when it earns its complexity |
| "I'll return `[]` / `null` / `false` here so callers don't break" | Hides contract ambiguity and turns real failure into fake success | Surface a typed/domain error; report the contract gap to the authorized primary rather than inventing a fallback |
| "I'll tweak this interface signature or invent a new DTO during coding" | Violates locked contract gate; introduces unapproved drift and breaks callers | Adhere strictly to locked contracts; report `INCOMPLETE: CONTRACT_DEFECT` if flawed |
| "I'll dump the whole repo tree in the plan or touch unrelated files" | Noise hides affected consumers; adjacent edits exceed authorized scope | Trace the relevant source/callers, keep writes bounded, return scope changes to the primary and clean up owned scratch |
| "I'll keep adding changes without checking the current outcome" | Failures and contract drift compound | Implement a coherent working change and verify it; separate phase files are not required |
| "I'll invent custom locks or reach for distributed infrastructure for local files" | Unsafe writes and check-then-create races risk corruption; extra infrastructure may add no value | Choose a compatible strategy for the actual state owner; see [lock implementation](lock-patterns.md) |
