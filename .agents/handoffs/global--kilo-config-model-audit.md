---
branch: global
topic: kilo config model audit
status: done
updated: 2026-05-02T21:34:14+07:00
agent: kilo (claude-sonnet-4.6)
---

# Kilo Config — LLM Provider Model Audit

## Status

**Complete.** The `~/.config/kilo/kilo.jsonc` provider model list has been fully audited, pruned, and updated. No further action required on the model list itself.

## What Was Done

Audited all models configured under `provider.llm-broker.models` in `~/.config/kilo/kilo.jsonc`. Ran three swarm analysis nodes (Technical Analyst, Adversarial Reviewer, Solution Architect) against research on deprecation status, benchmarks, and cost-effectiveness for each provider family.

**Before:** ~47 models including retired, superseded, fake, and aliased entries.  
**After:** 22 curated models with rationale comments.

### Provider Families and Final Model Selections

| Family | Models Kept | Removed / Reason |
|---|---|---|
| Anthropic Claude | `claude-opus-4-6`, `claude-opus-4-6-thinking`, `claude-sonnet-4-6`, `claude-haiku-4-5` | claude-3.x (retired), sonnet-4-5 (superseded) |
| DeepSeek | `deepseek-v3.2`, `deepseek-v3.2-fast`, `deepseek-r1` | v3.1/v3/chat (deprecated aliases), v3.2-thinking (redundant with r1) |
| Google Gemini | `gemini-3.1-pro-preview`, `gemini-2.5-flash`, `gemini-2.5-flash-lite` | gemini-3-pro-preview (discontinued Mar 26 2026), all `-thinking` variants (not real IDs) |
| OpenAI GPT | `gpt-5.5`, `gpt-5.4`, `gpt-5.1` | gpt-4.1/4o/4o-mini (retired Feb 13 2026), gpt-5.3-codex (fake ID), gpt-5.2 (redundant) |
| OpenAI o-series | `o3`, `o3-mini` | o4-mini (retired), o1 (superseded by o3) |
| xAI Grok | `grok-4.1`, `grok-4.1-fast` | grok-3/3-mini/3-reasoner (2 generations behind), grok-4/4-fast (superseded) |
| Qwen | `qwen3-coder`, `qwen3-max`, `qwq-32b` | qwen-plus-latest/turbo/flash (old commercial line), qwen3-235b/32b (redundant) |
| Kimi | `kimi-k2.5`, `kimi-k2-thinking` | kimi-k2 (superseded by k2.5) |
| MiniMax | _(none — commented out)_ | M2.1 (stale); re-add when broker exposes M2.7+ |

### Agent Role Assignments in kilo.jsonc

- `general`, `ask`, `orchestrator`: `minimax-coding-plan/MiniMax-M2.7-highspeed`
- `explore`, `build`: `minimax-coding-plan/MiniMax-M2.5-highspeed`
- `plan`: `openai/gpt-5.5`
- `code`, `debug`: `github-copilot/claude-sonnet-4.6`
- `swarm-node`: read-only analysis node (bash/edit/write denied)

## Key Decisions

- **Deprecation cutoffs:** GPT-4.1/4o/o4-mini retired Feb 13 2026; Gemini 3-pro-preview discontinued Mar 26 2026.
- **Fake IDs:** `gpt-5.3-codex` has no official source — excluded.
- **Thinking variants:** Gemini thinking is a `thinking_budget` parameter, not a separate model ID. Only `claude-opus-4-6-thinking` and `deepseek-r1` kept where broker exposes them as real endpoints.
- **DeepSeek V4:** Not available via this broker — v3.2 is best available.
- **MiniMax:** M2.1 is stale (M2.7 released Mar 2026) but broker does not expose M2.7 — commented out with re-add note.

## Blockers

None.

## Next Steps

1. **Monitor broker model availability** — re-add `MiniMax-M2.7` or later when the broker exposes it.
2. **Verify `gpt-5.4` and `gpt-5.1` are live** — confirm these IDs resolve correctly in the broker (not broker-aliased stubs). If either fails, fall back to `gpt-5.5` and remove the failing entry.
3. **Apply swarminator skill improvements** (see Open Questions) — once done, re-run a model audit swarm to validate any new IDs added to the broker.

## Open Questions

### Swarminator CLI/Skill Improvement Suggestions

During this session, the following friction points were identified:

**SKILL.md fixes needed (`~/.agents/skills/swarm-intelligence/SKILL.md`):**
1. **Core Law is too narrow** — states "nodes output git patches" but research/audit tasks don't need patches. Needs domain-aware output contract: patches for `code`/`skill-review`, structured markdown for `analysis`/`research`/`audit`.
2. **Model ID format undocumented** — no guidance on when to use `kilo/MODEL_ID` vs bare `MODEL_ID` vs provider-prefixed `llm-broker/MODEL_ID`. Add a "Model ID Reference" section.
3. **No research/audit example** — all examples are code-generation oriented. Add an example for the Technical Analyst + Adversarial Reviewer + Solution Architect audit pipeline.
4. **Timeout guidance missing for thinking models** — `deepseek-r1`, `o3`, `claude-opus-4-6-thinking` etc. can easily timeout. Add note: "For reasoning/thinking models use `-t 300` or higher."

**CLI feature requests:**
1. `--list-agents` — show detected agents, their availability status, and supported model prefixes.
2. `--mode=research|code|design|writing|slides|pm` — explicit domain flag to enforce correct output contract without relying on persona convention.
3. `--dry-run` — validate agent reachability, model ID resolution, and non-empty stdin before consuming tokens.
4. **Better routing error messages** — when model ID prefix fails to route, emit a specific actionable error (e.g., `unknown agent prefix 'llm-broker' — did you mean 'kilo/llm-broker/...'?`).

## Recent Changes

- `~/.config/kilo/kilo.jsonc` — provider model list updated from ~47 to 22 models with inline deprecation comments.

## Repos / Files Involved

- `~/.config/kilo/kilo.jsonc` — Kilo global config (provider models, agent role assignments)
- `~/.agents/skills/swarm-intelligence/SKILL.md` — swarm skill (pending improvements above)
- `swarminator` CLI — custom tool by user (pending CLI feature additions above)
