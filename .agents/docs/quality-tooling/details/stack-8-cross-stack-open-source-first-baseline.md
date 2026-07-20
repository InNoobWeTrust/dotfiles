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
- coverage reporting

### Shared governance layer
- SonarQube / SonarCloud **or** GitHub-native code scanning + other dashboards
- Dependency-Track if SBOM / portfolio SCA matters

### Shared dependency automation
- Renovate or Dependabot

---
