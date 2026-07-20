# Mental Model: Quality Layers

This is the mental model to teach before naming a single tool.

### 3.1 Layer 1 — Formatting / Style Consistency

**Question this layer answers:**
> Is the team wasting review time on whitespace, import order, quote style, brace style, code shape?

Goals:
- reduce noise in code review
- improve baseline readability
- make AI output less "style-inconsistent"

Example tools:
- Prettier, Biome, Ruff formatter, clang-format, gofmt, `rubocop --autocorrect`, PHP_CodeSniffer fixer, shfmt

### 3.2 Layer 2 — Maintainability / Static Rule Enforcement

**Question this layer answers:**
> Does the code violate recurring maintainability rules or conventions?

Goals:
- catch common code smells
- encode local rules as machine checks
- block failure patterns from AI and junior contributors

Example tools:
- ESLint, Biome, Ruff, Checkstyle, PMD, Roslyn analyzers, RuboCop, PHP_CodeSniffer, clang-tidy, cppcheck

### 3.3 Layer 3 — Type / Compile / Build Correctness

**Question this layer answers:**
> Does the code "look fine" but is actually incompatible in terms of types, APIs, nullability, or contracts?

Goals:
- catch compatibility errors early
- increase confidence in AI-generated refactors
- make the local loop more trustworthy than tests alone

Example tools:
- `tsc`, pyright, mypy, ty, compiler warnings, `go vet`, Roslyn analyzers, PHPStan, Psalm

### 3.4 Layer 4 — Test & Coverage Evidence

**Question this layer answers:**
> Does the new change have evidence that it actually works?

Goals:
- prove behavior, not just syntax
- measure coverage on **new code**, without obsessing over legacy coverage across the whole repo

Example tools:
- pytest/pytest-cov, JUnit, xUnit/NUnit, Jest/Vitest, SimpleCov, gcov/lcov, Codecov, Sonar coverage ingestion

### 3.5 Layer 5 — Dependency / Supply Chain Risk

**Question this layer answers:**
> Do dependencies have known vulnerabilities, license problems, or uncontrolled drift?

Goals:
- scan for known CVEs
- support SBOM/SCA
- automate updates in a controlled way

Example tools:
- OWASP Dependency-Check, pip-audit, npm audit, govulncheck, OSV-Scanner, Trivy, Dependency-Track, Renovate, Dependabot, Snyk, Mend

### 3.6 Layer 6 — Secrets & Sensitive Data Hygiene

**Question this layer answers:**
> Does the repo, its history, or generated files leak a secret/token/key?

Goals:
- block leaks before commit when possible
- protect repo history and CI artifacts

Example tools:
- gitleaks, Trivy secrets, Semgrep Secrets

Note: tools like Retire.js are useful for vulnerable JavaScript libraries, but they are **not** a substitute for secret scanning.

### 3.7 Layer 7 — Security Code Analysis / SAST

**Question this layer answers:**
> Does the code have security anti-patterns, dangerous flows, API misuse, injection vectors, or framework-convention misuse?

Goals:
- find security flaws that style/type tools won't catch
- extend coverage to legacy code and AI-generated code

Example tools:
- Semgrep, CodeQL, Sonar, Bandit, Brakeman, SpotBugs, Error Prone, clang static/clang-tidy families

Notes:
- **CodeQL** is very strong for its supported languages, but it is not a universal answer for every legacy stack — for example, it doesn't support PHP.
- **Sonar** has useful security rules at the governance layer, but it should not be treated as a full replacement for dedicated SAST engines like Semgrep or CodeQL.

### 3.8 Layer 8 — Governance / Quality Gates / Portfolio Visibility

**Question this layer answers:**
> At the PR, repo, or portfolio level, is the project following its quality policy?

Goals:
- gate new code
- unify signals from multiple tools
- produce dashboards for leads and management

Example tools/platforms:
- SonarQube / SonarCloud, GitHub code scanning + CodeQL, Dependency-Track, NDepend, Codecov, enterprise SCA/SAST platforms

### 3.9 Layer 9 — Metrics / Hotspots / Technical Debt Intelligence

**Question this layer answers:**
> Where is the code most complex, most-changed, most repetitive, most worth refactoring?

Goals:
- identify hotspots
- prioritize refactoring
- track complexity and trend

Example tools:
- `scc`, Sonar metrics, NDepend, PMD CPD, Cppcheck reports, custom git-hotspot analysis

---
