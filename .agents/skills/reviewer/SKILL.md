---
name: reviewer
description: "Use this skill when the user asks you to review, check, audit, challenge, or QA any artifact — code, specs, architecture, config, docs, infrastructure, user-facing application behavior, or investment/portfolio assessment memos. Routes to specialized sub-lenses (black-box-qa, code-quality, design-rigor, adversarial, security, edge-case, editorial, investment-memo) based on what's being reviewed. Keep this skill evaluative. For investment allocation or opportunity memos use investment-memo lens; authoring uses investment-assessment skill first."
---

# Reviewer

Hybrid review: **direct** technical lenses or **delegated** multi-perspective / audit. Lazy-load sub-reviewers — never load all at once.

---

## Gate 1 — Author bias

**If you created or edited the artifact → MUST delegate** all reviews. Self-review with sub-reviewer files is not independent judgment.

Trivial exception: &lt;10 lines, no structural impact → skip review rather than fake self-review.

## Gate 2 — Self-grounded verification

Any in-context review must follow `rules/self-grounded-verification.md`: criteria + disconfirming test **before** judging the artifact; then PASS/FAIL/UNVERIFIED with evidence.

In research terms, Reviewer is the repo's **evaluator** half of an evaluator–optimizer loop. It must score against declared criteria, not vibe-check or rewrite the rubric after seeing the artifact.

## Gate 3 — Contract-Bounded Phase Review

When the artifact belongs to phased delivery, obtain the populated Delivery
Contract from `../../rules/phased-delivery.md` or its active packet before
judging it. Apply that canonical contract; do not reproduce its lifecycle,
classification, budgets, compromise schema, or trajectory table here.

Every finding must include evidence, severity, and exactly one canonical
classification. Reviewers recommend a classification and remediation; the
orchestrator alone decides scope, acceptance, correction, or trajectory.
Review only the declared acceptance evidence and contracted surface. Future
scale, elegance, preference, or hypothetical flexibility cannot expand scope.

Use the contract's review budget. After a fix, verify only failed acceptance
items and the changed surface—not a fresh broad review. Budget exhaustion
forbids broader review unless evidence identifies a Never Defer blocker.
Preserve all risk-specific lenses and independent-review requirements: they may
be used only when predeclared or when an evidenced Never Defer blocker requires
escalation.

## Gate 4 — Anti-Context-Bleed (Diff Boundary Invariant)

Context exploration tools (`file_read`, `code_search`, `grep_search`, `view_file`) exist solely to clarify the diff under review (checking callers, types, or imports).
- **Hard Prohibition**: Reviewers are strictly forbidden from reporting findings on external or legacy code outside the diff.
- A finding is valid ONLY if it anchors directly to lines modified or added within the active changeset.
- If an external smell or bug is spotted in untouched code, discard it from the review report (do not distract the PR author with pre-existing technical debt).

## Diff Preparation & Scoping (Preflight, Bundles, Gating)

When reviewing changesets or PRs:
1. **Preflight Filter**: Drop binary files, secret paths (`.env*`, `*.pem`, `*.key`), and noisy vendor dirs (`vendor/`, `node_modules/`, `target/`).
2. **Metadata Bundling**: If files > 1, group into semantic bundles (&le; 10 files) by path and line counts (`+X / -Y`). Never dump raw diffs into clustering.
3. **Threshold-Gated Planning (50/100 Rule)**:
   - If single file &ge; 50 changed lines OR bundle &ge; 100 changed lines: execute read-only Plan Phase (checklist of invariants & failure hypotheses; no tool mutations).
   - Otherwise: proceed directly to review lenses.

## Finding Output Schema (Snippet-Anchored)

Never guess or hallucinate line numbers. Every reported finding MUST include a verbatim snippet:
- **path**: `<relative file path>`
- **severity**: `CRITICAL | HIGH | MEDIUM | LOW`
- **category**: `bug | security | performance | maintainability | test | style | doc`
- **existing_code**: `<exact code snippet from diff hunk>`
- **suggestion_code**: `<concrete replacement snippet or empty>`
- **content**: `<crisp explanation of root defect, failure scenario, and fix>`

---

## Direct vs delegate (summary)

| Situation | Approach |
|---|---|
| You are author | Delegate always |
| Audit / independent judgment | Delegate (strongest independent reviewer available) |
| Multi-stakeholder personas | Delegate separately per persona |
| Pure technical, you are **not** author | Direct + sub-reviewer refs |
| No independent delegated reviewers + you are author | Do not self-review; ask human / external tools |

Full decision tree, delegated-reviewer detection, synthesis: `references/delegation/framework.md`.  
Persona prompts: `references/delegation/personas.md`.  
Expanded direct/delegation steps: `references/direct-and-delegation-detail.md`.  
Fallback + review modes + quick start: `references/fallback-modes-quickstart.md`.  
Worked scenarios: `references/examples/delegation-scenarios.md` (load only if needed).

---

## Direct mode — routing (load only matching lenses)

| Artifact | Load (in order) |
|---|---|
| Code / PR | code-quality → design-rigor → adversarial → security → edge-case-hunter |
| Web frontend feature / UI PR | black-box-qa → code-quality → design-rigor → adversarial → security |
| Responsive / mobile UI | black-box-qa → editorial |
| Accessibility audit | black-box-qa → editorial |
| Browser QA / automation plans | black-box-qa → adversarial |
| Regression suite / test materialization plans | black-box-qa → adversarial |
| Specs / PRD / TRD | pragmatic-triage → adversarial → editorial |
| Architecture | pragmatic-triage → code-quality → design-rigor → adversarial → security |
| Docs / prose | editorial |
| Config / infra | security → edge-case-hunter |
| Bug fix / incident | design-rigor → code-quality → adversarial → edge-case-hunter |
| API contracts | code-quality → design-rigor → adversarial → security → edge-case-hunter |
| Skills / commands | adversarial → editorial |
| Investment memo / portfolio allocation / position sizing | investment-memo → adversarial → editorial |
| Bond / credit subset of investment memo | investment-memo → adversarial |
| Delegated review / audit / scanner output | findings-skeptic → pragmatic-triage |

Paths: `references/sub-reviewers/<name>.md`.

- **Quick:** first lens only. **Deep:** all listed. Aggregate by severity and phase-aware disposition with file:line evidence.
- **File-targeted micro-rules:** For file-specific failure modes (Go, TS, Python, Workflows, SQL, manifests), consult `references/file-rules.md`.

| Lens | Axis |
|---|---|
| black-box-qa | user-visible behavior, journeys, responsive/a11y/browser QA |
| pragmatic-triage | complexity justification, probability × impact, Ostrich algorithm |
| findings-skeptic | cross-validation of review/audit/scanner findings, false-positive detection |
| adversarial | assumptions, decisions |
| code-quality | structure, smells, AI laziness |
| design-rigor | designed vs grown; root cause |
| security | threats, secrets, auth |
| edge-case-hunter | boundaries, null paths |
| editorial | prose clarity |
| investment-memo | rails, regime, role-of-money, multi-asset sizing, tax/fee net, left-tail budget; credit waterline when credit present |

---

## Delegation mode (short)

1. Pick audit / multi-persona / specialized pattern (`framework.md`).
2. Isolate personas (`personas.md`) — one agent per hat.
3. Synthesize: CRITICAL → HIGH → MEDIUM → LOW; call out conflicts and trade-offs.

---

## Modes of use

1. **Explicit** — user asked for review.
2. **Self-review before present** — delegate (author bias).
3. **Proactive** — flag structural/security/assumption issues mid-conversation when not in hot-fix/throwaway mode.
4. **Evaluator for a loop** — when paired with `bounded-iteration`, score the artifact named in `TASK.md` against the predeclared rubric and return `PASS`, `FAIL`, or `UNVERIFIED` so the next optimizer pass has grounded feedback.
