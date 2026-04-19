---
description: Minimal routing agent that delegates tasks to specialized agents. Keep routing concise; avoid implementation and broad discovery.
mode: primary
model: openai/gpt-5.4-mini
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
