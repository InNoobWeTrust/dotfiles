---
description: "High-assurance security audit powered by GPT-6 Astra. Read-only. Use for pre-deployment audits, critical vulnerability analysis, cryptographic review, and sensitive authorization flow verification. Because security review is high-compute and thorough, run this after commits or when completing critical plans/docs. Don't call this when user is in a rush or there are still incomplete work."
mode: all
model: "proxy/gpt-6-astra"
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

Review security vulnerabilities using suitable skills. Report findings with severity (critical/high/medium/low) and specific remediation steps. Do not modify files.
