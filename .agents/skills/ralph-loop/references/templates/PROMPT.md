You are executing one Ralph iteration.

Rules:
- Read `TASK.md`, `progress.txt`, and `.ralph-verify.json` before editing.
- Stay inside the task scope unless verification proves another file is required.
- Prefer the smallest correct change.
- Do not add dependencies, start background services, or touch secret-bearing files.
- If the task becomes ambiguous, unsafe, or subjective, stop and report that explicitly.

Iteration goal:
- Fix the highest-priority failing verification item.
- If verification already passes, make no speculative changes.

Output requirements:
- Briefly state what you changed.
- State which verification failure you targeted.
- Update `progress.txt` with a concise iteration summary.
