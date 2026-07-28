# Research

> **Status:** research-phase material — **not battle-tested**.  
> Drafts, experiments, and external-paper mappings. Promote into `project-lifecycle/` or `skills-and-rules/` only after review and adoption.

Progressive disclosure:

```
docs/research/INDEX.md        ← you are here
  └─ <topic>/                 ← topic folder
      └─ <entry>.md           ← load on demand
          └─ details/*        ← deep leaves
```

## Topics

| Topic | What it covers | Read when |
|---|---|---|
| [Agent improvement techniques](./agent-improvement-techniques/agent-improvement-techniques.md) | Karpathy / Anthropic / STAPO / RAPO / T-STAR / SOAR-analog map → skill backlog | Deciding what research to adopt into skills |
| [→ research notes (leaf)](./agent-improvement-techniques/details/agent-improvement-research-notes.md) | Source fidelity, arXiv links, paper summaries | Validating a claim or deepening context |
| [Thoughtworks Radar Vol 34](./thoughtworks-radar-vol34/thoughtworks-radar-vol34.md) | Agent harness, skills, sensors, cautions; quality-tool gaps for Part 2 | Aligning industry radar with skills/quality docs |
| [→ blip catalog (leaf)](./thoughtworks-radar-vol34/details/blip-catalog.md) | Ring + one-line takeaway for agent/quality blips | Looking up a specific Vol 34 item |
| [→ quality gaps for Part 2 (leaf)](./thoughtworks-radar-vol34/details/quality-gaps-for-part2.md) | Mutation, a11y, sensors, CodeScene, metrics gaps | Enriching quality-tooling workshop |

## Promotion rules

- Research entries are **not** authoritative for production agent behavior.
- Battle-tested sections (`skills-and-rules/`, `project-lifecycle/`, `quality-tooling/`) may link here only as optional background, with the research caveat.
- Promotion requires: independent review lens, one accepted use, and a home under a battle-tested section INDEX.
- Formal review process: [maintaining rules and skills](../skills-and-rules/maintaining-rules-and-skills.md).

## Related (battle-tested)

- [Skills & Rules](../skills-and-rules/INDEX.md)
- [Project lifecycle](../project-lifecycle/INDEX.md)
- [Quality tooling](../quality-tooling/INDEX.md)
