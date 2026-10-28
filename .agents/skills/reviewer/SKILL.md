---
name: reviewer
description: "Use this skill when the user asks you to review, check, audit, challenge, or QA any artifact — code, specs, architecture, config, docs, infrastructure, user-facing application behavior, or investment/portfolio assessment memos. Routes to specialized sub-lenses (black-box-qa, code-quality, design-rigor, adversarial, security, edge-case, editorial, investment-memo) based on what's being reviewed. Keep this skill evaluative. For investment allocation or opportunity memos, obtain an authoritative investment assessment and its assumptions as input before review; authoring and investment decisions remain outside this evaluator."
---

# Reviewer

Hybrid review: **direct** technical lenses or **delegated** multi-perspective / audit. Before reviewing, read only the warranted standard, deep, or security section of [Review working principles](references/working-principles.md). Lazy-load sub-reviewers — never load all at once.

---

## Gate 1 — Author bias

**If you created or edited the artifact → MUST delegate** all reviews. Self-review with sub-reviewer files is not independent judgment.

Trivial exception: &lt;10 lines, no structural impact → skip review rather than fake self-review.

## Gate 2 — Self-grounded verification

Any in-context review must state its criteria and run a disconfirming check **before** judging the artifact; then verdict PASS/FAIL/UNVERIFIED with evidence. Criteria come from the artifact's own acceptance contract; a disconfirming check is one concrete attempt to break the finding (counter-example, alternate reading, or missing-evidence test) recorded alongside the verdict.

In research terms, Reviewer is the repo's **evaluator** half of an evaluator–optimizer loop. It must score against declared criteria, not vibe-check or rewrite the rubric after seeing the artifact.

Apply [source-first, two-way review](references/core-review.md) within the existing review: judge requirements and source evidence before the author's explanation, check both unsupported outcomes and unjustified changes, then reconcile. Spend optional checks where a missed failure would matter most; never omit mandatory gates. Record the brief provisional verdict in the existing review response/checkpoint, not a new ledger. If the explanation was already seen, disclose that source-first isolation was unavailable rather than simulate it.

For an assigned cold-reader / “Goldfish” pass, use [cold-reader techniques](references/cold-reader.md): optional implementation-ready explainback or scoped approved-contract drift, not another universal phase. Require fresh-context evidence and neutral inputs; retain all existing review gates and small-task exceptions.

## Gate 3 — Contract-Bounded Phase Review

Before relying on a new/changed automated reviewer or reducing scrutiny based on
it, use [Reviewer calibration](references/calibration.md). This is a reviewer-change
check, not an extra phase on every artifact; missing calibration cannot justify
relaxing established controls.

When the artifact belongs to phased delivery, obtain the populated delivery
contract or active packet before
judging it. Require that input to identify outcome, must-ship/may-defer/never-defer requirements, scope/prerequisites, acceptance evidence, hard invariants and recovery/compatibility obligations, approved behavior and consumer interfaces, current unit/authority/stops, and review/corrective-pass budget. Apply the supplied contract; do not invent its lifecycle,
classification, budgets, compromise schema, or trajectory table here. If phased delivery applies and the contract is missing, stop and request it. Choose formal review artifacts proportionately to coordination need per that contract.

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

Trace the changed contract through affected callers, types, imports, tests and configuration, including untouched consumers. Review the change's causal impact, not just the edited lines.
- Anchor each finding to a modified or added root-cause line in the active changeset; cite an untouched consumer as evidence when that change breaks it.
- **Hard Prohibition**: Do not report unrelated, pre-existing legacy defects or smells discovered during tracing.
- For an explicitly scoped artifact audit rather than a changeset review, the named artifact is the review boundary; do not invent a diff requirement or expand into adjacent legacy cleanup.

For applicable code/architecture changes, including Quick reviews, inspect where changed responsibilities belong and the actual affected import, package, external-dependency and runtime-wiring edges independently of supplied maps. Trace consequential paths through untouched consumers and return paths, including error/effect flow; check new dependency direction and combined cycles where structure changed. If responsibilities, boundaries, dependencies and wiring are unchanged, state that and keep the check local. Review depth and line count do not waive an affected boundary check. Missing graph/source evidence is scoped UNVERIFIED, not permission for unrelated cleanup or a whole-repository audit.

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
- **Code style:** Use [the agreed style contract and source catalog](references/style-guides.md), not a new reviewer preference; project tooling and existing anti-noise gates win.

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
4. **Evaluator for a loop** — when used in a phased-delivery loop, consume the supplied task/packet and predeclared acceptance rubric; score the named artifact `PASS`, `FAIL`, or `UNVERIFIED` with evidence so the authorized orchestrator can choose the next step. Do not author the rubric, implement fixes, or convert a PASS into user acceptance.
