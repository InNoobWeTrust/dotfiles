# Comparison detail

## 2. Sonar vs Semgrep vs CodeQL vs Dependency-Track

| Tool | Primary role | Strengths | Limits | Best fit |
|---|---|---|---|---|
| SonarQube / SonarCloud | Governance platform | quality gates, PR decoration, maintainability + security + coverage + duplication, new-code focus | not the fastest local loop, not a formatter replacement | orgs wanting unified repo/portfolio governance |
| Semgrep | Polyglot code scanning / SAST / custom rules | fast start, OSS-friendly, custom rules, CI-friendly, broad language reach | weaker as a management dashboard than Sonar; governance layer lighter unless platformed | open-source-first teams, CI-first security adoption |
| CodeQL | Deep code scanning in supported languages | strong semantic security analysis, GitHub integration, code scanning alerts | language support is limited; not universal for PHP/other unsupported stacks | GitHub-centric security programs |
| Dependency-Track | SBOM/SCA portfolio governance | component inventory, live vulnerability correlation, policy, portfolio visibility | not a local dev tool; not a formatter/linter/SAST replacement | orgs with many repos and supply-chain visibility needs |

---

## 3. Java / JVM Tool Matrix

| Tool | Layer | OSS/commercial | Why teams use it | Caution |
|---|---|---|---|---|
| Checkstyle | style + conventions | OSS | enforce coding standards; rich config; strong Java adoption | not enough alone for bug/security analysis |
| PMD | maintainability + code smells + CPD | OSS | many rules, multilanguage support, copy-paste detection | signal tuning needed |
| SpotBugs | bug-finding | OSS | FindBugs successor; catches likely Java bugs | complements, not replaces, style tools |
| Error Prone | compiler-augmented bug checks | OSS | catches mistakes at build time with suggested fixes | adoption may be build-system sensitive |
| OWASP Dependency-Check | SCA | OSS | well-known Java/enterprise dependency scanner; Maven/Gradle plugins | can be noisy without policy |
| SonarQube/SonarCloud | governance | mixed | unify Java signals for PR/portfolio | depends on local baseline quality |

---

## 4. .NET Tool Matrix

| Tool | Layer | OSS/commercial | Why teams use it | Caution |
|---|---|---|---|---|
| Built-in .NET analyzers | maintainability / quality / API usage | OSS / bundled | available by default in modern SDK projects | legacy project formats need extra setup |
| StyleCop.Analyzers | style/conventions | OSS | explicit style enforcement in C# teams | can feel noisy if turned on too aggressively |
| Meziantou.Analyzer / Roslynator | maintainability | OSS | broad analyzer coverage | choose selectively to avoid overload |
| NDepend | governance / architecture / debt / trends | Commercial | strong .NET-specific quality gates, reports, dependency graph, legacy code support | not an OSS baseline tool |
| CodeQL | security | mixed | GitHub-native code scanning for C# | use only if GitHub fit is good |
| SonarQube/SonarCloud | governance | mixed | cross-team reporting across .NET portfolio | not a replacement for Roslyn local loop |

---

## 5. Legacy Web / Vanilla JS Tool Matrix

| Tool | Layer | OSS/commercial | Why teams use it | Caution |
|---|---|---|---|---|
| ESLint | linting | OSS | customizable, huge ecosystem, good for old and new JS | config sprawl if unmanaged |
| Biome | formatter + linter | OSS | fast integrated toolchain for web repos | ecosystem/rule breadth still differs from ESLint universe |
| Prettier | formatting | OSS | removes style debates | not a linter |
| Stylelint | CSS linting | OSS | useful for legacy CSS and design-system hygiene | separate config to maintain |
| Retire.js | vulnerable JS libraries | OSS | detects outdated vendored JavaScript libraries; useful in legacy frontend | narrower scope than general SCA tools |
| Sonar / Semgrep | governance/SAST | mixed / OSS | elevate JS repos to CI governance | local loop still needs native tools |

---

## 6. Python Tool Matrix

| Tool | Layer | OSS/commercial | Why teams use it | Caution |
|---|---|---|---|---|
| Ruff | formatter + lint | OSS | very fast; consolidates many flake8-era plugins | still pair with type checker |
| pyright | type analysis | OSS | practical, popular, editor-friendly | may need tuning on dynamic-heavy legacy code |
| mypy | type analysis | OSS | mature and widely known | can be slower and stricter to adopt |
| ty | type analysis | OSS | extremely fast, good for inner loop | newer tool; orgs may want backup checker initially |
| Bandit | Python security checks | OSS | easy entry for Python security linting | narrower than Semgrep/CodeQL |
| pip-audit | dependency audit | OSS | audits envs/requirements, can output SBOM, can auto-fix | not static code analysis |
| Sonar / Semgrep / CodeQL | governance/SAST | mixed / OSS | elevate Python repos to CI and portfolio | choose based on platform fit |

---

## 7. PHP / WordPress Tool Matrix

| Tool | Layer | OSS/commercial | Why teams use it | Caution |
|---|---|---|---|---|
| PHPCS / PHPCBF | coding standards | OSS | coding standard enforcement and auto-fix | must choose/maintain standards wisely |
| WPCS | WordPress best practices | OSS | WordPress-specific standards around compatibility/security/interoperability | only relevant in WordPress ecosystem |
| PHPStan | static/type analysis | OSS + Pro optional | gradual adoption, legacy-friendly, strong ecosystem | needs baseline strategy on old code |
| Psalm | static/type analysis | OSS | strict type reasoning and advanced analysis | can feel heavier to adopt |
| Sonar / Semgrep | governance/SAST | mixed / OSS | broaden beyond style/type | choose based on portfolio needs |

---

## 8. Ruby / Rails Tool Matrix

| Tool | Layer | OSS/commercial | Why teams use it | Caution |
|---|---|---|---|---|
| RuboCop | style + maintainability | OSS | de facto Ruby baseline; plugins for Rails/perf/etc. | can generate many style offenses on old repos |
| Brakeman | Rails security | OSS | Rails-specific security scanner with high practical value | limited outside Rails patterns |
| Sonar / Semgrep / CodeQL | governance/SAST | mixed / OSS | broaden security and governance beyond Rails-specific checks | don’t skip RuboCop/Brakeman basics |

---

## 9. C / C++ Tool Matrix

| Tool | Layer | OSS/commercial | Why teams use it | Caution |
|---|---|---|---|---|
| clang-format | formatting | OSS | ubiquitous formatting baseline | style only |
| clang-tidy | linting + bug-prone + modernization | OSS | compiler-aware checks, diff-mode, configurable | requires compile database for best results |
| cppcheck | static bug analysis | OSS + Premium | low-noise focus, undefined behavior attention, non-standard syntax support | not a replacement for compiler warnings/tests |
| CodeQL | security scanning | mixed | deep security/codeflow on supported C/C++ repos | platform fit matters |
| Sonar | governance | mixed | portfolio reporting and quality gates | local loop still needs native C/C++ tools |

---

## 10. Supply Chain & Dependency Management Matrix

| Tool | Primary role | OSS/commercial | Best use |
|---|---|---|---|
| OWASP Dependency-Check | SCA on dependencies | OSS | strong Java/enterprise plugin integrations |
| pip-audit | Python dependency vuln scan | OSS | Python envs/requirements/lockfile-style auditing |
| npm audit | JS package vulnerability scan | OSS | quick baseline, especially for package-managed apps |
| OSV-Scanner | cross-ecosystem vulnerability lookup | OSS | lockfiles, SBOMs, directories, containers |
| Trivy | all-in-one scanner | OSS | vulns + misconfig + secrets + SBOM across many surfaces |
| Dependency-Track | SBOM portfolio governance | OSS | ingest CycloneDX SBOMs and manage supply-chain risk org-wide |
| Renovate | automated dependency updates | OSS + hosted/commercial options | scalable update automation across many repos |
| Dependabot | dependency update automation | mixed | simple GitHub-native updates |
| Snyk / Mend | enterprise SCA ecosystems | Commercial | prioritization, remediation workflows, compliance, enterprise support |

---

## 11. Metrics / Hotspots Matrix

| Tool | Why use it | Good audience |
|---|---|---|
| `scc` | fast LOC, complexity, hotspots, coupling, HTML report, COCOMO/LOCOMO | leads, architects, management, repo maintainers |
| PMD CPD | duplication detection | Java-heavy / polyglot engineering teams |
| Sonar metrics | complexity/duplication trends in governance dashboard | leads + management |
| NDepend metrics | .NET architecture/debt/trend intelligence | .NET architects and leads |

---

## 12. Suggested Open-Source-First Bundles

### Bundle A — Polyglot baseline
- native formatter per stack
- native linter/static checker per stack
- type/compile checker where available
- gitleaks
- Trivy or OSV-Scanner
- Semgrep
- Renovate

### Bundle B — Java enterprise
- Spotless / formatter
- Checkstyle
- PMD
- SpotBugs
- Error Prone
- OWASP Dependency-Check
- gitleaks
- Sonar or Dependency-Track when governance matters

### Bundle C — .NET enterprise
- dotnet format
- .NET analyzers
- StyleCop or Meziantou selectively
- tests + coverage
- gitleaks
- Trivy/OSV/SCA layer
- Sonar or NDepend depending on governance need

### Bundle D — Legacy web
- Prettier or Biome
- ESLint
- Stylelint
- Retire.js
- npm audit / OSV / Trivy
- gitleaks

### Bundle E — Python services
- Ruff
- pyright/mypy/ty
- pytest
- pip-audit
- gitleaks
- Semgrep

---

## 13. Practical Recommendation Order

If you must sequence adoption:

1. **Formatter + maintainability checks**
2. **Type/compile checks**
3. **Tests + coverage on new code**
4. **Secrets + dependency scan**
5. **SAST**
6. **Governance/dashboard layer**
7. **Portfolio SBOM/risk visibility**

This order tends to maximize adoption and minimize backlash.

---

## Related Documents

- Main guide: [`../overview.md`](../overview.md)
- Stack baselines: [`../stack-baselines.md`](../stack-baselines.md)
- Presentation slides (Vietnamese): [`../../slides/ai-quality-tooling-vi.md`](../../slides/ai-quality-tooling-vi.md)
- Presentation slides (English): [`../../slides/ai-quality-tooling-en.md`](../../slides/ai-quality-tooling-en.md)
