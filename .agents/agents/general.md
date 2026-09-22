---
description: "USE SPARINGLY: general fallback when no specialized subagent match. Fallback to `codex-gpt-terra` if `general` is not available."
mode: subagent
hidden: true
model: "github-copilot/gpt-5.4"
variant: medium
permission:
  bash: allow
  edit: allow
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
