---
name: systematic-investigation
description: Use this skill when debugging, troubleshooting, or investigating why something is broken or behaving unexpectedly. Applies structured frameworks (5 Whys, Fishbone, First Principles, OODA) to find root causes before attempting fixes. Also use for pre-mortems, assumption challenges, and architectural decisions that need rigorous analysis. Activate when the user is stuck in circles, facing recurring failures, or asks "why does this keep happening" — even if they frame it as "just fix this bug."
---

# Systematic Investigation

Structured problem-solving — not guess-and-check.

```
DEFINE → ANALYZE → SOLVE & ACT → CHALLENGE
```

**Iron law:** no fixes without root-cause investigation first.

---

## Framework selection

| Situation | Use | Phase | Deep ref |
|---|---|---|---|
| Vague symptom | 5W → 5 Whys | Define → Analyze | `references/define-and-debug.md`, `root-cause-frameworks.md` |
| Multiple causes | Ishikawa | Analyze | `root-cause-frameworks.md` |
| Recurring / systemic | Iceberg | Analyze | `root-cause-frameworks.md` |
| Stuck on assumptions | First Principles | Analyze | `root-cause-frameworks.md` |
| Live incident | OODA | Solve | `solve-and-challenge.md` |
| Iterative improvement | PDCA | Solve | `solve-and-challenge.md` |
| Stakeholder report | A3 | Solve | `solve-and-challenge.md` |
| Multi-concern mess | Kepner-Tregoe SA | Define | `define-and-debug.md` |
| Technical bug / test fail | Debug protocol (4 sub-phases) | All | `define-and-debug.md` |

Load **one** deep ref at a time. Elicitation second pass: `references/elicitation-methods.md`. Origins: `references/origins.md`.

---

## Mandatory flow

1. **Define** — 5W statement: *"[Who] experiences [What] in [Where] since [When], causing [impact]."* Load `define-and-debug.md` if tangled or technical.
2. **Analyze** — pick method from table; load `root-cause-frameworks.md`. Confirm root cause with **evidence**.
3. **Governance capture** (if AI/process gap) — note rule/skill gap for handoff / skill-author audit (advisory).
4. **Solve** — 5 Hows or OODA/PDCA; load `solve-and-challenge.md`. Fix root cause, not symptom. One change at a time.
5. **Challenge** — pre-mortem / adversarial vectors; PROCEED | REVISE | RETHINK. Optional: elicitation methods.
6. **Report** — use `references/report-template.md` when handing off or documenting.

---

## Debug red flags (STOP)

- "Quick fix now, investigate later"
- Multiple fixes at once; 3+ failed fixes without re-analysis
- Proposing solutions before tracing data flow
- "Just try X and see"

---

## Done checklist

- [ ] Problem defined clearly (5W)
- [ ] Root cause confirmed with evidence
- [ ] Solution addresses root cause
- [ ] Solution challenged (Phase 4)
- [ ] Concrete action + verification + prevention plan
- [ ] Report filled when stakeholder/handoff needs it
