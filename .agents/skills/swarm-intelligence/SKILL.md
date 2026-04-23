---
name: swarm-intelligence
description: Multi-agent swarm pipeline for domain-agnostic parallel analysis and synthesis. Use this skill whenever the user says "swarm", "run swarm", "multi-agent", "parallel agents", "diverse perspectives", or wants a 3-phase Research -> Spec -> Execution pipeline via the kilo-swarm CLI. The top-level skill is intentionally compact: it routes the orchestrator to the smallest reference file needed for the task.
---

# Swarm Intelligence Pipeline

This skill is a router. Do not read the whole tree by default.

## Default Read Set

For normal orchestration, read only these files:

1. `references/orchestrator/minimal-flow.md`
2. One chosen domain config under `references/domains/.../config.json`
3. `references/models/free.json`
4. `references/models/premium.json`

## Read Only When Needed

| Need | File |
|---|---|
| Domain config schema / field meanings | `references/orchestrator/domain-config.md` |
| CLI, engine routing, retry, JSON extraction, merge | `references/orchestrator/node-helpers.md` |
| Final artifact shape / file materialization | `references/orchestrator/materialization.md` |
| Safety rules / anti-pattern guidance | `references/orchestrator/anti-patterns.md` |
| Budgeting guidance | `references/orchestrator/cost-management.md` |
| JSON-only node persona text | `assets/templates/swarm-node.txt` |
| Example final artifact | `assets/examples/final-artifact.json` |

## Source Of Truth Order

If files disagree, resolve in this order:

1. `references/orchestrator/minimal-flow.md`
2. Selected domain config + `references/models/*.json`
3. Other files in `references/orchestrator/`
4. `assets/` examples and templates

## Directory Layout

```text
references/
  orchestrator/   # execution rules and lookup docs
  domains/        # built-in domain configs and personas
  models/         # source-of-truth model catalogs
assets/
  templates/      # reusable prompt fragments
  examples/       # example JSON artifacts
```

## Core Laws

- `kilo-swarm` runs one node, not a full swarm.
- `minimal mode` is the default for weaker orchestrators.
- Swarm nodes return JSON only and do not write files.
- If a stop condition is hit, stop and surface the failure.

## Shell Invocation

Always use a login shell. The VS Code extension may not source user environment
files, so `kilo-swarm` will appear missing unless invoked via a login shell.

```bash
# CORRECT
$SHELL -l -c 'echo "input" | kilo-swarm -d path/to/config.json'

# INCORRECT — kilo-swarm not found in PATH
echo "input" | kilo-swarm -d path/to/config.json
```
