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
6. A unique `run_id` for this execution (format: `<iso8601>-<uuid4>`, e.g. `2026-04-24T12-00-00Z-a1b2c3d4`).

The canonical single-node invocation pattern is:

```bash
# 1. Verify kilo-swarm is on PATH
$SHELL -l -c 'command -v kilo-swarm >/dev/null 2>&1 || { echo "ERROR: kilo-swarm not found" >&2; exit 1; }'

# 2. Safe invocation: pass stdin as a file to avoid shell interpolation of input content.
#    MODEL and PERSONA must be shell-safe strings (no untrusted user content here).
input_file="input.txt"
model="google/gemini-2.5-flash"
persona="PHASE1_A_PERSONA_TEXT"
$SHELL -l -c "cat \"\$input_file\" | kilo-swarm -m \"\$model\" -p \"\$persona\""
```

The orchestrator repeats that single-node command across phases, models, and retries according to `references/orchestrator/minimal-flow.md`.

> **Security note:** Never embed untrusted input directly into the shell command string. Always pipe from a file or stdin. The `-p` persona argument and `-m` model argument must be sanitized before use; do not pass raw user content as these arguments.

## Preflight Gate

Before any node invocation, the orchestrator must validate bootstrap prerequisites. These are hard preconditions — if any check fails, halt immediately with `STOP_CONFIG_MISSING`.

| Check | Validation | Failure Action |
|-------|-----------|---------------|
| `kilo-swarm` on PATH | `command -v kilo-swarm` succeeds | Exit with "kilo-swarm not found" |
| stdin non-empty | Input document is non-empty | Exit with "empty input" |
| Config keys accessible | All referenced config files readable | Exit with "config not accessible" |
| Model pool accessible | `references/models/free.json` and `premium.json` readable | Exit with "model pool not accessible" |

Example preflight script:
```bash
$SHELL -l -c 'command -v kilo-swarm >/dev/null 2>&1' || { echo "ERROR: kilo-swarm not found on PATH" >&2; exit 1; }
[[ -s "$input_file" ]] || { echo "ERROR: empty input document" >&2; exit 1; }
for f in references/models/free.json references/models/premium.json; do
  [[ -r "$f" ]] || { echo "ERROR: cannot read $f" >&2; exit 1; }
done
```

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

Each phase has a named output field defined in the domain config. The orchestrator extracts field values from node outputs using these rules:

| Phase | Field | Type | Extraction Rule |
|-------|-------|------|----------------|
| Phase 1-A | `phase1_a_field` | string | Extract longest contiguous text block matching field name as heading or JSON key |
| Phase 1-B | `phase1_b_field` | string | Same as above |
| Phase 2 forward | `top5_priorities`, `qa_flags` | array | Extract from JSON array or bullet list under heading |
| Phase 2 review | `approved` | boolean | True if `approved: true` or `approved: yes`; false otherwise |
| Phase 2 review | `critical_vulnerabilities` | array | Extract from JSON array or bullet list |
| Phase 3 decompose | `tasks` | array[object] | Extract from JSON array; each object must have `task_id`, `finding`, `recommendation` |
| Phase 3 breaker | `passed` | boolean | True if `passed: true` or all qa_notes positive; false otherwise |
| Phase 3 breaker | `critical_failures` | array | Extract failures from JSON array |

**Valid output examples:**

```json
// Valid Phase 2 review output
{ "approved": true, "critical_vulnerabilities": ["shell injection risk"], "qa_flags": [] }

// Valid Phase 3 decompose output
{ "tasks": [{ "task_id": "task_01", "finding": "problem", "recommendation": "fix" }] }

// Invalid — missing required fields
{ "summary": "looks good" }
```

If a required field cannot be extracted, the output is invalid and counts as a quorum failure for that node.

## Default Read Set

For normal orchestration, read only these files:

1. `references/orchestrator/minimal-flow.md`
2. One chosen domain config under `references/domains/.../config.json`
3. `references/models/free.json`
4. `references/models/premium.json`

### Domain Config Selection

Use the scoring rubric below to select the appropriate domain. Score each domain based on keyword match; highest score wins. If the top score is below the confidence threshold (2), flag the task for human clarification instead of auto-routing.

**Decision table:**

| Signal (weight) | code | design | skill-review | pm | slides | writing |
|----------------|------|--------|-------------|-----|--------|---------|
| Task contains: build, fix, refactor, debug, implement, test (×3) | 3 | 0 | 1 | 0 | 0 | 0 |
| Task contains: review, audit, critique, challenge (×2) | 2 | 1 | 3 | 1 | 1 | 2 |
| Task contains: UI, layout, component, accessibility, visual (×3) | 0 | 3 | 0 | 0 | 1 | 0 |
| Task contains: plan, roadmap, priority, strategy, metric (×3) | 0 | 0 | 1 | 3 | 0 | 1 |
| Task contains: presentation, slide, deck, talk (×3) | 0 | 0 | 0 | 0 | 3 | 1 |
| Task contains: write, prose, article, document, outline (×2) | 1 | 0 | 0 | 0 | 0 | 2 |
| Task contains: skill, agent, command, orchestration (×3) | 0 | 0 | 3 | 0 | 0 | 0 |
| File extensions present: .py, .ts, .js, .go, .rs, .java (×2) | 2 | 0 | 1 | 0 | 0 | 0 |
| File extensions present: .fig, .sketch, .xd, .svg (×2) | 0 | 2 | 0 | 0 | 0 | 0 |

**Scoring rules:**
1. Sum weights for each domain. Highest total wins.
2. If no domain scores ≥ 2, return `DOMAIN_UNCERTAIN` and request human clarification.
3. Ties break by domain priority order: `code` > `skill-review` > `design` > `pm` > `slides` > `writing`.
4. An explicit user request for a specific domain overrides scoring.

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

| Tier | Phase 1 Models | Phase 2 Models | Phase 3 Models | Retry Policy |
|------|---------------|----------------|----------------|--------------|
| **minimal** | 2 free-pool models (quorum=2) | 1 premium mid-tier model | 1 premium mid-tier model | 2 retries per node on exit-2 |
| **full** | 3 free-pool models (quorum=2) | 2 premium models (merge) | 2 premium models (merge) | 3 retries per node on exit-2 |
| **degraded** | 1 free-pool model | 1 free-pool model | 1 free-pool model | No retry |

- **Escalation policy**: If `minimal` run produces no quorum (disagreement) or `approved: false`, escalate to `full` for that phase only.
- **Demotion policy**: If cost exceeds `MAX_COST_USD` or token count exceeds `MAX_TOKENS_PER_RUN`, demote to `degraded`.
- Use `minimal` by default. Use `full` when a human explicitly requests it, when the task is high-stakes, or when a prior minimal run produced disagreement. Use `degraded` only when model availability or budget constraints make higher assurance impossible.

## Core Laws

- `kilo-swarm` runs one node per invocation. The orchestrator runs multiple invocations to achieve swarm behavior.
- Swarm nodes do not write files.
- **Intermediate outputs**: Phase 1–3 node outputs may be prose, bullets, or JSON. If a persona explicitly requests JSON, the node must return valid JSON conforming to the extraction schema. There is no requirement for JSON when not requested.
- **Final artifacts**: Only the success artifact and error envelope must be strict JSON with the defined schema. All other outputs may use any readable format.
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

- Finding: The `STOP_TIMEOUT` code was listed but no numeric limits were given.
- Recommendation: The Circuit Breaker section now states `MAX_WALL_CLOCK_SECONDS = 7200` and `MAX_COST_USD = 50.00` as hard limits.

### Stop Conditions

Stop the swarm and surface the failure when any of these occur:

| Code | Condition | `retryable` |
|---|---|---|
| `STOP_SUCCESS` | All phases completed successfully | N/A |
| `STOP_PHASE1_NO_QUORUM` | Phase 1 could not reach 2 valid outputs | `false` |
| `STOP_PHASE2_UNAPPROVED` | Phase 2 rejected after max review cycles (3) | `false` |
| `STOP_PHASE3_TASK_FAILURE` | Task failed after max maker-fix retries (2) | `false` |
| `STOP_TIMEOUT` | Resource limit exceeded (time, tokens, or cost) | `false` |
| `STOP_CONFIG_MISSING` | Required config key is missing or duplicate run_id | `false` |
| `DOMAIN_UNCERTAIN` | Domain scoring produced no confident match (score < 2) | `true` |

### Error Envelope

When surfacing a failure, return this JSON structure and keep it aligned with `assets/examples/failure-artifact.json`:

```json
{
  "status": "error",
  "code": "STOP_PHASE1_NO_QUORUM",
  "message": "Phase 1-A could not reach 2 valid outputs after exhausting free model pool",
  "details": {
    "phase": 1,
    "branch": "a",
    "models_tried": ["google/gemini-2.5-flash", "github-copilot/gpt-5-mini"],
    "models_failed": 2,
    "run_id": "2026-04-24T12-00-00Z-a1b2c3d4"
  },
  "retryable": false
}
```

- `retryable: false` for exhausted resources, cost/time limits, and domain mismatch.
- `retryable: true` only for transient invocation failures (exit 2) where a retry may succeed.
- The `details` field should include enough context for a human or automated system to understand the failure and decide whether to retry.

## Shell Invocation

**Always use a login shell.** The VS Code extension may not source user environment files, so `kilo-swarm` may appear missing unless invoked via `$SHELL -l -c '...'`.

### Safe Invocation Pattern

```bash
# Pass input via stdin pipe; MODEL and PERSONA must be sanitized shell-safe strings.
$SHELL -l -c 'cat input.txt | kilo-swarm -m "google/gemini-2.5-flash" -p "PERSONA_TEXT"'
```

> **Shell injection prevention:** The `-m` model and `-p` persona arguments must never contain untrusted user content. If persona text may include user-supplied values, write them to a file and pipe the file instead. Never use `eval` or string interpolation of raw user input into the shell command.

### Credential Handling

Credentials for model providers must be injected via environment variables or a secret manager. The skill does not define how credentials reach the underlying engines (`gemini-cli`, `kilo run`); consult each engine's documentation for its expected variable names (e.g. `GEMINI_API_KEY`, `KILO_API_KEY`). Rules:

- **Never** hardcode credentials in skill files, domain configs, or prompts.
- **Never** pass credentials as `-p` persona arguments or in input documents.
- **Never** log credential values. Mask them in all output.
- If a node requires credentials that are unavailable, fail with `STOP_CONFIG_MISSING`.

## Secret and Asset Lifecycle

Sensitive data (credentials, API keys, run-state containing outputs) must be protected throughout their entire lifecycle.

### Lifecycle Controls

At every read/write boundary:

1. **Access checks**: Verify the caller is authorized before granting access to secrets or run-state.
2. **Redaction**: Strip credential values, API keys, and tokens from all output before logging or persistence.
3. **Audit logging**: Record every secret access (read/write) with timestamp, caller identity, and operation type.
4. **Periodic verification**: Re-validate that persisted secrets are still present and not corrupted.
5. **Automated policy enforcement**: Revoke or rotate secrets that have exceeded their TTL or have been flagged.

### Secret Handling Rules

- Credentials must be injected via environment variables or a secret manager — never hardcoded in skill files, domain configs, or input documents.
- Temporary files containing sensitive data must be created with restrictive permissions (`umask 0077`) and deleted on EXIT, ERR, and TERM signals.
- If `kilo-swarm` is killed mid-run (SIGTERM/SIGKILL), the cleanup trap must still fire to remove temp files.
- Shared run-state files must not contain plaintext secrets — store only references or encrypted blobs.
- Parallel outputs from multiple nodes must be aggregated by the orchestrator; nodes never write shared state directly.

## Orchestrator State Schema

Every orchestrator must maintain a run state object persisted across phases. Schema:

```json
{
  "run_id": "2026-04-24T12-00-00Z-a1b2c3d4",
  "tier": "minimal",
  "phase": 1,
  "nodes_completed": [],
  "phase1_results": { "a": [], "b": [] },
  "phase2_results": { "forward": null, "review": null },
  "phase3_results": { "tasks": [], "maker_outputs": [], "breaker_outputs": [] },
  "total_tokens": 0,
  "total_cost_usd": 0.0,
  "circuit_broken": false
}
```

The orchestrator must validate this schema at every phase handoff. If a phase produces output that does not conform to its extraction rules (see "Required Phase Handoffs"), fail with `STOP_CONFIG_MISSING`.

## Circuit Breaker and Resource Limits

To prevent runaway autonomous loops, every orchestrator must enforce these hard limits:

| Limit | Default | Config Key | Behavior on Exceed |
|-------|---------|------------|-------------------|
| Max retries per node | 2 | `MAX_RETRIES_PER_NODE` | Fail node, try next model or stop |
| Max review cycles (Phase 2) | 3 | `MAX_PHASE2_REVIEWS` | Fail swarm with `STOP_PHASE2_UNAPPROVED` |
| Max maker-fix retries (Phase 3) | 2 | `MAX_MAKER_FIX_RETRIES` | Fail swarm with `STOP_PHASE3_TASK_FAILURE` |
| Max wall-clock seconds | 7200 | `MAX_WALL_CLOCK_SECONDS` | Fail with `STOP_TIMEOUT` |
| Max tokens per run | 10,000,000 | `MAX_TOKENS_PER_RUN` | Fail with `STOP_TIMEOUT` |
| Max cost USD | 50.00 | `MAX_COST_USD` | Fail with `STOP_TIMEOUT` |

### Config Key Discovery

Config keys must be discoverable from a documented path. The orchestrator must load them from:
- Environment variables (e.g., `MAX_COST_USD=${MAX_COST_USD:-50.00}`)
- A config file at a path known to the orchestrator (e.g., `references/orchestrator/limits.json`)
- Hard defaults (shown in the table above) only when no override is found

Never infer config values from examples or partial references. If a required config key is missing, fail with `STOP_CONFIG_MISSING`.

### Operational and Economic Overhead

Beyond correctness limits, the phase machine itself consumes resources. These must be tracked and bounded:

| Resource | Metric | Hard Cap |
|----------|--------|----------|
| State persistence I/O | Writes per run | 1000 |
| Lock contention | Max wait time for run-state lock | 30s |
| Quorum aggregation | Max nodes per aggregation | 10 |
| Phase machine overhead | Cumulative cost of orchestration itself | 10% of `MAX_COST_USD` |

If any overhead metric exceeds its cap, treat as `STOP_TIMEOUT`.

### Timeout Enforcement Fail-Closed

If `MAX_WALL_CLOCK_SECONDS` is set but neither `timeout` nor `gtimeout` is available on the system, the orchestrator must:
1. Fail immediately at startup with `STOP_CONFIG_MISSING`.
2. Never proceed with a swarm run that cannot enforce wall-clock limits.

When any circuit breaker limit is exceeded, the orchestrator must:
1. Cancel all in-flight node invocations gracefully (send SIGTERM, wait up to 10s, then SIGKILL).
2. Persist current run state with `circuit_broken: true`.
3. Return an error envelope with `code: STOP_TIMEOUT` and `retryable: false` if the limit is a hard cost/time cap, `retryable: true` if only a retry limit was hit.

## Quorum and Merge Algorithm

### Phase 1 quorum
1. Run `phase1_a_persona` on the first 2 models in the free pool.
2. If a node exits with code 2 (invocation failure), retry the same model up to `MAX_RETRIES_PER_NODE` times.
3. If retries exhausted, replace the model with the next untried free model.
4. Stop when 2 valid outputs are collected or the free pool is exhausted.
5. If free pool exhausted, fail with `STOP_PHASE1_NO_QUORUM`.

### Merge strategy
1. Normalize each output to the extraction field value.
2. If both outputs are valid and agree on the field content → use the consensus value.
3. If outputs disagree → keep both as a conflict array `[{source: model_a, value: ...}, {source: model_b, value: ...}]` and pass to Phase 2 forward model for resolution.
4. If only one valid output (one model exhausted) → treat as conflict and proceed to Phase 2.

### Phase 2–3 merge
- Phase 2 forward + review: if review approves, use forward output as-is. If review rejects, invoke revise and re-review (max 3 cycles).
- Phase 3 tasks: decompose produces a task array; maker outputs are collected per task; breaker outputs are collected per task. No cross-task merging.

## Run Identifiers and Cancellation

Every swarm execution must have a unique `run_id` with format `<iso8601>-<uuid4>`.

Rules:
- Generate `run_id` once at swarm start, before any node invocations.
- Pass `run_id` to every node via the input document (not as a CLI argument) so logs can be correlated.
- **Cancellation contract**: When a stop condition is hit, the orchestrator must:
  1. Set `circuit_broken: true` in persisted run state.
  2. Send SIGTERM to all child processes.
  3. Wait up to 10 seconds for graceful exit.
  4. Send SIGKILL if still running.
  5. Never start new node invocations after a stop condition is detected.
- **Idempotency**: If a run with the same `run_id` is started again, reject with `STOP_CONFIG_MISSING` ("duplicate run_id") if the previous run state file exists and `circuit_broken` is not `true`.

## Phase Machine

The swarm progresses through a formal state machine. Each state has entry/exit criteria, defined transitions, and terminal conditions.

### State Diagram

```
INIT ──► PHASE1_A ──► PHASE1_B ──► PHASE2_FORWARD ──► PHASE2_REVIEW ──┬──► PHASE2_REVISE ──► PHASE2_REVIEW
                                                                          │
                                                                          └──► PHASE3_DECOMPOSE ──► PHASE3_MAKER ──► PHASE3_BREAKER ──┬──► SUCCESS
                                                                                                                                    │
                                                                                                                                    └──► (maker-fix loop, max 2 retries per task)
```

### State Definitions

| State | Entry Criterion | Exit Criterion | Terminal? |
|-------|----------------|----------------|-----------|
| `INIT` | Run ID generated, preflight passed | First node invocation started | No |
| `PHASE1_A` | At least one model selected | 2 valid outputs or free pool exhausted | No |
| `PHASE1_B` | Phase 1-A quorum reached | 2 valid outputs or free pool exhausted | No |
| `PHASE2_FORWARD` | Phase 1 quorum for both A and B | Forward output produced | No |
| `PHASE2_REVIEW` | Forward output available | Review approves OR max cycles reached | No |
| `PHASE2_REVISE` | Review rejected | Revised output available | No |
| `PHASE3_DECOMPOSE` | Phase 2 approved | Non-empty task array produced | No |
| `PHASE3_MAKER` | Task assigned | Finding write-up produced | No |
| `PHASE3_BREAKER` | Maker output available | QA passed OR max maker-fix retries reached | No |
| `SUCCESS` | All Phase 3 tasks pass breaker QA | Final artifact written | **Yes** |
| `FAILURE` | Any stop condition hit | Error envelope returned | **Yes** |

### Transition Guards

- `INIT → PHASE1_A`: run_id is non-empty and valid format (`<iso8601>-<uuid4>`)
- `PHASE1_A → PHASE1_B`: `phase1_a_field` extracted from both outputs
- `PHASE1_B → PHASE2_FORWARD`: `phase1_b_field` extracted from both outputs
- `PHASE2_REVIEW → PHASE2_REVISE`: `approved == false` AND review cycle < 3
- `PHASE2_REVIEW → PHASE3_DECOMPOSE`: `approved == true`
- `PHASE2_REVISE → PHASE2_REVIEW`: revised output available (increment cycle counter)
- `PHASE3_BREAKER → PHASE3_MAKER`: `passed == false` AND maker-fix retries < 2
- `PHASE3_BREAKER → SUCCESS`: `passed == true` AND all tasks complete

### Escalation and Demotion

- **Escalation** (`minimal → full`): If Phase 1 quorum fails or Phase 2 unapproved, retry that phase with full tier (3 models, quorum=2).
- **Demotion** (`full/minimal → degraded`): If `MAX_COST_USD` or `MAX_TOKENS_PER_RUN` exceeded, drop to degraded tier (1 model, no retry).

### Conflict Resolution

When outputs disagree:
1. Extract field values from both outputs.
2. If consensus → use consensus value.
3. If conflict → pass conflict array to Phase 2 forward for resolution.
4. If Phase 2 also cannot resolve → escalate to full tier for that phase.

## Materialization Contract

The materializer is responsible for writing the final artifact to disk. Contract:

1. **Atomic write**: Write to a temp file first, then rename atomically to the target path.
2. **Validation**: Compute SHA256 checksum of the written file; compare against a checksum produced by the orchestrator. If mismatch, delete the file and fail.
3. **Rollback on failure**: If materialization fails, delete any partial file and return error envelope.
4. **Partial state marking**: If the swarm stops mid-phase, the run state JSON (`circuit_broken: true`) serves as the partial artifact. The materializer should not write an incomplete artifact.
5. **Payload contract**: Nodes output findings as structured text or JSON. The orchestrator assembles the final artifact before handing off to the materializer. Nodes never write files directly.

## Glossary

| Term | Definition |
|------|------------|
| **Orchestrator** | The host agent or script coordinating the swarm run. Responsible for phase sequencing, node invocation, quorum, merge, retry, and cancellation. |
| **Synthesizer** | The logic layer that merges multiple node outputs, extracts structured fields, and produces consensus or conflict arrays. In this skill, synthesis is performed by the orchestrator or a designated Phase 2 model. |
| **Node** | A single `kilo-swarm` invocation — one model pass with one persona. |
| **Quorum** | The minimum number of valid node outputs required to proceed. Default: 2 for Phase 1. |
| **Domain config** | A JSON file defining the personas, extraction fields, and model pool references for a task type. |
| **Materialization** | The step that writes the final artifact to persistent storage. Nodes do not write files; the materializer does. |
| **Run ID** | Unique identifier for a swarm execution, format `<iso8601>-<uuid4>`. Used for correlation, idempotency, and cancellation. |
| **Circuit breaker** | A safeguard that stops the swarm when a resource limit (time, tokens, cost, retries) is exceeded. |

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
