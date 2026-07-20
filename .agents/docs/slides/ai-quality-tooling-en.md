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

# Goals for This Session

- Teach a **mental model** for placing the right tool in the right spot
- Give **practical baselines** for common stacks
- Put **Sonar in the bigger picture**
- Help your team reason about tool fit on their own after this workshop

---

# The Common Mistake

Tooling workshops easily become:

- a disconnected list of tools
- a vendor tour
- "the tool I use is the best one"

**A better goal:**

> Don't teach people to copy a tool list.
> Teach them how to evaluate tool fit for their own codebase.

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

# Where Does Sonar Fit?

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

# Key Alternatives Worth Knowing

| Need | Tool family |
|---|---|
| Polyglot SAST | Semgrep |
| GitHub-native deep security | CodeQL |
| SBOM / supply-chain governance | Dependency-Track |
| Repo metrics / hotspots | `scc` |
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

# Open-Source-First Maturity Path

## Phase 1 — Baseline
- formatter + lint
- type/build checks
- tests
- secrets + dependency scan

## Phase 2 — Standardized CI
- required checks
- severity thresholds
- update automation

## Phase 3 — Governance
- Sonar / Dependency-Track
- NDepend / CodeQL when needed

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
| Coverage on new code | Does the new change have evidence? |
| Complexity / duplication trend | Is technical debt growing? |
| Secret incidents | Is hygiene holding up? |

**Don't report raw lint noise to leadership.**

---

# Key Takeaways

1. **Mental model first, tool second**
2. **Use quality layers to reason about fit**
3. **Every stack has a different baseline**
4. **Sonar is a governance layer, not everything**
5. **Open-source-first is usually the sensible starting point**
6. **The workshop succeeds when people can self-evaluate tool fit afterward**

---

<!-- _class: lead -->

# Questions?

**Reference material:**
- `.agents/docs/quality-tooling/INDEX.md`
- `.agents/docs/quality-tooling/stack-baselines.md`
- `.agents/docs/quality-tooling/comparison-matrix.md`
- `.agents/docs/slides/ai-agents-intro-en.md`

**Suggested next step:**
- standardize quality-layers thinking across the team first
- then lock in specific tools per repo
