# Git Safety Rule

Applies to all git operations: staging, committing, pushing, and any destructive git command.

## Pre-staging

- Run `git status` and `git diff` before staging.
- Stage explicit files only. Never use `git add .`, `git add -A`, or `git add --all`.
- Do not stage secret-bearing files: `.env`, `*.pem`, `*.key`, `auth.json`, `credentials.json`, or files matching patterns in `.gitignore`.

## Pre-commit — memory checkpoint

Before executing any commit, check for unconsolidated short-term memory:

1. Resolve `MEMORY_DIR`: if `git rev-parse --show-toplevel` succeeds, use `<git-root>/.agents/memory/`; otherwise `~/.agents/memory/`.
2. Check for entries in `MEMORY_DIR/short-term/` with `consolidated: false` in their frontmatter. Treat a **missing** `consolidated` field as `false` too — do not skip entries just because they predate the field (see `../skills/memory/references/hierarchy-and-storage.md` §Frontmatter resilience).
3. If any exist, load `../rules/memory.md` and run the Consolidate (dream cycle) from `../skills/memory/references/dream-cycle.md` §Commit-signal integration.
4. This captures session learnings into `MEMORY_DIR/long-term/` as a pre-commit checkpoint.
5. **Do not block the commit on eviction** — eviction can defer to the next dream cycle.
6. **Do not silently stage `.agents/memory/**`** into the commit. Only include memory files if the user explicitly approves.

If no unconsolidated entries exist, proceed without loading the memory skill.

## Committing

- Commit and push require **separate** user approvals.
- Write a meaningful commit message that summarises the change, not just "update".

## Destructive operations

Do not run any of these without explicit user approval in the current session:

- `git reset` (any form)
- `git restore`
- `git clean`
- `git stash` (drop/pop)
- `git push --force` / `git push --force-with-lease`
- `git rebase` (interactive or non-interactive)
- `git branch -D`

## Principle

Git operations are irreversible at the remote level. Treat every push as permanent. The pre-commit memory checkpoint ensures session knowledge is captured before the commit boundary — matching the "human dreams after a day of work" pattern from the memory skill.
