---
description: "USE SPARINGLY: general fallback when no specialized subagent match. Fallback to `codex-gpt-sol` if `general` is not available."
mode: subagent
hidden: true
model: "github-copilot/gpt-5.4"
variant: medium
permission:
  "*": ask
  bash: ask
  edit: ask
  serena_execute_shell_command: ask
  serena_create_text_file: ask
  read: allow
  glob: allow
  grep: allow
  list: allow
  task: deny
  webfetch: ask
  websearch: ask
  semantic_search: ask
  codesearch: ask
  skill: allow
  lsp: allow
  external_directory: ask
  todowrite: ask
  todoread: allow
  question: allow
  doom_loop: ask
  kilo_memory_save: ask
  kilo_memory_recall: allow
  recall: allow
---
