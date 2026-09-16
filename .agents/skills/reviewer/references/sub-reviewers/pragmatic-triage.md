# Pragmatic Triage (Ostrich Lens)

Review lens that challenges whether proposed complexity is justified by
real-world probability and impact. Named after the Ostrich Algorithm: if a
problem is unlikely and its impact is survivable, ignoring it is a valid
engineering decision.

> **Core principle:** Simpler designs are easier to maintain, communicate,
> and evolve. Complexity must earn its place — and the burden of proof is on
> the complexity, not on the simplicity.

## When to Use

- Reviewing architecture proposals, design documents, or threat models
- Challenging plans that introduce new abstractions, layers, or patterns
- Evaluating security/auditor findings that recommend defensive measures
- Any artifact where the author proposes handling edge cases or failure modes

> **Relationship to other lenses**: `adversarial.md` challenges *decisions
> and reasoning*. `design-rigor.md` challenges *process discipline*. This
> lens challenges *whether the problem being solved is worth solving at all*.
> Run this lens first on architecture artifacts — it filters out unjustified
> complexity before other lenses drill into the remaining design.

---

## Mindset

- **Probability × Impact is the only currency.** A scenario that is unlikely
  AND survivable does not deserve architectural complexity. Period.
- **Complexity is not free.** Every abstraction, layer, pattern, or defensive
  measure has ongoing maintenance cost, cognitive load for the team, and
  communication overhead. These costs compound.
- **"What if X happens?" is not an argument.** It's a question. The argument
  requires: how likely is X? What's the actual damage? How does the cost of
  handling X compare to the cost of ignoring it?
- **Simple designs that ship beat perfect designs that don't.** Overly complex
  plans cause users to skip reading, objections surface only after delivery,
  and real feedback arrives too late.
- **The Ostrich Algorithm is a legitimate strategy.** In operating systems,
  deadlock is theoretically possible in many designs. Most systems ignore it
  because the probability is low and a reboot is cheap. This reasoning
  applies broadly.

---

## The Triage Matrix

For every proposed complexity (new layer, pattern, abstraction, defensive
measure, edge-case handler), fill in this matrix:

```
┌──────────────────┬─────────────────────┬──────────────────────┐
│                  │ LOW IMPACT          │ HIGH IMPACT          │
│                  │ (survivable,        │ (data loss, security │
│                  │  recoverable,       │  breach, revenue     │
│                  │  cosmetic)          │  loss, safety)       │
├──────────────────┼─────────────────────┼──────────────────────┤
│ LOW PROBABILITY  │ IGNORE              │ MITIGATE CHEAPLY     │
│ (rare, edge,     │ Do not add code.    │ Simplest possible    │
│  theoretical)    │ Document if needed. │ guard. No layers.    │
├──────────────────┼─────────────────────┼──────────────────────┤
│ HIGH PROBABILITY │ HANDLE SIMPLY       │ HANDLE PROPERLY      │
│ (common, likely, │ Minimal inline      │ Full design is       │
│  already seen)   │ handling. No new    │ justified. This is   │
│                  │ abstractions.       │ where complexity     │
│                  │                     │ earns its place.     │
└──────────────────┴─────────────────────┴──────────────────────┘
```

**Only the HIGH PROBABILITY × HIGH IMPACT quadrant justifies significant
architectural complexity.** Everything else should be handled with the
simplest possible approach — or not handled at all.

---

## Protocol

### Step 1: Extract Every Proposed Complexity

Read the artifact and list every instance where the author proposes:

- A new abstraction layer, interface, or indirection
- A design pattern (Strategy, Observer, Factory, CQRS, Event Sourcing, etc.)
- A defensive measure against a failure mode or edge case
- A new service, module boundary, or infrastructure component
- A migration path, backward-compatibility shim, or versioning scheme
- A monitoring, alerting, or circuit-breaker mechanism

### Step 2: Triage Each Item

For each extracted complexity, answer:

1. **What scenario does this protect against?** (Be specific — name the
   concrete failure, not the abstract category.)
2. **How likely is this scenario?** Evidence-based: has it happened before?
   Is there data? Or is this a "what if" from first principles?
3. **What happens if we don't handle it?** Concrete impact: data loss?
   Downtime? User confusion? A minor log message nobody reads?
4. **What's the simplest alternative?** Could a comment, a TODO, a retry,
   a log line, or "let it crash and restart" suffice?
5. **Matrix placement:** Which quadrant does this land in?

### Step 3: Challenge Unjustified Complexity

For items NOT in HIGH×HIGH:

```markdown
## Triage Challenge: <Item>

**Proposed complexity**: <what the author wants to build>
**Scenario**: <what it protects against>
**Probability**: LOW | MEDIUM | HIGH — <evidence>
**Impact**: LOW | MEDIUM | HIGH — <concrete consequence>
**Matrix**: <quadrant>

**Challenge**: This lands in [quadrant]. The proposed solution adds
[specific cost: new interface, extra layer, N more files, ongoing
maintenance burden]. A simpler alternative is [concrete alternative].

**Recommendation**: REMOVE | SIMPLIFY | DEFER | KEEP (with justification)
```

### Step 4: Produce the Triage Report

```markdown
## Pragmatic Triage Report: <Artifact>

**Total complexities identified**: N
**Justified (HIGH×HIGH)**: N
**Challenged**: N

### Unjustified Complexity (Remove or Simplify)

1. <item> — <quadrant> — <recommendation>

### Borderline (Author Must Justify)

1. <item> — <why borderline> — <what evidence would tip it>

### Justified (Complexity Earned)

1. <item> — <why HIGH×HIGH>

### Simplicity Budget

The artifact proposes N abstractions/layers/patterns. For a project of
this size and team, [M] is a reasonable budget. The proposal exceeds
this by [N-M] items. Consider which provide the most value and cut the
rest.
```

---

## Complexity Smell Catalog

These patterns signal over-engineering. When spotted, apply the triage
matrix before accepting:

| Smell | Signal | Common Ostrich Response |
|---|---|---|
| **Pattern without pressure** | Strategy/Observer/Factory with exactly one implementation | Delete the pattern; add it when (if) a second case appears |
| **Speculative generalization** | "When we need to support X..." with no evidence X is coming | Build for today; refactor when X actually arrives |
| **Abstraction astronomy** | 5+ layers between a user action and its effect | Flatten; direct calls until proven insufficient |
| **Defense-in-depth theater** | Multiple redundant checks for the same low-probability failure | One check at the boundary; remove the rest |
| **Config-driven everything** | Putting things in config that have never changed and likely never will | Hard-code it; extract to config when the first change request arrives |
| **Premature decomposition** | Microservice/module boundary before understanding the domain | Keep it in one module; split when the boundary becomes obvious from usage |
| **Ceremony for ceremony's sake** | DTOs, mappers, validators for internal-only data that crosses no trust boundary | Pass the object directly; add a boundary when one is needed |
| **Perfect error handling** | Elaborate recovery logic for errors that should crash the process | Let it crash; fix the root cause |
| **Future-proof API** | Versioning, deprecation, migration before the first external consumer exists | Ship v1; worry about compatibility when someone actually depends on it |

---

## Rules

1. **Every complexity challenged must have a concrete simpler alternative.**
   "Remove this" without saying what replaces it is not actionable.
2. **HIGH×HIGH items get a pass.** Do not challenge genuinely justified
   complexity — that undermines credibility.
3. **Probability claims need grounding.** "This could happen" is not HIGH
   probability. Has it happened? Is there data? Is there a known pattern?
4. **Impact claims need specificity.** "This could cause problems" is not
   HIGH impact. What specifically breaks? For whom? How badly?
5. **The simplicity budget is a heuristic, not a hard limit.** Use it to
   prompt the conversation, not to mechanically reject items.
6. **Do not conflate simplicity with laziness.** Simple designs require
   more thought, not less. The goal is elegant minimalism, not corners cut.

---

## Calibrating Intensity

| Context | Intensity |
|---|---|
| **Greenfield architecture** | High — this is where over-engineering seeds are planted |
| **Security/threat model** | Medium — verify probability claims but respect genuine threats |
| **Feature spec** | Medium — check for speculative generalization |
| **Bug fix / incident** | Low — focus on whether the fix is proportional to the problem |
| **Refactoring proposal** | High — refactors often introduce "while we're at it" complexity |

---

## Related References

- **`adversarial.md`** — Challenges reasoning quality; this lens challenges whether the problem is worth reasoning about.
- **`design-rigor.md`** — Challenges design process; this lens challenges whether the design scope is justified.
- **`edge-case-hunter.md`** — Enumerates paths mechanically; this lens triages whether those paths need handling.
