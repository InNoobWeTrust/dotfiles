# Artifact And Materialization

Use this file only when handling the final swarm output.

## Final Artifact Contract

The swarm returns one JSON artifact with a `files` array. Upstream node passes may be prose, bullets, lightly structured text, or JSON; only this final artifact is JSON.

Each file entry should look like this:

```json
{"path":"src/example.ts","language":"typescript","code":"...","task_id":"task_01"}
```

## Synthesizer Notes

- Accept prose, bullets, lightly structured text, or JSON from intermediate node passes.
- Normalize those responses into the final JSON artifact below.

## Hard Rules

- Swarm nodes may return prose, bullets, lightly structured text, or JSON.
- Swarm nodes do not write files.
- A separate premium `code` agent materializes files serially.

## Materialization Steps

1. Receive the final JSON artifact.
2. Validate that `files` exists and each entry has `path`, `language`, `code`, and `task_id`.
3. Write files one path at a time.
4. Check for conflicts before each write. A conflict exists if the target file already exists and differs from the artifact content. Resolve by overwriting (default) or skipping (if safety mode is enabled).
5. If materialization fails partway through, rerun only the materialization step against the same artifact. The artifact is immutable; no reconciliation is needed beyond fixing the underlying file system issue (permissions, disk space, etc.).
