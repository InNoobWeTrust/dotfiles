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
| Unit/integration evidence | stack-specific test runners | Yes | Yes | Partial | quality evidence, not style; keep test execution separate from MegaLinter |
| Coverage evidence | JaCoCo, Coverlet, Istanbul/Jest, pytest-cov/Coverage.py | Stack-native | Yes via GitLab report artifacts | Yes after explicit normalization | native test/coverage job; MegaLinter does not document native coverage generation; OpenObserve stores trends — see [canonical guide](./openobserve-megalinter.md) |
| Mutation testing | Stryker, PIT, cargo-mutants | Module-scoped | Async/full | Partial | kills hollow coverage; costly full-suite |
| Accessibility | axe-core, pa11y, Lighthouse a11y | Sometimes | Yes | Partial | mandatory attribute in many markets; pair with browser tests |
| API fuzz | WuppieFuzz, Schemathesis, lang fuzzers | Rarely | Yes | Partial | critical/external APIs |
| SAST / code security | Semgrep, CodeQL, Bandit, Brakeman, Sonar (governance-level security rules) | Sometimes | Yes | Partial | local if fast enough, mainly CI; Sonar should complement, not replace, dedicated SAST |
| Dependency / SCA | Dependency-Check, pip-audit, npm audit, OSV-Scanner, Trivy | Sometimes | Yes | Yes via aggregator | should usually be in CI |
| Secrets | gitleaks, Trivy secrets | Yes | Yes | Partial | ideally pre-commit + CI |
| Complexity metrics / hotspots | Lizard, scc, language-native PMD/ESLint/Ruff findings, Sonar, NDepend, CodeScene | Rarely | Yes via dedicated producer thresholds | Yes after explicit normalization | no universal cross-language score; lint findings are not comparable trend metrics; compare within tool/language/module |
| CI lint aggregation + quality telemetry | MegaLinter + OpenObserve | MegaLinter can run locally/CI; the composition is CI/telemetry-oriented | CI policy remains external; dashboards do not create a gate | Yes, with a team-owned normalized schema | self-hosted OSS composition; requires an adapter and does not reproduce Sonar's new-code, coverage, issue-lifecycle, duplication, PR-decoration, or security-governance semantics — see [canonical guide](./openobserve-megalinter.md) |
| Governance platforms | SonarQube, SonarCloud, Dependency-Track, NDepend, Snyk, Mend | No | Yes | Yes | these sit above repo-native tools |
| Agent feedback sensors | format/lint/type/test (any stack) **in agent session** | Yes | Yes | No | harness pattern, not a single product — see [agent-feedback-sensors](./agent-feedback-sensors.md) |

---

---

## Full matrices

- [Comparison matrices (detail)](./details/comparison-matrices.md)
