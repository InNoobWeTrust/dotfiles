---
metadata:
  prototype-added: "2026-10-30"
  origin: "User intent: make-it-work exists so the user can test-fly early and probe misunderstanding; once behavior is locked, the agent must clean up its own mess. Applies to existing projects through legacy remediation."
  maintenance-review: "Prototype. Reassess after 1–2 real uses; check whether cleanup steps stay behavior-preserving and within the step budget."
---

# Test flight, lock, clean up

**Reader:** the primary coordinating delivery, implementers doing cleanup and the
separate assessor. **Inputs:** the working slice, the structure standard (project
override or installation default), the change footprint (files this task created or
changed), lock evidence and authorized checks. **Output:** a behavior-preserving
cleaned change with gate output and a change map, or an explicit stop.

## 1. Test flight

Deliver the smallest working slice early so the user can probe it and expose
misunderstanding. Speed is about **scope**, not structure: the structure plan,
organization defaults and limits still apply while writing it. List shortcuts taken
(hard-coded values, missing edge paths) in the handoff. Behavior may still change
after probing; do not polish yet.

## 2. Lock

Behavior is **locked** when the user confirms the test-flight behavior (or names it
locked/accepted). Before cleanup, protect the locked behavior with end-to-end or
characterization checks of observable outcomes; reuse existing ones. Without a lock
check for a path, cleanup of that path is not behavior-preserving—add the check first
or leave that path untouched and report it.

## 3. Assess and classify

A separate assessor (not the implementer) compares the footprint with the standard and
classifies each finding:

| Class | Examples | Consequence |
|---|---|---|
| **Structural** | gate failure or limit breach; code outside its feature/layer home; boundary or forward-only layer violation; duplicated business rule; banned bucket name; pass-through layer; dead code/old path left behind; mixed concerns in one file | **Mandatory cleanup** in this task |
| **Optional** | naming polish, extra extraction without a second consumer, stylistic preference within limits | Recorded; applied only with explicit approval |
| **Defect** | correctness, safety, integrity, required compatibility | Normal repair workflow; never hidden as cleanup |

## 4. Clean up

Cleanup of structural findings **inside the footprint** is part of the original task:
the user's lock authorizes it; no separate refactor approval is needed. It must stay
behavior-preserving.

- Plan the steps first (same structure-plan form as new code).
- One kind of change per step: pure move/rename → extraction → dedupe → dead-code
  removal. Each step within the step budget.
- After every step: lock checks and structure gates pass. A step that changes
  observable behavior stops; return it to the user as a behavior decision.
- Do not widen into adjacent legacy code; record it for remediation (§6).

## 5. Hand off

Deliver: change map in reading order, gate commands and actual output (before/after
violation counts), lock-check evidence, suppressions with reasons, remaining optional
findings and out-of-footprint debt. Acceptance stays with the user.

## 6. Legacy remediation (existing projects)

The standard applies to code that predates it, but through bounded batches:

1. **Baseline.** Configure the gates; record current violation counts per feature/file.
   Existing debt is baselined, not a reason to block unrelated work.
2. **Ratchet.** New violations and worsened files fail; counts only decrease.
3. **Target map.** Map the current tree to feature homes and layer order. This is design
   direction: an eligible direction route or the user authors it; the user approves it.
4. **Touched-unit rule.** A task must not worsen any file it touches. Fixing violations
   in touched units within the step budget is in scope as a separate tidy step.
5. **Batches.** Migrate feature by feature: lock checks first (characterization if
   missing), then pure-move steps, then fixes. The user approves each batch's scope.
6. **Recurring pass.** On request or schedule, produce a report of top hotspots
   (limit breaches, duplication, dead code, stale file maps) as tiny single-purpose
   proposals the user can approve one by one.

## Stops

- No lock evidence for a path → do not restructure that path.
- Cleanup would change behavior or a consumer contract → stop; user decision.
- Required placement exceeds writable scope or the approved target map → return to the primary.
- No separate assessor available → report assessment pending; do not self-certify.
