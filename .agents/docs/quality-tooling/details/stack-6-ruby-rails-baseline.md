# 6. Ruby / Rails Baseline

Fits:
- Rails monoliths
- legacy Ruby services
- teams with high convention reliance

### 6.1 Local / agent loop

- RuboCop
- RuboCop plugins (`rubocop-rails`, `rubocop-performance`, etc.)
- tests via the existing Rails/RSpec/Minitest setup

### 6.2 CI baseline

- RuboCop
- Brakeman
- tests + coverage
- bundler-audit or broader SCA tooling
- gitleaks

### 6.3 Governance / reporting

- Sonar if the organization wants a single governance hub
- Dependency-Track for SCA portfolio visibility
- Semgrep/CodeQL when a broader AppSec model is in use

### 6.4 Best-fit notes

- **RuboCop** = the style + maintainability backbone
- **Brakeman** = a very high-value Rails-specific security layer
- a good Rails baseline is convention-heavy and simple — don't overcomplicate day one

---
