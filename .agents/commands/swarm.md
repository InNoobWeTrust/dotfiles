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
2. Invoke ALL nodes in parallel (same prompt, different personas)
3. Collect all JSON responses
4. Synthesize into unified output with a final swarm-node pass
```

**Critical:** Do NOT run a single node and call it a swarm. A swarm requires:
- 3+ agents with distinct viewpoints/perspectives
- Parallel execution (not sequential)
- A synthesis step to merge divergent outputs

## kilo-swarm interface

```
./.local/bin/kilo-swarm -m MODEL -p PERSONA -i INPUT_FILE
echo "input" | ./.local/bin/kilo-swarm -m MODEL -p PERSONA
```

| Flag | Required | Description |
|------|----------|-------------|
| `-m MODEL` | yes | Model identifier |
| `-p PERSONA` | yes | Persona/instruction string (user message) |
| `-i FILE` | no | Input file attached via `-f`; default: stdin |
| `--dry-run` | no | Print command without executing |

**Output:** extracted JSON to stdout. Always exits 0; returns `{}` on empty/invalid response.

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

### Step 2: Run All Nodes in Parallel
Invoke multiple `kilo-swarm` calls simultaneously, each with a different persona:

```bash
# Parallel node 1
echo '{"topic":"..."}' | ./.local/bin/kilo-swarm -m "kilo/x-ai/grok-code-fast-1:optimized:free" -p 'You are a [PERSONA1]. Return JSON: {...}'

# Parallel node 2  
echo '{"topic":"..."}' | ./.local/bin/kilo-swarm -m "kilo/x-ai/grok-code-fast-1:optimized:free" -p 'You are a [PERSONA2]. Return JSON: {...}'

# Parallel node 3
echo '{"topic":"..."}' | ./.local/bin/kilo-swarm -m "kilo/x-ai/grok-code-fast-1:optimized:free" -p 'You are a [PERSONA3]. Return JSON: {...}'
```

### Step 3: Synthesize
Merge all node outputs into a final synthesis pass using a stronger model:

```bash
# Synthesis pass
echo '{"node1":{...},"node2":{...},"node3":{...}}' | ./.local/bin/kilo-swarm -m "openai/gpt-5.4" -p 'You are a SYNTHESIS ENGINE. Merge these perspectives into unified output. Return JSON: {...}'
```

### Step 4: Return Results
Present the synthesized output to the user with a brief explanation of the swarm approach.

## Persona Library

Domain configs live in `~/.agents/skills/swarm-orchestrator/references/`.
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
conventions only. This command does not require you to follow those phases.

When using this command, copy or adapt **one** persona from those files instead
of trying to recreate the full pipeline mechanically.

## Hard-Coded Model Defaults

Use fixed defaults and start immediately unless the user explicitly asks to
override models.

These defaults are intentionally opinionated for this repo's setup:

- They bias toward included or free models first.
- They follow `.agents/benchmark-report-*.md` guidance to avoid burning
  paid provider usage on high-frequency planning and routing work.
- They reuse model families already present in `.agents/agents/`.

| Use case | Default model | Why |
|----------|---------------|-----|
| Broad intake / extraction | `kilo/x-ai/grok-code-fast-1:optimized:free` | Free and fast; good enough for lightweight structured extraction |
| Planning / spec / recommendation JSON | `github-copilot/gpt-5-mini` | Included or unlimited in current setup; good quality floor for structured planning |
| Heavier critical synthesis | `openai/gpt-5.4-mini` | Use when the one-pass result is important enough to justify a stronger model |

If the user explicitly asks for fresher model research, use `/benchmark-agents`.
Otherwise, keep these defaults and run.

## Examples

### Proper Swarm (Multiple Parallel Nodes)

```bash
# Node 1: Economist (with web search for current data)
echo '{"topic":"AI impact on jobs"}' | ./.local/bin/kilo-swarm \
  -m "github-copilot/gpt-5-mini" \
  -p 'You are an ECONOMIST with web search access. Search for recent data, then Return JSON: {"role":"economist","findings":["insight1","insight2","insight3"]}'

# Node 2: Ethicist (with web search for case studies)
echo '{"topic":"AI impact on jobs"}' | ./.local/bin/kilo-swarm \
  -m "github-copilot/gpt-5-mini" \
  -p 'You are an ETHICIST with web search access. Search for relevant case studies, then Return JSON: {"role":"ethicist","findings":["insight1","insight2","insight3"]}'

# Node 3: Engineer (with web search for technical perspectives)
echo '{"topic":"AI impact on jobs"}' | ./.local/bin/kilo-swarm \
  -m "github-copilot/gpt-5-mini" \
  -p 'You are an ENGINEER with web search access. Search for technical analysis, then Return JSON: {"role":"engineer","findings":["insight1","insight2","insight3"]}'

# Synthesis pass
echo '{"economist":{...},"ethicist":{...},"engineer":{...}}' | ./.local/bin/kilo-swarm \
  -m "openai/gpt-5.4" \
  -p 'Merge these perspectives into unified output. Return JSON: {"unified_answer":"","cross_cutting_themes":[],"practical_synthesis":""}'
```

## Upgrade Guidance

| Use case | Default | Upgrade when |
|----------|---------|--------------|
| Broad extraction | `kilo/x-ai/grok-code-fast-1:optimized:free` | The input is dense, ambiguous, or repeatedly produces weak JSON |
| Structured planning/recommendation | `github-copilot/gpt-5-mini` | The result is high-stakes or needs stronger long-form reasoning |
| Critical single-pass synthesis | `openai/gpt-5.4` | The output quality matters more than cost or latency |

Manual upgrade options:

- Use `google/gemini-2.5-flash` when context size matters more than absolute
  coding depth.
- Use `openai/gpt-5.4` or `github-copilot/claude-sonnet-4.6` when the output is
  critical enough to justify a stronger premium model.
- Use `vllm/kCode` only for experimental ultra-cheap execution; it is not the
  default quality floor.

## Common Mistakes to Avoid

- ❌ **Running one node and calling it a swarm** — That's a single agent, not a swarm
- ❌ **Running nodes sequentially** — Swarms require parallel execution for true diversity
- ❌ **Skipping synthesis** — Multiple perspectives without synthesis produces disjointed output

## Enabling Web Search for Research Tasks

By default, `swarm-node` is analysis-only. For research tasks requiring current
information, include web search capability in the persona:

```bash
# Example with web search enabled
echo '{"topic":"..."}' | ./.local/bin/kilo-swarm \
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
