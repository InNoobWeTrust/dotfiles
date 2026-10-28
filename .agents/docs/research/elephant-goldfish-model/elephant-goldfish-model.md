---
audience: Maintainers familiar with this cross-harness agent setup, skills and subagents
purpose: Identify useful EGM experiments before changing agent behavior
scope: Source analysis and provisional recommendations; no installation or workflow adoption
---

# Elephant–Goldfish: test the handoff, not another review layer

| Summary | Finding |
|---|---|
| **Recommendation** | Borrow measurable cold-reader checks, not the whole plugin |
| **Existing coverage** | Independence, handoffs, readiness and calibration have local owners |
| **Status** | Research only, 2026-10-28; no local EGM workflow or isolation probes run |

The useful question is **whether another worker can recover intended behavior without the author's chat history**. Fresh sessions can still receive biased briefings or stale references.

## What the sources actually establish

The [launch post](https://opensource.googleblog.com/2026/10/introducing-elephant-goldfish-model-plugin.html) describes a long-context **Elephant** that develops the design and fresh **Goldfish** that review it. Goldfish can read the document and referenced sources; they are conversation-blind, not source-blind.

```text
Author + discussion → design + authoritative references → fresh reviewer
                         (not the author's chat history)
```

The repository has evolved beyond the post's three conceptual steps. This analysis pins revision [`b3a35956`](https://github.com/google/elephant-goldfish-model/tree/b3a35956759bf7f024af2ff061b2e0b44b438e4c).

| Evidence | Learning and limit |
|---|---|
| [Review workflow](https://github.com/google/elephant-goldfish-model/blob/b3a35956759bf7f024af2ff061b2e0b44b438e4c/skills/egm_review/SKILL.md) | Five stages: initial zoom-out, comprehension, design critique, intermediate zoom-out, implementation readiness. Selectable workflows, not a universal requirement. |
| [Comprehension persona](https://github.com/google/elephant-goldfish-model/blob/b3a35956759bf7f024af2ff061b2e0b44b438e4c/agents/comprehension.md) | Look for undefined concepts, assumed prerequisites and vague mechanisms before attempting implementation. |
| [Claude integration](https://github.com/google/elephant-goldfish-model/blob/b3a35956759bf7f024af2ff061b2e0b44b438e4c/docs/claude.md) | Reviewer adapters use `omitClaudeMd` and restricted read tools. These controls are host-specific, not guarantees conferred by persona text or filesystem isolation. |
| [Testing record](https://github.com/google/elephant-goldfish-model/blob/b3a35956759bf7f024af2ff061b2e0b44b438e4c/TESTING.md) | Records native fixtures for Antigravity, Claude Code and Codex, plus cloud verification gaps. Fixture execution does not demonstrate better engineering outcomes; OpenCode is not in the tested-harness table. |

The blog's adoption claim is not a controlled effectiveness result. Neither source establishes fewer defects or lower costs for this setup.

## What our setup already covers

These are **written requirements**, not proof that every harness enforces them correctly.

| Existing owner | Already present | Useful incremental question |
|---|---|---|
| [Direction gate](../../../AGENTS.md) and [dispatch contract](../../../skills/subagent-dispatch/references/worker-contract.md) | Separate original-source validation, bounded assignments and no self-ratification | Does the actual reviewer receive only the intended context and tools? |
| [Core review](../../../skills/reviewer/references/core-review.md) and [calibration](../../../skills/reviewer/references/calibration.md) | Sources before author narrative; blinded inputs and separate grading | Can we observe these properties and measure comprehension, rather than add another rule? |
| [Code craft](../../../skills/code-craft/SKILL.md) | Settled contracts and verification | Can a cold reader reconstruct the contract? |
| [Memory](../../../skills/memory-techniques/SKILL.md) and [coordination](../../../skills/team-operating-model/references/persistent-coordination.md) | Scoped context and role/task/plan restoration | Can restoration avoid importing the author's verdict? |
| [Intent assurance](../../../skills/team-operating-model/references/intent-assurance.md) | Known-bad/clean calibration, false positives and effort | What is the smallest observable exercise? |
| [Foundation drift checks](../../../skills/project-foundation/references/drift-checks.md) | Content-versus-reality and wiring checks | Would approved behavior-contract checks add value beyond foundation maintenance? |

## Brainstorm → prioritized experiments

These are optional future experiments, **not new gates**. Preserve all existing mandatory controls and the small-task fast path.

| Order | Experiment | Observable test and reason to stop |
|---|---|---|
| **1 — Verify the boundary** | Test existing isolation per harness. Supply target, original requirements, authoritative references and constraints; withhold author deliberation and verdict. | Use a synthetic parent-only marker, inspect native launch/read evidence and tools, and test unavailable required sources. Marker absence alone is not proof; missing traces leave isolation unverified. |
| **2 — Explain back the contract** | Before critique, reconstruct outcome, inputs/outputs, errors, side effects and unresolved consequential choices from an implementation-ready artifact and sources. | Compare with original requirements and seeded missing defaults/errors in disposable fixtures. Drop it if it merely paraphrases, misses seeded gaps or adds noise without useful questions. |
| **3 — Check approved-contract drift** | Compare selected approved claims with code and tests. Classify approved evolution, accidental divergence or insufficient evidence. | Include an approved change and a genuine mismatch. Reject a method that calls both defects, flags all undocumented internals, or silently repairs anything. |

**Context hygiene is not amnesia:** retain safety rules, requirements and source access. Mandatory role/task/plan restoration still applies; use neutral review records, not a governance bypass or unrelated memory.

**Explainback is not exhaustive specification:** independence and calibration already have owners. This tests handoff fidelity, not reviewer count; intentional governance discretion and local mechanics are not missing architectural decisions.

**Drift checks should be scoped:** EGM's [drift skill](https://github.com/google/elephant-goldfish-model/blob/b3a35956759bf7f024af2ff061b2e0b44b438e4c/skills/egm_drift_report/SKILL.md) surveys designs and READMEs broadly. Test approved claims and affected sources, not exhaustive documentation or a new service.

## Ideas to combine, defer or reject

- **Combine with existing owners:** test the comprehension technique within current review/handoff capabilities if later authorized; do not create seven parallel skills or a second memory system.
- **Defer rationale capsules:** scoped memory of chosen/rejected alternatives overlaps existing practice and must not bias the first review pass.
- **Reject universal ceremony:** no plugin installation, mandatory five stages or copied tone boilerplate. EGM itself exempts small, clear bug fixes.
- **Reject automatic acceptance:** one review pause/resume branch advances after its re-audit cap, labeling residual findings accepted trade-offs. Locally, budget exhaustion cannot waive blockers, create acceptance or authorize implementation.

## Smallest useful evaluation, if approved later

Compare current review with the added cold-reader check on matched disposable fixtures, including clean cases and seeded defects. Keep tasks, sources and model settings comparable; score independently against original requirements.

Record useful gaps, misses, false positives, context leakage, tokens/latency and owner effort. A small pilot shows feasibility only: preserve null results/confounders, agree tolerable overhead, and require accepted use plus independent review before promotion.

[Back to research index](../INDEX.md)
