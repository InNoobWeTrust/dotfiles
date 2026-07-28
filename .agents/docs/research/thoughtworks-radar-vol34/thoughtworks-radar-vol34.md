# Thoughtworks Technology Radar Vol 34 — Agent & Quality Research Map

> **Status:** research-phase (not battle-tested).  
> **Source:** Thoughtworks Technology Radar, Volume 34, April 2026  
> **PDF:** [tr_technology_radar_vol_34_en_1.pdf](https://www.thoughtworks.com/content/dam/thoughtworks/documents/radar/2026/04/tr_technology_radar_vol_34_en_1.pdf)  
> **Audience:** skill authors, quality-tooling workshop owners, leads evolving agent harnesses.  
> **Language:** English-first (agent-searchable wiki).

Maps Vol 34 blips that matter for **coding agents**, **harness engineering**, and **quality feedback loops** onto this repo’s skills/docs. Promote only after review and one accepted use.

Deep leaves:

| Leaf | Read when |
|---|---|
| [Blip catalog (agent-relevant)](./details/blip-catalog.md) | Need ring + one-line takeaway per blip |
| [Quality gaps for Part 2](./details/quality-gaps-for-part2.md) | Enriching quality-tooling slides/docs |
| [Source notes & themes](./details/source-notes.md) | Themes, citation fidelity, non-goals |

---

## Problem statement

Vol 34 is unusually dense on agent practice: context engineering, Agent Skills, harness feedforward/feedback, permission-hungry agents, and quality sensors (mutation, fuzz, behavioral hotspots). This repo already encodes many of the same ideas under different names (`skills`, progressive disclosure, memory, code-craft, quality layers). The gap is **named industry alignment** + **missing quality tool families** in Part 2 (mutation testing, a11y automation, agent-session feedback sensors, collaboration metrics).

---

## Themes → repo translation

| TW theme (Vol 34) | Core claim | Repo home today | Coverage |
|---|---|---|---|
| Evaluating tech in an agentic world | Semantic diffusion (spec-driven / harness engineering); tool churn; **codebase cognitive debt** | `docs/`, `skills-and-rules`, research maps | **Partial** — we name skills/rules; cognitive debt less explicit |
| Retain principles, relinquish patterns | Clean code, testability, a11y, mutation testing, DORA, CLI resurgence | `code-craft`, `quality-tooling`, `agentic-qa` | **Strong** craft; **Partial** metrics/mutation/a11y |
| Securing permission-hungry agents | Lethal trifecta; constrained agent pipelines; Skills vs MCP-default; toxic flow | `autonomy-safety`, `execution-safety`, `git-safety` | **Partial** — strong HITL; weak toxic-flow tooling |
| Putting coding agents on a leash | **Feedforward** (skills, specs) + **feedback sensors** (lint/type/test/mutation) | skills pack + quality layers | **Strong** feedforward; **Partial** sensors wired *into agent loop* |

---

## Coverage matrix (high signal)

Legend: **Strong** / **Partial** / **Gap** relative to this dotfiles agent stack.

### Adopt / Trial techniques we already lean on

| Blip | Ring | Repo alignment | Action |
|---|---|---|---|
| Context engineering | Adopt | `memory`, progressive disclosure, skill index | Keep; name “context engineering” in docs |
| Curated shared instructions | Adopt | `AGENTS.md`, rules, project templates | Strong — template distribution is the product |
| Structured output from LLMs | Adopt | skill output contracts, subagent-dispatch | Partial — formalize more JSON/schema contracts |
| Zero trust for agents | Adopt | autonomy/execution/git safety | Partial — SPIFFE/identity out of scope for personal stack |
| Agent Skills | Trial | entire `.agents/skills` pack | Strong — already first-class |
| Progressive context disclosure | Trial | skills INDEX → SKILL → refs; docs progressive disclosure | Strong |
| Feedback sensors for coding agents | Trial | quality layers + local loop guidance | **Gap in slides** — wire sensors *into agent session* explicitly |
| Mutation testing | Trial | barely in quality-tooling | **Gap** — add to layers + Part 2 |
| Sandboxed execution | Trial | worktrees / execution-safety spirit | Partial — document Dev Containers / sandbox defaults |
| Mapping smells → refactorings | Trial | code-craft + failure patterns | Partial — skill-level smell maps optional |

### Assess techniques worth watching

| Blip | Why it matters here | Candidate later home |
|---|---|---|
| Architecture drift reduction w/ LLMs | Deterministic fitness (ArchUnit/Spectral) + LLM fix loop | `reviewer` + architecture fitness |
| Code intelligence as agentic tooling | LSP/AST tools beat text search for renames | harness tool design / ACI |
| Feedback flywheel | Retro on harness (skills + sensors), not only product code | skills-and-rules maintaining |
| Measuring collaboration quality | First-pass acceptance, rework, review burden — not LOC | quality-tooling management metrics |
| Ralph loop | Fresh-context iterative converge-to-spec | bounded-iteration / research only |
| Team of coding agents vs swarms | Small deliberate teams vs large swarms | swarm-intelligence (swarm = Caution) |
| Skills as executable onboarding | `/setup` skills > static README | project-foundation / onboarding skills |
| Toxic flow analysis + Agent Scan | Skills/MCP supply chain | security-auditor research; caution third-party skills |
| MITRE ATLAS | AI threat taxonomy | security docs |

### Caution blips (do not cargo-cult)

| Blip | Operational habit |
|---|---|
| Agent instruction bloat | Keep AGENTS.md minimal; progressive load skills |
| Codebase cognitive debt | Pair velocity with maps, fitness functions, human understanding |
| Coding agent swarms | Prefer small agent teams; swarm only with strong specs + tests |
| Coding throughput as productivity | Prefer first-pass acceptance + DORA, never LOC/PR count alone |
| Ignoring durability | Long workflows need durable state (framework or platform) |
| MCP by default | Prefer good CLI/scripts; MCP when governance multi-tenant needs it |
| AI-accelerated shadow IT | Sandbox noncoder prototypes; promote only durable paths |

---

## Tools / platforms — quality & agent ops shortlist

| Item | Ring | Layer fit (our model) | Part 2 relevance |
|---|---|---|---|
| Axe-core | Adopt | Evidence / a11y quality attribute | **Add** — missing from Part 2 |
| cargo-mutants (+ Stryker/PIT) | Trial | Test evidence depth (mutation) | **Add** |
| CodeScene | Assess | Hotspots / AI-safe refactor targets | **Add** as hotspot option |
| WuppieFuzz | Assess | API fuzz / edge paths | Optional CI upgrade |
| Agent Scan | Assess | Agent supply-chain / toxic flow | Security deep-dive, not core Part 2 |
| DeepEval | Trial | LLM/agent eval (beyond code gates) | Agent product eval, not repo lint |
| Langfuse / Agent Trace / Git AI | Trial–Assess | Observability / AI code attribution | Management/ops, not inner loop |
| OpenSpec / GitHub Spec Kit / Superpowers | Assess | Spec-driven feedforward | Aligns with `requirements-driven-dev` |
| ty | Assess | Python type fast loop | Already in baselines |
| Dev Containers / Sprites | Trial–Assess | Sandbox execution | Security + agent isolation |
| Claude Code / Cursor | Adopt | Coding agent hosts | Out of quality-layer scope |

---

## Gap analysis (actionable for this repo)

| ID | Gap | Hurt | Candidate home |
|---|---|---|---|
| R1 | Part 2 omits **mutation testing** | Hollow green tests from AI | quality-tooling Layer 4 + slides |
| R2 | Part 2 omits **a11y automation** (Axe-core) | AI UI ships inaccessible by default | quality layers + agentic-qa cross-link |
| R3 | “Feedback sensors” not named as agent harness pattern | Sensors stay CI-only; agent doesn’t self-correct pre-commit | mental-model + slides |
| R4 | Hotspot tools stop at `scc`/Sonar | No behavioral CodeHealth for AI-safe zones | choosing-tools + comparison matrix |
| R5 | Management metrics lack **DORA rework** + **collaboration quality** | Teams optimize LOC/PR | management-metrics |
| R6 | No research map for Vol 34 | Skills evolve without industry radar anchor | this document |
| R7 | MCP-default / instruction bloat cautions under-documented | Skill authors over-MCP and over-AGENTS | skill-author / research only for now |

Non-goals for this research pass:

- Reproducing TW marketing copy as policy.
- Adopting every Assess tool.
- Training / RL environments (Agent Lightning, etc.) as skill work.
- Replacing battle-tested quality-tooling with radar brand lists.

---

## Prioritized backlog

| Prio | Item | Effort | Status target |
|---|---|---|---|
| P0 | Research map + catalog leaves | S | This pass |
| P1 | Enrich quality-tooling layers/tools for mutation, a11y, sensors, CodeScene | M | This pass |
| P2 | Update Part 2 EN/VI slides with missing families | M | This pass |
| P3 | Cross-link agentic-qa browser testing ↔ browser-based component testing | S | Optional follow-up |
| P4 | Skill-author note: instruction bloat + MCP-not-default | S | Later skill patch |
| P5 | Experiment: feedback flywheel checklist in maintaining-rules-and-skills | M | After use evidence |

---

## Related (battle-tested + research)

- [Agent improvement techniques](../agent-improvement-techniques/agent-improvement-techniques.md) — Karpathy/Anthropic/paper analogs  
- [Quality tooling](../../quality-tooling/INDEX.md) — layers, baselines, Part 2 deep-dive  
- [Agentic QA](../../agentic-qa/INDEX.md) — browser/executable QA  
- [Skills & rules](../../skills-and-rules/INDEX.md)  
- [Slides Part 2](../../slides/02_ai-quality-tooling-en.md)

---

## Citation

Thoughtworks Technology Advisory Board. *Technology Radar*, Volume 34, April 2026.  
https://www.thoughtworks.com/radar — PDF linked above.  
Rings (Adopt / Trial / Assess / Caution) are Thoughtworks positions, not this repo’s adoption decisions.
