# Quality Tooling Comparison Matrix

**Purpose**: quick-reference appendix for tool comparison.
**Use this when**: you need a fast comparison of role, scope, audience fit, and tradeoffs for a tool family.

> This matrix doesn't try to be exhaustive. It prioritizes tools with high relevance in enterprise / legacy / polyglot environments.

---

## 1. Universal Matrix by Category

| Category | Representative tools | Best for local loop | Best for CI gate | Best for management/reporting | Notes |
|---|---|---|---|---|---|
| Formatting | Prettier, Biome, Ruff formatter, clang-format, gofmt, dotnet format | Yes | Sometimes | No | remove style noise |
| Maintainability linting | ESLint, Ruff, Checkstyle, PMD, RuboCop, PHPCS, clang-tidy | Yes | Yes | Partial | best first line of defense for AI/junior output |
| Type/semantic analysis | `tsc`, pyright, mypy, ty, PHPStan, Psalm, Roslyn analyzers | Yes | Yes | Partial | crucial for preventing "looks right, breaks later" code |
| Unit/integration evidence | stack-specific test runners | Yes | Yes | Partial | quality evidence, not style |
| Mutation testing | Stryker, PIT, cargo-mutants | Module-scoped | Async/full | Partial | kills hollow coverage; costly full-suite |
| Accessibility | axe-core, pa11y, Lighthouse a11y | Sometimes | Yes | Partial | mandatory attribute in many markets; pair with browser tests |
| API fuzz | WuppieFuzz, Schemathesis, lang fuzzers | Rarely | Yes | Partial | critical/external APIs |
| SAST / code security | Semgrep, CodeQL, Bandit, Brakeman, Sonar (governance-level security rules) | Sometimes | Yes | Partial | local if fast enough, mainly CI; Sonar should complement, not replace, dedicated SAST |
| Dependency / SCA | Dependency-Check, pip-audit, npm audit, OSV-Scanner, Trivy | Sometimes | Yes | Yes via aggregator | should usually be in CI |
| Secrets | gitleaks, Trivy secrets | Yes | Yes | Partial | ideally pre-commit + CI |
| Metrics / hotspots | scc, PMD CPD, Sonar, NDepend, CodeScene | Rarely | Sometimes | Yes | strongest when used for trends; CodeScene adds behavioral/AI-safe zones |
| Governance platforms | SonarQube, SonarCloud, Dependency-Track, NDepend, Snyk, Mend | No | Yes | Yes | these sit above repo-native tools |
| Agent feedback sensors | format/lint/type/test (any stack) **in agent session** | Yes | Yes | No | harness pattern, not a single product — see [agent-feedback-sensors](./agent-feedback-sensors.md) |

---

---

## Full matrices

- [Comparison matrices (detail)](./details/comparison-matrices.md)
