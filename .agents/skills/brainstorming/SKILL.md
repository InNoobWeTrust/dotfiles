---
name: brainstorming
description: "Use this skill for creative ideation, product design, conceptual exploration, and product briefs or PRDs. Activate to generate ideas, explore options, break creative blocks, or specify product intent for a settled direction without implementation. Use code-craft for behavior/acceptance specs and architecture-design for technical design."
---

# Brainstorming

Choose the path from the request: explore alternatives, or clarify a settled product direction. A product-brief or spec-only request does not require brainstorming new directions or authorize implementation.

For the exploration path only, load phase detail and techniques from `references/phases.md`.

## Exploration path

1. **Frame** the problem (goal, constraints, success).
2. **Diverge** (volume techniques — SCAMPER, worst idea, etc.).
3. **Facilitate** (no early judgment; cluster themes).
4. **Converge** (rank, combine, kill weak ideas).
5. **Multi-perspective evaluate** (optional hats / stakeholders).
6. **Action plan** — top 3–5 with next experiments.

### Output

Problem statement; captured ideas; prioritized shortlist with rationale; next experiments. Top 3–5 is useful when comparing alternatives, not a quota for a settled direction.

## Settled-direction product brief / PRD path

Use when the user asks for product requirements, a PRD, or a brief for an already chosen direction. Inputs are the request, available user evidence, existing product decisions and constraints. Follow [Planning and shared understanding](../working-principles/references/planning.md) for unresolved discovery; skip divergence and ranking unless a real product choice remains open.

1. **Ground the problem**: who is affected, their current workflow or pain, why it matters, and what evidence supports it. Label hypotheses; do not invent research or personas.
2. **Define the outcome**: desired user benefit and observable success. Prefer a measurable target with a baseline and measurement window when known; otherwise state what must be learned. For example, “reduce median onboarding time from 5 to 2 minutes within 30 days,” not “improve UX.”
3. **Bound the product**: included capabilities, non-goals, affected users/stakeholders, dependencies and constraints. Capture core use cases in plain language or user stories; do not prescribe architecture to fill a product gap.
4. **Expose uncertainty**: distinguish agreed intent, assumptions and open decisions; identify the evidence or authorized owner needed to resolve each consequential gap. Stop the affected specification on conflicting scope or missing owner decisions rather than silently choosing a new direction.
5. **Deliver only the requested specification**: a concise product brief is enough by default; expand to a formal PRD when explicitly requested or when durable coordination requires it. Update affected intent when the direction changes, linking existing sources rather than duplicating them.

The output must let a reader identify the problem, audience, outcome, scope/non-goals, core use cases and unresolved decisions without this chat. Missing evidence remains visible; a completed brief is not proof of product success or approval to build.

### Domain handoffs

- [code-craft](../code-craft/SKILL.md) owns observable behavior, acceptance criteria and BDD examples, including spec-only requests.
- [architecture-design](../architecture-design/SKILL.md) owns technical constraints, boundaries and trade-offs; [ui-ux](../ui-ux/SKILL.md) owns interaction and visual design.
- [doc-craft](../doc-craft/SKILL.md) owns presentation and format for a saved human-facing brief, not its product decisions. No mandatory PRD → technical spec → BDD ladder follows from this path.

## Investment handoff

When ideation is about **allocation, what to own, or how much**, frame goals/rails here, then hand off to `investment-assessment` for regime fit, class diligence, and sizing. Do not end with enthusiasm and no left-tail or role-of-money path.
