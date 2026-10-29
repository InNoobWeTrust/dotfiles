---
metadata:
  prototype: "2026-10-28"
  review-after: "1–2 real uses"
  maintenance-review: "Prototype; assess utility/overhead after 1–2 real uses."
---

# Cold-reader techniques

**Purpose:** test whether an artifact and its authoritative sources communicate the intended contract without the author's conversation. Use within an already assigned review, proportionately; this is a borrowed Goldfish technique, not the upstream plugin's full protocol.

**Inputs:** original cumulative requirements, target/revision, approved decisions and referenced sources, review scope, allowed actions and acceptance evidence. **Output:** a brief source-linked provisional judgment and gaps in the existing response/checkpoint, not a new report ladder. Apply [source-first review](core-review.md) and [calibration](calibration.md) when changing reviewer behavior.

## Establish the cold read

- **Check freshness:** use an independently launched fresh context with evidence that author conversation and prior answers were not inherited; native children and external one-turn workers are alternatives, not automatic equivalents. Do not fork/resume a reviewer or treat another harness/new ID as proof. Record the actual route, context/tool limits and unknowns; if freshness is unavailable, report the cold pass `UNVERIFIED` rather than imitate it in the author context.
- **Keep sources:** read original requirements, target and authoritative references before author verdicts or earlier findings. Relevant approved design rationale is a source, not forbidden context; gold answers and the author's completion narrative are deferred. Verify actual source access, not just supplied links.
- **Preserve controls:** mandatory safety, discovery, identity/task/plan restoration and checkpoints still apply. Required review records must be genuinely neutral before launch; never selectively ignore mandatory records. If history, checkpoints or inputs expose earlier conclusions, disclose contamination; a required cold check needs a fresh instance and corrected records, not a claimed reset.
- **Stop precisely:** missing required source, leaked answer, unavailable freshness, unauthorized action or unmet required isolation blocks the affected judgment. Return source-backed partial observations and `UNVERIFIED`/`INCOMPLETE` with the exact gap. Fresh conversation is not tool/memory/filesystem confinement; a read-only prompt is not enforcement. Do not seek broader permissions to finish a review.

## Choose only the technique the assignment needs

### Explainback for implementation-ready artifacts

Before listing findings or seeing the author's verdict, reconstruct in plain language:

- **Outcome and boundary:** who uses it, intended observable result, included work and explicit exclusions.
- **Contracts:** relevant inputs/outputs, defaults, errors, externally visible effects, compatibility and recovery obligations, with source locations.
- **Decisions:** unresolved consequential choices that would force an implementer to invent behavior; distinguish them from intentionally discretionary helpers, syntax or internal organization.
- **Evidence:** what the supplied sources establish, what required evidence is unavailable, and what execution has not been verified.

Compare that reconstruction against the original requirements and target. Report only scoped, consequential omissions or contradictions under the existing finding schema; unfamiliar wording alone is not a defect if its definition/reference is available. Do not impose implementation-complete detail on exploratory research or governance that deliberately delegates judgment.

### Optional approved-contract drift check

For an explicitly assigned audit, select only affected approved claims and compare their current authoritative versions with relevant implementation, tests and observed behavior. For a changeset, retain the changed-root-cause and affected-consumer boundary; do not inventory unrelated legacy differences.

| Classification | Treatment |
|---|---|
| Approved evolution | A later authorized decision supersedes the old claim; cite both, do not report the approved change as a defect. |
| Accidental divergence | Current implementation/observation contradicts an active approved claim; cite the consequential mismatch. |
| Unknown | Authority, source or behavioral evidence is missing/ambiguous; mark affected claim `UNVERIFIED`, not assumed compliance or defect. |

Matching tests do not authorize a changed contract. Internal details outside approved claims are not automatically drift; report differences only, no auto-fix or new governance audit. This technique is optional and can be deferred without adding a universal gate.

## Close the existing review

Record source coverage/revisions, freshness evidence, actual reads, unavoidable exposure and action-scope compliance with the provisional result before optional author reconciliation. Read the author's explanation only afterward, if useful, and resolve disagreements against originals; do not let the explanation rewrite the rubric. Preserve existing findings format, severity, independent review, budget and acceptance rules; zero findings or exhausted budget is not owner approval.

Source checks and synthetic cases do not demonstrate production efficacy or harness isolation; changed reviewer behavior must not justify reduced scrutiny without calibration.
