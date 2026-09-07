# Code Quality Details

Read the relevant section only after its trigger in `../code-quality.md` fires. The baseline rule remains the source for core gates and hard stops.

## Code Structure and Naming

| Artifact | Convention | Example |
| --- | --- | --- |
| Functions | Verb phrase describing action | `fetchUserById`, `validatePayload` |
| Variables | Noun phrase describing content | `userEmailList`, `retryCount` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT_MS` |
| Booleans | `is`, `has`, or `can` prefix | `isAuthenticated`, `hasWriteAccess` |
| Files/modules | Lower-kebab-case noun | `user-repository.ts`, `payment-gateway.py` |

Do not use single-letter names except loop counters (`i`, `j`, `k`). Do not abbreviate unless the term is universally standard in the language ecosystem, such as `id`, `url`, `http`, or `ctx`.

- Limit nesting to three levels. Extract a fourth-level block into a named function.
- Prefer guard clauses at the top. Return or throw early; do not place the happy path in an `else`.
- Keep functions to 50 lines of logic or fewer, excluding declarations, type annotations, comments, and blank lines. If more logic is temporarily necessary, add `// WHY: not extracted — [reason]` and extract at the next opportunity.
- Do not extract one-to-three-line helpers that only add indirection. Keep cohesive registry logic, mapping dictionaries, and simple computations inline.
- Use one public export per file where the language and framework allow it. Co-locate private helpers; place genuinely shared helpers in a named shared module.
- Combine related implementation into cohesive, deep modules rather than fragmenting it across shallow helper files that reveal their internals.

## Traceability and API Documentation

Document every non-obvious decision with a `// WHY:` comment that gives reasoning rather than restating the code:

```text
// WHY: Retry up to 3 times before failing — downstream rate limit is per-minute
```

Every fallback, default, degraded mode, or error-mapping path must trace to an explicit contract, prior behavior, or user instruction. When a return of `[]`, `null`, `false`, cached data, partial success, or a no-op could be misread, make its rationale evident in the type or contract and add a `// WHY:` comment when needed. Never turn uncertainty into fake success.

At the top of each file, document the module boundary in one to three lines, including responsibility and material exclusions:

```text
// Module: payment-gateway — Handles charge submission to Stripe. Does NOT own
// retry logic or fraud checks; those are delegated to their own modules.
```

All public APIs, classes, exported interfaces, and functions require a comprehensive docstring preceding their definition and conforming to ecosystem standards.

## Debt and Refactor Markers

Use this debt format only for an explicit, acceptable deferral:

```text
// TODO(debt): [what is incomplete] — [why deferred] — [what would trigger cleanup]
```

Acceptable debt includes an incomplete abstraction, deferred optimization, provisional business rule, or known rough edge. Never label silent error swallowing, silent semantic fallbacks, god objects, untracked side effects, security shortcuts, or logic copied more than twice as debt.

When a smell cannot be fixed within the current scope, add:

```text
// REFACTOR-SIGNAL: [pattern] — [description]
```

| Pattern | Mark when |
| --- | --- |
| `feature-envy` | A function uses more data from another module than its own. |
| `god-object` | A class or module owns more than one domain concept. |
| `shotgun-surgery` | One logical change requires edits in four or more files. |
| `primitive-obsession` | A raw primitive or positional tuple should be a domain DTO. |
| `long-param-list` | A function has four or more parameters and should use a configuration DTO. |
| `implicit-coupling` | Modules share undocumented state or rely on call order. |

## Module and Library Boundaries

Every distinct module or component directory requires a `README.md` that documents its architecture, responsibility, caller interfaces, and internal design clearly enough for an auditor to understand it without reading source.

- Create the README when creating a module.
- Update it before delivery when the module's public interface, core responsibility, or internal design changes.

For modules imported as libraries, make public APIs explicit through language-native exports or visibility. Keep implementation details, helper classes, composition objects, and intermediate DTOs internal unless they are part of the approved public contract. A consumer import of an internal type is a boundary leak that must be corrected.
