---
description: Thin entrypoint for one bounded swarminator node (immutable artifact). Loads swarm-intelligence Mode Single-Node.
---

# External Subagent

Load **`swarm-intelligence`** and select **Mode Single-Node** only.

Do **not** run Full Swarm from this command unless the user escalates after a failed Single-Node attempt.

Discover available agents, providers, and models dynamically via `swarminator` and let the user choose.

## Entrypoint Guardrails

- Preserve the user's objective, inputs, constraints, and stop conditions exactly.
- Keep the work to one external node and one immutable artifact.
- Discover available agents, providers, and models dynamically at runtime and let the user choose; do not assume or hardcode any default agent, provider, or model.
- Stop on missing bounded scope, missing artifact contract, unavailable `swarminator`, or any request for delegated workspace writes.

## Preflight

```bash
command -v swarminator >/dev/null 2>&1 || { echo "ERROR: swarminator not found — install via: brew tap InNoobWeTrust/tap && brew install swarminator" >&2; exit 1; }
```

---

Additional input, if any, appears below exactly as provided:

<arguments>
$ARGUMENTS
</arguments>
