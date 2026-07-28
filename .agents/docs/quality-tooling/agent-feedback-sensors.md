# Agent Feedback Sensors

**Read when:** designing how coding agents self-correct before human review, or explaining Part 2 “inner loop vs governance” for agent harnesses.

> Industry label (Thoughtworks Technology Radar Vol 34, **Trial**): *feedback sensors for coding agents*.  
> Research map: [thoughtworks-radar-vol34](../research/thoughtworks-radar-vol34/thoughtworks-radar-vol34.md).

---

## Idea

Deterministic quality gates (format, lint, type/compile, tests, and optionally stronger checks) are not only **CI policy**. They are **sensors the agent can read**: exit codes and machine-readable output that trigger self-correction *during the coding session*, before commit.

| Loop | When | Typical sensors |
|---|---|---|
| **In-session (agent)** | Before “done” / before commit | formatter, linter, typecheck, unit tests (fast subset) |
| **Pre-commit / PR** | Human or hook | same + secrets, changed-file SAST |
| **CI / governance** | Merge/release | full tests, mutation (async), SCA, Sonar gates, a11y, fuzz |

**One tool rarely serves all three.** Fast local sensors feed the agent; heavy sensors stay async or gated.

---

## Feedforward vs feedback (harness)

| | Feedforward | Feedback sensors |
|---|---|---|
| Timing | Before generation | After the agent acts |
| Examples | Agent Skills, AGENTS.md, specs (OpenSpec / Spec Kit), curated templates | compiler, linter, type checker, test suite, mutation, custom structural tests |
| Goal | Correct first attempt | Self-correction without human steering every nit |

This matches the Vol 34 theme *Putting coding agents on a leash* without requiring a specific vendor IDE.

---

## Implementation patterns

1. **Make targets / scripts the agent must run** — documented in AGENTS.md or a skill; clear exit codes.
2. **Reviewer / checker subagent** — separate role runs sensors and returns failures (aligns with `reviewer` + `bounded-iteration`).
3. **Companion process** — watch/queryable checks while the implementer agent works.
4. **Hooks** — pre-commit and agent lifecycle hooks (harness-specific); still keep CLI runnable outside the hook.
5. **Custom structural tests** — cheap for agents to author; encode architecture rules the generic linter misses.

Prefer sensors that finish **before commit**. Post-commit-only feedback trains humans, not the agent session.

---

## Strength ladder (what to wire when)

| Priority | Sensor | Why |
|---|---|---|
| P0 | Format + lint + type/compile | Removes noise; catches “looks right” breaks |
| P0 | Unit / focused tests on touched paths | Behavior evidence |
| P1 | Secrets + dependency scan on change | Risk without full portfolio platform |
| P2 | Mutation on critical modules | Kills hollow green tests (see [extended-evidence-tools](./extended-evidence-tools.md)) |
| P2 | a11y automation on UI surfaces | Mandatory attribute in many markets |
| P3 | Architecture fitness + hotspot tools | Drift and AI-unsafe complexity zones |

---

## Anti-patterns

| Temptation | Why it fails |
|---|---|
| Sensors only in CI | Agent ships broken work; human becomes the linter |
| Every heavy scan on every agent turn | Loop too slow; agent skips checks |
| Sensors without machine-readable failure | Agent cannot fix what it cannot parse |
| Replacing sensors with “ask the LLM if code is good” | Non-deterministic; launders evidence |

---

## Related

- [Mental model](./mental-model.md) — quality layers  
- [Choosing tools](./choosing-tools.md) — fitness questions  
- [Extended evidence tools](./extended-evidence-tools.md) — mutation, a11y, fuzz, CodeScene  
- [Management metrics](./management-metrics.md) — collaboration quality, not LOC  
- Slides: Part 2 quality tooling  
