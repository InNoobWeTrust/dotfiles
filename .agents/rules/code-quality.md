---
description: "Applies before code implementation planning and to every file written or modified. Requires library/tool reuse, core code quality principles, interface-first specifications, locked plan fidelity, and prohibited anti-patterns."
globs: "*"
alwaysApply: true
trigger: always_on
---

# Code Quality Baseline

Applies before code implementation planning and to every file written or modified. Use this rule for the core design gates and hard stops; load a reference only when its trigger applies.

Approval owner and mode come from [Delivery Ownership](delivery-ownership.md). The autonomous primary may define/reapprove researched contracts inside its authority before implementation; workers still stop on contract defects. Explicit human-only safety, compatibility, and Git gates remain human-owned.

## Reuse Before Implementation (All Code Trajectories)

This gate applies to scientific/EDA implementation and Fast-Path, including small helpers. Exemptions from production-design ceremony do not waive reuse.

Before implementation planning or coding:

1. **Discover per capability, not just per project:** check repository code/dependencies, standard/platform tools, and maintained domain libraries for each new or changed common capability. Inspect the relevant API/command for the available version against the required inputs, outputs, and deployment constraints; do not guess suitability from the package name.
2. **Reuse the suitable capability:** prefer direct calls, with only necessary project-specific policy/adaptation. Do not recreate a supplied parser, transformation, or operational tool just because a handwritten implementation is short.
3. **Justify custom code before writing it:** state the specific unmet requirement and evidence that the established option cannot satisfy it. Missing API research is not an evidenced gap. Vendoring or deliberately reimplementing an adequately supplied capability requires explicit user opt-in or repository policy.
4. **Keep a small, traceable decision:** identify the selected API/command and source, or evidenced gap/authorized exception, in existing task context. No extra plan file, test suite, or wrapper is required. If suitability remains unknown, research or report the gap and stop affected implementation planning/coding rather than coding first.

Do not force mismatched APIs or needless conversions solely to claim library use. Straightforward glue and project-specific research logic remain appropriate where established capabilities do not fit the actual contract.

## Pre-Implementation Principles

> **Proportionality Note:** The formal interface/type-design gates below govern production codebases, multi-component systems, and public interfaces. For Trajectory 3 (Fast-Path utility scripts, shell tools, dotfiles configurations, or self-contained scripts <100 lines), idiomatic native constructs (such as Python dicts/tuples or straightforward linear functions) are completely acceptable. Do not invent unnecessary classes, DTOs, or abstract layers for simple scripts.

**Readability-first (all trajectories):** Within correctness, security, and required performance constraints, optimize for human understanding and a small review surface—not cleverness or minimum line count. Keep straightforward code straightforward; add helpers, classes, layers, or flow frameworks only when they reduce what a reader must understand.

Before adding or changing a function, class, or module, confirm all of the following. If any answer is unknown, stop and clarify or redesign.

1. **Single responsibility:** the unit has one job; an "and" in its responsibility signals a split.
2. **Minimal interface:** expose only the smallest surface callers require.
3. **Dependency direction:** depend toward abstractions, not concrete details.
4. **Human traceability:** names and structure expose entry points, consequential decisions, dependencies, state ownership, and effects without reading every body.
5. **Deep modules:** hide meaningful complexity behind a simple, cohesive interface; do not create shallow indirection.
6. **Interface-first specification:** define and agree type signatures, enums, or abstract contracts before implementation logic.
7. **Explicit DTOs:** use named, typed DTOs or equivalent domain types at boundaries, not positional tuples or untyped dynamic maps.
8. **Ambiguity stop:** when caller-visible edge or failure behavior has multiple reasonable meanings, resolve and approve the contract before coding. The primary researches delegated choices; involve the user only when outcome or authority requires them.
9. **Technology fit:** satisfy [Reuse Before Implementation](#reuse-before-implementation-all-code-trajectories).

## Consumer-Facing Contract Gate

Before implementing a changed public API or consumer application behavior, define the consumer-visible signature or schema and stubs, then obtain sign-off. Internal abstractions are not substitutes for the consumer contract. Do not leak helpers, composition objects, or intermediate/internal DTOs across a library boundary.

## Semantic Rewrite Gate

Before a rewrite, overhaul, or delete-and-rebuild task, identify each old semantic or interface as **preserve** or **delete**. If deletion is intended, remove and recreate the boundary; do not patch new behavior over code intended for deletion. Stop when the preservation decision is unclear.

## Backward Compatibility & Deprecation Gate (Ask Before Action)

Never unilaterally auto-decide to preserve backward compatibility, generate forwarding shims, keep legacy scripts, or retain deprecated aliases without explicit user instruction.
- **Context sensitivity:** Different repositories and workflows have fundamentally different needs: established enterprise codebases may require careful compatibility bridges, whereas personal dotfiles, utilities, and daily fast-path coding favor clean removal over legacy baggage.
- **Compatibility decision before action:** Follow `delivery-ownership.md`: honor explicit replacement intent, document preserve/delete decisions, and obtain user authorization for breaking existing public promises or consequential unknown compatibility requirements. Delegated unpublished implementation choices do not require a new human approval. Never silently default to compatibility bridges.

## Pragmatism Over Pedantry (Anti-Perfectionism Circuit Breaker)

Do not burn reasoning tokens, turns, or iterations endlessly polishing "engineering artistry" or debating micro-refactoring on working code.
- If a script or utility achieves the user's operational goal, runs without error, and passes the applicable contract, safety, and reuse checks, it is **DONE**.
- Never refactor working, self-contained code into multi-class or multi-file hierarchies solely to satisfy abstract purism.
- Minor stylistic linter suggestions or cosmetic metrics that do not affect correctness, security, or maintainability must never block task completion.

## Hard Prohibited Behaviors

Do not:

- Give a function, class, or module unrelated responsibilities, or hide divergent workflows behind mode flags instead of clear branches or meaningful composition.
- Copy logic more than twice, mix business logic with framework or IO layers, or use mutable global state without an explicit `// WHY: global — [justification]`.
- Swallow errors, return fake success, or silently use defaults, degraded results, cached data, partial success, or no-ops without an explicit approved contract.
- Guess an ambiguous business goal or implement an unresolved contract; research and obtain approval from the authorized owner first.
- Expose undocumented public units or leak internal library implementation details to consumers.
- Invent new interfaces, altered method signatures, or ad-hoc contract adaptations during implementation that were not approved in the plan (if a contract defect is discovered, stop immediately and report `CONTRACT_DEFECT`).
- Create unexpected files, unapproved helpers, breach declared in-scope/out-of-scope boundaries, or leave temporary/scratch files in the workspace; all file additions, modifications, and deletions must strictly conform to the approved locked scoped file tree within the in-scope boundary, with complete cleanup.
- Silently change a compatibility promise, create unrequested forwarding shims/aliases, or retain deprecated legacy files without an explicit authorized decision.
- Use magic literals for meaningful values, shallow 1–3 line helper extractions, positional tuple returns across boundaries, or untyped dynamic maps for domain concepts (in production libraries).


## Just-in-Time References

| Read when | Reference |
| --- | --- |
| Naming, nesting, guards, function size, exports, or module shape are in scope | [Code structure and naming](references/code-quality-details.md#code-structure-and-naming) |
| A non-obvious decision, fallback, default, error mapping, or file boundary needs documentation | [Traceability and API documentation](references/code-quality-details.md#traceability-and-api-documentation) |
| Deferring work or recording an out-of-scope code smell | [Debt and refactor markers](references/code-quality-details.md#debt-and-refactor-markers) |
| Creating/changing a module or public library boundary | [Module and library boundaries](references/code-quality-details.md#module-and-library-boundaries) |
