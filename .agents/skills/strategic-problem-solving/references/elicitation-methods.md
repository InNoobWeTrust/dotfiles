# Elicitation Methods Library

Named reasoning methods for structured second passes. Instead of "try again"
or "make it better," select a specific method to force re-examination through
a particular lens.

## When to Use

- After any generation step when output feels "okay but shallow"
- At decision points during problem-solving (Phase 2 analysis, Phase 4 challenge)
- When you suspect there's more depth to uncover
- For high-stakes content where rethinking has outsized value

## How to Offer Elicitation

1. Assess the content type and complexity
2. Suggest 5 most relevant methods from the list below
3. Present with one-line descriptions
4. User picks one (or asks to reshuffle for different options)
5. Apply the method, show what changed and why
6. Repeat or proceed — always optional

---

## Analysis Methods

### Pre-mortem Analysis

Assume the project/design/plan has already failed 6 months from now. Work
backward: What went wrong? Why? What early warnings were missed? What
assumptions proved false?

**Best for**: Plans, architectures, PRDs, any forward-looking artifact.

> **Note**: This method is also used in Phase 4 (Challenge & Validate) of
> the main problem-solving flow. When used here as elicitation, it targets
> the _content quality_ of an artifact. In Phase 4, it targets the
> _solution validity_.

### Constraint Removal

Temporarily drop all constraints (budget, timeline, tech stack, team size).
What would the ideal solution look like? Now add constraints back one at a
time. Which constraints actually change the answer?

**Best for**: Early-stage ideation, challenging "we can't do X" assumptions.

### Gap Analysis

Systematically check: What questions does this artifact leave unanswered?
For each section, ask "what would someone need to know to act on this?"
and verify the answer is present.

**Best for**: Specs, runbooks, documentation, handoff artifacts.

### Time-Travel Test

Evaluate the artifact at three time horizons: Does this work well _today_?
In _6 months_ when requirements change? In _2 years_ when the team has
tripled? What ages badly?

**Best for**: Architecture, API contracts, data models, technology choices.

---

## Adversarial Methods

| Method                    | What to Do                                                                                              | Best For                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| **Inversion**             | Ask "How would I guarantee this fails?" List all failure paths, then verify none exist.                 | Risk assessment, spec validation                  |
| **Red Team vs Blue Team** | Attack your own work, then defend it. Alternate until both sides are exhausted.                         | Security designs, irreversible decisions          |
| **Socratic Questioning**  | Ask "Why?", "How do you know?", "What if the opposite were true?" Follow each thread to bedrock.        | Requirements validation, "obvious" truths         |
| **Devil's Advocate**      | Argue the strongest case _against_ the current approach. Genuinely try to convince yourself it's wrong. | Go/no-go decisions, architecture reviews          |
| **Steel-Manning**         | Find the strongest version of the opposing argument. If someone disagreed, what's their _best_ case?    | Controversial decisions, trade-off justifications |

---

## Perspective Methods

| Method                   | What to Do                                                                                                | Best For                        |
| ------------------------ | --------------------------------------------------------------------------------------------------------- | ------------------------------- |
| **Stakeholder Mapping**  | Re-evaluate from each stakeholder's view: end user, maintainer, ops, business, new team member.           | PRDs, UX specs, API design      |
| **Analogical Reasoning** | Find parallels in unrelated domains (nature, other industries). Force 3+ analogies from different fields. | Novel problems, creative blocks |

---

## Facilitator Script

When offering elicitation:

```
I can push this further using a specific reasoning method. Here are
5 options that fit this content:

1. **Pre-mortem Analysis** — Assume this failed. What went wrong?
2. **Socratic Questioning** — Challenge every claim until it's grounded
3. **Stakeholder Mapping** — Re-evaluate from each stakeholder's view
4. **Inversion** — How would we guarantee failure? Then invert.
5. **Gap Analysis** — What questions does this leave unanswered?

Pick a number, ask me to reshuffle, or say "skip" to proceed as-is.
```

## Rules

1. **Named methods only** — vague "let me rethink" is not elicitation
2. **One method per pass** — don't combine; each forces a distinct angle
3. **Show the delta** — after applying, show what changed and why
4. **Diminishing returns** — after 2-3 passes, suggest moving on
5. **Never force** — elicitation is always offered, never required
6. **Suggest the right starter** — Pre-mortem for plans/specs; Socratic for requirements; Gap Analysis for docs
