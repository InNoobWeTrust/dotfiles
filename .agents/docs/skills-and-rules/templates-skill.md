# Skill Template

Use this template when creating a new skill. The `description` field in the frontmatter is the harness-facing semantic match string — include trigger phrases and exclusion criteria there. Do NOT duplicate "when to load" information in the skill body.

```markdown
---
name: [skill-name]
description: "[One-sentence summary]. Load for [specific task types]. Activate on [\"trigger phrase 1\", \"trigger phrase 2\"]. Skip for [when NOT to load]."
---

# Skill: [Skill Name]

[Brief intro — 1-2 sentences on what this skill does, expand the frontmatter description with context the agent needs after loading.]

## Inputs and capability boundary

[State required inputs, reader assumptions and authority. Discover the current
environment's documented capability; do not require the author's transport,
provider, machine path or local adapter. Declare any product-specific scope.]
[If a capability is unavailable, state the limitation and preserve mandatory stops;
absence is not authorization to install or reconfigure.]
[Cross-domain handoffs state the capability, required inputs, output/evidence,
authority and absence behavior; never require a sibling skill name/path. Keep
essential methods and safeguards here or in bundled resources.]

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

- `references/[file].md` — [existing reusable resource, loaded on demand; remove placeholder before delivery]
```

Before delivery, check the complete directory copied outside the pack, including
templates/scripts/catalogs. Required resources must not escape to sibling skills
or pack docs. Resolve command paths from the loaded bundle root. A sibling rename
must affect only explicit installation/discovery mappings. Reconcile the semantic
diff so no original approval, evidence or safety stop disappears. See
[Portable skill bundles](skill-portability.md).
