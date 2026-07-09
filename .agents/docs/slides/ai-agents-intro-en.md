---
marp: true
theme: uncover
class:
  - lead
size: 16:9
paginate: true
header: "AI-Augmented Development"
footer: "Introduction & Guide"
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

# AI-Augmented Development
## A Practical Introduction

**From zero to productive in AI-assisted coding**

---

<!-- _class: default -->

# Agenda

- What is AI-Augmented Development?
- The Mental Model: AI as Junior Engineer
- The `.agents/` Architecture
- Rules: Preventing Bad Output
- Skills: Directing Good Output
- Quality Gates & Engineering Discipline
- Project Onboarding & Daily Workflows
- Management Visibility
- Getting Started

---

# What Is AI-Augmented Development?

A development paradigm where **AI coding agents** (Kilo, Claude Code, Copilot) work alongside humans — not as typewriters, not as magical oracles, but as **junior team members**.

**Humans**: define the WHAT and WHY
**AI agents**: execute the HOW with guardrails

---

# Why Guardrails?

Without rules, AI agents will predictably:

- Produce untested code that was never executed
- Invent business rules when requirements are ambiguous
- Silently swallow errors to keep code "working"
- Skip quality checks to "save time"
- Add methods to existing classes instead of designing modules

**Rules and skills prevent these at the system level.**

---

<!-- _class: default -->

# The Mental Model

AI agent = a junior engineer who is:

| Trait | Implication |
|---|---|
| Extremely fast, never tired | 500 lines in seconds = 500 lines of debt if unguided |
| Has read the entire codebase | But doesn't understand business context |
| Follows rules mechanically | But invents answers to ambiguous questions |
| Needs explicit guidance | Like any junior: bounded tasks, clear acceptance criteria, code review |

---

<!-- _class: default -->

# The Two Layers

## Personal Toolkit (`~/.agents/`)
- Personal preferences & credentials
- Experimental skills
- Session history

## Project Contract (`.agents/`)
- Team-shared rules
- Project-specific skills
- Handoffs & session checkpoints

**Separated so cloning the repo gets you the full team contract — nothing from the lead's personal config leaks in.**

---

# `.agents/` Directory Map

```
<project>/.agents/
├── rules/              ← Non-negotiable, always active
│   ├── code-quality.md
│   ├── tdd.md
│   ├── grooming.md
│   ├── ubiquitous-language.md
│   ├── slicing.md
│   ├── skill-compliance.md
│   └── self-grounded-verification.md
├── skills/             ← Loaded per-task, on demand
│   ├── INDEX.md        ← Routing table
│   ├── WIRING.md       ← Composition pathways
│   ├── code-craft/
│   ├── reviewer/
│   └── ...
└── handoffs/           ← Session checkpoint files
```

---

# Rules vs Skills

| | Rules | Skills |
|---|---|---|
| **Purpose** | Prevent bad behavior | Direct good behavior |
| **Activation** | Always active | Loaded on demand |
| **Metaphor** | Coding standards + code review checklist | Standard operating procedures for each job type |
| **Example** | "Never swallow errors silently" | "5-phase feature implementation workflow" |

---

# The 7 Essential Rules

Every AI-augmented project needs these:

1. **Code Quality Baseline** — Naming, nesting limits, prohibited patterns
2. **TDD Enforcement** — Red → Green → Refactor for logic components
3. **Grooming (Reverse Interview)** — AI asks YOU 3-5 questions before building
4. **Ubiquitous Language** — Sync with GLOSSARY.md to prevent naming drift
5. **Vertical Slicing** — Build feature-by-feature, not layer-by-layer
6. **Skill Compliance** — Loading a skill = binding commitment to full workflow
7. **Self-Grounded Verification** — Elicit success criteria BEFORE examining artifact

---

# Rule 1: Code Quality Baseline

Prevents AI from producing "works for this test case" code that collapses under real use.

- Max 3 levels of nesting — extract the inner block
- Max 50 lines per function — split or document deferral
- Guard clauses at top — happy path never nested in `else`
- No magic literals — every inline value is a named constant
- No silent error swallowing — `catch(e) {}` is forbidden
- No business logic in views/controllers — extract to services

---

# Rule 2: TDD Enforcement

Prevents AI from delivering untested code.

```
RED   → Write test. Run it. Confirm it FAILS.
GREEN → Write minimum code to pass. Run. Confirm PASS.
REFACTOR → Clean up. Re-run. Confirm still PASS.
```

**Required**: parsers, validators, algorithms, data processors, state managers

**Skippable**: CSS changes, config edits, markdown, typo fixes

The AI must **output test results** as proof of compliance.

---

# Rule 3: Grooming (Reverse Interview)

Prevents the #1 AI failure: building the wrong thing.

Before building anything complex, the AI must ask YOU 3-5 questions:

- What is DEFINITELY out of scope? What does "done" look like?
- What happens when data is missing? Network fails?
- What existing modules/APIs does this connect to?
- From the user's perspective, what do they see/do?

If the AI skips questions → it's a rule violation. Stop and ask for them.

---

# Rule 4: Ubiquitous Language

Prevents naming drift that makes the codebase incomprehensible.

Every domain concept gets **one canonical name** in `GLOSSARY.md`:

| Term | Definition | Code Reference | Prohibited |
|---|---|---|---|
| PurchaseOrder | Internal procurement order | `PurchaseOrder` model | "Order", "Replenish.." |
| Supplier | Product stock vendor | `supplier_id` column | "Vendor", "Client" |

If GLOSSARY.md is missing → AI offers to bootstrap it from entity files and database schemas.

---

# Rule 5: Vertical Slicing

Prevents "everything is built, nothing works together."

**Bad (Horizontal):** Create ALL schemas → ALL APIs → ALL UI — nothing testable until everything is done

**Good (Vertical):**
- Slice A: "Save a new item" (Schema → Repo → API → UI)
- Slice B: "Display list of items" (Read → API → Component)
- Slice C: "Edit item details" (Update → PATCH → Edit form)

Each slice independently testable and mergeable.

---

# Rule 6: Skill Compliance

Prevents the AI from loading a skill and selectively skipping steps.

- Loading a SKILL.md is a **binding contract**
- Complexity is NOT a valid reason to skip steps
- Every mandatory step must execute in order
- Every artifact the skill specifies must be produced

**Hard-stop gates:**
- Design checkpoint: any question unanswered → redesign
- TDD: tests not written first → stop and write them
- Ambiguity: no contract for edge case → ask user

---

# Rule 7: Self-Grounded Verification

Prevents AI from validating its own (or a user's) work just because it's already in context — **agreement bias**.

**The problem:** LLMs over-validate flawed behavior and rationalize flaws, even when they hold correct priors about what success looks like. This happens *despite* thinking harder — test-time scaling makes rationalization more elaborate, not better.

**The fix (two-step):**
1. **Before examining the artifact** — State success criteria artifact-independently (from requirement/contract only, including a disconfirming check: "what would prove this wrong?")
2. **Then evaluate against those criteria** — Mark each criterion PASS / FAIL / UNVERIFIED with cited evidence (file:line, test output)

Verdict is PASS only if every criterion is PASS.

*Source: Andrade et al., ICLR 2026*

---

# How Rules Evolve

Rules aren't designed in advance. They emerge from real failures:

```
OBSERVE → Diagnose → Encode → Test → Refine → Generalize
```

**Golden rule**: only add rules in response to real failures. Never from hypothetical concerns.

---

# Top AI Failure Patterns

| Category | Example | Defending Rule |
|---|---|---|
| Code Quality | Silent error swallowing `catch(e) {}` | Code quality baseline |
| Process | Delivering untested code | TDD enforcement |
| Process | Building wrong thing from assumptions | Grooming |
| Naming | Same concept named 5 different ways | Ubiquitous language |
| Architecture | God objects growing over time | Code quality baseline |
| Security | Hardcoding API keys in source | Git safety rules |
| Business | Inventing business rules for ambiguous cases | Ambiguity policy |
| Verification | Declaring own work correct without grounded check | Self-grounded verification |

---

# The Skill System

Skills are the AI's **training manuals** — complete workflows for specific task types.

**Skill routing:**
1. AI checks `INDEX.md` to find the right skill
2. Loads that skill's `SKILL.md` and follows every step
3. For complex tasks, consults `WIRING.md` for composition pathways

---

# When to Use Which Skill

| Task Type | Load This |
|---|---|
| Write or refactor code | `code-craft` |
| Debug a bug | `systematic-investigation` |
| Design a new feature | `requirements-driven-dev` |
| Review code or specs | `reviewer` |
| Navigate unknown code | `codebase-exploration` |
| Design UI | `ui-ux` |
| Brainstorm ideas | `brainstorming` |

**Skip skills for**: typos, formatting, config changes, renaming (no logic changes).

---

# Skill Anatomy

```
skills/<skill-name>/
├── SKILL.md           ← Main workflow (entry point)
├── references/        ← Deep-dive content (loaded on demand)
└── assets/            ← Data files, CSVs, images (optional)
```

**SKILL.md has 6 sections:**
1. YAML frontmatter (harness matching)
2. Workflow phases (ordered, mandatory)
3. Stop conditions (hard-stop gates)
4. Deliverable checklist (completion criteria)
5. Anti-pattern table (shortcuts the AI will try)
6. References (deep-dive docs loaded on demand)

---

# Skill Composition: WIRING.md

Complex tasks chain multiple skills in sequence:

**Debugging a Bug**
1. `codebase-exploration` → navigate unfamiliar boundaries
2. `systematic-investigation` → root cause analysis
3. `code-craft` → disciplined fix implementation
4. `reviewer` → verify fix addressed root cause

**Implementing a Feature**
1. `requirements-driven-dev` → spec (if large/ambiguous)
2. `codebase-exploration` → map target areas
3. `code-craft` → disciplined implementation
4. `reviewer` → post-implementation review

---

# Skill Lifecycle

**Stage 1 — Prototype** (1-2 uses)
Write as checklist. Track: what did AI skip? What took too long? No value?

**Stage 2 — Hardening** (3-5 uses)
Add stop conditions. Add anti-patterns. Remove no-value steps.

**Stage 3 — Team Adoption** (5+ uses)
Add polished description, INDEX/WIRING entries, output examples.

**Stage 4 — Maintenance** (quarterly)
Review usage, relevance, length. Deprecate obsolete skills.

---

# Project Onboarding: First 30 Minutes

Every newcomer (human or AI) needs:

1. **Product understanding** — What does this do? For whom?
2. **Working dev environment** — Can they build and run?
3. **Rules of engagement** — What must they never do?
4. **Codebase map** — Where does each kind of code live?
5. **Quality bar** — What commands prove work is correct?

```bash
make dev-up && make dev && make quality
```

---

# The 6 Quality Gates

Every code change passes through these:

```
1. Design Checkpoint (7 questions)
   ↓
2. TDD Cycle (test → implement → refactor)
   ↓
3. Code Quality Rules (naming, nesting, structure)
   ↓
4. Quality Tooling (format → lint → type-check → audit)
   ↓
5. Readability & Robustness Audit
   ↓
6. Tech Debt Inventory
```

---

# Gate 1: Design Checkpoint

Before writing ANY function, answer these 7:

1. What is the ONE thing this unit does?
2. What is the smallest interface callers need?
3. What does this unit depend on?
4. Can a reader follow logic from names alone?
5. Interface complexity << implementation complexity?
6. Type signatures fully defined before implementation?
7. For ambiguous edge cases: what contract chooses the right behavior?

**If any answer is unclear → STOP and redesign.**

---

# Gate 5: Readability Audit

Read your code as a new engineer with zero context:

1. Is the entry point obvious?
2. Can I follow control flow from function names alone?
3. Are state mutations obvious at the call site?
4. Is the error path as readable as the happy path?
5. What happens when external dependencies fail?

For any weak answer → refactor or add `// CLARITY:` annotation.

---

# Gate 6: Tech Debt Inventory

AI must declare what debt it's accepting:

```
TECH DEBT INVENTORY
- TODO(debt): src/pricing.py:142 — hardcoded margin 15%
  deferred until business system exposes margin field
  cleanup trigger: when upstream business system API exposes margin field
```

**REFACTOR-SIGNAL markers** create a searchable inventory:
```
// REFACTOR-SIGNAL: god-object — PaymentController owns 4 domains
// REFACTOR-SIGNAL: implicit-coupling — shared state between A and B
```

---

# How to Give Good Prompts

**Bad:**
> "Add user preferences to the dashboard"

**Good (part 1):**
> "Add column visibility preferences to the data grid. Per-user, per-workspace. Use existing preferences API pattern."

---

# Good Prompts (cont.)

**Good (part 2):**
> "Frontend: workspace-scoped composable, NOT global store or localStorage. Acceptance criteria: columns toggle visible/hidden, persist across reload, respect workspace scope."

A good prompt has: **clear scope, pattern reference, data ownership, acceptance criteria, architectural constraints.**

---

# Automation & Quality Tooling

All commands through a single entry point: **Makefile**

```
make fix          # Auto-fix formatting and safe corrections
make lint         # Fast format + lint + type check
make quality      # Full structural checks + dependency audit
make test         # All tests
make dev          # Start dev servers
make build        # Production build
```

One interface for humans, AI, and automated build pipelines.

---

# Security Essentials

- **Never commit secrets** — `.env`, `*.pem`, `*.key` in `.gitignore`
- **Automated secret scanning** on every commit
- **Dependency auditing** in CI — known exploits = merge blocker
- **Single write path** for business data — one authoritative API
- **Server-authoritative state** — never show uncommitted/speculative data
- **Audit trails** for every background job, sync, or pipeline run

---

# Management Visibility

What leadership needs to see:

| Metric | Target |
|---|---|
| Complexity score | Below threshold |
| Function length | Max 50 statements |
| Dependency vulnerabilities | Zero critical/high |
| Test coverage | 80%+ |
| AI-assisted velocity | Compare sprint velocity before/after AI |

Track: **AI cost per sprint, quality of AI output, delivery velocity.**

---

# The Maturity Model

**Phase 1: Foundation** (ship with this)
AGENTS.md, GLOSSARY.md, quality gates, automated build pipeline, skill catalog, architecture doc, security scanning

**Phase 2: Intelligence** (as project grows)
Coverage reporting, graduated warnings, automated dependency alerts, AI usage dashboard, performance budgets

---

# The Maturity Model (cont.)

**Phase 3: Optimization** (long-term vision)
Predictive quality suggestions, cross-project knowledge sharing, skill effectiveness metrics, self-healing pipelines

---

# Getting Started: Checklist

1. Create `AGENTS.md` with source-of-truth hierarchy
2. Create `GLOSSARY.md` with domain terminology
3. Set up `.agents/rules/` with the 7 essential rules
4. Set up `.agents/skills/INDEX.md` and `WIRING.md`
5. Define quality gates with thresholds
6. Set up automated build & deploy pipeline with environment separation
7. Create a `Makefile` as single entry point
8. Configure security scanning (secrets, dependencies, automated code scanning)
9. Write `docs/architecture.md` with responsibility split
10. Train the team on the interaction model

---

# Key Takeaways

1. **AI is a junior engineer** — fast, tireless, needs explicit guidance
2. **Rules prevent, skills enable** — different tools for different purposes
3. **Rules come from real failures** — never hypothetical concerns
4. **Vertical slicing beats horizontal building** — testable at every step
5. **The grooming interview is critical** — AI asks YOU before building
6. **Skill compliance is binding** — no skipping steps
7. **Quality gates are non-negotiable** — every change passes all 6
8. **Start simple, evolve continuously** — rules and skills mature over time

---

<!-- _class: lead -->

# Questions?

**Resources:**
- `.agents/docs/ai-agent-skills-and-rules-engineering.md`
- `.agents/docs/ai-augmented-project-setup-and-evolution.md`
- `.agents/docs/README.md`

**Next step:** Pick one rule to implement today. Then one skill to prototype.
