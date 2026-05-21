# Task: <title>

## Goal
- <single-sentence outcome>

## Files In Scope
- <path>
- <path>

## Allowed Actions
- Edit only the files in scope unless verification proves another file is required
- Run only the verification and development commands listed below
- Keep the diff minimal and focused on the current failure

## Forbidden Actions
- Do not edit secret-bearing files such as `.env`, `*.pem`, `*.key`, `credentials.json`
- Do not run destructive filesystem or git cleanup commands
- Do not add dependencies or run network-mutating commands unless explicitly approved here
- Do not change files outside scope just to silence tooling noise

## Completion Criteria
- [ ] <criterion with positive proof>
- [ ] <criterion with positive proof>
- [ ] `verify.sh` exits `0`

## Verification Commands
- <command>
- <command>

## Stop Triggers
- Stop if the task becomes ambiguous or contradicts this brief
- Stop if the next action would violate the forbidden actions list
- Stop if the same verification failure repeats 3 times

## Notes For The Next Iteration
- Read `progress.txt` and `.ralph-verify.json` before editing
- Fix the latest verification failure before expanding scope
- Summarize progress back into `progress.txt` after every iteration
