---
kind: memory-protocol
memory_scope: project
repo_id: dotfiles
audience: agents and repository maintainers
purpose: discover versioned project knowledge without publishing private working context
---
# Project knowledge

This directory contains non-sensitive, reusable dotfiles knowledge intended for source control. Start at [core.md](core.md), then open only the relevant topic.

| Information | Location |
|---|---|
| Reusable project guidance | `knowledge/` and approved `long-term/` |
| Sensitive repository context | External repository-private scope |
| Task requests, plans and role checkpoints | External `repo_id` + `task_id` scope |
| Quorum scratchpads | External originating harness-session scope |
| Cross-project harness learnings | External harness-global scope |
| Explicitly cross-harness global learnings | Shared-global audience in the same external store, never `~/.agents/memories/` |

Before persistence, select the intended audience and scope explicitly. The stable repository ID is `dotfiles`; prefer an available external-memory capability for short-lived or sensitive context, or manage the same explicitly selected scoped files directly. Do not invent a store, silently broaden scope or publish private/task/session content here. Durable capture, consolidation and eviction retain their applicable human-approval boundaries; missing storage capability is not permission to install one. No particular skill or MCP is required. Read [memory_maintenance.md](memory_maintenance.md) for this repository's storage boundaries.

Private/task/session contents and their inventories do not belong in this directory. Ignore rules help with new files but cannot remove copies already tracked, staged or present in Git history.
