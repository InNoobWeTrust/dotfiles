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
