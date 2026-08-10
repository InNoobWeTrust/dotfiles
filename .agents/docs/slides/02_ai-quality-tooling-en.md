---
marp: true
theme: uncover
class:
  - lead
size: 16:9
paginate: true
header: "AI-Augmented Development"
footer: "Quality Tooling & Governance"
style: |
  section { font-size: 26px; }
  h1 { font-size: 42px; }
  h2 { font-size: 32px; }
  h3 { font-size: 28px; }
  table { font-size: 22px; }
  code { font-size: 20px; }
  pre { font-size: 18px; }
  section.lead h1 { font-size: 56px; }
  section.lead h2 { font-size: 36px; }
  blockquote { font-size: 22px; }
---

# Quality Tooling for AI Projects
## Part 2 — Mental Model First, Tools Second

**Follow-up to `ai-agents-intro-en.md`**

---

<!-- _class: default -->

# Recap from Part 1

Part 1 landed 3 points:

1. **AI is a junior engineer**
2. **Rules & skills** guide behavior
3. **Quality gates** are non-negotiable

**This part answers the next question:**
> which tooling turns those gates into a real feedback loop?

---

# Goals

- Establish a **mental model** for placing the right tool in the right spot
- Provide **practical baselines** for common stacks
- Put **Sonar in the bigger picture**
- Enable teams to reason about tool fit on their own

---

# The Common Mistake

Tooling discussions easily become:

- a disconnected list of tools
- a vendor tour
- "the tool I use is the best one"

**A better approach:**

> Don't copy a tool list.
> Learn how to evaluate tool fit for your own codebase.

---

# Why AI Makes Tooling More Important

AI agents have 2 traits:

- **very fast** → produce more code, faster
- **not fully trustworthy** → very good at rationalizing wrong output

Consequences:

- the local loop needs to be faster
- CI gates need to be clearer
- management needs clearer visibility into quality/risk

---

# Mental Model: Quality Layers

1. Formatting / style
2. Maintainability / static rules
3. Type / compile correctness
4. Tests / coverage evidence
5. Dependency / supply chain
6. Secrets hygiene
7. SAST / security analysis
8. Governance / quality gates
9. Metrics / hotspots / debt trends

**Start from the layer, not the brand.**

---

# Layers 1–3: Inner Loop

## 1. Formatting / style
Removes review noise

## 2. Maintainability rules
Catches code smells, convention violations

## 3. Type / compile correctness
Catches code that "looks right but will break"

**This is the layer the dev/agent loop must run fast.**

---

# Layers 4–7: Evidence & Risk

## 4. Tests / coverage
Proof the change actually works

## 5. Dependency / supply chain
Any known CVEs / package risk?

## 6. Secrets
Any leaked tokens/keys?

## 7. SAST
Any security anti-patterns?

---

# Layers 8–9: Governance

## 8. Governance / quality gates
Is this repo up to standard to merge/release?

## 9. Metrics / hotspots
Where is it most complex, most-changed, most worth refactoring?

**This is where management and leads start seeing systemic value.**

---

# Two Quality Loops

## Inner loop — dev / agent
- format
- lint
- type/build checks

## Governance loop — CI / leadership
- tests
- SAST
- dependency scan
- quality gates
- dashboards

**One tool rarely serves both loops well.**

---

# Coding Agents Need Feedback Sensors

A quality gate in CI is policy.
A quality gate the **agent runs and reads** is a sensor.

## Feedforward → better first attempt
- rules + skills
- specs / acceptance criteria

## Feedback → self-correction
- formatter, lint, type/build, focused tests
- clear exit codes before a commit

**Don’t make the reviewer become the agent’s linter.**

---

# Coverage Is Not Proof

AI can generate tests that execute lines but assert very little.

## Add mutation testing on critical logic
- deliberately inject small bugs
- passing tests must **kill** them
- surviving mutant = missing evidence

| Ecosystem | Examples |
|---|---|
| JS / .NET | Stryker |
| JVM | PIT / Pitest |
| Rust | cargo-mutants |

**Roll out module-first; full mutation suites are usually async CI.**

---

# Accessibility Is a Quality Gate

AI-generated UI can look correct while excluding users.

- **axe-core**: automated WCAG-oriented checks
- Run with Playwright/Cypress component or browser flows
- Gate changed UI in CI; manual/accessibility expertise still matters

**Accessibility is a quality attribute — not visual polish.**

---

Sonar is **not just another linter**.

Sonar is a **governance platform layer**:

- PR / branch / main quality gates
- coverage + duplication + maintainability + security
- dashboard for leads & management
- new-code policy

**It sits at the upper layer, not in the fast local loop.**

---

# What Sonar Doesn't Replace

Don't drop:

- Prettier / Biome / Ruff formatter
- ESLint / Ruff / Checkstyle / RuboCop
- `tsc` / pyright / mypy / ty / PHPStan
- gitleaks pre-commit

**The correct model:**
- native tools = fast loop
- Sonar = control tower

---

# Self-Hosted Quality Telemetry

## A composition — not a SonarQube drop-in

| Component | Responsibility |
|---|---|
| **MegaLinter** | Executes heterogeneous language, format, and repository linters in CI |
| **OpenObserve** | Stores/query/dashboards normalized run + finding telemetry |

- Both OSS components are **AGPL-3.0** and self-hostable.
- OSS use can avoid a **commercial license fee**.
- AGPL obligations, compute/storage/network, backups, upgrades, CI time, and operations remain.
- Raw MegaLinter reports stay as artifacts; a versioned adapter emits normalized streams.

**Think: self-hosted quality telemetry — not “Sonar, but free.”**

---

# Material Semantic Gaps

## What this composition does not provide by itself

- centralized quality gates across repositories
- consistent new-code / diff semantics
- coverage governance
- normalized issue lifecycle and rule profiles
- duplication governance
- PR decoration
- normalized security analysis and remediation governance

**CI still owns pass/fail policy.** OpenObserve dashboards make evidence queryable; they do not create the policy.

> GitLab Code Quality widgets need a separate compliant JSON-array transform. MegaLinter does not document native GitLab Code Quality output.

**Use it for polyglot CI visibility and data ownership; keep Sonar or another governance layer when these semantics are release-critical.**

---

# Coverage & Complexity Need Separate Jobs

| Job | Producer | Owns |
|---|---|---|
| **lint** | MegaLinter | heterogeneous lint/policy findings |
| **test/coverage** | native runner + JaCoCo, Coverlet, Istanbul/Jest, or pytest-cov | tests, coverage report, threshold |
| **complexity** | dedicated producer such as Lizard | mean/max complexity, NLOC, threshold |

- **MegaLinter does not replace test coverage or trendable complexity metrics.**
- PMD/ESLint/Ruff complexity rules are language-specific findings, not one cross-language score.
- Lizard is a separate job; do not imply it is bundled with MegaLinter.

---

# Gate in CI, Trend in OpenObserve

- Test/coverage and complexity jobs own threshold failures and original exit status.
- GitLab coverage/unit-test artifacts serve MR/CI UI; OpenObserve receives data only after an explicit normalizer/uploader reads artifacts or summaries.
- Keep flat event fields such as `commit_sha`, `pipeline_id`, and `mr_iid`; keep metric labels low-cardinality.
- Use `after_script` or saved exit status so telemetry uploads on failure without masking the job result.
- Compare trends within the same tool/language/module; OpenObserve observes and alerts on drift, not the only merge gate.

**Canonical guide:** [coverage, complexity, and telemetry design](../quality-tooling/openobserve-megalinter.md)

---

# Primary Sources: Platform

- **OpenObserve OSS/AGPL:** [editions](https://openobserve.ai/downloads/) · [license](https://raw.githubusercontent.com/openobserve/openobserve/main/LICENSE)
- **Ingestion and schema:** [`_json` array](https://openobserve.ai/docs/reference/api/ingestion/logs/json/) · [schema settings](https://openobserve.ai/docs/user-guide/data-processing/streams/schema-settings/) · [data/index types](https://openobserve.ai/docs/user-guide/data-processing/streams/data-type-and-index-type-in-streams/)
- **Explore:** [SQL](https://openobserve.ai/docs/reference/sql-reference/) · [dashboards](https://openobserve.ai/docs/user-guide/analytics/dashboards/dashboards-in-openobserve/)
- **Docs:** [canonical guide](../quality-tooling/openobserve-megalinter.md) · [full evidence leaf](../quality-tooling/details/openobserve-megalinter-sources.md)

---

# Primary Sources: CI & Comparison

- **MegaLinter OSS/AGPL:** [license](https://raw.githubusercontent.com/oxsecurity/megalinter/main/LICENSE) · [current version](https://megalinter.io/latest/install-version/) · [GitLab install](https://megalinter.io/latest/install-gitlab/)
- **Reports/config:** [activation](https://megalinter.io/latest/config-activation/) · [reporters](https://megalinter.io/latest/reporters/)
- **GitLab:** [Code Quality format](https://docs.gitlab.com/ci/testing/code_quality/)
- **SonarSource:** [quality standards](https://docs.sonarsource.com/sonarqube-community-build/quality-standards-administration/managing-quality-gates/introduction-to-quality-gates.md)
- **Docs:** [canonical guide](../quality-tooling/openobserve-megalinter.md) · [full evidence leaf](../quality-tooling/details/openobserve-megalinter-sources.md)

---

# Key Alternatives Worth Knowing

| Need | Tool family |
|---|---|
| Polyglot SAST | Semgrep |
| GitHub-native deep security | CodeQL |
| SBOM / supply-chain governance | Dependency-Track |
| Accessibility automation | axe-core (+ Playwright/Cypress) |
| Mutation test depth | Stryker, PIT, cargo-mutants |
| API edge-path testing | WuppieFuzz, Schemathesis, fuzzers |
| Repo metrics / hotspots | `scc`, CodeScene |
| All-in-one infra/security scan | Trivy |
| Enterprise SCA/AppSec suite | Snyk, Mend |

---

# Baseline Suggestion: Java

- Format: Spotless / IDE formatter
- Style: Checkstyle
- Maintainability: PMD
- Bug-finding: SpotBugs / Error Prone
- SCA: OWASP Dependency-Check
- Governance: Sonar / Dependency-Track

**Message:** Java enterprise already has a mature ecosystem; don't skip a tool just because it's older.

---

# Baseline Suggestion: C# / .NET

- Format: `dotnet format`
- Baseline analyzers: built-in .NET analyzers
- Optional analyzers: StyleCop / Meziantou / Roslynator
- Governance: Sonar or NDepend
- Security: CodeQL if GitHub-centric

**Message:** .NET has a strong native analyzer story; don't jump to a platform before using this baseline.

---

# Baseline Suggestion: Legacy JS / Vanilla Web

- Format: Prettier or Biome
- Lint: ESLint or Biome
- CSS: Stylelint
- Dependency/security: npm audit, OSV, Trivy
- Vendored JS libs: Retire.js

**Message:** old jQuery/Bootstrap apps can still have a strong quality baseline without a framework rewrite.

---

# Baseline Suggestion: Python

- Format + lint: Ruff
- Type: pyright / mypy / ty
- Tests: pytest
- Dependency scan: pip-audit
- SAST: Semgrep or Bandit

**Message:** Python benefits hugely from a fast loop, because AI easily produces code that looks dynamic but is type-unsafe.

---

# Hotspots: Where Should Agents Refactor?

Static analysis answers: “what is wrong?”

Behavioral hotspots answer:
> **Where is complexity high and change concentrated?**

- `scc` / Sonar / NDepend: OSS/governance trend options
- CodeScene: complexity × VCS history; CodeHealth-style AI-safe zones
- Use hotspots to prioritize human design + tests

**Do not send agents blindly into highly coupled hotspots.**

---

# Open-Source-First Maturity Path

| Phase | Focus | Key actions |
|---|---|---|
| **1 — Baseline** | Every repo has hygiene | formatter + lint, type/build, tests, secrets + dep scan |
| **2 — Standardized CI** | Tools get policy | required checks, severity thresholds, update automation |
| **3 — Governance** | Portfolio visibility | Sonar / Dependency-Track, NDepend / CodeQL when needed |

---

# Legacy Rollout: How to Avoid Getting Rejected

- **Don't turn on strict-everything day one**
- gate **new code** first
- baseline old issues when needed
- prioritize the clearest pain point first:
  - style noise
  - CVEs
  - secret leaks
  - broken PR quality

**Goal: adoption first, purity second.**

---

# What Should Management Actually See?

| Metric | Question it answers |
|---|---|
| New code gate pass rate | Is new code up to standard? |
| Critical/high vulns | Are we shipping known risk? |
| Coverage + mutation on critical new code | Is the evidence meaningful? |
| Accessibility gates on UI | Are UI changes inclusive by default? |
| Complexity / hotspot trend | Is debt growing where change happens? |
| DORA + rework rate | Did faster coding improve delivery stability? |
| First-pass acceptance / review burden | Is human–agent collaboration improving? |

**Never use AI LOC or PR count as a productivity KPI.**

---

# Key Takeaways

1. **Mental model first, tool second**
2. **Use quality layers to reason about fit**
3. **Make fast checks feedback sensors agents run before commit**
4. **Coverage is not proof — add mutation on critical logic**
5. **Accessibility is a quality attribute**
6. **Sonar is a governance layer; telemetry is not a drop-in replacement**
7. **Measure delivery and collaboration quality, not AI output volume**

---

<!-- _class: lead -->

# Questions?

**Full reference:**
- `.agents/docs/quality-tooling/INDEX.md`
- `.agents/docs/quality-tooling/agent-feedback-sensors.md`
- `.agents/docs/quality-tooling/extended-evidence-tools.md`
- `.agents/docs/quality-tooling/stack-baselines.md`
- `.agents/docs/quality-tooling/comparison-matrix.md`
- `.agents/docs/quality-tooling/openobserve-megalinter.md`
- `.agents/docs/slides/01_ai-agents-intro-en.md`

> These slides are a compact summary. The docs above are the source of truth.

**Suggested next step:**
- standardize quality-layers thinking across the team first
- then lock in specific tools per repo

**Series continuation:**
- Part 3 — Agentic QA/QC mental model: `03_ai-agentic-qa-en.md`
