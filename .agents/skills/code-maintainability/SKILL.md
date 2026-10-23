---
name: code-maintainability
description: "Assess working code in a separate agent and record concrete maintainability refinements for later. Use for post-implementation assessment, recording shortcuts, readability or SOLID review, and approved refinement of a solution proven useful. Not an upfront implementation gate, general security audit, or permission to automatically refactor."
---

# Code Maintainability

Spend assessment effort after there is working software, and refinement effort
after that software proves useful. A useful assessment may conclude **leave it alone**.

**Reader:** a separately dispatched assessor, or a later authorized refiner.
**Inputs:** outcome and constraints, changed files plus revision/snapshot identity,
verification evidence, known shortcuts, READ/RUN boundaries, and an authorized
durable record destination (existing task, issue, PR, or project record preferred).
Resolve paths against the supplied project root. Do not assume parent chat access.
**Outputs:** a recorded assessment, or a bounded approved refinement with fresh checks.

## 1. Assess working code — default, report-only

Confirm the handoff identifies working behavior and evidence. Missing checks mean
that behavior is unverified, not that the assessor should silently finish it.
Inspect only the changed surface and enough consumers to understand its effects.
Use available native tools or authorized integrations; no particular harness or
provider is required. No code writes, installs, or nested delegation are authorized
by this skill. RUN only checks explicitly allowed in the assignment.

Look for concrete costs: difficult-to-follow effects, confusing names, mixed
responsibilities, duplicated rules likely to diverge, inappropriate dependencies,
or unnecessary abstraction. Do not manufacture findings to fill a checklist.
Load only the relevant method, not the whole library:

| Need | Optional method |
|---|---|
| Responsibility/interface/dependency assessment | [SOLID cost questions](references/solid-checklist.md) |
| Readability, naming, duplication and caller documentation | [Readability assessment](references/readability.md) |
| Effects, branching, orchestration and evidence walkthrough | [Flow assessment](references/flow-assessment.md) |

This skill owns assessment methods; Code Craft owns implementation techniques,
testing, native file navigation, language/tooling choices and pattern lookup.
These methods do not authorize enforcing every style preference or implementing
suggestions. Scope recommendations to observed costs, not hypothetical needs.

## 2. Record suggestions now; defer application

Return a compact record for the primary to persist at the authorized destination;
write that record directly only when the assignment explicitly allows that path.
Include:

- Assessed revision/files, working outcome, supplied/run checks, and limitations.
- Each suggestion: source location, concrete maintenance cost, smallest useful
  adjustment, expected benefit, risk/effort, and when it would become worthwhile.
- Status **deferred — awaiting demonstrated usefulness and explicit approval**.
- Any safety, correctness, integrity, or required-compatibility defect separately
  as a blocker needing the normal repair workflow, never hidden as optional debt.
- **No worthwhile refinement** when leaving the code alone is the better choice.

Example record (paths relative to the supplied project root):

> Revision: supplied snapshot A; `src/import.ts`; import smoke check passed.
> Suggestion: `src/import.ts:42` mixes parsing and saving, making parser changes
> hard to isolate. Consider extracting parsing when a second input format is
> actually needed. Benefit: localized changes; effort: small; risk: error ordering.
> Deferred — usefulness not established, no refactor approved. Blockers: none.

Assessment completion does not approve its recommendations or prove usefulness.
Suggestions are non-blocking for trying the working solution. Preserve the record
even if refinement never happens; do not create a new tracking system by default.

## 3. Refine later — only with explicit approval

Before any code change, require both evidence/user confirmation that the solution
is useful and explicit user approval of the selected suggestions and writable
scope. Neither green tests, assessment dispatch, silence, nor recorded suggestions
satisfies these gates. If either is absent, stop at the record.

Revalidate the current source against the assessed revision; stale suggestions
need a fresh scoped assessment, not blind application. Use an implementation
capability with the explicit approved change, writable scope, observable behavior
and consumer contracts. Preserve those contracts, run relevant checks again, and
record what changed and what remains deferred. Request separate authorization for
any behavior change or broader redesign; do not turn refinement into a rewrite.

Close a bounded refinement with fresh checks and the record update; do not trigger
another assessment automatically. Reassess only when requested or new evidence
invalidates the prior assessment. Newly affected trust/state/consumer boundaries
or broader scope require returning to the primary before proceeding.

## Stops and deliverable

- Missing source/evidence: report the precise limitation; do not invent findings.
- No separate permitted assessor: primary reports pending, never self-certifies independence.
- Missing record destination/write permission: return the report and mark recording
  pending; no silent memory-store creation or expansion of writable scope.
- Missing usefulness evidence or approval: no refinement writes.
- Safety or contract defect: escalate affected work; suggestions cannot waive it.

Deliver a source-linked assessment and record location/status, explicit blockers,
and deferred suggestions or a leave-alone conclusion. For approved refinement,
also deliver scope compliance and fresh behavior evidence.

## Avoid

| Temptation | Instead |
|---|---|
| Polish before it works | Assess the verified working result |
| Automatically apply easy suggestions | Record now; wait for usefulness and approval |
| Demand full SOLID compliance | Recommend changes with concrete benefit |
| Invent future consumers | Tie refinement to observed pain or an explicit trigger |
| Bury a correctness defect as debt | Report a blocker separately |
| Apply a stale report | Revalidate the current source first |

## ACI pass / prototype

Source-interface PASS: explicit inputs, snapshot, action limits, recording contract,
example, approval gates, unavailable-capability behavior, and locally owned
assessment references. Mixed guides are separated by implementer/assessor purpose;
no duplicate library or old-path stubs. Review after 1–2 real uses or the next quarterly audit.
Source checks/walkthroughs do not prove runtime compliance or productivity gains.
