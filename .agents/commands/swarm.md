---
description: >
  Proxy command that delegates to the swarm-intelligence skill.
  Loads the skill for domain configs, persona definitions, and model selection.
---

# Swarm — Multi-Agent Parallel Node Guidance

This command is a thin proxy that loads the **swarm-intelligence skill** for
domain configurations and delegates execution to `kilo-swarm`.

## Primary Action: Load the Skill

**Read `~/.agents/skills/swarm-intelligence/SKILL.md` first.** It defines:
- Domain config schema (phase1_a/b, phase2_forward/review/revise, phase3_*)
- Centralized model pools in `references/models/`
- Built-in domain configs in `references/domains/`

## Structure

```
references/
  models/
    free.json     # Free tier models for high-volume passes
    premium.json  # Premium models for quality-critical synthesis
  domains/
    code/         # Software development pipeline
    writing/      # Content writing pipeline
    design/       # UX/design pipeline
    pm/           # Product management pipeline
    slides/       # Presentation pipeline
    skill-review/ # Skill document review pipeline
```

## Quick Reference

### Running a Swarm

```bash
# Use a built-in domain
echo "Build a REST API" | kilo-swarm -d references/domains/code/config.json

# Custom domain (inline JSON)
kilo-swarm -d '{"name":"custom","phase1_a_persona":"...","phase1_b_persona":"...",...}' -i input.txt
```

### kilo-swarm Interface

```
~/.local/bin/kilo-swarm -m MODEL -p PERSONA [-i FILE] [-t SECONDS] [--dry-run] [--verbose]
```

| Flag | Required | Description |
|------|----------|-------------|
| `-m MODEL` | yes | Model identifier |
| `-p PERSONA` | yes | Persona/instruction string |
| `-i FILE` | no | Input file (default: stdin) |
| `-t SECONDS` | no | Timeout (0 = disabled) |
| `--dry-run` | no | Preview without executing |

**Exit codes:** `0` = valid JSON; `2` = phantom output (retry).

### Multi-Model-Per-Persona (Mandatory for Phase 1)

Run 2-3 models per persona in parallel, merge their outputs into one consensus JSON:

```bash
# Persona X on 3 free models in parallel
echo '{"topic":"..."}' | kilo-swarm -m "kilo/kilo-auto/free" -p 'You are a PERSONA. Return JSON...'
echo '{"topic":"..."}' | kilo-swarm -m "kilo/x-ai/grok-code-fast-1:optimized:free" -p 'You are a PERSONA. Return JSON...'
echo '{"topic":"..."}' | kilo-swarm -m "kilo/inclusionai/ling-2.6-flash:free" -p 'You are a PERSONA. Return JSON...'
# Merge into one consensus JSON before next phase
```

### Model Selection (from skill's model pools)

**Free tier** (`references/models/free.json`): grok-code-fast-1, dola-seed-2.0-pro, ling-2.6-flash, nemotron-3-super, step-3.5-flash, vllm/kCode

**Premium tier** (`references/models/premium.json`):
- `github-copilot/gpt-5-mini` — unlimited on Copilot, mid-tier synthesis
- `openai/gpt-5.4-mini` — high-stakes synthesis
- `google/gemini-2.5-flash` — high-volume, large context (1M tokens)
- `google/gemini-2.5-pro` — high-context complex analysis
- `openai/gpt-5.4` — frontier quality synthesis
- `github-copilot/claude-sonnet-4.6` — strong reasoning/coding

**Quality tiers** from premium.json:
| Tier | Models |
|------|--------|
| synthesis | openai/gpt-5.4, github-copilot/claude-sonnet-4.6 |
| high_stakes | openai/gpt-5.4-mini, google/gemini-2.5-pro |
| mid_tier | github-copilot/gpt-5-mini, google/gemini-2.5-flash, minimax-coding-plan/MiniMax-M2.7-highspeed |

## Common Mistakes

- ❌ **One model per persona** — Must run 2-3 and merge
- ❌ **One node and calling it a swarm** — That's single agent
- ❌ **Sequential execution** — Must be parallel for true diversity
- ❌ **Skipping synthesis** — Merge divergent outputs with a strong model
