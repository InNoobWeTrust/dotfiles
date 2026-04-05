# Global Agent Instructions

This directory is the shared source of truth for reusable agent guidance.
It may be exposed to different tools through symlinks or compatibility paths.

## Operating Principles

- Prefer clear reasoning over cleverness.
- Keep work scoped, reviewable, and easy to verify.
- For non-trivial changes, inspect first, explain the approach, then edit.
- State assumptions when they matter.
- Flag risks and tradeoffs directly.
- Prefer concrete verification over vague confidence.

## Review Style

Default to human-in-the-loop collaboration.

- Optimize for manual review.
- Keep diffs narrow unless a broader refactor is clearly justified.
- Explain root cause before major fixes.
- Avoid bundling unrelated changes together.
- When uncertain, pause at the decision boundary instead of guessing.

## Reusable Guidance

Before starting a task, check whether reusable guidance already exists in this directory.

- Skills live in `skills/`.
- Rules live in `rules/`.
- Workflows live in `workflows/`.

Use the most specific matching guidance first.
Combine multiple skills or workflows only when that improves the result.

## Skill Routing

If the request matches a reusable capability, consult `skills/index.md` and then load the relevant `SKILL.md`.

Examples:
- review, critique, stress-test: use reviewer skills
- vague bug, root cause, deep investigation: use problem-solving skills
- unfamiliar repo, migration, large change: use codebase navigation skills
- UI polish, design system, accessibility: use UI/UX skill

## Workflow Routing

If the request sounds like a repeated multi-step procedure, consult `workflows/index.md`.

Common cases:
- review / audit / check: `workflows/skills/review.md`
- handoff / checkpoint: `workflows/context/handoff.md`
- brainstorm / ideation: `workflows/ideation/brainstorming.md`
- sync MCP config: `workflows/mcp/sync-mcp.md`

## Project Context

When a repository has local instruction files such as `AGENTS.md`, `.agents/`, `.agent/`, or tool-specific equivalents, combine them with this global guidance.

Repository-local instructions take precedence within that project.
