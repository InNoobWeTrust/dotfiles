# Source-first, two-way review

Use inside an already-required review, not as an additional reviewer or approval gate. Inputs are the original cumulative requirements, authorized artifacts/actions, necessary raw observations and the author's separately supplied explanation; output is the existing evidence-linked verdict. This is an agent-workflow experiment inspired by assurance principles, not an aviation-compliance procedure.

## 1. Form a source-based judgment

The delegator supplies requirements, artifact access, scope, safety constraints and all necessary raw observations first; defer only the author's interpretation or completion narrative. The reviewer derives criteria, inspects the source and records a short provisional verdict with supporting or missing evidence in the existing response/checkpoint. Do not withhold requirements, safety facts, relevant design decisions or evidence provenance to manufacture blinding.

Then read the author's explanation and reconcile it against the source-based judgment. Change the verdict when new evidence warrants it; state the decisive evidence, not a private reasoning transcript. If both must arrive in one message, or the explanation is embedded in the artifact/already seen, disclose the limitation and perform the two-way checks anyway—do not claim isolated judgment. This changes information order, not the number of mandatory reviewers or the available facts.

## 2. Check both directions

- **Request → result:** Which requested outcome remains unsupported, contradicted or untested where a check is required?
- **Change → justification:** Which changed behavior or side effect lacks a requirement, necessary derived rationale or authorized safety purpose?

Necessary implementation details need not repeat the user's wording. Distinguish a justified helper/refactor from scope expansion; ask for missing justification rather than automatically rejecting every unmentioned line. Keep findings within the change's causal boundary, including affected consumers, without importing unrelated legacy defects. No traceability ledger is required.

## 3. Allocate optional checks by consequence

Within the affected scope, check whether stale/current-descriptive sources or code
were promoted into requirements. Challenge unexplained compatibility/compensating
layers against approved intent and real retained consumers; do not demand refactors
by style preference. Report executed, failed, skipped and unavailable proof per
critical claim/revision, including unjustified whole-delivery claims from partial
results. A duplicate-text hit alone is not an evidenced contradiction.

First reserve every mandatory safety, authority, contract, independent-review and existing quality-gate check. Within the remaining authorized budget, prefer checks that could expose consequential failures, especially those difficult to reverse or unlikely to be noticed before harm; explain the top choice in one sentence. A small edit or reassuring author narrative is not evidence of low consequence.

Use concrete consequences—lost data, incorrect money movement, disclosed information, broken compatibility—not aviation A–E labels or invented numerical risk scores. If consequence is uncertain, inspect the affected boundary before treating it as low risk; missing budget/capability for a required check stays UNVERIFIED or blocked. Do not perform risky live actions to test a hazard: use an authorized disposable reproduction or return the gap. Optional prioritization cannot waive a mandatory check or expand the contracted scope.

## Prototype and limits

**2026-10-21:** A = two-way questions; B = source-first judgment/reconciliation; C = consequence-directed optional effort. These mechanisms are implemented, not presumed effective; compare each with the current workflow on clean and defective cases at matched budgets. Record false acceptance, unnecessary blocking and verification effort separately, including null results, before claiming benefit; reassess after 1–2 real uses. A source-only walkthrough or synthetic exercise does not establish production effectiveness.
