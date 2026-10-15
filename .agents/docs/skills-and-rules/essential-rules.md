# Essential Policies for Every Project

Eighteen narrow rule files were consolidated into **seven short policies**. Policies stay always-on constraints; detailed *methods* live in skills and load only when a workflow needs them. The `details/rule-*.md` leaves in this section are archived rationale — they explain why each policy cluster exists, and are no longer install targets.

## The seven policies

| Policy | Covers | Load when |
|---|---|---|
| `rules/authority.md` | Decision ownership (autonomous/collaborative/approval-gated), consequence-first safety, resource bounds, informed alignment for material decisions | Always-on pointer; read body when ownership or a stop condition is in play |
| `rules/evidence.md` | Self-grounded verification (priors before artifact), tool-call outcome verification, anti-gaslight circuit breaker | Always-on pointer; read body before completion claims or side-effecting tool calls |
| `rules/skill-use.md` | Index-first skill discovery, inspection vs. activation, binding workflow execution | Always-on pointer; read body when routing or executing a skill |
| `rules/execution-safety.md` | Pre-execution gate, sandbox routing, secrets, long-running processes | Before the first shell command, and for any process/resource question |
| `rules/git-safety.md` | Staging, committing, pushing, destructive git actions | Any git operation |
| `rules/code-quality.md` | Reuse-first baseline, design principles, fast-path proportionality, test selection/persistence, ubiquitous language | Before implementation planning and for every file written |
| `rules/document-formats.md` | Typst/PDF default for human-facing documents, Markdown exceptions | Creating, revising, or sharing a document |

Keep an `INDEX`-first map (`rules/INDEX`) rather than loading all seven bodies; policies are short precisely so the always-on layer stays cheap.

## Methods that moved into skills

| Method | Where it lives now | Load when |
|---|---|---|
| Testing strategy, TDD loop, context isolation | `skills/code-craft/references/testing.md` | Writing or reviewing tests |
| Detailed quality guidance, patterns, smells | `skills/code-craft/references/code-quality-guidance.md` | Design review or refactor |
| Discovery and lightweight planning | `skills/working-principles/references/planning.md` | Consequential unknowns or planning needs |
| Product intent and outcomes | `skills/brainstorming/SKILL.md` | Product exploration or a brief for settled direction |
| Technical constraints and trade-offs | `skills/architecture-design/SKILL.md` | Architecture decisions or optional technical specification |
| Acceptance behavior and evidence | `skills/code-craft/references/testing.md` | Behavior examples, including spec-only work, or verification |
| Phased delivery | `skills/team-operating-model/references/phased-delivery.md` | Multi-phase delivery; usable directly for solo work |
| Vertical slicing | `skills/team-operating-model/references/slicing.md` | Feature decomposition; usable directly for solo work |
| Document formats and templates | `skills/doc-craft/references/document-formats.md` | Authoring or auditing documents |

Skills never link back to rule files; the dependency is one-way so a skill stays portable outside a governed harness.

## Archived detail leaves (rationale, not install targets)

- [Code Quality Baseline](./details/rule-code-quality-baseline.md) — now `rules/code-quality.md`
- [Test-Driven Development Enforcement](./details/rule-test-driven-development-enforcement.md) — policy in `rules/code-quality.md`, method in `skills/code-craft/references/testing.md`
- [Grooming (Reverse Interview)](./details/rule-grooming-reverse-interview.md) — current discovery principles in `skills/working-principles/references/planning.md`
- [Ubiquitous Language (Domain Glossary)](./details/rule-ubiquitous-language-domain-glossary.md) — now `rules/code-quality.md`
- [Vertical Slicing](./details/rule-vertical-slicing.md) — method in `skills/team-operating-model/references/slicing.md`
- [Skill Compliance](./details/rule-skill-compliance.md) — now `rules/skill-use.md`
- [Self-Grounded Verification](./details/rule-self-grounded-verification.md) — now `rules/evidence.md`
- [Autonomy Safety (Consequence-First Agency)](./details/rule-autonomy-safety-consequence-first-agency.md) — now `rules/authority.md`
- [Anti-Gaslight & Sycophancy Circuit Breaker](./details/rule-anti-gaslight.md) — now `rules/evidence.md`
