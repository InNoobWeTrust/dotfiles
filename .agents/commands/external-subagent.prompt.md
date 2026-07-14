---
description: Thin entrypoint for one bounded swarminator node (immutable artifact). Loads swarm-intelligence Mode Single-Node.
---

# External Subagent

Load **`swarm-intelligence`** and select **Mode Single-Node** only.

Do **not** run Full Swarm from this command unless the user escalates after a failed Single-Node attempt.

Default runtime priority: `command-code` + `deepseek-v4-pro` while documented quota remains.

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
