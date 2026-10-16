---
kind: memory-protocol
memory_scope: project
repo_id: dotfiles
---
# Maintaining project knowledge

Use the [memory skill](../skills/memory/SKILL.md). Keep this directory for non-sensitive, reusable project knowledge that is suitable for version control; use [core.md](core.md) as its small topic router.

Prefer an available external-memory capability for short-lived or sensitive context, or manage the selected external files directly; no MCP is required. Global/shared, harness-global, repository-private, repo-task and harness-session notes use the same external store, never `~/.agents/memories/`. Task roots already contain their own `task.md`, `request.md`, `plan.md` and `roles/`; do not nest `tasks/<id>` again or place raw tracking here.

Preserve provenance and append-only working captures. Consolidation, long-term writes, archive and eviction remain explicit human-controlled operations; migration or task completion is not consolidation approval.

When moving older records, keep verified originals and source/destination checksums outside Git. Never stage, commit or rewrite history without approval: ignore rules do not protect files already tracked or historical copies.
