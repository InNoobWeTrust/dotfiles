# AI-Augmented Development Documentation

> **Who this is for:** Engineering leads, new team members (human or AI), and management — anyone setting up or working within an AI-augmented development workflow.

This directory is organized with **progressive disclosure**:

```
docs/README.md          ← you are here (always-loaded map)
  └─ <section>/INDEX.md ← section router
      └─ <entry>.md     ← topic entry (load on demand)
          └─ details/*  ← deep leaves (load only when linked)
```

Wiki docs outside `slides/` are **English-first** (agent-searchable). Slides keep EN/VI pairs for delivery.

---

## Sections

| Section | What it covers | Read when |
|---|---|---|
| [skills-and-rules](./skills-and-rules/INDEX.md) | Designing rules & skills, failure patterns, templates | Creating or evolving rules/skills |
| [project-lifecycle](./project-lifecycle/INDEX.md) | Onboarding, daily AI work, gates, CI/CD, security, maturity | Setting up or joining a project |
| [quality-tooling](./quality-tooling/INDEX.md) | Quality layers, baselines, Sonar positioning, comparisons | Choosing quality tools |
| [research](./research/INDEX.md) | Research-phase material — **not battle-tested** | Investigating external patterns before promoting |
| [slides](./slides/INDEX.md) | Marp decks (EN/VI) | Presenting workshops |

---

## Recommended Reading Order

### Setting up AI-augmented development for the first time

1. [project-lifecycle → Guiding philosophy](./project-lifecycle/guiding-philosophy.md)
2. [project-lifecycle → Architecture](./project-lifecycle/architecture-of-governance.md)
3. [project-lifecycle → Adaptation checklist](./project-lifecycle/adaptation-checklist.md)
4. [skills-and-rules → Essential rules](./skills-and-rules/essential-rules.md)
5. [skills-and-rules → Designing skills](./skills-and-rules/designing-skills.md)

### Joining an existing project

1. [Onboarding: first 30 minutes](./project-lifecycle/onboarding-first-30-minutes.md)
2. [Working with AI agents](./project-lifecycle/working-with-ai-agents.md)
3. [Onboarding: first week](./project-lifecycle/onboarding-first-week.md)
4. [Failure patterns catalog](./skills-and-rules/failure-patterns-catalog.md) — when debugging AI output

### Engineering lead maintaining rules/skills

1. [Failure → rule evolution](./skills-and-rules/failure-pattern-evolution.md)
2. [Maintaining over time](./skills-and-rules/maintaining-rules-and-skills.md)
3. [Skill lifecycle](./skills-and-rules/skill-lifecycle.md)

### Management visibility

1. [Management visibility](./project-lifecycle/management-visibility.md)
2. [Project evolution](./project-lifecycle/project-evolution.md)
3. [Quality tooling → Management metrics](./quality-tooling/management-metrics.md)

### Workshop delivery

1. [slides/INDEX.md](./slides/INDEX.md)
2. [quality-tooling](./quality-tooling/INDEX.md) as the speaker deep-dive

---

## Key Concepts at a Glance

| Concept | One-liner | Where |
|---|---|---|
| **Rules** | Non-negotiable constraints on every task | [skills-and-rules](./skills-and-rules/why-rules-and-skills.md) |
| **Skills** | Full workflows loaded on demand | [skills-and-rules](./skills-and-rules/why-rules-and-skills.md) |
| **AI as junior engineer** | Fast junior who needs explicit guidance | [project-lifecycle](./project-lifecycle/guiding-philosophy.md) |
| **Quality layers** | Format → lint → type → test → risk → governance | [quality-tooling](./quality-tooling/mental-model.md) |
| **Two loops** | Inner (dev/agent) vs governance (CI/leadership) | [quality-tooling](./quality-tooling/mental-model.md) |
| **Memory** | Short-term notes + long-term consolidation | [working with AI](./project-lifecycle/working-with-ai-agents.md) |
| **Research map** | External patterns → skill backlog (research-phase) | [research](./research/agent-improvement-techniques/agent-improvement-techniques.md) |

---

## Size budget (progressive disclosure)

| Layer | Soft | Hard |
|---|---|---|
| This README section rows | 20 | 30 |
| Section INDEX rows | 40 | 60 |
| Entry file | 8 KB | 16 KB |
| Leaf file | 12 KB | 24 KB |
