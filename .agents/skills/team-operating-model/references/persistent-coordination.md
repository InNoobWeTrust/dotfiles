# Persistent Team Coordination

Apply this path whenever this skill is active: a real team always has multiple
contributors. Also use it when a bound role is resumed/replaced or accepted-task
consolidation is routed. No solo or simulated-team exception is available.

## Roles and session binding

Two orthogonal identities coexist and must not be conflated:

- **Runtime capability (local):** main (delegation available and permitted) or worker (execute directly). Determined per harness instance; bridge changes never widen authority.
- **Permanent job role:** a stable scope within a specific task, persisting across all sessions assigned to it.

Every dispatched session is assigned exactly one `task_id` +
`role_id` pair. That pair is immutable for the session's lifetime:

| Guard | Rule |
|---|---|
| Same-pair only | Continuation requires exact task-role match + non-retired roster binding. |
| Single active | At most one in-flight/assigned actor per role at a time. |
| Stable job only | A new/refined unit within the same stable job is allowed only under the current primary-approved plan and handoff bounds. A distinct review/test/consolidation job requires a new role + fresh session; task-role identity, role contract and native permissions remain unchanged. |
| No cross-task | A session bound to task A cannot take on a role in task B. |
| No retired reuse | Retired session IDs are never reused; a replacement is always a fresh session. |
| No invented IDs | A pending slot may be reserved before the harness returns a real ID; never fabricate one. |

## Onboarding and replacement

Before any task-source reads, load applicable mandatory guidance and safety rules,
then the memory storage protocol and resolve `MEMORY_DIR`. A fresh replacement's
first task reads (in order):
1. Own role record (`tasks/<task-id>/roles/<role-id>.md` in resolved `MEMORY_DIR`).
2. Task record and role roster.
3. Current approved plan.

Validate identity and restore knowledge before substantive action. Block if:
identity mismatch, retired binding, missing/stale checkpoint, unapproved or stale
scope, duplicate ownership, or unproven prior-worker quiescence.

Retirement: stop or complete the outgoing actor's in-flight work first; preserve
checkpoint with retirement provenance. Primary updates the roster.

## Role checkpoints (append-only)

After each completed or interrupted slice, the contributor appends to its role record:
- Approved plan revision + unit; restored sources confirmed.
- Changed outputs with PASS/FAIL/UNVERIFIED evidence.
- Blockers and next safe action.

Preserve all prior bytes. Do not rewrite earlier checkpoints. Failed capture →
`CHECKPOINT_PENDING`; no substantive continuation until recovery is authorized.
Read-only artifact reviewers may write only explicitly permitted own-role memory.

## Shared proportionate plans

Plans are jointly crafted by appropriate roles and versioned by primary.
Execution pins the approved revision and unit; silently deviating from approved
scope is not permitted. Pinning an old revision requires reading and revalidating
the new current scope before acting.

Plan tiers and cast size follow actual uncertainty above the required minimum:
primary plus at least one real worker. A small team needs a proportionate plan,
not a multi-phase scaffold; simple solo tasks stay outside skill activation.

## Accepted-task consolidation

Consolidation is triggered only by **recorded user acceptance**, not machine PASS
or agent TASK_COMPLETE.

On acceptance, a dedicated fresh consolidator may be recruited for that task.
Its pass is **report-only**: reads role captures and request/plan context; returns
scored candidates. No long-term/knowledge writes, `consolidated` marker flips,
archive, eviction, Git, or external effects during the report pass. Applying
proposals requires subsequent explicit human approval via `memory` approval gates.
Do not silently replace the dedicated consolidator with the main.

Replacement consolidators restore their own role checkpoint before running.

## Responsibility split

| Concern | Owner |
|---|---|
| Permitted launch/replacement, bounded handoff | `subagent-dispatch` + worker contract; never solo/simulated fallback |
| Record schema, Capture/Recall, checkpoint storage | `memory` + task-role records |
| Delivery loop, evaluation, release gate | This skill's [delivery path](delivery.md) |
| Joint plan deliberation, design challenge | This skill's deliberation path |

Use [Task-role records](../../memory/references/task-role-records.md) for schema,
checkpoint format, and binding/retirement procedures; [Memory](../../memory/SKILL.md)
for backend resolution; [Worker contract](../../subagent-dispatch/references/worker-contract.md)
for bounded handoffs. Existing native permissions remain unchanged.
