# Engineering AI Agent Skills & Rules

**Status**: canonical
**Owner**: Engineering / AI Enablement
**Audience**: Engineering leads setting up AI-augmented workflows for the first time

> This document explains HOW to design the `.agents/rules/` and `.agents/skills/` that govern AI agent behavior. It covers which rules are essential, how to evolve them from observed failure patterns, and the lifecycle of a skill from first draft to team-wide adoption.

---

## Table of Contents

1. [Why Rules and Skills Exist](#1-why-rules-and-skills-exist)
2. [Essential Rules for Every Project](#2-essential-rules-for-every-project)
3. [Nice-to-Have Rules](#3-nice-to-have-rules)
4. [The Failure Pattern → Rule Evolution Loop](#4-the-failure-pattern--rule-evolution-loop)
5. [Catalog of AI Failure Patterns](#5-catalog-of-ai-failure-patterns)
6. [Designing a Skill from Scratch](#6-designing-a-skill-from-scratch)
7. [Skill Lifecycle: From Prototype to Team Standard](#7-skill-lifecycle-from-prototype-to-team-standard)
8. [Skill Composition: WIRING.md](#8-skill-composition-wiringmd)
9. [Maintaining Rules and Skills Over Time](#9-maintaining-rules-and-skills-over-time)

---

## 1. Why Rules and Skills Exist

### The Problem

AI coding agents are powerful but unreliable in predictable ways. Without guardrails, they will:

- Produce large blocks of untested code that has never been executed
- Add a method to an existing class instead of designing a new module
- Invent business rules when the answer is ambiguous
- Silently swallow errors to keep the code "working"
- Skip quality checks to save time
- Fabricate functions or APIs that don't exist in the codebase

Rules and skills exist to **eliminate these failure modes at the system level**, rather than relying on human vigilance in every code review.

### The Mental Model

Think of `.agents/` as the project's **engineering handbook for its AI workforce:**

| Artifact | Purpose | Analogy |
|---|---|---|
| **Rules** (`rules/*.md`) | Non-negotiable constraints active on every task | Coding standards + code review checklist |
| **Skills** (`skills/*/SKILL.md`) | Complete workflows loaded per-task | SOPs for specific job types |

Rules are always active. Skills are loaded on demand. Both are binding — once loaded, the AI must complete every step.

### Two Critical Design Principles

**Principle 1: Rules prevent, skills enable.**

A rule says "never swallow errors silently." A skill says "here is the 5-phase process for writing a new feature." Rules are about stopping bad behavior. Skills are about directing good behavior.

**Principle 2: Rules are reactive, not speculative.**

Every effective rule was created in response to a real failure. Rules written to prevent hypothetical problems rarely survive contact with real work. When you add a rule, ask: "What specific bad output have I seen that this would have prevented?"

---

## 2. Essential Rules for Every Project

These six rules form the minimum viable rule set. A project lacking any of them will accumulate technical debt rapidly once AI agents are involved.

### Rule 1: Code Quality Baseline

**File:** `rules/code-quality.md`

**What it prevents:** AI producing working code that is unmaintainable.

**Core components:**

```
1. Pre-implementation design checkpoint (7 questions answered BEFORE writing)
2. Naming conventions (verb-phrase functions, noun-phrase variables, boolean prefixes)
3. Structure limits (max 3 levels nesting, max 50 lines per function, guard clauses)
4. Prohibited patterns (silent error swallowing, magic literals, mixed layers)
5. Tech debt marking (TODO(debt): format)
6. Refactoring signal markers (REFACTOR-SIGNAL: pattern)
7. Module README requirement (every module directory must have documentation)
8. Docstring requirement (all public APIs must have ecosystem-standard docstrings)
```

**Without this rule:** The AI will produce code that works for the current test case but collapses under real use — deeply nested, 200-line functions with no documentation, no error handling, and business logic tangled with framework code.

**Evolution:** Start with the basics (naming, nesting, function length). Add the design checkpoint once you've seen the AI produce "solution sprawl" — a new feature spread across 4 files with no clear ownership. Add module READMEs once you've spent an hour trying to understand an AI-generated module with no documentation.

### Rule 2: Test-Driven Development Enforcement

**File:** `rules/tdd.md`

**What it prevents:** AI producing large blocks of code that have never been executed.

**Core components:**

```
1. Red-Green-Refactor protocol (test → implement → clean up)
2. Strict gate for logic components (parsers, validators, algorithms, state managers)
3. Exceptions for non-logic changes (CSS, config, markdown, typos)
4. AI must output test execution results as compliance evidence
```

**Without this rule:** The AI will write 300 lines of implementation, declare it done, and hand you code with silent logic bugs that would have been caught by even basic tests. Worse, the code will be untestable because it was designed without tests in mind.

**What "TDD" means in practice for this rule:**
- The AI writes the interface signature and test cases FIRST
- The AI runs the test command and confirms it FAILS (RED)
- The AI writes the minimum implementation to pass (GREEN)
- The AI cleans up and re-runs tests (REFACTOR)
- The AI posts the test output as proof

If the AI skips any phase, the rule is violated.

### Rule 3: Grooming (Reverse Interview)

**File:** `rules/grooming.md`

**What it prevents:** AI building the wrong thing because it misunderstood requirements.

**Core components:**

```
1. Stop-and-probe: before building, identify gaps and assumptions
2. 3-5 high-value questions asked to the user
3. Questions target: goal/boundaries, edge cases, dependencies, interface concept
4. Graceful scaling: full interview for complex tasks, skip for simple edits
5. AFK mode: self-grooming audit with documented assumptions
```

**Without this rule:** The AI will accept "add user preferences" as a complete specification and build a system that stores preferences globally when you meant per-user, or uses localStorage when you needed server persistence, or exposes preferences in the API when they should be UI-only.

**The key insight:** The AI doesn't know what it doesn't know. This rule forces it to find out before building.

### Rule 4: Ubiquitous Language (Domain Glossary)

**File:** `rules/ubiquitous-language.md`

**What it prevents:** AI introducing naming drift that makes the codebase harder to understand over time.

**Core components:**

```
1. Locate the glossary file (GLOSSARY.md) before coding
2. Extract existing domain definitions
3. Align new code with glossary terms exactly
4. Propose new terms before implementing them
5. Bootstrap protocol: offer to generate GLOSSARY.md if missing
```

**Without this rule:** Over 10 AI-assisted tasks, the same domain concept will appear as `Supplier`, `Provider`, `Vendor`, `Client`, and `Seller` in different parts of the code. A human developer reading the codebase will waste time figuring out whether these are five different concepts or one concept with five names.

**Bootstrap checklist for new projects:**
1. Scan main entity files, class declarations, database schemas
2. Extract top 10-15 recurrent nouns and domain concepts
3. Verify synonyms: check if identical concepts have different names
4. Draft GLOSSARY.md with: term, domain definition, code reference, prohibited aliases

### Rule 5: Vertical Slicing

**File:** `rules/slicing.md`

**What it prevents:** AI building the entire database schema, then all the APIs, then all the UI — resulting in a feature that isn't testable until everything is done.

**Core components:**

```
1. Decompose by user story, not by technical layer
2. Each slice: Schema → Repository → Service → Route → UI for one user action
3. Implement one slice at a time
4. Validate end-to-end before moving to next slice
5. Keep changesets small — each slice is a mini-release
```

**Without this rule:** The AI will build horizontally. You'll get 10 database migrations, 5 new API endpoints, and a new Vue page — none of which work together because the integration was never tested. You'll spend 2 days debugging the integration instead of 2 hours building slice by slice.

**Bad (horizontal) vs Good (vertical slicing):**

```
BAD:    1. Create all database schemas
        2. Implement all APIs
        3. Build UI for all features
        → Nothing works until everything works

GOOD:   Slice A: "Save a new item" (Schema, Repo, API, barebones UI)
        Slice B: "Display list of items" (Read repo, list API, list component)
        Slice C: "Edit item details" (Update repo, PATCH API, edit form)
        → Each slice is independently testable and mergeable
```

### Rule 6: Skill Compliance

**File:** `rules/skill-compliance.md`

**What it prevents:** AI announcing it's using a skill and then selectively skipping steps.

**Core components:**

```
1. Loading a SKILL.md is a binding commitment to the full workflow
2. Complexity and effort are NOT valid reasons to skip steps
3. Must identify every mandatory/required/must/hard-stop step
4. Must execute every mandatory step in order
5. Must produce exact artifacts the skill specifies
6. Blockers must be reported explicitly — never silently skipped
7. Self-check before final output: confirm complete workflow execution
```

**Without this rule:** The AI will load a skill, read the first phase, decide "that's enough context," and produce code without running through the full design checkpoint, SOLID audit, readability audit, and tech debt inventory. The output will be a pale imitation of what the skill was designed to produce.

**The hard-stop gate pattern:**
Some rules need to be absolute. Skill compliance uses "hard-stop gates" — conditions where the AI must STOP and cannot proceed. Examples:
- Phase 1 design checkpoint: if any of the 7 questions can't be answered, redesign first
- TDD: if tests weren't written first, stop and write them
- Ambiguity policy: if an edge case has multiple reasonable behaviors and none is specified by contract, stop and ask the user

### Rule 7: Self-Grounded Verification

**File:** `rules/self-grounded-verification.md`

**What it prevents:** AI validating its own (or a user's) work because it is already in context — *agreement bias*.

**Core components:**

```
1. Two-step verification: elicit success criteria BEFORE examining the artifact
2. Step 1 criteria derived from requirement/contract only — NOT from the artifact
3. Every criteria set includes a disconfirming check ("what would prove this wrong?")
4. Step 2 evaluates artifact against each criterion: PASS / FAIL / UNVERIFIED + cited evidence
5. Verdict is PASS only if every criterion is PASS
6. Compose with delegation (reviewer skill): delegation removes shared context; SGV hardens in-context checks
```

**Without this rule:** The AI reads its own implementation, decides it looks correct, sees a green-looking test run, and declares the task done — generating confident reasoning that rationalizes rather than interrogates. Bugs that the AI actually *knows how to catch* slip through because it never separated "what should be true" from "what the code does."

**The research grounding:** Andrade et al., "Let's Think in Two Steps: Mitigating Agreement Bias in MLLMs with Self-Grounded Verification" (ICLR 2026), found that MLLM verifiers over-validate flawed agent behavior *even when they hold correct, human-aligned priors* about success. The bias is pervasive across model families and **resilient to test-time scaling** — thinking harder in one pass produces more elaborate rationalization, not better detection. Their fix (SGV) decouples verification: retrieve priors unconditionally (without the artifact), then evaluate conditioned on those self-generated priors. This yielded up to 20-point gains in failure detection. The rule ports this two-step discipline into the agent's verification and self-review moments.

---

## 3. Nice-to-Have Rules

These rules add value but aren't essential on day one. Add them when the failure pattern they prevent has actually occurred.

### Handoff Protocol

**File:** `rules/handoff.md`

**When to add:** When you've lost context between sessions and had to re-explain the task. Or when working with multiple AI sessions in parallel and need to share state.

**What it does:** Defines when to save/restore session checkpoints (handoffs) containing goal, status, decisions, blockers, and next actions.

### Skills Discovery

**File:** `rules/skills-discovery.md`

**When to add:** When you have 5+ skills and the AI starts loading the wrong ones or loads too many.

**What it does:** Defines index-first routing — read INDEX.md before loading any skill body. Establishes `code-craft` as the default for implementation tasks.

### Command Routing

**File:** `rules/command-routing.md`

**When to add:** When you want CLI shortcuts (e.g., `/review`, `/swarm`) that route to specific skills without the user needing to know skill names.

**What it does:** Maps user-facing commands to skill-loading prompts.

---

## 4. The Failure Pattern → Rule Evolution Loop

Rules are not designed in advance. They emerge from this cycle:

```
1. OBSERVE → AI produces bad output
2. DIAGNOSE → What specific capability/constraint was missing?
3. ENCODE → Write a rule that would have prevented this specific failure
4. TEST → Use the rule in the next similar task
5. REFINE → If the rule blocked the failure AND didn't cause false positives, keep it
6. GENERALIZE → If the same pattern applies to other contexts, broaden the rule
```

### When to Add a Rule

| Signal | Action |
|---|---|
| Same mistake in 2+ AI outputs | Write a one-sentence rule targeting that mistake |
| Same mistake in 5+ outputs across different tasks | Write a formal rule with examples and a hard-stop gate |
| Mistake would cause data loss, security breach, or financial error | Write a rule immediately, regardless of frequency |
| AI follows the letter but violates the spirit of existing rules | Refine existing rule, don't add a new one |

### When NOT to Add a Rule

| Anti-Signal | Why Not |
|---|---|
| Hypothetical concern ("what if the AI does X?") | Rules without real failure patterns don't stick |
| "This would be nice to enforce" | Rules cost context window space — be stingy |
| "This is obvious to any good developer" | The AI will follow it without a rule. If it doesn't, THEN add one. |
| Trying to pre-empt a failure from a different project | Each project has its own failure patterns |

### Example Evolution: The "No Silent Error Swallowing" Rule

**Failure observed:** The AI wrote `try { riskyOperation() } catch (e) { return null }` — silently hiding a database connection failure that caused data to appear empty instead of erroring.

**Initial rule:** "Don't swallow errors silently."

**Refinement 1:** The AI started catching errors and logging them, but still returned `[]` for failed API calls, making the frontend show "no data" instead of "error."

**Refined rule:** "Every fallback, default, degraded-mode, or error-mapping path must be traceable to an explicit contract. If code returns `[]`, `null`, or `false` on failure, document WHY with a `// WHY:` comment. Do not turn uncertainty into fake success."

**Refinement 2:** The AI documented WHY it was returning empty arrays but the justification was circular ("returning [] so the UI doesn't break").

**Final rule:** Added to the Prohibited Patterns list: "Silent semantic fallback: returning `[]`, `null`, `false`, partial success, or a no-op for an ambiguous/failed case without contract approval."

---

## 5. Catalog of AI Failure Patterns

These are the failure patterns observed across real AI-augmented development. Each pattern explains what it looks like, what rule defends against it, and what the escalation path should be if the rule isn't working.

### Category A: Code Quality Failures

#### A1. Silent Error Swallowing

**Symptom:** `catch (e) {}` or `except: pass` with no logging, no re-raise, no fallback contract.

**What happens:** Production errors disappear. A database outage shows as "no data found" instead of "service unavailable." Debugging takes hours because the error was consumed.

**Defending rule:** Code Quality Baseline (Prohibited Patterns: Silent error swallowing)

**Escalation:** If the AI keeps swallowing errors after the rule, the error handling is probably too cumbersome. Simplify: add a utility function like `logAndRethrow()` that makes correct handling as easy as swallowing.

#### A2. Business Logic in Views/Controllers

**Symptom:** A Vue component computing `discountPrice = basePrice * (1 - marginThreshold / 100)` — business logic embedded in presentation code.

**What happens:** The same business rule gets implemented differently in 3 different places. When the business rule changes, you must find and update all 3. If you miss one, the UI shows wrong data.

**Defending rule:** Code Quality Baseline (Prohibited Patterns: Mixing layers)

**Escalation:** If the AI keeps putting logic in views, the backend probably doesn't expose a convenient endpoint for the data the frontend needs. The fix is an API change, not a rule change.

#### A3. Magic Literals

**Symptom:** `if (status === "pending_review")`, `timeout = 5000`, `maxItems = 100` sprinkled throughout the code.

**What happens:** When the status value changes or the timeout needs adjusting, you hunt through the entire codebase. The AI has no standard way to update these.

**Defending rule:** Code Quality Baseline (Prohibited Patterns: Magic literals)

**Escalation:** If the AI keeps using magic literals, create a constants file with clear naming conventions and reference it in the rule.

#### A4. Extend-by-Parameter Growth

**Symptom:** A function grows from 2 parameters to 6 over several AI-assisted tasks, with booleans controlling behavior branches.

**What happens:** The function becomes a "god function" that does 4 different things depending on flag combinations. Testing explodes combinatorially. Callers don't know which flags to set.

**Defending rule:** Code Quality Baseline (Prohibited Patterns: Extend-by-parameter)

**Escalation:** When you see a function reaching 4+ parameters, it's time for a composition refactor — extract the variants into separate functions or use a strategy pattern.

#### A5. Shallow Helper Over-Extraction

**Symptom:** The AI extracts a 2-line calculation into its own function, creating indirection without hiding complexity.

**What happens:** The codebase fills with tiny helper files. A reader must jump through 5 files to follow a 10-line flow. The files have names like `calculateDiscount`, `applyDiscount`, `validateDiscount` — each containing 3 lines.

**Defending rule:** Code Quality Baseline (Required Structure Patterns: Deep Modules over Shallow Modules)

**Escalation:** Inline the shallow helpers. The rule is: only extract when `interface complexity << implementation complexity`.

### Category B: Process Failures

#### B1. Untested Code Delivery

**Symptom:** The AI writes a complete feature implementation and declares it done without running any tests.

**What happens:** The code compiles but has logic errors. The AI's confidence is indistinguishable from correctness. You only discover the bugs in manual testing.

**Defending rule:** TDD Enforcement

**Escalation:** Require the AI to post test output as part of its completion message. If tests weren't run, the task isn't done.

#### B2. Specification Misalignment

**Symptom:** The AI builds a feature that technically works but doesn't match what the user wanted because it filled in ambiguous requirements with assumptions.

**What happens:** 2 hours of implementation → code review reveals wrong approach → 1 hour of rework. Total waste: 3 hours on a 1-hour task.

**Defending rule:** Grooming (Reverse Interview)

**Escalation:** If the AI skips the grooming interview, stop the task and re-prompt with: "Before implementing, ask me 3-5 clarifying questions about this feature."

#### B3. Skill Workflow Skipping

**Symptom:** The AI says "I'll use code-craft for this" and then writes code without going through the 5-phase workflow (design intent → SOLID check → write with standards → readability audit → tech debt inventory).

**What happens:** The code passes basic review but accumulates structural problems: mixed responsibilities, no error contracts, undocumented design decisions. Over 10 tasks, the module becomes unmaintainable.

**Defending rule:** Skill Compliance

**Escalation:** Add a checkpoint requirement — the AI must post its Design Intent block and SOLID checklist before writing code. If it doesn't, it's a rule violation.

#### B4. Horizontal Building

**Symptom:** The AI writes all database schemas first, then all APIs, then all UI. Nothing is testable until everything is done.

**What happens:** Integration bugs are discovered late. A schema mistake discovered after the UI is built requires changing everything.

**Defending rule:** Vertical Slicing

#### B5. Agreement Bias in Self-Review

**Symptom:** The AI reads its own implementation (or a candidate solution already in context) and declares it correct. A test run "looks green" and the AI stops checking. It produces confident, articulate reasoning that *justifies* the artifact rather than *interrogating* it.

**What happens:** Bugs the AI actually knows how to catch slip through, because success criteria were never stated independent of the artifact — the AI checked the code against itself, a circular loop that always passes. This is distinct from B1 (no tests were run at all): here tests may run and even pass, but they don't test the actual requirement, or the "verification" was really just re-reading the code with a favorable eye.

**Defending rule:** Self-Grounded Verification (`rules/self-grounded-verification.md`) — state artifact-independent success criteria and a disconfirming check FIRST, then evaluate the artifact against them with cited evidence.

**Escalation:** If the AI keeps declaring things "done" without a Step-1/Step-2 split, require it to output the Success Criteria checklist before the Verification Result table in any completion message. If in-context bias persists even with the checklist, escalate to delegation — hand the review to an independent subagent (see `reviewer` skill's Author Bias Gate) since no amount of single-context restructuring fully eliminates shared-context bias.

**Note:** This differs from `reviewer`'s Author Bias Gate. That gate is about *whether to delegate at all* when you're the author. This pattern is about *what to do inside a single context* when delegation isn't available or the check is lightweight — the two are complementary layers, not competing fixes.

### Category C: Naming & Context Failures

#### C1. Term Drift

**Symptom:** The same concept appears as `productId` in the database, `sku_id` in the API, and `itemCode` in the frontend — all introduced by different AI-assisted tasks.

**What happens:** A new developer or AI agent reading the codebase must constantly translate between naming conventions. Search-and-replace becomes dangerous because you can't tell if `itemCode` and `productId` are the same thing.

**Defending rule:** Ubiquitous Language (GLOSSARY.md)

#### C2. Fabricated APIs and Functions

**Symptom:** The AI calls `warehouse.getStockLevel(productId)` — a function that doesn't exist. It hallucinated an API that seemed reasonable.

**What happens:** The code doesn't compile or runtime-crashes. The AI's hallucination is confident enough that a junior developer might spend time trying to find the "missing" import.

**Defending rule:** Codebase exploration before implementation. The WIRING.md composition pathway (exploration → code-craft) enforces this.

### Category D: Business & Security Failures

#### D1. Invented Business Rules

**Symptom:** The AI encounters an ambiguous edge case (e.g., "what discount applies when the order crosses a price threshold at exactly midnight?") and picks an answer instead of asking.

**What happens:** The wrong business rule ships to production. In a financial system, this means money is calculated incorrectly. The error might not be detected for weeks.

**Defending rule:** Code Quality Baseline (Ambiguity policy: stop and ask) + Prohibited Patterns (Guessing through ambiguity)

#### D2. Optimistic Data Mutation

**Symptom:** The AI implements an "optimistic update" pattern — updating the UI immediately and hoping the backend succeeds — for financial data.

**What happens:** The UI shows a purchase order as "submitted" while the backend rejected it. The user makes decisions based on stale data.

**Defending rule:** Project-specific rule in AGENTS.md: "Financial-critical system: do not show speculative or mis-synced business data in the UI."

#### D3. Secret Exposure

**Symptom:** The AI hardcodes an API key, database password, or access token in source code for "convenience during development."

**What happens:** The secret is committed to git. Even if removed later, it's in the git history. A security scan may catch it, but if not, it's a breach waiting to happen.

**Defending rule:** Git Safety rules (from agent instructions) + .gitignore patterns + automated secret scanning (trufflehog, git-secrets)

### Category E: Architectural Failures

#### E1. God Object Growth

**Symptom:** Over 5 AI-assisted tasks, `PurchaseOrderController` grows from 100 lines handling one concern to 500 lines handling orders, pricing, sync status, and export formatting.

**What happens:** The class becomes impossible to test in isolation. Any change risks breaking unrelated functionality. New team members can't understand it.

**Defending rule:** Code Quality Baseline (Prohibited Patterns: Classes owning multiple domain concepts)

#### E2. Implicit Coupling

**Symptom:** Two modules share state through a global variable or rely on specific call ordering that isn't documented.

**What happens:** Changing module A's initialization breaks module B silently. The bug only surfaces in production when a specific sequence of operations occurs.

**Defending rule:** Code Quality Baseline (Prohibited Patterns: Global mutable state without justification) + Refactoring Signal Markers (implicit-coupling)

#### E3. Infinite Migration Churn

**Symptom:** The AI modifies an existing database migration instead of creating a new one, or creates migrations that can't be downgraded.

**What happens:** Database schemas become unrecoverable. Rollback stops working. Data can be lost.

**Defending rule:** Project-specific database migration rules (in AGENTS.md): strict schema reversion protocol, upgrade/downgrade testing requirement.

---

## 6. Designing a Skill from Scratch

### When to Create a Skill

A skill is warranted when:

1. A task type repeats frequently (3+ times per sprint)
2. The task has multiple phases that must be executed in order
3. Doing the task well requires methodology that isn't obvious from the codebase alone
4. The cost of doing the task poorly is high (bugs, rework, architectural damage)

Do NOT create a skill for:
- One-off tasks
- Tasks that can be described in a single sentence
- Tasks already covered by an existing skill (extend that skill instead)

### The Anatomy of a Skill

Every skill has this structure:

```
skills/<skill-name>/
├── SKILL.md                 # Main workflow document
├── references/              # Deep-dive guides loaded on demand
│   ├── <topic-1>.md
│   ├── <topic-2>.md
│   └── templates/          # Output templates (optional)
└── assets/                  # Data files, CSVs, images (optional)
```

### Writing the SKILL.md

A SKILL.md starts with YAML frontmatter (used by the harness for semantic matching and trigger routing) followed by the workflow body. The frontmatter replaces any inline "When to Load" section — that information is redundant once the skill is already loaded, so keep it out of the body to conserve context.

#### Section 1: YAML Frontmatter (Harness Matching)

The file MUST begin with a YAML frontmatter block delimited by `---`. Two fields are required:

- **`name`** — Machine-readable skill identifier (lowercase, kebab-case)
- **`description`** — Semantic matching string. Contains what the skill does, when to use it, trigger phrases, and exclusion criteria. The harness uses this to decide whether to surface the skill to the agent. It is NOT re-injected into the skill body — the agent does not re-read it after loading.

```
---
name: code-craft
description: "Code design discipline enforcing SOLID, KISS, DRY, modularity, separation of concerns, and human-readability during implementation. Load for any non-trivial code write, feature addition, refactor, or restructuring. Activate on \"refactor\", \"restructure\", \"design this module\", \"clean up this code\", or any implementation touching more than one file. Skip for typos, formatting, config value changes, or renaming without logic changes."
---
```

**Design rules for the description field:**
- Keep it to 2-5 sentences; the harness needs concise signal, not exhaustive documentation
- Include explicit trigger phrases in quotes (e.g., `"refactor"`, `"restructure"`)
- Include explicit exclusion criteria (e.g., "Skip for typos, formatting")
- Use `\"` to escape quotes within the YAML string
- Do NOT duplicate the description content in the skill body — it wastes context

#### Section 2: Workflow Phases

Each phase has a name, a purpose, and a set of artifacts it must produce. Mark mandatory phases explicitly:

```
## Skill Workflow

This skill has five phases. All five must be completed.

### Phase 1 — Design Intent & Resilience Plan
### Phase 2 — SOLID & Clean Architecture Check
### Phase 3 — Write with High-Quality Standards
### Phase 4 — Readability & Robustness Audit
### Phase 5 — Tech Debt Inventory
```

#### Section 3: Stop Conditions (Gates)

Define conditions where the skill workflow must HALT. A stop condition means: "do not proceed past this point until this is satisfied."

Example from code-craft:
```
STOP CONDITION: Isolation test = "no"
→ Redesign the dependency structure. A unit that cannot be isolated
  has too many implicit couplings — extract them.
```

#### Section 4: Deliverable Checklist

What must be true for the task to be considered complete:

```
## Deliverable

The skill's output is working code that satisfies:
- [ ] Design Intent & Resilience Plan block was produced
- [ ] SOLID & Clean Architecture check passed or debt documented
- [ ] Code follows naming, structure, and traceability rules
- [ ] Tests written and passing per TDD protocol
- [ ] Tech Debt Inventory produced
```

#### Section 5: Anti-Pattern Table

The most important section. List the shortcuts the AI will try to take, and what to do instead:

| Temptation | Why It's Wrong | Correct Path |
|---|---|---|
| "I'll add this method to the existing class" | Violates Single Responsibility | Create a separate module/service |
| "I'll use a dict here — it's flexible" | Hides structure; readers can't see fields | Use typed struct, dataclass, or interface |
| "I'll return [] so callers don't break" | Hides contract ambiguity | Surface a typed/domain error |

#### Section 6: References

Point to deep-dive documents that should only be loaded when needed:

```
## References

- `references/code-quality.md` — Detailed code quality checklist
- `references/templates/prd.md` — PRD output template
```

### Quality Bar for Skills

Before deploying a skill, verify:

1. **Completeness**: Does the workflow cover setup → execution → verification → cleanup?
2. **Stop conditions**: Are there gates that prevent the AI from producing bad output?
3. **Anti-pattern table**: Are the most common shortcuts documented and countered?
4. **Deliverable checklist**: Can the user verify the skill was followed correctly?
5. **Length**: Is the SKILL.md under 500 lines? If longer, move deep content to `references/`.

### Skill References: When to Split

References are loaded on demand, not at skill load time. Move content to references when:

- It's only needed for certain variants of the task
- It's implementation detail rather than methodology
- It changes frequently (templates, checklists, domain-specific data)
- It's a sub-workflow that only triggers in specific conditions

Example: The `reviewer` skill keeps its core methodology in `SKILL.md` but loads sub-reviewer lenses (security, code-quality, editorial) as references only when the relevant lens is needed.

---

## 7. Skill Lifecycle: From Prototype to Team Standard

### Stage 1: Prototype (1-2 uses)

Write the SKILL.md as a checklist, not a polished document. Use it yourself for 2 tasks. Track:
- What steps did the AI skip?
- What steps took too long?
- What steps produced no value?

### Stage 2: Hardening (3-5 uses)

Add stop conditions for the steps the AI skipped. Add anti-pattern examples for the shortcuts the AI tried. If a step produced no value in any of the 5 uses, remove it.

### Stage 3: Team Adoption (5+ uses)

Share the skill with the team. This is when you add:
- A polished `description` field in the YAML frontmatter with explicit trigger phrases and exclusion criteria
- The INDEX.md entry mapping task types to this skill
- The WIRING.md entry showing how this skill composes with others
- Examples of good and bad outputs

### Stage 4: Maintenance

Review skills quarterly. For each skill, ask:
- Is it still used? (check session logs for skill loads)
- Are the stop conditions still relevant? (have new failure patterns emerged?)
- Is it too long? (skills grow over time — trim fat)

### When to Deprecate a Skill

Deprecate when:
- The skill's methodology has been absorbed into project rules (no longer needs explicit loading)
- The task type no longer occurs
- Two skills overlap so much that merging is better

Don't delete deprecated skills immediately — mark them `[DEPRECATED]` in INDEX.md for one quarter so team members still using them see the notice.

---

## 8. Skill Composition: WIRING.md

### What WIRING.md Does

When a complex task needs multiple skills, the AI must know what order to load them in and when to hand off. WIRING.md defines these pathways.

### Structural Format

```
## Strategic Composition Pathways

### Debugging & Fixing
1. `codebase-exploration` — navigate unfamiliar boundaries
2. `systematic-investigation` — root cause analysis
3. `code-craft` — disciplined fix implementation
4. `reviewer` — verify fix addressed root cause

### Feature Implementation
1. `requirements-driven-dev` — if feature is large or ambiguous
2. `codebase-exploration` — map target areas
3. `code-craft` — disciplined implementation
4. `reviewer` — post-implementation review
```

### Handoff Matrix

A table showing which skills naturally hand off to which others:

| From | To | Triggers & Context |
|---|---|---|
| `codebase-exploration` | `systematic-investigation` | "I understand the map, now investigating root cause" |
| `systematic-investigation` | `code-craft` | "Root cause found, now implementing the fix" |
| `code-craft` | `reviewer` | "Implementation complete, ready for review" |

### Default Composition Rules

```
- Default for implementation: load `code-craft`
- `code-craft` can compose with any other primary skill as a design lens
- Prefer no skill for simple edits
- Prefer the narrowest skill that matches user intent
```

---

## 9. Maintaining Rules and Skills Over Time

### The Quarterly Audit

Every quarter, audit your `.agents/` directory with these questions:

**For rules:**
1. Has this rule prevented a failure in the last quarter? (If not, it might be obsolete)
2. Has this rule caused false positives — blocking correct code? (If yes, soften it)
3. Is there a new failure pattern that isn't covered by any rule? (If yes, add a rule)
4. Is this rule still at the right level of abstraction? (Rules that are too specific become dead; rules that are too general cause false positives)

**For skills:**
1. Usage: How many sessions loaded this skill?
2. Quality: What reviewer findings followed skill-loaded tasks?
3. Completeness: Is the workflow still correct given changes to the codebase?
4. Length: Has the skill grown? If so, is the growth justified?

### The Monthly Failure Review

Once a month, review AI output that needed significant human correction. For each instance:

1. What was the AI's mistake?
2. Was there a rule that should have prevented it? (If yes, why didn't it work?)
3. Was there no rule? (If not, should there be?)
4. Could a skill have prevented this? (If yes, does such a skill exist?)

This review is the primary driver of rule and skill evolution.

### The Newcomer Test

Every 6 months, have someone unfamiliar with the project attempt an AI-assisted task using only:
- `AGENTS.md` for context
- `.agents/rules/` for constraints
- `.agents/skills/INDEX.md` for task routing

Observe where they struggle. Those are the gaps in your agent infrastructure.

---

## Appendix: Rule Template

Use this template when creating a new rule:

```markdown
# Rule: [Rule Name]

This rule applies to **all [task type]** tasks. It [one-sentence purpose].

---

## [Section: What It Prevents]

[Describe the specific AI failure pattern this rule defends against.]

---

## [Section: Core Components]

[Numbered list of what the rule requires, with concrete examples.]

---

## [Section: Stop Conditions]

[What conditions cause this rule to halt execution.]

---

## [Section: Exceptions]

[When this rule does NOT apply. Be specific.]

---

## [Section: Escalation]

[What to do if the rule is being followed but still producing poor output.]

```

## Appendix: Skill Template

Use this template when creating a new skill. The `description` field in the frontmatter is the harness-facing semantic match string — include trigger phrases and exclusion criteria there. Do NOT duplicate "when to load" information in the skill body.

```markdown
---
name: [skill-name]
description: "[One-sentence summary]. Load for [specific task types]. Activate on [\"trigger phrase 1\", \"trigger phrase 2\"]. Skip for [when NOT to load]."
---

# Skill: [Skill Name]

[Brief intro — 1-2 sentences on what this skill does, expand the frontmatter description with context the agent needs after loading.]

---

## Skill Workflow

This skill has [N] phases. All must be completed.

### Phase 1 — [Name]
[Purpose of this phase.]
[Exact steps to execute.]
[Artifacts to produce.]

### Phase 2 — [Name]
[Purpose.]
[Steps.]
[Artifacts.]

---

## Stop Conditions

[Conditions that MUST halt execution. Include what to do at each stop.]

- **STOP CONDITION:** [condition] → [required action]
- **STOP CONDITION:** [condition] → [required action]

---

## Deliverable

- [ ] [Completion criterion]
- [ ] [Completion criterion]

---

## Design Decision Anti-Patterns

| Temptation | Why It's Wrong | Correct Path |
|---|---|---|
| [Shortcut the AI will try] | [Why it's harmful] | [What to do instead] |

---

## References

- `references/[file].md` — [what it contains, loaded on demand]
```
