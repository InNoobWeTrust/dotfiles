# Code Quality & Engineering Discipline

### The Engineering Contract

Every code change in an AI-augmented project must pass through a defined set of gates. The AI must not declare a task complete until all gates are passed:

```
1. Pre-Implementation Design Checkpoint (7 questions)
   ↓
2. TDD Cycle (test → implement → refactor) for logic components
   ↓
3. Code Quality Rules (naming, structure, documentation)
   ↓
4. Quality Tooling Gates (format → lint → type-check → audit)
   ↓
5. Readability & Robustness Audit
   ↓
6. Tech Debt Inventory
```

### Gate 1: Pre-Implementation Design Checkpoint

Before writing ANY function, class, or module, the AI must answer these 7 questions. If it cannot answer any one of them, it must STOP and redesign:

1. **Single responsibility** — What is the ONE thing this unit does? If the answer contains "and," it does too much — split it.
2. **Minimal interface** — What is the smallest surface callers need? Define only that.
3. **Dependency direction** — What does this unit depend on? Each dependency should point toward an abstraction, not a concrete implementation detail.
4. **Human traceability** — Can a reader follow the logic from names and structure alone, without reading implementation bodies?
5. **Deep Module encapsulation** — Does this module hide significant internal complexity behind a highly simplified interface? (Interface complexity should be far less than implementation complexity.)
6. **Interface-First specification** — Are type signatures, enums, and abstract contracts fully defined BEFORE writing any implementation logic?
7. **Ambiguity policy** — If an edge case or failure path has multiple reasonable behaviors, what contract chooses the correct one? If no contract defines this, STOP and ask the user instead of inventing a fallback.

### Gate 2: TDD for Logic Components

Test-Driven Development is mandatory for any component containing logic: parsers, validators, algorithms, data processors, state managers. The cycle is:

```
RED      → Write the test first. Run the test command. Confirm it FAILS.
GREEN    → Write the minimum code to make the test pass. Run tests. Confirm PASS.
REFACTOR → Clean up naming, nesting, structure. Re-run tests. Confirm still PASS.
```

The AI must output the test command and its results as proof of compliance. Skippable only for CSS changes, config edits, markdown documentation, and typo fixes — changes with no logic.

### Gate 3: Code Quality Rules

These are non-negotiable across every file:

| Rule | Threshold | Rationale |
|---|---|---|
| Nesting depth | Max 3 levels | Beyond 3, extract the inner block to a named function |
| Function length | Max 50 lines of logic | Beyond 50, split or document why splitting is deferred |
| Guard clauses | Required at top | Happy path must not be nested inside an `else` block |
| Single-letter names | Forbidden (except loop counters i, j, k) | Names must communicate intent |
| Magic literals | Forbidden | Every inline number or string must be a named constant |
| Silent error swallowing | Forbidden | `catch(e) {}` with no handling — always propagate or log |
| Business logic in UI/views | Forbidden | Extract to services/controllers behind the view layer |
| Deep Modules | Required | Interface complexity must be far less than implementation complexity |

### Gate 4: Quality Tooling

Run these commands before finalizing any non-trivial change. Exact commands will vary by project stack; these are typical patterns:

```
# Fast inner loop (while editing — run frequently)
make fix          # Auto-fix formatting and safe corrections
make lint         # Fast format + lint + type check

# Quality gates (before merge — run once)
make quality      # Full structural checks + dependency audit

# Additional checks by area
make test         # Unit tests
make build        # Build safety check
make api-check    # API contract drift check
```

**Escalation rules:**
- **Dependency audit failures** = BLOCKER. Vulnerable dependencies must be fixed before merge.
- **Structural failures** = BLOCKER for code you changed. Pay down existing debt in touched files opportunistically.
- **New warnings in unchanged files** = Flag but do not block. These are pre-existing debt.

### Gate 5: Readability Audit

After writing, the AI must read its own code as if it's a new engineer with zero context. Answer these questions:

1. Is the entry point obvious? (Where does execution start?)
2. Can I follow control flow from function names alone? (Without reading implementations)
3. Are state mutations obvious at the call site? (Not hidden in side effects)
4. Is the error path as readable as the happy path? (Not buried in a catch-all)
5. What happens when external dependencies fail? (Database drops, API times out, disk fills up)

For any "no" or weak answer, refactor or add a `// CLARITY:` annotation explaining what the code does and why.

### Gate 6: Tech Debt Inventory

The AI must explicitly state what debt it's accepting with each change:

```
TECH DEBT INVENTORY
===================
[none]

— OR —

- TODO(debt): src/services/pricing.py:142 — hardcoded margin of 15%
  — deferred until ERP integration exposes margin field
  — cleanup trigger: when upstream ERP API exposes margin field
```

**Acceptable debt:** Incomplete abstraction, deferred optimization, provisional business rules, known rough edges.

**NOT acceptable as debt:** Silent error swallowing, god objects, security shortcuts, logic copied more than twice without extraction.

### Marking Problems for Future Work

When the AI spots a code smell but cannot fix it in the current task scope, it must mark it:

```
// REFACTOR-SIGNAL: god-object — PaymentController owns 4 unrelated domain operations
```

This creates a searchable inventory of known issues. Anyone can grep for `REFACTOR-SIGNAL` and find work to pick up.

Common signal patterns:

| Pattern | Meaning |
|---|---|
| `feature-envy` | Function uses more data from another module than its own |
| `god-object` | Class or module owns more than one domain concept |
| `shotgun-surgery` | A single logical change requires edits in 4+ separate files |
| `primitive-obsession` | Raw primitive used where a domain type should exist |
| `long-param-list` | Function takes 4+ parameters — should use a config object |
| `implicit-coupling` | Two modules share undocumented state or rely on call ordering |

### Module Documentation

Every distinct module or component directory must contain a `README.md` documenting:

- **Purpose**: Clear high-level summary of the module's role
- **Architecture**: Key design patterns and design decisions
- **Public Interface**: API contracts, parameters, return types, exceptions
- **Dependencies**: External systems, libraries, or other internal modules it couples to
- **Resilience & Errors**: Error handling strategy, escalation rules, fallback contracts

If a new module is created, its README.md must be created immediately. If an existing module's public interface changes, its README.md must be updated.

### Docstring Requirements

All public APIs, classes, exported interfaces, and functions must have a docstring that includes:
- A one-line summary of what it does
- Parameter names, types, and descriptions
- Return value description
- Errors, exceptions, or failure modes it can produce

Format follows the language ecosystem standard: JSDoc for TypeScript/JavaScript, PEP 257 for Python, Go doc comments for Go.

---
