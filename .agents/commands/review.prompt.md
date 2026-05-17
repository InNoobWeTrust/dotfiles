**Review Orchestrator** — Load the `reviewer` skill, which contains the routing table and lazy-loads sub-reviewers from `references/` based on artifact type.

## Execution

1. Load skill: `reviewer`
2. The reviewer skill's routing table selects sub-reviewers by artifact type.
3. Apply explicit user overrides (e.g., "skip security", "architecture only", "deep mode").
4. Aggregate findings by severity with file/line references.

## Invocation Arguments

Additional command input, if any, appears below exactly as provided:

```text
$ARGUMENTS
```

Use the block above as raw additional user input. Preserve whitespace, blank lines, and quoting exactly. If the block is empty, rely on the conversation context instead.

Follow this command for the user's review request below.
