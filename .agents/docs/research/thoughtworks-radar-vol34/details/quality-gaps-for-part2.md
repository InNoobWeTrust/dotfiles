# Quality Gaps for Part 2 (from Radar Vol 34)

> Research leaf. Parent: [thoughtworks-radar-vol34.md](../thoughtworks-radar-vol34.md)  
> Consumed by: `docs/quality-tooling/*` and `docs/slides/02_ai-quality-tooling-*.md`

What Part 2 already taught well vs what Vol 34 shows we under-covered.

---

## Already covered (keep)

| Part 2 concept | Radar echo |
|---|---|
| Quality layers 1–9 | Feedback sensors = layers wired into agent loop |
| Two loops (inner vs governance) | Feedforward (skills/specs) vs feedback (gates) |
| Sonar as governance, not local linter | Governance platforms above native tools |
| OSS-first maturity path | Prefer deterministic CLIs agents can run |
| Stack baselines + fitness questions | “Don’t copy tool lists; evaluate fit” |
| Management: don’t report raw lint noise | Aligns with caution on throughput vanity metrics |

---

## Gaps to close (priority)

### P1 — Mutation testing (Layer 4 depth)

| | |
|---|---|
| **Radar** | Mutation testing **Trial**; cargo-mutants **Trial**; theme “leash” cites mutants + fuzz + CodeScene |
| **Why for AI** | AI writes high-coverage, assertion-light tests; mutation kills “perpetually green” suites |
| **Tools** | Stryker (JS/C#), PIT/Pitest (JVM), cargo-mutants (Rust), mutmut/cosmic-ray (Python ecosystem) |
| **Placement** | Local: module-scoped; CI: async/full suite; never only whole-repo on every PR day-one |
| **Part 2 slide** | New slide: “Coverage ≠ verification” |

### P1 — Accessibility automation (quality attribute)

| | |
|---|---|
| **Radar** | Axe-core **Adopt**; a11y as mandatory (e.g. European Accessibility Act) |
| **Why for AI** | Agents generate UI without a11y intent; regressions silent without automation |
| **Tools** | axe-core, axe-core Playwright/Cypress integrations, pa11y, Lighthouse a11y (complement) |
| **Placement** | CI + component/browser tests; link agentic-qa browser path |
| **Part 2 slide** | Alternatives table + optional baseline callout |

### P1 — Feedback sensors as harness pattern (not only CI)

| | |
|---|---|
| **Radar** | Feedback sensors for coding agents **Trial**; theme “Putting coding agents on a leash” |
| **Why** | Sensors that only run post-commit leave agents uncorrected during the session |
| **Pattern** | Format → lint → type → unit tests (fast) in-session; mutation/SAST heavier in CI |
| **Implementations** | Reviewer agent; companion process; hooks; make targets agents must run |
| **Part 2 slide** | Explicit “agent must see exit codes” slide |

### P2 — Behavioral hotspots / CodeHealth

| | |
|---|---|
| **Radar** | CodeScene **Assess**; social/behavioral analysis for AI-safe zones |
| **Why** | Agents amplify hotspot debt; CodeHealth flags zones too complex for safe LLM refactor |
| **Tools** | CodeScene; OSS proxies: `scc` hotspots + churn scripts + Sonar complexity trends |
| **Placement** | Layer 9; governance prioritization, not inner-loop gate day-one |

### P2 — API fuzz / adversarial inputs

| | |
|---|---|
| **Radar** | WuppieFuzz **Assess** |
| **Why** | Example-based contract tests miss sequences and weird inputs |
| **Placement** | CI upgrade for critical/external APIs; not universal baseline |

### P2 — Management metrics refresh

| Missing signal | Source |
|---|---|
| DORA **rework rate** | DORA Adopt blip |
| **First-pass acceptance** / iteration cycles / review burden | Measuring collaboration quality |
| Explicit ban on LOC/PR-as-KPI | Coding throughput Caution |

### P3 — Spec feedforward (mention only in Part 2)

OpenSpec, GitHub Spec Kit, Superpowers sit closer to Part 1 (skills/rules) and requirements-driven-dev. Part 2 can one-line: “feedforward = skills + specs; feedback = sensors.”

### P3 — Agent supply chain (security sidebar)

Agent Scan, toxic flow, third-party skills — point to security/agentic caution; do not overload Part 2 tool tables.

---

## Suggested layer table extensions

| Layer | Add |
|---|---|
| 4 Test evidence | Mutation testing family; note coverage vs kill ratio |
| 4/8 (optional) | Accessibility gates (Axe-core) — or new “quality attributes” callout under evidence |
| 7/security | Optional: agent config scanners (Agent Scan) as *agent surface* SAST |
| 9 Metrics | CodeScene / behavioral hotspots beside `scc` |
| Governance metrics | DORA + collaboration quality |

---

## What not to add to Part 2

- Full coding-agent product tour (Claude Code, Cursor, OpenClaw)
- RL training platforms
- Every Assess blip as a “must know”
- MCP protocol deep-dive (one caution line max)
