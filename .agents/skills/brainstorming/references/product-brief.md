# Settled-direction product brief / PRD

Use when the user asks for product requirements, a PRD, or a brief for an already chosen direction. Inputs are the request, available user evidence, existing product decisions and constraints. Apply planning and shared-understanding principles for unresolved discovery: frame problems before solutions, expose gaps to their owners, and stop the affected specification on conflicting scope rather than silently choosing a direction. Skip divergence and ranking unless a real product choice remains open.

1. **Ground the problem**: who is affected, their current workflow or pain, why it matters, and what evidence supports it. Label hypotheses; do not invent research or personas.
2. **Define the outcome**: desired user benefit and observable success. Prefer a measurable target with a baseline and measurement window when known; otherwise state what must be learned. For example, “reduce median onboarding time from 5 to 2 minutes within 30 days,” not “improve UX.”
3. **Bound the product**: included capabilities, non-goals, affected users/stakeholders, dependencies and constraints. Capture core use cases in plain language or user stories; do not prescribe architecture to fill a product gap.
4. **Expose uncertainty**: distinguish agreed intent, assumptions and open decisions; identify the evidence or authorized owner needed to resolve each consequential gap. Stop the affected specification on conflicting scope or missing owner decisions rather than silently choosing a new direction.
5. **Deliver only the requested specification**: a concise product brief is enough by default; expand to a formal PRD when explicitly requested or when durable coordination requires it. Update affected intent when the direction changes, linking existing sources rather than duplicating them.

The output must let a reader identify the problem, audience, outcome, scope/non-goals, core use cases and unresolved decisions without this chat. Missing evidence remains visible; a completed brief is not proof of product success or approval to build.

## Domain handoffs

- A behavior/acceptance specification capability owns observable behavior, acceptance criteria and BDD examples, including spec-only requests. If unavailable, capture outstanding acceptance criteria as explicit open items in the brief.
- A technical design capability owns technical constraints, boundaries and trade-offs; an interaction and visual design capability owns interaction and visual design. If unavailable, record the technical or design boundary as an open decision requiring the relevant capability.
- A document format and presentation capability owns presentation and format for a saved human-facing brief, not its product decisions. No mandatory PRD → technical spec → BDD ladder follows from this path. If unavailable, deliver the brief in plain Markdown and note any format requirements for later.
