# Planning Dispatch Payload and Preflight

Read this reference before dispatching planning work. The orchestrator selects the depth and next target; the planner does not decide what to drill into next. The plan file is shared state across calls.

## Depth levels

Choose a depth suited to the uncertainty. Use these levels for large plans; a bounded plan can go directly to one actionable unit without ceremonial intermediate levels.

| Level | Scope | Output |
|---|---|---|
| L0 — Strategic Outline | Full goal, first pass | Numbered sections with one-to-three-sentence goal statements; no functional units. |
| L1 — Section Decomposition | One named L0 section | Subheadings marked `[ATOMIC]` or `[NEEDS L2]`. |
| L2 — Atomic Unit Specification | One selected subheading | Dispatchable units with scope, settled affected consumer contracts, acceptance evidence, dependencies and cleanup. Exact file deltas/signatures and separate phase files are conditional on ownership, consumer or resumption needs. |

## Required payload

Set every applicable field before launch:

1. **Depth level:** L0, L1, or L2.
2. **Plan location:** existing shared plan or inline contract; use a file for persistent handoff/resumption.
3. **Target:** the named section or subheading for L1/L2 only.
4. **Goal context:** the full goal for L0; only the target slice and cross-cutting constraints for L1/L2.
5. **Out of scope:** what this pass must not expand into.
6. **Stop conditions:** do not expand beyond the selected target, depth or authority.
7. **Materialization constraints:** existing stack/dependencies, explicit user requirements, and relevant code-craft language/pattern guidance. L0/L1 retain settled choices and identify unresolved capability choices without prematurely specifying units. Any dispatchable `[ATOMIC]` or L2 unit must include primary-approved [materialization choices](implementation-payload-and-preflight.md#materialization-choices--part-of-the-implementation-contract) in its plan/phase file: selected libraries/APIs, compatibility, rationale/sources, dependency surface, exceptions, and reuse evidence. Planners may research/propose selections; implementation waits for primary approval. Do not defer provider selection to an implementer's learned patterns.

## Stop-before-dispatch conditions

Do not dispatch with an ambiguous target/depth, omitted writable boundary, unresolved affected consumer contracts or missing acceptance evidence. Give focused context, not a full repository dump. Review results before expanding detail. Lack of phase files or code DTOs is not itself a blocker when an inline contract states the required behavior and scope adequately.

## Preflight

- [ ] The decision gate permits delegation.
- [ ] Desired depth and one coherent target are explicit.
- [ ] The shared plan location or inline contract is explicit.
- [ ] L1/L2 names exactly one target.
- [ ] Context matches the selected level; L1/L2 include only the target slice and cross-cutting constraints.
- [ ] Settled materialization choices survive decomposition; dispatchable units carry the concrete capability/provider contract, and unresolved choices remain blockers to implementation rather than implicit worker discretion.
- [ ] Dispatchable units settle affected consumer signatures/schema where needed; implementation cannot invent business semantics.
- [ ] In/out-of-scope paths and cleanup are explicit; exact file deltas are used where disjoint ownership needs them.
- [ ] Separate phase files are used only where persistent or independently resumable handoffs benefit.
- [ ] Out-of-scope boundary and stop conditions are explicit.
- [ ] Allowed and forbidden actions, output contract, and surgical context are present.
