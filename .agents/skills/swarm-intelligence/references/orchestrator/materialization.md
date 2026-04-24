# Artifact And Materialization

Use this file only when handling the final swarm output.

## Final Artifact Contract

The swarm returns either:

- a success artifact with a required `files` array, or
- a failure envelope with `status: "error"`.

Upstream node passes may be prose, bullets, lightly structured text, or JSON; only the final success artifact and failure envelope are required to be JSON.

Each file entry should look like this:

```json
{"path":"src/example.ts","language":"typescript","code":"...","task_id":"task_01"}
```

Optional top-level success metadata such as `status`, `summary`, or `generated_by` is allowed, but `files` is mandatory.

Failure envelopes should look like this:

```json
{
  "status": "error",
  "code": "STOP_PHASE2_UNAPPROVED",
  "message": "Phase 2 remained unapproved after 3 review cycles",
  "details": {},
  "retryable": false
}
```

## Synthesizer Notes

- Accept prose, bullets, lightly structured text, or JSON from intermediate node passes.
- Normalize those responses into the final JSON artifact below.

## Hard Rules

- Swarm nodes may return prose, bullets, lightly structured text, or JSON.
- Swarm nodes do not write files.
- A separate premium `code` agent materializes files serially.

## Materialization Steps

1. Receive the final JSON output.
2. If `status` is `error`, surface the envelope and stop. Do not attempt file writes.
3. Validate that `files` exists and each entry has `path`, `language`, `code`, and `task_id`.
4. Write files one path at a time through a separate premium `code` agent.
5. If a target path conflicts with the worktree, let the writing agent apply repository safety rules; do not invent a swarm-local overwrite policy.
6. If materialization fails partway through, rerun only the materialization step against the same artifact. The artifact is immutable; no reconciliation is needed beyond fixing the underlying file system issue.
