# Artifact And Materialization

Use this file only when handling the final swarm output.

## Final Artifact Contract

The swarm returns one JSON artifact with a `files` array.

Each file entry should look like this:

```json
{"path":"src/example.ts","language":"typescript","code":"...","task_id":"task_01"}
```

## Hard Rules

- Swarm nodes return JSON only.
- Swarm nodes do not write files.
- A separate premium `code` agent materializes files serially.

## Materialization Steps

1. Receive the final JSON artifact.
2. Validate that `files` exists and each entry has `path`, `language`, `code`, and `task_id`.
3. Write files one path at a time.
4. Check for conflicts before each write.
5. If materialization fails partway through, rerun only the materialization step
   against the same artifact after reconciling the failing paths.
