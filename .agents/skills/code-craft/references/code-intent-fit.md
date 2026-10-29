---
metadata:
  prototype: "2026-10-23"
  maintenance-review: |-
    Prototype. Validate on actual patch/refactor decisions before claiming
    less rework; a synthetic case or readable rationale is not effectiveness evidence.
---

# Code-intent fit

Use inside initial source inspection when existing behavior could contradict the
requested change—not as an upfront maintainability/SOLID audit. Inputs: original
intent, current path, affected consumers, approved scope and required checks.
Output: a brief diagnosis and justified implementation choice in the existing task.

## Diagnose before compensating

Trace intent → actual behavior/dependencies → mismatch → retained/deleted semantics
→ proof. Read the relevant caller and consequential effects, not just the proposed
patch. Existing tests and abstractions describe current behavior; they can also
encode legitimate undocumented data, domain, safety or consumer constraints.
Discover those constraints rather than either obeying or discarding them by reflex.

- **Patch:** Choose a local correction when it meets intent at the proper existing
  responsibility without concealing the underlying mismatch or expanding scope.
- **Refactor:** Change the conflicting responsibility/design when needed to deliver
  the authorized outcome. Settle consequential direction through the applicable
  proposal/independent-validation/authority path; refactoring is not an automatic
  license for cleanup, redesign or broader effects.
- **Escalate:** Before implementing a workaround, surface unresolved business/data
  meaning, security, retained public consumers, architecture or hard-to-reverse
  effects. Pause only affected work. Use the authorized decision route; ask the
  human for reserved decisions, not every implementation detail.

Classify old behavior/interfaces as preserve or delete; describe replacement where
needed. Approved deletion is not vetoed by stale documentation, obsolete tests or
imagined consumers. Real retained contracts and safety obligations still matter.
Never delete, weaken or bypass existing tests/gates without explicit approval;
report a conflicting test contract instead of quietly changing its meaning.

## Challenge the chosen repair

Ask: “What constraint does this workaround preserve, who requires it, and why is it
still valid?” An adapter can be correct for a real retained boundary; its existence
alone is not a defect. An adapter whose only purpose is keeping approved-retired
behavior alive needs an authorized exception, not a green-test justification.

Show one case that distinguishes intended behavior from the nearest plausible
misunderstanding, with expected and actual results. Name preserved, removed and
replaced behavior, affected consumers, executed proof and critical unknowns.
Missing execution remains UNVERIFIED; tests derived from the patch do not establish
the acceptance contract. Do not infer laziness or bad motives from a shortcut.

If a decision is needed, supply intent versus located code conflict, consequences,
options, recommendation and exact choice in the existing exception handoff.
Otherwise proceed with the settled scoped correction. Keep the separate
post-working-code maintainability assessment; this analysis does not replace it.
