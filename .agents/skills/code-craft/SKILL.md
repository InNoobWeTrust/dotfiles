---
name: code-craft
description: "Use this skill for non-trivial implementation, refactoring and behavior/acceptance specifications, including BDD examples without implementation. Default implementation skill: SOLID, KISS, DRY, modularity and human-readability. Applies to new features, code restructuring and multi-file changes."
---

# Code Craft

Core delivery router for non-trivial implementation. Use [Code quality guidance](references/code-quality-guidance.md) and [Testing](references/testing.md) for readable implementation, verification and test persistence. Skip delivery phases for typos, formatting, config values and logic-neutral renames.

The autonomous primary researches and approves in-scope contracts or revisions before implementation resumes; workers cannot invent them. Human-reserved approvals remain human-owned, and AFK is never assumed approval.

Before implementation, read [Implementation principles](references/working-principles.md#implementation). For test authoring or execution-only assignments, read [Verification principles](references/working-principles.md#verification); that reference alone does not activate production delivery phases.

## Track selection

For behavior specifications or acceptance criteria **without implementation**, use
[Behavior and acceptance](references/testing.md#behavior-and-acceptance) directly.
Define observable outcomes and examples; skip implementation phases. A specification
request does not authorize code changes or test execution.

Choose the smallest track that preserves acceptance criteria, hard invariants, and safety. For phased work use [Phased delivery](../team-operating-model/references/phased-delivery.md), independently usable without activating a team.

| Track | Use when | Required controls |
|---|---|---|
| **Patch** | Bounded defect or logic correction, no new slice | Compact Phase 1; fault contract; tests/quality evidence; targeted Phase 4 audit |
| **MVP Slice** | One independently valuable shippable slice | Scope/non-goal boundary; acceptance criteria; relevant Phase 2 checks; do not prebuild the next slice |
| **Expansion / Refactor** | Multiple slices, public-surface evolution, or structural change | All phases; phased slice ordering; compatibility and migration/rollback where relevant; full SOLID review |
| **Hardening** | Security, data integrity, reliability, recoverability, or high-risk compatibility work | All phases; risk-specific verification; fail-safe/recovery evidence; no unresolved hard-invariant breach |

## Rewrite and consumer hard gate

For rewrite, overhaul, or delete-and-rebuild work, use [Planning and shared understanding](../working-principles/references/planning.md). Classify affected old semantics/interfaces as **delete** or **preserve**. Settle affected consumer-facing contracts with the authorized owner before implementation; explain caller-visible examples and consequences. Do not preserve old behavior by reflex or patch code whose deletion was approved.

## Workflow

For creating or changing capabilities, runtime/trust boundaries, dependencies, registration or state ownership, and relocating source modules, apply [Structural integrity](../architecture-design/references/structural-integrity.md): Phase 1 settles source homes and graph delta before generation, Phase 2 checks direction/cycles, Phase 4 verifies the materialized boundaries. Unchanged boundaries need only a brief existing-owner rationale and local flow check; no whole-repo audit.

1. **Phase 1 — Design Intent:** Load `references/design-intent-template.md` and record proportionate intent. Follow approved scope and consumer contracts; use concrete signatures or exact file deltas where consumers or disjoint worker ownership need them. Inline intent is sufficient for a coherent patch; separate phase files are for useful handoff/resumption boundaries. Contract changes return to the authorized owner. For a greenfield stack or substantial platform capability, load `references/languages/README.md` and the smallest matching reference. Repository conventions win. For non-trivial effects or orchestration, load `references/inspectable-code.md`. Query micro patterns, stack blueprints or resilience guidance per `references/pattern-catalog.md` where useful. For system topology use `architecture-design`; for schemas/indexing/migrations use `db-design`.
2. **Phase 2 — SOLID review:** Before writing, load `references/solid-checklist.md`. Patch and MVP Slice apply relevant boundary checks and explicitly mark N/A; Expansion / Refactor and Hardening complete the full checklist.
3. **Phase 3 — Write:** Select proportionate verification and test persistence under [Testing](references/testing.md); use RED → GREEN → REFACTOR where warranted and post observed evidence. Load `references/write-standards.md`; re-check a selected language reference when Phase 1 selected a new stack/capability. Prefer repo-native `make` or scripts. On drift, long tool chains, confidence loss, or thrash, load `references/trajectory-checkpoint.md` before continuing.
4. **Phase 4 — Readability audit:** Load `references/write-standards.md` and audit as a new engineer. Fix structural clarity issues; comments explain rationale, not hidden flow. Include proportionate source-linked flow evidence for non-trivial behavior changes; update consumer/maintainer documentation where changed behavior requires it. Check scope and cleanup; leave unrelated work untouched.
5. **Phase 5 — Tech-debt inventory:** For phased delivery, record material or cross-slice deferred debt in the canonical compromise register. Otherwise record only small local deferrals in change context. Never prebuild infrastructure, abstractions, flags, or extension points speculatively.

## Hard stops

- Isolation fails: redesign.
- Required consumer contract or approval is missing: clarify with the authorized owner using caller-visible examples and consequences before affected implementation.
- Contract defect: if a locked contract from planning is flawed or unworkable, STOP immediately and report `INCOMPLETE: CONTRACT_DEFECT` with proposed adjustment; do not invent ad-hoc interfaces or alter signatures.
- Scope violation: breaching the approved writable boundary, altering a locked consumer contract, or leaving scratch artifacts. Revise through the authorized owner before affected work continues.
- Edge-case semantics are unspecified: clarify; AFK fails closed and invents no fallback.
- Vendoring or reimplementing an adequately supplied capability lacks explicit opt-in or repository policy: use the platform/established dependency or clarify.
- Applicable SOLID, safety, or correctness check fails: fix; only material cross-slice phased debt may enter the canonical register. Local debt never substitutes for a required safety or correctness fix.

## Deliverable

- [ ] Track controls, Phase 1 intent, and applicable Phase 2 review are complete.
- [ ] Approved behavior and required consumer contracts preserved; phase/handoff references included where applicable.
- [ ] Writable scope respected, unrelated work untouched, and scratch artifacts cleaned up.
- [ ] Verification/write standards are applied, TDD is used where warranted, test persistence is authorized, and observed evidence is posted.
- [ ] No invented semantic fallback; rewrite transitions and required consumer contracts/stubs have informed sign-off.
- [ ] Readability audit and necessary consumer/maintainer documentation are complete.
- [ ] Drift checkpoint and debt-recording rules are followed; no speculative prebuild.

## References

| When to read | Reference |
|---|---|
| Phase 1 detail; full/compact Design Intent; technology, vendoring, consumer, rewrite, and stop-gate requirements | `references/design-intent-template.md` |
| Phase 1 micro code pattern grounding, stack blueprints, resilience, model traps | `references/pattern-catalog.md` |
| Phase 2 design-quality checks and deferral handling | `references/solid-checklist.md` |
| Non-trivial orchestration, branching, stateful/effectful behavior, or requests for readable, auditable, flow-oriented code | `references/inspectable-code.md` during design and the readability audit; no extra artifacts for small linear patches |
| Phase 3 writing or Phase 4 readability/module-README details | `references/write-standards.md` |
| Greenfield stack or substantial platform capability | `references/languages/README.md` and the smallest matching language reference |
| Choosing analytical/scientific pipeline tools, or user wants inspectable DAGs / auditable data flow | `../architecture-design/references/dataflow-stack-selection.md` before choosing a framework; repository conventions win |
| Long tool chain, confidence drop, re-reading, or thrash in Phase 3/4 | `references/trajectory-checkpoint.md` |
| Locking, mutual exclusion, atomic file updates, Git lockfile pattern (`lockfile.h`), decision tree | `references/lock-patterns.md` |
| Tempted by a design shortcut | `references/anti-patterns.md` |
| Phased delivery or material cross-slice debt | `../team-operating-model/references/phased-delivery.md` |
