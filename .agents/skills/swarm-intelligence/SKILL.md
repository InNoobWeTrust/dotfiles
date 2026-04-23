---
name: swarm-intelligence
description: >
  Multi-agent swarm pipeline for domain-agnostic parallel analysis and synthesis.
  Use this skill whenever the user says "swarm", "run swarm", "multi-agent", "parallel
  agents", "diverse perspectives", or wants a 3-phase Research -> Spec -> Execution
  pipeline via the kilo-swarm CLI. The top-level skill is intentionally compact:
  it routes the orchestrator to the smallest reference file needed for the task.
---

# Swarm Intelligence Pipeline

This skill is a router. Do not read the whole tree by default.

## Default Read Set

For normal orchestration, read only these files:

1. `references/orchestrator/minimal-flow.md`
2. One chosen domain config under `references/domains/.../config.json`
3. `references/models/free.json`
4. `references/models/premium.json`

That is the canonical minimal bundle for weaker orchestrators.

## Read Only When Needed

- Need the domain config schema or field meanings:
  `references/orchestrator/domain-config.md`
- Need node-level CLI, engine routing, retry, JSON extraction, or merge behavior:
  `references/orchestrator/node-helpers.md`
- Need final artifact shape or file materialization rules:
  `references/orchestrator/materialization.md`
- Need safety rules or anti-pattern guidance:
  `references/orchestrator/anti-patterns.md`
- Need budgeting guidance:
  `references/orchestrator/cost-management.md`
- Need the JSON-only node persona text:
  `assets/templates/swarm-node.txt`
- Need an example final artifact:
  `assets/examples/final-artifact.json`

## Source Of Truth Order

If files disagree, resolve conflicts in this order:

1. `references/orchestrator/minimal-flow.md`
2. The selected domain config and `references/models/*.json`
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
