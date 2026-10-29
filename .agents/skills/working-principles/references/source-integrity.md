---
metadata:
  prototype: "2026-10-23"
  maintenance-review: |-
    Prototype. Evaluate after 1–2 real uses for missed conflicts, false
    alarms and owner review/rework effort. Structure and synthetic checks alone do not
    establish prevention of intent drift.
---

# Source integrity before reuse

Use when repository material, prior decisions or current code inform a task's
requirements. Inputs: original request and clarifications, applicable instructions,
affected sources and authorized scope. Output: a few source/scope facts in the
existing handoff, plus any material exception—not a second plan or global inventory.

## Establish the affected baseline

1. **Intent:** Preserve the original outcome and compatible constraints. Separate
   desired behavior from observations of today's implementation. Code and passing
   tests may expose obligations, but cannot silently redefine that outcome.
2. **Authority and status:** Identify the governing source/version and relevant
   approved supersession. Distinguish active requirements, proposals, descriptive
   implementation notes and historical evidence, including mixed-status sections.
   A new timestamp, search rank, folder name or confident summary grants no authority.
   Higher-priority instructions and safety constraints still apply.
3. **Scope:** Name in/out-of-scope behavior and affected consumers. Reuse known
   context for a small edit; record only material assumptions/conflicts. Missing
   original evidence is a gap, not permission to promote the builder's spec.
4. **Disconfirmation:** Find the nearest plausible wrong interpretation and one
   example that distinguishes it. Check whether stale guidance or current code is
   preserving that interpretation despite an approved change.

## Handle conflicts on discovery

For an unresolved material conflict, return exact source locations/quotes, authority
and status, affected behavior, consequences, alternatives, recommendation and the
decision needed. Pause only dependent work before embedding an interpretation in
code. Continue unrelated authorized work. Use the applicable decision authority;
human-reserved questions remain human-owned, routine settled mechanics do not.

An explicit approved supersession already settles the conflict: update affected
in-scope material rather than asking again or restoring the old requirement.
Discover real retained-consumer, safety or retention obligations before deleting;
if they contradict the contract, report that defect rather than inventing a shim.

## Keep the next reader's inputs usable

- **Map:** Maintain a small entry map → domain guide → scoped detail/evidence.
  Give new material a real owner and link it from the relevant entry. Drafts,
  history and transient outputs remain findable for investigation, not silently
  binding on the default requirement route. No arbitrary folder-depth quota.
- **One governing claim:** Link intentional summaries to the canonical normative
  source. Report conflicting duplicates; similarity alone does not justify deletion.
- **Change together:** Reconcile affected instructions, code descriptions, indexes
  and generated outputs alongside the implementation. Retire obsolete active
  guidance under existing authority; archive only useful/required history.
- **Bounded checks:** Native searches/link checks can identify broken references
  and candidate duplicates; semantic review must verify any alleged contradiction.
  No tool can infer owner authority from text similarity. Do not claim global or
  real-time surveillance from an affected-file check.

Protect user work. Do not reorganize unrelated files, erase dirty work or create
per-file metadata bureaucracy. If necessary source access/checking is unavailable,
mark the affected interpretation UNVERIFIED and stop its dependent action; do not
install tools, invent source evidence or silently broaden access.
