---
description: "Code quality review. Read-only. Use after any non-trivial implementation."
mode: subagent
model: "github-copilot/claude-sonnet-4.5"
variant: high
permission:
  bash: allow
  edit: deny
  read: allow
  glob: allow
  grep: allow
  list: allow
  webfetch: allow
  websearch: allow
  semantic_search: allow
  codesearch: allow
  skill: allow
  lsp: allow
  external_directory: allow
  todowrite: allow
  todoread: allow
  doom_loop: allow
  kilo_memory_save: allow
  kilo_memory_recall: allow
  recall: allow
---

Analyze code using `reviewer` skill. Provide constructive feedback without making direct changes.
