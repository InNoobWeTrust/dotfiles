---
description: >
  Multi-persona deliberation session. Use when you need diverse expert
  perspectives on a decision, want agents to challenge each other's assumptions,
  or are exploring a complex topic that spans multiple domains. Optional —
  suggested during brainstorming, architecture decisions, and retrospectives.
---

## Default Personas

These personas cover the most common deliberation needs. Users can override,
remove, or add custom personas.

| Persona | Role | Perspective |
| --- | --- | --- |
| **Product Owner** | Speaks for the user/customer | "Does this solve a real user problem?" |
| **Architect** | Technical design authority | "Is this technically sound and maintainable?" |
| **Developer** | Implementation reality check | "Can we actually build this? What's hidden complexity?" |
| **Security Auditor** | Threat-aware skeptic | "What could an attacker do with this?" |
| **Devil's Advocate** | Adversarial challenger | "Why will this fail?" |
| **End User** | Non-technical perspective | "Would I actually use this? Is it intuitive?" |

### Domain-Specific Personas

For non-software deliberation, swap in domain personas as appropriate:

| Persona | Domain | Perspective |
| --- | --- | --- |
| **Strategist** | Business | "Does this align with long-term strategy? What's the opportunity cost?" |
| **Finance / CFO** | Business | "What's the ROI? What are the cost risks? Can we afford this?" |
| **Marketing Lead** | Content / GTM | "Will our audience care? How do we position this?" |
| **Researcher** | Academic / R&D | "What does the evidence say? Are we drawing valid conclusions?" |
| **Educator** | Training / docs | "Can a newcomer understand this? What's the learning curve?" |
| **Operations** | Infra / process | "Can we run, monitor, and maintain this at scale?" |
| **Legal / Compliance** | Regulatory | "Are we compliant? What legal exposure does this create?" |
| **Patient Advocate** | Healthcare | "Is this safe? Does it respect patient dignity and consent?" |

### Custom Personas

Users can request specific personas:

- "Add a QA persona"
- "Replace Developer with a Data Engineer"
- "I want a Marketing perspective too"

Personas can also be derived from the user's available skills and agents.
If the project has a `reviewer` skill, a Security Auditor persona
is a natural fit. Adapt the defaults to what's available.

---

## Session Flow

### 1. Setup

```
Facilitator: "What topic do you want to discuss?"
```

- User provides topic or question
- Facilitator selects 2–4 most relevant personas (user can override)
- Brief introductions: each persona states their perspective in one line

### 2. Opening Positions

Each selected persona gives an initial take (2–3 sentences max). Personas
should **genuinely disagree** where their perspectives naturally conflict.

### 3. Discussion Rounds

Facilitator orchestrates turn-by-turn:
- Personas respond to each other, not just to the user
- Cross-talk is encouraged: "Building on what Architect said..." or "I disagree with Developer because..."
- Facilitator rotates who speaks to prevent any persona from dominating
- User can interject anytime: ask questions, redirect, push back

### 4. Convergence

After discussion, each persona gives a final position:
- What they agree on
- What they still disagree on
- What they'd want to investigate further

### 5. Summary

Facilitator produces:

```markdown
## Party Mode Summary: [Topic]

**Participants**: [personas]

### Consensus
- [points of agreement]

### Disagreements
- [unresolved tensions with each side's argument]

### Recommended Next Steps
- [actions, investigations, decisions needed]
```

---

## Facilitation Rules

1. **Genuine disagreement** — Personas must argue from their actual perspective. A Security Auditor who agrees with everything is useless.
2. **No persona dominance** — Rotate speakers. No persona gets 3 turns in a row.
3. **Build, don't just react** — Personas should build on each other's ideas, not just critique.
4. **Concise turns** — 2–4 sentences per turn. No monologues.
5. **User is sovereign** — User can redirect, add personas, remove personas, or end the session at any time.
6. **Exit signals** — Session ends when user says "wrap up", "that's enough", "summary please", or similar.
7. **Convergence limit** — If 5 discussion rounds pass without new insights or position changes, facilitator should suggest wrapping up.

---

## Integration Points

This command can be invoked from:
- `brainstorming.md` Phase 5 (Multi-Perspective Mode) 
- `requirements-driven-dev` after PRD or TRD generation
- Any decision point where you'd benefit from cross-functional deliberation

---

## Invocation Arguments

Additional command input, if any, appears below exactly as provided:

```text
$ARGUMENTS
```

Use the block above as raw additional user input. Preserve whitespace, blank lines, and quoting exactly. If the block is empty, rely on the conversation context instead.

Follow the instructions above to work on the user's party-mode request right below.

---
