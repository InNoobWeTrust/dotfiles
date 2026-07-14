---
name: skill-author
description: "Full lifecycle skill authoring and maintenance: design and write new skills following the documented template, register them, run quarterly audits, review failure patterns, and guide skill evolution (prototype → harden → adopt → maintain → deprecate). Load for \"create a skill\", \"write a new skill\", \"design a skill\", \"add a skill\", \"prototype a skill\", \"audit rules\", \"review skills\", \"maintain .agents/\", \"quarterly audit\", \"failure review\", \"deprecate skill\", or \"evolve rules\". Skip for editing existing skills when no structural changes are needed."
---

# Skill Author

Create and maintain skills/rules governance. Two workflows — choose one first.

| Mode | When | Detail |
|---|---|---|
| **A — Create** | New skill needed | `references/workflow-a-create.md` (A1–A6) |
| **B — Audit** | Quarterly / failure review | `references/workflow-b-audit.md` (B1–B4) |

Stop / deliverable / anti-patterns: `references/stop-deliverable-antipatterns.md`.

## Workflow A (summary)

1. Validate need (extend existing skill first; not one-offs).
2. Define scope contract (name, triggers, exclusions, I/O, phases).
3. Design phases, stop conditions, deliverables, anti-patterns.
4. Write `SKILL.md` (YAML + progressive disclosure; body under ~150 lines; deep content in `references/`).
5. Register in `INDEX.md` (+ `WIRING.md` if composition).
6. Queue for prototype audit.

## Workflow B (summary)

1. Rule audit table (effectiveness, false positives, gaps).
2. Skill audit table (usage, health, length, lifecycle).
3. Failure review (mistake → rule/skill gap).
4. Maintenance report + next review date. Never fabricate metrics.

## Hard rules

- Do not invent skills for single-use tasks.
- Do not bulk-load every rule/skill during audits — sample by evidence.
- Progressive disclosure is mandatory for new skills (router SKILL + refs).
