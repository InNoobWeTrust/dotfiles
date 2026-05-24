---
description: Thin external-node delegation entrypoint. Use for one bounded swarminator offload that returns an immutable artifact such as research notes, a review, or a patch-only edit suggestion.
---

# External Subagent

Use the `external-subagent` skill for one bounded `swarminator` delegation.

Default runtime priority: use `command-code` with the built-in `deepseek-v4-pro` path first, and keep using it until the documented `$40` quota is exhausted.

## Entrypoint Guardrails

- Preserve the user's objective, inputs, constraints, and stop conditions exactly.
- Keep the work to one external node and one immutable artifact.
- Prefer `command-code` with built-in `deepseek-v4-pro` unless quota exhaustion, runtime unavailability, or the task explicitly requires another runtime.
- Stop on missing bounded scope, missing artifact contract, unavailable `swarminator`, or any request for delegated workspace writes.
- Use a login shell when PATH matters: `$SHELL -l -c 'swarminator --help'`.

## Preflight

```bash
$SHELL -l -c 'command -v swarminator >/dev/null 2>&1 || { echo "ERROR: swarminator not found — install via: brew tap InNoobWeTrust/tap && brew install swarminator" >&2; exit 1; }'
```

## Invocation Arguments

Additional command input, if any, appears below exactly as provided:

```text
$ARGUMENTS
```

Use the block above as raw additional user input. Preserve whitespace, blank lines, and quoting exactly. If the block is empty, rely on the conversation context instead.

Follow this command for the user's bounded external delegation request below.
