# Extended Evidence Tools

**Read when:** coverage alone is not enough, UI accessibility matters, APIs need adversarial input, or you need hotspot prioritization for AI-assisted refactor.

> Fills Part 2 gaps called out in [Radar Vol 34 quality gaps](../research/thoughtworks-radar-vol34/details/quality-gaps-for-part2.md).  
> Still **layers-first**: place each tool before adopting a brand.

---

## 1. Mutation testing (Layer 4 depth)

**Question:** Do tests actually fail when behavior breaks, or only execute lines?

| Ecosystem | Representative tools | Notes |
|---|---|---|
| JS/TS | StrykerJS | Mature; CI time cost — scope by path |
| C# / .NET | Stryker.NET | Same family |
| JVM | PIT / Pitest | Strong enterprise history |
| Rust | cargo-mutants | Radar **Trial**; low config friction |
| Python | mutmut, cosmic-ray, or team-chosen | Ecosystem more fragmented |

**When to use**

- Core domain logic and AI-generated test suites with high coverage scores.
- After a green baseline exists — mutation is not day-one on a legacy monorepo.

**How to roll out**

- Local: single module / package.
- CI: nightly or non-blocking job first; gate only critical paths later.
- Track **mutation score** (or surviving mutants) on *new* logic, not vanity whole-repo % day one.

**Does not replace:** unit/integration tests, typechecks, or SAST.

---

## 2. Accessibility automation (quality attribute)

**Question:** Does the UI meet accessibility standards, or only “look fine” in a happy-path screenshot?

| Tool | Role |
|---|---|
| **axe-core** | Radar **Adopt**; WCAG-oriented rules; CI + browser test integrations |
| Playwright / Cypress + axe | Component or journey checks in real browser |
| pa11y, Lighthouse a11y | Complementary scans; not a full substitute for axe in CI |

**Why AI makes this urgent:** agents produce markup and components without a11y intent; regulations (e.g. European Accessibility Act) treat accessibility as mandatory, not polish.

**Placement:** evidence loop (with browser tests) + CI gate on touched UI. Deeper agentic browser QA: [agentic-qa](../agentic-qa/INDEX.md).

---

## 3. API fuzz / coverage-guided exploration

**Question:** Do contract tests only check examples, or do we explore edge paths and sequences?

| Tool | Role |
|---|---|
| **WuppieFuzz** | Radar **Assess**; OpenAPI-driven REST fuzzer with server coverage feedback |
| Stack fuzzers / property tests | hypothesis, cargo-fuzz, go-fuzz, etc. |
| Schemathesis | OpenAPI property-style testing (ecosystem alternative) |

**Placement:** CI upgrade for critical or externally exposed APIs — not universal inner-loop.

---

## 4. Behavioral hotspots / AI-safe complexity (Layer 9)

**Question:** Where is change concentrated *and* complex enough that LLM refactors are high-risk?

| Tool | Role |
|---|---|
| **CodeScene** | Radar **Assess**; complexity × VCS history; CodeHealth-style AI guardrails |
| `scc` + churn analysis | OSS-first hotspot proxy |
| Sonar / NDepend trends | Governance dashboards; duplication & complexity over time |
| ArchUnit / Spectral / Modulith + review | Structural fitness (pairs with “architecture drift reduction”) |

Use hotspots to **prioritize human design and tests**, not as individual punishment metrics.

---

## 5. Agent-surface security (optional sidebar)

Not a substitute for Semgrep/CodeQL on application code.

| Concern | Tools / practices |
|---|---|
| Toxic flows (private data × untrusted content × external action) | Threat modeling; MITRE ATLAS vocabulary |
| MCP / skills inventory | Agent Scan (Radar **Assess**) — validate signal & data-sharing before mandating |
| Third-party skills | Treat like supply chain: review before install |

---

## Fitness checklist (same as core guide)

Before adding any extended tool:

1. Which layer / loop?
2. Deterministic CLI + exit code?
3. Fast enough for the intended loop?
4. Gradual adoption (path filters, baselines, non-blocking first)?

---

## Related

- [Agent feedback sensors](./agent-feedback-sensors.md)  
- [Mental model](./mental-model.md)  
- [Choosing tools](./choosing-tools.md)  
- [Comparison matrix](./comparison-matrix.md)  
- [Stack baselines](./stack-baselines.md)  
