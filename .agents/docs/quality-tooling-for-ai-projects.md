# Quality Tooling for AI-Augmented Software Projects

**Status**: canonical
**Owner**: Engineering / AI Enablement
**Audience**: Engineering leads, AI-agent operators, senior developers, DevOps/Platform, architects, management

> This document is the practical follow-up to `slides/ai-agents-intro-en.md` (or the Vietnamese `slides/ai-agents-intro-vi.md`). That deck explained **AI as a junior engineer, rules, skills, and quality gates**. This document answers the next question: **how should a real project think about and choose quality tooling — especially when the codebase is polyglot, legacy-heavy, and has both dev/agent needs and governance/management needs?**

---

## Table of Contents

1. [The Most Important Takeaways](#1-the-most-important-takeaways)
2. [The Problem This Solves](#2-the-problem-this-solves)
3. [Mental Model: Quality Layers](#3-mental-model-quality-layers)
4. [How to Choose Tools by Fitness, Not Popularity](#4-how-to-choose-tools-by-fitness-not-popularity)
5. [Tool Groups by Layer](#5-tool-groups-by-layer)
6. [Where Does Sonar Fit? Where Do Alternatives Fit?](#6-where-does-sonar-fit-where-do-alternatives-fit)
7. [Maturity Model: From Baseline to Governance](#7-maturity-model-from-baseline-to-governance)
8. [Legacy & Enterprise Reality: Rolling Out Without Backlash](#8-legacy--enterprise-reality-rolling-out-without-backlash)
9. [What Metrics Management Should Look At](#9-what-metrics-management-should-look-at)
10. [Workshop Recommendations](#10-workshop-recommendations)
11. [Related Documents](#11-related-documents)

---

## 1. The Most Important Takeaways

If this whole workshop had to collapse into 6 points:

1. **Don't start from a tool list. Start from quality layers.**
2. **Each layer addresses a different kind of risk**: style drift, maintainability, type breakage, vulnerable dependencies, secrets, SAST, governance.
3. **A single tool rarely replaces the whole system.** Sonar is strong at governance, but it doesn't replace a local formatter/linter. ESLint/Ruff are fast in the inner loop, but they don't replace a portfolio dashboard.
4. **Legacy enterprise stacks need a practical baseline, not a "rewrite the stack."** Java, .NET, PHP, Rails, and C/C++ all have gradual upgrade paths.
5. **Open-source-first is usually the sensible starting point**; add an enterprise platform only when portfolio scale, compliance, or reporting requires it.
6. **The goal of this workshop is not to get everyone to install the exact same tool — it's to help people evaluate tool fit for their own codebase.**

---

## 2. The Problem This Solves

In AI-augmented development, the speed of code generation increases sharply. That makes 3 needs explicit:

- **Dev/agent loop** needs fast feedback so AI can self-correct before opening a PR.
- **CI loop** needs clear gates to block machine-verifiable errors.
- **Management/governance loop** needs visibility into quality trends, risk, and technical debt at the project or portfolio level.

The problem is that many teams currently sit in one of these states:

1. **No clear baseline** — every repo does its own thing.
2. **Many disconnected tools** — but nobody understands how they fit together.
3. **A nice dashboard** — but the local loop is so slow that dev/agent avoids it entirely.
4. **A legacy stack** — leading to the assumption that "modern quality tooling doesn't apply to this system."

This workshop is designed to fix exactly that.

---

## 3. Mental Model: Quality Layers

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

## 4. How to Choose Tools by Fitness, Not Popularity

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

This section doesn't try to be exhaustive — it tries to be **industry-grade enough to be credible in a workshop**.

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

## 6. Where Does Sonar Fit? Where Do Alternatives Fit?

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

Practical note: CodeQL **does not support PHP**. This is a good example to use in a workshop to emphasize that every governance platform has a coverage boundary.

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

## 7. Maturity Model: From Baseline to Governance

### Phase 1 — Minimum Viable Quality Stack

Goal: every repo has a baseline.

Every repo should have:
- a formatter
- a maintainability/static-rule checker
- a type/compile gate appropriate to the stack
- basic tests + coverage evidence
- secrets scanning
- dependency scanning

### Phase 2 — Standardized CI Gates

Goal: not just installing tools, but giving tools a policy.

Examples:
- lint/type/test are required checks
- secrets = hard fail
- critical/high dependency findings = hard fail or a controlled waiver
- coverage on new code = a threshold

### Phase 3 — Centralized Governance

Goal: see quality at the project/portfolio level.

Examples:
- SonarQube / SonarCloud
- Dependency-Track
- Codecov
- NDepend for .NET-heavy organizations

### Phase 4 — Portfolio Intelligence

Goal: risk-driven prioritization.

Examples:
- hotspots and coupling using `scc` or platform metrics
- SBOM ingestion at scale
- policy exceptions with expiry
- reporting by business domain / system criticality

---

## 8. Legacy & Enterprise Reality: Rolling Out Without Backlash

### 8.1 Don't deploy "full strictness" on day one

Legacy teams will rightly push back if you turn on 5,000 warnings and block every PR.

More practical:
- gate **new code** first
- baseline/ignore existing issues where appropriate
- apply standards to touched files first

### 8.2 Choose tools with a good migration story

Good examples:
- PHPStan baseline for legacy PHP
- Sonar new-code quality gate
- `.editorconfig` + formatter first
- OWASP Dependency-Check / pip-audit / Trivy in report mode before hard-failing
- Renovate scheduling + grouping to reduce noise

### 8.3 Start from the most convincing pain point

- If the team is hurting from PR style noise → formatter first
- If the team is hurting from dependency CVEs → SCA first
- If the team is hurting from AI/PR quality regressions → lint/type/test first
- If management is asking for a risk dashboard → governance layer next

### 8.4 Legacy frontend needs a practical approach

For jQuery / Bootstrap / server-rendered pages:
- ESLint still has significant value with a custom config
- Stylelint helps with CSS hygiene
- Retire.js has high value if the repo has vendored third-party JS
- Trivy/OSV/SCA tools help with package-based dependencies

You don't need a framework rewrite to have a quality baseline.

---

## 9. What Metrics Management Should Look At

Management doesn't need raw linter noise. They need system-level indicators.

### Metrics worth tracking

| Metric | What it tells you |
|---|---|
| New code quality gate pass rate | Is new code meeting the standard? |
| Critical/high dependency findings | Are we shipping known risk? |
| Secrets incidents | Is hygiene getting worse? |
| Coverage on new code | Does the new change have evidence? |
| Complexity / duplication trend | Is technical debt growing? |
| Time to remediate high-risk findings | Is the team handling risk effectively? |
| AI cost vs. quality trend | Is AI increasing velocity without breaking quality? |

### Metrics not to overuse

- LOC as a personal KPI
- raw issue counts compared across teams with different contexts
- complexity score used to judge an individual author
- vanity dashboard metrics that aren't tied to any decision

---

## 10. Workshop Recommendations

A 20–30 minute workshop should follow this flow:

1. **Recall from the previous deck**: AI is a junior engineer; rules/skills/gates are the discipline framework.
2. **Mental model**: quality layers.
3. **Two-speed loop**: local fast loop vs. CI/governance loop.
4. **Per-stack baselines**: Java, C#, vanilla JS, Python.
5. **Governance layer**: Sonar, Semgrep, CodeQL, Dependency-Track, NDepend, enterprise suites.
6. **Legacy rollout advice**: gate new code first, don't big-bang strictness.
7. **Close with the principle**:

> Don't ask "what's the most popular tool?"
> Ask "which layer, which stack, which speed, which governance need does this tool fit?"

---

## 11. Related Documents

- Main workshop deck (Vietnamese): [`./slides/ai-quality-tooling-vi.md`](./slides/ai-quality-tooling-vi.md)
- Main workshop deck (English): [`./slides/ai-quality-tooling-en.md`](./slides/ai-quality-tooling-en.md)
- Stack baselines appendix: [`./quality-tooling-stack-baselines.md`](./quality-tooling-stack-baselines.md)
- Comparison matrix appendix: [`./quality-tooling-comparison-matrix.md`](./quality-tooling-comparison-matrix.md)
- Speaker/demo notes: [`./slides/ai-quality-tooling-vi-speaker-notes.md`](./slides/ai-quality-tooling-vi-speaker-notes.md)
- Foundation deck: [`./slides/ai-agents-intro-en.md`](./slides/ai-agents-intro-en.md) / [`./slides/ai-agents-intro-vi.md`](./slides/ai-agents-intro-vi.md)

---

## Research Notes Used For This Revision

This revision is grounded in current vendor/project documentation and official sites for tools including:

- SonarQube / SonarCloud quality gates and AI Code Assurance positioning
- Semgrep CLI and CI workflows
- CodeQL supported-language and setup model
- PMD, Checkstyle, SpotBugs, Error Prone
- .NET built-in analyzers and third-party analyzer ecosystem
- Ruff and ty for Python fast loops
- pip-audit, OSV, OWASP Dependency-Check, Dependency-Track, Renovate
- Trivy, gitleaks, Retire.js
- RuboCop, Brakeman
- PHPStan, Psalm, PHP_CodeSniffer / WPCS
- clang-tidy, cppcheck
- `scc` for metrics/hotspots/cost estimation

The goal of including these is not to claim "one best stack," but to ensure the workshop reflects the real tool landscape used across modern and legacy enterprise environments.
