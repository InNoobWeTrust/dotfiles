# Skills Discovery

The active agent config root keeps skills in `skills/`, normally `../skills/`. Use index-first routing; do not recursively inspect every skill at task start.

## When to Check

1. Read `../skills/INDEX.md`, or `skills/INDEX.md` relative to the active agent config root, when skill routing is needed.
2. Match the user's **intent** (not just keywords) against skill descriptions. Descriptions use imperative phrasing ("Use this skill when...") — treat them as activation conditions.
3. Load the selected skill's `SKILL.md` only after the index route matches.
4. Compose skills only when the second skill is a clear safety or review lens.

## Skill Precedence

- **`code-craft` is the default primary skill for ALL implementation tasks.** Any non-trivial code write, feature addition, refactor, or restructuring loads `code-craft`. It is not the "narrowest" skill to skip — it is the baseline.
- **`skill-author` is MANDATORY whenever creating, modifying, editing, or auditing skills, rules, or `.agents/` governance files.** You must consult https://agentskills.io and https://agents.md to verify compliance with latest format specifications.
- Prefer the most specific skill over broad methodology for non-implementation tasks.
- Prefer no skill for purely mechanical changes: formatting, config values, renaming with no logic changes.
- For review tasks, use `../commands/review.prompt.md` or the active config root's `commands/review.prompt.md`.

## Common Routing Mistakes

- Skipping `code-craft` because the task "seems simple" — if it writes or modifies logic, load it.
- Skipping `skill-author` when editing skills, rules, or `.agents/` — load it whenever touching governance/infrastructure files.
- Loading no skill when the user describes a debugging problem — use `systematic-investigation`.
- Not loading `codebase-exploration` when working in an unfamiliar repo — start there before implementing.
