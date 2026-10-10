# Task-Role Records

Canonical schema for task records, role records, session-binding contracts, and checkpoint format. Applies beneath `MEMORY_DIR` for every memory backend (Serena, default, custom). All files are plain Markdown with YAML frontmatter; the file-based/human-traceable/Git-committable invariant applies.

---

## Task record (`tasks/<task-id>/task.md`)

```yaml
---
kind: task
task_id: <immutable-slug>        # set once; never renamed
status: active                   # active | ready-for-acceptance
created: <ISO 8601 timestamp>
accepted_by_user: false          # true only on recorded user acceptance event with source
consolidated: false              # true only after approved consolidation apply pass
---
```

Required body sections:
- **Outcome and authority**: scope, memory backend, authoritative sources.
- **Permanent role roster**: table — role ID, responsibility, session binding, role memory path.
- **Declared acceptance criteria**: explicit, outcome-linked conditions approved by the authorized owner under the delivery mode. Primary owns in-scope criteria in autonomous delivery; the user retains final acceptance and all explicitly human-reserved approvals.
- **Evidence and lifecycle**: initial snapshot, per-job scopes, acceptance event (none until recorded).
- **Event log**: append-only; captures recruits, replacements, retirements, approvals, proof receipts.

**`accepted_by_user`** is `false` until a recorded user acceptance event with source citation. Machine PASS, worker TASK_COMPLETE, and reviewer agreement never change it. `accepted_by_user` and `consolidated` are separate states; being ready for acceptance is not the same as being accepted.

Primary owns the roster and event log. Roles write only their own role record; they do not edit the task record.

---

## Role record (`tasks/<task-id>/roles/<role-id>.md`)

```yaml
---
kind: task-role
task_id: <same-as-parent-task>   # immutable; must match parent task
role_id: <kebab-case-slug>       # immutable; exact slug from roster
created: <ISO 8601 timestamp>    # set once at first recruitment
consolidated: false              # true only after approved consolidation apply pass
---
```

Required body:
- **Role contract**: stable job scope — what the role owns, implements, reviews, or checkpoints; what it does not do.
- **Append-only checkpoints**: one section per completed or interrupted slice (see §Checkpoint format below).

Invariants:
- `task_id` and `role_id` are immutable after first write.
- `consolidated` is set `true` only during an approved consolidation apply pass; never by the role itself.
- All history must be preserved. Rewriting earlier checkpoint bytes is forbidden.
- The role record is the primary source for identity and knowledge transfer on replacement.

---

## Checkpoint format

Append after each completed or interrupted slice. Never rewrite prior bytes.

```markdown
## <slice-name or event> (<ISO date>)

### Restored sources
- Role record: confirmed / missing fields noted
- Task record and roster: [brief summary]
- Plan revision <N>, unit <name>: confirmed / stale: [explain]

### Decisions and outputs
- [Changed files, decisions made, evidence: PASS / FAIL / UNVERIFIED]

### Blockers
- [Concrete blockers, or NONE]

### Next safe action
- [Specific next step, or CHECKPOINT_PENDING if capture incomplete]
```

**Capture failure:** if capture fails mid-slice, record `CHECKPOINT_PENDING` with the exact payload and target path. Do not invent a confirmation. Do not resume substantive work or authorize a replacement until the capture is confirmed and recovery is authorized by primary.

---

## Session-binding contract

Every dispatched session is bound to exactly one `task_id` + `role_id` pair:

| Guard | Rule |
|---|---|
| Same-pair only | Continuation requires the exact task-role pair + a non-retired roster binding. |
| Single active | At most one in-flight/assigned actor per role at a time. |
| No cross-task reuse | A session bound to task A cannot be reused for task B. |
| Stable job only | A new/refined unit within the same stable job is allowed only under the current primary-approved plan and handoff bounds. A distinct review/test/consolidation job requires a new role + fresh session; task-role identity, role contract and native permissions remain unchanged. |
| No retired reuse | Retired session IDs are never reused; a replacement is always a fresh session. |
| No invented IDs | A pending slot may be reserved before the harness returns a real ID; never fabricate one. |

A primary-approved plan change does not silently inherit old scope. The bound actor must read and revalidate the new approved plan before continuing.

---

## Replacement and retirement

1. Stop or complete the outgoing actor's in-flight work first.
2. Append a checkpoint with retirement note to the outgoing role record.
3. Primary updates the roster: retire the old binding, record provenance.
4. Before any task-source reads, the fresh actor loads applicable mandatory guidance and safety rules, then the memory storage protocol and resolves `MEMORY_DIR`. First task reads (in order):
    1. Own role record.
    2. Task record and role roster.
    3. Current approved plan.
5. Validate identity; restore knowledge from checkpoints before substantive action.

**Block the fresh actor** if any of the following holds: identity mismatch, retired binding, missing or stale checkpoint that conflicts with approved scope, duplicate active ownership, or unproven prior-worker quiescence.

---

## Multi-backend path resolution

The path scheme `tasks/<task-id>/roles/<role-id>.md` applies beneath the resolved `MEMORY_DIR` for all backends:

| Backend | Full path | Serena nested name |
|---|---|---|
| Serena | `<MEMORY_DIR>/tasks/<task-id>/roles/<role-id>.md` | `tasks/<task-id>/roles/<role-id>` |
| Default | `<MEMORY_DIR>/tasks/<task-id>/roles/<role-id>.md` | — |
| Custom | `<MEMORY_DIR>/tasks/<task-id>/roles/<role-id>.md` | — |

See [Hierarchy and storage](hierarchy-and-storage.md) for full Capture/Recall procedures per backend. See [Team operating model](../../team-operating-model/SKILL.md) for onboarding, replacement, shared plans, and accepted-task consolidation routing.
