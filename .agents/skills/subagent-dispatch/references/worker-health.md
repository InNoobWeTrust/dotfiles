# Worker Health Supervision

Keep delegated work productive without mistaking silence for failure. This policy applies to owned workers, not arbitrary sessions or user processes. Discover the harness's actual retry hooks, status API, cancellation semantics and notification delivery before relying on them. A documented API in another version is not an installed capability.

## Before launch

- Record the worker identity, role, owning parent, route (including actual upstream provider), bounded job duration, useful progress evidence and stop authority in the existing task record.
- Prefer background execution with verified parent notification when the primary has independent work. A synchronous call blocks the primary: use the runner's enforced deadline or a separately running guard. An inactive or rate-limited primary cannot reason its way out of a blocked call.
- Declare health policy separately from the job deadline. Suggested starting bounds, not platform defaults: at most 3 provider retry decisions or 60 seconds of cumulative proposed retry waiting per failing request, whichever is reached first. Reject a proposed delay that alone exhausts the remaining wait budget. Keep a whole-job deadline too; repeated short failures must not bypass it.
- For external CLI delegates, use the delegate runner's bounded wall time and termination receipt. An OpenCode session ID does not control another CLI's process. Never claim a background flag or a checkpoint file is a wake-up.
- Budget the whole turn: startup, model/tool round trips, any authorized internal swarm coordination, and synthesis. Use the runner's documented default for substantive work unless evidence supports another limit; model speed alone does not justify a two-minute cap. Match prompt and outer-call budgets to the enforced deadline. An overly short caller deadline is a scheduling failure, not proof of a broken provider or stuck worker. Keep provider retry-wait limits separate from productive task runtime.
- When periodic inspection is supported and permitted, follow [Periodic Progress Checks](periodic-checks.md): exact target, immediate observation, one owner and one real outstanding wake-up. Respect harness restrictions against proactive polling. Without a supported mechanism, say supervision is limited to enforced runtime bounds.

## Detect evidence, not noise

| Observation | Action |
|---|---|
| Provider retries reach count or projected wait budget | Veto further retries through a verified runtime hook; return terminal failure evidence to the owner. Do not extend the budget just because retries are automatic. |
| Same tool, equivalent arguments, and same result/error occur 3 times without intervening meaningful progress | Suspected doom-loop: inspect the exact calls; stop before repeating the unchanged approach when authorized. Tool name alone is insufficient. Changing timestamps or narration is not substantive progress. |
| Quiet worker, long tool execution, queued job or permission request | Inspect state within scope; no automatic cancellation based on quiet time alone. Surface permission/access blockers instead of bypassing them. |
| Deliberate polling | Require an exact target, interval and deadline; unchanged status is expected. Do not disable provider retry or whole-job bounds to exempt polling. |
| Status/notification access fails | Mark UNKNOWN, preserve the deadline, and report the gap. Do not interpret lost visibility as success or permission to kill unrelated processes. |

Avoid retaining raw prompts, arguments, provider responses or tool output in health logs. Prefer bounded counts, hashes, session IDs, route and sanitized failure categories. A runtime heuristic is a safety net, not proof that two semantically different calls are identical.

## Stop, reconcile, then recover

1. Verify the exact owned target and stop authority. Interrupt only that worker with the documented no-resume behavior. Never delete a session to implement cancellation, interrupt its parent, or kill a user process.
2. Preserve the stop result. A retry veto or session interrupt is not proof that an external tool, deployment or write stopped. Establish quiescence before overlapping replacement work; if uncertain, block the replacement and report why.
3. Capture completed/partial outputs and inspect owned edits. Keep valid work; do not reset the worktree or blindly replay side effects. Append the role checkpoint and retire the old binding before a fresh worker restores the same assignment.
4. Choose a suitable authorized alternative, not a retry chain. For likely shared quota, prefer a different actual provider rather than merely another model name behind the same account. Preserve capability, privacy, permission and spending boundaries; cool down the failing route for this task.
5. Default to one suitable fallback for the same unchanged failure. If it also fails, return a clear blocker or deliberately change the approach with new evidence. This is not a universal limit on useful delivery iterations. Do not switch models or start paid requests merely because a guard fired.
6. Notify the parent with worker ID, sanitized reason, retry count/wait or loop evidence, stop outcome, partial-work location and next safe action. A synthetic context note may not wake a blocked parent; verify the execution tool's failure/completion delivery too. Report unverified wake-up behavior honestly.

Ordinary read-only monitoring never grants cancellation or resubmission authority. The worker contract must explicitly authorize health stops, within the user's task scope. A guard must continue to enforce limits while the primary is blocked, but must not independently invent replacement tasks.

## Prototype audit

After the first 1–2 real uses, check false positives, actual parent notification, retry-budget enforcement and partial-work recovery. Offline injected-event checks establish policy behavior, not live provider efficacy. Record observed gaps in the task checkpoint before tuning limits.
