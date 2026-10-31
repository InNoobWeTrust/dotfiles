---
metadata:
  prototype: "2026-10-16"
  review-task: "Revisit after 1–2 cross-harness uses."
---

# Memory scopes and identity

Choose the narrowest correct audience **before** resolving a path or searching. A shared directory is not permission to read everything in it. Ordinary project knowledge stays in the project; raw requests, task evidence and scratchpads stay out of Git.

| Scope | Use | Identity | Root resolution |
|---|---|---|---|
| Project knowledge | Non-sensitive, reusable project conventions and approved knowledge; intended for source control | Current Git root | Direct `<git-root>/.agents/memories/` |
| Shared global | Learnings explicitly intended to be shared across harnesses and projects | Explicit shared audience | Shared-global directory in the same external store |
| Harness global | Learnings/preferences applicable across projects within one harness; not automatically every harness | Stable harness ID | External capability or direct external directory |
| Repository private | Sensitive repo-specific context, account/environment facts; not a substitute for committing pure project knowledge | Stable `repo_id` | External capability or direct external directory |
| Repository task | Requests, plans, role checkpoints, phases and consensus shared across harnesses for the same repo-task pair | `repo_id` + immutable `task_id` | External capability or direct external directory |
| Harness session | Cumulative request history, Mermaid Kanban entry point, task/team links and quorum discussion | Originating `harness` + `session_id` | External capability or direct external directory; resolve first for session request tracking |

## Resolve, then manage files directly

Global/shared memory uses the same selected external store as private/task/session memory. Never use `~/.agents/memories/` as a global fallback: it may be owned by a dotfiles repository and is not a separate global store. Keep cross-harness shared notes distinct from harness-only notes. A capability that supports only harness-specific scopes does not implicitly provide a shared-global scope; use an explicitly configured shared directory in the external store rather than mislabeling it as one harness.

1. Establish scope and required identities from the authorized task/harness context. Do not infer missing session IDs, silently invent a replacement task, or use a branch as task identity. For non-repo work choose harness/session; do not manufacture a repo ID.
2. Prefer an available external-memory capability for short-lived or sensitive context; inspect its interface and request only the selected identity. No particular protocol, provider or resolver is required. Without an integration, use an external path documented in user/harness configuration or an authorized handoff. If no store is established, explicitly select and announce a user-local data directory outside Git, with the scoped hierarchy below; do not create a duplicate of an existing store. Bind `MEMORY_DIR` to the selected absolute directory and `MEMORY_BACKEND=resolved-files`. For project knowledge use `MEMORY_BACKEND=project-files` and the direct project path. Creation must be intentional.
3. Use ordinary file tools to read/edit Markdown beneath that root. Missing integration alone does not block Capture/Recall: use direct access to the same authorized files. Missing required identity, inaccessible mounts, unwritable roots or conflicting identity metadata stop only affected persistence; retain unsaved context in the conversation and report it. **Never silently relocate an unavailable store, put private/task context in project knowledge, or substitute opaque authority.**
4. Resolve separately when crossing scopes. Search only the selected scope/subdirectory. BM25 ranks text relevance, not truth, freshness or authority; verify selected files. Shell glob/grep remain sufficient for filenames and literal matching. Do not sweep all harness/repository/session namespaces on startup.

Absolute paths are host-local. A capability on another host is useful for direct editing only when the caller sees the same files through an explicitly supplied mount/shared filesystem. Disabling an integration does not revoke file access or stop independent synchronization. No synchronization, replication, authentication or confidentiality is implied by scope names.

The same retrieval capability may also search an **explicitly selected custom text directory** (for example a skill's CSV catalog), without treating that directory as a memory store or creating scope metadata there. Resolve the selected directory to an absolute path before calling; keep this read-only directory target distinct from scoped memory resolution. CSV rows and text chunks need source locators; ranking entire catalog files is not a substitute for selecting bounded records. Use available BM25 row search or efficient CSV queries instead of loading whole catalogs into context. Preserve catalog-specific field/filter/ID semantics; generic BM25 relevance does not implement exact filters or guarantee equivalent ranking. No automatic home/repository-wide scan follows from this capability.

## Identity and metadata

- Use stable, non-secret IDs, not credential-bearing URLs, full machine paths, prompts, email addresses or task descriptions. An explicit repo ID can intentionally survive clone/path changes and be shared by worktrees. Different repositories must not reuse an ID accidentally. Record the selected repo ID in the project's memory entry point; confirm an existing mapping instead of silently changing it. An opaque ID may be chosen where even a project name is sensitive.
- A quorum shares the **originating** harness-session pair, supplied in handoffs. Worker session IDs remain role-binding metadata, not replacements for the shared scratchpad identity. No guessing from transcript text.
- Preserve and verify any existing store identity metadata; a mismatch stops access. A provider may own a `.scope.md` marker with schema version and scope identities: follow that provider's contract when using it, but do not require its marker or tool schema for ordinary direct-file stores. Record the selected scope and identities in notes or the store entry point when no provider manages metadata.
- New notes additionally record `memory_scope` and relevant `repo_id`, `task_id`, `harness`, `session_id` in their existing YAML frontmatter. Omit irrelevant fields; include normal kind/status/provenance/created/updated fields as applicable. Scope metadata does not replace immutable task/role bindings, approval or source provenance.
- Layout convention within the external store: `shared/global/`, `harnesses/<harness>/global/`, `repos/<repo_id>/private/`, `repos/<repo_id>/tasks/<task_id>/`, `harnesses/<harness>/sessions/<session_id>/`. Use the configured capability's returned root or the explicitly selected direct-file base; do not guess an existing provider's path. Missing required identity is a blocker, not a reason to widen scope.

## Hierarchy beneath the resolved root

Project knowledge uses `core.md` (or `README.md`) → `knowledge/<topic>.md` and approved `long-term/INDEX.md` → topic files. Keep private scope inventories and raw task names out of the project index. A public index may explain how to resolve private memory without listing private content.

A resolved task root **is already the task directory**: `task.md`, immutable `request.md`, `plan.md`, `roles/<role_id>.md`, optional `phases/` and `consensus/`. Bind `TASK_DIR=MEMORY_DIR`; never append a second `tasks/<task_id>`. In older references, `tasks/<task-id>/...` denotes this logical task subtree, not a command to create a nested task directory. Feature plans and phases belonging to a task stay in that task root. Standalone private planning lives in the chosen repository-private scope, not project knowledge.

Harness/repository-private scopes may use `core.md`, `short-term/`, `long-term/`, `plans/` and `consensus/` as needed. For session request tracking, resolve the originating session first and bind `SESSION_DIR`; its entry point is `board.md`, with optional `scratchpad.md`, `roles/` and `consensus/`. Follow [Session request continuity](hierarchy-and-storage.md#session-request-continuity). Canonical task roots remain separately resolved and linked, not moved or copied. Record scope identities and explicit root/board paths in the link index; links are navigation, never read/write authorization.

Optional team directories are ordinary subdirectories such as `SESSION_DIR/teams/<team-id>/` or existing authorized roots, not a new resolver scope. Each has one board owner; session links expose which requests each team owns. Use append-only attributed contributions for quorum discussion, preferably separate per-role files. Direct files supply no merge protocol or multi-host locking. Avoid simultaneous rewrites; surface conflicts. Completion, age, context pressure and scope alone authorize neither consolidation nor deletion.

## Migration and Git safety

Classify before moving. Preserve mixed sensitive/pure source records privately unless a bounded, reviewed split is possible; retain provenance and surface deferred extraction, never expose private fragments to make the project index complete. Existing notes may lack new metadata: preserve original bytes in a verified recovery copy, record source→destination and checksums, then add metadata only as an explicit subsequent change. Migration does not promote working notes to approved knowledge or consolidate them.

Copy and compare file counts and SHA256 before removing originals. Repair live discovery links; distinguish historical quoted paths from active pointers. Existing missing sources stay reported as missing, not reconstructed. Keep the receipt and recovery copy external. Inspect both working tree and Git index: moving a tracked file does **not** remove its staged copy or history; never stage/commit or rewrite history without approval. Ignore rules cannot protect content already tracked. If a staged user edit must be preserved, leave the index intact and clearly report any residual exposure.

## Sources and conditional lessons

- [LangGraph stores](https://docs.langchain.com/oss/python/langgraph/stores): namespace tuple + key supports hierarchical organization. This implementation uses Markdown paths, not LangGraph JSON stores or automatic namespace-prefix searches.
- [LangSmith store auth](https://docs.langchain.com/langsmith/store-auth): namespaces are shared by default; actual isolation requires authorization. Path conventions alone are not ACLs.
- [Claude Code memory](https://code.claude.com/docs/en/memory): user/project/local scopes and project auto-memory illustrate audience separation; its machine-local auto-memory is not a portable shared backend.
- [Git worktrees](https://git-scm.com/docs/git-worktree): worktrees share repository state but have per-worktree paths/admin files; path-derived identity would not reliably express intentional cross-clone sharing.
- [XDG Base Directory](https://specifications.freedesktop.org/basedir-spec/latest/): durable user data belongs under data home, disposable indexes under cache (or in memory), not ephemeral runtime directories. Respect platform/user configuration; a provider's concrete defaults belong in its integration documentation.

Scope classification and migration are task-attempt evidence, not proof of cross-machine sync or privacy against unrestricted filesystem access.
