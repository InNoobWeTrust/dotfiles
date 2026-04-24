# Artifact And Materialization

Use this file only when handling the final swarm output.

## Final Artifact Contract

The swarm returns either:

- a success artifact with a required `files` array, or
- a failure envelope with `status: "error"`.

Upstream node passes may be prose, bullets, lightly structured text, or JSON; only the final success artifact and failure envelope are required to be JSON.

Each file entry must have a `path` and at least one content field. The schema is flexible to support any domain:

```json
// Code domain
{"path": "src/example.ts", "language": "typescript", "code": "...", "task_id": "task_01"}

// Skill-review domain
{"path": "AGENTS.md", "severity": "critical", "finding": "...", "recommendation": "...", "task_id": "task_01"}

// Generic
{"path": "...", "<domain fields>": "..."}
```

Required fields per entry: `path` + at least one of: `code`, `finding`, `content`, or `summary`.

Optional top-level success metadata such as `status`, `summary`, or `generated_by` is allowed, but `files` is mandatory.

Failure envelopes should look like this:

```json
{
  "status": "error",
  "code": "STOP_PHASE2_UNAPPROVED",
  "message": "Phase 2 remained unapproved after 3 review cycles",
  "details": {
    "phase": "phase2",
    "run_id": "2026-04-24T12-00-00Z-a1b2c3d4",
    "circuit_broken": true
  },
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
3. Validate that `files` exists and each entry has `path` plus at least one content field.
4. **Atomic write**: write each file to a temp path first, then `mv` atomically to the target path.
5. **Checksum validation**: compute SHA256 of the written file; compare against the checksum embedded in the orchestrator run state. If mismatch, delete the file and fail.
6. **Rollback on failure**: if any file write fails, delete all already-written files and return error envelope with `circuit_broken: true`.
7. If a target path conflicts with the worktree, let the writing agent apply repository safety rules; do not invent a swarm-local overwrite policy.
8. If materialization fails partway through, rerun only the materialization step against the same artifact. The artifact is immutable; no reconciliation is needed beyond fixing the underlying file system issue.
