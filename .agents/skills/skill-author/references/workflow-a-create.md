# workflow-a-create

## Workflow A — Create a New Skill

### Phase A1 — Validate Need for a New Skill

1. **Does an existing skill already cover this?** Check `skills/INDEX.md` — could this be handled by extending an existing skill with a new `references/` file?

2. **Does this task type repeat frequently?** A skill is warranted when:
   - The task type repeats 3+ times per sprint
   - The task has multiple phases that must be executed in order
   - Doing the task well requires methodology not obvious from the codebase alone
   - The cost of doing the task poorly is high

3. **Is this NOT a one-off?** Do NOT create a skill for one-off tasks, tasks describable in a single sentence, or tasks already covered by an existing skill.

**STOP CONDITION**: If any answer is "no," propose extending an existing skill or using a general-purpose approach.

### Phase A2 — Define Skill Scope

Write the contract before the body:

1. **Name**: Lowercase, kebab-case, unique.
2. **Purpose**: One sentence — what does this skill do?
3. **Trigger phrases**: 5-8 phrases users might say (in quotes).
4. **Exclusion criteria**: When should this skill NOT be loaded?
5. **Inputs**: What does the skill need to start?
6. **Outputs**: What does the skill produce?
7. **Estimated phases**: 3-10 is typical.

**Deliverable**:
```
SKILL SCOPE
===========
Name              : [kebab-case]
Purpose           : [one sentence]
Triggers          : ["trigger 1", "trigger 2", ...]
Exclusions        : [when NOT to load]
Inputs            : [what's needed]
Outputs           : [what's produced]
Estimated phases  : [N]
```

### Phase A3 — Design the Workflow

Design each phase before writing prose:

1. **Phase list**: Name + one-sentence purpose per phase. Sequential order.
2. **Stop conditions**: 2-5 gates where execution must halt.
3. **Deliverable checklist**: 5-10 completion criteria.
4. **Anti-patterns**: 5-10 shortcuts the AI will try, with why wrong + correct path.

**Format**:
```
WORKFLOW OUTLINE
================
Phase 1 — [Name]: [Purpose. Steps. Artifacts.]
...
STOP CONDITIONS:
- [condition] → [action]
DELIVERABLES:
- [ ] [criterion]
ANTI-PATTERNS:
| Shortcut | Why Wrong | Correct Path |
|---|---|---|
```

### Phase A4 — Write SKILL.md

Write the file following the documented template:

1. **YAML frontmatter**: `name`, `description` (2-5 sentences with trigger phrases AND exclusion criteria). Use `\"` to escape internal quotes. Do NOT duplicate description content in the skill body.

2. **Intro paragraph**: 1-2 sentences expanding the frontmatter with post-loading context.

3. **Workflow phases**: One section per phase. Purpose, exact steps, artifacts. Mark mandatory explicitly.

4. **Stop conditions section**: Every condition that halts execution.

5. **Deliverable checklist**: Markdown checkboxes.

6. **Anti-pattern table**: 5-10 rows (Temptation, Why Wrong, Correct Path).

7. **References section**: Related docs, skills, or reference files (even if they don't exist yet — they're contracts).

**Length guideline**: Keep SKILL.md under 500 lines. Move deep content to `references/`. Move content to references when it's only needed for variants, is implementation detail rather than methodology, changes frequently, or is a sub-workflow.

### Phase A5 — Register the Skill

1. **Add to INDEX.md**: New row in the routing table:
   ```
   | `skill-name` | cost | Use When: [from trigger phrases] | Do Not Use When: [exclusion criteria] |
   ```
   Cost: low (simple), medium (multi-phase with tooling), high (multi-agent/external).

2. **Add to WIRING.md**: If the skill composes with others, add composition patterns and handoff points.

3. **Create directory**: `skills/<skill-name>/` with `SKILL.md`, optionally `references/` and `assets/`.

### Phase A6 — Queue for Audit

Mark the new skill for maintenance rotation:
- **Lifecycle stage**: Stage 1: Prototype (1-2 uses). Track first usage in whatever audit system the org maintains.
- Register the creation date as a known point for the next quarterly audit cycle.

---
