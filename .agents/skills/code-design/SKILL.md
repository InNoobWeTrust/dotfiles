---
name: code-design
description: Enforces SOLID, KISS, modularity, and human-readability principles during implementation. Load for any non-trivial code write, feature addition, or refactor. Prevents lazy easy-path decisions that reduce maintainability.
---

# Code Design Skill

## When to Load This Skill

Load this skill for any of these tasks:
- Adding a new function, class, or module
- Implementing a feature that touches more than one file
- Refactoring or restructuring existing code
- Reviewing a design decision before committing to it
- Any task where the temptation is to "just add it to the existing class/function"

**Skip this skill only for:** typos, formatting, config value changes, or renaming without logic changes.

---

## Skill Workflow

This skill has five phases. All five must be completed for non-trivial code. Phases 1–2 happen **before writing**. Phases 3–4 happen **during and after writing**. Phase 5 is a final gate.

---

### Phase 1 — Design Intent

Before writing any code, produce this block (in a code comment or scratch space):

```
DESIGN INTENT
=============
Unit name       : [name of function/class/module being created or modified]
Responsibility  : [one sentence — what it does, using no "and"]
Caller interface: [what callers pass in → what they get back]
Dependencies    : [list each import/dependency this unit will have]
Isolation test  : [yes / no — can this unit be tested without mocking the whole world?]
Traceability    : [how will a human reader find this unit and understand it by name alone?]
```

**Isolation test = "no" is a STOP condition.** Redesign the dependency structure before proceeding. A unit that cannot be isolated has too many implicit couplings — extract them.

---

### Phase 2 — SOLID Quick Check

Run this check after Phase 1, before writing code:

| Principle | Question | Pass? |
|---|---|---|
| **S** — Single Responsibility | Does this unit do exactly one thing? Could you describe it in one sentence without "and"? | ☐ |
| **O** — Open/Closed | Can this unit be extended (new behavior added) without modifying its existing logic? | ☐ |
| **L** — Liskov Substitution | If no inheritance: N/A, mark ✓. If this extends/implements something: does any override add preconditions or weaken postconditions compared to the base? (If yes → redesign.) | ☐ |
| **I** — Interface Segregation | Is the public interface the minimum callers actually need? No fat interface. | ☐ |
| **D** — Dependency Inversion | Does this unit depend on abstractions (interfaces, protocols), not concrete implementations? | ☐ |

**Any unchecked item must either be fixed or documented as explicit accepted debt** with a `// TODO(debt):` comment.

---

### Phase 3 — Write

Write the implementation following `rules/code-quality.md`:
- Naming conventions (verb phrases for functions, noun phrases for variables)
- Max 3 nesting levels; guard clauses at the top
- Functions ≤ 50 lines of logic (excluding declarations, type annotations, comments, blank lines)
- `// WHY:` comments for non-obvious decisions
- Module boundary docstring at file top

---

### Phase 4 — Readability Audit

After writing, read the code as a new engineer with zero context. Answer these:

1. **Entry point** — Is it obvious where execution enters this unit?
2. **Flow traceability** — Can you follow the control flow from function names alone, without reading bodies?
3. **Side effects** — Are all state mutations obvious at the call site?
4. **Error path** — Is the failure path as readable and explicit as the happy path?

For any "no" answer, add a `// CLARITY:` annotation explaining what the code does and why the structure is what it is.

---

### Phase 5 — Tech Debt Inventory (Final Gate)

Before marking the task complete, produce:

```
TECH DEBT INVENTORY
===================
[none]

— OR —

- TODO(debt): [marker location] — [what] — [why deferred] — [trigger for cleanup]
```

If debt was accepted in Phase 2 (SOLID check), it must appear here. Empty inventory is fine — but it must be explicitly stated.

---

## Design Decision Anti-Patterns

These are the most common agent lazy-path shortcuts. Recognize and refuse them:

| Temptation | Why It's Wrong | Correct Path |
|---|---|---|
| "I'll add this method to the existing class — it's already there" | Violates Single Responsibility; grows the class beyond its domain | Create a separate module/service |
| "I'll add another parameter to handle the new case" | Grows function surface; callers must know about new parameter | Use composition or a strategy pattern |
| "I'll copy this logic here — it's only used twice" | Creates divergence; the copies will drift | Extract to a named shared function now |
| "I'll use a dict/map here — it's flexible" | Hides structure; readers cannot see what fields exist | Use a typed struct, dataclass, or interface |
| "The function is getting long but it all belongs together" | No function "belongs together" at 80 lines | Extract named sub-functions at logical boundaries |
| "I'll put the business rule in the controller/handler" | Mixes layers; makes business logic untestable in isolation | Extract to a domain service |
| "I'll use a global flag to coordinate these modules" | Introduces invisible coupling and ordering dependency | Use explicit dependency injection or event passing |

---

## Deliverable

The skill's output is working code that satisfies:

- [ ] Design Intent block was produced (Phase 1)
- [ ] SOLID check passed or debt documented (Phase 2)
- [ ] Code follows naming, structure, and traceability rules from `rules/code-quality.md` (Phase 3)
- [ ] Readability audit passed or CLARITY annotations added (Phase 4)
- [ ] Tech Debt Inventory produced (Phase 5, even if empty)
