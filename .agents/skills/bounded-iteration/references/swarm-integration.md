# Delegated research, building, and release evaluation

Use [Subagent Dispatch](../../subagent-dispatch/SKILL.md) before every worker launch. Native workers are sufficient; a Full Swarm is optional when explicitly selected/warranted, not a prerequisite for autonomous ownership.

## Division of responsibility

The primary owns the outcome, decision authority, bounded contracts, integration, evidence, and handoff. Delegate checkable slices, not the entire goal without constraints. Workers receive accessible instructions/skill-discovery pointers, not an assumption that they inherited the parent conversation.

| Work | Worker contract | Primary action |
|---|---|---|
| Research | Bounded question, permitted sources/network, evidence and uncertainty; no edits | Compare evidence, decide in-scope choices, document consequential rationale |
| Implementation | One approved slice, exact contracts/files, existing domain verification requirements | Integrate and verify; reapprove contract defects before redispatch |
| Execution/E2E | Fixed checks/journeys, authorized isolated environment and resource controls | Validate receipts; do not let the executor silently alter assertions |
| Independent review | One distinct perspective (different agent/subagent instance than primary and implementers), declared rubric, current artifact/evidence; read-only. One instance = one perspective; simulated panels not independent. For substantial work, include goal-alignment reviewer with original request/feedback. If perspectives ambiguous, identify candidates and consult independent generalist reviewer by default - do not skip; only STOP_INPUT_AMBIGUOUS if specialized judgment materially required and no qualified reviewer identifiable. | Challenge findings, resolve blockers, recheck changed surface |

Use concurrency only for independent work, with explicit limits. Serialize overlapping writes and dependent tasks. Bound every worker's actions; no nested delegation unless separately authorized and controlled. Commands still need the sandbox and per-job execution envelope.

## Research-to-build handoff

Keep outcome/invariants fixed while choices are being investigated. The primary records a decision with source/experiment evidence, concrete contract, authority, risks, and validation. For substantial implementation, reference the approved active phase file and scoped file tree required by domain governance. A worker finding an unworkable contract returns `INCOMPLETE: CONTRACT_DEFECT`; the primary revises inside authority or stops only the affected boundary.

Product-facing decision notes go in product docs; execution packets/checkpoints/consensus go in task memory. Do not expose full worker transcripts or ask the user to become integrator.

## Evaluator-to-optimizer handoff

Before iteration, declare artifact/contract revision, user journeys, machine proof, reviewer rubric, and PASS/FAIL/UNVERIFIED mapping in `TASK.md`. Independent reviewers receive these and current receipts. Use distinct first-use/UX, failure/recovery/operations, and relevant safety/compatibility perspectives for substantial release; focus small work proportionately.

- Machine PASS is necessary for machine-required criteria, not sufficient for release.
- Reviewer PASS needs criterion-linked evidence. Agreement without evidence, unavailable E2E, and unexamined user journeys remain UNVERIFIED.
- FAIL returns the specific requirement, observed failure, and bounded correction—not a new wishlist. Apply the authority-based retry/stop test in [Release evaluation](procedure.md#7-release-evaluation): concern labels alone do not forbid evidenced, authorized technical corrections; unresolved authority/safety boundaries require STOP_MANUAL_INTERVENTION.
- UNVERIFIED requires missing evidence or an honest blocker. It cannot be relabeled PASS by a vote.
- Independent challenge follows `subagent-dispatch`/`reviewer` using different agent/subagent instances than the primary and any implementers (same-agent self-review is not independent; one instance = one perspective; simulated panels not independent). After fixes, recheck affected criteria/current artifact. No endless cosmetic panel cycles.

## If Full Swarm is selected

Load `../../swarm-intelligence/SKILL.md` and its required references. Its own challenge/design/security gates remain binding; this integration does not waive them. External nodes remain read-only where their contract requires it; the primary alone applies approved patch suggestions. For Swarminator artifact extraction use returned `files[]` and each artifact's **`code`** field, not a guessed `content` field.

Record a compact decision/evidence handoff to bounded execution rather than copying a second loop/controller into swarm docs. The same release rubric, per-job bounds, state freshness, and user acceptance boundary apply regardless of the chosen worker transport.
