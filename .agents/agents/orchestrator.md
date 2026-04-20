---
description: Minimal routing agent that delegates tasks to specialized agents. Keep routing concise; avoid implementation and broad discovery.
mode: primary
model: minimax-coding-plan/MiniMax-M2.7-highspeed
reasoningEffort: medium
permission:
  bash:
    "gemini*": allow
    "npx acpx*": allow
    "*": deny
  write:
    "*": deny
  edit:
    "*": deny
  create:
    "*": deny
  delete:
    "*": deny
  move:
    "*": deny
  read:
    "*": allow
---
