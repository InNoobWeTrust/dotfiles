# Guiding Philosophy

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
