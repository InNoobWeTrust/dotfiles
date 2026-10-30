# Controller patterns

This is controller **pseudocode**, not a runnable shell loop. Build an adapter for the actual harness; do not paste naked CLI commands into a shared workspace. See [Procedure](procedure.md) for verifier/state semantics and containment.

## Progress-based loop breaker

Use across delegated correction/review exchanges and self-revisions. Track the
same unresolved outcome, not individual agents or tool calls. Inputs are the
original requirement, attempted approaches, evaluations and existing task history;
output is a recorded continuation, bounded diagnostic/recovery attempt, or stop.

Keep a compact record in the existing task checkpoint:
`outcome | approach | attempt count | recurring blocker | verified progress | next discriminating check`.
Retain both the consecutive no-progress count and cumulative correction/review
round count for that outcome. One attempt is a substantive correction followed by
evaluation, not each tool call. A substantive design revision also counts when no
evaluation follows; lack of verification must not hide churn. Evaluation of that
revision completes the same attempt, rather than counting it twice.

**Progress means evidence:** a required behavior now works, a blocking finding is
resolved without reopening another, or a concrete check eliminates a relevant
hypothesis. More patches, longer documents, changed wording, reviewer agreement
and fresh agent sessions are not progress. Record evidence against the affected
outcome; unrelated improvements do not clear its no-progress count.

**Interrupt the approach when:**
- Three consecutive attempts produce no verified progress on that outcome.
- A correction reintroduces a previously resolved blocker or the design alternates
  between previously rejected states.
- Five substantive correction/review rounds accumulate on the same unresolved
  outcome, even if individual rounds claim small improvements.

These are initial reassessment heuristics, not proof of faulty architecture or a
total task limit. Do not wait for them when evidence already contradicts the
chosen approach. Productive work on distinct outcomes is not one stalled loop.

**At interruption:**
1. Pause further patches and redispatches for the affected outcome; preserve valid work.
2. Reconcile the original requirement with attempted approaches and observed
   failures. Consider a wrong architectural assumption, conflicting requirements,
   a faulty evaluator, missing evidence, or an environment problem.
3. Identify a falsifiable explanation and the smallest check that distinguishes it
   from alternatives. “Try harder,” another reviewer, or another patch is not a
   changed approach. If required evidence or diagnostic capability is unavailable,
   report the gap rather than treating it as evidence for a redesign.
4. Resume only with recorded evidence, an authorized correction or revised approach,
   and a bounded next attempt with an expected observable result. If no supported
   path exists, report `STOP_OSCILLATION` with the blocker and decision needed.

Worker replacement, context compaction, renamed findings and cosmetic redesigns
must not reset history. Record recovery attempts against the same outcome; a
failed recovery must not silently start another retry cycle. At or beyond a
trigger, continuation requires the recovery receipt above, not a reset counter.
Unknown history is unknown—not zero; recover available evidence before claiming
a fresh attempt budget. Missing required history/evidence blocks unsupported retry.

Examples: three revisions retaining the same contract conflict trigger diagnosis;
an A→B→A design reversal triggers it earlier; five rounds with small improvements
but an unresolved outcome still require reassessment. A check that rules out a
suspected cause is progress but does not erase cumulative rounds. Five completed,
distinct outcomes are not a five-round failure. An unavailable evaluator yields
an evidence gap, not permission to keep patching or declare the architecture wrong.

This is prompt guidance, not runtime enforcement. After the first 1–2 real uses,
record false positives, missed loops and recovery outcomes in the existing task
record before proposing threshold changes; source walkthroughs do not prove efficacy.

## Unlimited aggregate iterations, bounded jobs

```text
load TASK, PROMPT, persisted state
revalidate authority, workspace ownership, contract, available controls
limits = configured total iteration/time/cost caps, else null

while useful safe work remains:
    enforce explicit aggregate caps and actual resource/permission boundaries
    restore outcome attempt counts, failure history and any recovery receipt
    before patching or redispatch: enforce progress-based loop breaker
    select one bounded job with watchdog, cancellation, scope, cleanup
    run via authorized sandbox/native worker tools
    on cancellation or containment loss:
        cancel owned jobs; observe cleanup; checkpoint; stop with exact reason

    validate current evaluator receipt (run + contract + artifact identity)
    if broken/missing/stale: pause optimizer; diagnose verifier
    if UNVERIFIED: obtain predeclared independent evidence, never assume PASS
    if candidate FAIL: record fingerprint; choose grounded correction
    update outcome attempt counts and evidence of progress (including self-revisions)
    if loop-breaker trigger: pause affected approach; diagnose; require recovery receipt
    if machine PASS: evaluate outstanding user-perspective release criteria

    atomically persist state, proof references, decision and next safe action
    if release criteria all PASS and owned resources cleaned:
        verify machine gate PASS from .ralph-verify.json AND all required reviewer verdicts PASS in .ralph-state.json reviewers[] with current evidence against artifact_identity
        mark ready_for_user_acceptance; user_acceptance = pending
        deliver usage + proof + acceptance journey; STOP_SUCCESS
    if approval-gated checkpoint: checkpoint and return for requested approval
    if no safe authorized path: checkpoint; report exact blocker; stop
```

## Required adapter behavior

- Run one supervisor per task; prevent concurrent owners/overlapping writes. Persist ownership and detect stale leases safely before resuming.
- Distinguish job timeout, cancellation, tool/configuration failure, known candidate failure, and actual aggregate-cap exhaustion. A nonzero CLI exit is not automatically TIMEOUT.
- Enforce watchdogs through the available executor; do not assume GNU `timeout` exists or a shell trap controls escaped process trees. Sandbox controls and ownership-scoped cleanup are prerequisites.
- Invalidate previous release/reviewer proof after relevant artifact or contract changes. Build the evidence freshness binding outside the generic verifier template.
- Never treat an unset total cap as zero, or insert a hidden default of 10 iterations/900 seconds for total delivery. Select **individual job** watchdogs explicitly from workload needs and existing authorized limits.
- No total iteration cap does not permit a stalled approach to continue. Apply the
  progress-based loop breaker independently of total caps and per-job deadlines.
- Observe available cost/quota signals; unknown is not zero. Do not infer permission to buy capacity. Optional caps are additional restrictions, not replacements for real limits.
- Checkpoint before context loss/disconnect; resumption requires current permissions, exclusive ownership, and verified cleanup/control state.
- Cleanup only owned resources; no shared-workspace reset or broad process killing. Do not claim AFK lifecycle guarantees an adapter has not tested.

## Stop mapping

| Observation | Handling |
|---|---|
| All release gates PASS; final human acceptance pending | `STOP_SUCCESS` |
| Missing user-only outcome or authority | `STOP_INPUT_AMBIGUOUS` / `STOP_MANUAL_INTERVENTION` |
| Unsafe action or lost containment | `STOP_UNSAFE_ACTION` |
| Broken evaluator without a safe authorized repair | `STOP_VERIFY_BROKEN` |
| Required criterion cannot be evidenced | `STOP_NOT_VERIFIABLE` |
| Actual quota/resource boundary | `STOP_RESOURCE_BOUNDARY` |
| Configured aggregate iteration/cost limit exhausted | `STOP_MAX_ITER` / `STOP_MAX_COST` |
| Configured total deadline, or job timeout blocking further progress | `STOP_TIMEOUT` with the exact cause |
| No supported alternative after repeated failures | `STOP_OSCILLATION` |
| Safe continuation cannot survive context loss | `STOP_CONTEXT_LIMIT` |

Read-only/native-only reviewers do not need fabricated OS-process bounds. Any worker that runs commands must receive the appropriate verified execution envelope. Human feedback is a new loop; never synthesize a user's acceptance from your state file.
