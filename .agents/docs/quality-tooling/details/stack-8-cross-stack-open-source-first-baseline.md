# 8. Cross-Stack Open-Source-First Baseline

If an organization has many stacks and wants a lean starting point:

### Local / repo level
- a formatter appropriate to each language
- a linter/static checker appropriate to each language
- a type/compile checker where the stack supports one

### Shared CI baseline
- gitleaks
- OSV-Scanner or Trivy as the dependency/supply-chain floor
- Semgrep as the polyglot security/code-scanning floor
- native test + coverage jobs with GitLab coverage/unit-test artifacts
- a dedicated complexity producer (for example Lizard), with thresholds owned by that job

### Shared governance layer
- SonarQube / SonarCloud **or** GitHub-native code scanning + other dashboards
- Dependency-Track if SBOM / portfolio SCA matters

### Optional self-hosted telemetry layer
- MegaLinter for heterogeneous CI lint execution
- OpenObserve for normalized lint, coverage, and complexity run streams, SQL, Log Explorer, and dashboards
- A versioned Python adapter, explicit retention/security policy, and a failure-safe upload path

MegaLinter remains the lint/policy job, not a coverage engine or cross-language complexity-metrics engine. Test/coverage and complexity jobs own threshold failures; OpenObserve observes trends after an explicit normalization/upload step. This layer is not a drop-in SonarQube replacement: centralized quality gates, new-code/diff semantics, issue lifecycle/rule profiles, duplication governance, PR decoration, and normalized security governance still need separate ownership or tooling. See [OpenObserve + MegaLinter](../openobserve-megalinter.md).

### Shared dependency automation
- Renovate or Dependabot

---
