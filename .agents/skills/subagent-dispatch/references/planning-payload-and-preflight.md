# Planning Dispatch Payload and Preflight

Read this reference before dispatching planning work. The orchestrator selects the depth and next target; the planner does not decide what to drill into next. The plan file is shared state across calls.

## Depth levels

Select exactly one level per call. Never skip levels or request a complete detailed plan in one dispatch.

| Level | Scope | Output |
|---|---|---|
| L0 — Strategic Outline | Full goal, first pass | Numbered sections with one-to-three-sentence goal statements; no functional units. |
| L1 — Section Decomposition | One named L0 section | Subheadings marked `[ATOMIC]` or `[NEEDS L2]`. |
| L2 — Atomic Unit Specification | One `[NEEDS L2]` subheading | Dispatchable functional units with acceptance criteria. |

## Required payload

Set every applicable field before launch:

1. **Depth level:** L0, L1, or L2.
2. **Plan file path:** where the evolving plan is read and written.
3. **Target:** the named section or subheading for L1/L2 only.
4. **Goal context:** the full goal for L0; only the target slice and cross-cutting constraints for L1/L2.
5. **Out of scope:** what this pass must not expand into.
6. **Stop conditions:** do not skip levels or produce detail beyond the selected depth.

## Stop-before-dispatch conditions

Do not dispatch if no level is declared, more than one section is targeted, or an L1/L2 prompt includes the full goal rather than the section slice. Review each result before selecting the next section to drill down.

## Preflight

- [ ] The decision gate permits delegation.
- [ ] Exactly one L0/L1/L2 depth is declared.
- [ ] The plan file path is explicit.
- [ ] L1/L2 names exactly one target.
- [ ] Context matches the selected level; L1/L2 include only the target slice and cross-cutting constraints.
- [ ] Out-of-scope boundary and stop conditions are explicit.
- [ ] Allowed and forbidden actions, output contract, and surgical context are present.
