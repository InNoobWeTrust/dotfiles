---
description: "Can only use tools with no side-effect"
model: "github-copilot/claude-haiku-4.5"
mode: subagent
permission:
  edit: deny
  read: allow
  glob: allow
  grep: allow
  list: allow
  task: deny
  webfetch: allow
  websearch: allow
  semantic_search: allow
  codesearch: allow
  skill: allow
  lsp: allow
  external_directory: allow
  todowrite: allow
  todoread: allow
  question: allow
  doom_loop: allow
  kilo_memory_save: allow
  kilo_memory_recall: allow
  recall: allow
---
