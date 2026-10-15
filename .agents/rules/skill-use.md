---
description: "Index-first skill discovery, explicit workflow selection and one-way boundaries."
globs: "*"
alwaysApply: true
trigger: always_on
---

# Skill Use

- Route by intent through `../skills/INDEX`; do not bulk-load every skill.
  Prefer the specific domain workflow and compose only needed lenses.
- Use `skill-author` for governance/skill maintenance and verify official specs
  at https://agentskills.io and https://agents.md. Use `reviewer` for explicit
  review and `code-craft` for non-trivial production implementation, not mechanical
  edits or fast-path utility ceremony.
- Suitability inspection may include the catalog, description or `SKILL.md` body
  without activation. Selection, explicit invocation or beginning workflow actions
  activates the skill. Read the selected body fully, choose its smallest applicable
  track, and fulfill that track's required steps, evidence and deliverables.
- Do not abandon applicable stops mid-workflow to evade a requirement. Missing
  authority, prerequisites, capabilities or ambiguous/conflicting mandatory steps
  block affected work: report honestly and resolve rather than simulate completion.
  Request scoped permission for permission-solvable blockers; do not broaden it.
- Rules may point to skills. Skills must not link back to or depend on governance
  rule files or an installation's instruction bootstrap. Put reusable methods and
  their dependencies inside the skill layer; obey runtime constraints independently.
