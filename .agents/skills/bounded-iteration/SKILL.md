---
name: bounded-iteration
description: "Own authorized work end to end through research, implementation, evidence-based evaluation, and correction until ready for user acceptance. Use for 'work until done', 'don't ask until complete', or repeated implement-verify loops. Defaults to autonomous delivery with no total turn/time cap; bounds scope, resources, individual jobs, and unsafe actions. Supports collaborative/HITL modes and unattended AFK execution only with verified isolation and resumable state."
---

# Bounded Iteration

**Own the result, not the user's calendar.** Research → decide → build → evaluate → correct → deliver for human user acceptance. Bounds protect resources, scope, and safety; they are not an arbitrary number of turns before handing unfinished work back.

This is an **evaluator–optimizer** loop. The optimizer proposes changes; evaluators score against declared outcome-linked criteria. A machine pass alone is not product readiness, and reviewer agreement alone is not proof.

## Mode and authority — before starting

Load [Delivery Ownership](../../rules/delivery-ownership.md) and apply it as the authority source.

- **Autonomous delivery (default):** the primary owns in-scope research, product/technical choices, contracts, implementation, verification, and release readiness. Communicate useful decisions through product docs; the user is the final acceptance gate.
- **Collaborative:** discuss choices with the user where requested.
- **Approval-gated / HITL:** pause at the agreed checkpoints, including one iteration at a time if requested.
- **AFK execution:** an unattended variant, not a separate permission grant. Requires a known outcome, verified isolation/bounds, persistent state, cancellation, and cleanup.

State the mode and boundaries briefly; ask upfront only about missing outcome/authority/safety constraints. Do not ask the user to decide researchable implementation details. Honor their explicit mode without reconfirmation.

No default **total iteration or elapsed-time limit**. Optional `MAX_ITER`, `MAX_ELAPSED_SEC`, and `MAX_COST` apply only when specified/authorized; unset means no configured aggregate cap, not infinite resources. Individual jobs still need enforced watchdogs and resource limits. Never bypass harness limits or infer unlimited spending.

## Appropriate uses

| Request | Approach |
|---|---|
| Repeated edits with machine-verifiable outcomes | Use the loop with positive-proof checks. |
| Feature/product ownership with open technical choices | Research/design through domain skills first, then bounded slices and user-perspective release evaluation. |
| UX or subjective readiness | Add `reviewer` with a declared rubric; require relevant observable journeys and independent review (different agent/subagent instance). When perspectives ambiguous, identify candidate roles and consult independent reviewers rather than skipping. |
| Auth, security, data, or compatibility-sensitive work | Add warranted specialist review and verified containment; human-only approvals remain human-only. |
| Research-only or active design dialogue | Use the matching research/design skill; do not infer implementation authority. |
| Unsafe actions, missing action authority, impossible containment | Stop affected work, preserve evidence/checkpoint, report the actual boundary. |

## Working package

Use a dedicated task/memory directory, not consumer `docs/`. Full automation uses:

| File | Purpose |
|---|---|
| `TASK.md` | Outcome, ownership, scope, bounds, research/decision authority, evaluator criteria, release gate, stops |
| `PROMPT.md` | Stable per-slice instructions and return contract |
| `verify.sh` | Machine gate: 0 PASS / 2 retryable candidate failure / 3 broken verifier / 4 not machine-verifiable |
| `progress.txt` | Compact iteration decisions/evidence; no raw transcripts |
| `.ralph-state.json` | Required for autonomous repeated/AFK execution: resume, fingerprints, checkpoint, budget usage, review/release status |
| `.ralph-verify.json` | Latest machine proof; never equivalent to final release approval |

For a short manually driven loop, equivalent fields in existing task context are enough; do not scaffold six files for a small patch. Durable checkpoints are needed before context loss. Human usage/decisions belong in product docs/README, not these execution files.

Templates: [TASK](references/templates/TASK.md), [PROMPT](references/templates/PROMPT.md), [machine verifier](references/templates/verify.sh). Load [Procedure](references/procedure.md) before building a verifier/controller/state or starting AFK. Controller guidance: [Loop patterns](references/loop-patterns.md). Delegated work: [Integration](references/swarm-integration.md).

## Loop and release

1. Capture the requested outcome and bounds; preserve the original user request/feedback immutably in task context or a task/memory file (e.g. `.ralph-original-request.txt`) before reframing. Keep exact wording except secrets, credentials, and sensitive personal data; replace those values with explicit redaction markers before storage or reviewer handoff. Redaction must not change the requested outcome or permissions. Separate user requirements from agent-owned choices.
2. Research consequential unknowns; record sources, alternatives, rationale, risks, and validation. Approve the in-scope contract before implementers start.
3. Declare acceptance/evaluator criteria **before** the slice. In autonomous delivery, the primary approves and records agent-owned criteria without routine user sign-off. Seek user confirmation only for unresolved outcome/authority/safety constraints or explicitly human-reserved approvals; honor agreed collaborative/approval-gated checkpoints. Substantial work alone does not require user confirmation. Version necessary in-scope corrections; do not weaken requirements to pass.
4. Implement one bounded slice; run genuine machine/integration/E2E checks in the authorized sandbox and independent user-perspective reviews where required (via `subagent-dispatch`/`reviewer`, using different agent/subagent instances than the primary and any implementers of the slice under review; one instance = one perspective, simulated panels not independent). When reviewer perspectives are ambiguous, identify candidates and consult at least one independent generalist reviewer by default (do not skip); only use `STOP_INPUT_AMBIGUOUS` if specialized judgment is materially required and no qualified reviewer is identifiable.
5. Classify evidence as PASS / FAIL / UNVERIFIED. Only retry grounded candidate failures. Diagnose broken verification or missing evidence before more optimizer changes.
6. On repeated/alternating failures, interrupt unchanged retries, diagnose, and choose a supported different approach. Escalate only if no safe authorized path remains.
7. Release only when required evidence and independent reviews pass on the current artifact, docs are usable, and resources/scratch are cleaned up. Return an inspectable product, usage guide, acceptance steps, and honest limitations.
8. Mark **ready for user acceptance**, not user accepted. Feedback opens another scoped loop.

Default `REQUIRED_SUCCESS_STREAK=1`; use 2 or more for known flaky checks. Stable machine proof does not waive release checks. Multi-perspective reviewers assess first use, daily use, failure/recovery, goal alignment/original intent (compare against original user request/feedback to detect drift/hallucination), and relevant safety/operations; they do not approve by majority vote. **Independent review requires a different agent/subagent instance** (via `subagent-dispatch`/`reviewer`) than primary and any implementers — same-agent self-review is not independent; one instance = one perspective (simulated panels are not independent). For substantial work, a goal-alignment reviewer (independent from primary/implementers) with access to original user request/feedback is required. When reviewer perspectives are ambiguous, identify candidates, check for domain-sensitive/compliance signals (institutional communication, inter-org collaboration, human subjects, pre-publication, data sharing, regulatory, biosafety, export control, legal/financial regulated). If signals present, do not default to generalist-only - seek specialist/compliance review. Consult at least one independent reviewer by default (do not skip). Only use `STOP_INPUT_AMBIGUOUS` if specialized judgment is materially required and no qualified reviewer can be identified. For domain-sensitive prose/regulatory content, generalist review alone is not sufficient without explicit compliance criteria. For user-visible changes affecting onboarding/install/startup/primary journey/docs/errors, prefer first-use UX perspective.

## Stop behavior

Always record a stop reason and resumption state. `STOP_SUCCESS` means ready for user acceptance, never final human acceptance. Genuine blockers must be surfaced, not silently buried in docs.

`STOP_INPUT_AMBIGUOUS`, `STOP_UNSAFE_ACTION`, `STOP_VERIFY_BROKEN`, `STOP_NOT_VERIFIABLE`, `STOP_RESOURCE_BOUNDARY`, `STOP_MAX_ITER`, `STOP_MAX_COST`, `STOP_TIMEOUT`, `STOP_OSCILLATION`, `STOP_CONTEXT_LIMIT`, `STOP_MANUAL_INTERVENTION`.

Aggregate-limit stops apply only to configured limits. A job timeout can lead to safe diagnosis/resumption, never automatic larger budgets. A repeated fingerprint is a diagnosis trigger, not a mandatory user interruption after three tries. Never restore/reset a shared workspace or kill user processes; clean only owned resources.

## Deliverable check

- [ ] Mode, scope, authority, and per-job/resource controls established
- [ ] Consequential choices researched and documented; user not made project manager
- [ ] Outcome-linked evaluator criteria declared before changes
- [ ] Current machine/E2E proof and independent user-perspective release evaluation recorded
- [ ] Usage, limitations, and final user acceptance steps clearly presented
- [ ] Checkpoint and cleanup known; success or explicit blocker reported
