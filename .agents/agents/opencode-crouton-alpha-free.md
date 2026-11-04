---
enabled: false
description: "Use for focused code questions, source reading and targeted file review: probe specific behavior and return a concise answer or bounded report, then check any returned edit. Keep iterations short and supervised — long multi-step runs can stop early without a result — and split extended audits into verified steps."
mode: subagent
model: "opencode/crouton-alpha-free"
permissions:
  - action: edit
    resource: "*"
    effect: allow
---
