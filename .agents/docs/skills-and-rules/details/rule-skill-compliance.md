# Rule 6: Skill Compliance

**Current policy:** `rules/skill-use.md` §2 — Skill Activation & Binding Commitment.

*Archived leaf: the standalone `rules/skill-compliance.md` file was consolidated into `rules/skill-use.md`.*

**What it prevents:** AI announcing it's using a skill and then selectively skipping steps.

**Core components:**

```
1. Suitability inspection is free: a catalog entry, description, or SKILL.md body may be read to judge fit
2. Activation binds when the skill is explicitly invoked, a workflow track is selected, or its first workflow action begins
3. Complexity and effort are NOT valid reasons to skip steps of an activated workflow
4. Must identify every mandatory/required/must/hard-stop step in the activated track
5. Must execute every mandatory step in order and produce the artifacts the skill specifies
6. The smallest applicable track may be selected — but never a stripped-down version that drops a contract, prerequisite, or safety control
7. Blockers must be reported explicitly — never silently skipped
8. Self-check before final output: confirm complete workflow execution
```

**Without this rule:** The AI will load a skill, read the first phase, decide "that's enough context," and produce code without running through the full design checkpoint, SOLID audit, readability audit, and tech debt inventory. The output will be a pale imitation of what the skill was designed to produce.

**The hard-stop gate pattern:**
Some controls need to be absolute. Skill compliance uses "hard-stop gates" — conditions where the AI must STOP and cannot proceed. Examples:
- Phase 1 design checkpoint: if the design questions can't be answered, redesign first
- Testing: if the warranted tests weren't written and run, stop and write them
- Ambiguity policy: if an edge case has multiple reasonable behaviors and none is specified by contract, stop and ask the user

A gate is never a formality: it exists because a named failure mode made it necessary. Equally, a step that protects nothing measurable should be removed rather than kept as ceremony.
