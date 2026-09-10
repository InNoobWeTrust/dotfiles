---
description: "Applies to every file written or modified. Enforces core code quality principles, interface-first specifications, locked plan fidelity, and prohibited anti-patterns."
globs: "*"
alwaysApply: true
trigger: always_on
---

# Code Quality Baseline

Applies to every file written or modified. Use this rule for the core design gates and hard stops; load a reference only when its trigger applies.

## Pre-Implementation Principles

Before adding or changing a function, class, or module, confirm all of the following. If any answer is unknown, stop and clarify or redesign.

1. **Single responsibility:** the unit has one job; an "and" in its responsibility signals a split.
2. **Minimal interface:** expose only the smallest surface callers require.
3. **Dependency direction:** depend toward abstractions, not concrete details.
4. **Human traceability:** names and structure make the flow and decisions understandable without reading every body.
5. **Deep modules:** hide meaningful complexity behind a simple, cohesive interface; do not create shallow indirection.
6. **Interface-first specification:** define and agree type signatures, enums, or abstract contracts before implementation logic.
7. **Explicit DTOs:** use named, typed DTOs or equivalent domain types at boundaries, not positional tuples or untyped dynamic maps.
8. **Ambiguity stop:** when caller-visible edge or failure behavior has multiple reasonable meanings, stop for a contract instead of inventing one.
9. **Technology fit:** use the established stack, suitable platform capability, or maintained production-proven dependency. Vendoring or deliberately reimplementing an adequately supplied capability requires explicit user opt-in or repository policy.

## Consumer-Facing Contract Gate

Before implementing a changed public API or consumer application behavior, define the consumer-visible signature or schema and stubs, then obtain sign-off. Internal abstractions are not substitutes for the consumer contract. Do not leak helpers, composition objects, or intermediate/internal DTOs across a library boundary.

## Semantic Rewrite Gate

Before a rewrite, overhaul, or delete-and-rebuild task, identify each old semantic or interface as **preserve** or **delete**. If deletion is intended, remove and recreate the boundary; do not patch new behavior over code intended for deletion. Stop when the preservation decision is unclear.

## Hard Prohibited Behaviors

Do not:

- Give a function, class, or module multiple responsibilities, or grow behavior through another parameter instead of composition.
- Copy logic more than twice, mix business logic with framework or IO layers, or use mutable global state without an explicit `// WHY: global — [justification]`.
- Swallow errors, return fake success, or silently use defaults, degraded results, cached data, partial success, or no-ops without an explicit approved contract.
- Guess an ambiguous business rule; surface a typed/domain error or obtain clarification instead.
- Expose undocumented public units or leak internal library implementation details to consumers.
- Invent new interfaces, altered method signatures, or ad-hoc contract adaptations during implementation that were not approved in the plan (if a contract defect is discovered, stop immediately and report `CONTRACT_DEFECT`).
- Create unexpected files, unapproved helpers, or leave temporary/scratch files in the workspace; all file additions, modifications, and deletions must strictly conform to the approved locked file tree structure with full cleanup.
- Use magic literals for meaningful values, shallow 1–3 line helper extractions, positional tuple returns across boundaries, or untyped dynamic maps for domain concepts.

## Just-in-Time References

| Read when | Reference |
| --- | --- |
| Naming, nesting, guards, function size, exports, or module shape are in scope | [Code structure and naming](references/code-quality-details.md#code-structure-and-naming) |
| A non-obvious decision, fallback, default, error mapping, or file boundary needs documentation | [Traceability and API documentation](references/code-quality-details.md#traceability-and-api-documentation) |
| Deferring work or recording an out-of-scope code smell | [Debt and refactor markers](references/code-quality-details.md#debt-and-refactor-markers) |
| Creating/changing a module or public library boundary | [Module and library boundaries](references/code-quality-details.md#module-and-library-boundaries) |
