---
name: skill-author
description: "Use this skill whenever creating, modifying, editing, auditing, or maintaining skills, rules, or governance files in .agents/. Mandatory whenever editing files in .agents/skills, .agents/rules, or .agents/instructions. Follows official specs from https://agentskills.io and https://agents.md."
---

# Skill Author

Create, modify, and maintain skills/rules governance in `.agents/`.

Official Specs:
- Format & Progressive Disclosure: `references/agentskills-spec.md` (https://agentskills.io)
- AGENTS.md Standard: https://agents.md

Two workflows — choose one first.

| Mode | When | Detail |
|---|---|---|
| **A — Create / Modify** | New skill needed or editing existing skills/rules | `references/workflow-a-create.md` (A1–A6) |
| **B — Audit** | Quarterly / failure review / governance drift | `references/workflow-b-audit.md` (B1–B4) |

Load `references/aci-checklist.md` when designing a new skill, command, prompt interface, or tool-shaped workflow.

Stop / deliverable / anti-patterns: `references/stop-deliverable-antipatterns.md`.

## Workflow A (summary)

1. Validate need (extend existing skill first; not one-offs).
2. Define scope contract (name, description, exclusions, I/O, phases).
3. Design phases, stop conditions, deliverables, anti-patterns.
4. Apply the ACI checklist when the artifact behaves like an interface (`references/aci-checklist.md`).
5. Write `SKILL.md` (YAML frontmatter per https://agentskills.io spec; body under ~150 lines; deep content in `references/`).
6. Register in `INDEX.md` (+ `WIRING.md` if composition).
7. Queue for prototype audit.

## Workflow B (summary)

1. Rule audit table (effectiveness, false positives, gaps).
2. Skill audit table (usage, health, length, lifecycle).
3. Failure review (mistake → rule/skill gap).
4. Maintenance report + next review date. Never fabricate metrics.

## Hard rules

- Load `skill-author` BEFORE making any changes to files in `.agents/`.
- Consult https://agentskills.io and https://agents.md to verify compliance with latest specs.
- Do not invent skills for single-use tasks.
- Do not bulk-load every rule/skill during audits — sample by evidence.
- Progressive disclosure is mandatory for skills (router SKILL + refs; see `references/agentskills-spec.md`).
