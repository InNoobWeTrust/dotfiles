# Agent Operating Rules

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
