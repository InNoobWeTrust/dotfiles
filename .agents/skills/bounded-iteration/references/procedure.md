# Procedure: autonomous ownership with bounded execution

Read before implementing a controller, verifier, or state, and before AFK execution. Authority comes from [Delivery Ownership](../../../rules/delivery-ownership.md); process containment from [Autonomy Safety](../../../rules/autonomy-safety.md) and [Execution Safety](../../../rules/execution-safety.md).

## 1. Frame the outcome, not every technical choice

Choose autonomous, collaborative, or approval-gated ownership upfront. Record separately whether execution is attended or AFK. A clear implementation request authorizes in-scope reversible work; a research/design question does not. AFK may start only when workspace ownership/isolation, cancellation, cleanup, action permissions, and enforceable per-job/resource controls are verified.

Preserve the original user request/feedback immutably in task context or a task/memory file (e.g. `.ralph-original-request.txt`) before reframing. Keep exact wording except secrets, credentials, and sensitive personal data; replace those values with explicit redaction markers before storage or reviewer handoff. Redaction must not change the requested outcome or permissions; if a removed value is necessary to judge alignment, report the evidence gap rather than copying it into an artifact or worker prompt. Populate `TASK.md` with outcome, must-ship behavior, non-goals, authority, compatibility, authorized costs/services, writable boundary, resource controls, evaluator criteria, release rubric, and stop conditions. Use a task/memory directory. Product docs contain user-facing decisions and guides, not agent plans/state.

Unresolved technical choices are work to do, not automatically ambiguous input. Investigate them. Unknown goals, sensitive-data permissions, or unsafe external effects are different: stop only the affected boundary and request the minimum user-only fact/approval. Continue independent safe work where useful.

## 2. Research and decide

Explore the repository and current authoritative documentation. Resolve consequential choices with evidence: suitable existing capabilities, options, costs, safety, user journeys, and operational failure modes. Run authorized bounded experiments when reading alone cannot establish behavior. Record sources/versions and uncertainty in decision notes proportionate to maintenance needs.

The primary approves researched contracts/plans within delegated authority before implementation. Domain skills supply design methods and implementation gates. Workers report contract defects; the primary may revise and reapprove them before redispatch. Public compatibility promises, reserved human approvals, scope, or spending cannot be silently changed.

Freeze **user outcome and hard invariants**, not every mistaken implementation idea forever. In autonomous delivery, the primary approves and records agent-owned rubric/acceptance criteria before implementation without routine user sign-off. Seek user confirmation only for unresolved outcome/authority/safety constraints or explicitly human-reserved approvals; honor agreed collaborative/approval-gated checkpoints. Substantial work alone does not require user confirmation. Version evaluator/contract corrections before the next slice, explain evidence for the change, and invalidate affected old proof. Never loosen acceptance because the candidate failed it. If a verifier is defective, repair it as a distinct authorized task and test its positive, negative, and broken-input behavior before trusting it again.

## 3. Define separate machine and release gates

The machine gate evaluates declared observable behavior. Predeclare commands, expected positive proof, failure classifications, environment requirements, and evidence freshness. Test counts must correspond to relevant assertions; an echo of “18 tests passed” is a **verifier test fixture**, not product proof.

| `verify.sh` exit | Meaning | Next action |
|---|---|---|
| 0 | Machine criteria PASS with positive proof | Record streak; still evaluate release rubric |
| 2 | Known retryable **candidate** failure | Optimize the implicated in-scope slice |
| 3 | Verifier/configuration/tool execution broken | Pause optimizer; diagnose or repair verifier within authority |
| 4 | Machine gate cannot establish the declared criterion | Route to the predeclared independent evidence/reviewer gate, or report UNVERIFIED |

Unknown exit codes, missing/malformed/stale summaries, contradictory proof, or a timeout without a trustworthy result are not retryable product failures and never pass. Generic command failure is not sufficient to distinguish a failing product from missing tools, network failure, or broken test infrastructure; project adapters must provide that distinction.

The [template](templates/verify.sh) is intentionally **not ready** by default. Its default proof parser supports “N tests/specs passed”; adapt for your runner's actual structured evidence. Customize candidate-failure exit semantics; zero tests or missing positive proof returns UNVERIFIED, not “fix the product.” Optional extra checks are absent when unconfigured, not fake no-op successes. Invoke the verifier inside the selected sandbox with an external watchdog; it does not provide isolation or timeout enforcement itself.

For subjective criteria, declare artifact, rubric, reviewers, evidence expectations, and result mapping in `TASK.md` before evaluation. A criterion may be reviewer-scored only when the contract says so; a reviewer cannot override a required machine failure or excuse unexecuted E2E. Machine-only result files must not claim release readiness.

## 4. Bound jobs and preserve ownership

No default total `MAX_ITER`, `MAX_ELAPSED_SEC`, or `MAX_COST`; serialize unset values as `null`. If configured, check them before a job and afterward. Observe actual quota/cost where tools expose it; unknown cost is unknown, not zero. Work stops at provider/permission/resource limits even without an aggregate cap.

For each job record sandbox, action scope, watchdog, maximum concurrency, relevant CPU/memory/PID/storage/network limits and evidence that controls are active, cancellation, and cleanup. Choose limits proportionately; do not raise defaults without authorization. If required hard isolation is unavailable, do not call unrestricted execution or pretend prompt limits are containment. Native read-only review can stay process-free with bounded scope, concurrency, and cancellation.

Prefer an isolated worktree/container for AFK. A worktree separates files, **not** host processes/secrets; combine it with the required sandbox. Record baseline changes and ownership. If a shared workspace cannot supply exclusive writable ownership, restrict it to attended scoped edits or read-only work. Never reset someone else's work.

Use agent-owned names/labels for services and resources. Every start needs a cleanup route and an owner/lifecycle record; lost containment or unknown resource ownership is a stop, not permission to kill broadly. Follow harness process-management rules. Catch cancellation/termination, stop owned children/services, checkpoint, and release owned resources. Do not claim cleanup complete until observed.

## 5. One useful iteration

1. Validate authority, contract revision, resource availability, and state on resume.
2. Select the next bounded research/implementation/repair/evaluation slice.
3. Dispatch bounded tasks through `subagent-dispatch`; serialize dependent tasks and overlapping writes. Record returned evidence, not raw transcripts.
4. Run the applicable evaluator against the **current artifact**; save proof atomically. Associate state with contract revision and an artifact digest/precise changed-file revision, check IDs, observed environment, and evidence receipts. The controller—not the generic template—binds these fields and validates freshness.
5. Classify PASS/FAIL/UNVERIFIED and update state/progress/checkpoint. No evidence does not mean no errors.
6. Use feedback to KEEP, ADJUST, ADVANCE, or STOP. Renew a targeted review round only for an evidence-backed revised approach; keep the outcome and hard invariants fixed.

HITL pauses at agreed checkpoints. Autonomous delivery proceeds with safe in-scope choices without asking; AFK writes durable state. A job timeout ends that job, then permits safe diagnosis; it does not create a global deadline or authorize larger resource budgets.

## 6. Repetition and context loss

Track normalized failure fingerprints and attempted remedies. Three unchanged fingerprints or alternating failures are a diagnostic alarm: pause blind optimization and use `systematic-investigation`/independent challenge. Compare causes, revise the approach, and resume only if there is a supported new action. Do not endlessly reset the repeat counter or spawn fresh reviewers to dodge the same defect.

When no safe useful alternative remains, emit `STOP_OSCILLATION` with evidence, known-good checkpoint (or explicitly `none`), and next necessary action. Resource exhaustion, missing human-only facts, or irreversible actions use their specific stop codes. Do not label ordinary open design choices unsafe.

Before context exhaustion, persist continuation: objective, authority, invariant/contract revision, current location, changes owned, remaining steps, evidence, active resources, exact next safe action. If continuation cannot preserve this safely, use `STOP_CONTEXT_LIMIT`. A resumed agent revalidates the checkpoint and permissions; a past proof never automatically applies to changed files.

## 7. Release evaluation

Write the rubric before reviewing. If domain-sensitive/compliance signals are present (listed under Perspective ambiguity below), include explicit compliance criteria in the rubric (or justify why none apply). For substantial delivery use independent perspectives relevant to the actual users, with bounded read-only evaluation:

- **First use / everyday UX:** can a new user install/start/use the primary journey from the guide without chat context? Are defaults, terms, errors, and constraints understandable?
- **Failure / recovery / operations:** do cancellation, restart, missing dependencies, degraded environments, cleanup, and ownership behave as promised?
- **Applicable safety / compatibility / accessibility:** are hard boundaries preserved and important user groups considered?
- **Goal alignment / original intent:** compare current artifact and plan against original user request/feedback thread; verify the work remains aligned with the stated goal and hasn't drifted due to assumption creep or hallucination. If off-track, the reviewer must explicitly call this out and reference specific deviations from the original intent.

**Independence requirement:** "Independent" means review by a different agent/subagent instance with a relevant perspective (via `subagent-dispatch` or `reviewer`), not self-review by the same agent. The primary agent must not serve as its own sole independent reviewer. Reviewers must be different instances from the primary and from any implementer(s) of the slice under review. One instance provides one perspective; simulated panels (multiple perspectives emitted by the same agent instance) are not independent. For substantial work (multi-slice features, user-visible behavior changes, or safety/compatibility/security-sensitive work), at least one independent review from a relevant perspective is required regardless of whether declared in rubric. **For substantial work, a goal-alignment/original-intent reviewer (independent from primary/implementers) must be consulted** to detect goal drift/hallucination compounding - this perspective reads the original user request/feedback thread and compares against current state with fresh eyes. For single-file mechanical/cosmetic fixes with no user-visible behavior change and no safety/compat/security impact, independent review may be omitted only if risk is demonstrably negligible; otherwise at least one relevant perspective is required. If any reviewer gate is declared in the rubric, independent review is required for those gates. For user-visible changes, first-use UX is non-skippable (see below).

**Perspective ambiguity:** If you cannot confidently identify which reviewer perspectives are most relevant:
1. Identify candidate reviewer roles based on task type, audience, and potential risks (e.g., domain expert, communication reviewer, compliance/safety, recipient perspective, operations). For user-visible changes affecting onboarding/install/startup/primary journey/docs needed/errors, treat first-use UX as a strong candidate.
2. Check for domain-sensitive/compliance signals in the task/artifact: institutional communication, inter-organizational collaboration, human subjects/research data, pre-publication results, data sharing, regulatory submissions, biosafety, export control, legal commitments, or financial regulated content. If any such signal is present, treat this as requiring potential specialist/compliance review.
3. Explain the ambiguity and reasoning in the task record, including any detected compliance signals.
4. **Default:** for most technical/code work when specialist choice is unclear, consult at least one independent generalist reviewer via `subagent-dispatch`/`reviewer` - **do not skip review**. If domain-sensitive/compliance signals are present, do **not** default to generalist-only; identify appropriate specialist perspectives (compliance/safety/domain expert) and consult them. Only use `STOP_INPUT_AMBIGUOUS` if specialized judgment is materially required (e.g., compliance, security, regulated content, safety-critical decisions) and no qualified reviewer can be identified after documenting candidates and why each was rejected. For domain-sensitive prose (institutional, regulatory, legally binding, or safety-critical content), generalist review alone is not sufficient without explicit compliance criteria in the rubric.

Use actual integration/E2E journeys in the authorized environment where applicable. A source-only review cannot assert executed behavior. Give reviewers the contract, rubric, machine evidence, artifact/diff, environment assumptions, explicit constraints/non-goals, compatibility commitments, and intentional tradeoffs needed to evaluate. For goal-alignment reviewers, use the original request/feedback from an immutable source (e.g. `.ralph-original-request.txt` if present), preserving exact wording except the required redactions in section 1. If no immutable file exists, use the original request/feedback thread with the same redactions before handoff - **do not** rely on the primary's summary or reframed description. Only disclose material authorized for that reviewer/provider; report any resulting evidence gap, never count it as PASS. **Do not** include chain-of-thought, persuasive self-evaluation, approval-seeking framing, internal implementation diary, or prior pass/fail claims. Give reviewers the contract and evidence, not a directive to approve. Resolve findings with evidence and independent challenge through `reviewer`/`subagent-dispatch` (using different agent/subagent instances than the primary and any implementers; one instance = one perspective; simulated panels are not independent); no majority voting. After corrections recheck affected criteria and current evidence, not a fresh unbounded wishlist.

For user-visible changes that affect onboarding, install/startup, primary user journey, docs needed to use the feature, or user-facing errors/recovery, "first-use UX" is a relevant perspective and should be consulted by an independent reviewer. For minor user-visible tweaks (e.g., small copy changes with no behavioral impact), a general independent reviewer is usually sufficient. A reviewer FAIL is retryable only when the finding identifies a specific in-scope correction. Vague findings without a concrete fix in scope produce `STOP_MANUAL_INTERVENTION`, not another optimizer pass. Compliance/safety/legal/regulatory/biosafety findings require `STOP_MANUAL_INTERVENTION` when the correction needs human-reserved approval, crosses an authority/safety boundary, or requires specialist judgment the agent cannot establish. A concern label alone is not a stop condition: specific technical corrections within existing authority remain retryable when the safe correction is evidenced. Uncertain authority is not assumed permission; pause the affected boundary and continue independent safe work.

Release requires all must-ship and non-deferrable criteria PASS, required current machine checks and independent reviews PASS, no required evidence UNVERIFIED, usable guides, and observed cleanup. Record safe deferrals only if they do not contradict the original requirement; a smaller MVP is an internal milestone, not the full requested product.

Unavailable required evaluators/E2E environments produce an honest blocker or explicitly partial handoff, not `STOP_SUCCESS`. A fallback environment can suffice only if it actually establishes the same criterion. User-owned taste and access-dependent final acceptance remain user-owned; do all independently executable preparation first.

## 8. State and handoff

Persist `.ralph-state.json` atomically with:

- schema version, task ID, mode, execution mode, iteration and current phase;
- contract revision and current artifact identifier;
- optional aggregate limits, observed resource/cost usage and unknowns;
- per-job controls/receipts and owned active resources;
- streak, failure fingerprints/remedies, checkpoint, evidence paths;
- reviewer verdicts (best-effort: reviewer instance/worker ID when harness provides it, perspective/role, artifact digest when verifiable, evidence) and evidence freshness;
- `release_status`: working / blocked / ready_for_user_acceptance;
- `user_acceptance`: pending / accepted / changes_requested, changed only from actual user feedback;
- stop code and continuation on stop.

Write `.ralph-verify.json` with machine status, retryable flag, executed check evidence, fingerprint, and notes. The controller associates it with the current contract/artifact/run; no stale-output reuse. Keep proof paths portable and logs redacted; do not store secrets. See [state example](examples/ralph-state.json).

On delivery, emit `STOP_SUCCESS` only for ready-for-user-acceptance. Supply artifact location, startup/usage instructions, concrete acceptance journey, relevant proof, limitations, and links to useful deeper decisions. Do not commit/push/deploy merely because the release gate passed. User feedback creates a versioned follow-up loop within its new scope.

## Interface/prototype checkpoint

Lifecycle: **Prototype**, revised 2026-10-09. Source/verifier checks do not prove a harness can persist AFK execution across disconnects. Validate on the first 1–2 real deliveries: mode respected; technical choices resolved without unnecessary user stops; bounded jobs canceled/cleaned; current multi-perspective evidence obtained; handoff understandable; feedback resumes safely.

ACI result: **PASS for the source interface; operational adoption UNVERIFIED**. Independent source reviews and controlled guidance-interpretation scenarios support the contract, not real-delivery or AFK lifecycle guarantees.

Main risks: autonomy mistaken for permission, unbounded processes/spending, rubric weakening, reviewer groupthink, stale evidence, and unreadable documentation. Interface controls: explicit decision owner, separate unattended readiness, null aggregate caps, fail-closed verifier template, independent release gate, freshness binding, checkpoint/cleanup, and final human acceptance.
