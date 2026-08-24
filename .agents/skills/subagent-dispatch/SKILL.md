---
name: subagent-dispatch
description: "Use this skill before launching any delegated agent, background worker, or parallel task. Constructs a structured delegation prompt with scope constraints, output contracts, obstacle reporting, and action boundaries - compensating for generic worker descriptions. Activate whenever you're about to delegate, run something in parallel, or hand off work to a subagent."
---

# Subagent Dispatch

**When:** immediately before launching any delegated agent / background worker.  
**Constraint:** you usually cannot edit the worker’s system prompt — put intelligence in the **delegation input**.

---

## Decision gate

> Does intermediate work matter to the main thread?

| Answer | Action |
|---|---|
| No — need result, not journey | **Delegate** |
| Yes — each step depends on prior discovery | **Keep in main thread** |

**Delegate:** exploration that would clutter context; independent review; persona/tone tasks; clean-room TDD implementation after tests written in main.  
**Do not delegate:** tightly coupled multi-step diagnosis; cases where you need full raw tool output in main (except clean-room TDD loops).

---

## Four pillars (all inside the prompt)

1. **Precise scope** — exact deliverable + explicit out-of-scope; ≤ ~500 lines pasted context.
2. **Structured output** — numbered sections + `TASK_COMPLETE` done signal.
3. **Obstacle reporting** — force listing of workarounds / env quirks (or NONE).
4. **Allowed actions** — READ / EDIT / RUN / FORBIDDEN lists (soft contract; pair with environment-level permissions when available).

### Delivery Contract (when the canonical trigger applies)

When the `../../rules/phased-delivery.md` trigger applies, delegated
implementation, exploration, and review prompts must include and populate the
canonical `Delivery Contract` from that rule. Do not copy its policy here. Add
only these delegation-specific instructions:

- scope-expansion handling: STOP and report; do not absorb without approval;
- adjacent findings: report them with their contract classification, but do not
  implement them; and
- allowed actions; and
- continuation/resumption state: completed work, current location, remaining
  steps, evidence, blockers, and the next safe action if incomplete.

Incomplete results must distinguish a true Never Defer blocker from Must Ship
work remaining, May Defer items, and Out of Scope items. For non-phased work,
do not add a Delivery Contract solely because work is delegated.

Do not duplicate the shared lifecycle, compromise schema, or trajectory table
in the prompt. State only the populated contract and delegation behavior. A
worker must stop and report an unapproved scope expansion rather than absorb it.

Full pillar text, domain findings templates, and allowed-action examples:  
`references/pillars-and-templates.md`

Copy-paste full prompt skeleton + anti-patterns + receive protocol:  
`references/prompt-template-and-anti-patterns.md`

---

## Planning dispatch gate

Before delegating a planning call, the orchestrator
selects **exactly one depth level** and, for L1/L2, **exactly one target
section**. Plans are built iteratively — never request a full detailed plan in
one dispatch.

**Depth levels** (exactly one per call):

| Level | Scope | Produces |
|---|---|---|
| L0 — Strategic Outline | Full goal; first pass | Numbered sections with 1–3 sentence goal statements; no functional units |
| L1 — Section Decomposition | ONE named L0 section | Sub-headings flagged `[ATOMIC]` or `[NEEDS L2]` |
| L2 — Atomic Unit Specification | ONE `[NEEDS L2]` sub-heading | Dispatchable functional units with acceptance criteria |

**Minimum planning payload** — all applicable fields must be set before launch:

1. Depth level (L0, L1, or L2);
2. Plan file path (where to read/write the evolving plan);
3. Target section or sub-heading name (L1/L2 only);
4. Goal context — the full goal for L0; only the targeted section's context and
   cross-cutting constraints for L1/L2;
5. Out-of-scope list (what this pass must NOT expand into);
6. Stop conditions (do not skip levels; do not produce detail beyond the
   declared level).

**Stop before dispatch** when: no level is declared, multiple sections are
targeted in one call, or the full goal context is sent for an L1/L2 pass
(send only the section's slice). The orchestrator reviews each pass's output
and selects the next section to drill down before dispatching again.

---

## Implementation dispatch gate (code implementer targets)

Before delegating an implementation call (code implementer), require the main
orchestrator to select **exactly one approved functional unit**. The whole
plan may be included as context only; it is never executable scope.

**Accepted bases** (exactly one):

| Basis | When |
|---|---|
| Approved plan / Active Milestone Packet | Non-atomic work: multi-step or phased delivery; cite the specific plan basis |
| Explicit `Atomic patch exception` | One coherent, independently verifiable outcome where no design/contract decision remains open; no plan file required |

**Minimum unit payload** — all fields must be bounded before launch:

1. Plan basis citation, or atomic-exception rationale;
2. Unit ID and one-sentence outcome;
3. Exact writable surface (files and, where applicable, fields/symbols);
4. Contracts and hard invariants to preserve;
5. Prerequisites that are already satisfied;
6. Explicit out-of-scope list;
7. Acceptance criteria and required evidence;
8. Stop conditions.

**Stop before dispatch** when any of these holds: zero or multiple units,
missing acceptance criteria/evidence, an unresolved design or contract
decision, or a request for scope expansion. Report the refusal through the
existing output contract as `INCOMPLETE` + continuation state rather than
silently rescoping. Lifecycle stages, compromise schema, trajectory decisions,
and budget policy remain owned by `../../rules/phased-delivery.md`; do not
restate them in the delegation prompt.

---

## Minimal output contract (always include)

```
## 1. Objective Recap
## 2. Findings
## 3. Obstacles Encountered  (or NONE)
## 4. Confidence & Caveats
## 5. Done Signal
TASK_COMPLETE | INCOMPLETE + continuation/resumption state
```

`TASK_COMPLETE` means the assigned work is complete. If work is incomplete, use `INCOMPLETE` in the done-signal section and provide the continuation/resumption state. Do not force a retry merely to obtain `TASK_COMPLETE` when the evidence already returned is sufficient for the main thread to make the next decision.

---

## Preflight (before launch)

- [ ] Decision gate says delegate
- [ ] **Planning target**: exactly one depth level declared (L0/L1/L2); plan file path set; target section named (L1/L2); context scoped to level
- [ ] **Implementation target**: exactly one functional unit selected; the plan is context only, not executable scope
- [ ] Dispatch basis declared (approved plan / Active Milestone Packet, or explicit `Atomic patch exception`)
- [ ] Payload complete: planning payload (level, path, target, context, out-of-scope, stop conditions) or unit payload (surface, contracts/invariants, satisfied prerequisites, out-of-scope list, acceptance criteria/evidence, stop conditions)
- [ ] No stop-before-dispatch condition applies (zero/multiple units or sections, missing evidence, unresolved design/contract, scope expansion, full goal sent for L1/L2)
- [ ] Scope + out-of-scope written
- [ ] When the phased-delivery trigger applies, the canonical Delivery Contract is included for implementation, exploration, or review
- [ ] Decision authority and scope-expansion handling declared
- [ ] Continuation/resumption state requested when incomplete work is possible
- [ ] Output contract included
- [ ] Allowed / forbidden actions declared
- [ ] Stop conditions stated
- [ ] Context budget reasonable

After return: scan for `TASK_COMPLETE` or `INCOMPLETE`, read obstacles and continuation state, and treat missing sections as incomplete. Re-delegate only when missing evidence prevents a decision or the declared output contract was materially violated.
