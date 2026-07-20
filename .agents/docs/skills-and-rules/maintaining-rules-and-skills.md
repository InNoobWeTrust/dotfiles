# Maintaining Rules and Skills Over Time

### The Quarterly Audit

Every quarter, audit your `.agents/` directory with these questions:

**For rules:**
1. Has this rule prevented a failure in the last quarter? (If not, it might be obsolete)
2. Has this rule caused false positives — blocking correct code? (If yes, soften it)
3. Is there a new failure pattern that isn't covered by any rule? (If yes, add a rule)
4. Is this rule still at the right level of abstraction? (Rules that are too specific become dead; rules that are too general cause false positives)

**For skills:**
1. Usage: How many sessions loaded this skill?
2. Quality: What reviewer findings followed skill-loaded tasks?
3. Completeness: Is the workflow still correct given changes to the codebase?
4. Length: Has the skill grown? If so, is the growth justified?

### The Monthly Failure Review

Once a month, review AI output that needed significant human correction. For each instance:

1. What was the AI's mistake?
2. Was there a rule that should have prevented it? (If yes, why didn't it work?)
3. Was there no rule? (If not, should there be?)
4. Could a skill have prevented this? (If yes, does such a skill exist?)

This review is the primary driver of rule and skill evolution.

### The Newcomer Test

Every 6 months, have someone unfamiliar with the project attempt an AI-assisted task using only:
- `AGENTS.md` for context
- `.agents/rules/` for constraints
- `.agents/skills/INDEX.md` for task routing

Observe where they struggle. Those are the gaps in your agent infrastructure.

---
