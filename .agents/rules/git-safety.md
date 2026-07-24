# Git Safety Rule

Applies to all git operations: staging, committing, pushing, and any destructive git command.

## Mandatory Human-in-the-Loop Review Gate

**NEVER auto-stage (`git add`) or auto-commit (`git commit`) for convenience or as an automated side effect.** Human review is paramount — the human must audit every change before git state is mutated.

- **Staging (`git add`) requires explicit user review & approval:** Before running any `git add` command, present the proposed list of files and diff summary to the user and ask for approval, unless the user explicitly requested staging in their prompt.
- **Committing (`git commit`) requires explicit user review & approval:** Present the commit message and staged diff summary to the user and obtain explicit approval before committing.
- **Pushing (`git push`) requires separate user approval.**

## Pre-staging

- Run `git status` and `git diff` to inspect changes.
- Stage explicit files only. Never use `git add .`, `git add -A`, or `git add --all`.
- Do not stage secret-bearing files: `.env`, `*.pem`, `*.key`, `auth.json`, `credentials.json`, or files matching patterns in `.gitignore`.

## Pre-commit

Before executing any commit, run the pre-commit memory checkpoint per `../rules/memory-checkpoint.md`. This captures session knowledge and consolidates unreviewed short-term entries before the commit boundary.

Then continue with the committing steps below.

## Committing

- Staging, committing, and pushing require **separate, explicit** user approvals.
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
