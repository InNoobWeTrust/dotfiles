---
metadata:
  prototype: "2026-10-28"
  review-after: "1–2 real uses or 2027-01-28"
  maintenance-review: "Prototype; source and synthetic checks do not establish future compliance. Review after 1–2 real uses."
---

# Actual reuse and human approval review

Required for the scoped code/design/stack/materialization surface, regardless of
review depth. Stay evaluative: no installs, substitutions or automatic refactoring.

## Inputs and evidence

Obtain the task/scope and source revision, researched capability → tool/library/API
proposal, inspected alternatives and constraints, human approval source/revision,
approved custom exceptions and relevant checks. Research/review may precede human
approval; solution interfaces, schemas, module plans and prototypes may not.
Primary, architect or tool approval cannot replace the human. Reuse unchanged
same-task approval, but changed providers, material API/runtime constraints or
custom exceptions need human reapproval before dependent design/code.

For an existing/third-party artifact audit without historical receipts, report
authorization `UNVERIFIED`; do not accuse its authors of violating a later policy.
Still assess actual reuse and report observed library-free code in the scoped audit.

1. Trace each scoped capability to actual approved API/tool calls and the relevant
   behavior evidence. Standard libraries and native tools count for the work they
   really perform; no compulsory third-party dependency. An unused import,
   incidental logging or a library elsewhere does not implement a custom parser,
   scheduler, ranking engine or other capability.
2. For each custom implementation, inspect established alternatives and concrete
   documented insufficiency for this task, plus the human exception receipt.
   Familiarity, speed of writing or “simple enough” is not evidence of insufficiency.
3. List **every library-free authored code unit/location**; group deductions by
   distinct capability so helper splitting neither hides nor multiplies penalties.
   Approved custom/domain-specific logic still gets flags and deductions, not an
   automatic correctness failure. Incidental standard-library use cannot launder it.
4. Check root engineering policy for compatibility: opt-in must be affirmative and
   scoped in the actual root AGENTS.md, ENGINEERING.md or designated root policy/
   README engineering section. A root may delegate details, not enable by bare
   link; nested docs, existing clients and old tests are not opt-in. Checked and
   silent means OFF; unavailable evidence is unknown. Do not demand default shims,
   additive-only changes or deprecation windows. Report known affected consumers;
   investigate unknown required current/outside-consumer contracts proportionately
   and pause only dependent work. Scope, security, data and recovery still apply.

## Predeclared scoring and verdict

Before judging, declare **maintainability—reuse policy score**:
`max(0, 10 - distinct scoped library-free capabilities)`. Show every unit/location,
capability grouping and one-point deduction, including deductions beyond the floor.
If an existing project rubric already provides all these flags, explicit numerical
deductions and floor reporting, use it instead; otherwise report this component
alongside it. Do not convert unrelated scores, double-count or change a rubric after
seeing results. This is a policy component, not empirical code quality or a merge
threshold. Unknown source coverage makes score coverage `UNVERIFIED`; report all
observed flags and deduction obligations rather than fabricate a complete score.

- **FAIL:** evidence of proceeding without required approval, unapproved custom
  substitution or stale approval after a changed stack, even when tests pass.
- **UNVERIFIED:** missing proposal/receipt, inaccessible required sources, approved
  tool unavailable or unrun relevant integration. Never turn mocks/imports into PASS.
  An explicit unapproved fallback is FAIL, separately from the missing integration.
- **PASS for this gate:** current human approval, actual approved reuse and justified
  approved exceptions verified; still report library-free flags and deductions.

Return proposal/approval source, capability → actual API/evidence, custom rationale
and approval status, every library-free location, rubric/start/deductions/final score
and coverage, root compatibility evidence and scoped verdict/gaps. The primary must
surface flags and numerical deductions **directly in the user-facing handoff**, not
only an internal record. This does not authorize changes or claim user acceptance.
