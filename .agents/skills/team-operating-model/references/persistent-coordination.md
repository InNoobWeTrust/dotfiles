# Persistent Team Coordination

Apply this path whenever this skill is active: a real team always has multiple
contributors. Also use it when a bound role is resumed/replaced or accepted-task
consolidation is routed. No solo or simulated-team exception is available.

## Session request continuity

Resolve the originating session's external root **first**, using actual harness/session identities and an available scoped resolver or the same configured authorized direct-file store. Bind `SESSION_DIR`; never guess identities or silently switch stores. Start with `SESSION_DIR/board.md`, not a new task directory hierarchy. Its YAML identifies scope, harness/session and one designated owner. Keep a Mermaid `kanban` projection, a request/task/team link index and an append-only Requests and history section at the end. Other scratchpads are optional.

- Before acting on each substantive request, append its source/faithful quotation, constraints and stable session-local ID (`R001`); full identity includes origin harness/session. Never reuse IDs. Preserve compatible earlier requests; append source-backed corrections/cancellations/supersessions naming affected IDs. Propagate changes into affected task requirements and plans under existing authority gates.
- Link each request to exactly one owning board and all affected canonical task roots, recording their scope identities/paths. Resolve each linked scope before access; links are navigation, not permissions. Do not move or duplicate existing task records. A coordinator's backlog never permits cross-task reuse of bound workers.
- Add team boards only for independent work streams, in `SESSION_DIR/teams/<team-id>/` or existing authorized roots. Teams are ordinary directories, not a new resolver scope. Session history retains sources and links to team roots/boards; team boards reference those sources and own their lifecycle history. Any session-level team-status view is derived/read-only, never separately authoritative.
- Source/history entries and role checkpoints are append-only. Current column/status, owner, diagram and link index are mutable projections: append supporting lifecycle/transfer events first. Use unique column/card IDs and plain Mermaid labels; ordinary Markdown links beneath the diagram provide navigation. Validate syntax with an available parser or report manual-only checking when unavailable.
- Use Inbox → Active/Blocked → Review → Closed. Machine completion is Review. Close a request only with recorded explicit acceptance, cancellation or supersession and closure of **all** linked tasks on those grounds; partial completion is insufficient. A task-free request needs its own explicit closure source. Keep closed cards/history discoverable. Cancellation/supersession does not set `accepted_by_user: true` or authorize consolidation.
- One writer owns each board/history; contributors return receipts or write separately owned role files. Record writer transfer and outgoing-writer quiescence before replacement writes. Files provide no concurrent-write locking.
- On restoration, read session entry and relevant history → relevant task/team links → own role → task/roster → approved plan. Before handoff reconcile all request IDs, including closed requests, against owning-board evidence. Repair stale projections from sources, not recollection.
- Missing identity/source, conflicting metadata, inaccessible required storage, duplicate ownership or failed capture blocks only affected continuation. Retain unsaved payload in the conversation and report the gap; never claim capture succeeded or create a silent fallback store.

Prototype check after 1–2 real uses: unrelated follow-up, shared constraint, stale projection, two teams, partial closure, failed capture. Source walkthroughs establish instruction coverage, not runtime reliability.

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
then the memory storage protocol; resolve the originating session entry and its relevant task link before `TASK_DIR`. A fresh replacement's
first task reads (in order):
1. Own role record (`roles/<role-id>.md` in the selected repository-task root, `TASK_DIR=MEMORY_DIR`; use an available external-memory capability or direct external files, without requiring MCP. The selected root is already the task directory, so do not append that hierarchy again).
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
proposals requires subsequent explicit human approval via the selected memory capability's approval gate.
Do not silently replace the dedicated consolidator with the main.

Replacement consolidators restore their own role checkpoint before running.

## Responsibility split

| Concern | Owner |
|---|---|
| Permitted launch/replacement, bounded handoff | Available dispatch capability + worker contract, or the main skill's inline §2 contract; never solo/simulated fallback |
| Record schema, Capture/Recall, checkpoint storage | Selected scoped-memory capability + this file's task-role records |
| Delivery loop, evaluation, release gate | This skill's [delivery path](delivery.md) |
| Joint plan deliberation, design challenge | This skill's deliberation path |

Use this file's task-role record schema: immutable `task_id` + `role_id`, single
active ownership, role-first restoration, append-only checkpoints (approved plan
revision/unit, restored sources, changed outputs with PASS/FAIL/UNVERIFIED,
blockers and next safe action) and retirement rules. Resolve the selected memory
scope before reads/writes; directly accessible files are sufficient, and an
unwritable required scope blocks only affected persistence. Bounded handoffs
follow the main skill's §2 contract or an available dispatch capability. Existing
native permissions remain unchanged.
