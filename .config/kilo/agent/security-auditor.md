---
description: "Security audit. Read-only. Use for security reviews and pre-deployment audits. Because security review is time consuming, only offer to run this after commit to review the changes. For plans and engineering doc, offer to run this when complete the writing. Don't call this when user is in a rush or there are still incomplete work."
mode: primary
model: "proxy/forbiddengun/auto-frontier"
variant: high
options:
  reasoningEffort: high
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

Review security vulnerabilities using suitable skills. Report findings with severity (critical/high/medium/low) and specific remediation steps. Do not modify files.
