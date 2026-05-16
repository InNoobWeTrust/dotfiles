---
description: Thin entrypoint for bounded iterative execution with machine-verifiable completion criteria. Use for explicit Ralph/loop/run-until-done requests; default to HITL and avoid shared-workspace AFK unless isolated.
---

# Ralph Loop

Use the `ralph-loop` skill for the bounded iterative execution workflow.

## Entrypoint Guardrails

- Proceed only when the task has locked scope, allowed files/actions, acceptance criteria, and stop triggers.
- Require machine-verifiable completion criteria before any iteration.
- Default to human-in-the-loop; use AFK only with explicit approval and an isolated or disposable workspace.
- Do not commit automatically. Stop after verification and follow repository git-safety rules if a commit is desired.

## Invocation Arguments

Additional command input, if any, appears below exactly as provided:

```text
$ARGUMENTS
```

Use the block above as raw additional user input. Preserve whitespace, blank lines, and quoting exactly. If the block is empty, rely on the conversation context instead.

Follow this command for the user's Ralph-loop request below.
