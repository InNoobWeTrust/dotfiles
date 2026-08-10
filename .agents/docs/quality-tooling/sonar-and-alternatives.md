# Where Does Sonar Fit? Where Do Alternatives Fit?

### 6.1 Sonar is not "just another linter"

Per current SonarQube documentation:
- a quality gate answers the question **"is the project ready to release?"**
- the gate can apply to branches, PRs, and the main branch
- it can fail CI / block merges when the gate fails
- it emphasizes **new-code quality**, rather than forcing teams to fix all legacy debt at once

This is why Sonar fits well with enterprise governance.

**Authoritative SonarSource references:** [quality gates](https://docs.sonarsource.com/sonarqube-community-build/quality-standards-administration/managing-quality-gates/introduction-to-quality-gates.md) · [new code](https://docs.sonarsource.com/sonarqube-community-build/user-guide/about-new-code.md) · [metrics](https://docs.sonarsource.com/sonarqube-community-build/user-guide/code-metrics/metrics-definition.md) · [quality profiles](https://docs.sonarsource.com/sonarqube-server/2025.2/quality-standards-administration/managing-quality-profiles.md) · [rules](https://docs.sonarsource.com/sonarqube-community-build/quality-standards-administration/managing-rules/rules.md) · [issues](https://docs.sonarsource.com/sonarqube-community-build/user-guide/issues/solution-overview.md) · [pull-request analysis](https://docs.sonarsource.com/sonarqube-server/2026.1/discovering/code-analysis/pull-request-analysis.md) · [security hotspots](https://docs.sonarsource.com/sonarqube-server/2026.2/user-guide/security-hotspots.md)

### 6.2 But Sonar doesn't replace fast local tools

Don't drop:
- Prettier/Biome/Ruff formatter
- ESLint/Ruff/Checkstyle/RuboCop local loop
- `tsc` / pyright / mypy / ty / PHPStan / compiler warnings
- gitleaks pre-commit

The right mental model:

> native stack tools = fast inner loop
> Sonar = upper governance layer

### 6.3 Where does Semgrep fit?

Semgrep fits well when:
- you need to start fast, OSS-first
- you want custom rules based on your team's own failure patterns
- you want multi-language SAST in CI
- you don't yet need a full enterprise governance suite

### 6.4 Where does CodeQL fit?

CodeQL fits well when:
- GitHub is the center of your workflow
- security review is the focus
- your stack overlaps with CodeQL's supported languages
- you accept that CodeQL is not a universal answer for every legacy language

Practical note: CodeQL **does not support PHP** — a reminder that every governance platform has a coverage boundary.

### 6.5 Where does Dependency-Track fit?

Dependency-Track is a strong answer for:
- portfolio-wide SBOM ingestion
- policy and risk management across many projects
- supply-chain visibility that's independent of any single language tool

It doesn't replace local tooling; it aggregates and governs.

### 6.6 Where do Snyk / Mend / enterprise AppSec suites fit?

These should be presented as an **enterprise escalation path**, not a baseline.

That said, in some large organizations, contractual, audit, or compliance requirements already tie into a commercial platform — that enterprise layer may already exist from day one. In that case, "open-source-first" should be understood as **adding sensible local/CI-native tooling on top**, not rejecting a commercial tool that's already the organization's standard.

These tools are useful when you want:
- reachability, prioritization, remediation workflows
- a unified commercial platform
- compliance / reporting / procurement / support expectations
- governance across many languages, many repos, many business units

### 6.7 Where does OpenObserve + MegaLinter fit?

[OpenObserve + MegaLinter](./openobserve-megalinter.md) is a self-hosted quality-telemetry composition, not a drop-in SonarQube replacement:

- MegaLinter executes heterogeneous linters in CI and preserves their raw reports.
- A versioned adapter normalizes run and finding records; OpenObserve ingests them for SQL, Log Explorer, and dashboards.
- The OSS components can be used without a commercial license fee, but both are AGPL-3.0 and self-hosting still has infrastructure and operational costs.
- CI still owns pass/fail policy. Centralized quality gates, new-code/diff semantics, coverage, issue lifecycle/rule profiles, duplication governance, PR decoration, and normalized security governance remain explicit gaps to close or delegate to another platform.
- Coverage and trendable complexity stay separate: use native stack test/coverage jobs plus a dedicated complexity producer, then normalize their summaries for OpenObserve. MegaLinter's language-specific complexity findings are supplementary lint policy, not a cross-language metric engine.

Use it when data ownership and polyglot CI visibility matter more than reproducing Sonar's governance semantics. Keep native tools in the fast loop and add Sonar (or another governance layer) when those semantic gaps are release-critical.

---
