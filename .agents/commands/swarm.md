---
description: >
  Run a swarm of multiple parallel agent nodes using the repo-local
  kilo-swarm wrapper. Activate when the user says "swarm", "run swarm",
  "multi-agent research", or wants diverse perspectives synthesized.
---

# Swarm — Multi-Agent Parallel Node Guidance

**A "swarm" means running MULTIPLE agents in parallel with different personas,
then synthesizing their outputs.** A single agent call is NOT a swarm — it's
just one node.

`kilo-swarm` is a **node runner** — one call = one agent invocation returning
JSON. To run a swarm, invoke multiple nodes in parallel, then merge the results.

## Swarm Execution Pattern

```
1. Generate N diverse personas (e.g., "philosopher", "scientist", "artist")
2. For EACH persona, invoke 2-3 cheap models in parallel (same persona, different models)
3. Collect all JSON responses per persona, merge into consensus per persona
4. Synthesize ALL persona-consensus outputs into unified output with a final strong model pass
```

**Critical Redundancy Rule:** Each persona must be run by 2-3 cheap models and merged BEFORE synthesis. This avoids individual model bias, hallucinations, and blind spots. A single model per persona defeats the purpose of a swarm.

**Why multi-model per persona:**
- Any single model can be wrong, biased, or miss perspective
- Running 2-3 cheap models (e.g., grok-code-fast-1, gpt-5-mini) and merging their answers catches individual failures
- The synthesis step then operates on corrected, multi-model-validated persona outputs

**A swarm requires:**
- 3+ distinct persona viewpoints
- 2-3 cheap models PER persona (run in parallel, then merge)
- Parallel execution across all persona-model combinations
- A final synthesis pass with a strong model to merge divergent outputs

## kilo-swarm interface

**Architecture:** Kilo Code is the orchestrator — it manages phases, parallelism, merging, and retry loops. `kilo-swarm` is the atomic primitive: one call = one agent invocation.

```
~/.local/bin/kilo-swarm -m MODEL -p PERSONA -i INPUT_FILE
echo "input" | ~/.local/bin/kilo-swarm -m MODEL -p PERSONA
```

| Flag | Required | Description |
|------|----------|-------------|
| `-m MODEL` | yes | Model identifier |
| `-p PERSONA` | yes | Persona/instruction string (user message) |
| `-i FILE` | no | Input file attached via `-f`; default: stdin |
| `-t SECONDS` | no | Timeout for the kilo run call (0 = disabled) |
| `--dry-run` | no | Print command + persona preview without executing |
| `--verbose` | no | Emit extra debug info to stderr |

**Output:** extracted JSON to stdout; logs to stderr.
**Exit codes:** `0` = valid non-empty JSON extracted; `2` = phantom output — no valid JSON found (retry this node).

**JSON extraction:** uses `json.JSONDecoder.raw_decode()` — handles nested structures and escaped strings correctly. Fenced code blocks (` ```json `) are tried first.

## How To Run a Swarm

### Step 1: Define Diverse Personas
Generate 3-5 distinct viewpoints relevant to the task. Include web search
capability if research requires current information:

```bash
-p 'You are a RESEARCHER. Search for information and return JSON...'
```

Examples:
- Research: "historian", "economist", "ethicist", "engineer"
- Creative: "poet", "critic", "technician", "audience member"
- Analysis: "advocate", "skeptic", "analyst", "pragmatist"

### Step 2: Run Each Persona with 2-3 Cheap Models in Parallel
**Critical:** Do NOT run one model per persona. Run 2-3 cheap models PER persona,
then merge their outputs. This redundancy eliminates individual model errors.

Invoke multiple `kilo-swarm` calls simultaneously for EACH persona:

```bash
# Persona 1: Economist — run on 3 free kilo models, then merge
echo '{"topic":"AI impact on jobs"}' | ~/.local/bin/kilo-swarm -m "kilo/kilo-auto/free" -p 'You are an ECONOMIST. Return JSON: {"findings":["..."]}'
echo '{"topic":"AI impact on jobs"}' | ~/.local/bin/kilo-swarm -m "kilo/x-ai/grok-code-fast-1:optimized:free" -p 'You are an ECONOMIST. Return JSON: {"findings":["..."]}'
echo '{"topic":"AI impact on jobs"}' | ~/.local/bin/kilo-swarm -m "kilo/inclusionai/ling-2.6-flash:free" -p 'You are an ECONOMIST. Return JSON: {"findings":["..."]}'
# Merge these 3 into one consensus JSON

# Persona 2: Ethicist — run on 3 free kilo models, then merge
echo '{"topic":"AI impact on jobs"}' | ~/.local/bin/kilo-swarm -m "kilo/bytedance-seed/dola-seed-2.0-pro:free" -p 'You are an ETHICIST. Return JSON: {"findings":["..."]}'
echo '{"topic":"AI impact on jobs"}' | ~/.local/bin/kilo-swarm -m "kilo/nvidia/nemotron-3-super-120b-a12b:free" -p 'You are an ETHICIST. Return JSON: {"findings":["..."]}'
echo '{"topic":"AI impact on jobs"}' | ~/.local/bin/kilo-swarm -m "kilo/stepfun/step-3.5-flash:free" -p 'You are an ETHICIST. Return JSON: {"findings":["..."]}'
# Merge these 3 into one consensus JSON

# Persona 3: Engineer — run on 3 free kilo models, then merge
echo '{"topic":"AI impact on jobs"}' | ~/.local/bin/kilo-swarm -m "kilo/kilo-auto/free" -p 'You are an ENGINEER. Return JSON: {"findings":["..."]}'
echo '{"topic":"AI impact on jobs"}' | ~/.local/bin/kilo-swarm -m "kilo/x-ai/grok-code-fast-1:optimized:free" -p 'You are an ENGINEER. Return JSON: {"findings":["..."]}'
echo '{"topic":"AI impact on jobs"}' | ~/.local/bin/kilo-swarm -m "kilo/inclusionai/ling-2.6-flash:free" -p 'You are an ENGINEER. Return JSON: {"findings":["..."]}'
# Merge these 3 into one consensus JSON
```

### Step 3: Synthesize
Merge all persona-consensus outputs into a final synthesis pass using a **strong model**:

```bash
# Synthesis pass — use frontier model for quality
echo '{"economist":{...},"ethicist":{...},"engineer":{...}}' | ~/.local/bin/kilo-swarm \
  -m "openai/gpt-5.4" \
  -p 'Merge these multi-model-validated perspectives into unified output. Return JSON: {"unified_answer":"","cross_cutting_themes":[],"practical_synthesis":""}'
```

### Step 4: Return Results
Present the synthesized output to the user with a brief explanation of the swarm approach.

## Domain Configs

For built-in domain-driven swarms, use
`~/.agents/skills/swarm-intelligence/SKILL.md` as the source of truth.
It defines:
- the domain config schema
- the built-in domain files in `~/.agents/skills/swarm-intelligence/references/`
- the recommended `model_selection` metadata for each domain

Domain configs live in `~/.agents/skills/swarm-intelligence/references/`.
These files are useful as **persona libraries**. Copy or adapt the persona text
you need for the current pass.

| Domain | File | Pipeline |
|--------|------|----------|
| Software | `code.json` | Business/Tech → Architecture → Code |
| Writing | `writing.json` | Audience/Content → Outline → Sections |
| Design | `design.json` | UX/Systems → Design → Components |
| Product | `pm.json` | Product/Business → Spec → Features |
| Slides | `slides.json` | Communications/Audience → Structure → Slides |

The config files may still use phase-oriented key names. Treat those as storage
conventions only when doing ad-hoc node runs from this command.

Some built-in configs also include a `model_selection` block with recommended
per-phase defaults. Treat those as suggestions unless your orchestrator reads
them explicitly.

When using a built-in domain such as `code`, `writing`, `design`, `pm`, or
`slides`, read `~/.agents/skills/swarm-intelligence/SKILL.md` first, then use
the selected reference file as the source for personas and recommended models.

When using this command for an ad-hoc swarm, copy or adapt **one** persona from
those files instead of trying to recreate the full pipeline mechanically.

## Model Selection

For built-in domain configs, use
`~/.agents/skills/swarm-intelligence/SKILL.md` plus the selected reference
file's `model_selection` block for recommended models.

Use the defaults below only for generic ad-hoc swarms or when the domain config
has not been consulted yet. Bias toward free/included models for high-frequency
work; upgrade only when quality or complexity justifies it.

| Tier | Model | Use for |
|------|-------|---------|
| Free (kilo) | `kilo/kilo-auto/free` | Auto-selection from free models |
| Free (kilo) | `kilo/x-ai/grok-code-fast-1:optimized:free` | High-volume node passes, lightweight structured extraction |
| Free (kilo) | `kilo/bytedance-seed/dola-seed-2.0-pro:free` | ByteDance research model |
| Free (kilo) | `kilo/inclusionai/ling-2.6-flash:free` | Lightweight flash model |
| Free (kilo) | `kilo/nvidia/nemotron-3-super-120b-a12b:free` | NVIDIA large model |
| Free (kilo) | `kilo/stepfun/step-3.5-flash:free` | Stepfun flash model |
| Free (openrouter) | `openrouter/openrouter/free` | OpenRouter aggregated free tier |
| Mid (included) | `github-copilot/gpt-5-mini` | Planning, spec, recommendation JSON; good default for most nodes |
| Mid (self-hosted) | `vllm/kCode` | Coding-heavy tasks; more capable than the cheap models, but below frontier models like `openai/gpt-5.4` and `openai/gpt-5.4-mini` |
| Strong | `openai/gpt-5.4-mini` | High-stakes synthesis or complex reasoning where mid-tier falls short |
| Frontier | `openai/gpt-5.4` | Critical single-pass output where quality matters more than cost |
| Frontier (alt) | `github-copilot/claude-sonnet-4.6` | Strong reasoning and coding; alternative to `gpt-5.4` |

**Large context:** Use `kilo/google/gemini-2.5-flash-lite` when input size is the
bottleneck and absolute reasoning depth is secondary.

**Upgrade triggers:**
- Broad extraction → step up to `github-copilot/gpt-5-mini` when the input is dense,
  ambiguous, or repeatedly produces malformed JSON
- Planning/spec → step up to `vllm/kCode` or `openai/gpt-5.4-mini` when the result
  is high-stakes or needs stronger long-form reasoning
- Synthesis → step up to `openai/gpt-5.4` or `github-copilot/claude-sonnet-4.6`
  when output quality is non-negotiable

If the user explicitly asks for fresher model research, use `/benchmark-agents`.
Otherwise, keep these defaults and run.

## Examples

### Proper Swarm (Multiple Parallel Nodes)

```bash
# Node 1: Economist (with web search for current data)
echo '{"topic":"AI impact on jobs"}' | ~/.local/bin/kilo-swarm \
  -m "github-copilot/gpt-5-mini" \
  -p 'You are an ECONOMIST with web search access. Search for recent data, then Return JSON: {"role":"economist","findings":["insight1","insight2","insight3"]}'

# Node 2: Ethicist (with web search for case studies)
echo '{"topic":"AI impact on jobs"}' | ~/.local/bin/kilo-swarm \
  -m "github-copilot/gpt-5-mini" \
  -p 'You are an ETHICIST with web search access. Search for relevant case studies, then Return JSON: {"role":"ethicist","findings":["insight1","insight2","insight3"]}'

# Node 3: Engineer (with web search for technical perspectives)
echo '{"topic":"AI impact on jobs"}' | ~/.local/bin/kilo-swarm \
  -m "github-copilot/gpt-5-mini" \
  -p 'You are an ENGINEER with web search access. Search for technical analysis, then Return JSON: {"role":"engineer","findings":["insight1","insight2","insight3"]}'

# Synthesis pass
echo '{"economist":{...},"ethicist":{...},"engineer":{...}}' | ~/.local/bin/kilo-swarm \
  -m "openai/gpt-5.4" \
  -p 'Merge these perspectives into unified output. Return JSON: {"unified_answer":"","cross_cutting_themes":[],"practical_synthesis":""}'
```

## Common Mistakes to Avoid

- ❌ **Running one model per persona** — Single models can be wrong, biased, or hallucinate. Always run 2-3 cheap models per persona and merge.
- ❌ **Running one node and calling it a swarm** — That's a single agent, not a swarm
- ❌ **Running nodes sequentially** — Swarms require parallel execution for true diversity
- ❌ **Skipping synthesis** — Multiple perspectives without synthesis produces disjointed output
- ❌ **Skipping multi-model merge before synthesis** — The merge step is where individual model errors are caught and corrected

## Enabling Web Search for Research Tasks

By default, `swarm-node` is analysis-only. For research tasks requiring current
information, include web search capability in the persona:

```bash
# Example with web search enabled
echo '{"topic":"..."}' | ~/.local/bin/kilo-swarm \
  -m "github-copilot/gpt-5-mini" \
  -p 'You are a RESEARCHER with web search access. Search for relevant information, then Return JSON: {...}'
```

When instructed or when the task requires current/recent data, agents should use
web search tools to gather evidence before returning findings.

## Limitations

- Each `kilo-swarm` call is a new session — no shared memory between nodes
- `swarm-node` agent has write/bash tools denied by default — enable explicitly in persona if needed
- `depends_on` task ordering is not enforced; orchestrator must handle if needed
- Parallel execution is the orchestrator's responsibility — this command provides the primitive only
