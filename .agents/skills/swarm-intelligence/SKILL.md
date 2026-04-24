---
name: swarm-intelligence
description: Multi-agent swarm pipeline for domain-agnostic parallel analysis and synthesis. Use this skill whenever the user says "swarm", "run swarm", "multi-agent", "parallel agents", "diverse perspectives", or wants a 3-phase Research -> Spec -> Execution pipeline via the kilo-swarm CLI. The top-level skill is intentionally compact: it routes the orchestrator to the smallest reference file needed for the task.
---

# Swarm Intelligence Pipeline

This skill is a router for orchestrating multi-agent swarms. Do not read the whole tree by default.

## Execution Model

The orchestrator achieves multi-agent behavior by running **multiple `kilo-swarm` invocations sequentially**, where each invocation is a single-agent node pass. The orchestrator handles:
- Parallel node execution (when supported by the runtime)
- Result merging and quorum detection
- Retry logic and failure recovery
- Routing between phases

`kilo-swarm` itself runs one node per invocation — it is the orchestrator's responsibility to coordinate multiple nodes across phases.

## Default Read Set

For normal orchestration, read only these files:

1. `references/orchestrator/minimal-flow.md`
2. One chosen domain config under `references/domains/.../config.json`
3. `references/models/free.json`
4. `references/models/premium.json`

### Domain Config Selection

Use the task context to select the appropriate domain:

| Task Type | Domain Config |
|---|---|
| Code review, debugging, implementation | `references/domains/code/config.json` |
| UI/UX design, visual systems | `references/domains/design/config.json` |
| Skill/agent document review | `references/domains/skill-review/config.json` |
| Project planning, roadmapping | `references/domains/pm/config.json` |
| Presentation slides | `references/domains/slides/config.json` |
| Writing, documentation | `references/domains/writing/config.json` |

If no domain matches, default to `skill-review` for meta-analysis tasks.

## Read Only When Needed

| Need | File |
|---|---|
| Domain config schema / field meanings | `references/orchestrator/domain-config.md` |
| CLI, engine routing, retry, output parsing, merge | `references/orchestrator/node-helpers.md` |
| Final artifact shape / file materialization | `references/orchestrator/materialization.md` |
| Safety rules / anti-pattern guidance | `references/orchestrator/anti-patterns.md` |
| Budgeting guidance | `references/orchestrator/cost-management.md` |
| Swarm node persona text | `assets/templates/swarm-node.txt` |
| Example final artifact | `assets/examples/final-artifact.json` |

## Source Of Truth Order

If files disagree, resolve in this order:

1. `references/orchestrator/minimal-flow.md`
2. Selected domain config + `references/models/*.json`
3. Other files in `references/orchestrator/`
4. `assets/` examples and templates

## Orchestrator Capability Tiers

| Tier | Description |
|---|---|
| **full** | Multiple models per phase, full quorum voting |
| **minimal** | 2 models for Phase 1 quorum, single model for Phase 2/3 (default) |
| **degraded** | Single model throughout, no retry |

Use `minimal` by default. Use `full` when output quality is critical and budget allows. Use `degraded` only when compute is severely limited.

## Core Laws

- `kilo-swarm` runs one node per invocation. The orchestrator runs multiple invocations to achieve swarm behavior.
- Swarm nodes do not write files.
- Intermediate node outputs may be prose, bullets, lightly structured text, or JSON.
- Only final artifacts and failure envelopes are JSON.
- If a stop condition is hit, stop immediately and surface the failure.

### Intermediate Output Example

- Finding: The retry limit is not clear.
- Recommendation: State the retry cap next to the quorum rule.

### Stop Conditions

Stop the swarm and surface the failure when any of these occur:

| Code | Condition |
|---|---|
| `STOP_SUCCESS` | All phases completed successfully |
| `STOP_PHASE1_NO_QUORUM` | Phase 1 could not reach 2 valid outputs |
| `STOP_PHASE2_UNAPPROVED` | Phase 2 rejected after max review cycles |
| `STOP_PHASE3_TASK_FAILURE` | Task failed after max maker-fix retries |
| `STOP_TIMEOUT` | Absolute timeout exceeded |
| `STOP_CONFIG_MISSING` | Required config key is missing |

### Error Envelope

When surfacing a failure, return this JSON structure:

```json
{
  "status": "error",
  "code": "STOP_PHASE1_NO_QUORUM",
  "message": "Phase 1-A could not reach 2 valid outputs after exhausting free model pool",
  "details": {},
  "retryable": false
}
```

## Shell Invocation

Always use a login shell. The VS Code extension may not source user environment files, so `kilo-swarm` will appear missing unless invoked via a login shell.

**Always verify `kilo-swarm` availability first:**

```bash
$SHELL -l -c 'command -v kilo-swarm >/dev/null 2>&1 || { echo "ERROR: kilo-swarm not found in PATH" >&2; exit 1; }'
```

**Correct invocation:**
```bash
$SHELL -l -c 'echo "input" | kilo-swarm -m MODEL -p PERSONA'
```

**Incorrect — kilo-swarm not found in PATH:**
```bash
echo "input" | kilo-swarm -m MODEL -p PERSONA
```

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
