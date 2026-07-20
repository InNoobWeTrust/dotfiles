# Quality Tooling Comparison Matrix

**Purpose**: quick-reference appendix for the workshop.
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
| SAST / code security | Semgrep, CodeQL, Bandit, Brakeman, Sonar (governance-level security rules) | Sometimes | Yes | Partial | local if fast enough, mainly CI; Sonar should complement, not replace, dedicated SAST |
| Dependency / SCA | Dependency-Check, pip-audit, npm audit, OSV-Scanner, Trivy | Sometimes | Yes | Yes via aggregator | should usually be in CI |
| Secrets | gitleaks, Trivy secrets | Yes | Yes | Partial | ideally pre-commit + CI |
| Metrics / hotspots | scc, PMD CPD, Sonar, NDepend | Rarely | Sometimes | Yes | strongest when used for trends |
| Governance platforms | SonarQube, SonarCloud, Dependency-Track, NDepend, Snyk, Mend | No | Yes | Yes | these sit above repo-native tools |

---

---

## Full matrices

- [Comparison matrices (detail)](./details/comparison-matrices.md)
