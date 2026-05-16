---
description: Thin multi-agent swarm entrypoint. Use only when the user asks for swarm, multi-agent, parallel agents, diverse perspectives, or the task is too high-risk for a single pass.
---

# Swarm

Use the `swarm-intelligence` skill for swarm orchestration.

## Entrypoint Guardrails

- Preserve the user's objective, inputs, constraints, and stop conditions exactly.
- Stop immediately on missing swarm configuration, failed quorum, timeout, unsafe action, or user approval boundary.
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

Follow this command for the user's swarm request below.
