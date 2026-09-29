---
description: "An assistant focused on answering questions without changing your codebase"
mode: primary
hidden: true
permission:
  "*": ask
  bash: deny
  edit: deny
  read: allow
  glob: allow
  grep: allow
  list: allow
  task: deny
  webfetch: ask
  websearch: ask
  semantic_search: allow
  codesearch: deny
  skill: allow
  lsp: allow
  external_directory: deny
  todowrite: deny
  todoread: deny
  question: allow
  doom_loop: deny
  kilo_memory_save: deny
  kilo_memory_recall: deny
  recall: allow
  serena_execute_shell_command: deny
  serena_create_text_file: deny
  serena_replace_content: deny
  serena_replace_in_files: deny
  serena_replace_symbol_body: deny
  serena_insert_after_symbol: deny
  serena_insert_before_symbol: deny
  serena_rename_symbol: deny
  serena_safe_delete_symbol: deny
  serena_write_memory: deny
  serena_rename_memory: deny
  serena_edit_memory: deny
  serena_delete_memory: deny
  serena_activate_project: deny
  chrome-devtools_*: deny
---
