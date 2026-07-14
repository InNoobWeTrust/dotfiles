# AI-Augmented Development Documentation

> **Who this is for:** Engineering leads, new team members (human or AI), and management — anyone setting up or working within an AI-augmented development workflow.

This directory contains the canonical guides for engineering AI agent skills, rules, and the full lifecycle of AI-augmented project development. Use the sections below to jump directly to the topic you need.

---

## Document Index

| # | Document | What It Covers | When to Read |
|---|---|---|---|
| 1 | [`ai-agent-skills-and-rules-engineering.md`](./ai-agent-skills-and-rules-engineering.md) | Designing `.agents/rules/` and `.agents/skills/` — rule catalog, failure patterns, skill anatomy, lifecycle, composition | **Read this when:** you need to create or evolve a rule or skill |
| 2 | [`ai-augmented-project-setup-and-evolution.md`](./ai-augmented-project-setup-and-evolution.md) | Complete project lifecycle — onboarding, daily AI workflows, quality gates, CI/CD, security, management visibility, phased evolution | **Read this when:** you're setting up a new project for AI-augmented development, or onboarding to an existing one |
| 3 | [`slides/ai-agents-intro-en.md`](./slides/ai-agents-intro-en.md) | Marp slide deck (English) — 30 slides introducing key concepts for newcomers to AI-assisted coding | **Read this when:** presenting or self-studying the fundamentals |
| 4 | [`slides/ai-agents-intro-vi.md`](./slides/ai-agents-intro-vi.md) | Marp slide deck (Vietnamese) — same content as EN, translated for Vietnamese-speaking audiences | **Read this when:** presenting to a Vietnamese-speaking team |

---

## Quick Navigation: By Topic

### Rules & Skills Engineering

| Topic | Document & Section |
|---|---|
| Why rules and skills exist (mental model) | [1 → §1](./ai-agent-skills-and-rules-engineering.md#1-why-rules-and-skills-exist) |
| The 6 essential rules every project needs | [1 → §2](./ai-agent-skills-and-rules-engineering.md#2-essential-rules-for-every-project) |
| Code quality baseline rule | [1 → §2 Rule 1](./ai-agent-skills-and-rules-engineering.md#rule-1-code-quality-baseline) |
| TDD enforcement rule | [1 → §2 Rule 2](./ai-agent-skills-and-rules-engineering.md#rule-2-test-driven-development-enforcement) |
| Grooming / reverse interview rule | [1 → §2 Rule 3](./ai-agent-skills-and-rules-engineering.md#rule-3-grooming-reverse-interview) |
| Ubiquitous language / glossary rule | [1 → §2 Rule 4](./ai-agent-skills-and-rules-engineering.md#rule-4-ubiquitous-language-domain-glossary) |
| Vertical slicing rule | [1 → §2 Rule 5](./ai-agent-skills-and-rules-engineering.md#rule-5-vertical-slicing) |
| Skill compliance rule | [1 → §2 Rule 6](./ai-agent-skills-and-rules-engineering.md#rule-6-skill-compliance) |
| Self-grounded verification rule (anti agreement-bias) | [1 → §2 Rule 7](./ai-agent-skills-and-rules-engineering.md#rule-7-self-grounded-verification) |
| Autonomy safety rule (consequence-first agency) | [1 → §2 Rule 8](./ai-agent-skills-and-rules-engineering.md#rule-8-autonomy-safety-consequence-first-agency) |
| Nice-to-have rules (memory, discovery, routing) | [1 → §3](./ai-agent-skills-and-rules-engineering.md#3-nice-to-have-rules) |
| How to evolve rules from failure patterns | [1 → §4](./ai-agent-skills-and-rules-engineering.md#4-the-failure-pattern--rule-evolution-loop) |
| Full catalog of AI failure patterns (A–E) | [1 → §5](./ai-agent-skills-and-rules-engineering.md#5-catalog-of-ai-failure-patterns) |
| Code quality failures (error swallowing, magic literals, etc.) | [1 → §5 Category A](./ai-agent-skills-and-rules-engineering.md#category-a-code-quality-failures) |
| Process failures (untested code, spec misalignment, etc.) | [1 → §5 Category B](./ai-agent-skills-and-rules-engineering.md#category-b-process-failures) |
| Naming & context failures (term drift, fabricated APIs) | [1 → §5 Category C](./ai-agent-skills-and-rules-engineering.md#category-c-naming--context-failures) |
| Business & security failures (invented rules, secret exposure) | [1 → §5 Category D](./ai-agent-skills-and-rules-engineering.md#category-d-business--security-failures) |
| Architectural failures (god objects, implicit coupling) | [1 → §5 Category E](./ai-agent-skills-and-rules-engineering.md#category-e-architectural-failures) |
| Designing a skill from scratch (anatomy, YAML, phases) | [1 → §6](./ai-agent-skills-and-rules-engineering.md#6-designing-a-skill-from-scratch) |
| Skill lifecycle: prototype → hardening → adoption | [1 → §7](./ai-agent-skills-and-rules-engineering.md#7-skill-lifecycle-from-prototype-to-team-standard) |
| Skill composition with WIRING.md | [1 → §8](./ai-agent-skills-and-rules-engineering.md#8-skill-composition-wiringmd) |
| Maintaining rules and skills (quarterly audit, failure review) | [1 → §9](./ai-agent-skills-and-rules-engineering.md#9-maintaining-rules-and-skills-over-time) |
| Rule template (copy-paste) | [1 → Appendix: Rule Template](./ai-agent-skills-and-rules-engineering.md#appendix-rule-template) |
| Skill template (copy-paste) | [1 → Appendix: Skill Template](./ai-agent-skills-and-rules-engineering.md#appendix-skill-template) |

### Project Setup, Onboarding & Operations

| Topic | Document & Section |
|---|---|
| Guiding philosophy (AI as junior team member) | [2 → §1](./ai-augmented-project-setup-and-evolution.md#1-guiding-philosophy) |
| Architecture of `.agents/` directory | [2 → §2](./ai-augmented-project-setup-and-evolution.md#2-architecture-of-ai-agent-governance) |
| Adapting to harness limitations (minimal vs full-featured) | [2 → §2: Adapting to Harness Limitations](./ai-augmented-project-setup-and-evolution.md#adapting-to-harness-limitations) |
| What goes in AGENTS.md | [2 → §2: What Goes in AGENTS.md](./ai-augmented-project-setup-and-evolution.md#what-goes-in-agentsmd) |
| Source-of-truth hierarchy | [2 → §2: Source-of-Truth Hierarchy](./ai-augmented-project-setup-and-evolution.md#the-source-of-truth-hierarchy) |
| Project onboarding: first 30 minutes | [2 → §3](./ai-augmented-project-setup-and-evolution.md#3-project-onboarding-first-30-minutes) |
| GLOSSARY.md creation and bootstrap | [2 → §3: The GLOSSARY.md](./ai-augmented-project-setup-and-evolution.md#the-glossarymd) |
| Project onboarding: first week | [2 → §4](./ai-augmented-project-setup-and-evolution.md#4-project-onboarding-first-week) |
| Document map / directory structure | [2 → §4: Document Map](./ai-augmented-project-setup-and-evolution.md#document-map) |
| Understanding architecture docs | [2 → §4: Understanding the Architecture](./ai-augmented-project-setup-and-evolution.md#understanding-the-architecture) |
| Understanding CI/CD pipeline | [2 → §4: Understanding the CI/CD Pipeline](./ai-augmented-project-setup-and-evolution.md#understanding-the-cicd-pipeline) |
| Understanding quality gates | [2 → §4: Understanding the Quality Gates](./ai-augmented-project-setup-and-evolution.md#understanding-the-quality-gates) |
| Understanding security posture | [2 → §4: Understanding the Security Posture](./ai-augmented-project-setup-and-evolution.md#understanding-the-security-posture) |
| Working with AI agents (prompting, skills, grooming) | [2 → §5](./ai-augmented-project-setup-and-evolution.md#5-working-with-ai-agents-as-junior-team-members) |
| How to give good prompts | [2 → §5: How to Give Good Prompts](./ai-augmented-project-setup-and-evolution.md#how-to-give-good-prompts) |
| The skill system explained | [2 → §5: The Skill System](./ai-augmented-project-setup-and-evolution.md#the-skill-system-what-it-is-and-how-to-use-it) |
| The grooming interview | [2 → §5: The Grooming Interview](./ai-augmented-project-setup-and-evolution.md#the-grooming-interview-reverse-interview) |
| Memory: short-term notes + long-term consolidation across sessions | [2 → §5: Memory](./ai-augmented-project-setup-and-evolution.md#memory-context-continuity-across-sessions) |
| The 6 code quality gates | [2 → §6](./ai-augmented-project-setup-and-evolution.md#6-code-quality--engineering-discipline) |
| Pre-implementation design checkpoint (7 questions) | [2 → §6: Gate 1](./ai-augmented-project-setup-and-evolution.md#gate-1-pre-implementation-design-checkpoint) |
| TDD for logic components | [2 → §6: Gate 2](./ai-augmented-project-setup-and-evolution.md#gate-2-tdd-for-logic-components) |
| Code quality rules (nesting, length, guard clauses) | [2 → §6: Gate 3](./ai-augmented-project-setup-and-evolution.md#gate-3-code-quality-rules) |
| Quality tooling (make fix, make quality) | [2 → §6: Gate 4](./ai-augmented-project-setup-and-evolution.md#gate-4-quality-tooling) |
| Readability audit | [2 → §6: Gate 5](./ai-augmented-project-setup-and-evolution.md#gate-5-readability-audit) |
| Tech debt inventory | [2 → §6: Gate 6](./ai-augmented-project-setup-and-evolution.md#gate-6-tech-debt-inventory) |
| REFACTOR-SIGNAL markers | [2 → §6: Marking Problems](./ai-augmented-project-setup-and-evolution.md#marking-problems-for-future-work) |
| Module README requirements | [2 → §6: Module Documentation](./ai-augmented-project-setup-and-evolution.md#module-documentation) |
| Docstring requirements | [2 → §6: Docstring Requirements](./ai-augmented-project-setup-and-evolution.md#docstring-requirements) |
| Automation, CI/CD & deployment patterns | [2 → §7](./ai-augmented-project-setup-and-evolution.md#7-automation-cicd--deployment) |
| Makefile as single entry point | [2 → §7: Makefile](./ai-augmented-project-setup-and-evolution.md#makefile-as-the-single-entry-point) |
| CI/CD pipeline principles | [2 → §7: CI/CD Pipeline](./ai-augmented-project-setup-and-evolution.md#cicd-pipeline-principles) |
| Deployment patterns (Helm, Kubernetes) | [2 → §7: Deployment Patterns](./ai-augmented-project-setup-and-evolution.md#deployment-patterns) |
| Security, audit & compliance | [2 → §8](./ai-augmented-project-setup-and-evolution.md#8-security-audit--compliance) |
| Secret management rules | [2 → §8: Secret Management](./ai-augmented-project-setup-and-evolution.md#secret-management) |
| Dependency auditing | [2 → §8: Dependency Auditing](./ai-augmented-project-setup-and-evolution.md#dependency-auditing) |
| Audit trail requirements | [2 → §8: Audit Trail](./ai-augmented-project-setup-and-evolution.md#audit-trail-requirements) |
| Management visibility & governance | [2 → §9](./ai-augmented-project-setup-and-evolution.md#9-management-visibility--governance) |
| Quality metrics dashboard | [2 → §9: Quality Metrics](./ai-augmented-project-setup-and-evolution.md#quality-metrics-dashboard) |
| Delivery velocity tracking | [2 → §9: Delivery Velocity](./ai-augmented-project-setup-and-evolution.md#delivery-velocity) |
| AI usage transparency & cost tracking | [2 → §9: AI Usage & Cost](./ai-augmented-project-setup-and-evolution.md#ai-usage-transparency) |
| Project evolution: phase-based maturity | [2 → §10](./ai-augmented-project-setup-and-evolution.md#10-evolving-the-project-over-time) |
| Phase 1: Foundation | [2 → §10: Phase 1](./ai-augmented-project-setup-and-evolution.md#phase-1-foundation-ship-with-this) |
| Phase 2: Intelligence | [2 → §10: Phase 2](./ai-augmented-project-setup-and-evolution.md#phase-2-intelligence-add-as-the-project-grows) |
| Phase 3: Optimization | [2 → §10: Phase 3](./ai-augmented-project-setup-and-evolution.md#phase-3-optimization-long-term-vision) |
| Evolving quality gates over time | [2 → §10: Evolving Quality Gates](./ai-augmented-project-setup-and-evolution.md#evolving-quality-gates) |
| Adapting this guide to your project (checklist) | [2 → §11](./ai-augmented-project-setup-and-evolution.md#11-checklist-adapting-this-guide-to-your-project) |

---

## Recommended Reading Order

### If you're setting up AI-augmented development for the first time

1. Start with **[2 → §1: Guiding Philosophy](./ai-augmented-project-setup-and-evolution.md#1-guiding-philosophy)** — understand the mental model
2. Read **[2 → §2: Architecture of AI-Agent Governance](./ai-augmented-project-setup-and-evolution.md#2-architecture-of-ai-agent-governance)** — see what files to create
3. Set up your project using **[2 → §11: Checklist](./ai-augmented-project-setup-and-evolution.md#11-checklist-adapting-this-guide-to-your-project)** — follow the step-by-step
4. Then read **[1 → §2: Essential Rules](./ai-agent-skills-and-rules-engineering.md#2-essential-rules-for-every-project)** — implement the 6 baseline rules
5. Finally, read **[1 → §6: Designing a Skill](./ai-agent-skills-and-rules-engineering.md#6-designing-a-skill-from-scratch)** — create your first project-specific skill

### If you're joining an existing AI-augmented project

1. Start with **[2 → §3: First 30 Minutes](./ai-augmented-project-setup-and-evolution.md#3-project-onboarding-first-30-minutes)** — get productive fast
2. Read **[2 → §5: Working with AI Agents](./ai-augmented-project-setup-and-evolution.md#5-working-with-ai-agents-as-junior-team-members)** — understand the interaction model
3. Read **[2 → §4: First Week](./ai-augmented-project-setup-and-evolution.md#4-project-onboarding-first-week)** — go deeper on architecture and quality
4. Reference **[1 → §5: Failure Patterns](./ai-agent-skills-and-rules-engineering.md#5-catalog-of-ai-failure-patterns)** only when debugging AI output

### If you're an engineering lead maintaining the rules and skills

1. Re-read **[1 → §4: Failure Pattern → Rule Evolution Loop](./ai-agent-skills-and-rules-engineering.md#4-the-failure-pattern--rule-evolution-loop)** — process for improving rules
2. Run the **[1 → §9: Quarterly Audit](./ai-agent-skills-and-rules-engineering.md#9-maintaining-rules-and-skills-over-time)** — maintain rule quality
3. Run the **[1 → §9: Monthly Failure Review](./ai-agent-skills-and-rules-engineering.md#the-monthly-failure-review)** — drive evolution
4. Review **[1 → §7: Skill Lifecycle](./ai-agent-skills-and-rules-engineering.md#7-skill-lifecycle-from-prototype-to-team-standard)** — deprecate or promote skills

### If you're management needing visibility

1. Read **[2 → §9: Management Visibility & Governance](./ai-augmented-project-setup-and-evolution.md#9-management-visibility--governance)** — what to measure and how
2. Skim **[2 → §10: Project Evolution](./ai-augmented-project-setup-and-evolution.md#10-evolving-the-project-over-time)** — maturity model
3. Reference **[1 → §5: Failure Pattern Catalog](./ai-agent-skills-and-rules-engineering.md#5-catalog-of-ai-failure-patterns)** — understand what can go wrong

---

## Key Concepts at a Glance

| Concept | One-Liner | Learn More |
|---|---|---|
| **Rules** | Non-negotiable constraints active on every task — prevent bad output | [1 → §1](./ai-agent-skills-and-rules-engineering.md#1-why-rules-and-skills-exist) |
| **Skills** | Full workflows loaded on demand — direct good output | [1 → §1](./ai-agent-skills-and-rules-engineering.md#1-why-rules-and-skills-exist) |
| **AI as Junior Engineer** | Treat AI agents like fast, tireless junior devs who need explicit guidance | [2 → §5](./ai-augmented-project-setup-and-evolution.md#5-working-with-ai-agents-as-junior-team-members) |
| **Grooming Interview** | AI asks YOU questions before building, not the other way around | [2 → §5](./ai-augmented-project-setup-and-evolution.md#the-grooming-interview-reverse-interview) |
| **Vertical Slicing** | Build feature by feature (schema → API → UI), not layer by layer | [1 → §2 Rule 5](./ai-agent-skills-and-rules-engineering.md#rule-5-vertical-slicing) |
| **TDD Enforcement** | Tests must be written first and must fail before implementation | [1 → §2 Rule 2](./ai-agent-skills-and-rules-engineering.md#rule-2-test-driven-development-enforcement) |
| **Skill Compliance** | Loading a SKILL.md = binding commitment to full workflow | [1 → §2 Rule 6](./ai-agent-skills-and-rules-engineering.md#rule-6-skill-compliance) |
| **Agreement Bias** | LLM tendency to validate whatever is already in its context, even against its own better priors | [1 → §2 Rule 7](./ai-agent-skills-and-rules-engineering.md#rule-7-self-grounded-verification) |
| **Self-Grounded Verification (SGV)** | Elicit success criteria before looking at the artifact, then evaluate against them with evidence | [1 → §2 Rule 7](./ai-agent-skills-and-rules-engineering.md#rule-7-self-grounded-verification) |
| **Memory** | Two-tier store: short-term notes + long-term consolidated memory with a dream cycle | [2 → §5](./ai-augmented-project-setup-and-evolution.md#memory-context-continuity-across-sessions) |
| **Tech Debt Inventory** | AI must declare what debt it's accepting with every change | [2 → §6 Gate 6](./ai-augmented-project-setup-and-evolution.md#gate-6-tech-debt-inventory) |
| **REFACTOR-SIGNAL** | Searchable markers for code smells found during AI work | [2 → §6](./ai-augmented-project-setup-and-evolution.md#marking-problems-for-future-work) |

---

## Glossary of Terms

| Term | Definition |
|---|---|
| **AGENTS.md** | Project-root file injected as AI system prompt — the entry point for every AI session |
| **Agreement bias** | The tendency of an LLM to validate whatever is in its context window — its own output, a candidate solution, a user's claim — and rationalize flaws, even when it holds correct priors. Documented by Andrade et al. (ICLR 2026) |
| **GLOSSARY.md** | Canonical domain terminology — prevents naming drift across AI sessions |
| **Memory (short-term)** | Self-contained working entry preserving session state (goal, decisions, blockers) — replaces the old "handoff" concept |
| **Memory (long-term)** | Size-limited, INDEX-gated consolidated facts, decisions, constraints, corrections; grows via the dream cycle |
| **Dream Cycle** | Consolidation pass that promotes hot short-term entries to long-term, scores long-term entries, and proposes human-approved evictions |
| **Harness** | The AI coding tool itself (Kilo, Claude Code, Codex, etc.) — provides the environment where agents run |
| **INDEX.md** | Routing table in `.agents/skills/` — maps task types to the correct skill |
| **WIRING.md** | Composition pathways — defines correct order when chaining multiple skills |
| **YAML frontmatter** | Metadata block at the top of every SKILL.md — used by the harness for skill matching and routing |
| **Hard-stop gate** | Condition where the AI must STOP execution (e.g., design checkpoint not passed, tests not written) |
