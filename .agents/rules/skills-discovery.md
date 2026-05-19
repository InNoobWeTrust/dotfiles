# Skills Discovery

The active agent config root keeps skills in `skills/`, normally `~/.agents/skills/`. Use index-first routing; do not recursively inspect every skill at task start.

## When to Check

1. Read `~/.agents/skills/INDEX.md`, or `skills/INDEX.md` relative to the active agent config root, when skill routing is needed.
2. Match the request to the smallest applicable skill.
3. Load the selected skill's `SKILL.md` only after the index route matches.
4. Compose skills only when the second skill is a clear safety or review lens.

## Skill Precedence

- **`code-design` is the default primary skill for implementation tasks.** It is not the "narrowest" skill to skip — it is the baseline to load for any non-trivial code write, feature, or refactor.
- Prefer the most specific skill over broad methodology for non-implementation tasks.
- Prefer no skill for purely mechanical changes: formatting, config values, renaming with no logic changes.
- For review tasks, use `../commands/review.prompt.md` or the active config root's `commands/review.prompt.md`.
