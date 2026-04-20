# Skills Discovery

This repo has agent skills at `~/.agents/skills/`.

## When to Check

When starting a task, use dynamic discovery to find applicable skills:

1. Scan `~/.agents/skills/` directory to discover available skills
2. Read each skill's `SKILL.md` to understand triggers and capabilities
3. Match the user's request against skill descriptions
4. If a match is found, follow the skill's instructions
5. Multiple skills can be composed — e.g., `adversarial-reviewer` after `requirements-driven-dev`

## Skill Precedence

If a task matches multiple skills, prefer the more specific one. For review tasks,
use the [review command](../commands/review.md) which handles routing automatically.
