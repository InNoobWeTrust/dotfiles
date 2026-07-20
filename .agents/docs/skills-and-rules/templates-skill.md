# Skill Template

Use this template when creating a new skill. The `description` field in the frontmatter is the harness-facing semantic match string — include trigger phrases and exclusion criteria there. Do NOT duplicate "when to load" information in the skill body.

```markdown
---
name: [skill-name]
description: "[One-sentence summary]. Load for [specific task types]. Activate on [\"trigger phrase 1\", \"trigger phrase 2\"]. Skip for [when NOT to load]."
---

# Skill: [Skill Name]

[Brief intro — 1-2 sentences on what this skill does, expand the frontmatter description with context the agent needs after loading.]

---

## Skill Workflow

This skill has [N] phases. All must be completed.

### Phase 1 — [Name]
[Purpose of this phase.]
[Exact steps to execute.]
[Artifacts to produce.]

### Phase 2 — [Name]
[Purpose.]
[Steps.]
[Artifacts.]

---

## Stop Conditions

[Conditions that MUST halt execution. Include what to do at each stop.]

- **STOP CONDITION:** [condition] → [required action]
- **STOP CONDITION:** [condition] → [required action]

---

## Deliverable

- [ ] [Completion criterion]
- [ ] [Completion criterion]

---

## Design Decision Anti-Patterns

| Temptation | Why It's Wrong | Correct Path |
|---|---|---|
| [Shortcut the AI will try] | [Why it's harmful] | [What to do instead] |

---

## References

- `references/[file].md` — [what it contains, loaded on demand]
```
