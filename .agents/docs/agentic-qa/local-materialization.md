# Local Materialization (This Repo)

> **Caveat banner:** mappings below show how *concepts* appear in current skills.  
> These skills are **incomplete and not battle-tested**. Do not treat them as the industry standard or as proof the mental model is "done."

---

## Concept → skill map (illustrative only)

| Mental-model concept | Current materialization | Maturity note |
|---|---|---|
| Evaluative review | `reviewer` + lenses (incl. `black-box-qa`) | Useful structure; still depends on operator discipline |
| QA orchestration | `web-qa-audit` | Draft operational workflow; evolving contracts |
| Browser mechanics | `cdp-browser-automation` (and similar) | Mechanics capability — not a full QA system |
| Evidence / run cards | `web-qa-audit` protocol refs | Contracts exist on paper; battle-testing is local |
| Materialization planning | `materializer-contract` path | Planning aid — does not own your CI |
| Stakeholder projection | `stakeholder-report-pack` path | Gates designed; not universal org process |
| Evaluator in a loop | `reviewer` + `bounded-iteration` pairing | Pattern present; easy to misuse without HITL |
| Feedback sensors | rules + quality tooling (Part 2) + agent loop | Stronger where repos already have real gates |

Composition sketch lives in `.agents/skills/WIRING.md` under "Web QA Audit" — treat as **wiring for this toolkit**, not curriculum.

---

## How to use this map correctly

1. Learn the [mental model](./mental-model.md) and [pre-agentic foundation](./pre-agentic-foundation.md) first.
2. Use skills as **experiments** that implement a slice of the model.
3. Score your setup with honest maturity dimensions ([trust-and-evidence](./trust-and-evidence.md)).
4. Promote patterns into *your* project only after measured use.
5. Expect skills to change; the foundation concepts change much more slowly.

---

## What this repo deliberately does *not* claim

- Full replacement of human QA organizations
- Certified a11y/security compliance via agent run
- Zero-flake browser automation
- Universal stakeholder report templates for every locale/org
- That black-box heuristic review equals production sign-off

---

## Related battle-tested docs (different concern)

- [quality-tooling](../quality-tooling/INDEX.md) — static/SCA/governance tool fit
- [project-lifecycle code quality gates](../project-lifecycle/code-quality-gates.md) — engineering contract
- [research](../research/INDEX.md) — research-phase only; same caution as skills
