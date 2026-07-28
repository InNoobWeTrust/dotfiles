# Quality Tooling Stack Baselines

**Purpose**: appendix to the quality tooling guide.
**Use this when**: you already understand the `quality layers` mental model and now need a practical baseline for a specific stack.

> Principle of this appendix: **baseline first, enterprise escalation later**. This is not "one true stack." It's a sensible starting point so a team can choose the tools that actually fit their codebase.

---

## How to Read This Appendix

Each stack is broken into 4 implementation layers:

1. **Local / agent loop** — fast feedback for developers and AI agents
2. **CI baseline** — minimum merge gates
3. **Governance / reporting** — for repo- or portfolio-level visibility
4. **Upgrade path** — as the team grows, the codebase gets more complex, or compliance requirements increase

---

## Stack baselines (detail leaves)

- [1. Java / JVM Baseline](./details/stack-1-java-jvm-baseline.md)
- [2. C# / .NET Baseline](./details/stack-2-c-net-baseline.md)
- [3. Vanilla JS / Legacy Frontend Baseline](./details/stack-3-vanilla-js-legacy-frontend-baseline.md)
- [4. Python Baseline](./details/stack-4-python-baseline.md)
- [5. PHP / WordPress Baseline](./details/stack-5-php-wordpress-baseline.md)
- [6. Ruby / Rails Baseline](./details/stack-6-ruby-rails-baseline.md)
- [7. C / C++ Baseline](./details/stack-7-c-c-baseline.md)
- [8. Cross-Stack Open-Source-First Baseline](./details/stack-8-cross-stack-open-source-first-baseline.md)

---

## If You Must Pick Only One New Thing First

| Situation | First move |
|---|---|
| Repo has no hygiene baseline | add a formatter + linter |
| AI-generated code often breaks contracts | add a type/compile gate |
| Agents ignore quality until CI fails | wire format/lint/type/test as [in-session sensors](./agent-feedback-sensors.md) |
| High coverage but bugs still ship | add mutation testing on core modules |
| UI is AI-touched / regulated markets | add axe-core (or equivalent) in CI |
| Security team is worried about CVEs | add dependency scanning + Renovate |
| Secrets have leaked before | add gitleaks pre-commit + CI |
| Leadership wants portfolio visibility | add Sonar or Dependency-Track after a baseline exists |
| Unsure where agents should refactor | hotspot / CodeHealth-style analysis before broad agent refactors |
| Legacy monolith feels too risky to touch | gate only new code / touched files first |

---

## What Not To Do

- Don't deploy 8 heavy tools at once on a legacy repo.
- Don't present Sonar as a replacement for native local tooling.
- Don't use LOC/complexity as a personal KPI.
- Don't force the exact same stack onto Java, .NET, PHP, and Python without adaptation.
- Don't start with "perfect strictness" — start with "useful baseline + new-code discipline."

---

## Related Documents

- Main guide: [`./overview.md`](./overview.md)
- Comparison matrix: [`./comparison-matrix.md`](./comparison-matrix.md)
- Agent feedback sensors: [`./agent-feedback-sensors.md`](./agent-feedback-sensors.md)
- Extended evidence (mutation, a11y, fuzz): [`./extended-evidence-tools.md`](./extended-evidence-tools.md)
- Presentation slides (Vietnamese): [`../slides/02_ai-quality-tooling-vi.md`](../slides/02_ai-quality-tooling-vi.md)
- Presentation slides (English): [`../slides/02_ai-quality-tooling-en.md`](../slides/02_ai-quality-tooling-en.md)
