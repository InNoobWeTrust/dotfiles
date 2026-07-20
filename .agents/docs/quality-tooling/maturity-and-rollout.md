# Maturity Model: From Baseline to Governance

### Phase 1 — Minimum Viable Quality Stack

Goal: every repo has a baseline.

Every repo should have:
- a formatter
- a maintainability/static-rule checker
- a type/compile gate appropriate to the stack
- basic tests + coverage evidence
- secrets scanning
- dependency scanning

### Phase 2 — Standardized CI Gates

Goal: not just installing tools, but giving tools a policy.

Examples:
- lint/type/test are required checks
- secrets = hard fail
- critical/high dependency findings = hard fail or a controlled waiver
- coverage on new code = a threshold

### Phase 3 — Centralized Governance

Goal: see quality at the project/portfolio level.

Examples:
- SonarQube / SonarCloud
- Dependency-Track
- Codecov
- NDepend for .NET-heavy organizations

### Phase 4 — Portfolio Intelligence

Goal: risk-driven prioritization.

Examples:
- hotspots and coupling using `scc` or platform metrics
- SBOM ingestion at scale
- policy exceptions with expiry
- reporting by business domain / system criticality

---

## 8. Legacy & Enterprise Reality: Rolling Out Without Backlash

### 8.1 Don't deploy "full strictness" on day one

Legacy teams will rightly push back if you turn on 5,000 warnings and block every PR.

More practical:
- gate **new code** first
- baseline/ignore existing issues where appropriate
- apply standards to touched files first

### 8.2 Choose tools with a good migration story

Good examples:
- PHPStan baseline for legacy PHP
- Sonar new-code quality gate
- `.editorconfig` + formatter first
- OWASP Dependency-Check / pip-audit / Trivy in report mode before hard-failing
- Renovate scheduling + grouping to reduce noise

### 8.3 Start from the most convincing pain point

- If the team is hurting from PR style noise → formatter first
- If the team is hurting from dependency CVEs → SCA first
- If the team is hurting from AI/PR quality regressions → lint/type/test first
- If management is asking for a risk dashboard → governance layer next

### 8.4 Legacy frontend needs a practical approach

For jQuery / Bootstrap / server-rendered pages:
- ESLint still has significant value with a custom config
- Stylelint helps with CSS hygiene
- Retire.js has high value if the repo has vendored third-party JS
- Trivy/OSV/SCA tools help with package-based dependencies

You don't need a framework rewrite to have a quality baseline.

---
