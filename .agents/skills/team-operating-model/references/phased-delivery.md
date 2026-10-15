# Proportionate Phased Delivery

This method can be used independently by a solo agent or another skill. Reading
this reference does not activate the Team Operating Model or require a team.
Follow the actual task's authority and runtime restrictions.

## Select the smallest useful delivery shape

- A bounded coherent change can use an inline outcome, scope, acceptance checks,
  and implementation contract. Multiple files alone do not require phase files.
- For several dependent steps, keep an Active Milestone Packet: the current
  outcome, must-ship scope, non-goals, invariants, dependencies, approved choices,
  verification, and unresolved decisions. Detail only the active milestone.
- Add a roadmap for multiple milestones; keep later milestones outcome-level.
- Use separate phase files for independently delegated or resumable units when
  shared state needs them, not as a universal artifact requirement.

## Lifecycle

1. **Frame:** Establish the problem, reader/user outcome, scope and authority.
2. **Discover:** Verify constraints and important unknowns before committing.
3. **Roadmap:** Order independently useful milestones only if needed.
4. **Calibrate:** Separate must-ship, may-defer, and never-defer requirements.
5. **Slice:** Choose the thinnest usable end-to-end outcome; see [Slicing](slicing.md).
6. **Deliver:** Implement, verify against prior criteria, review and correct.
7. **Learn:** Record observed gaps and decide KEEP, ADJUST, ADVANCE, STOP or REDIRECT.

Never defer evidence-backed core outcomes, safety/privacy/security obligations,
data integrity, legal constraints, recovery promises or approved public contracts.
Hypothetical scale, elegance and speculative extension points are not invariants.
Do not prebuild future milestones' infrastructure.

## Formal artifacts are independent choices

| Artifact | Positive reason to use it |
|---|---|
| PRD ([product intent](../../brainstorming/SKILL.md)) | Contested product outcome, scope or stakeholder priorities need durable agreement. |
| TRD ([technical constraints](../../architecture-design/SKILL.md)) | Cross-system technical or operational coordination needs durable contracts. |
| BDD ([behavior and acceptance](../../code-craft/references/testing.md#behavior-and-acceptance)) | Ambiguous, public or safety-relevant behavior benefits from explicit executable examples. |
| ADR | A consequential, hard-to-reverse architecture choice has competing viable options. |

One artifact does not automatically require the others. Use repository-required
formats and requested specifications; do not generate a document cascade.

## Delivery contract

Record proportionately in the existing task context or packet:

```text
Objective and observable outcome:
Must ship / may defer / never defer:
In-scope and out-of-scope boundaries; prerequisites:
Acceptance criteria and required evidence:
Hard invariants and recovery/compatibility obligations:
Approved behavior, affected consumer interfaces and materialization choices:
Current unit, authority owner, stop conditions:
Review/corrective-pass budget and escalation:
```

Concrete signatures/schemas are necessary where consumers or independent
implementers need a fixed interface. Exact file deltas are useful for disjoint
write ownership; an authorized directory boundary may suffice for exploration
or tightly coupled implementation. Do not invent unresolved business semantics.

Track material cross-slice compromises in the packet, not a second registry:
ID, decision, delivery benefit, protected invariant, impact/guardrail, owner and
authority, revisit trigger, target and status. Small local notes stay local.

## Bounded review, not endless polishing

Declare the review budget before a slice: ordinarily one acceptance pass plus
predeclared specialist checks, one corrective pass and one targeted recheck.
A small content-only change ordinarily needs one bounded acceptance check.
When evidence invalidates the plan or the budget is exhausted, explicitly ADJUST
the scope/plan or escalate; do not reset an unchanged loop. These are per-slice
job controls, not an aggregate task lifetime limit. Safety and required evidence
cannot be waived to fit a budget. Green checks mean ready for user acceptance,
not that the user has accepted.
