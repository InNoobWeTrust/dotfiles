# Skills Discovery

The active agent config root keeps skills in `skills/`, normally `~/.agents/skills/`. Use index-first routing; do not recursively inspect every skill at task start.

## When to Check

1. Read `~/.agents/skills/INDEX.md`, or `skills/INDEX.md` relative to the active agent config root, when skill routing is needed.
2. Match the request to the smallest applicable skill.
3. Load the selected skill's `SKILL.md` only after the index route matches.
4. Compose skills only when the second skill is a clear safety or review lens.

## Skill Precedence

- Prefer the most specific skill over broad methodology.
- Prefer no skill for simple, well-scoped edits.
- For review tasks, use `../commands/review.prompt.md` or the active config root's `commands/review.prompt.md`.
