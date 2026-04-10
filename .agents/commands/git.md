---
description: Run git work through the safety supervisor
agent: git-supervisor
---
Handle this git-related request through the safety supervisor workflow:

$ARGUMENTS

Apply the full git safety procedure:
- inspect status, staged diff, unstaged diff, and recent log first
- keep the requested file scope narrow
- never use broad staging
- exclude unrelated files and likely secret-bearing files
- push only if the user explicitly requested push
