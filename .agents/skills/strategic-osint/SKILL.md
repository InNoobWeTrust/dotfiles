---
name: strategic-osint
description: "Use this skill when you need public-source intelligence to shape positioning, messaging, targeting, next actions, or long-term direction. Activate for requests like \"OSINT this person/company/lab\", \"what do they likely care about\", \"how should I position myself\", \"what are the public signals\", or \"use available intel to guide the strategy\". Do not use it for candidate vetting against a JD, private/deceptive investigation, or simple fact lookup with no downstream decision."
---

# Strategic OSINT

Public-signal research for action guidance. Use this when the goal is not just to collect facts, but to convert public evidence into better decisions, sharper positioning, and a more informed next move. Phase detail and report template: `references/phases.md`.

## Phase map

1. Objective framing (decision to inform, target entity, constraints).
2. Public-signal collection (official pages, bios, publications, repos, press, org context).
3. Signal synthesis (priorities, incentives, gaps, likely preferences, timing).
4. Strategic translation (what to emphasize, de-emphasize, test, or avoid).
5. Action brief (messaging, next actions, risks, confidence, open questions).

## Hard rules

- Public and lawful sources only; do not cross privacy boundaries.
- Separate **observed evidence** from **inference** from **recommendation**.
- Never fabricate intent, vacancies, budgets, internal politics, or preferences.
- Optimize for decision utility, not trivia volume.
- Prefer official sources first; use secondary sources to triangulate, not to substitute.
- Name confidence and caveats explicitly when translating signals into strategy.

## Default deliverable

Provide a concise brief with:

1. **Objective recap**
2. **Public evidence found**
3. **Inferred priorities / incentives**
4. **Strategic implications**
5. **Recommended next actions**
6. **Exact wording or positioning ideas** (if messaging is part of the task)
7. **Risks, caveats, and confidence**

## Stop conditions

- Stop and ask for narrowing if the target, decision, or desired artifact is unclear; if clarification is unavailable, return a short scope-gap note instead of broad research.
- Stop if the task drifts into private, deceptive, or personally invasive investigation.
- Stop if evidence is too thin to support directional advice; return unknowns instead of stretching.
- Stop and reroute if the real task is candidate vetting rather than target-positioning research.

## Deliverable checklist

- [ ] The decision or action being informed is explicit.
- [ ] Evidence is separated from inference.
- [ ] Official/public sources are prioritized.
- [ ] Strategic recommendations flow from the evidence.
- [ ] Caveats and unknowns are stated.
- [ ] Messaging suggestions avoid overclaiming.

## Anti-patterns

| Temptation | Why Wrong | Correct Path |
|---|---|---|
| Dump every fact found | Creates noise, not direction | Extract only signals that change the decision |
| Write as if inference were fact | Overstates confidence and can mislead action | Label observed vs inferred vs recommended |
| Overfit to one source | Single-source bias distorts priorities | Triangulate with official and secondary sources |
| Use OSINT to justify a prechosen conclusion | Confirmation bias | Let evidence challenge the original plan |
| Give generic advice after detailed research | Wastes the intel gathered | Convert findings into concrete positioning and next steps |
| Slip into private surveillance | Violates boundaries and trust | Stay on public professional signals only |

## References

- `references/phases.md` — detailed workflow, source ladder, and output template
