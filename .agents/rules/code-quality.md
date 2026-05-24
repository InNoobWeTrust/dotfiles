# Code Quality Baseline

This rule applies to **every coding task** without exception. No user request is required to activate it. Check these constraints for every file you write or modify.

---

## Pre-Implementation Design Checkpoint

Before writing any new function, class, or module, answer all six questions. If you cannot answer any one of them, redesign first.

1. **Single responsibility** — What is the one thing this unit does? If you need "and", it does too much — split it.
2. **Minimal interface** — What is the smallest surface callers need? Define only that.
3. **Dependency direction** — What does this unit import or depend on? Each dependency should point toward an abstraction, not a concrete detail.
4. **Human traceability** — Can a reader follow the logic from names and structure alone, without reading implementation bodies?
5. **Deep Module encapsulation** — Does this module hide significant internal complexity behind a highly simplified interface? (Interface Complexity << Implementation Complexity). If it's a shallow wrapper, merge it or redesign it.
6. **Interface-First specification** — Have you fully defined and agreed on the type signatures, enums, or abstract contracts *before* writing any implementation logic?

---

## Required Naming Conventions

| Artifact | Convention | Example |
|---|---|---|
| Functions | Verb phrase describing action | `fetchUserById`, `validatePayload` |
| Variables | Noun phrase describing content | `userEmailList`, `retryCount` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT_MS` |
| Booleans | `is` / `has` / `can` prefix | `isAuthenticated`, `hasWriteAccess` |
| Files/modules | Lower-kebab-case noun | `user-repository.ts`, `payment-gateway.py` |

**No single-letter names** except loop counters (`i`, `j`, `k`). No abbreviations unless they are universally standard in the language ecosystem (`id`, `url`, `http`, `ctx`).

---

## Required Structure Patterns

- **Max 3 levels of nesting.** If logic would require a 4th level, extract an inner block to a named function.
- **Guard clauses at the top.** Return early or throw early. Do not put the happy path inside an `else`.
- **Functions ≤ 50 lines of logic** (excluding pure declarations, type annotations, comments, and blank lines). If longer due to logic, add a `// WHY: not extracted — [reason]` comment and extract at the next opportunity.
- **One public export per file** when the language and framework allow it. Co-locate private helpers in the same file; move shared helpers to a named shared module.
- **Deep Modules over Shallow Modules.** Avoid scattering logic across tiny, fragmented helper files that expose all their implementation details. Combine related logic into unified, deep modules with clean APIs to reduce cognitive overhead for both humans and AI.
  *   *Example (Shallow Module Anti-Pattern)*: Exposes all internals, requiring callers to do heavy coordination:
      ```javascript
      class TextParser {
        constructor() { this.buffer = ''; }
        append(c) { this.buffer += c; }
        tokenize() { return this.buffer.split(' '); }
      }
      // Caller must manage buffer state and parse details manually
      ```
  *   *Example (Deep Module Pattern)*: Hides immense complexity behind a single simple call:
      ```javascript
      class DeepParser {
        static parse(filepath) {
          // Encapsulates buffer management, file IO, encoding, and error fallbacks internals
          return result;
        }
      }
      // Caller simply gets result in one clean, bulletproof invocation
      ```

---

## Traceability Requirements

Every non-obvious decision must have a `// WHY:` comment explaining the reasoning, not just restating the code:

```
// WHY: Retry up to 3 times before failing — downstream rate limit is per-minute
```

Module boundaries must be documented at the top of each file (1-3 lines on what this module is responsible for):

```
// Module: payment-gateway — Handles charge submission to Stripe. Does NOT own
// retry logic or fraud checks; those are delegated to their own modules.
```

---

## Technical Debt Policy

Technical debt is acceptable when explicitly marked. Use this format:

```
// TODO(debt): [what is incomplete] — [why deferred] — [what would trigger cleanup]
```

**Acceptable debt:** incomplete abstraction, deferred optimization, provisional business rule, known rough edge.

**NOT acceptable as debt:** silent error swallowing, god objects, untracked side effects, security shortcuts, logic copied more than twice without extraction.

---

## Refactoring Signal Markers

When you encounter a code smell but cannot fix it in the current task scope, mark it so the user knows exactly what to ask to fix it later:

```
// REFACTOR-SIGNAL: [pattern] — [description]
```

| Pattern Name | When to Mark |
|---|---|
| `feature-envy` | Function uses more data from another module than its own |
| `god-object` | Class or module owns more than one domain concept |
| `shotgun-surgery` | A single logical change requires edits in 4+ separate files |
| `primitive-obsession` | Raw primitive (string, int) where a domain type should be used |
| `long-param-list` | Function takes 4+ parameters — should use a config object |
| `implicit-coupling` | Two modules share undocumented state or rely on call ordering |

---

## Prohibited Patterns (Hard Stop)

Do NOT write code that violates these:

| Prohibition | Explanation |
|---|---|
| Functions doing multiple things | Split at "and" |
| Classes owning multiple domain concepts | One class = one domain |
| Logic copied more than twice | Extract to a named shared function |
| Global mutable state | Must have an explicit `// WHY: global — [justification]` |
| Silent error swallowing | `catch(e) {}` or `except: pass` with no handling — always propagate or log |
| Magic literals | No inline numbers/strings — use named constants |
| Mixing layers | Business logic inside framework callbacks (controllers, handlers, views) |
| Extend-by-parameter | Adding yet another parameter to grow a function's behavior — use composition |
