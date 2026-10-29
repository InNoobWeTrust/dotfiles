---
name: code-craft
description: "Use for non-trivial implementation, fixes, approved refactoring, and behavior/acceptance specifications. Prioritize the simplest verified working solution and fast feedback; defer maintainability assessment to a separate agent after it works. Not for formatting, config-only changes, or maintainability-only assessment."
---

# Code Craft

Make it work first. Prefer a small, direct, idiomatic implementation over a design
for hypothetical future needs. Iteration and discarding an unhelpful approach are
cheaper than polishing it before its usefulness is known.

**Inputs:** desired behavior, relevant source, writable scope, consumer constraints,
current researched stack proposal/human approval receipt and authorized checks. **Outputs:** working change, observed verification,
limitations, and a small handoff for separate maintainability assessment.

## 1. Establish the smallest useful outcome

**Gate — before any design or implementation:** verify the researched tools/
libraries/APIs, constraints/sources, alternatives and custom insufficiency were
presented and explicitly human-approved; record task/scope, proposal revision and
approval source. Read-only discovery, diagnosis and review may precede approval,
not interfaces, schemas, module plans or prototype code. Primary/architect/tool
approval cannot replace the human. A concise standard-library/native-tool or
Markdown-only proposal suffices for small tasks but is not exempt. Reuse an
unchanged same-task receipt; changed providers, material API/runtime constraints
or custom exceptions need reapproval. Missing evidence is UNVERIFIED; stop affected
design/code. Approved-tool absence is not custom/mock fallback authority.

- Clarify observable success and consequential unknowns, not every implementation
  detail. Inline intent is enough; no mandatory phase files or design template.
- Inspect the relevant existing path and reuse platform/repository capabilities.
  Keep established source ownership and dependency direction; settle new trust,
  state, or consumer boundaries when they actually change.
- When current code may conflict with intent, apply [Code-intent fit](references/code-intent-fit.md)
  before choosing a patch, scoped refactor or consequential escalation. This is
  correctness/source inspection, not an upfront maintainability audit.
- For server-shaped programs, including MCP servers, keep bootstrap/transport,
  routing, endpoints, middleware, contracts and streaming channels separate;
  protocol ceremony belongs at the boundary, not inside handlers.
- For rewrites, classify affected behavior/interfaces as **delete** or **preserve**
  and settle required current contracts, not automatic legacy retention.
  Backward compatibility is **off** unless the project's root engineering docs explicitly
  enable it with scope; a bare link, nested ADR, existing client, or old test does not
  opt in. Carry out approved code/document/interface deletion and update in-scope
  references, without pointer-only remnants or unrequested shims. Report known
  outside-scope consumers as concrete consequences; investigate unknown required
  outside-consumer contracts proportionately, mark them `UNVERIFIED`, and pause only
  dependent work—unknown consumers are not an automatic preservation veto.
- For **specification-only** requests, use [Behavior and acceptance](references/testing.md#behavior-and-acceptance)
  and stop at the specification. Do not implement, run checks, or dispatch a
  post-implementation assessment for code that was not written.

## 2. Implement and verify

Carry the current §1 human approval receipt into implementation and every handoff;
do not let primary plan approval or an atomic-patch exception bypass it.

- Write the simplest solution that meets the current outcome. Avoid speculative
  abstractions, extension points, architectural cleanup, and adjacent improvements.
  No upfront SOLID checklist or mandatory readability-audit phase.
- Keep [file navigation](references/file-navigation.md) current with the change:
  native purpose header, grouped symbols and consequential edges where useful;
  one line for tiny files, no unrelated retrofit or separate documentation phase.
- Keep a non-negotiable floor: safety, authorization, data integrity, root-opted-in
  compatibility, current task/dependency suitability, isolation and correctness.
  These are not deferred refinement. Unavailable root policy is unknown, not OFF.
- Reuse one resolved [code-style contract](references/style-policy.md) across
  producers and reviewers; project tooling wins over greenfield defaults.
- Use [Testing](references/testing.md) for meaningful checks and test persistence.
  Prefer existing repository commands; exercise relevant failure paths. Test-first
  is optional. Never weaken existing tests or quality gates to get a quick pass.
- Fix observed defects in scope and recheck. If the approach is not useful, revise
  or discard only your own authorized work; protect unrelated changes.
- Report actual evidence and gaps. A working check does not establish product
  usefulness, user acceptance, or permission for further changes.

## 3. Hand off without polishing

After the solution works and relevant checks pass, have the primary dispatch a
**separate assessor** for a report-only maintainability review. It must be
independent of the implementer; if no separate assessor is available, report the
assessment as pending rather than simulating independence.
Provide only: what works, changed files/revision, verification evidence, known
shortcuts, human stack/custom approval receipt and an authorized record destination.
Require immediate user-facing library-free flags and numerical reuse-policy
deductions, even for approved custom code; only optional refinements are deferred.
A worker implementer returns this
handoff to the primary; it does not recursively dispatch.

Exception: a bounded refinement approved from an existing assessment ends with
fresh checks and an update to that record, not another automatic assessment.
Reassess only when requested or new evidence invalidates the prior assessment;
new boundaries or broader scope require returning to the primary before proceeding.

The assessment is **report-only now**: record refinement suggestions for later.
Do not apply them until the solution is proven useful and the user explicitly
approves a bounded refinement. Suggestions alone do not block use of working
software; discovered safety/correctness defects are reported separately as blockers.
If delegation or recording is unavailable, report the assessment as pending and
the exact gap; do not simulate an independent assessment or conceal its absence.

## Stops and delivery

Stop affected work for missing authority, unsafe execution, unresolved required
behavior, or a defective locked contract (`INCOMPLETE: CONTRACT_DEFECT`). Return
the evidence and proposed adjustment; do not invent fallback semantics.

Deliver: changed behavior/files, checks and limitations, and the assessment record
or pending status. Leave unrelated work untouched and clean up owned scratch.
Load deeper references only for a concrete implementation problem, not as a
default reading list: [implementation essentials](references/implementation-essentials.md)
for contracts/errors/types, [execution flow](references/execution-flow.md) for
consequential branching/effects, or [pattern lookup](references/pattern-catalog.md)
for a specific technique. Assessment methods live in Code Maintainability, not
this implementation library.
