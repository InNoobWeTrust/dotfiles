---
description: Thin multi-agent swarm entrypoint. Use when the user asks for swarm, multi-agent, parallel agents, diverse perspectives, or high-risk multi-pass work. Routes to swarm-intelligence Mode Full Swarm.
---

# Swarm

Load **`swarm-intelligence`** and select **Mode Full Swarm** (complete preflight + three phases). For one bounded node only, use `/external-subagent` or Mode Single-Node instead.

## Entrypoint Guardrails

- Preserve the user's objective, inputs, constraints, and stop conditions exactly.
- Stop immediately on missing swarm configuration, failed quorum, timeout, unsafe action, or user approval boundary.
- Use a login shell when PATH matters: `$SHELL -l -c 'swarminator --help'`.
- Full Swarm requires 2–3 models per persona and real `swarminator` runs — no prose simulations.

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
