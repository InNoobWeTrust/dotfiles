# 4. Python Baseline

Fits:
- backend services
- automation/scripts
- data tooling
- ML/ops repos
- internal enterprise scripting platforms

### 4.1 Local / agent loop

- **Formatting + linting**: Ruff
- **Type checking**: pyright, mypy, or ty
- **Tests**: pytest

### 4.2 CI baseline

- Ruff
- your chosen type checker
- pytest + coverage
- pip-audit
- gitleaks
- Semgrep or Bandit for the security layer, depending on team needs

### 4.3 Governance / reporting

- SonarQube / SonarCloud
- CodeQL for GitHub-native security if the org standardizes on it
- Dependency-Track for SBOM/SCA across many repos

### 4.4 When to reach for what

| Need | Good tool fit |
|---|---|
| fastest local hygiene loop | Ruff |
| mature optional/static typing | mypy |
| popular, practical type checker | pyright |
| very fast modern type checker | ty |
| dependency vulnerability audit | pip-audit |
| general polyglot SAST | Semgrep |
| Python security-specific starter | Bandit |

### 4.5 Recommendation nuance

- **Ruff**: almost always worth adding early
- **pyright/mypy/ty**: choose based on strictness, team preference, IDE/editor flow
- **pip-audit**: an easy CI win
- **Semgrep**: a better long-term choice than relying only on Python-specific security checks

### 4.6 Upgrade path

- **Phase 1**: Ruff + pytest
- **Phase 2**: add a type checker + pip-audit + gitleaks
- **Phase 3**: add Semgrep/Bandit + Sonar
- **Phase 4**: add Dependency-Track / portfolio governance / AI-cost-to-quality metrics

---
