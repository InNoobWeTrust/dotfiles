---
name: subagent-dispatch
description: "Use this skill before launching any delegated agent, background worker, or parallel task. It routes delegation decisions and requires bounded prompts, action limits, output contracts, and explicit stop behavior. Do not use it to delegate sequential discovery whose intermediate work must remain in the main thread."
---

# Subagent Dispatch

Use this router immediately before a delegated launch. The worker's system prompt is usually fixed, so put the required guardrails in the delegation input.

## Delegation decision gate

| Does intermediate work matter to the main thread? | Action |
|---|---|
| No; only the result matters | Delegate |
| Yes; later steps depend on prior discovery | Keep work in the main thread |

Good targets: bounded factual exploration, independent review, persona/tone work, and clean-room TDD implementation after main-thread tests exist. Do not delegate tightly coupled diagnosis, active user Q&A/discovery, collaborative interface design, or work that requires raw tool output in the main thread, except clean-room TDD loops.

## Four prompt pillars

1. **Precise scope**: exact deliverable, explicit out-of-scope boundary, and surgical context (normally no more than one logical unit or ~500 pasted lines).
2. **Structured output**: the required five-section result and done signal.
3. **Obstacle reporting**: workarounds, environment quirks, and failed dependencies, or `NONE`.
4. **Allowed actions**: explicit READ, WRITE, RUN, forbidden-action, and network boundaries. This is a soft prompt contract; use environment permissions for hard isolation.

Read `references/pillars-and-templates.md` when wording a pillar or selecting a findings template.

## Dispatch routing and gates

| Target | Mandatory gate | Read before launch |
|---|---|---|
| Planning | Select exactly one L0, L1, or L2 depth; L1/L2 also select exactly one target. Plan must lock code interfaces/DTOs, scope boundaries, scoped target file tree, and separate phase files. | `references/planning-payload-and-preflight.md` |
| Implementation | Select exactly one approved functional unit from a referenced separate phase file. A plan is context, never executable scope. Must conform to locked scoped file tree, scope boundaries, and contracts. | `references/implementation-payload-and-preflight.md` |
| Review or exploration | Bound the question, context, actions, and evidence; do not implement adjacent findings. | `references/prompt-template-and-anti-patterns.md` |

For implementation, use exactly one basis: a cited approved plan/Active Milestone Packet (referencing a dedicated phase file) for non-atomic work, or an explicit Atomic patch exception for one coherent, independently verifiable outcome with no unresolved design or contract decision. Implementers must strictly conform to locked interfaces/DTOs (zero invented interfaces), declared scope boundaries (leaving out-of-scope paths untouched), and the locked scoped file tree (zero unapproved files; scratch cleanup verified). Rewrite, overhaul, and delete-and-rebuild units must classify each old semantic/interface as **delete** or **preserve**. If a public API or consumer app is affected, an approved consumer-facing contract/stubs and sign-off are prerequisites.

When `../../rules/phased-delivery.md` applies, implementation, exploration, and review prompts must populate its canonical Delivery Contract. Do not duplicate its lifecycle, compromise, trajectory, or budget policy. Add only delegation-specific scope-expansion handling, adjacent-finding classification, allowed actions, and incomplete-work continuation state.

## Host-side synthesis gate (mandatory before user-facing decision)

Delegated results are internal evidence, not shared context. Before requesting a user decision/approval grounded in delegated work, follow `../../rules/grooming.md` and synthesize the canonical `Material decision brief` in `references/pillars-and-templates.md` (reserved for commitment gates; do not use for active exploratory Q&A). This skill adds only delegated-specific constraints: do not forward worker prose or transcripts verbatim, do not expose chain-of-thought or orchestration mechanics, and do not ask questions whose meaning depends on unseen files/results. If worker evidence cannot support the brief, verify or report the gap; never manufacture certainty. After the user answers, restate the agreed model and remaining uncertainties. Low-risk factual work with no decision requested needs only a proportional summary. Receiving procedure in `references/prompt-template-and-anti-patterns.md` is mandatory.

## Essential stop conditions

Do not launch when a planning depth or target is ambiguous, during active user Q&A or interface co-design, when boundary interfaces/DTOs are described in loose prose rather than locked code contracts, when scope boundaries are omitted, when a full repo tree is dumped or the scoped file tree permits invented files, when implementation is not sharded into referenced separate phase files, when L1/L2 receives the full goal rather than its section slice, or when an implementation target has zero or multiple units. Stop and report `INCOMPLETE` (or `INCOMPLETE: CONTRACT_DEFECT` for unworkable contracts) when acceptance criteria/evidence are missing, a prerequisite is blocked, design or contract decisions remain unresolved, required consumer contracts are missing or unapproved, scope expands, or work would leave the declared writable surface. Never silently rescope or absorb adjacent units.

## Minimal output contract

```markdown
## 1. Objective Recap
## 2. Findings
## 3. Obstacles Encountered (or NONE)
## 4. Confidence & Caveats
## 5. Done Signal
TASK_COMPLETE | INCOMPLETE + continuation/resumption state
```

`TASK_COMPLETE` means the assigned work is complete. `INCOMPLETE` must state completed work, current location, remaining steps, evidence, blockers, and the next safe action (for contract defects: use `INCOMPLETE: CONTRACT_DEFECT` with the flawed signature and proposed fix). Re-delegate only when missing evidence blocks the next decision or the output contract was materially violated.

## References

| Reference | Read when |
|---|---|
| `references/planning-payload-and-preflight.md` | Preparing or validating an L0/L1/L2 planning dispatch. |
| `references/implementation-payload-and-preflight.md` | Preparing or validating an implementation dispatch, including rewrites. |
| `references/prompt-template-and-anti-patterns.md` | Assembling a full prompt, preflighting it, receiving results, or checking delegation anti-patterns. |
| `references/pillars-and-templates.md` | Writing pillar language or choosing domain-specific findings sections. |
