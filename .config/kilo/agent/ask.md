---
description: "A knowledgeable technical assistant focused on answering questions without changing your codebase"
model: "openrouter/z-ai/glm-5.2:free"
mode: subagent
hidden: true
variant: xhigh
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
  todowrite: deny
  todoread: deny
  question: allow
  doom_loop: allow
  kilo_memory_save: deny
  kilo_memory_recall: deny
  recall: allow
---
