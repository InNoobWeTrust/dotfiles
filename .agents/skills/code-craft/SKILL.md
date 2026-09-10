---
name: code-craft
description: "Use this skill for any non-trivial code write, feature implementation, refactor, or restructuring — it is the default skill for all implementation tasks. Enforces SOLID, KISS, DRY, modularity, and human-readability at the function, class, and module level. Applies when writing new code, adding features, decomposing large functions, extracting modules, cleaning up code, or touching more than one file, even if the user doesn't explicitly ask for \"clean code\" or \"refactoring.\""
---

# Code Craft

Core delivery router for non-trivial implementation. Obey always-on `rules/code-quality.md` and `rules/tdd.md`; they own hard constraints, naming, prohibited patterns, and debt markers. Skip only for typos, formatting, config values, and logic-neutral renames.

## Track selection

Choose the smallest track that preserves acceptance criteria, hard invariants, and safety. When phased delivery applies, use the roadmap or active milestone packet and canonical compromise register in `../../rules/phased-delivery.md`.

| Track | Use when | Required controls |
|---|---|---|
| **Patch** | Bounded defect or logic correction, no new slice | Compact Phase 1; fault contract; tests/quality evidence; targeted Phase 4 audit |
| **MVP Slice** | One independently valuable shippable slice | Scope/non-goal boundary; acceptance criteria; relevant Phase 2 checks; do not prebuild the next slice |
| **Expansion / Refactor** | Multiple slices, public-surface evolution, or structural change | All phases; phased slice ordering; compatibility and migration/rollback where relevant; full SOLID review |
| **Hardening** | Security, data integrity, reliability, recoverability, or high-risk compatibility work | All phases; risk-specific verification; fail-safe/recovery evidence; no unresolved hard-invariant breach |

## Rewrite and consumer hard gate

For rewrite, overhaul, or delete-and-rebuild work, load `rules/grooming.md` first. Before Phase 1, classify every old semantic/interface as **delete** or **preserve**. If a public API or consumer app is affected, define consumer-facing signatures/schema and stubs and obtain informed sign-off per `rules/grooming.md` — show caller-visible examples, define decision-relevant terms, and explain alternatives/consequences — before implementation. Do not infer the contract, preserve old behavior by default, or patch old code when deletion is intended.

## Workflow

1. **Phase 1 — Design Intent:** Before writing, load `references/design-intent-template.md` for non-trivial work or when a full/compact intent is required. When implementing from an approved plan, bind directly to the referenced active phase file, the locked code interfaces & DTO contracts, and the locked scoped file tree structure within declared in-scope boundaries. Implementers have zero degrees of freedom to alter method signatures, change DTO shapes, invent interfaces, breach scope boundaries, or create unapproved files. For a greenfield language/framework choice or substantial platform capability, first load `references/languages/README.md`, then the smallest matching language reference. Repository conventions and explicit constraints win. For micro code patterns (Result, Typestate, Functional Options, Builder, Strategy, Specification, Value Object, Discriminated Union, Constructor DI), local concurrency/resilience (worker pools, task groups, backoff/jitter), stack-specific language blueprints, or model traps, query the code-craft pattern catalog (`./.agents/skills/code-craft/scripts/search.py "<query>" --stack <stack>`) per `references/pattern-catalog.md` to prevent model training bias. For macro system topology (Modular Monolith, Hexagonal, CQRS, Sagas, Outbox), route to `architecture-design`; for storage schemas, indexing, and migrations, route to `db-design`.
2. **Phase 2 — SOLID review:** Before writing, load `references/solid-checklist.md`. Patch and MVP Slice apply relevant boundary checks and explicitly mark N/A; Expansion / Refactor and Hardening complete the full checklist.
3. **Phase 3 — Write:** Follow TDD (RED → GREEN → REFACTOR) and post test evidence. Load `references/write-standards.md`; re-check a selected language reference when Phase 1 selected a new stack/capability. Prefer repo-native `make` or scripts. On drift, long tool chains, confidence loss, or thrash, load `references/trajectory-checkpoint.md` before continuing.
4. **Phase 4 — Readability audit:** Load `references/write-standards.md` and audit as a new engineer. Fix clarity issues or mark `// CLARITY:`; create or update module `README.md` when responsibility or public surface changes. Verify repository cleanliness against the locked scoped file tree (ensuring out-of-scope files remain untouched) and remove all scratch/temporary artifacts.
5. **Phase 5 — Tech-debt inventory:** For phased delivery, record material or cross-slice deferred debt in the canonical compromise register. Otherwise record only small local deferrals in change context. Never prebuild infrastructure, abstractions, flags, or extension points speculatively.

## Hard stops

- Isolation fails: redesign.
- Required consumer contract/stubs or informed interface sign-off is missing or unapproved: obtain informed sign-off per `rules/grooming.md` (caller-visible examples + terms + alternatives/consequences) before implementation.
- Contract defect: if a locked contract from planning is flawed or unworkable, STOP immediately and report `INCOMPLETE: CONTRACT_DEFECT` with proposed adjustment; do not invent ad-hoc interfaces or alter signatures.
- Boundary / file tree violation: creating files not declared in the approved locked scoped file tree, breaching declared scope boundaries, or leaving uncleaned scratch files; stop and align strictly with the locked boundary and file tree.
- Edge-case semantics are unspecified: clarify; AFK fails closed and invents no fallback.
- Vendoring or reimplementing an adequately supplied capability lacks explicit opt-in or repository policy: use the platform/established dependency or clarify.
- Applicable SOLID, safety, or correctness check fails: fix; only material cross-slice phased debt may enter the canonical register. Local debt never substitutes for a required safety or correctness fix.

## Deliverable

- [ ] Track controls, Phase 1 intent, and applicable Phase 2 review are complete.
- [ ] Active phase file referenced, locked code interfaces/DTOs implemented with zero invented contracts.
- [ ] Locked in-scope file tree structure conformed to, out-of-scope boundaries respected, zero unapproved files created, and all scratch artifacts cleaned up.
- [ ] TDD/write standards are applied, tests are written first, and evidence is posted.
- [ ] No invented semantic fallback; rewrite transitions and required consumer contracts/stubs have informed sign-off.
- [ ] Readability audit and required module README maintenance are complete.
- [ ] Drift checkpoint and debt-recording rules are followed; no speculative prebuild.

## References

| When to read | Reference |
|---|---|
| Phase 1 detail; full/compact Design Intent; technology, vendoring, consumer, rewrite, and stop-gate requirements | `references/design-intent-template.md` |
| Phase 1 micro code pattern grounding, stack blueprints, resilience, model traps | `references/pattern-catalog.md` |
| Phase 2 design-quality checks and deferral handling | `references/solid-checklist.md` |
| Phase 3 writing or Phase 4 readability/module-README details | `references/write-standards.md` |
| Greenfield stack or substantial platform capability | `references/languages/README.md` and the smallest matching language reference |
| Long tool chain, confidence drop, re-reading, or thrash in Phase 3/4 | `references/trajectory-checkpoint.md` |
| Tempted by a design shortcut | `references/anti-patterns.md` |
| Phased delivery or material cross-slice debt | `../../rules/phased-delivery.md` |
