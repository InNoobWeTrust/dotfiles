# Design decision anti-patterns (code-craft)

## Design Decision Anti-Patterns

These are the most common agent lazy-path shortcuts. Recognize and refuse them:

| Temptation | Why It's Wrong | Correct Path |
|---|---|---|
| "I'll add this method to the existing class — it's already there" | Existing placement does not establish responsibility | Keep it there if it belongs to the cohesive domain; otherwise use a meaningful boundary, not an automatic service class |
| "I'll add another parameter to handle the new case" | Mode flags can hide different responsibilities and complicate callers; a parameter is not inherently wrong | Keep straightforward domain parameters; use composition or a strategy only when distinct behavior warrants it |
| "I'll copy this logic here — it's only used twice" | Repeating the same domain invariant risks drift; similar-looking code is not necessarily the same rule | Share a cohesive rule when its identity is clear; do not merge unrelated responsibilities merely to reduce lines |
| "I'll use a dict/map here — it's flexible" | Hides structure; readers cannot see what fields exist | Use a typed struct, dataclass, or interface at production domain boundaries; native maps remain valid for simple scripts and local lookups |
| "The function is getting long but it all belongs together" | Length can signal mixed responsibilities, but an arbitrary cutoff does not establish them | Inspect responsibilities, nesting and reader effort; extract meaningful stages when that clarifies flow, and keep cohesive linear logic together |
| "I'll extract this 2-line calculation/lookup into a helper function to keep the caller extremely short" | Trivial wrappers add navigation without hiding meaningful complexity | Keep trivial calculations and lookups inline; a short helper is justified only by a meaningful domain contract or effect boundary |
| "I'll put the business rule in the controller/handler" | Entangling decisions with framework or I/O behavior makes both harder to inspect and test | Separate decision logic from effects using existing functions/modules; add a service class only when it earns its complexity |
| "I'll return `[]` / `null` / `false` here so callers don't break" | Hides contract ambiguity and turns real failure into fake success | Surface a typed/domain error; report the contract gap to the authorized owner under `../../../rules/delivery-ownership.md` rather than inventing a fallback |
| "I'll tweak this interface signature or invent a new DTO during coding" | Violates locked contract gate; introduces unapproved drift and breaks callers | Adhere strictly to locked contracts; report `INCOMPLETE: CONTRACT_DEFECT` if flawed |
| "I'll dump the whole repo tree in the plan, touch files outside scope, or create an extra helper file/scratch script" | Full repo trees cause noise; touching out-of-scope files breaks boundaries; extra files cause bloat | Lock scoped tree within affected boundary, explicitly state in-scope vs out-of-scope boundaries, create only declared files, and clean up all scratch artifacts |
| "I'll execute all phases at once from the monolithic plan instead of following separate phase files" | Leads to context exhaustion, hallucination, missed edge cases, and verification failures | Execute one referenced phase file at a time, completing verification before advancing |
| "I'll invent a custom locking strategy, write directly in-place, or reach for Redis/ZooKeeper to sync local files or CLI workers" | In-place writes cause corrupted files on crash; check-then-create has TOCTOU races; distributed locks add massive unnecessary infrastructure | Use Git's atomic lockfile pattern (`O_CREAT\|O_EXCL` -> write `.lock` -> atomic `rename(2)` -> `atexit`/signal cleanup; see `references/lock-patterns.md`) |
