# Agent Orchestration Design

**Use when:** Configuring models for multi-agent orchestration or writing prompts for different capability tiers.

---

## Key Insight: Orchestration ≠ Reasoning

[Jenova.ai Long-Context Agentic Orchestration Benchmark](https://www.jenova.ai/en/resources/jenova-ai-long-context-agentic-orchestration-benchmark-february-2026) (Feb 2026) — tested orchestration accuracy under 100k+ token context:

| Model | Accuracy | Cost/Query |
|---|---|---|
| Claude 4.5 Opus | 76% | $0.35 |
| Gemini 3.1 Pro | 74% | — |
| Gemini 3 Flash | 66% | $0.03 |
| DeepSeek V3.2 | 61% | $0.02 |
| Claude Sonnet 4.6 | 58% | $0.21 |
| GPT-5.2 | 48% | $0.10 |

**GPT-5.2 was fastest (2.5s) but least accurate.** Reasoning optimization ≠ orchestration capability.

**Takeaway:** The "smartest" model is not the best orchestrator. Evaluate separately.

---

## What Makes a Good Orchestrator

1. Understand intent
2. Frame sub-agent tasks
3. Stay coherent across long sessions
4. Reliably execute dispatch loop

**Does not need frontier reasoning.** Needs instruction-following stability under context pressure.

### Selection Criteria

| Criterion | Why |
|---|---|
| Context window | Must hold task + results (1M+ preferred) |
| Instruction following | No improvisation |
| Coherence at length | No drift across turns |
| Cost/rate limits | High frequency—runs every turn |
| Stability | Degradation hits entire pipeline |

### Anti-Patterns

- Using most capable model — wastes budget, may be less stable
- Using reasoning-heavy model without reasoning budget — weak instruction-following
- Ignoring rate limits on free models — exhausts shared pools

---

## Case Study: LongCat-2.0

**Model:** Meituan LongCat-2.0 (1.6T MoE, ~48B active, 1M context, MIT license)

**Benchmarks:**

| Benchmark | LongCat-2.0 | GPT-5.5 |
|---|---|---|
| SWE-bench Pro | 59.5 | 58.6 |
| Terminal-Bench 2.1 | 70.8 | — |
| SWE-bench Multilingual | 77.3 | — |
| FORTE | 73.2 | 77.8 |
| BrowseComp | 79.9 | — |

**Real-world evidence:**

> "Used for 3.6B tokens. Very good at (1) following instructions, (2) making a plan, (3) following that plan, (4) staying coherent at very high contexts."  
> — Reddit user, 3.6B tokens

> "Dependable workhorse that can navigate a codebase well and reliably execute what you tell it to do."  
> — HN user

> "Reliable executor, not a genius. That is the profile you want if the harness does the thinking and the model does the work."  
> — eesel.ai

**OpenRouter:** Top 3 globally by call volume as "Owl Alpha" for 2 months.

**Verdict:** Ideal orchestrator profile—follows instructions, stays coherent at 1M context.

---

## Prompt Engineering for Different Tiers

Research: [SuperPrompts.app](https://superprompts.app/blog/best-practices-for-prompt-engineering-llms-in-2026) (Jul 2026), [arXiv:2604.27891](https://arxiv.org/abs/2604.27891) (Apr 2026)

**The answer is neither "long" nor "short"—it's structured.**

### Principles

| Principle | Rationale |
|---|---|
| Critical rules first AND last | "Lost in the middle" affects all models |
| Numeric constraints | "Max 2 parallel", "Exactly ONE"—crisp, unambiguous |
| No motivational fluff | Just tell them |
| Clear section headers | `##` markers help navigation |
| Concise failure handling | 3-line escalation, not verbose protocol |
| Match style to training | GPT: detailed + formatting; Claude: concise + boundaries; Gemini: structured sections |

### Structure

```
## Core Rules          ← most critical, first
  - Rule 1
  - Rule 2

## Delegation Flow     ← step-by-step
  1. Step one
  2. Step two

## Failure Handling    ← concise escalation
  - Retry → Escalate → Self-execute

## Recap               ← critical rules repeated
  - Rule 1 again
  - Rule 2 again
```

---

## Rate Limit Budgeting (Free Models)

Free models on shared gateways typically have a combined request pool (e.g., 200 req/hr across all free models). Budget carefully:

| Agent Type | Frequency | Free? | Budget Impact |
|---|---|---|---|
| Orchestrator | Very high (every turn) | ✅ Yes | ~10-30 req/hr |
| Code navigator | Very high (every nav) | ❌ No | Use paid (lowest tier) |
| Implementation | Medium | ❌ No | Use paid |
| Test writer | Low | ✅ Yes | ~2-5 req/hr |
| Fallback | Low | ✅ Yes | ~1-3 req/hr |
| Research | Low | ✅ Yes | ~0-2 req/hr |

**Rule:** High-frequency → paid. Low-frequency → free. Keep free <15-20% of pool for burst headroom.

---

## Model Degradation Watchlist

Monitor for:

| Symptom | Action |
|---|---|
| Repeated skill reloading | Context coherence loss |
| Hanging midway | Provider-side degradation |
| False guardrail stops | Overly strict filtering |
| Quota draining faster | Efficiency changes |

**Known degradation (2026):**

| Model | Period | Evidence |
|---|---|---|
| GPT-5.6 family | Jul-Aug 2026 | r/codex threads, issue #35225, price cuts |
| GPT-5.5 | May 2026 | GitHub issue #21942 |
| Claude Opus 4.6 | Apr 2026 | VentureBeat report |

**Mitigation:** Keep 2-3 candidate models per role. Switch promptly on degradation.
