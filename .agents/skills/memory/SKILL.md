---
name: memory
description: Save, restore and manage scoped agent memory, task plans, role checkpoints and consensus. Use for explicit capture/recall, preferences or sourced lessons, and requested consolidation/eviction. Project knowledge stays in .agents/memories; prefer external memory for short-lived or sensitive context, with direct Markdown management and no MCP dependency.
---

# Memory

Agent working memory, execution tracking, consensus and consolidated knowledge. Human-facing documentation belongs in `docs/`, not here.

## Hard rules

1. Short-term memory is unbounded and append-only during a session. Long-term is size-limited and grows only through requested consolidation with human approval.
2. Consolidation, eviction, archive and long-term writes are proposals until explicitly approved. Capturing a task, completion, context pressure, age or size never triggers a dream cycle.
3. Agent coordination/plans belong in the correctly scoped memory root, never `docs/`. Reusable non-sensitive project knowledge belongs in `<git-root>/.agents/memories/`; sensitive repo information and raw task/session context stay outside the repository.
4. Markdown with YAML frontmatter is authoritative, human-traceable and directly editable. Disposable search indexes are not memory authority. Text being Git-compatible does **not** authorize committing private memory.

Before any read/write load [Hierarchy and storage](references/hierarchy-and-storage.md) and [Scopes](references/scopes.md). Resolve scope first; do not silently fall back to another directory.

## Modes

Name the mode and print scope/resolved `MEMORY_DIR` before file operations.

| Intent | Mode | Guidance |
|---|---|---|
| Save/checkpoint/remember a preference, example or sourced lesson; save plan/consensus | Capture | Hierarchy §Capture; [scoped context](references/scoped-context.md) for personal context |
| Resume/restore/load prior work or relevant knowledge | Recall | Hierarchy §Recall; [compaction and step recall](references/compaction-and-step-recall.md) only for similar-trace/compaction needs |
| Explicitly consolidate/dream cycle/review notes | Consolidate, preferably via fresh subagent | [Dream cycle](references/dream-cycle.md); report-only until later approval |
| Explicitly prune/forget/evict | Evict | [Eviction scoring](references/eviction-scoring.md) |
| Explicitly reorganize/migrate memory | Structure | Scopes §Migration; source imports/references require impact check before moving |

Capture and Consolidate are separate procedures. When consolidation is requested, capture a self-contained handoff first, then give a fresh dedicated consolidator the selected scope and source paths, not the entire transcript. If delegation is unavailable, report and ask whether to proceed in-agent or defer; never silently substitute.

An accepted task (`accepted_by_user: true`) plus an explicit consolidation request routes a fresh task-only consolidator to its captures; no global scan, automatic apply, marker flips or archive. See dream-cycle and [task-role records](references/task-role-records.md). Corrections are adds-only unless explicitly authorized; never evict a correction without an explicit request naming its key.

## Scope routing

| Content | Destination |
|---|---|
| Pure project knowledge intended for source control | Direct `.agents/memories/` |
| Global learning explicitly shared across harnesses | Shared-global audience in the same external store |
| Cross-project learning for one harness | Harness-global external memory |
| Sensitive repo-specific context | Repository-private external memory |
| Task request/plan/roles/phases/consensus across harnesses | External repo-task pair |
| Quorum scratchpad/whiteboard | External originating harness-session pair |

Prefer an available external-memory capability for short-lived memories and sensitive details. It may supply scoped paths and search, but is optional: ordinary file tools against a known or explicitly selected external directory are sufficient. Discover the available interface rather than requiring MCP or a particular provider. Keep the same scope/privacy rules with either route; missing integration alone does not block the skill. Detail, path selection, metadata and conventions: [Scopes](references/scopes.md).

All global/shared memory belongs in that same external store, not `~/.agents/memories/`; that location may overlap a dotfiles project's own knowledge. Preserve separate shared-global and harness-specific audiences rather than treating all global notes as public to every harness.

`MEMORY_DIR` is the selected scope root. For a task, `TASK_DIR=MEMORY_DIR` and `roles/` is directly beneath it. Historical `tasks/<task-id>/...` examples denote that logical task subtree, not another directory to append.

## Size limits

Defaults may be overridden in the selected scope's `long-term/INDEX.md` frontmatter:

| Bucket | Soft | Hard |
|---|---|---|
| INDEX entries | 40 | 60 |
| One topic | 8 KB | 16 KB |
| All long-term | 128 KB | 256 KB |

Report overruns; do not auto-consolidate, evict or archive. INDEX carries the smallest key facts/pointers; leaves carry details loaded on demand. See [progressive disclosure](references/progressive-disclosure-pattern.md) and [code application](references/pattern-code.md).

## Stops and output

- Unresolved scope/identity, missing mount or unwritable selected root: stop only affected persistence; report unsaved context. An unavailable integration is not a blocker when the same authorized files are directly accessible. Do not silently switch stores or put private notes in Git.
- Opaque authoritative storage, task/private notes in project knowledge or agent plans in `docs/`: stop and reroute.
- Consolidation would silently rewrite corrections, approve itself, mark accepted/consolidated, or archive/delete: stop and request the required explicit human approval.
- Move affects imported source files: produce the impact list and obtain confirmation before moving; migration never broadens deletion/Git authority.
- Ambiguous Recall matches across tasks/scopes: show minimal summaries and ask, rather than widening access.

Return mode, selected scope, resolved paths and changed files/sections; note relevant search buckets/top matches or `NONE FOUND`. Explain unavailable capabilities and unresolved safety gaps. For consolidation/eviction include ranked proposals and ask approval before applying. Update long-term INDEX last after approved writes.

## References

- [Hierarchy and storage](references/hierarchy-and-storage.md): entry templates, filenames, Capture/Recall.
- [Scopes](references/scopes.md): audience/identity metadata, external resolution, migration and source-backed conventions.
- [Task-role records](references/task-role-records.md): immutable bindings, checkpoints and restoration.
- [Dream cycle](references/dream-cycle.md): requested consolidation, scoring and approval boundaries.
- [Scoped context](references/scoped-context.md): personal preferences/examples and privacy.
- [Compaction and step recall](references/compaction-and-step-recall.md): compact handoffs and similar traces.
- [Eviction scoring](references/eviction-scoring.md): ranked proposals, archive-then-delete.

Prototype scope revision: 2026-10-16; inspect the next 1–2 cross-harness uses. No automatic retention-policy changes or backend security guarantees.
