---
metadata:
  prototype: "2026-10-28"
  review-after: "1–2 real uses or 2027-01-28"
  maintenance-review: "Prototype; source/desk checks are not runtime obedience evidence. Review after 1–2 real uses."
---

# Library reuse assessment

Required for every scoped code assessment. Stay read-only unless the assignment
separately authorizes a later refinement; a finding never grants refactor permission.

Obtain assessed revision/coverage, the researched capability → library/tool/API
proposal and human approval source/revision, custom exceptions and alternatives,
root engineering policy and behavior checks. Before design/implementation, only
read-only research, diagnosis and review may precede human stack approval. Neither
primary nor architect/tool approval substitutes for the human. Unchanged same-task
approval is reusable; changed providers/material API/runtime constraints/custom
exceptions need reapproval. Approved-tool absence is a gap, not custom-fallback authority.

Trace actual capability delegation and relevant behavior. Standard libraries and
native tools count where used for that capability. Unused imports, incidental
logging, or a library used elsewhere do not excuse a handwritten capability.
For custom work, inspect evidence that established alternatives cannot meet the
task and the explicit human exception. Flag **every library-free authored unit/
location**, including approved novel domain logic; group by distinct capability
to avoid multiplying penalties for its helpers. Approval can make custom work
permissible, never exempt from the flag or deduction.

Predeclare **maintainability—reuse policy score**:
`max(0, 10 - distinct scoped library-free capabilities)`. List all locations,
capability groups and one-point deductions, even beyond zero. Use an existing
project rubric instead only if it retains all flags, explicit numerical deductions
and floor reporting; otherwise report this component alongside it. No fabricated
conversion, duplicate deductions or post-hoc rubric changes. It is a policy score,
not measured quality, correctness or a merge threshold. Unknown coverage means
score coverage `UNVERIFIED`, with observed flags/deduction obligations still shown.

Report flags, approval status, alternative insufficiency evidence and numerical
deductions **directly to the user**, not just deferred debt. Approved custom code
is not automatically a correctness failure. Proven unapproved substitutions or
proceeding without approval are policy failures, regardless of green tests. Missing
historical receipts for preexisting/third-party audited code mean approval unknown,
not a retrospective accusation; still report observed library-free units. Missing
required evidence is `UNVERIFIED`, never PASS.

Backward compatibility is OFF unless the actual project root engineering doc
affirmatively enables it with scope (root AGENTS.md, ENGINEERING.md or designated
root policy/README section). Root may delegate details; a bare link, nested ADR,
old test or client is not opt-in. Unavailable root evidence is unknown. Report
known affected consumers; investigate unknown required current/outside-consumer
contracts proportionately and pause only dependent work. Do not prescribe legacy
shims by default; scope, safety, data integrity and recovery remain mandatory.

Return source coverage/revision, capability/API/check evidence, every flagged
location/group, exception approval, rubric/start/deductions/final score and unknowns.
Keep optional refinements deferred; mandatory flags, deductions and policy blockers
are immediate reporting obligations, not automatic permission to repair.
