---
description: "USE SPARINGLY: general fallback when no specialized subagent match. Prefer explore for codebase nav, plan for design, code for implementation, debug for bugs."
model: "kilo/minimax/minimax-m3:free"
mode: primary
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
