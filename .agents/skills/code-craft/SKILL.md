---
name: code-craft
description: "Code design discipline enforcing SOLID, KISS, DRY, modularity, separation of concerns, and human-readability during implementation. Load for any non-trivial code write, feature addition, refactor, or restructuring. Covers: clean code, design patterns, decomposition, dependency management, naming, and architecture at the function/class/module level. Activate on \"refactor\", \"restructure\", \"design this module\", \"clean up this code\", \"make this maintainable\", \"decompose\", \"extract\", or any implementation touching more than one file."
---

# Code Crafting Skill

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

### Phase 1 — Design Intent & Resilience Plan

Before writing any code, produce this block (in a code comment or scratch space):

```
DESIGN INTENT
=============
Unit name       : [name of function/class/module being created or modified]
Responsibility  : [one sentence — what it does, using no "and"]
Caller interface: [what callers pass in → what they get back]
Glossary Sync   : [yes / no — did you verify all naming against the project's GLOSSARY.md?]
Interface contract: [exact type signature, abstract contract, or API schema definition]
Interface sign-off: [yes / no — has the user approved the interface signature?]
Module README   : [yes / no / updated — does the module have a README.md or will it be created/updated in this task?]
Dependencies    : [list each import/dependency this unit will have]
Isolation test  : [yes / no — can this unit be tested without mocking the whole world?]
Error budget    : [what can fail here (IO, API, DB) and how is it handled / isolated?]
Failure contract: [for each failure mode, exact caller-visible behavior: retry, mapped error, partial result, or stop]
Ambiguity policy: [which edge cases are contract-defined vs which require escalation or user clarification]
Traceability    : [how will a human reader find this unit and understand it by name alone?]
```

**STOP CONDITIONS (Gates 1 & 2):**
1. **Isolation test = "no" is a STOP condition.** Redesign the dependency structure before proceeding. A unit that cannot be isolated has too many implicit couplings — extract them.
2. **Interface sign-off = "no" is a STOP condition.** When creating new services or public exports, you MUST present the Interface contract to the user and obtain their explicit sign-off before writing the concrete logic body.
   *   *AFK / Non-Interactive Exception*: If operating in automated, background, or non-interactive (AFK) modes, set `Interface sign-off = "assumed-approved"`. Log a design contract block detailing your assumptions in the task scratch space or logs, and proceed with execution without blocking.
3. **Unspecified edge-case semantics is a STOP condition.** If an input, failure mode, or boundary case has more than one reasonable caller-visible behavior and the contract or existing product behavior does not choose one, you MUST stop and ask the user instead of inventing a fallback.
   *   *AFK / Non-Interactive Exception*: The AFK exception does not authorize guessing. If no contract-defined behavior exists, fail closed with an explicit blocker or mapped error rather than silently defaulting.

---

### Phase 2 — SOLID & Clean Architecture Check

Run this check after Phase 1, before writing code:

| Principle / Aspect | Question | Pass? |
|---|---|---|
| **S** — Single Responsibility | Does this unit do exactly one thing? Could you describe it in one sentence without "and"? | ☐ |
| **O** — Open/Closed | Can this unit be extended (new behavior added) without modifying its existing logic? | ☐ |
| **L** — Liskov Substitution | If inheritance: does any override add preconditions or weaken postconditions? If no inheritance: N/A (✓). | ☐ |
| **I** — Interface Segregation | Is the public interface the minimum callers actually need? No bloated interfaces. | ☐ |
| **D** — Dependency Inversion | Does this unit depend on abstractions (interfaces, protocols), not concrete implementations? | ☐ |
| **YAGNI** (You Aren't Gonna Need It) | Did you strip out all speculative structures, "future-proofing" boilerplate, or unused parameters? | ☐ |
| **Separation of Concerns** | Is the core logic 100% free of web frameworks, HTTP protocols, databases, or filesystem details? | ☐ |
| **Deep Module** | Is the module's public interface highly simplified while hiding substantial internal complexity? (Interface Complexity << Implementation Complexity) | ☐ |

**Any unchecked item must either be fixed or documented as explicit accepted debt** with a `// TODO(debt):` comment.

---

### Phase 3 — Write with High-Quality Standards

Write the implementation following `rules/code-quality.md` and these advanced crafting guidelines:

#### A. Defensive Boundaries (Robust Exception Handling)
- **Zero Silent Failures:** Never catch exceptions without recording diagnostic information or recovering.
- **Fail Explicitly:** Every network call, file IO, or database query must configure explicit timeouts and an explicit failure contract. Use mapped errors, retries, or contract-approved defaults only when the caller-visible semantics are already defined. Do not invent `[]`, `null`, `false`, or no-op fallbacks just to keep execution moving.
- **Escalate Semantic Ambiguity:** If an edge case can plausibly mean more than one thing, stop and ask the user or surface a domain error. Defensive programming makes uncertainty visible; it does not hide it behind defaults.
- **Preserve Diagnostics:** Propagate source context (error code, field name, upstream status, correlation data) so a reviewer can see why the failure path happened.
- **Sanitize Boundaries:** Validate external API payloads immediately upon receiving them before passing them to internal functions.

#### B. Immutability & State Hygiene
- **Immutability by Default:** Prefer pure functions that receive parameters and return new copies of data instead of mutating inputs or deep state objects.
- **Centralized Mutation:** If state mutation is required, isolate it to a single dedicated manager class or event loop to avoid race conditions.

#### C. Runtime Invariant Assertions
- **Design by Contract:** Place lightweight assertions at the beginning and end of complex algorithmic boundaries to check preconditions (e.g. valid arguments) and invariants.
- **Example (Python):** `assert item_count >= 0, "Item count cannot be negative"`
- **Example (TypeScript):** `if (itemCount < 0) throw new Error("Invariant violated")`

#### D. Strict Type Soundness
- **No Loose Types:** Do not use `any`, `unknown`, `object`, or unstructured dictionaries for core logic.
- **Discriminated Unions / ADTs:** Represent states and outcomes using strong types, union types, and enums rather than raw string matching or magic numbers.

#### E. Test-Driven Development (TDD Cycle)
- **Write Test Cases First:** In accordance with `rules/tdd.md`, implement your test cases and interface stubs *before* writing the logic bodies.
- **RED**: Execute the test command and confirm that the test fails as expected.
- **GREEN**: Write the minimal code to satisfy the test cases. Confirm all tests pass.
- **Refactor**: Refactor to meet all code quality criteria, maintaining passing test states.
- **Deliverable requirement**: You must post the execution of your test command and its passing results in your turn summary.

---

### Phase 4 — Readability & Robustness Audit

After writing, read the code as a new engineer with zero context. Answer these:

1. **Entry point** — Is it obvious where execution enters this unit?
2. **Flow traceability** — Can you follow the control flow from function names alone, without reading bodies?
3. **Side effects** — Are all state mutations obvious at the call site?
4. **Error path** — Is the failure path as readable and explicit as the happy path?
5. **Resilience** — What happens if the filesystem is full, a database connection drops, or a network request times out?
6. **Ambiguity handling** — For every fallback or error mapping, can a reviewer tell why this behavior is correct and when execution escalates instead?

For any "no" or weak answer, refactor or add a `// CLARITY:` annotation explaining what the code does and why.

#### F. Module README & Architecture Design Audit
For any module directory created or modified, you must ensure it has an up-to-date, high-quality `README.md` documenting its architecture, responsibility, public interface, and behavior:
- **Create**: If the module directory has no `README.md`, create it immediately.
- **Update**: If the changes modify the module's public interface, internal logic flow, dependencies, or core responsibility, update the directory's `README.md`.
- **Content guidelines (flexible but thorough)**: The `README.md` must contain sufficient detail to allow a human auditor to understand what the module does, its responsibility, public APIs, key design decisions, and external coupling without having to read the source code.

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

If debt was accepted in Phase 2, it must appear here. Empty inventory is fine — but it must be explicitly stated.

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
| "I'll return `[]` / `null` / `false` here so callers don't break" | Hides contract ambiguity and turns real failure into fake success | Surface a typed/domain error or ask the user to define the expected behavior |

---

## Deliverable

The skill's output is working code that satisfies:

- [ ] Design Intent & Resilience Plan block was produced (Phase 1)
- [ ] SOLID & Clean Architecture check passed or debt documented (Phase 2)
- [ ] Code follows naming, structure, and traceability rules from `rules/code-quality.md` (Phase 3)
- [ ] Code is robust, pure where possible, and strictly typed (Phase 3 A-D)
- [ ] Ambiguous edge cases were escalated or clarified; no invented semantic fallbacks were shipped
- [ ] Readability & Robustness audit passed or CLARITY annotations added (Phase 4)
- [ ] Module README.md is created or updated to reflect the architecture design and public interfaces (Phase 4.F)
- [ ] Tech Debt Inventory produced (Phase 5, even if empty)
