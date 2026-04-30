---
name: edge-case-hunter
description: Mechanical edge-case and boundary-condition finder for code, diffs, specs, and logic. Use for explicit edge-case review, unhandled paths, off-by-one, race condition, null handling, missing validation, unhappy paths, parsers, state machines, validators, and auth flows.
---

# Edge Case Hunter

Mechanical, method-driven path tracing for unhandled edge cases. Orthogonal to
adversarial review — this skill enumerates paths systematically rather than
challenging from a cynical stance.

## When to use this skill

- Reviewing code (diffs, full files, or functions) for unhandled branches
- Complementing an adversarial review with a different methodology
- Auditing logic-heavy code (parsers, state machines, validators, auth flows)
- Checking boundary conditions before shipping

> **Relationship to `adversarial-reviewer`**: The adversarial reviewer asks
> "what's wrong with this?" from a skeptical stance. The edge-case hunter asks
> "what paths exist and which are unguarded?" via mechanical enumeration. Run
> both for orthogonal coverage.

---

## Methodology

### Step 1: Enumerate All Branching Paths

Walk every conditional, switch, match, loop, try/catch, and early return.
Build a complete path map:

- Every `if` has an `else` (explicit or implicit)
- Every `switch`/`match` has a `default`/`_` case
- Every loop has: zero iterations, one iteration, many iterations, max iterations
- Every `try` has: success, each distinct error type, unexpected error type
- Every function has: happy path, each named error, unnamed/unexpected errors

### Step 2: Derive Edge Classes

For each path, check against these **edge classes**:

| Edge Class | What to Look For |
|---|---|
| **Missing else / default** | Implicit fall-through when no branch matches |
| **Unguarded inputs** | null, undefined, empty string, empty array, NaN, negative numbers, zero |
| **Off-by-one** | `<` vs `<=`, array bounds, pagination, fence-post errors |
| **Arithmetic overflow** | Integer limits, float precision, division by zero |
| **Implicit type coercion** | String ↔ number, truthy/falsy, loose equality |
| **Race conditions** | Concurrent access, TOCTOU, shared mutable state |
| **Async / concurrency** | Unhandled promise rejections, callback ordering, deadlocks, missing cancellation tokens |
| **Timeout / deadline gaps** | Missing timeouts, no retry limits, no cancellation |
| **Resource exhaustion** | Unbounded allocations, missing cleanup, connection leaks |
| **State corruption** | Partial updates without rollback, interrupted sequences |
| **Encoding / format** | Unicode edge cases, timezone handling, locale-dependent formatting |

### Step 3: Test Each Path Against Existing Guards

For each identified edge case:
1. Check if the code already handles it (guard clause, validation, type check, test)
2. If handled → **silently discard** (do not report handled cases)
3. If unhandled → **report as finding**

### Step 4: Report Only Unhandled Paths

Each finding must include: location (file:line or function), edge class,
specific trigger condition, a suggested guard snippet (1-3 lines), and
the potential consequence if the path is hit unguarded.

---

## Output Format

```markdown
## Edge Case Hunt: [Target]

**Scope**: [file, function, or diff reviewed]
**Paths enumerated**: [N total branching paths found]
**Unhandled**: [M findings]

### Findings

#### 1. [Edge Class] — [Location]
- **Trigger**: [specific condition]
- **Consequence**: [what goes wrong]
- **Suggested guard**:
  ```
  [1-3 line fix]
  ```

#### 2. ...
```

---

## Rules

1. **Silence on handled paths** — do not report edge cases that already have guards
2. **Be mechanical, not creative** — enumerate paths systematically, don't invent unlikely scenarios
3. **Concrete triggers only** — every finding must have a specific, reproducible trigger condition
4. **Guard snippets are suggestions** — they show the shape of the fix, not production-ready code
5. **Complement, don't replace** — this skill finds what adversarial review misses, and vice versa

---

## Related Skills

- **`security-reviewer`** — Security edge cases (auth bypass, injection, data exposure) overlap heavily with unhandled paths. Run both for security-critical code.
- **`adversarial-reviewer`** — Orthogonal: attitude-driven vs method-driven. Use together for maximum coverage.
