# Skill Lifecycle: From Prototype to Team Standard

### Stage 1: Prototype (1-2 uses)

Write the SKILL.md as a checklist, not a polished document. Use it yourself for 2 tasks. Track:
- What steps did the AI skip?
- What steps took too long?
- What steps produced no value?

Include valid `name`/`description` frontmatter and register the skill in `skills/INDEX`
from creation (`skills/WIRING` when composition applies); discovery is not deferred
until adoption. Treat use counts as review prompts, not proof of effectiveness.

### Stage 2: Hardening (3-5 uses)

Add stop conditions for the steps the AI skipped. Add anti-pattern examples for the shortcuts the AI tried. If a step produced no value in any of the 5 uses, remove it.

### Stage 3: Team Adoption (5+ uses)

Share the skill with the team. This is when you add:
- A refined `description` field with tested triggers and exclusions
- Validated routing in `skills/INDEX` and composition in `skills/WIRING`
- Examples of good and bad outputs

### Stage 4: Maintenance

Review skills quarterly. For each skill, ask:
- Is it still used? (check session logs for skill loads)
- Are the stop conditions still relevant? (have new failure patterns emerged?)
- Is it too long? (skills grow over time — trim fat)

### When to Deprecate a Skill

Deprecate when:
- The skill's methodology has been absorbed into project rules (no longer needs explicit loading)
- The task type no longer occurs
- Two skills overlap so much that merging is better

Don't delete deprecated skills immediately — mark them `[DEPRECATED]` in INDEX.md for one quarter so team members still using them see the notice.

---
