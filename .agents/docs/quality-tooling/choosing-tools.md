# How to Choose Tools by Fitness, Not Popularity

### 4.1 Ask "which layer does this tool fit?"

A good tool should be positioned before adoption:

- local inner loop?
- pre-commit?
- CI gate?
- management dashboard?
- security/compliance evidence?

If you can't answer that, it's very easy to install a tool and then let it sit unused.

### 4.2 Ask "which stack does this tool fit?"

Enterprise reality:
- Java: PMD, Checkstyle, SpotBugs, Error Prone, and OWASP Dependency-Check are still very practical
- .NET: Roslyn analyzers are a strong baseline; NDepend is a deeper governance/architecture layer
- Legacy JS/jQuery/frontend: ESLint + Stylelint + Retire.js is usually more practical than expecting a "rewrite into a new framework"
- Python: Ruff + type checker + pip-audit is a light but strong baseline
- PHP/WordPress: PHPCS + WPCS + PHPStan/Psalm + Composer-audit-style tooling is a sensible path
- Rails: RuboCop + Brakeman + bundler-audit still matter
- C/C++: compiler warnings + clang-tidy + cppcheck + sanitizers form the practical foundation

### 4.3 Ask "does this tool have a deterministic CLI?"

AI agents, CI, and teams all need:
- a clear exit code
- machine-readable output when needed: JSON, SARIF, XML, SBOM
- config that's versionable in the repo

### 4.4 Ask "does this tool have a fast local loop?"

If a local tool is too slow, dev/agent will avoid it.

Practical guidance:
- run format/lint/type checks fast, locally
- run heavier scans in CI
- do dashboard aggregation at the upper layer

### 4.5 Ask "does this tool support gradual adoption?"

Legacy teams usually need:
- baseline files / ignore files
- severity tuning
- incremental adoption
- scanning only changed code, or gating new issues only

This is why some tools are especially good for rolling into an old codebase:
- Sonar new-code quality gates
- PHPStan baselines
- ty/pyright gradual typing
- clang-tidy on diff
- Renovate scheduling
- Dependency-Track portfolio ingestion

---

## 5. Tool Groups by Layer

This section doesn't try to be exhaustive — it tries to be **industry-grade enough to be credible as a practical reference**.

### 5.1 Formatting & Style

| Ecosystem | Open-source-first baseline | Notes |
|---|---|---|
| JS/TS/web | Prettier or Biome | Biome fits well if you want format + lint in one web-centric toolchain |
| Python | Ruff formatter | very fast, easy fit for the AI inner loop |
| Java | Spotless / google-java-format / IDE formatter | the Java formatter ecosystem is usually build-centric |
| C# | dotnet format | fits well with the Roslyn/.editorconfig flow |
| Ruby | RuboCop autocorrect | linter + formatter-ish workflow |
| PHP | PHPCS + fixer, or PHP CS Fixer | WPCS/PSR ecosystems are common |
| C/C++ | clang-format | best formatting baseline in terms of ubiquity |
| Shell | shfmt | close to a mandatory baseline |

### 5.2 Maintainability Linters / Static Rules

| Ecosystem | Tools to know | Strength |
|---|---|---|
| JS/TS | ESLint, Biome, Stylelint | huge ecosystem, custom rules, legacy frontend coverage |
| Python | Ruff | replaces many flake8-era plugins; very fast |
| Java | Checkstyle, PMD, Error Prone | style + maintainability + compiler-augmented bug checks |
| .NET | built-in .NET analyzers, StyleCop.Analyzers, Meziantou, Roslynator | native analyzer ecosystem |
| Ruby | RuboCop (+ rails/performance plugins) | style + maintainability + framework plugins |
| PHP | PHP_CodeSniffer, PHPStan, Psalm | style + semantic/type analysis |
| C/C++ | clang-tidy, cppcheck | maintainability + bug-prone constructs |

### 5.3 Type / Compile / Semantic Checks

| Ecosystem | Tools to know | Notes |
|---|---|---|
| Python | pyright, mypy, ty | `ty` is strong on speed; mypy is mature; pyright is popular/strict |
| TypeScript | `tsc` | mandatory baseline if you're using TS |
| PHP | PHPStan, Psalm | critical for gradually modernizing legacy PHP |
| Java | javac + Error Prone + framework tests | Java usually already has strong compile-time safety |
| .NET | compiler + Roslyn analyzers + nullable reference types | very strong baseline in modern SDK-style projects |
| C/C++ | compiler warnings + clang static families | correctness starts at compile flags |

### 5.4 Security / SAST

| Ecosystem | Tools to know | Notes |
|---|---|---|
| Polyglot | Semgrep | strong OSS starting point; custom rules; CI-friendly |
| GitHub-heavy orgs | CodeQL | supports C/C++, C#, Go, Java/Kotlin, JS/TS, Python, Ruby, Rust, Swift, GitHub Actions |
| Governance-oriented orgs | SonarQube / SonarCloud | security + maintainability + coverage + gate aggregation |
| Java | SpotBugs, Error Prone, Semgrep, Sonar, CodeQL | mixes bug-finding and SAST |
| Rails | Brakeman | Rails-specific security scanner, high practical value |
| Python | Bandit, Semgrep, Sonar, CodeQL | Bandit is narrower but easy to add |
| C/C++ | CodeQL, clang static analysis, cppcheck | different signal profiles |

### 5.5 Dependency / SCA / SBOM

| Need | Tools to know | Notes |
|---|---|---|
| Java/JVM | OWASP Dependency-Check, OSV-Scanner, Dependency-Track, Snyk, Mend | ODC integrates with Maven/Gradle/Ant/Jenkins/GitHub Actions |
| .NET | NuGet audit options, OSV/Trivy/Dependency-Track, Snyk/Mend | portfolio tools matter more at scale |
| Python | pip-audit, OSV-Scanner, Trivy, Dependency-Track | pip-audit can output CycloneDX and auto-fix |
| JS | npm audit, OSV-Scanner, Retire.js, Trivy, Dependency-Track | Retire.js is especially relevant for vendored libraries |
| PHP | Composer-audit equivalents + Dependency-Track + Trivy | lockfile + SBOM strategy matters |
| Ruby | bundler-audit + Dependency-Track + Trivy | keep the baseline simple |
| Cross-stack | OSV-Scanner, Trivy, Dependency-Track, Renovate | strong open-source-first combination |

### 5.6 Secret Scanning

| Tool | Why it matters |
|---|---|
| gitleaks | simple, common, pre-commit + CI, repo/history scanning |
| Trivy secrets | one scanner across secrets + vulns + misconfig |
| Semgrep Secrets | good if you've already standardized on the Semgrep platform |

### 5.7 Metrics / Hotspots / Structure Intelligence

| Tool | Best use |
|---|---|
| `scc` | LOC, complexity, ULOC/DRYness, hotspots, coupling, HTML report, COCOMO/LOCOMO |
| PMD CPD | duplication detection across many languages |
| Sonar | duplication/complexity trends in a governance dashboard |
| NDepend | deep .NET architecture, trend, dependency graph, quality gates |

### 5.8 Governance / Portfolio Platforms

| Tool/platform | Best fit |
|---|---|
| SonarQube / SonarCloud | repo-to-portfolio quality governance, new-code quality gates, PR decoration |
| Dependency-Track | SBOM-centric supply chain inventory and policy across the portfolio |
| GitHub code scanning + CodeQL | GitHub-native code scanning and alerts |
| NDepend | .NET-centric governance, architecture, quality gates, reports |
| Snyk / Mend | enterprise SCA/SAST/AI security ecosystems with prioritization and remediation workflows |

---
