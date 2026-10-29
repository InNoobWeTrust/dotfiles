---
name: code-maintainability
description: "Assess working code in a separate agent against the governing structure standard and classify findings as structural (mandatory cleanup after the user locks behavior), optional (recorded, approval needed) or defects. Use for post-implementation assessment, cleanup-pass planning, legacy hotspot reports, readability or SOLID review. Not an upfront implementation gate, general security audit, or permission to change behavior."
metadata:
  maintenance-review: |-
    Source-interface PASS: explicit inputs, snapshot, action limits, recording contract, example, approval gates, unavailable-capability behavior, and locally owned assessment references. Mixed guides are separated by implementer/assessor purpose; no duplicate library or old-path stubs.
    Review after 1–2 real uses or the next quarterly audit. Source checks/walkthroughs do not prove runtime compliance or productivity gains.
  structure-revision: "2026-10-30: structural findings became mandatory cleanup after lock instead of deferred suggestions; structure standard and gate output added as assessment inputs."
---

# Code Maintainability

Assess working code against the structure standard that governs it, so cleanup
happens while the change is fresh. A useful assessment may conclude **nothing to clean**.

**Reader:** a separately dispatched assessor, or a later cleanup implementer.
**Inputs:** outcome and constraints, changed files plus revision/snapshot identity
(the task footprint), verification and lock evidence, gate output, known shortcuts,
the governing structure standard (project override or installation default; the
caller supplies it when not discoverable), READ/RUN boundaries, and an authorized
record destination (existing task, issue, PR, or project record preferred).
Resolve paths against the supplied project root. Do not assume parent chat access.
**Outputs:** a classified assessment with mandatory reuse flags/score reported to the
user and a cleanup plan for structural findings. Obtain the scoped stack
proposal/human receipt and root engineering policy; unknown evidence stays unknown.

## 1. Assess working code — report first

Confirm the handoff identifies working behavior and evidence. Missing checks mean
that behavior is unverified, not that the assessor should silently finish it.
Inspect the footprint and enough consumers to understand its effects. No code writes,
installs, or nested delegation are authorized by this skill. RUN only checks
explicitly allowed in the assignment; prefer the project's configured structure gates
and report missing gates as a foundation gap.

Check, in order: structure-plan compliance and placement; boundaries and layer
direction; limit breaches; duplicated business rules (search for existing equivalents,
not only within the diff); banned bucket names and pass-through layers; dead code and
leftover old paths; then readability. Do not manufacture findings to fill a checklist.
Always apply [Library reuse assessment](references/library-reuse.md): actual API
delegation, every library-free unit/location, approved custom rationale and a
predeclared numerical reuse-policy deduction—mandatory reporting, never deferred.
Load only the relevant method:

| Need | Method |
|---|---|
| Responsibility/interface/dependency assessment | [SOLID cost questions](references/solid-checklist.md) |
| Readability, naming, duplication and caller documentation | [Readability assessment](references/readability.md) |
| Effects, branching, orchestration and evidence walkthrough | [Flow assessment](references/flow-assessment.md) |

This skill owns assessment methods; the implementation capability owns
implementation techniques, the default structure standard, testing, native file
navigation and pattern lookup.

## 2. Classify and record

| Class | Meaning | Status |
|---|---|---|
| **Structural** | Violates the governing standard: placement, boundary/layer, limit, duplicated rule, banned name, pass-through layer, dead code/old path, mixed concerns | **Mandatory cleanup** after lock, inside the task footprint |
| **Optional** | Improvement within the standard with no observed violation | Recorded; needs explicit approval |
| **Defect** | Safety, correctness, integrity, stack-approval or opted-in compatibility | Blocker; normal repair workflow |
| **Out-of-footprint debt** | Pre-existing violation the task did not create or touch | Legacy remediation backlog |

Return a compact record for the primary to persist at the authorized destination;
write it directly only when the assignment allows that path. Include assessed
revision/files, outcome, checks and limitations, and per finding: location, class,
violated rule (standard section or project override), smallest behavior-preserving
fix, step size, and lock coverage of the affected path.

Example record (paths relative to the supplied project root):

> Revision: snapshot A; footprint `src/features/import/*`; smoke + lock checks passed.
> Structural: `src/features/import/handler.ts:42` parses and saves in one 140-line
> function (limit 50; mixes service and adapter layers). Fix: move parsing to
> `import/service/parse.ts` (pure move, ~60 lines), then extract save adapter. Lock: covered.
> Optional: rename `rec` → `importRecord`. Blockers: none.

## 3. Clean up

- **Structural, inside the footprint:** the user's lock authorizes cleanup as part of
  the task. Use an implementation capability with the plan, writable scope and lock
  checks; behavior-preserving budgeted steps; gates and lock checks green after each.
  No lock evidence for a path → do not restructure it; report.
- **Optional:** apply only with explicit user approval of selected items and scope.
- **Out-of-footprint:** user-approved remediation batches with baseline and ratchet.

Before any write, require the current human stack/custom-exception receipt (a primary
cannot supply it). Revalidate current source against the assessed revision; stale
findings need a fresh scoped assessment. Any behavior or consumer-contract change
needs separate authorization. Close a cleanup with fresh checks and the record
update; do not trigger another assessment automatically.

## Stops and deliverable

- Missing source/evidence: report the precise limitation; do not invent findings.
- No separate permitted assessor: primary reports pending, never self-certifies independence.
- Missing record destination/write permission: return the report and mark recording pending.
- Missing lock evidence or stack receipt: no cleanup writes; read-only review may close gaps.
- Safety or contract defect: escalate affected work; findings cannot waive it.

Deliver a source-linked classified assessment, record location/status, blockers, the
structural cleanup plan, and optional or out-of-footprint items. For cleanup, also
deliver scope compliance, gate output and fresh lock-check evidence.

## Avoid

| Temptation | Instead |
|---|---|
| Downgrade a standard violation to an optional suggestion | Classify it structural; it is mandatory cleanup |
| Assess only the diff for duplication | Search for existing equivalents of the new rule |
| Accept "gates pass" without output | Mark UNVERIFIED or run the allowed gate |
| Restructure behavior that is not locked | Require lock checks first |
| Expand cleanup into adjacent legacy code | Record as remediation backlog |
| Bury a correctness defect as debt | Report a blocker separately |
| Apply a stale report | Revalidate the current source first |
