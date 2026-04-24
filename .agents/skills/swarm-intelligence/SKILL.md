---
name: swarm-intelligence
description: Multi-agent swarm pipeline for domain-agnostic parallel analysis and synthesis. Use this skill whenever the user says "swarm", "run swarm", "multi-agent", "parallel agents", "diverse perspectives", or wants a 3-phase Research -> Spec -> Execution pipeline via the kilo-swarm CLI. This skill is the compact entrypoint; the canonical flow, domain contracts, and model pools live in the referenced docs.
---

# Swarm Intelligence Pipeline

This skill is the entrypoint for orchestrating multi-agent swarms. It is intentionally small, but it is not self-sufficient: read the default read set before running a swarm. Do not read the whole tree by default.

## What This Skill Controls

- This skill defines how an orchestrator selects the canonical swarm flow and supporting contracts.
- The orchestrator is the host agent or script coordinating the run. There is no separate `kilo-swarm --orchestrate` command.
- `kilo-swarm` is a single-node runner. Multi-agent behavior comes from running multiple node invocations and merging them.

## Operator Entry Contract

Before starting a swarm, the orchestrator must have all of the following:

1. A non-empty input document, prompt, or job payload.
2. One selected domain config under `references/domains/.../config.json`.
3. One selected tier: `minimal`, `full`, or `degraded`.
4. Access to the referenced model pools in `references/models/*.json`.
5. A target outcome: either a success artifact with a `files` array or an error envelope.

The canonical single-node invocation pattern is:

```bash
$SHELL -l -c 'command -v kilo-swarm >/dev/null 2>&1 || { echo "ERROR: kilo-swarm not found in PATH" >&2; exit 1; }'
$SHELL -l -c 'cat input.txt | kilo-swarm -m google/gemini-2.5-flash -p "PHASE1_A_PERSONA"'
```

The orchestrator repeats that single-node command across phases, models, and retries according to `references/orchestrator/minimal-flow.md`.

## Execution Model

The orchestrator achieves multi-agent behavior by running **multiple `kilo-swarm` invocations** where each invocation is a single-agent node pass. The orchestrator handles:
- Phase-by-phase execution in a fixed order
- Parallel node execution within a phase when supported by the runtime
- Result merging and quorum detection
- Retry logic and failure recovery
- Routing between phases

`kilo-swarm` itself runs one node per invocation — it is the orchestrator's responsibility to coordinate multiple nodes across phases.

In this skill, "sequential" refers to advancing phases in order. It does **not** mean node calls inside a phase must be serialized.

### Required Phase Handoffs

- Phase 1 outputs may be prose or JSON, but they must contain extractable content for `phase1_a_field` or `phase1_b_field`.
- Phase 2 review output must expose `approved` and `critical_vulnerabilities`.
- Phase 3 decompose output must expose a non-empty `tasks` array.
- Phase 3 breaker output must expose `passed` and `critical_failures`.

See `references/orchestrator/domain-config.md` and `references/orchestrator/node-helpers.md` for the normalized output contracts.

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

Fast selection heuristics:

- Use `code` for build/fix/refactor/test/debug tasks in a repository.
- Use `design` for interaction, layout, component, or accessibility design work.
- Use `skill-review` for skills, agent docs, command docs, or other meta-orchestration content.
- Use `pm` for roadmaps, prioritization, metrics, or strategy documents.
- Use `slides` for decks, presentations, or talk structures.
- Use `writing` for long-form prose, outlines, or article-style deliverables.

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
| Example failure envelope | `assets/examples/failure-artifact.json` |

## Source Of Truth Order

If files disagree, resolve in this order:

1. `references/orchestrator/minimal-flow.md`
2. Selected domain config + `references/models/*.json`
3. Other files in `references/orchestrator/`
4. `assets/` examples and templates

## Orchestrator Capability Tiers

| Tier | Description |
|---|---|
| **full** | Multiple models per selected phase, with quorum/merge on those nodes |
| **minimal** | 2 models for Phase 1 quorum, single model for Phase 2/3 (default) |
| **degraded** | Single model throughout, no retry |

Use `minimal` by default. Use `full` when a human asks for it, when the task is high-stakes, or when a prior minimal run produced disagreement or low confidence. Use `degraded` only when model availability or budget constraints make higher assurance impossible.

## Core Laws

- `kilo-swarm` runs one node per invocation. The orchestrator runs multiple invocations to achieve swarm behavior.
- Swarm nodes do not write files.
- Intermediate node outputs may be prose, bullets, lightly structured text, or JSON.
- If a persona explicitly asks for JSON, the node must return valid JSON.
- Only final artifacts and failure envelopes are JSON.
- If a stop condition is hit, stop immediately and surface the failure.

## Scope Boundaries

In scope:

- Domain selection and model-pool resolution
- Phase execution, retries, quorum, and merge rules
- Success artifacts and failure envelopes
- Handoff to a separate materialization step

Out of scope:

- Direct file writes by swarm nodes
- Background daemons or a dedicated orchestrator binary
- Provider billing enforcement beyond tier selection guidance
- Human approval workflows outside the documented review loops

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

When surfacing a failure, return this JSON structure and keep it aligned with `assets/examples/failure-artifact.json`:

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

Always use a login shell. The VS Code extension may not source user environment files, so `kilo-swarm` may appear missing unless invoked via `$SHELL -l -c '...'`.

Correct:

```bash
$SHELL -l -c 'echo "input" | kilo-swarm -m MODEL -p PERSONA'
```

Incorrect:

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
