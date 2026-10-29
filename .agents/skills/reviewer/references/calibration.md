---
metadata:
  prototype: "2026-10-23"
---

# Calibrate the reviewer, not just the product

Use before relying on a new/changed automated reviewer or relaxing checks because
of its judgments. Inputs: original acceptance/authority constraints, representative
clean and defective artifacts, authorized capabilities and a fixed evaluation scope.
Output: actual case judgments, independent grading, noise/missed-defect/effort limits
in the existing audit record. No production-review ceremony or new service required.

## Run a bounded comparison

1. **Freeze:** Keep inputs, available tools, acceptance criteria and per-job budgets
   comparable for current and revised guidance. Include a legitimate clean change,
   consequential defect, stale-source conflict and missing-verification case. Do
   not redefine the expected judgment after seeing a reviewer's answer.
2. **Separate:** Supply requirements, artifact and raw evidence before the author's
   completion narrative when possible. Give the reviewer selected input rows only,
   not gold verdicts, prior answers or the grader file. Disclose unavoidable exposure.
3. **Observe:** Actually execute bounded review assignments. Preserve what was read,
   case decisions and unavailable capabilities. A source walkthrough, synthetic
   desk exercise and live product check are different kinds of evidence.
4. **Grade independently:** A separate non-author checks against the frozen sources.
   Record false acceptance of consequential defects, invented/harmful changes to
   clean cases, unjustified blocking, important misses and actual verification effort.
   A finding is useful only after source verification, not because reviewers agree.
5. **Decide within authority:** Missing calibration or a consequential miss blocks
   a proposed relaxation, not unrelated safe work. Repair the evidenced weakness
   and recheck affected cases; retain null results. Do not claim benefit from a
   longer answer or a repeated case the baseline already handled correctly.

## Starter assets and their limits

The bundle includes [synthetic inputs](../assets/assurance-cases.csv). A coordinator
can select rows and give only those inputs to a fresh reviewer. The independent
grader alone receives [expected judgments](../assets/assurance-gold.csv); it must
also reconcile the case facts rather than trusting a label. These public synthetic
cases are examples, not secure holdouts, production incidents or a certified score.
Use unseen authorized cases before claiming generalization; never assert blinding
if the reviewer accessed the grader resource or earlier answers.

Grow a project-specific corpus from confirmed incidents, fix-forward/revert evidence
and verified false positives only with permission and suitable privacy scope.
Known-clean cases detect changes the reviewer might incorrectly provoke. Track
resolved-as-wrong, intentional, unimportant and fixed outcomes separately; unmarked
comments are not proven correct. Schedule recurring evaluations only under actual
job authority, resources and a real wake-up mechanism—not prose saying “daily.”

**Prototype.** Synthetic checks establish only case behavior. Field
benefit requires owner review+repair time, rework/escaped failures and noise measured
over real deliveries. Calibration never grants approval, merge or deployment rights.
