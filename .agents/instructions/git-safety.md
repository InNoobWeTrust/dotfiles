# Project Git Safety

- Any git write operation must go through the `git-supervisor` agent or the `/git` slash command.
- Non-git agents must not run direct git mutations such as `git add`, `git commit`, `git push`, branch rewrites, or history edits.
- Never use broad staging commands like `git add .`, `git add -A`, or `git add --all`.
- Never auto-stage unrelated files, untracked files, or likely secret-bearing files such as `.env`, `*.pem`, `*.key`, `auth.json`, `credentials.json`, or private config dumps.
- Read-only git inspection commands such as `git status`, `git diff`, and `git log` are allowed when needed for context.
- If a user asks for a git mutation outside `/git`, hand the work to `git-supervisor` rather than executing the write directly.
