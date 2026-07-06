---
name: skill-author
description: "Full lifecycle skill authoring and maintenance: design and write new skills following the documented template, register them, run quarterly audits, review failure patterns, and guide skill evolution (prototype → harden → adopt → maintain → deprecate). Load for \"create a skill\", \"write a new skill\", \"design a skill\", \"add a skill\", \"prototype a skill\", \"audit rules\", \"review skills\", \"maintain .agents/\", \"quarterly audit\", \"failure review\", \"deprecate skill\", or \"evolve rules\". Skip for editing existing skills when no structural changes are needed."
---

# Skill Author

Full lifecycle skill authoring and maintenance — from first design to deprecation. Write new skills following the documented template, register them in the routing system, and maintain the entire .agents/ governance layer through quarterly audits and failure reviews.

---

## Skill Workflow

This skill has 2 major workflows. Choose one based on the task:

- **Workflow A — Create a New Skill** (Phases A1–A6): Design, write, register.
- **Workflow B — Audit & Maintain** (Phases B1–B4): Audit rules, audit skills, review failures, produce maintenance report.

---

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

## Workflow B — Audit & Maintain

This workflow produces an audit report using whatever tracking data the organization maintains. The questions and heuristic checks below are generic and do not depend on any specific metrics system. If the organization uses a business analytics account, a custom dashboard, handoff file conventions, or any other tracking approach, substitute those data sources where applicable.

**If no tracking data is available**: Produce a qualitative audit based on available sources (git history, session handoffs, review findings, manual inspection). Document what data was missing and recommend what to start tracking for future quarters. Never fabricate statistics.

### Phase B1 — Quarterly Rule Audit

For every rule file in `rules/`, answer:

1. **Effectiveness**: Has this rule prevented a failure? Check session handoffs, review findings, git history. No evidence → candidate for deprecation.
2. **False positives**: Has this rule blocked correct code? Yes → too strict, recommend softening.
3. **Coverage gap**: New failure pattern not covered? Observed in practice → recommend new rule.
4. **Abstraction level**: Too specific (dead) or too general (false positives)? Recommend: keep, soften, tighten, lift, or deprecate.

**Format**:
```markdown
## Rule Audit — Q[1-4] 20XX

| Rule | Effective? | False Positives? | Coverage Gap? | Level? | Action |
|---|---|---|---|---|---|
| code-quality.md | Yes — caught 3 silent swallows | No | No | Good | Keep |
| tdd.md | Yes — enforced across tasks | No | No | Good | Keep |
```

### Phase B2 — Skill Audit

For every skill in `skills/`, answer:

1. **Usage**: Is this skill still being loaded? If it hasn't been invoked in a full quarter and the task type no longer occurs, candidate for deprecation. Rare use with correct task type → keep.
2. **Quality**: Is the skill producing high-quality output? Check handoffs and review findings. High finding rate → workflow isn't preventing issues.
3. **Completeness**: Is the workflow still correct given codebase changes? New frameworks, tools, patterns?
4. **Length**: Has the skill grown? Justified growth → keep. Bloat → trim. Over 500 lines → move to references/.
5. **Lifecycle stage**: Prototype → Hardening → Team Adoption → Maintenance → Deprecation candidate. What's the next transition?

**Format**:
```markdown
## Skill Audit — Q[1-4] 20XX

| Skill | Stage | Still Active? | Health | Current? | Length | Action |
|---|---|---|---|---|---|---|
| code-craft | Maintenance | Yes | Good | Yes | OK | Keep |
| new-skill | Prototype | 2 invocations | N/A | Yes | OK | Move to Hardening |
```

### Phase B3 — Monthly Failure Review

Review AI output that needed significant human correction:

1. **What was the AI's mistake?**
2. **Was there a rule that should have prevented it?** Why didn't it work?
3. **Was there no rule?** Should there be?
4. **Could a skill have prevented this?** Does such a skill exist?

**Data sources**: Git reflog (revert commits), review findings, handoff files (Blockers, Open Questions), and any other tracking artifacts the organization maintains.

**Format**:
```markdown
## Failure Review — [Month] 20XX

### Failure #1: [Title]
- **Mistake**: [what happened]
- **Existing rule?**: [rule] — should have caught this, but [reason it didn't]
- **New rule needed?**: [yes/no/proposed text]
- **Skill gap?**: [skill] could add [step] to prevent this
```

### Phase B4 — Produce Maintenance Report

Consolidate into an actionable report:

1. **Executive summary**: Top 3 actions recommended.
2. **Rule changes proposed**: From Phase B1 with recommended actions.
3. **Skill changes proposed**: From Phase B2 with lifecycle transitions.
4. **New rules/skills proposed**: From Phase B3 failure review.
5. **Deprecation candidates**: Rules and skills to mark `[DEPRECATED]` or remove. Mark deprecated in INDEX.md for one quarter before deletion.
6. **Glossary drift** (if applicable): New terms found that aren't in GLOSSARY.md.
7. **Data gaps**: What tracking data was unavailable and should be collected for the next audit.
8. **Next review date**: Schedule the next audit.

---

## Stop Conditions

- **Workflow A, Phase A1 fails**: Skill not needed. Propose extending existing skill or simpler approach.
- **Workflow A, Phase A2 unclear**: Scope can't be defined — ask for clarification.
- **Workflow B, insufficient data**: If audit data sources (metrics, logs, usage tracking) are not accessible, produce a qualitative audit using available artifacts (git history, handoff files, manual inspection). Document what data was missing and recommend what the org should start tracking. Never fabricate statistics.

---

## Deliverable

**For Workflow A (Create)**:
- [ ] Skill need validated (A1)
- [ ] Skill scope defined (A2)
- [ ] Workflow outline designed (A3)
- [ ] SKILL.md written with all 7 sections (A4)
- [ ] INDEX.md updated (A5)
- [ ] WIRING.md updated if composition exists (A5)
- [ ] Queued for prototype audit (A6)

**For Workflow B (Maintain)**:
- [ ] Rule audit table with recommendations (B1)
- [ ] Skill audit table with lifecycle transitions (B2)
- [ ] Failure review log for past month (B3)
- [ ] Consolidated maintenance report (B4)
- [ ] Data gaps and tracking recommendations documented
- [ ] Next review date documented

---

## Design Decision Anti-Patterns

| Temptation | Why It's Wrong | Correct Path |
|---|---|---|
| "I'll start writing the SKILL.md immediately" | Designing the workflow skeleton first catches structural problems before prose | Complete Phases A1-A3 first |
| "This skill needs 15 phases to cover every edge case" | Too many phases overwhelm the AI and get skipped | Cap at 10 phases; move edge cases to references/ |
| "I'll skip the anti-pattern table — the phases are clear enough" | The anti-pattern table catches the AI when it's trying to take shortcuts | Every skill needs at least 5 anti-patterns |
| "I'll propose 10 new rules based on hypothetical risks" | Rules should come from real failures, not imagination | Only propose rules for failures that actually occurred |
| "This skill has zero uses — it must be bad" | Some skills are specialized and used rarely but correctly | Check if the task type occurs rarely. Zero task occurrences = skill wasn't needed, that's fine |
| "No failures found — the audit is done" | Absence of documented failures ≠ absence of failures | Check git history for revert commits and patches |
| "I'll deprecate every low-usage skill to clean up" | A lean catalog is good, but removing specialized skills loses institutional knowledge | Deprecate only when the task type no longer occurs; keep rare-but-valuable skills |
| "I'll reorganize all skill files to follow a new convention" | Format churn creates merge conflicts and breaks cross-references | Propose reorganization as a separate, dedicated task |

---

## References

- `INDEX.md` — Current skill catalog (Phase A5/B2 target)
- `WIRING.md` — Composition registry (Phase A5 target)
