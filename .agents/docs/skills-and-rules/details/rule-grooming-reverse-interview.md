# Rule 3: Grooming (Reverse Interview)

**Current method:** `skills/working-principles/references/planning.md`

*Historical rationale: `rules/grooming.md` was removed. The interview sequence below describes the former rule, not current mandatory steps. Current discovery is proportionate: ask only consequential unresolved questions, respect settled direction, and do not require formal specifications.*

**What it prevents:** AI building the wrong thing because it misunderstood requirements.

**Historical components (not current instructions):**

```
1. Stop-and-probe: before building, identify gaps and assumptions
2. 3-5 high-value questions asked to the user
3. Questions target: goal/boundaries, edge cases, dependencies, interface concept
4. Graceful scaling: full interview for complex tasks, skip for simple edits
5. AFK mode: self-grooming audit with documented assumptions
```

**Without this rule:** The AI will accept "add user preferences" as a complete specification and build a system that stores preferences globally when you meant per-user, or uses localStorage when you needed server persistence, or exposes preferences in the API when they should be UI-only.

**The key insight:** The AI doesn't know what it doesn't know. This rule forces it to find out before building.
