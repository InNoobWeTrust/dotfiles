# Quality Tooling Stack Baselines

**Purpose**: appendix to the quality tooling workshop.
**Use this when**: you already understand the `quality layers` mental model and now need a practical baseline for a specific stack.

> Principle of this appendix: **baseline first, enterprise escalation later**. This is not "one true stack." It's a sensible starting point so a team can choose the tools that actually fit their codebase.

---

## How to Read This Appendix

Each stack is broken into 4 implementation layers:

1. **Local / agent loop** — fast feedback for developers and AI agents
2. **CI baseline** — minimum merge gates
3. **Governance / reporting** — for repo- or portfolio-level visibility
4. **Upgrade path** — as the team grows, the codebase gets more complex, or compliance requirements increase

---

## 1. Java / JVM Baseline

Fits:
- Spring Boot
- legacy Java EE / servlet apps
- Maven / Gradle monoliths
- long-lived enterprise services

### 1.1 Local / agent loop

- **Formatting/style**: IDE formatter / Spotless / google-java-format
- **Style & maintainability**: Checkstyle, PMD
- **Bug-finding**: Error Prone, SpotBugs
- **Build correctness**: `mvn test`, `mvn -q -DskipTests compile`, or the Gradle equivalent

### 1.2 CI baseline

- Checkstyle
- PMD
- SpotBugs
- unit/integration tests
- coverage report
- OWASP Dependency-Check or an OSV/Trivy supply-chain scan
- gitleaks

### 1.3 Governance / reporting

- SonarQube / SonarCloud
- Dependency-Track for SBOM/SCA portfolio visibility
- CodeQL if GitHub-centric and security-heavy

### 1.4 When to reach for what

| Need | Good tool fit |
|---|---|
| enforce code conventions | Checkstyle |
| maintainability/code smells | PMD |
| bug patterns in bytecode/compiled logic | SpotBugs |
| compiler-augmented bug checks | Error Prone |
| dependency CVEs in the Maven/Gradle world | OWASP Dependency-Check |
| centralized governance | SonarQube / SonarCloud |

### 1.5 Upgrade path

- **Phase 1**: Checkstyle + tests + Dependency-Check
- **Phase 2**: add PMD + SpotBugs + gitleaks
- **Phase 3**: add Sonar + Dependency-Track
- **Phase 4**: add CodeQL or Semgrep custom rules if AppSec pressure grows

---

## 2. C# / .NET Baseline

Fits:
- ASP.NET / ASP.NET Core
- legacy .NET Framework apps
- modern SDK-style .NET repos
- enterprise solutions in Visual Studio ecosystems

### 2.1 Local / agent loop

- **Formatting/style**: `dotnet format`
- **Built-in analysis**: .NET analyzers / Roslyn analyzers
- **Additional analyzers**: StyleCop.Analyzers, Meziantou.Analyzer, Roslynator (depending on desired strictness)
- **Build correctness**: `dotnet build`, nullable reference types, warnings-as-errors selectively

### 2.2 CI baseline

- `dotnet build`
- an analyzer-warnings policy
- tests + coverage
- dependency scan (NuGet-focused + Trivy / OSV / portfolio SCA)
- gitleaks

### 2.3 Governance / reporting

- SonarQube / SonarCloud
- NDepend if the team needs deep architecture/debt/dependency insight for .NET
- CodeQL if GitHub code scanning is the organizational standard
- Dependency-Track if SBOM governance is a priority

### 2.4 When to reach for what

| Need | Good tool fit |
|---|---|
| native SDK analyzer baseline | built-in .NET analyzers |
| style conventions | StyleCop.Analyzers |
| broader analyzer pack | Meziantou / Roslynator |
| architecture/dependency/debt dashboards | NDepend |
| repo-to-portfolio governance | Sonar |
| GitHub-native security scanning | CodeQL |

### 2.5 Legacy .NET note

For non-SDK-style projects or older .NET Framework:
- enable analyzers gradually
- avoid "turn all warnings into errors" on day one
- baseline by changed projects first

### 2.6 Upgrade path

- **Phase 1**: `dotnet format` + built-in analyzers + tests
- **Phase 2**: add StyleCop/Meziantou + gitleaks + dependency scan
- **Phase 3**: add Sonar or NDepend
- **Phase 4**: add CodeQL / an enterprise AppSec suite if security governance needs to be stronger

---

## 3. Vanilla JS / Legacy Frontend Baseline

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

## 4. Python Baseline

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

## 5. PHP / WordPress Baseline

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

## 6. Ruby / Rails Baseline

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

## 7. C / C++ Baseline

Fits:
- embedded / firmware-adjacent
- desktop/native apps
- platform libraries
- older enterprise C/C++ systems

### 7.1 Local / agent loop

- **Formatting**: clang-format
- **Static checks**: clang-tidy, cppcheck
- **Compile warnings**: take compiler warnings seriously; standardize flags

### 7.2 CI baseline

- build with strong warnings
- clang-tidy (whole-file or diff-based, where practical)
- cppcheck
- tests and sanitizers where available
- a dependency/supply-chain check if the packaging model allows it
- gitleaks

### 7.3 Governance / reporting

- CodeQL for GitHub-heavy organizations
- Sonar for broader governance
- Trivy/Dependency-Track once artifacts/SBOM become important

### 7.4 When to reach for what

| Need | Good tool fit |
|---|---|
| formatting | clang-format |
| compiler-aware linting | clang-tidy |
| low-noise static bug detection | cppcheck |
| deep security/codeflow on supported repos | CodeQL |
| management/reporting | Sonar |

### 7.5 C/C++ note

Don't promote the idea that one tool will be enough for C/C++. This stack typically needs:
- compiler warnings
- clang-tidy
- cppcheck
- runtime sanitizers/tests

---

## 8. Cross-Stack Open-Source-First Baseline

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

## 9. If You Must Pick Only One New Thing First

| Situation | First move |
|---|---|
| Repo has no hygiene baseline | add a formatter + linter |
| AI-generated code often breaks contracts | add a type/compile gate |
| Security team is worried about CVEs | add dependency scanning + Renovate |
| Secrets have leaked before | add gitleaks pre-commit + CI |
| Leadership wants portfolio visibility | add Sonar or Dependency-Track after a baseline exists |
| Legacy monolith feels too risky to touch | gate only new code / touched files first |

---

## 10. What Not To Do

- Don't deploy 8 heavy tools at once on a legacy repo.
- Don't present Sonar as a replacement for native local tooling.
- Don't use LOC/complexity as a personal KPI.
- Don't force the exact same stack onto Java, .NET, PHP, and Python without adaptation.
- Don't start with "perfect strictness" — start with "useful baseline + new-code discipline."

---

## Related Documents

- Main guide: [`./quality-tooling-for-ai-projects.md`](./quality-tooling-for-ai-projects.md)
- Comparison matrix: [`./quality-tooling-comparison-matrix.md`](./quality-tooling-comparison-matrix.md)
- Workshop slides (Vietnamese): [`./slides/ai-quality-tooling-vi.md`](./slides/ai-quality-tooling-vi.md)
- Workshop slides (English): [`./slides/ai-quality-tooling-en.md`](./slides/ai-quality-tooling-en.md)
- Speaker/demo notes: [`./slides/ai-quality-tooling-vi-speaker-notes.md`](./slides/ai-quality-tooling-vi-speaker-notes.md)
