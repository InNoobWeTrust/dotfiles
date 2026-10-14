# workflow-b-audit

## Workflow B — Audit & Maintain

This workflow produces an audit report using whatever tracking data the organization maintains. The questions and heuristic checks below are generic and do not depend on any specific metrics system. If the organization uses a business analytics account, a custom dashboard, handoff file conventions, or any other tracking approach, substitute those data sources where applicable.

**If no tracking data is available**: Produce a qualitative audit based on available sources (git history, session handoffs, review findings, manual inspection). Document what data was missing and recommend what to start tracking for future quarters. Never fabricate statistics.

**Scope first**: For a targeted drift check, sample only source-linked rules/skills;
do not turn it into a catalog-wide quarterly audit. Compare guidance docs with
executable skill instructions, resolve contradictions against current constraints,
and report what was not inspected. Apply `portability-and-reader-contract.md` to
reusable workflows, including their references and routing pointers.

### Phase B1 — Quarterly Rule Audit

For each rule in the declared audit scope, answer:

1. **Effectiveness**: Has this rule prevented a failure? Check session handoffs, review findings, git history. No evidence means unknown effectiveness, not automatic deprecation.
2. **False positives**: Has this rule blocked correct code? Yes → too strict, recommend softening.
3. **Coverage gap**: New failure pattern not covered? Refine existing guidance first; propose the smallest evidenced correction. Scale formality to recurrence and consequence, responding immediately to evidenced data-loss/security/financial hazards rather than waiting for a frequency quota.
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

For each skill in the declared audit scope, answer:

1. **Usage**: Is this skill still being loaded? If it hasn't been invoked in a full quarter and the task type no longer occurs, candidate for deprecation. Rare use with correct task type → keep.
2. **Quality**: Is the skill producing high-quality output? Check handoffs and review findings. High finding rate → workflow isn't preventing issues.
3. **Completeness**: Is the workflow still correct given codebase changes? New frameworks, tools, patterns?
4. **Length**: Has the skill grown? Justified growth → keep. Bloat → trim. Over 500 lines → move to references/.
5. **Lifecycle stage**: Prototype → Hardening → Team Adoption → Maintenance → Deprecation candidate. What's the next transition?
6. **Reader outcome and portability**: Can the intended user/agent complete the original task without hidden chat or deployment assumptions? Compare before/after first use and a relevant missing-capability/error path; do not confuse source presence with observed effectiveness.

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

Start with completed feedback entries instead of re-investigating each incident.
The [feedback flywheel](../../project-foundation/references/feedback-flywheel.md)
is a human-maintainer checklist: reuse its evidence, or present it to the maintainer
when needed; do not fabricate a maintainer assessment. Aggregate the first detection
source, gap type (routing/workflow/rule/context/tool), smallest correction and
evidence still needed. Keep execution records in memory, not consumer docs.

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
5. **Deprecation candidates**: Rules and skills to mark `[DEPRECATED]` or remove. Mark deprecated in INDEX for one quarter before deletion.
6. **Glossary drift** (if applicable): New terms found that aren't in GLOSSARY.md.
7. **Data gaps**: What tracking data was unavailable and should be collected for the next audit.
8. **Next review date**: Schedule the next audit.

For a targeted audit, a compact source → gap → change → evidence table is enough;
mark uninspected rule/lifecycle metrics as out of scope or unknown. State source
checks separately from executed journeys. Trial methods remain prototypes until
scoped promotion is justified; new wording alone proves neither adoption nor
effectiveness. See the [outcome-review trial](../../../docs/skills-and-rules/end-user-outcome-reviews.md).

---
