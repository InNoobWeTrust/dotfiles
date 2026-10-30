# Multi-Level Planning Orchestration

Use when design must precede non-trivial implementation and the work spans more than one
decision level (outcome → boundaries → structure → slices). The primary **orchestrates**;
it does not author or approve consequential levels itself. Usable without a formal
specification or team workflow; use the available dispatch capability for each launch.

## Level ladder

| Level | Settles | Typical artifact | Owner of approval |
|---|---|---|---|
| L0 Outcome + stack | Problem, success criteria, non-goals, tools/libraries, custom exceptions | Inline brief + stack proposal | **Human** (stack is always human-reserved) |
| L1 Architecture | Bounded contexts, components, dependency direction, consumer contracts | Boundary sketch / diagram / ADR if consequential | Eligible decision route or user |
| L2 Structure | File homes, responsibilities, public surface, allowed edges, exemplar followed | Structure plan | Eligible decision route or user |
| L3 Slice plan | Ordered, independently verifiable steps, ownership, acceptance, stops | Slice/phase checklist | Primary, after independent review |
| L4 Implementation | Code inside approved L2/L3 | Change + gate output | Verified against L1–L3 |

Collapse levels only when the task is genuinely small and a lower level adds no decision
(e.g. a single-owner edit needs only L0 + a one-line L2 rationale). State the collapse and why;
never collapse silently because a level is tedious.

## Per-level loop (repeat top-down)

1. **Author** – dispatch a separate worker with the original request, the approved parent levels,
   relevant source, allowed actions and the level's required output. The primary may supply verified
   facts and constraints, not a preselected design.
2. **Review** – dispatch a *different* worker (never the author) with the original sources, the approved
   parent levels and the level artifact — not the primary's summary. It checks fit to intent, parent-level
   conformance, consumer impact, one disconfirming case, and returns PASS / FAIL / UNVERIFIED with evidence.
3. **Reconcile** – primary integrates findings; on FAIL return to the author (bounded rounds, then escalate
   to the user). Consequential choices then need the applicable decision authority.
4. **Record** – append a receipt to a plan ledger (level, artifact revision, author, reviewer, verdict,
   open unknowns). Descend only after the level is approved.

Independent levels or sibling components may be authored in parallel when write ownership is disjoint;
their reviews must complete before any dependent lower level starts.

## Rules

- **No skipping down:** do not write interfaces, structure plans, slices or code before the level above is
  approved. L1–L2 need approved L0 stack.
- **Back-propagation:** a lower level that contradicts a parent stops only the affected unit and returns the
  defect to the owning level; do not patch around it.
- **Implementation conformance:** workers materialize L2/L3 as approved and stop if code does not fit; a final
  reviewer checks the result against L1–L3, not just tests.
- **Absence behavior:** if delegation, an eligible author, or an independent reviewer is unavailable for a
  consequential level, mark that level `INCOMPLETE` and report it. Do not self-author, self-review or simulate.
- **Proportion:** review depth scales with consequence; mechanical steps with an explicit settled source need
  no author/review round.
- **Worker boundary:** workers return handoffs to the primary and do not dispatch further workers.

## Ledger sketch

```
L0 stack      approved by user (source)      PASS
L1 boundaries author=A1 reviewer=R1 rev=2   PASS
L2 structure  author=A2 reviewer=R2 rev=1   FAIL → rev 2 pending
L3 slices     —                              blocked on L2
```
