# Feedback Flywheel Checklist

> Read when: closing a non-trivial agent session, running a monthly failure review, or auditing why a skill/rule did not prevent a mistake.
>
> Audience: human maintainer. If an agent loads this during an audit, it should present the checklist to the user or maintainer, not self-assess its own failure.

---

## Purpose

The harness (skills + rules + sensors) should improve every time it is used. This checklist turns individual session outcomes into concrete skill/rule changes. It is lightweight: answer the questions, record the result, and apply the fix.

---

## When to run

- After any session that required significant human correction.
- After a skill loaded but the agent still took a wrong path.
- During the monthly failure review (`.agents/docs/skills-and-rules/maintaining-rules-and-skills.md`).
- Quarterly, alongside the rule/skill audit.

Completed flywheel entries should feed into the Monthly Failure Review. The monthly review aggregates and trends them; it does not need to re-investigate every case from scratch.

---

## The checklist

### 1. What happened?

In one sentence, what did the agent do wrong or miss?

```
Failure: _________________________________________________
Task type: _______________________________________________
Skill loaded (if any): ___________________________________
Rule that should apply (if any): _________________________
```

### 2. Where was the first feedback?

What caught the problem first — a sensor, a rule, a human, or nothing?

| Caught by | Implication |
|---|---|
| Formatter / linter / type checker / test | Sensor worked; agent may need to run it earlier or interpret it better. |
| Rule or skill stop condition | Governance worked; check if it was ignored or ambiguous. |
| Human review | Governance gap — nothing in the harness flagged it. |
| Nothing / shipped to production | Critical gap — add a rule or sensor. |

### 3. What kind of gap is this?

| Gap type | Fix location | Example |
|---|---|---|
| **Skill routing** — wrong skill loaded, or no skill existed | `skills/INDEX.md` or new skill | Task needs architecture review but only `code-craft` was loaded. |
| **Skill workflow** — right skill, but a phase is missing or unclear | Skill `references/` | `code-craft` skipped verification step. |
| **Rule missing** — no rule covered the failure | `.agents/rules/` or `AGENTS.md` | Agent staged secrets because no secret-scan rule was active. |
| **Rule ignored** — rule exists but agent did not follow it | Rule wording or stop condition | Rule was too long and buried in context. |
| **Context gap** — agent lacked the right information | Memory capture or skill discovery | Prior decision was not recalled. |
| **Tool overlap** — agent chose the wrong tool | ACI checklist / tool design | Two read tools caused the agent to use the expensive one. |

### 4. What is the smallest change that prevents recurrence?

Prefer one-line rule additions or skill-reference clarifications over new skills.

```
Proposed change: _________________________________________
Location: ________________________________________________
Evidence needed to close: ________________________________
```

### 5. Did we capture it?

- [ ] Short-term memory entry written if the lesson affects future sessions.
- [ ] Rule or skill file updated.
- [ ] If the change is experimental, tagged with `pilot` or `review-next`.

---

## Lightweight templates

### For a short-term memory entry

```markdown
---
kind: short-term
branch: <branch>
topic: <skill-or-rule-name>
status: done
created: <ISO-8601>
updated: <ISO-8601>
agent: <name>
consolidated: false
tags: [feedback-flywheel, <skill-or-rule>]
---

## Failure
<one sentence>

## Root cause gap
<skill / rule / context / tool>

## Fix applied
<file + change>

## Evidence to watch
<what would prove this is fixed>
```

### For a rule/skill patch

```markdown
## Feedback flywheel update (YYYY-MM-DD)
- Trigger: <session or review>
- Gap: <type>
- Change: <one-line summary>
- Evidence: <test, audit, or observation that validates it>
```

---

## Anti-patterns

| Temptation | Why it fails |
|---|---|
| Blame the model | The harness is supposed to compensate for model limits. |
| Add a new skill for every failure | Bloats the INDEX; extend existing skills first. |
| Record lessons only in chat | Chat is not durable; the next agent will not see it. |
| Fix without evidence | You cannot tell if the fix worked in the next review. |

---

## Related

- `.agents/docs/skills-and-rules/maintaining-rules-and-skills.md` — quarterly audit and monthly failure review
- `.agents/skills/skill-author/references/workflow-b-audit.md` — formal skill/rule audit workflow
- `.agents/skills/memory/SKILL.md` — short-term / long-term capture and consolidation
- Research: `.agents/docs/research/thoughtworks-radar-vol34/` — "feedback sensors" and "feedback flywheel" themes
