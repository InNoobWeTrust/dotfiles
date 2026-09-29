---
description: "Fallback subagent for direct, bounded end-to-end execution requiring frontier reasoning — system design, security analysis, macro-architectural decisions, and complex adversarial evaluation. Uses GPT-6 Astra (Intelligence Index 55, $10/$50 per 1M tokens) with 1M context. Does not delegate nested tasks. Reserve for high-stakes work where Copilot quota is drained."
mode: subagent
model: "proxy/gpt-6-astra"
variant: high
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

- Execute the bounded delegated work directly from start to finish.
- Preserve the exact scope, writable surface, contracts, acceptance criteria, stop conditions, and out-of-scope boundaries.
- Use the available tools for implementation and validation; do not plan, split, orchestrate, or expand the work.
- Never delegate nested work.
- If a prerequisite is missing, a contract is ambiguous, or execution is blocked, stop and report the blocker and its context rather than escalating.
