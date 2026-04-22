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
- `~/.agents/skills/swarm-intelligence/references/models/` — centralized model pools (`free.json`, `premium.json`)
- `~/.agents/skills/swarm-intelligence/references/domains/` — built-in domain configs (`code/`, `writing/`, `design/`, `pm/`, `slides/`, `skill-review/`)
- `~/.kilo/commands/swarm.md` — thin proxy that loads this skill

**Quick start:**
```bash
# Use a built-in domain
echo "Build a REST API" \
  | kilo-swarm -d ~/.agents/skills/swarm-intelligence/references/domains/code/config.json

# Research + spec only, from a file
kilo-swarm -d domains/writing/config.json -i brief.txt -p 2

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
model_pool_refs = ["free", "premium"]   ← names of model pool files to use
```

Model pools are centralized in `references/models/`:
- **`free.json`** — free tier models for high-volume passes and multi-model redundancy
- **`premium.json`** — premium models (from benchmark-report-20260419.md) for quality-critical synthesis and high-stakes passes; includes `quality_tiers` for synthesis/high_stakes/mid_tier selection

When running a swarm, use 2-3 models from the appropriate pool per persona in
parallel, then merge their outputs into one consensus JSON before passing to the
next phase. This eliminates individual model bias, hallucinations, and blind spots.
Every built-in domain config references both pools via `model_pool_refs`.

Built-in domain references: `code`, `writing`, `design`, `pm`, `slides`, `skill-review`.

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

   > **Phase 3 output is JSON only.** Makers produce code and config as structured
   > JSON output fields — they do NOT write to the file system. File system
   > materialization is handled by a separate, dedicated step after the swarm
   > completes. This is critical: file system writes are synchronous and cannot
   > be safely parallelized or isolated across agents.

## 4. Artifact Generation

Once Phase 3 achieves a 100% pass rate from the Breaker agents, the swarm's
output is a **structured JSON artifact** containing all code, configs, and other
content produced by the Makers. The swarm produces this JSON as its final output —
it does not write files directly.

**File system materialization is mandatory and must be delegated to a `code`
agent running with a premium model** (e.g., from `premium.json`). This agent
receives the swarm's JSON artifact and performs the actual file system writes.

**Why this separation is required:**
- File system writes are synchronous and blocking — they cannot be parallelized
  across multiple agents without race conditions and data loss.
- Isolated agent sandboxes cannot safely coordinate writes to the same directory
  tree; conflicts are unavoidable without a serializing layer.
- Premium models have superior instruction-following and lower hallucination rates,
  making them significantly better at applying complex, multi-file changes
  correctly and completely.
- Keeping artifact generation decoupled from materialization means the swarm
  can be retried, modified, or replaced without touching the file system.

**Handoff pattern:**
```
[Phase 3 Swarm] → structured JSON artifact
       ↓
[code agent (premium model — high_stakes tier)] → deserializes JSON → sequential, conflict-free file system writes
       ↓
[human review / git commit]
```

> Git operations require human approval — see the git-safety protocol in agent-instructions.md before committing.

The `code` agent applies writes sequentially, one file at a time, checking for
conflicts before each write. It is the single writer — no other agent in the
pipeline touches the file system.

## 5. Anti-Pattern Guards

Lessons from production multi-agent systems. Apply these unconditionally.

### Contract-First Rule (Code Domain)
**The plan is the product.** Phase 2 must produce concrete API contracts — actual
function signatures with types, class shapes, and data model definitions — before
distributing tasks. Brilliant agents building against a vague plan produce beautiful
components that don't fit together. Phase 3 Decompose must inject the relevant
contracts into each task so every Maker builds against defined interfaces, not guesses.

> *"A brilliant plan with mediocre agents produces working code. A vague plan with
> brilliant agents produces beautiful components that don't fit together."*

### Phantom Agent Detection
**Validate actions, not claims.** Agents will confidently report success with zero
work done (empty `code`, `pass` stubs, `# TODO` placeholders). The Breaker must
explicitly check for phantom output before any other quality check:
1. Is the `code` field non-empty?
2. Does it contain real logic (not just `pass` / `# TODO` / empty bodies)?
3. Do all `api_contracts` from the task appear as real symbols in the output?

The `kilo-swarm` node runner exits **2** when no valid JSON is extracted from the
agent response. Orchestrators must treat exit 2 as a phantom-agent signal and retry
the node (up to `run_agent_retry()` limit) before propagating failure.

### Deterministic-Before-LLM
**Use code when you can; use AI when you must.** Before invoking an agent for a
mechanical task, check whether a deterministic tool can do it faster and cheaper:
- Schema validation → `jq` / `python3 -c "json.loads(...)"`
- Syntax check → `ruff check` / `tsc --noEmit` before asking an agent to debug

Reserve LLM calls for tasks that genuinely require reasoning.

> **Note:** Git operations (merge, commit, push, branch writes) are **always
> human-gated. Agents must never run git write commands automatically.** Surface
> merge candidates and conflict reports to the human; let the human decide when
> and how to integrate branches.

### Swarm Writes Files Directly
**Swarm agents must never write to the file system.** This is not a preference —
it is a structural constraint. The swarm operates as a set of parallel,
isolated processes generating content. File system I/O is synchronous, serial,
and subject to race conditions when multiple writers target the same tree.
No amount of agent sophistication compensates for this fundamental mismatch.

The fix is mandatory and non-negotiable: route all file system writes through a
single `code` agent running a premium model. This agent is the serialization
point. It receives the swarm's JSON artifact and applies writes in a controlled,
sequential order. Any other pattern — parallel file writes from multiple agents,
direct I/O from swarm nodes, or bypassing the `code` agent — is an anti-pattern
that will produce corrupted or conflicting output.

> If you see a swarm agent writing files directly, stop. Extract the content as
> JSON, hand it to a premium `code` agent, and let that agent materialize the
> files.

### Surgical Recovery Over Full Retry
**The cost of failure should be proportional to the failure.** If Phase 3 output
is 90% correct, a full re-plan + re-provision + re-run is the wrong response.
The Maker-Fix persona is designed for surgical edits — it receives specific failures
from the Breaker and patches in place. Do not restart from Phase 1 unless the
specification itself is invalidated by the Breaker's findings.
