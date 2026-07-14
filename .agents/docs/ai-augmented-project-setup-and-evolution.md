# AI-Augmented Project Setup & Evolution Guide

**Status**: canonical
**Owner**: Engineering / AI Enablement
**Audience**: New team members, AI agents (treated as junior team members), engineering leads, management

> This guide covers the complete lifecycle of setting up and evolving a project for AI-augmented development: onboarding a new team member (human or AI), engineering discipline, automation, security, management visibility, and continuous evolution. Every concept is explained in full — no external project knowledge required.

---

## Table of Contents

1. [Guiding Philosophy](#1-guiding-philosophy)
2. [Architecture of AI-Agent Governance](#2-architecture-of-ai-agent-governance)
3. [Project Onboarding: First 30 Minutes](#3-project-onboarding-first-30-minutes)
4. [Project Onboarding: First Week](#4-project-onboarding-first-week)
5. [Working with AI Agents as Junior Team Members](#5-working-with-ai-agents-as-junior-team-members)
6. [Code Quality & Engineering Discipline](#6-code-quality--engineering-discipline)
7. [Automation, CI/CD & Deployment](#7-automation-cicd--deployment)
8. [Security, Audit & Compliance](#8-security-audit--compliance)
9. [Management Visibility & Governance](#9-management-visibility--governance)
10. [Evolving the Project Over Time](#10-evolving-the-project-over-time)
11. [Checklist: Adapting This Guide to Your Project](#11-checklist-adapting-this-guide-to-your-project)

---

## 1. Guiding Philosophy

### The AI-Augmented Team Model

This guide treats AI coding agents (Kilo, Claude, Codex, etc.) as **junior team members** — not as magical oracles, not as typewriters. Like a junior engineer, the AI agent needs:

- Clear source-of-truth documents to reference
- Explicit conventions rather than implicit assumptions
- Bounded tasks with well-defined acceptance criteria
- Code review and quality gates before code is accepted

The infrastructure you create in the project's `.agents/` directory is the "onboarding manual" you give to both your human and AI juniors. It encodes everything a newcomer needs to know to contribute safely and consistently.

### Three Audiences, One Source of Truth

Every convention in your project serves three audiences simultaneously:

| Audience | What They Need |
|---|---|
| **Human engineers** | Clear conventions, tooling commands, architecture overview |
| **AI agents** | Explicit rules, deterministic workflows, contract definitions |
| **Management** | Audit trails, cost visibility, velocity metrics, compliance posture |

A useful litmus test for any rule or convention: "Would a junior engineer understand this? Would an AI misinterpret this? Could I explain this to my manager in 30 seconds?"

### What This Guide Covers

This guide addresses the full lifecycle:

1. **Setup** — What files to create when starting an AI-augmented project
2. **Onboarding** — What a new team member (human or AI) needs in the first 30 minutes and first week
3. **Daily work** — How to interact with AI agents productively
4. **Quality** — Engineering discipline and quality gates
5. **Infrastructure** — Automation, CI/CD, deployment patterns
6. **Security & Compliance** — Audit trails, secret management, business conformance
7. **Management** — Visibility into AI-assisted development for non-technical leadership
8. **Evolution** — How to adapt the setup as the project matures and failure patterns emerge

---

## 2. Architecture of AI-Agent Governance

### Two Configuration Layers

AI agent projects use two layers of configuration, kept strictly separate:

**Layer 1: Personal Toolkit** — The lead engineer's private configuration lives in a personal directory (typically `~/.agents/`). This contains:

- Personal preferences (effort level, permission defaults)
- Experimental skills still being tested
- Provider credentials and service connections
- Personal session history

**Layer 2: Project Contract** — The team-shared configuration lives in `<project-root>/.agents/`. This contains:

- Rules that apply to every task in this project
- Skills with workflows tailored to this project's stack and domain
- Memory: short-term session checkpoints + long-term consolidated memory (see `memory` skill)
- Project-specific infrastructure templates

**Why separate them:** A new team member who clones the repo must get the full project configuration without any dependency on the lead's personal tooling. Conversely, the lead's personal configuration should never leak into the team's shared contract.

### The `.agents/` Directory Structure

The project's `.agents/` directory follows this structure:

```
<project-root>/.agents/
├── rules/                    # Non-negotiable constraints active on every task
│   ├── code-quality.md       # Design checkpoint, naming, prohibited patterns
│   ├── tdd.md                # Red-Green-Refactor protocol
│   ├── grooming.md           # Reverse interview before complex tasks
│   ├── ubiquitous-language.md # Sync with GLOSSARY.md before coding
│   ├── slicing.md            # Vertical slicing for feature work
│   ├── skill-compliance.md   # Loading a skill = binding commitment to full workflow
│   └── self-grounded-verification.md # Anti-agreement-bias: separate criteria from artifact
│   ├── memory.md             # When to capture/recall/consolidate/evict memory
│   └── skills-discovery.md   # How to select the right skill for a task
│
├── skills/                   # Complete workflows loaded per-task
│   ├── INDEX.md              # Routing table: which skill fits which task
│   ├── WIRING.md             # How skills compose for complex tasks
│   ├── code-craft/           # Default implementation skill (5-phase workflow)
│   ├── systematic-investigation/ # Debugging and root cause analysis
│   ├── reviewer/             # Multi-lens code/spec review
│   ├── requirements-driven-dev/  # PRD → TRD → BDD specification workflow
│   ├── codebase-exploration/ # Navigating unfamiliar codebases
│   ├── memory/               # Short-term + long-term memory with dream-cycle
│   ├── brainstorming/        # Creative ideation and problem framing
│   └── <project-specific>/   # Skills unique to this project's stack
│
└── memory/                   # short-term/, long-term/, archive/ — see skills/memory
```

### Key Files Explained

**INDEX.md** — A routing table consulted before loading any skill. It has four columns:

| Skill | When to Use | When NOT to Use | Cost |
|---|---|---|---|
| `code-craft` | Any non-trivial code write, feature, or refactor | Typos, formatting, config changes, renames | Medium |

The "When NOT to Use" column is what prevents skill overload — the AI must not load a 500-line workflow for a one-line edit.

**WIRING.md** — Defines how skills compose for complex tasks. Example pathway:

```
Debugging: codebase-exploration → systematic-investigation → code-craft → reviewer
```

This prevents the AI from trying to debug without first understanding the codebase, or fixing without verifying the root cause was addressed.

**Rules** are always active — the AI must follow them on every task without being told. **Skills** are loaded on demand — the AI loads them only when the task matches the skill's trigger phrases.

### Adapting to Harness Limitations

Not every AI coding tool supports loading arbitrary markdown files as rules or consulting an index for skill routing. The most common denominator across tools is two primitives: **skills** (selected by matching user input against a short description string) and a single **instructions file** (a markdown file injected into every session as the AI's system prompt — typically called `AGENTS.md` or similar). This section explains how to make the full governance layer work even when you only have those two primitives available.

#### What Different Harness Tiers Support

The governance model described in this guide assumes a full-featured harness. In practice, you may have fewer capabilities. Here is what each tier can load automatically (without the user manually pasting files):

| Capability | Full-featured harness | Minimal harness |
|---|---|---|
| Rules from separate `rules/*.md` files | ✅ Automatic, always active | ❌ Not supported |
| Skill index (INDEX.md) consulted for routing | ✅ Agent consults index before picking skill | ❌ Skills selected only by matching their `description` field |
| Composition pathways (WIRING.md) | ✅ Used for multi-skill chains | ❌ Agent must infer from skill body or instructions file |
| Single instructions file (AGENTS.md) injected as context | ✅ Full file injected | ✅ Full file injected |

#### General Principle: Embed What the Harness Can't Load

Any governance content the harness cannot load from separate files must be embedded into the one file it always can: the instructions file (AGENTS.md). The sections below show how to embed rules, routing, and composition content — each as a self-contained section within AGENTS.md.

#### Strategy: Embed Rules into the Instructions File

When `rules/` files are not auto-loaded, embed the essential rule content directly into the instructions file.

**What to embed:**

1. **Code quality baseline** — The prohibited patterns list (silent error swallowing, magic literals, mixing layers, guessing through ambiguity, extend-by-parameter). This is the highest-value rule set for preventing AI output quality degradation.
2. **TDD protocol** — Red-Green-Refactor cycle and when it's required vs skippable.
3. **Grooming protocol** — Requirement to ask clarifying questions before complex tasks.
4. **Skill compliance** — Loading a skill = binding commitment to execute its full workflow.
5. **Self-grounded verification** — Before declaring work done, state success criteria independent of the artifact (including a disconfirming check), then evaluate the artifact against them with cited evidence. Counters agreement bias — the tendency to validate whatever is already in context.
6. **Project-specific hard rules** — Where business logic lives, data integrity constraints, rules against manipulating servers.

**What NOT to embed** in the instructions file (keep in separate docs for human reference):

- Full multi-question checklists (summarize the principle, not every item)
- Detailed failure pattern catalogs
- Skill design methodology
- Audit and maintenance processes

**Example — embedded rules in AGENTS.md:**

```
## Agent Operating Rules

### Skill Compliance (Non-Negotiable)
Loading or reading a skill's SKILL.md is a binding commitment to execute
its complete workflow. You do not have discretion to simplify or abbreviate
a skill's workflow once you have selected it.

### Code Quality Baseline
Before writing any new function, class, or module:
- Single responsibility: what is the ONE thing this unit does?
- Minimal interface: define only the smallest surface callers need
- Human traceability: can a reader follow logic from names alone?

Prohibited patterns (hard stop):
- Silent error swallowing: `catch(e) {}` with no handling
- Magic literals: use named constants
- Business logic in views/controllers: extract to services
- Guessing through ambiguity: ask, don't invent fallback behavior
```

#### Strategy: Embed Skill Routing into the Instructions File

When the harness cannot consult a skill index, embed a condensed routing table directly in the instructions file. This lets the agent self-route to the right skill for each task type:

```
## Scope-Based Routing

Default for implementation tasks: load `code-craft`. Load it any time
you write or modify code logic.

| Task Type | Load This Skill | Skip When |
|---|---|---|
| Write/refactor code | `code-craft` | Typos, formatting, config changes |
| Debug a bug | `systematic-investigation` | Task is creative brainstorming |
| Design a feature | `requirements-driven-dev` | Small well-scoped fix from existing plan |
| Review code/specs | `reviewer` | User only asked for implementation |
| Navigate unknown code | `codebase-exploration` | Relevant files already known |
```

#### Strategy: Embed Composition Pathways into the Instructions File

Skill composition pathways can be embedded as a concise section so the agent knows how to chain skills for complex tasks:

```
## Skill Composition Pathways

### Debugging & Fixing
1. `codebase-exploration` — navigate unfamiliar boundaries
2. `systematic-investigation` — root cause analysis
3. `code-craft` — disciplined implementation of the fix
4. `reviewer` — verify fix addressed root cause

### Feature Implementation
1. `requirements-driven-dev` — if feature is large/ambiguous
2. `codebase-exploration` — map target areas
3. `code-craft` — disciplined implementation
4. `reviewer` — post-implementation review
```

#### Skill Frontmatter: The Only Routing Mechanism

Under a minimal harness, the `description` field in each skill's YAML frontmatter is the ONLY mechanism the tool uses to decide which skill to offer for a given task. This makes the `description` field critical — it must contain both trigger phrases AND exclusion criteria:

```
---
name: code-craft
description: "Code design discipline enforcing SOLID, KISS, modularity, separation of concerns, and human-readability. Load for any non-trivial code write, feature addition, refactor, or restructuring. Activate on \"refactor\", \"restructure\", \"design this module\", \"clean up this code\", \"make this maintainable\", or any implementation touching more than one file. Skip for typos, formatting, config value changes, or renaming without logic changes."
---
```

**Design rules for the description field:**

- Include BOTH trigger phrases and exclusion criteria — the harness needs both to avoid false matches
- Use `\"` to escape internal quotes within the YAML string
- Keep it concise; exact length limits vary by tool
- Do NOT duplicate this content in the skill body — it wastes context window space

#### Progressive Enhancement Strategy

Build the full structure (`rules/` + `skills/` with index and wiring) even if your current harness only supports a subset. When the harness can't load a file automatically, embed its content into the instructions file instead. When the team upgrades to a harness that supports more primitives, remove the embedded version from the instructions file — the separate files become the authoritative source.

**Migration path:**

1. Start with instructions-file-only (embedded rules, routing table, composition pathways)
2. When the harness supports loading separate rule files, extract embedded rules into `rules/*.md` and replace the instructions file content with a short reference (`Follow all rules in rules/*.md`)
3. When the harness supports a skill index, extract the routing table into `.agents/skills/INDEX.md`
4. When the harness supports composition wiring, extract pathways into `.agents/skills/WIRING.md`

### What Goes in AGENTS.md

The `AGENTS.md` file at the project root is the entry point for every AI session. It must answer these questions within the first 60 seconds of reading:

1. **What does this project do?** — First paragraph or a link to the requirements document
2. **Where is the source of truth?** — An explicit hierarchy resolving conflicts between documents and code
3. **How do I run things?** — Tooling rules (package managers, build commands)
4. **What are the hard rules?** — Project constraints that must never be violated
5. **How do I verify my work?** — Quality gate commands and their escalation rules
6. **Where is everything located?** — A source code organization map with file paths

### The Source-of-Truth Hierarchy

Every project needs an explicit priority order for resolving conflicts between documents and code. A typical hierarchy:

```
1. Product requirements document     ← WHAT to build (business decisions)
2. UX/design guidelines              ← HOW it should feel (interaction decisions)
3. Architecture document             ← HOW it should be built (system decisions)
4. Existing implementation           ← What already exists in code
5. Legacy docs, mockups, notes       ← Historical context only (lowest priority)
```

Write this hierarchy in AGENTS.md. Enforce it ruthlessly. If a decision contradicts a higher-tier document, it is always wrong — no exceptions.

---

## 3. Project Onboarding: First 30 Minutes

### What a New Team Member Needs Immediately

Every new team member — human or AI — needs these things in the first 30 minutes:

1. **Understanding of the product** — What does it do? Who uses it? Why?
2. **A working dev environment** — Can they build and run the project?
3. **The rules of engagement** — What must they never do? How do they verify work?
4. **A map of the codebase** — Where does each kind of code live?
5. **The quality bar** — What commands prove their work is correct?

### First Commands a Newcomer Runs

```
# 1. Verify required tools are installed
python --version     # Or whatever language runtime the project uses
node --version       # If applicable
docker --version     # If the project uses containers
git --version

# 2. Start the dev environment (commands will vary by project)
make dev-up          # Start infrastructure services (databases, message queues)
make dev             # Start the application

# 3. Verify everything works
curl http://127.0.0.1:{backend-port}/healthz    # Backend health check
curl http://127.0.0.1:{frontend-port}            # Frontend
curl http://127.0.0.1:{backend-port}/docs        # API documentation (if auto-generated)

# 4. Load test/seed data (if applicable)

# 5. Run the quality gates to see current project state
make fix       # Auto-fix formatting and safe corrections
make quality   # Full quality gate
```

### What AGENTS.md Must Contain

Your project's `AGENTS.md` should have these sections, adapted to your stack and domain:

| Section | Purpose | What to Include |
|---|---|---|
| **Source of Truth Order** | Resolve conflicts between docs and code | Ranked list of canonical documents |
| **Project Rules** | Hard constraints that must never be violated | Business logic location, data integrity rules, system-critical constraints |
| **Tooling Rules** | How to run things, what tools NOT to use | Package managers, build systems, environment isolation |
| **Database Rules** | Schema management protocol | Migration workflow, raw SQL vs ORM boundaries, seed data setup |
| **Agent Operating Rules** | How the AI agent should behave | Default skill, when to load/not load skills, verification protocol |
| **Code Quality Rules** | Minimum engineering bar | Naming conventions, nesting limits, function length, prohibited patterns |
| **Routing & Memory Rules** | Context management | When to save/restore short-term entries, when to consolidate, file locations |
| **Server Management Rules** | What the AI can/cannot do to infrastructure | Explicit prohibitions against starting/stopping servers |
| **Source Code Organization** | File/folder map | Where each type of code lives (routers, services, components, DTOs) |
| **Debugging Protocol** | Structured investigation approach | Steps to follow when diagnosing a bug |
| **Verification Commands** | Test/build/lint commands | Every `make` target the AI should run before declaring work done |

### The GLOSSARY.md

Every project with non-trivial domain logic needs a `GLOSSARY.md`. This prevents term drift — when one concept gets called by three different names across the codebase as different people (and AI sessions) work on it.

**Structure:**

```
| Term | Domain Definition | Backend Code Reference | Frontend Code Reference | Prohibited Aliases |
|---|---|---|---|---|
| PurchaseOrder | An internal procurement order sent to a supplier | PurchaseOrder (orm/models.py) | OrderCreateDialog.vue | "Order", "ReplenishmentOrder" |
| Supplier | A vendor supplying product stock | supplier_id (purchase_order table) | SupplierList.vue | "Vendor", "Client", "Provider" |
```

**Rules for the glossary:**

1. Every domain concept gets exactly one canonical name
2. If a concept has multiple names in the existing code, pick one and list the rest as "Prohibited Aliases"
3. Before any new feature is implemented, check if its domain terms exist in GLOSSARY.md. If not, define them first
4. If the project lacks a GLOSSARY.md, the AI should offer to generate one by scanning entity files, class declarations, and database schemas

**Bootstrap protocol for new projects:**
1. Scan main entity files, class declarations, and database schemas
2. Extract the top 10-15 recurrent nouns and domain concepts
3. Verify synonyms: check if identical logical concepts appear under different names
4. Draft the glossary table with canonical names, definitions, code locations, and prohibited aliases

---

## 4. Project Onboarding: First Week

### Document Map

A newcomer should understand the documentation landscape by end of week 1. Structure should follow a clear purpose:

```
docs/
├── {product-name}-requirements.md  ← Product north star (WHAT to build)
├── architecture.md                 ← System design (HOW it's built)
├── design/                         ← Interaction and visual standards
│   ├── DESIGN.md                   ← Visual design principles
│   └── UX-GUIDELINES.md            ← User experience standards
├── engineering/                    ← Engineering process and standards
│   ├── quality-gates.md            ← Quality thresholds and command matrix
│   ├── local-dev.md                ← Local environment setup instructions
│   └── ai-augmented-*.md           ← AI workflow documentation (this guide)
├── product/                        ← Product requirement documents
├── delivery/                       ← Delivery artifacts
│   ├── specs/                      ← Feature specifications (BDD-style)
│   ├── verification/               ← Audit reports and verification results
│   └── changelogs/                 ← Per-release delivery changelogs
├── research/                       ← Ad-hoc investigations and decision records
└── requirements/                   ← Raw notes, feedback, source material
```

Key principle: **keep raw notes and source material in `requirements/`.** Keep refined, canonical specs in `docs/`. Nothing in `docs/` should be a "draft" — if it's there, it's the team's agreed-upon truth.

### Understanding the Architecture

Every project needs a `docs/architecture.md` that answers these questions:

1. **Responsibility split** — Who owns what? (Frontend, Backend, Data Engineering, Infrastructure)
2. **Data ownership** — Which tables/collections belong to which team or service?
3. **Data flow** — How does data move between components? Draw a simple ASCII diagram.
4. **API contract strategy** — How are contracts defined and synchronized? (OpenAPI, gRPC, GraphQL schema)
5. **Integration modes** — When do you use ORM vs raw queries? When do you use REST vs events?
6. **Non-goals** — What is explicitly OUT of scope for this architecture document?

### Understanding the CI/CD Pipeline

Every team member should be able to answer:

- **When does each pipeline stage run?** (On MR? On push to main? On tag?)
- **What changes trigger which stages?** (Only backend changes trigger backend build? Only docs changes skip the full pipeline?)
- **How are deployments gated?** (Manual approval? Automated tests? Canary rollouts?)
- **What happens when a pipeline fails?** (Rollback? Diagnostic collection? Alerting?)

The CI/CD pipeline file (GitLab CI, GitHub Actions, Jenkins) should be readable enough that a newcomer can trace the flow from commit to deployment without asking anyone.

### Understanding the Quality Gates

Every project needs a `docs/engineering/quality-gates.md` that defines:

1. **Command matrix** — What commands run what checks, and when to run them
2. **Thresholds** — Complexity limits, max function length, max nesting depth
3. **Escalation rules** — Which failures are blockers vs warnings
4. **Rollout policy** — If warnings exist in legacy code, how are they being paid down?

A typical quality gate model uses two layers:

- **Inner-loop checks** (`make fix`, `make lint`) — Fast, run after every edit
- **Quality gates** (`make quality`) — Slower, structural + dependency validation, run before merge

### Understanding the Security Posture

A newcomer should be able to answer:

- **What scanners run?** — Secret scanning, SAST, dependency auditing, IaC scanning
- **How are secrets managed?** — Never in code, always in environment vars or a secret manager
- **What files are in .gitignore?** — .env files, credentials, editor state, build artifacts
- **What's the incident response process?** — Who to contact, where logs live, how to rollback

---

## 5. Working with AI Agents as Junior Team Members

### The Junior Engineer Mental Model

When you prompt an AI agent, think of it as delegating to a junior engineer who:

- **Is extremely fast and never gets tired** — but doesn't have judgment
- **Has read every line of your codebase** — but doesn't understand business context
- **Will follow explicit rules mechanically** — but will invent answers to ambiguous questions
- **Can produce 500 lines of code in seconds** — which means 500 lines of technical debt if unguided

This mental model guides everything about how you interact with the AI: how you scope tasks, how you review its output, and how you design the rules that govern it.

### How to Give Good Prompts

The quality of AI output correlates directly with the quality of the prompt. Like delegating to a junior:

```
BAD:  "Add user preferences to the dashboard"
      ↑ Ambiguous. The AI will guess. You will spend time fixing.

GOOD: "Add column visibility preferences to the data grid on the dashboard page.
      The preferences are saved per-user, per-workspace, persisted to the backend.
      Use the existing preferences API pattern (see the preferences module).
      Frontend should store preference state in a workspace-scoped composable,
      not in a global store or in localStorage.
      Acceptance criteria:
      - Columns can be toggled visible/hidden
      - Preference persists across page reloads
      - Preference respects workspace scope
      - Default state is 'all columns visible'"
      ↑ Scoped, references existing patterns, defines acceptance criteria, specifies data ownership.
```

A good prompt has these properties:
1. **Clear scope**: Exactly what to build and, equally important, what NOT to build
2. **Pattern reference**: Points to existing code that does something similar
3. **Data ownership**: Where the data lives, who owns it, how it's persisted
4. **Acceptance criteria**: Specific, verifiable outcomes that define "done"
5. **Architectural constraints**: Where things go, what patterns to follow, what patterns to avoid

### The Skill System: What It Is and How to Use It

Skills are the AI's training manuals — complete workflows for specific task types. They live in `.agents/skills/` as directories with a `SKILL.md` entry point and optional `references/` for deep-dive content.

**Skill loading is a binding contract.** When the AI loads a skill, it commits to executing the full workflow — every phase, every checkpoint, every deliverable. It cannot selectively skip steps. This is enforced by the Skill Compliance rule.

**Skill routing works like this:**
1. The AI checks `INDEX.md` to find which skill matches the current task
2. It loads that skill's `SKILL.md` and follows the workflow exactly
3. For complex tasks, it consults `WIRING.md` for the correct composition pathway

**When to use a skill vs when to skip:**

| Task Type | Load This | Why |
|---|---|---|
| Write or refactor code | `code-craft` | 5-phase design discipline with SOLID checks |
| Debug a bug | `systematic-investigation` | Structured root cause analysis protocol |
| Design a new feature | `requirements-driven-dev` | PRD → TRD → BDD traceability |
| Review code or specs | `reviewer` | Multi-lens review with bias-prevention gate |
| Build CI/CD pipeline | Project-specific CI/CD skill | Infrastructure templates and conventions |
| Write E2E tests | Project-specific testing skill | Page object models and data seeding patterns |
| Design UI | `ui-ux` | Design system compliance, accessibility |
| Brainstorm | `brainstorming` | Structured creative ideation |

**When to use NO skill:** Formatting fixes, renaming variables, config value changes, typo corrections. The skill system is for non-trivial work — don't load a 500-line workflow for a one-line edit.

### Skill Composition

For complex tasks, the AI combines multiple skills in sequence. The canonical pathways are defined in WIRING.md:

```
Debugging a bug:
1. codebase-exploration    → Navigate unfamiliar code boundaries
2. systematic-investigation → Root cause analysis and diagnosis
3. code-craft              → Disciplined fix implementation
4. reviewer                → Verify the fix addressed the root cause

Implementing a new feature:
1. requirements-driven-dev → Write the spec (if feature is large/ambiguous)
2. codebase-exploration    → Map the target frontend views and backend domains
3. code-craft              → Disciplined implementation
4. reviewer                → Post-implementation review
```

### The Grooming Interview (Reverse Interview)

Before the AI builds anything complex, it should ask YOU questions — not the other way around. This prevents the most common AI failure: building the wrong thing because it filled in ambiguous requirements with assumptions.

The AI is required to probe for:

- **Goal & Boundaries** — What is DEFINITELY out of scope? What does "done" look like?
- **Edge Cases & Failure Modes** — What happens when data is missing? When the network fails? When the user does something unexpected?
- **Dependencies** — What existing modules, APIs, or services does this connect to?
- **Interface Concept** — From the caller's/user's perspective, what do they see/do?

The AI should ask 3-5 high-value questions, prioritized by architectural impact. If the AI doesn't ask clarifying questions before a complex task, it's skipping the grooming step — stop the task and ask for questions.

**When to skip the interview:** Simple edits (typos, config values, renames), tasks where the specification is already exact and unambiguous, tasks that are purely mechanical.

### Memory: Context Continuity Across Sessions

When a coding session ends and the task will continue later, a **short-term memory entry** saves the current state so the next session can resume without re-explaining everything. When enough short-term entries accumulate — or when a git commit is about to close the day — a **dream cycle** consolidates the useful ones into **long-term memory** and proposes stale entries for eviction. Session checkpoints are just one kind of short-term entry.

**What a short-term entry contains (self-contained so the next session can act):**
- Current goal and status
- Key decisions made (and why) — mark `(finalised)` or `(fluid)`
- Files touched (with paths)
- Verification state (what tests passed, what's pending)
- Known blockers
- Next actions (prioritized)
- Open questions for the user

**When to write a short-term entry:**
- The user asks for a checkpoint
- A major milestone completes and continuation is likely
- Context length is getting large (the session will soon lose early context)
- The user signals end of session or device switch

**When to run a dream cycle (Consolidate mode):**
- The user explicitly asks ("consolidate memory", "dream cycle")
- A git commit is about to be made and short-term entries are unconsolidated
- Long-term size limits are approaching and eviction candidates need scoring

**Long-term is size-limited.** Growth happens only through consolidation, and eviction is always a scored proposal the human approves — never a silent delete. Corrections are append-only and user-owned.

**Memory location:** Inside a git repo, memory lives under `<project-root>/.agents/memory/` with `short-term/` and `long-term/` subdirectories plus an `archive/` for evicted long-term entries. Outside a repo, it falls back to `~/.agents/memory/`. Full layout, frontmatter templates, dream-cycle phases, scoring function, and eviction protocol live in the `memory` skill (`.agents/skills/memory/`).

**Progressive-disclosure meta-pattern.** The same short-term-leaf ↔ long-term-index shape applies to docs (`docs/README.md` + section indexes → `docs/**/detail-*.md`) and code (module `index.ts` / `__init__.py` / `mod.rs` → individual files). The `memory` skill's Structure mode applies it to any docs directory or source module on request.

---

## 6. Code Quality & Engineering Discipline

### The Engineering Contract

Every code change in an AI-augmented project must pass through a defined set of gates. The AI must not declare a task complete until all gates are passed:

```
1. Pre-Implementation Design Checkpoint (7 questions)
   ↓
2. TDD Cycle (test → implement → refactor) for logic components
   ↓
3. Code Quality Rules (naming, structure, documentation)
   ↓
4. Quality Tooling Gates (format → lint → type-check → audit)
   ↓
5. Readability & Robustness Audit
   ↓
6. Tech Debt Inventory
```

### Gate 1: Pre-Implementation Design Checkpoint

Before writing ANY function, class, or module, the AI must answer these 7 questions. If it cannot answer any one of them, it must STOP and redesign:

1. **Single responsibility** — What is the ONE thing this unit does? If the answer contains "and," it does too much — split it.
2. **Minimal interface** — What is the smallest surface callers need? Define only that.
3. **Dependency direction** — What does this unit depend on? Each dependency should point toward an abstraction, not a concrete implementation detail.
4. **Human traceability** — Can a reader follow the logic from names and structure alone, without reading implementation bodies?
5. **Deep Module encapsulation** — Does this module hide significant internal complexity behind a highly simplified interface? (Interface complexity should be far less than implementation complexity.)
6. **Interface-First specification** — Are type signatures, enums, and abstract contracts fully defined BEFORE writing any implementation logic?
7. **Ambiguity policy** — If an edge case or failure path has multiple reasonable behaviors, what contract chooses the correct one? If no contract defines this, STOP and ask the user instead of inventing a fallback.

### Gate 2: TDD for Logic Components

Test-Driven Development is mandatory for any component containing logic: parsers, validators, algorithms, data processors, state managers. The cycle is:

```
RED      → Write the test first. Run the test command. Confirm it FAILS.
GREEN    → Write the minimum code to make the test pass. Run tests. Confirm PASS.
REFACTOR → Clean up naming, nesting, structure. Re-run tests. Confirm still PASS.
```

The AI must output the test command and its results as proof of compliance. Skippable only for CSS changes, config edits, markdown documentation, and typo fixes — changes with no logic.

### Gate 3: Code Quality Rules

These are non-negotiable across every file:

| Rule | Threshold | Rationale |
|---|---|---|
| Nesting depth | Max 3 levels | Beyond 3, extract the inner block to a named function |
| Function length | Max 50 lines of logic | Beyond 50, split or document why splitting is deferred |
| Guard clauses | Required at top | Happy path must not be nested inside an `else` block |
| Single-letter names | Forbidden (except loop counters i, j, k) | Names must communicate intent |
| Magic literals | Forbidden | Every inline number or string must be a named constant |
| Silent error swallowing | Forbidden | `catch(e) {}` with no handling — always propagate or log |
| Business logic in UI/views | Forbidden | Extract to services/controllers behind the view layer |
| Deep Modules | Required | Interface complexity must be far less than implementation complexity |

### Gate 4: Quality Tooling

Run these commands before finalizing any non-trivial change. Exact commands will vary by project stack; these are typical patterns:

```
# Fast inner loop (while editing — run frequently)
make fix          # Auto-fix formatting and safe corrections
make lint         # Fast format + lint + type check

# Quality gates (before merge — run once)
make quality      # Full structural checks + dependency audit

# Additional checks by area
make test         # Unit tests
make build        # Build safety check
make api-check    # API contract drift check
```

**Escalation rules:**
- **Dependency audit failures** = BLOCKER. Vulnerable dependencies must be fixed before merge.
- **Structural failures** = BLOCKER for code you changed. Pay down existing debt in touched files opportunistically.
- **New warnings in unchanged files** = Flag but do not block. These are pre-existing debt.

### Gate 5: Readability Audit

After writing, the AI must read its own code as if it's a new engineer with zero context. Answer these questions:

1. Is the entry point obvious? (Where does execution start?)
2. Can I follow control flow from function names alone? (Without reading implementations)
3. Are state mutations obvious at the call site? (Not hidden in side effects)
4. Is the error path as readable as the happy path? (Not buried in a catch-all)
5. What happens when external dependencies fail? (Database drops, API times out, disk fills up)

For any "no" or weak answer, refactor or add a `// CLARITY:` annotation explaining what the code does and why.

### Gate 6: Tech Debt Inventory

The AI must explicitly state what debt it's accepting with each change:

```
TECH DEBT INVENTORY
===================
[none]

— OR —

- TODO(debt): src/services/pricing.py:142 — hardcoded margin of 15%
  — deferred until ERP integration exposes margin field
  — cleanup trigger: when upstream ERP API exposes margin field
```

**Acceptable debt:** Incomplete abstraction, deferred optimization, provisional business rules, known rough edges.

**NOT acceptable as debt:** Silent error swallowing, god objects, security shortcuts, logic copied more than twice without extraction.

### Marking Problems for Future Work

When the AI spots a code smell but cannot fix it in the current task scope, it must mark it:

```
// REFACTOR-SIGNAL: god-object — PaymentController owns 4 unrelated domain operations
```

This creates a searchable inventory of known issues. Anyone can grep for `REFACTOR-SIGNAL` and find work to pick up.

Common signal patterns:

| Pattern | Meaning |
|---|---|
| `feature-envy` | Function uses more data from another module than its own |
| `god-object` | Class or module owns more than one domain concept |
| `shotgun-surgery` | A single logical change requires edits in 4+ separate files |
| `primitive-obsession` | Raw primitive used where a domain type should exist |
| `long-param-list` | Function takes 4+ parameters — should use a config object |
| `implicit-coupling` | Two modules share undocumented state or rely on call ordering |

### Module Documentation

Every distinct module or component directory must contain a `README.md` documenting:

- **Purpose**: Clear high-level summary of the module's role
- **Architecture**: Key design patterns and design decisions
- **Public Interface**: API contracts, parameters, return types, exceptions
- **Dependencies**: External systems, libraries, or other internal modules it couples to
- **Resilience & Errors**: Error handling strategy, escalation rules, fallback contracts

If a new module is created, its README.md must be created immediately. If an existing module's public interface changes, its README.md must be updated.

### Docstring Requirements

All public APIs, classes, exported interfaces, and functions must have a docstring that includes:
- A one-line summary of what it does
- Parameter names, types, and descriptions
- Return value description
- Errors, exceptions, or failure modes it can produce

Format follows the language ecosystem standard: JSDoc for TypeScript/JavaScript, PEP 257 for Python, Go doc comments for Go.

---

## 7. Automation, CI/CD & Deployment

### Makefile as the Single Entry Point

All automation commands should go through a single entry point — typically a `Makefile` at the project root. This means:

- A new team member runs `make help` and sees every available command
- CI/CD pipelines call the same targets, not bespoke scripts
- The AI agent has a deterministic set of commands to reference

**Essential Makefile targets:**

```
make fix              # Format everything (safe auto-fixes)
make lint             # Fast lint + format check
make quality          # Full quality gate (structural + dependencies)
make test             # All tests
make dev              # Start dev server(s)
make dev-up           # Start infrastructure (databases, message queues)
make build            # Production build
make api-sync         # Regenerate API contracts
make api-check        # Verify API contracts haven't drifted
```

**Pattern to follow:** Each target is a thin wrapper. The real logic lives in the application's build system (package.json scripts, pyproject.toml scripts). The Makefile is the consistent interface, not the implementation.

### CI/CD Pipeline Principles

Your CI/CD pipeline should implement these patterns:

1. **Change detection** — Only build/test/deploy what changed. Frontend changes shouldn't trigger backend builds. Documentation changes shouldn't trigger any build.
2. **Diagnostic collection on failure** — When a deploy fails, automatically collect pod status, recent events, and logs. Attach them as pipeline artifacts. Debugging a failed deploy without diagnostics is guessing.
3. **Artifact retention** — Keep build artifacts with explicit expiry. A 7-day retention is typical for development; production artifacts may need longer.
4. **Environment separation** — Pre-merge (build-only validation), development (full deploy with debug mode), production (full deploy, triggered by git tag).

**Example pipeline stages:**

```
test → build → deploy → release

Triggers:
  Merge request → pre-merge (test + build only)
  Push to main branch → dev (test + build + deploy to dev)
  Git tag vX.Y.Z → prod (test + build + deploy to prod + release)
```

### Deployment Patterns

For Kubernetes-based projects, use a declarative deployment tool (Helm, Kustomize, Garden.io, Pulumi) that produces auditable configuration:

```
helm/
├── Chart.yaml              # Root chart with subchart dependencies
├── values.yaml             # Shared values across environments
├── charts/
│   └── <app-name>/         # Main application subchart
├── templates/              # Infrastructure templates
│   ├── ingress.yaml        # Route configuration
│   ├── middleware.yaml      # Auth, rate limiting, CORS
│   ├── secret.yaml          # Kubernetes secret definitions
│   └── ...                  # Other infrastructure templates
└── .gitignore
```

Key separation:
- **Infrastructure templates** (ingress, middleware, secrets) belong in the shared chart
- **Application deployment** (backend, frontend) belongs in the subchart
- **Environment-specific values** are injected via CI/CD, not hardcoded in templates

### Scripts as Thin Utilities

Scripts in a `scripts/` directory should be thin utilities — they connect systems, not contain business logic. Examples:
- `sync_openapi_contract.py` — Regenerate frontend types from the backend's OpenAPI schema
- `check_frontend_business_logic.py` — Static analysis guard against business logic in UI code
- `seed_test_data.py` — Populate local database with test fixtures

If a script grows beyond ~100 lines of orchestration logic, the logic should move into the application codebase and the script should become a thin caller.

---

## 8. Security, Audit & Compliance

### Secret Management

Absolute rules:
- **Never commit secrets.** `.env`, `*.pem`, `*.key`, `auth.json`, `credentials.json` must be in `.gitignore`.
- **Use a secret manager for deployed environments.** Kubernetes secrets, HashiCorp Vault, AWS Secrets Manager, or your cloud provider's secret service.
- **Run automated secret scanning on every commit.** Tools like trufflehog, git-secrets, or gitleaks integrated into CI.
- **Provide `.env.example`** with every variable listed but no values. This tells newcomers what's needed without exposing secrets.

### Dependency Auditing

Both backend and frontend should run automated vulnerability scans:
- **Python:** pip-audit, safety
- **JavaScript/TypeScript:** npm audit, bun audit, yarn audit
- **Go:** govulncheck
- **CI gates:** Dependency audit failures with known exploits should be merge blockers

For vulnerabilities that don't apply to your usage pattern (e.g., a server-side vulnerability in a library you only use at build time), document the override explicitly in your configuration file.

### Infrastructure-as-Code Security

If you use Helm, Docker, Terraform, or any IaC tool:
- Run an IaC scanner (Checkov, tfsec, Trivy) against all templates
- Never hardcode credentials in IaC templates — reference secrets, don't embed them
- Declare resource limits (CPU, memory) on every container to prevent resource exhaustion

### Code-Level Security

- Run a SAST scanner (Bandit for Python, ESLint security rules for JS/TS, Semgrep for multi-language)
- For database queries on externally-managed tables/schemas, use parameterized raw SQL — not ORM — because ORM assumes you control the schema, which may not be true for data pipeline-managed tables
- Avoid database-level enums — keep enum validation in the application layer. This preserves database flexibility and prevents migration churn for enum additions.

### Audit Trail Requirements

For any system handling financial data, customer data, or business-critical operations:

1. **Single write path.** All business data changes go through one authoritative path (typically the backend API). Multiple write paths create audit gaps.
2. **Server-authoritative state.** The frontend displays what the backend says is true. Never allow the UI to show uncommitted or speculative business data.
3. **Logged operations.** Every background job, sync operation, or data pipeline run should produce an audit log entry with: timestamp, status (success/failed/in-progress), diagnostics on failure, and the user or system that triggered it.
4. **Write-through persistence.** Business data changes must persist to durable storage before the UI refreshes. Optimistic mutation (updating the UI, then saving) is forbidden for critical data.

### Compliance Framework

Document these for your organization's compliance needs:

| Concern | What to Document |
|---|---|
| Data residency | Where does data live? Which geographic regions? |
| Access control | Who can deploy? Who can access production data? How is access revoked? |
| Change management | What requires approval? How are emergency changes handled? |
| Business continuity | Backup strategy, recovery time objective, disaster recovery plan |
| Vendor risk | Which third-party services does the application depend on? What happens if they're unavailable? |
| AI provider risk | If using AI coding tools, what code leaves your environment? What model providers are used? Is there lock-in risk? |

---

## 9. Management Visibility & Governance

### What Management Needs to See

The engineering process should be visible to non-technical leadership without requiring deep technical dives. Expose these dimensions:

### Quality Metrics Dashboard

Track quantifiable metrics that management can understand:

| Metric | What It Measures | Target |
|---|---|---|
| Complexity score | How hard is the code to maintain? | Below defined threshold |
| Function length | Are functions getting too large? | Max 50 statements |
| Dependency vulnerabilities | Are we shipping known-vulnerable packages? | Zero critical/high |
| Test coverage | Are we testing what we build? | Target 80%+ (adjust per project) |
| Build time | How long from commit to deployable artifact? | Under target threshold |

### Delivery Velocity

Track per sprint or month:

- Number of changes merged
- Average time from change submission to merge
- Number of quality gate failures caught pre-merge (leading indicator — catching issues early)
- Number of production incidents (lagging indicator — issues that slipped through)

### AI Usage Transparency

If management asks "what is the AI actually doing?" — have data:

| Metric | How to Track |
|---|---|
| Tasks completed with AI assistance | Count of short-term memory entries in `.agents/memory/short-term/` |
| AI-generated vs human-written code | Git author analysis |
| Quality of AI output | Review findings per AI-assisted change |
| AI cost | Token usage across providers, cost per task or sprint |
| Velocity impact | Compare sprint velocity before and after AI adoption |

### Process Documentation for Auditors

The `.agents/` directory IS your engineering process documentation. Point auditors to:

1. **`.agents/rules/`** — What rules govern code quality, testing, and AI behavior
2. **`docs/engineering/quality-gates.md`** — How quality is measured and enforced
3. **`AGENTS.md`** — How AI agents are constrained and governed
4. **`GLOSSARY.md`** — How domain terminology is controlled across the codebase
5. **`docs/delivery/verification/`** — Audit trails of verification runs

### Cost Tracking

Track these costs and report them to management:

- **AI provider costs:** Token usage per task, per sprint, per month
- **Infrastructure costs:** Cloud resources, databases, networking
- **Developer tooling costs:** CI/CD, code quality tools, security scanners

Management doesn't need per-token granularity. They need: "AI-assisted development costs approximately X per sprint and has reduced feature delivery time by Y%."

---

## 10. Evolving the Project Over Time

### Phase-Based Maturity Model

Projects mature through predictable phases. Here's what to aim for at each stage:

### Phase 1: Foundation (Ship with this)

- AGENTS.md with source-of-truth hierarchy
- GLOSSARY.md with domain terminology
- Quality gates with defined thresholds
- CI/CD pipeline with environment separation
- Full skill catalog for common task types
- Architecture document with responsibility split and data ownership
- Makefile with standard command set
- Security scanning (secret scanning + dependency audit + SAST)

### Phase 2: Intelligence (Add as the project grows)

- Test coverage reporting integrated into CI
- Quality warnings graduated to hard-fail
- Complexity hotspots in legacy code resolved
- Dependency audit alerts automated (Dependabot, Renovate, or similar)
- AI usage dashboard (cost, tasks assisted, velocity)
- Performance budgets (page load, API response time)

### Phase 3: Optimization (Long-term vision)

- Predictive quality: automated suggestions for structural improvements
- Cross-project knowledge sharing: patterns that transfer between projects
- Skill effectiveness metrics: which skills produce the fewest review findings
- Self-healing pipelines: CI/CD that detects and rolls back on quality regression

### Adding New Skills to the Project

**When to add a project-specific skill:**
1. A pattern repeats across 3+ tasks in this project
2. The pattern has project-specific context (templates, URLs, data shapes)
3. The skill would reduce prompt engineering overhead

**When NOT to add a project-specific skill:**
1. The general version already covers it
2. The task is one-off
3. The skill would duplicate existing documentation

**Examples of project-specific skills that justify their existence:**
- A CI/CD template skill containing actual Helm charts, pipeline configs, and infrastructure conventions
- An E2E testing skill containing page object models, data seeding patterns, and selectors for your specific UI

### Evolving Quality Gates

Quality gates get stricter over time. The progression:

1. **Start permissive.** Warnings are visible but not blocking. This lets the team see the baseline.
2. **Pay down debt opportunistically.** Every time touched code is edited, leave it better. "No new warnings in touched code" means debt decreases naturally.
3. **Graduate to hard blocks.** When the warning backlog is low enough, switch from advisory to blocking.
4. **Enforce in CI.** Once the team has adjusted, wire the quality gate as a required CI check.

**Never weaken thresholds.** If a threshold is flagging healthy code, the threshold is wrong — fix the threshold, not the code.

### Adding New Team Members

Onboarding timeline for new engineers in an AI-augmented project:

1. **Day 1:** Read AGENTS.md and GLOSSARY.md. Walk through the setup commands. Verify the dev environment works.
2. **Week 1:** Make a first change following the quality gates. An existing team member reviews using the `reviewer` skill.
3. **Week 2:** Own a vertical slice end-to-end using the full skill workflow (requirements → exploration → code-craft → reviewer).
4. **Month 1:** Contribute to `.agents/` — either adding a project-specific skill or improving an existing rule based on their experience.

### When AI Output Quality Declines

If the AI starts producing lower-quality output, check these in order:

1. **Is AGENTS.md clear enough?** The AI can only follow rules it can read. Ambiguous rules produce ambiguous output. Rewrite rules that leave room for interpretation.
2. **Was the right skill loaded?** Check INDEX.md. Using the wrong skill for a task is inefficient; using no skill for a complex task is dangerous.
3. **Was the task scoped properly?** "Add feature X" is too broad. "Add feature X following pattern Y with acceptance criteria Z, storing data in module M" is actionable.
4. **Were quality gates run?** If the AI didn't run the quality commands, it didn't verify its work. Require verification output.
5. **Is there a memory gap?** If the AI lost context mid-task, write short-term memory entries more frequently and run the dream cycle before commits so long-term memory stays current.

---

## 11. Checklist: Adapting This Guide to Your Project

Use this checklist when bootstrapping a new project or auditing an existing one for AI readiness:

### Foundation (Must Have — ship with this)

- [ ] `AGENTS.md` at repo root with source-of-truth hierarchy, project rules, tooling rules
- [ ] `GLOSSARY.md` with domain terms, code references, and prohibited aliases
- [ ] `.agents/rules/` with code quality baseline, TDD enforcement, grooming protocol, glossary sync, vertical slicing, skill compliance
- [ ] `.agents/skills/INDEX.md` routing table (which skill fits which task)
- [ ] `.agents/skills/WIRING.md` composition pathways (how skills chain together)
- [ ] `docs/architecture.md` with responsibility split and data ownership model
- [ ] `docs/engineering/quality-gates.md` with command matrix and thresholds
- [ ] `Makefile` with fix, lint, quality, test targets
- [ ] CI/CD pipeline with environment separation (pre-merge, dev, prod)
- [ ] Security scanning (secret scanning + dependency audit + SAST at minimum)
- [ ] `.gitignore` covering `.env`, secrets, editor state, caches, build artifacts

### Quality (Should Have — add within first month)

- [ ] Code quality rules enforced via linter configuration (not just documented)
- [ ] Complexity thresholds defined and measured (cyclomatic complexity, max nesting, max statements)
- [ ] TDD enforced for all logic components (parsers, validators, state machines)
- [ ] Pre-implementation design checkpoint required for any new class, function, or module
- [ ] Tech debt marking convention established (`TODO(debt):` format)
- [ ] Refactoring signal convention established (`REFACTOR-SIGNAL:` format)
- [ ] Module README.md requirement enforced (every module directory needs one)

### AI Integration (Should Have — add as team adopts AI tools)

- [ ] Skill loading rules defined (default to `code-craft` for code, skip for formatting)
- [ ] Grooming interview protocol active (3-5 clarifying questions before complex tasks)
- [ ] Memory protocol defined (repo-local short-term + long-term with dream-cycle consolidation)
- [ ] Server management rules (AI agent must not start/stop servers or manipulate processes)
- [ ] Debugging protocol documented (reproduce → inspect → compare → trace → test → fix → verify)

### Management (Add when management asks for visibility)

- [ ] Quality metrics dashboard or report (complexity trends, vulnerability counts, coverage)
- [ ] AI usage tracking (cost per sprint, tasks assisted, velocity impact)
- [ ] Delivery changelogs (per-release summaries in `docs/delivery/changelogs/`)
- [ ] Verification audit trails (test run results, quality gate output in `docs/delivery/verification/`)
- [ ] Cost tracking for AI providers, infrastructure, and tooling

### Evolution (Plan for the next quarter)

- [ ] Phase 2 maturity items defined and prioritized
- [ ] Skill effectiveness review cadence set (quarterly)
- [ ] Quality gate tightening schedule (when do warnings become errors?)
- [ ] New team member onboarding timeline documented and tested
- [ ] Monthly failure pattern review established (what AI mistakes recurred, what rules would prevent them)

---

## Appendix: File Reference Map

| File | What It Contains | Who Maintains It |
|---|---|---|
| `AGENTS.md` | Agent instructions, project rules, tooling commands, debugging protocol | Engineering lead |
| `GLOSSARY.md` | Domain terminology, code references, prohibited aliases | Engineering lead + domain experts |
| `.agents/rules/code-quality.md` | Design checkpoint, naming conventions, structure limits, prohibited patterns | Engineering lead |
| `.agents/rules/tdd.md` | Red-Green-Refactor protocol, test-first requirements | Engineering lead |
| `.agents/rules/grooming.md` | Reverse interview protocol, AFK mode self-audit | Engineering lead |
| `.agents/rules/ubiquitous-language.md` | Glossary sync protocol, bootstrap procedure | Engineering lead |
| `.agents/rules/slicing.md` | Vertical slicing protocol for feature decomposition | Engineering lead |
| `.agents/rules/skill-compliance.md` | Binding workflow enforcement, hard-stop gates | Engineering lead |
| `.agents/rules/self-grounded-verification.md` | Two-step anti-agreement-bias verification protocol | Engineering lead |
| `.agents/rules/memory.md` | Memory triggers: capture, recall, dream-cycle, eviction | Engineering lead |
| `.agents/skills/INDEX.md` | Skill routing table with cost and applicability columns | Engineering lead |
| `.agents/skills/WIRING.md` | Skill composition pathways and skill-to-skill transitions | Engineering lead |
| `.agents/skills/memory/` | Two-tier memory skill: short-term entries, long-term consolidation, dream cycle, eviction protocol, progressive-disclosure structuring | Engineering lead |
| `docs/architecture.md` | System design, responsibility split, data ownership model | Engineering lead |
| `docs/engineering/quality-gates.md` | Quality thresholds, command matrix, escalation rules | Engineering lead |
| `docs/engineering/ai-agent-skills-and-rules-engineering.md` | How to design skills and rules, failure pattern catalog | Engineering lead |
| CI/CD pipeline file | Pipeline triggers, stages, environment separation | DevOps |
| `Makefile` | Standard command entry point for all automation | Engineering lead |
| `.editorconfig` | Cross-editor formatting rules (line endings, indentation) | Engineering lead |
| `.gitattributes` | Git line ending normalization per file type | Engineering lead |
| `.gitignore` | Files excluded from version control | Engineering lead |
