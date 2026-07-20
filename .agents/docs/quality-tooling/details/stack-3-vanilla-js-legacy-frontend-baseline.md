# 3. Vanilla JS / Legacy Frontend Baseline

Fits:
- jQuery apps
- Bootstrap-era server-rendered web
- multi-page web apps
- older frontend repos without a modern framework

### 3.1 Local / agent loop

- **Formatting**: Prettier or Biome
- **Linting**: ESLint or Biome
- **CSS linting**: Stylelint
- **Optional**: basic bundler/build verification if applicable

### 3.2 CI baseline

- ESLint / Biome
- Stylelint
- tests if a runner exists
- npm audit or OSV/Trivy
- gitleaks
- Retire.js if the repo/vendor directory has checked-in third-party JS libraries or CDN-era code patterns

### 3.3 Governance / reporting

- SonarQube / SonarCloud
- Semgrep for security/code rules
- Dependency-Track if the portfolio has many web repos

### 3.4 When to reach for what

| Need | Good tool fit |
|---|---|
| ecosystem breadth and custom rules | ESLint |
| all-in-one fast web toolchain | Biome |
| CSS maintainability | Stylelint |
| outdated vendored JS libs | Retire.js |
| quick SAST for JS/web patterns | Semgrep |
| governance and PR gates | Sonar |

### 3.5 Legacy web note

Many teams assume "an old frontend can't have quality tooling." In practice, a simple baseline is very effective:
- Prettier/Biome
- ESLint
- Stylelint
- npm/OSV/Retire.js

You don't need to migrate to React/Vue to have a quality loop.

### 3.6 Upgrade path

- **Phase 1**: formatter + ESLint + Stylelint
- **Phase 2**: add dependency scan + Retire.js + gitleaks
- **Phase 3**: add Semgrep + Sonar
- **Phase 4**: add Dependency-Track / a centralized AppSec platform

---
