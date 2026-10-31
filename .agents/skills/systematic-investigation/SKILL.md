---
name: systematic-investigation
description: "Use this skill when debugging, troubleshooting, or investigating why something is broken or behaving unexpectedly, including slowness, poor scaling, stalled workers and scaling regressions. Applies structured frameworks (5 Whys, Fishbone, First Principles, OODA) to investigate causes before durable fixes, with optional Cynefin context triage. Also use for pre-mortems, assumption challenges, and architectural decisions that need rigorous analysis. Activate when the user is stuck in circles, facing recurring failures, or asks \"why does this keep happening\" — even if they frame it as \"just fix this bug.\""
metadata:
  cynefin-review: "Prototype lens, 2026-10-31; official-source and source-level checks only, live efficacy unverified. Review after 1–2 real uses."
---

# Systematic Investigation

Structured problem-solving — not guess-and-check. Before diagnosing, read [Diagnostic working principles](references/working-principles.md#diagnosis); proposed fixes and actually verified remediation must remain distinct.

```
DEFINE → ANALYZE → SOLVE & ACT → CHALLENGE
```

**Iron law:** no durable fixes without root-cause investigation and supporting evidence first. Explicitly authorized containment and bounded hypothesis probes are not fixes or verified resolution; leave their causal status unresolved.

**Inputs/outputs:** use the reported symptom, expected behavior, evidence and action limits to return a supported diagnosis and verification evidence, or a clearly unresolved handoff. Missing access or authority blocks the affected action, not honest reporting.

## Optional context triage

When context is uncertain or mixed, load [Cynefin](references/cynefin.md) to choose an appropriate investigative posture, not to classify every bug. Search [domain cues](assets/cynefin-domains.csv) by the observed conditions; inspect disconfirmers before choosing. Unknown does not mean complex; urgent does not mean chaotic. Routine deterministic defects can go straight to diagnosis. Resolve all resource paths from this skill's root.

---

## Framework selection

| Situation | Use | Phase | Deep ref |
|---|---|---|---|
| Vague symptom | 5W → 5 Whys | Define → Analyze | `references/define-and-debug.md`, `references/root-cause-frameworks.md` |
| Multiple causes | Ishikawa | Analyze | `references/root-cause-frameworks.md` |
| Recurring / systemic | Iceberg | Analyze | `references/root-cause-frameworks.md` |
| Stuck on assumptions | First Principles | Analyze | `references/root-cause-frameworks.md` |
| Live incident | OODA | Solve | `references/solve-and-challenge.md` |
| Iterative improvement | PDCA | Solve | `references/solve-and-challenge.md` |
| Stakeholder report | A3 | Solve | `references/solve-and-challenge.md` |
| Multi-concern mess | Kepner-Tregoe SA | Define | `references/define-and-debug.md` |
| Technical bug / test fail | Debug protocol (4 sub-phases) | All | `references/define-and-debug.md` |
| Slowness / poor scaling / stalled workers | Critical-path and repeated-work diagnosis | Define → Analyze | [Performance diagnosis](references/performance-diagnosis.md) |

Load **one** deep ref at a time. Elicitation second pass: `references/elicitation-methods.md`. Origins: `references/origins.md`.

---

## Mandatory flow

1. **Define** — 5W statement: *"[Who] experiences [What] in [Where] since [When], causing [impact]."* Load `references/define-and-debug.md` if tangled or technical.
2. **Analyze** — pick an applicable method; load `references/root-cause-frameworks.md` for causal analysis. Confirm causal claims with **evidence** before durable remediation; retain multiple causes or unresolved hypotheses where warranted. A complex context may need a bounded probe rather than a forced linear root cause.
   Before promoting a consequential conclusion or recovering failed work, read [Scope-bounded evidence and recovery](references/evidence-and-recovery.md).
3. **Governance capture** (if AI/process gap) — note the rule/skill gap for an authorized guidance-maintenance audit (advisory).
4. **Solve** — 5 Hows or OODA/PDCA; load `references/solve-and-challenge.md`. Durable fixes address evidenced causes, not symptoms. One change at a time. For emergency containment before diagnosis, follow the human-authorized scope and unresolved-status path in `references/define-and-debug.md`; otherwise escalate without acting.
5. **Challenge** — pre-mortem / adversarial vectors; PROCEED | REVISE | RETHINK. Optional: elicitation methods.
6. **Report** — use `references/report-template.md` when handing off or documenting.

---

## Debug red flags (STOP)

- "Quick fix now, investigate later" presented as resolution; containment without specific human authorization
- Multiple fixes at once; 3+ failed fixes without re-analysis
- Proposing durable fixes before tracing data flow
- "Just try X and see"

---

## Done checklist

- [ ] Problem defined clearly (5W)
- [ ] Status distinguishes verified remediation from unresolved diagnosis, containment or probes
- [ ] For durable remediation: causal explanation confirmed with evidence and solution addresses it
- [ ] For containment/probes: authority, limits, observations, stop/rollback and next review recorded; no resolution claim
- [ ] Proposed intervention challenged (Phase 4), if one is offered
- [ ] For remediation: concrete action + verification + prevention plan; for unresolved work: bounded findings and next permitted check/review
- [ ] Report filled when stakeholder/handoff needs it
