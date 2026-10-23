# Source maps for shared code understanding

Optional scaffolding for structural exploration and cross-agent handoffs; ordinary Capture/Recall is unchanged. A source map is a compact evidence record, not a sourcemap build artifact or a new storage type. Use existing scoped task records and metadata under [Scopes](scopes.md) and [Hierarchy and storage](hierarchy-and-storage.md). This method grants no persistence, cross-scope access or long-term consolidation authority.

## Capture only what the next agent needs

Embed relevant fields in the existing record or inline handoff; do not populate unrelated fields:

```text
Question / coverage: affected slice, graph kinds/configurations, exclusions
Source identity: repository + worktree + revision; relevant dirty paths/content identity
Responsibilities / placement: component → owning layer; split/keep rationale
Flow: entry → orchestration → capability → effect/result; failure and state ownership
Edges: from → to, graph kind, path:symbol/current line, source/tool evidence
Decision / delta: observed structure vs approved proposal; additions/removals
Unknowns: ambiguous bindings, dynamic/generated edges, unexamined closure
Freshness / invalidation: evidence time; files/contracts/config changes to recheck
Next check / owner: unresolved question and bounded source reads
```

Avoid raw source dumps, secrets and unrelated context. A HEAD hash alone does not identify dirty working content. Use an existing change/diff identity or explicit relevant content fingerprints when available; otherwise state that dirty identity is incomplete and require fresh reads. Do not run new commands solely to fill optional fields.

## Share and recall

- With an available remote-memory/scoped-search capability, search only the authorized task/repository scope using component/symbol/feature terms; triage a few matches before opening records. Inspect the actual interface rather than assuming a tool name or global visibility. Direct files in the same authorized scope remain valid.
- Give teammates the selected scope/record path, minimal relevant excerpt and source identity. Verify recipient access and privacy; scope names are not access controls. If unavailable, send an authorized inline map and report unsaved context rather than creating a store or moving private records into Git.
- Before applying a recalled map, compare repository/worktree/revision and relevant dirty state; re-read affected symbols, imports, manifests and wiring. Same HEAD or a search hit does not prove freshness. Changed exports, registration, targets, manifests or integrated worker edits invalidate dependent edges/claims.
- Append corrections and invalidations to authorized task captures; do not overwrite another role's record. Long-term project knowledge still requires the existing separate approval/consolidation process. Do not automatically promote working maps.

Memory accelerates navigation; current source evidence owns conclusions. Missing evidence remains explicit in the relevant structural review receipt or as UNVERIFIED.
