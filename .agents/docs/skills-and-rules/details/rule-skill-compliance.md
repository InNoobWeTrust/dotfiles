# Rule 6: Skill Compliance

**File:** `rules/skill-compliance.md`

**What it prevents:** AI announcing it's using a skill and then selectively skipping steps.

**Core components:**

```
1. Loading a SKILL.md is a binding commitment to the full workflow
2. Complexity and effort are NOT valid reasons to skip steps
3. Must identify every mandatory/required/must/hard-stop step
4. Must execute every mandatory step in order
5. Must produce exact artifacts the skill specifies
6. Blockers must be reported explicitly — never silently skipped
7. Self-check before final output: confirm complete workflow execution
```

**Without this rule:** The AI will load a skill, read the first phase, decide "that's enough context," and produce code without running through the full design checkpoint, SOLID audit, readability audit, and tech debt inventory. The output will be a pale imitation of what the skill was designed to produce.

**The hard-stop gate pattern:**
Some rules need to be absolute. Skill compliance uses "hard-stop gates" — conditions where the AI must STOP and cannot proceed. Examples:
- Phase 1 design checkpoint: if any of the 7 questions can't be answered, redesign first
- TDD: if tests weren't written first, stop and write them
- Ambiguity policy: if an edge case has multiple reasonable behaviors and none is specified by contract, stop and ask the user
