# Skill Composition: WIRING.md

### What WIRING.md Does

When a complex task needs multiple skills, the AI must know what order to load them in and when to hand off. WIRING.md defines these pathways.

### Structural Format

```

## Strategic Composition Pathways

### Debugging & Fixing
1. `codebase-exploration` — navigate unfamiliar boundaries
2. `systematic-investigation` — root cause analysis
3. `code-craft` — disciplined fix implementation
4. `reviewer` — verify fix addressed root cause

### Feature Implementation
1. `working-principles` planning reference — clarify consequential unknowns
2. `codebase-exploration` — map target areas
3. `code-craft` — disciplined implementation
4. `reviewer` — post-implementation review
```

Product intent belongs to `brainstorming`, technical constraints/trade-offs to `architecture-design`, and acceptance behavior (including spec-only examples) to `code-craft`. Use `ui-ux` for journeys and `doc-craft` for presentation; compose only what the task needs, without a mandatory specification chain.

### Handoff Matrix

A table showing which skills naturally hand off to which others:

| From | To | Triggers & Context |
|---|---|---|
| `codebase-exploration` | `systematic-investigation` | "I understand the map, now investigating root cause" |
| `systematic-investigation` | `code-craft` | "Root cause found, now implementing the fix" |
| `code-craft` | `reviewer` | "Implementation complete, ready for review" |

### Default Composition Rules

```
- Default for implementation: load `code-craft`
- `code-craft` can compose with any other primary skill as a design lens
- Prefer no skill for simple edits
- Prefer the narrowest skill that matches user intent
```

---
