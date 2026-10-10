---
name: team-operating-model
description: "Use this skill when coordinating continuing multi-role work across sessions for the same task — binding sessions to permanent task-role pairs, reading role memory before acting, checkpointing completed slices, crafting jointly approved proportionate plans, and governing replacement, onboarding, and user-accepted consolidation. Do not use for simple single-session tasks, runtime main/worker capability selection, or routine delegation that needs no persistent identity."
---

# Team Operating Model

Governs the lifecycle of persistent cross-session team work: role identity, session binding, handoff, shared plans, and accepted-task consolidation. Composes existing skills — it does not replace them.

**When to load:** assigning or resuming a permanent task-role; governing a fresh replacement or continuation; jointly crafting or pinning a shared plan; routing accepted-task consolidation. A simple task with only one contributor needs no cast, plan tier, or reference tree — do not force structure that does not serve the actual uncertainty.

---

## Roles and session binding

Two orthogonal identities coexist and must not be conflated:

- **Runtime capability (local):** main (delegation available) or worker (execute directly). Determined per harness instance; bridge changes never widen authority.
- **Permanent job role:** a stable scope within a specific task, persisting across all sessions assigned to it.

Every dispatched session is assigned exactly one `task_id` + `role_id` pair. That pair is immutable for the session's lifetime:

| Guard | Rule |
|---|---|
| Same-pair only | Continuation requires exact task-role match + non-retired roster binding. |
| Single active | At most one in-flight/assigned actor per role at a time. |
| Stable job only | A new/refined unit within the same stable job is allowed only under the current primary-approved plan and handoff bounds. A distinct review/test/consolidation job requires a new role + fresh session; task-role identity, role contract and native permissions remain unchanged. |
| No cross-task | A session bound to task A cannot take on a role in task B. |
| No retired reuse | Retired session IDs are never reused; a replacement is always a fresh session. |
| No invented IDs | A pending slot may be reserved before the harness returns a real ID; never fabricate one. |

## Onboarding and replacement

Before any task-source reads, load applicable mandatory guidance and safety rules, then the memory storage protocol and resolve `MEMORY_DIR`. A fresh replacement's first task reads (in order):
1. Own role record (`tasks/<task-id>/roles/<role-id>.md` in resolved `MEMORY_DIR`).
2. Task record and role roster.
3. Current approved plan.

Validate identity and restore knowledge before substantive action. Block if: identity mismatch, retired binding, missing/stale checkpoint, unapproved or stale scope, duplicate ownership, or unproven prior-worker quiescence.

Retirement: stop or complete the outgoing actor's in-flight work first; preserve checkpoint with retirement provenance. Primary updates the roster.

## Role checkpoints (append-only)

After each completed or interrupted slice, the contributor appends to its role record:
- Approved plan revision + unit; restored sources confirmed.
- Changed outputs with PASS/FAIL/UNVERIFIED evidence.
- Blockers and next safe action.

Preserve all prior bytes. Do not rewrite earlier checkpoints. Failed capture → `CHECKPOINT_PENDING`; no substantive continuation until recovery is authorized. Read-only artifact reviewers may write only explicitly permitted own-role memory.

## Shared proportionate plans

Plans are jointly crafted by appropriate roles and versioned by primary. Execution pins the approved revision and unit; silently deviating from the approved scope is not permitted. Pinning an old revision requires reading and revalidating the new current scope before acting.

Plan tiers and cast size follow actual uncertainty; no fixed role-count heuristic. A single primary contributor with no plan file is valid for a simple task.

## Accepted-task consolidation

Consolidation is triggered only by **recorded user acceptance**, not machine PASS or agent TASK_COMPLETE.

On acceptance, a dedicated fresh consolidator may be recruited for that task. Its pass is **report-only**: reads role captures and request/plan context; returns scored candidates. No long-term/knowledge writes, `consolidated` marker flips, archive, eviction, Git, or external effects during the report pass. Applying proposals requires subsequent explicit human approval via `memory` skill approval gates. Do not silently replace the dedicated consolidator with the main.

Replacement consolidators restore their own role checkpoint before running.

## Responsibility split

| Concern | Owner |
|---|---|
| Session launch, fallback, bounded handoff | `subagent-dispatch` + `worker-contract.md` |
| Record schema, Capture/Recall, checkpoint storage | `memory` + `task-role-records.md` |
| Delivery loop, evaluation, release gate | `bounded-iteration` |
| Joint plan deliberation, design challenge | `multi-perspective-deliberation` |

## Stop conditions

- Missing role record, task record, or current approved plan → block and report; do not invent.
- Identity mismatch, retired binding, or unapproved scope → block affected work.
- Checkpoint capture failed → `CHECKPOINT_PENDING`; no substantive continuation until recovery authorized.
- Coder-to-tester re-scoping or cross-task reuse requested → refuse; new role + fresh session required.
- Accepted-task consolidation report would write/archive/evict without subsequent human approval → stop.

## References

- [Task-role records](../memory/references/task-role-records.md) — canonical record schema, session-binding contract, checkpoint format, and replacement/retirement procedure
- [Worker contract](../subagent-dispatch/references/worker-contract.md) — bounded handoff, discovery access, persistent-task-role identity section
- [Memory](../memory/SKILL.md) — backend resolution, Capture/Recall, dream-cycle consolidation
- [Bounded iteration](../bounded-iteration/SKILL.md) — delivery loop, evaluator criteria, release gate
- [Multi-perspective deliberation](../multi-perspective-deliberation/SKILL.md) — persona deliberation and joint plan challenge
