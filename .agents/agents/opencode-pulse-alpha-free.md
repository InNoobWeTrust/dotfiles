---
enabled: false
description: "Use for cross-file UI and code diagnosis and targeted review: trace styles, config and component code across several files, weigh screenshot evidence, and return a cited root-cause report. Prefer it for diagnosis and review over generating UI or creative code, and verify interactive behavior when it does."
mode: subagent
model: "opencode/pulse-alpha-free"
permissions:
  - action: edit
    resource: "*"
    effect: allow
---
