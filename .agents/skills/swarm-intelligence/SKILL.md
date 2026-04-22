---
name: swarm-intelligence
description: >
  Multi-agent swarm pipeline for domain-agnostic parallel analysis and synthesis.
  Use this skill whenever the user says "swarm", "run swarm", "multi-agent", "parallel
  agents", "diverse perspectives", or wants a 3-phase Research → Spec → Execution
  pipeline via the kilo-swarm CLI. Activate when the task benefits from running
  multiple agents with distinct personas in parallel, then synthesizing their outputs.
  The kilo-swarm script is the Prime Node; domain configs in references/ drive all
  agent personas for code, writing, design, product management, and slides pipelines.
---

# Swarm Intelligence Pipeline

**Description:** Defines the operational protocol for a domain-agnostic 3-phase
multi-agent pipeline. The orchestrator passes a domain config that drives all
agent personas; the script (`kilo-swarm`) is a stateless proxy for the loops.

## Materialization (Kilo Code)

This SKILL is materialized via the `kilo-swarm` CLI script.

**Files:**
- `~/.local/bin/kilo-swarm` — bash orchestration script (the Prime Node)
- `~/.agents/skills/swarm-intelligence/references/` — built-in domain configs
- `~/.kilo/agent/swarm-node.md` — read-only swarm analysis agent (all phases)
- `~/.kilo/commands/swarm.md` — usage guide and model reference

**Quick start:**
```bash
# Use a built-in domain
echo "Build a REST API" \
  | kilo-swarm -d ~/.agents/skills/swarm-intelligence/references/code.json

# Research + spec only, from a file
kilo-swarm -d references/writing.json -i brief.txt -p 2

# Inline custom domain
kilo-swarm -d '{"name":"custom","phase1_a_persona":"...","phase1_b_persona":"...",...}' \
  -i input.txt
```

**How it maps to this SKILL:**

| SKILL concept | Implementation |
|---------------|---------------|
| Prime Node | `kilo-swarm` bash script |
| Domain config | `-d FILE\|JSON` argument (file path or inline JSON) |
| Persona injection | Domain JSON fields read at runtime, passed as message arg to `kilo run` |
| Parallel Phase 1 | bash `&` + `wait` on two `kilo run` calls |
| **Multi-model per persona** | Run each persona on 2-3 models from `free_model_pool` in parallel, merge before synthesis |
| Phase 2 adversarial loop | bash `for loop` (max 3), JSON `approved` field as gate |
| Phase 3 per-task Maker+Breaker | `run_task()` per task, batched parallel |
| Consensus check / retry | `run_agent_retry()` wrapper, up to 2 retries |
| Constrained JSON output | `swarm-node` agent + regex `extract_json()` |
| QA case injection | `__QA_CASES__` placeholder in breaker persona, substituted at runtime |

**JSON event format** (`kilo run --format json`):
```json
{"type":"text","part":{"text":"<assistant response text>"}}
```
Concatenate all `type=text` events to get the full response; then extract the
JSON object/array from within that text.

## 1. Core Directives

The `kilo-swarm` script is the **Prime Node (Orchestrator)**. Its objective is
not to solve the problem directly, but to route information, enforce schema
compliance, and manage the state of the swarm. It coordinates three distinct
swarm clusters: **[Research]**, **[Spec]**, and **[Execution]**.

All agent personas are defined in the **domain config** (`-d` argument). The
script loads them at startup — no hardcoded domain logic exists in the script.

## 2. Domain Config Schema

A domain config is a JSON object with these required fields:

```
phase1_a_label / phase1_a_persona / phase1_a_field
phase1_b_label / phase1_b_persona / phase1_b_field
phase2_forward_label / phase2_forward_persona
phase2_review_label  / phase2_review_persona
phase2_revise_label  / phase2_revise_persona
phase3_decompose_label / phase3_decompose_persona
phase3_maker_label     / phase3_maker_persona
phase3_maker_fix_label / phase3_maker_fix_persona
phase3_breaker_label   / phase3_breaker_persona   (use __QA_CASES__ placeholder)
```

Optional metadata:

```
model_selection = {
  phase1_a, phase1_b,
  phase2_forward, phase2_review, phase2_revise,
  phase3_decompose, phase3_maker, phase3_maker_fix, phase3_breaker,
  large_context_fallback, quality_override, quality_override_alt,
  free_model_pool   ← array of free models for multi-model-per-persona redundancy
}
```

These are recommended model defaults for humans or higher-level orchestrators.
The current `kilo-swarm` node runner does not apply `model_selection`
automatically.

**`free_model_pool`** lists all available free-tier models. When running a swarm
manually or with a higher-level orchestrator, use 2-3 models from this pool per
persona in parallel, then merge their outputs into one consensus JSON before
passing to the next phase. This eliminates individual model bias, hallucinations,
and blind spots. Every built-in domain config includes a `free_model_pool`.

Built-in domain references: `code`, `writing`, `design`, `pm`, `slides`.

## 3. Execution Pipeline (State Machine)

### Multi-Model-Per-Persona Principle

**Every persona must be run by 2-3 models in parallel, not one.** A single model
can be wrong, biased, or hallucinate. Running multiple cheap models with the same
persona and merging their outputs produces a corrected, consensus view before it
feeds into the next phase. Use models from `free_model_pool` for this redundancy.

```
persona X → model A  ┐
persona X → model B  ├─ merge → consensus JSON for persona X
persona X → model C  ┘
```

Apply this pattern to any phase where quality is critical. It is mandatory for
Phase 1 and strongly recommended for Phase 2 and Phase 3 high-stakes passes.

### Phase 1: Parallel Ingestion (The Research Swarm)
1. Receive raw input (requirements, briefs, ideas, etc.).
2. Broadcast the exact same raw input to `[Phase1-A]` and `[Phase1-B]` in parallel.
3. **For EACH persona: run 2-3 models from `free_model_pool` in parallel, then merge their outputs into one consensus JSON.** This is mandatory — a single model per persona is not sufficient.
4. Wait for both consensus JSON outputs.
5. *Consensus Check:* If either JSON is malformed, re-prompt that agent up to 2 times.

### Phase 2: Adversarial Design (The Spec Swarm)
1. Pass the merged Phase 1 JSON to `[Phase2-Forward]`.
2. **Recommended:** Run `[Phase2-Forward]` on 2-3 models and merge before review.
3. Pass the forward output to `[Phase2-Review]`.
4. *Consensus Check:* If the review agent flags critical vulnerabilities, feed the
   review back to the forward agent. Loop a maximum of 3 times.
5. Lock the final approved specification.

### Phase 3: Micro-Execution (The Execution Swarm)
1. Decompose the locked specification into single-unit tasks via `[Phase3-Decompose]`.
2. For each task, spawn a `[Phase3-Maker]`.
3. Feed the Maker's output to `[Phase3-Breaker]`.
4. **Recommended:** Run `[Phase3-Breaker]` on 2-3 models and merge; a multi-model
   breaker is harder to fool than a single-model one.
5. *Consensus Check:* If the Breaker rejects, the Maker rewrites. Maximum 2 retries.
   The Maker is not allowed to modify the specification, only the implementation.

## 4. Artifact Generation

Once Phase 3 achieves a 100% pass rate from the Breaker agents, artifacts are saved
to `OUTPUT_DIR/artifacts/`. A `summary.json` is written with run metadata.
