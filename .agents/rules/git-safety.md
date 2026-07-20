# Git Safety Rule

Applies to all git operations: staging, committing, pushing, and any destructive git command.

## Pre-staging

- Run `git status` and `git diff` before staging.
- Stage explicit files only. Never use `git add .`, `git add -A`, or `git add --all`.
- Do not stage secret-bearing files: `.env`, `*.pem`, `*.key`, `auth.json`, `credentials.json`, or files matching patterns in `.gitignore`.

## Pre-commit

Before executing any commit, run the pre-commit memory checkpoint per `../rules/memory-checkpoint.md`. This captures session knowledge and consolidates unreviewed short-term entries before the commit boundary.

Then continue with the committing steps below.

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

Git operations are irreversible at the remote level. Treat every push as permanent. The pre-commit memory checkpoint (see `memory-checkpoint.md`) ensures session knowledge is captured before the commit boundary.
