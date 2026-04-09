# Skills Discovery

This repo has agent skills at `{AGENT_DIR}/skills/`, where `{AGENT_DIR}` is
`.agents/` or `.agent/` at the workspace root.

## When to Check

Before starting a task, scan the skills index to see if a relevant skill exists:

1. Read `{AGENT_DIR}/skills/index.md` for the full catalog
2. Match the user's request against the **Triggers** column
3. If a match is found, read the skill's `SKILL.md` and follow its instructions
4. Multiple skills can be composed — e.g., `adversarial-reviewer` after `requirements-driven-dev`

## Skill Precedence

If a task matches multiple skills, prefer the more specific one. For review tasks,
use the [review command](../commands/review.md) which handles routing automatically.
