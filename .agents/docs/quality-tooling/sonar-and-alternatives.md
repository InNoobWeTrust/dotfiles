# Where Does Sonar Fit? Where Do Alternatives Fit?

### 6.1 Sonar is not "just another linter"

Per current SonarQube documentation:
- a quality gate answers the question **"is the project ready to release?"**
- the gate can apply to branches, PRs, and the main branch
- it can fail CI / block merges when the gate fails
- it has a built-in **Sonar way** and **Sonar way for AI Code**
- it emphasizes **new-code quality**, rather than forcing teams to fix all legacy debt at once

This is why Sonar fits well with enterprise governance.

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

---
