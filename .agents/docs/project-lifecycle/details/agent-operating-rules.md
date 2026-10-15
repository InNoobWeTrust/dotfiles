# Agent Operating Rules

### Skill Workflow (Binding Once Activated)
Inspecting a skill's catalog entry, description, or SKILL.md body to judge
suitability is free. Activation — an explicit invocation, a selected workflow
track, or the first workflow action — binds the smallest applicable track. You
do not have discretion to simplify or abbreviate an activated workflow's steps
or stops.

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
