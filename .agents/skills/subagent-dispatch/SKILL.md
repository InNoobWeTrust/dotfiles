---
name: subagent-dispatch
description: "Construct a precise, structured delegation prompt before every subagent launch. Use whenever you are about to delegate work to a background agent, run a task in parallel, or spawn a worker. Injects scope constraints, a structured output contract, obstacle reporting, and allowed-action boundaries directly into the input prompt to compensate for generic or unconfigured subagent descriptions. Activate on: 'delegate this', 'run this in parallel', 'use the research agent', 'background task', 'spawn a worker', 'launch a subagent', 'hand this off'."
---

# Subagent Dispatch

**When:** immediately before launching any subagent / background worker.  
**Constraint:** you usually cannot edit the worker’s system prompt — put intelligence in the **delegation input**.

---

## Decision gate

> Does intermediate work matter to the main thread?

| Answer | Action |
|---|---|
| No — need result, not journey | **Delegate** |
| Yes — each step depends on prior discovery | **Keep in main thread** |

**Delegate:** exploration that would clutter context; independent review; persona/tone tasks; clean-room TDD implementation after tests written in main.  
**Do not delegate:** tightly coupled multi-step diagnosis; cases where you need full raw tool output in main (except clean-room TDD loops).

---

## Four pillars (all inside the prompt)

1. **Precise scope** — exact deliverable + explicit out-of-scope; ≤ ~500 lines pasted context.
2. **Structured output** — numbered sections + `TASK_COMPLETE` done signal.
3. **Obstacle reporting** — force listing of workarounds / env quirks (or NONE).
4. **Allowed actions** — READ / EDIT / RUN / FORBIDDEN lists (soft contract; pair with harness permissions when available).

Full pillar text, domain findings templates, and allowed-action examples:  
`references/pillars-and-templates.md`

Copy-paste full prompt skeleton + anti-patterns + receive protocol:  
`references/prompt-template-and-anti-patterns.md`

---

## Minimal output contract (always include)

```
## 1. Objective Recap
## 2. Findings
## 3. Obstacles Encountered  (or NONE)
## 4. Confidence & Caveats
## 5. Done Signal
TASK_COMPLETE
```

---

## Preflight (before launch)

- [ ] Decision gate says delegate
- [ ] Scope + out-of-scope written
- [ ] Output contract included
- [ ] Allowed / forbidden actions declared
- [ ] Stop conditions stated
- [ ] Context budget reasonable

After return: scan for `TASK_COMPLETE`, read obstacles, treat missing sections as incomplete.
