# The Failure Pattern → Rule Evolution Loop

Rules are not designed in advance. They emerge from this cycle:

```
1. OBSERVE → AI produces bad output
2. DIAGNOSE → What specific capability/constraint was missing?
3. ENCODE → Write a rule that would have prevented this specific failure
4. TEST → Use the rule in the next similar task
5. REFINE → If the rule blocked the failure AND didn't cause false positives, keep it
6. GENERALIZE → If the same pattern applies to other contexts, broaden the rule
```

### When to Add a Rule

| Signal | Action |
|---|---|
| Same mistake in 2+ AI outputs | Write a one-sentence rule targeting that mistake |
| Same mistake in 5+ outputs across different tasks | Write a formal rule with examples and a hard-stop gate |
| Mistake would cause data loss, security breach, or financial error | Write a rule immediately, regardless of frequency |
| AI follows the letter but violates the spirit of existing rules | Refine existing rule, don't add a new one |

### When NOT to Add a Rule

| Anti-Signal | Why Not |
|---|---|
| Hypothetical concern ("what if the AI does X?") | Rules without real failure patterns don't stick |
| "This would be nice to enforce" | Rules cost context window space — be stingy |
| "This is obvious to any good developer" | The AI will follow it without a rule. If it doesn't, THEN add one. |
| Trying to pre-empt a failure from a different project | Each project has its own failure patterns |

### Example Evolution: The "No Silent Error Swallowing" Rule

**Failure observed:** The AI wrote `try { riskyOperation() } catch (e) { return null }` — silently hiding a database connection failure that caused data to appear empty instead of erroring.

**Initial rule:** "Don't swallow errors silently."

**Refinement 1:** The AI started catching errors and logging them, but still returned `[]` for failed API calls, making the frontend show "no data" instead of "error."

**Refined rule:** "Every fallback, default, degraded-mode, or error-mapping path must be traceable to an explicit contract. If code returns `[]`, `null`, or `false` on failure, document WHY with a `// WHY:` comment. Do not turn uncertainty into fake success."

**Refinement 2:** The AI documented WHY it was returning empty arrays but the justification was circular ("returning [] so the UI doesn't break").

**Final rule:** Added to the Prohibited Patterns list: "Silent semantic fallback: returning `[]`, `null`, `false`, partial success, or a no-op for an ambiguous/failed case without contract approval."

---
