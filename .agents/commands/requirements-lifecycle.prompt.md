---
description: Thin entrypoint for PRD, TRD, BDD, verification, traceability, and changelog workflows. Use only when the user requests requirements/spec work or the task is large enough that inline acceptance criteria are not safe.
---

# Requirements Lifecycle

Use the `requirements-driven-dev` skill for this workflow.

The skill owns the requirements methodology, packaged references, templates, review-gate guidance, and full lifecycle flow under its `references/` tree.

## Entrypoint Guardrails

- Preserve the user's stated objective and scope before selecting a lifecycle track.
- Start with the lightest flow that can produce testable acceptance criteria.
- Stop when requirements conflict, verification criteria cannot be made concrete, approval is needed, or a git write lacks explicit user approval.

## Invocation Arguments

Additional command input, if any, appears below exactly as provided:

```text
$ARGUMENTS
```

Use the block above as raw additional user input. Preserve whitespace, blank lines, and quoting exactly. If the block is empty, rely on the conversation context instead.

Follow this command for the user's requirements-lifecycle request below.
