# What Metrics Management Should Look At

Management doesn't need raw linter noise. They need system-level indicators.

AI makes vanity **coding throughput** (LOC generated, PR count) especially dangerous: it rewards volume and punishes careful review. Prefer delivery outcomes and **collaboration quality** with agents.

### Metrics worth tracking

| Metric | What it tells you |
|---|---|
| New code quality gate pass rate | Is new code meeting the standard? |
| Critical/high dependency findings | Are we shipping known risk? |
| Secrets incidents | Is hygiene getting worse? |
| Coverage on new code | Does the new change have evidence? |
| Mutation score on critical modules (optional) | Are tests actually discriminating, or hollow? |
| Accessibility gate on UI surfaces | Are we shipping inaccessible UI? |
| Complexity / duplication / hotspot trend | Is technical debt growing where change concentrates? |
| Time to remediate high-risk findings | Is the team handling risk effectively? |
| AI cost vs. quality trend | Is AI increasing velocity without breaking quality? |
| **DORA** (lead time, deploy frequency, CFR, MTTR, **rework rate**) | Is faster generation becoming better delivery — or more fix-forward? |
| **First-pass acceptance** / iteration cycles per task | How often is agent output usable with minimal rework? |
| Review burden / failed builds from agent PRs | Is the human loop absorbing agent noise? |

Track collaboration-quality signals at **team** level, not as individual scorecards.

### Metrics not to overuse

- LOC (human or AI) as a personal KPI
- PR count / “AI commits” as productivity
- raw issue counts compared across teams with different contexts
- complexity score used to judge an individual author
- vanity dashboard metrics that aren't tied to any decision

### Related

- [Agent feedback sensors](./agent-feedback-sensors.md) — harness-side quality loop  
- [Extended evidence tools](./extended-evidence-tools.md) — mutation, a11y, hotspots  
- Research: [Radar Vol 34](../research/thoughtworks-radar-vol34/thoughtworks-radar-vol34.md) (DORA, collaboration quality, throughput caution)

---
