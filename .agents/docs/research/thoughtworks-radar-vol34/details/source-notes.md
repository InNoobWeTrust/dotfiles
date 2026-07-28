# Vol 34 Source Notes

> Research leaf — fidelity and theme extracts. Parent: [thoughtworks-radar-vol34.md](../thoughtworks-radar-vol34.md)

## Source

| Field | Value |
|---|---|
| Title | Technology Radar, Volume 34 |
| Publisher | Thoughtworks |
| Date | April 2026 (TAB meeting Bengaluru, March 2026) |
| PDF | https://www.thoughtworks.com/content/dam/thoughtworks/documents/radar/2026/04/tr_technology_radar_vol_34_en_1.pdf |
| Extracted | 2026-07-28 (local PDF text extract for research) |

Disclaimer: paraphrases and mappings are ours. Official ring placements and blip wording belong to Thoughtworks. Do not treat this leaf as a legal substitute for the PDF.

---

## Theme extracts (compressed)

### 1. Evaluating technology in an agentic world

- Semantic diffusion: terms like **spec-driven development** and **harness engineering** overlap before meanings stabilize.
- Tool churn: many tools &lt;1 month old; single maintainer + coding agent → sustainability questions.
- **Codebase cognitive debt**: adopt AI solutions without mental models → systems harder to reason about.

### 2. Retaining principles, relinquishing patterns

- Revisit pair programming, zero trust, **mutation testing**, **DORA**, clean code, deliberate design, testability, **accessibility**.
- CLI resurgence as primary interface for agentic tools.
- Consider **agent topologies** alongside team topologies; rethink feedback cycles.
- Measuring **collaboration quality** with coding agents redefines “developer work.”

### 3. Securing permission-hungry agents

- Useful agents want broad access (private data, comms, real systems) — e.g. OpenClaw, swarm coordinators.
- Simon Willison **lethal trifecta**: private data + untrusted content + external action ≈ default useful agent.
- Prompt injection; creative exfiltration; eroded approve/deny chokepoints without malice.
- Safe systems: **pipelines of constrained agents**, monitoring, control — not monolithic omni-agents.
- **Agent Skills** as controlled alternative to always-MCP; durable agents; prevent instruction bloat.

### 4. Putting coding agents on a leash

**Feedforward** (before generation):

- Agent Skills (JIT modular instructions)
- Skill catalogs / plugin marketplaces (e.g. Superpowers)
- Spec-driven frameworks (GitHub Spec Kit, OpenSpec)

**Feedback** (after action, for self-correction):

- Deterministic gates: compilers, linters, type checkers, tests — **in the agent workflow**
- Stronger sensors: cargo-mutants / mutation tools, WuppieFuzz, CodeScene
- Architecture drift: structural rules + LLM evaluation

---

## Crosswalk to prior research in this repo

| Prior map (agent-improvement-techniques) | Vol 34 analog |
|---|---|
| Spec-as-docs | Spec-driven / Spec Kit / OpenSpec / curated instructions |
| Just-in-time context / progressive disclosure | Progressive context disclosure + Agent Skills |
| Context compaction / structured notes | Context engineering + context graph / Beads |
| Evaluator–optimizer | Feedback sensors + DeepEval (LLM side) |
| Multi-agent panels | Team of coding agents (Assess); swarms (Caution) |
| ACI | Skills vs MCP; CLI-first caution; LSP code intelligence |
| Trajectory / SOAR habits | Feedback flywheel; Ralph loop (fresh context iterations) |

Vol 34 adds industrial weight to **mutation**, **a11y**, **toxic flow**, **collaboration metrics**, and **instruction bloat** that the paper-analog map under-emphasized.

---

## Non-goals of our research use

1. Endorsing every Assess tool as production default.
2. Replacing repo quality-layer pedagogy with a brand list.
3. Implementing RL training (Agent Lightning, agentic RL environments) as skills.
4. Mirroring TW Caution as absolute ban — use as risk framing.

---

## Promotion criteria (when something leaves research/)

Per [research/INDEX.md](../../INDEX.md): independent review, one accepted use, home under a battle-tested section INDEX. For Vol 34 items, preferred promotion targets:

- quality-tooling (mutation, a11y, sensors, metrics) — **this pass**
- skills-and-rules (instruction bloat, MCP-not-default, feedback flywheel)
- agentic-qa (browser component testing alignment)
- project-lifecycle (DORA / collaboration metrics for leads)
