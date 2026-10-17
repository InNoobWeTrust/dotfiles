# Design Intent template

Load for Phase 1 of non-trivial implementation, whenever a compact or full Design Intent is required, and before choosing a greenfield stack or substantial platform capability.

Select relevant fields; mark genuine non-applicability rather than generating paperwork. A patch needs outcome, scope, constraints and observable checks; cross-component work needs affected contracts and ownership too.

```text
DESIGN INTENT
=============
In scope        : [explicitly locked in-scope paths/components]
Out of scope    : [explicitly locked out-of-scope paths; other repo parts implicitly unchanged]
Milestone/phase/slice reference: [when present]
Active unit     : [inline task or phase reference; separate file when useful]
Consumer contracts: [approved signatures/schemas where consumers need them; otherwise behavior]
Writable scope  : [paths/components; exact file delta when ownership requires it; cleanup]
Acceptance criteria:
Constraints     :
Known compromises: [canonical register references when phased; local deferrals otherwise; or none]
Unit name       :
Responsibility  : [one sentence, no "and"]
Placement       : [owning capability → actual source home(s), settled before generation; split or keep and why; or unchanged existing owner]
Caller interface: [in → out]
Domain terms    : [existing glossary respected; critical ambiguity resolved]
Interface contract: [signature / schema]
Rewrite transition: [old semantics/interfaces → delete | preserve; or N/A]
Consumer contract/stubs: [required approved / N/A]
API documentation: [consumer needs or N/A]
Interface sign-off: [approved/not-approved; authorized owner + authority source + revision; never assumed-approved because AFK]
Module README   : yes/no/updated
Technology choice: [repo-native stack / established package + why]
Pattern Grounding : [query / pattern-id from pattern-catalog.md / none]
Dependencies    : [existing first; new packages + maintenance/license/security fit]
Graph delta     : [relevant module/workspace/external edges; allowed direction; cycle/closure evidence or explicit unknowns; unchanged when justified]
Vendoring        : no / explicit user opt-in + rationale
Quality tools   : [repo-native commands first]
Complexity guard:
Isolation test  : yes/no
Error budget    :
Failure contract:
Ambiguity policy:
Traceability    :
```

For a Patch, `In scope`, `Non-goals`, acceptance criteria, constraints, and known compromises may each be one line. For an MVP Slice, those fields are mandatory even when all other fields are compact. Do not invent a milestone or canonical-register reference when none exists.

The autonomous primary may approve researched in-scope choices before implementation; human-reserved boundaries remain human-owned. Record caller-visible examples, relevant evidence, consequences, and validation proportionately.

## Affected surface before simplification

Before locking scope or minimizing an implementation, inspect the affected callers,
tests, fixtures, configuration, exports and deployment entrypoints (mark genuinely
irrelevant items N/A). Include untouched consumers of changed contracts. Record a
brief surface map in the existing intent or change context, not a new plan file.
Prefer repository capabilities, then suitable platform/standard-library features,
then existing dependencies. Minimize the complete behavior, not just its edited
lines: preserve validation, failure handling, security and accessibility contracts.
If tracing reveals an out-of-scope dependency change, revise scope through its
authorized owner before editing it.

## Technology and dependency policy

Preserve the repository's established stack. Prefer a suitable standard library/platform capability; otherwise use a mature, maintained, production-proven ecosystem package rather than recreating an adequately supplied capability. Vendored third-party copies and deliberate dependency-free reimplementations require explicit user opt-in or an existing repository policy, and must record ownership, update, and security rationale.

When choosing a greenfield language/framework stack or adding a substantial platform capability, first load `languages/README.md`, then the smallest matching reference. Existing repository conventions and explicit project constraints always win.

## Stop conditions

- **Isolation test = no:** redesign.
- **Required consumer contract or approval missing:** use [Planning and shared understanding](../../working-principles/references/planning.md) to clarify caller-visible behavior and consequences before affected implementation.
- **Contract defect:** if an approved contract is defective or unworkable, STOP immediately and report `INCOMPLETE: CONTRACT_DEFECT` with proposed adjustment; do not invent ad-hoc interfaces or alter signatures.
- **Scope violation:** modifying out-of-scope paths, violating an explicitly fixed file delta or leaving scratch artifacts; revise through the authorized owner and clean up.
- **Edge-case semantics unspecified:** stop the affected implementer; the primary researches and approves an in-scope contract. Ask the user only for user-only outcome or authority/safety decisions; AFK never invents a fallback while coding.
- **Proposed vendoring/reimplementation lacks explicit opt-in or documented repository policy:** choose the platform/established dependency or clarify.

For rewrite, overhaul, or delete-and-rebuild work, use [Planning and shared understanding](../../working-principles/references/planning.md). Record affected old semantics/interfaces as **delete** or **preserve**. Settle affected consumer contracts with the authorized owner using caller-visible examples and consequences; do not preserve behavior by reflex or patch code intended for deletion.
