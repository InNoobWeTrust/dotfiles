# Periodic Progress Checks

Use when asked to “check periodically,” “monitor this job,” “check again in a minute,” or “remind me to check.” Applies to multiplexer workloads and distributed queues such as Slurm. Monitoring observes work; it does not authorize cancelling, resubmitting, or changing it.

**Periodic checks are scheduled work, not something to remember.** Use ordinary `sleep` and existing status tools; no custom scheduler is required.

## 1. Establish the monitoring contract

- Identify the exact target: session/pane or scheduler job ID, host/cluster, and absolute log paths where relevant. Supply concrete read-only status commands and completion evidence.
- Set the interval and endpoint: completion/failure, a user deadline, or an agreed monitoring window. If no interval was supplied, state a reasonable default; resolve an unclear target or endpoint before promising monitoring.
- Name one owner responsible for consuming results and scheduling the next check. In a team, record owner, target, interval, endpoint, last observation, outstanding timer identifier, and next check due in the existing task checkpoint; do not create a separate planning system.
- Check once immediately. If already finished, report the outcome without arming a timer.

## 2. Choose a wake-up mechanism and arm it

| Situation | Mechanism |
|---|---|
| No other work to continue, or asynchronous notification unavailable | Run a bounded sandboxed `sleep`, inspect status, and repeat within the monitoring contract. The current turn waits. |
| Other work to continue and background completion notifies the parent | Dispatch one background timer worker: sleep once, execute the supplied read-only check, return a receipt, and exit. Arm it **before** returning to other work. |
| Parent cannot stay active and no verified resume mechanism exists | Report that autonomous monitoring is unavailable; checkpoint the next action. Do not claim a timer is active. |

Discover actual tool capabilities. A background flag, detached process, tmux session, external worker, or file update alone does not prove the parent receives a wake-up. Prefer a verified lightweight delayed notification when available; a bounded timer worker is a simple fallback, not a requirement to build infrastructure.

Follow [Subagent Dispatch](../SKILL.md) and its worker contract for delegated launches, and [Execution Safety](../../../rules/execution-safety.md) for every command. Background timers are not permission to move the actual workload out of its multiplexer or queue.

**Bounds:** at most one outstanding timer per target; bound total monitoring concurrency and individual worker/command duration under existing resource policies. A timeout must cover the sleep **plus** status-query and launch overhead. If the interval exceeds an available execution budget, use bounded synchronous wait chunks or a verified permitted delay mechanism; do not silently raise budgets. Timer workers must not recurse, launch replacements, or run an indefinite loop.

## 3. Consume, report, and rearm

On completion notification, the owner consumes the receipt before continuing unrelated work:

1. Confirm the target and observation time; ignore superseded receipts and never create duplicate timers. Record delay when a check was handled late.
2. Inspect state and progress evidence. Report meaningful progress, completion, failure, or an access/check error; unchanged output need not generate noisy user updates.
3. If still active and within scope, arm exactly one next timer **before** continuing other work. Rearm after each check: this is approximate cadence, not an exact wall-clock schedule.
4. On completion, failure, cancellation, endpoint, or lost monitoring access, stop rearming and report the last observation and reason. Cancel only an owned timer using supported controls; stopping monitoring must not cancel the workload. If cancellation is unavailable, let the bounded timer expire and ignore its stale receipt.

Checkpoints aid recovery, but do not wake an inactive agent. On session restoration, verify the target and whether any timer remains active before rearming. Never promise monitoring survives shutdown, disconnection, or restart without a verified mechanism.

## Evidence and failure semantics

- **Multiplexers:** a live session is not progress; a missing session is not proof of success. Inspect a bounded log tail and the command's recorded exit status or expected output. Do not attach to, send input to, or alter user-owned sessions.
- **Slurm:** query the exact job with `squeue`; use `sacct` for terminal state and exit status when available. Disappearance from `squeue` is not proof of success. Missing/delayed accounting, query failure, and unavailable credentials are unknowns, not successful completion. Respect cluster polling limits; do not submit timer jobs to the HPC queue merely to implement a delay.
- No log change may mean queued, quiet, or stalled work. Report the evidence; do not label it stalled without an agreed criterion. Redact secrets and bound output.
- Receipt: target, observation time, state (`ACTIVE`, `SUCCEEDED`, `FAILED`, or `UNKNOWN`), progress evidence, query errors, and whether another check is needed. Preserve command failure details rather than returning an unexplained pass/fail.

## Example: single background check

Supply the actual authorized environment and resolved commands when dispatching:

```text
Owner: primary. Target: Slurm job 12345 on the approved cluster.
Wait 60 seconds using a sandboxed shell command, then run:
  squeue -j 12345 -h -o '%i %T %M %R'
If absent, query accounting:
  sacct -j 12345 --format=JobID,State,ExitCode --noheader
Return target, observation time, state, progress evidence, query errors,
and whether another check is needed. Missing accounting means UNKNOWN.
READ/RUN only: the supplied commands in the authorized environment.
No writes, cancellation, resubmission, repairs, or child agents.
Exit after this one check. Use a timeout covering wait and query overhead
within existing budgets; report a blocker if that is not possible.
```

The parent launches this assignment with a supported background-notification mechanism, consumes the result, and decides whether to dispatch the next check. A synchronous external delegate is not automatically an asynchronous timer.

## ACI Pass

- Result: PASS WITH GAPS — instruction contract checked; harness-specific wake-up and live cluster behavior require runtime verification before promising monitoring.
- Main risks: forgotten rearming, duplicate timers, unsupported wake-ups, timeout shorter than wait, and confusing liveness with success.
- Interface upgrades: explicit owner/target/endpoint, one-shot worker, bounded receipt, read-only actions, rearm-before-continuing, and honest interruption handling.
