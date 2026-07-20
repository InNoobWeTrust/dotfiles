# 5. PHP / WordPress Baseline

Fits:
- legacy PHP applications
- CMS/plugin/theme work
- WordPress product teams
- mixed old/new PHP codebases

### 5.1 Local / agent loop

- **Coding standards**: PHPCS (the official continuation via PHPCSStandards)
- **WordPress-specific**: WordPress Coding Standards (WPCS) on top of PHPCS
- **Static/type analysis**: PHPStan or Psalm
- **Optional fixer**: PHPCBF / PHP CS Fixer, depending on the stack's norms

### 5.2 CI baseline

- PHPCS / WPCS
- PHPStan or Psalm
- tests if present
- dependency audit / SCA for the Composer ecosystem
- gitleaks
- Sonar/Semgrep if governance/security breadth is needed

### 5.3 Governance / reporting

- SonarQube / SonarCloud
- Dependency-Track
- an enterprise SCA/SAST suite if compliance is heavy

### 5.4 When to reach for what

| Need | Good tool fit |
|---|---|
| coding standard enforcement | PHPCS |
| WordPress ecosystem best practices | WPCS |
| strong static analysis with gradual rollout | PHPStan |
| strict semantic/type analysis | Psalm |
| governance layer | Sonar |

### 5.5 WordPress note

WordPress coding standards aren't just style — they also encode ecosystem interoperability, security, naming, and compatibility expectations. For plugin/theme teams, WPCS is a very practical baseline.

### 5.6 Upgrade path

- **Phase 1**: PHPCS/WPCS
- **Phase 2**: add PHPStan or Psalm + gitleaks
- **Phase 3**: add dependency scanning + Sonar/Semgrep
- **Phase 4**: add Dependency-Track / central governance

---
