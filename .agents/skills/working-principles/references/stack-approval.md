---
metadata:
  updated: "2026-10-28"
  review-after: "1–2 real uses or 2027-01-28"
  maintenance-review: "Prototype. Source/desk checks do not prove future agent obedience; review after 1–2 real uses."
---

# Human stack approval

Use before **any design or implementation**, including utilities, documentation,
configuration and AFK work. This is a human-owned gate, not agent plan approval.

## Research, present, wait

Read-only discovery, diagnosis, review and research may proceed first. Inspect
repository capabilities, native/platform and standard libraries, then established
tools and libraries relevant to the task. Use current official documentation and
repository evidence, not model familiarity. Do not design interfaces, schemas or
modules, or write prototypes, while researching the stack.

Present a proportionate proposal:

- Task/scope and capability → chosen provider/tool/library and relevant API.
- Relevant versions, runtime/platform, license and compatibility constraints,
  citing the inspected sources; distinguish unknown evidence.
- Considered established alternatives, why the selection fits, and concrete unmet
  requirements for **each** custom exception. Do not invent rejected alternatives.
- Dependency-file edits, installation/network scope and proposed fallbacks.

A tiny standard-library/native-tool fix or Markdown-only edit can use one concise
researched no-new-dependencies proposal. Do not manufacture a license matrix for
vacuous choices. Standard libraries are legitimate reuse; third-party dependencies
are not compulsory. Selection is not installation or external-effect permission.

Wait for **explicit user approval** of the proposed stack and custom exceptions.
Record task/scope, proposal revision, approval source, conditions and fallbacks in
existing task context. A primary, worker, architect or decision tool cannot supply
this approval. Missing research, sources or receipt is `UNVERIFIED`: stop affected
design/implementation, not the permitted discovery needed to close the gap.

## Separate implementation from invocation

This gate controls the stack being designed or added to the deliverable, not every
invocation of an existing tool. "No new dependencies" in an implementation proposal
does not by itself mean "no runtime dependency resolution" or "offline execution."
Keep three scopes distinct: project dependency/manifest changes, an existing tool's
documented runtime resolution/cache writes, and persistent/global installation.

For example, preserving an existing Bun verification script without adding project
dependencies does not itself require `--no-install` when invoking it. Normal Bun
package resolution remains subject to the actual network/execution permissions;
the implementation constraint alone is neither a prohibition nor a grant of those
permissions. Explicit no-download/no-install restrictions and sandbox boundaries
still govern. Do not silently change invocation flags to enforce an inferred ban,
then report the induced failure as proof that the tool cannot run. If scope really
is ambiguous, name the concrete effect to clarify rather than conflating these
three categories.

## Carry the approved contract

Reuse approval for the same task/scope and unchanged stack; no per-edit ritual.
Handoffs carry capability/API choices, constraints, permitted dependency edits,
approved exceptions, prohibited substitutions and the human receipt/revision.
Ordinary local mechanics and primary plan approval remain within this contract.

A changed provider, material API/runtime constraint, fallback or custom exception
needs renewed human approval **before** dependent design/code. If the approved
tool is unavailable, return the gap; do not silently substitute custom code or a
mock. AFK requires preapproved fallbacks or a halt.

## Review actual materialization

Trace each capability through actual API/tool use and relevant behavior. Imports,
incidental logging and libraries used elsewhere do not prove delegation of the
capability. Require sources showing why existing solutions are insufficient for
custom work and the human exception receipt. Report unverified evidence honestly.

Flag every library-free authored code unit/location directly to the user, including
approved domain-specific code. Deduct numerically per distinct capability under a
predeclared rubric (default reuse-policy component: `max(0, 10 - capability count)`),
listing flags and deductions even at the floor. A substitute project rubric must
retain all flags, explicit deductions and floor reporting; otherwise keep this
component alongside it. This is policy compliance, not an empirical quality score.
Approved custom work is not automatically incorrect, but is not exempt from flags
or deductions. Historical approval absent in a preexisting-code audit is unknown,
not evidence that its authors acted without permission. No automatic refactoring.
