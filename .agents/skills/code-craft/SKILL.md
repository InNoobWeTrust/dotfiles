---
name: code-craft
description: "Use for non-trivial implementation, fixes, approved refactoring, cleanup passes and behavior/acceptance specifications. Settles structure before code, delivers an early working slice for the user to test-fly, then cleans up the task's own structural findings once behavior is locked. Not for formatting, config-only changes, or maintainability-only assessment."
metadata:
  structure-revision: "2026-10-30: structure-first plan, structure standard with global defaults/project override, test-flight → lock → mandatory cleanup; replaced report-only deferral of structural findings."
---

# Code Craft

Get to working behavior fast, inside a sound structure. Speed comes from small
**scope**, never from skipping structure: a test-flight slice is narrow, not messy.
Avoid designs for hypothetical needs; discard an unhelpful approach early.

**Inputs:** desired behavior, relevant source, writable scope, consumer constraints,
the human stack-approval receipt, the governing structure standard and authorized
checks. **Outputs:** working change, gate and check evidence, change map, and the
cleanup result or pending status.

## 1. Establish the outcome and the structure

**Gate — before any design or implementation:** require a recorded human approval of
the researched stack and any custom exceptions (task/scope, proposal revision,
approval source). Read-only discovery, diagnosis and review may precede it;
interfaces, schemas, module plans and prototype code may not. No primary, architect
or tool approval substitutes. Changed providers, material API/runtime constraints or
custom exceptions need reapproval. Missing evidence is UNVERIFIED and stops affected
work; an unavailable approved tool is not authority for a custom or mock fallback.

- Clarify observable success and consequential unknowns; inline intent is enough.
- Inspect the existing path; reuse platform/repository capabilities and the project's
  exemplar modules.
- **Structure plan first.** Before the first source write that adds a capability,
  file group, public surface or dependency edge, settle the plan in the
  [structure standard](references/structure-standard.md) §3 (project overrides win).
  The plan is design direction: an eligible direction route or the user authors or
  approves it; execution-only routes materialize it and stop when code does not fit.
- When current code may conflict with intent, apply [Code-intent fit](references/code-intent-fit.md)
  before choosing a patch, scoped refactor or escalation.
- Server-shaped programs, including MCP servers, keep bootstrap/transport, routing,
  endpoints, middleware, contracts and streaming channels separate; protocol ceremony
  stays at the boundary.
- **Rewrites:** classify affected behavior/interfaces as delete or preserve. Backward
  compatibility is off unless the project's root engineering docs enable it with
  scope (a bare link, nested ADR, existing client or old test does not). Carry out
  approved deletions and update in-scope references without shims or pointer-only
  remnants. Report known outside consumers as consequences; mark unknown required
  outside contracts UNVERIFIED and pause only dependent work.
- **Specification-only** requests use [Behavior and acceptance](references/testing.md#behavior-and-acceptance)
  and stop at the specification.

## 2. Implement the test-flight slice and verify

- Write the simplest solution for the current outcome **inside the planned homes and
  within the standard's limits**. Simple means fewer concepts, not fewer files: do not
  pile unrelated responsibilities into one file or add pass-through layers.
- Follow the standard's change shape: one concern per step, step budget, no drive-by
  edits, no leftover old paths.
- Keep [file navigation](references/file-navigation.md) current with the change.
- Non-negotiable floor: safety, authorization, data integrity, root-opted-in
  compatibility, dependency suitability, isolation and correctness.
- Reuse one resolved [code-style contract](references/style-policy.md); project
  tooling wins over greenfield defaults.
- Use [Testing](references/testing.md) for meaningful checks and test persistence;
  prefer existing repository commands, exercise relevant failure paths, and never
  weaken existing tests or quality gates. Test-first is optional.
- **Run the structure gates** (or the standard's manual check, labelled manual) after
  edits and before handoff; include actual output. Fix observed defects and recheck.
- Hand the slice to the user for test flight with shortcuts listed. A passing check
  does not establish usefulness, acceptance or permission for further changes.

## 3. Lock, assess, clean up

Follow [Test flight, lock, clean up](references/cleanup-pass.md):

1. When the user confirms the behavior, protect it with lock checks.
2. The primary dispatches a **separate assessor** (independent of the implementer);
   if none is available, report the assessment pending rather than simulating it.
   Provide what works, revision/files, evidence, shortcuts, the stack receipt and an
   authorized record destination. Library-free flags and reuse-policy deductions are
   reported to the user immediately.
3. **Structural findings inside the task footprint are mandatory cleanup**, authorized
   by the lock and performed behavior-preserving in budgeted steps with gates and lock
   checks green after each. Optional findings are recorded and need explicit approval.
   Defects go through normal repair.
4. Debt outside the footprint follows the legacy remediation batches; the touched-unit
   rule still forbids making any touched file worse.

A worker implementer returns handoffs to the primary; it does not recursively dispatch.
A cleanup step ends with fresh checks and a record update, not another automatic
assessment; new boundaries or broader scope return to the primary.

## Stops and delivery

Stop affected work for missing authority, unsafe execution, unresolved required
behavior, a write outside the structure plan, or a defective locked contract
(`INCOMPLETE: CONTRACT_DEFECT`). Return evidence and a proposed adjustment; do not
invent fallback semantics.

Deliver: change map, gate and check output, limitations, and the cleanup result or
pending status. Leave unrelated work untouched and clean up owned scratch. Deeper
references on demand: [implementation essentials](references/implementation-essentials.md),
[execution flow](references/execution-flow.md), [pattern lookup](references/pattern-catalog.md),
[structure gates catalog](assets/structure-gates.csv), [model traps](assets/model-traps.csv).
Assessment methods belong to the separate maintainability-assessment capability.

## Avoid

| Temptation | Instead |
|---|---|
| "Make it work" by stuffing code into the nearest file | Narrow the scope; keep the planned homes |
| Write first, decide placement later | Structure plan before the first affected write |
| Claim gates pass | Paste actual gate output; otherwise UNVERIFIED |
| Mix refactor and feature in one diff | Separate tidy steps from behavior steps |
| Leave the mess as a "deferred suggestion" | Clean structural findings after the lock |
| Restructure unlocked behavior | Add lock checks first or leave the path untouched |
