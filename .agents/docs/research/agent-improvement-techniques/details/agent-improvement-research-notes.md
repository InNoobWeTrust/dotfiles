# Research notes — Agent improvement techniques

> Leaf detail for [agent-improvement-techniques.md](../agent-improvement-techniques.md).  
> Load only when validating sources or deepening paper fidelity.  
> **Not** training recipes. Prompt-level analogs only for RL papers.

---

## Anthropic — Building effective agents (Dec 2024)

Source: [anthropic.com/engineering/building-effective-agents](https://www.anthropic.com/engineering/building-effective-agents)

| Pattern | Summary | Repo analog |
|---|---|---|
| Augmented LLM | Tools + retrieval + memory | Default agent loop |
| Prompt chaining | Fixed multi-step with gates | Skill phases; requirements → code-craft |
| Routing | Classify → specialized path | AGENTS skill routing; model tiers |
| Parallelization | Sectioning / voting | Swarm voting; multi-lens review |
| Orchestrator–workers | Dynamic subtasks + synthesize | Lead agent + Task/subagents |
| Evaluator–optimizer | Generate ↔ evaluate loop | bounded-iteration; reviewer; TDD |
| Agents | LLM + tools in a loop + env ground truth | Full harness agents |

**ACI (Appendix 2):** Treat tool design like HCI for juniors—clear docs, natural formats, absolute paths, poka-yoke parameters, test tool misuse. Invest as much in tools as in the system prompt.

Principles: simplicity, transparent planning, carefully crafted ACI.

---

## Anthropic — Effective context engineering for AI agents (Sep 2025)

Source: [anthropic.com/engineering/effective-context-engineering-for-ai-agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

Core thesis: **context is a finite attention budget** (context rot). Curate the smallest high-signal token set each turn.

| Practice | Summary | Repo analog |
|---|---|---|
| Right-altitude prompts | Not brittle if/else; not vague vibes | Rules + skill progressive disclosure |
| Minimal viable tools | Avoid overlapping tools | Skill routing; forbid tool sprawl |
| Canonical few-shots | Diverse examples, not edge-case laundry lists | Skill examples / templates |
| Just-in-time retrieval | Pointers + tools load data | codebase-exploration; memory paths |
| Progressive disclosure | Layered discovery | skills/INDEX → SKILL → references |
| Compaction | Summarize + new window; clear old tool results | Session handoff; dream cycle adjacency |
| Structured note-taking | External NOTES re-injected | `.agents/memory/` |
| Sub-agents | Isolate deep work; return short summaries | subagent-dispatch output contract |

---

## Karpathy-style (applied, not a single paper)

Public teaching/ops themes commonly attributed to Karpathy’s agent/software guidance:

| Theme | Operational meaning |
|---|---|
| Spec-as-docs | Specs and tests are the program for agents; chat is not durable. |
| Context-as-wiring-diagram | Give the model a map of how systems connect before deep dives. |
| Multi-agent panels | Multiple specialized perspectives outperform single generic agents on hard design. |

These are **practice labels** for backlog mapping, not a formal citation set. Prefer linking concrete repo skills over name-dropping.

---

## STAPO — Selective Trajectory-Aware Policy Optimization

- **ID:** [arXiv:2607.04963](https://arxiv.org/abs/2607.04963) (ACL 2026)
- **Domain:** RL training for LLM agents (ALFWorld, WebShop, search QA)
- **Problem:** *Trajectory neglect* — sparse/delayed rewards cause mid-horizon loss of goal/history focus.
- **Method:** Normalized entropy to find outlier steps; hierarchical group RL with trajectory-aware reward + trajectory-independent penalty.
- **Prompt analog only:** Periodic trajectory re-anchoring; detect “I’m thrashing” steps and force goal+history restatement; do not claim entropy-based training.

---

## RAPO — Retrieval-Augmented Policy Optimization

- **ID:** [arXiv:2603.03078](https://arxiv.org/abs/2603.03078)
- **Domain:** Agentic RL exploration
- **Problem:** Pure on-policy exploration is limited to the agent’s own outputs.
- **Method:** Hybrid-policy rollout over retrieved **step-level** off-policy traces; retrieval-aware gradient shaping.
- **Prompt analog only:** Before blind search, retrieve similar past step traces (memory / prior PRs / incident notes) and condition the next plan on them; prefer step granularity over whole-session paste.

---

## T-STAR — Tree-structured Self-Taught Agent Rectification

- **ID:** [arXiv:2604.07165](https://arxiv.org/abs/2604.07165) (*Reason in Chains, Learn in Trees…*)
- **Domain:** Multi-turn agent policy optimization
- **Problem:** Trajectory-level credit assignment ignores critical steps and cross-trajectory structure.
- **Method:** Merge trajectories into a Cognitive Tree; introspective valuation; **In-Context Thought Grafting** at divergence; surgical policy loss at critical nodes.
- **Prompt analog only:** Keep failed-branch notes; when a success branch exists, graft its reasoning at the fork into the active plan; multi-agent synthesis should contrast branches explicitly.

---

## SOAR — interpretation used in this repo

The handoff listed “SOAR: Observation-based learning.” That label collides with:

- Classic **Soar** cognitive architecture (procedural rules, impasses, chunking)
- Many unrelated SOAR acronyms (CV, robotics, quantization, meta-RL self-play)
- Anthropic’s insistence on **environment ground truth every step**

**Grooming decision (2026-07-23):** treat SOAR as a **self-observation loop**:

1. Act via tools.  
2. Observe actual results (tests, file state, errors)—not imagined success.  
3. Update notes / beliefs.  
4. Promote repeated successful procedures into memory or skills (chunking-like).

If a specific SOAR paper URL is supplied later, update this leaf and re-map.

---

## Source hygiene

| Source | Use in skills? |
|---|---|
| Anthropic engineering posts | Yes — name patterns, link, map to skills |
| Karpathy practice labels | Yes — as operational themes |
| STAPO / RAPO / T-STAR | Yes — **analogs only**; cite arXiv in docs; never imply trained STAPO/RAPO/T-STAR policies |
| Unresolved SOAR paper | Park; keep self-observation interpretation |

Last reviewed: 2026-07-23.
