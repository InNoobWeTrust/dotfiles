---
name: reviewer
description: "Use this skill when the user asks you to review, check, audit, challenge, or QA any artifact — code, specs, architecture, config, docs, or infrastructure. Routes to specialized sub-lenses (code-quality, design-rigor, adversarial, security, edge-case, editorial) based on what's being reviewed. Also activate for security reviews of auth flows, input validation, or secrets handling, and for edge-case analysis of parsers, validators, or branching logic."
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
| Specs / PRD / TRD | adversarial → editorial |
| Architecture | code-quality → design-rigor → adversarial → security |
| Docs / prose | editorial |
| Config / infra | security → edge-case-hunter |
| Bug fix / incident | design-rigor → code-quality → adversarial → edge-case-hunter |
| API contracts | code-quality → design-rigor → adversarial → security → edge-case-hunter |
| Skills / commands | adversarial → editorial |

Paths: `references/sub-reviewers/<name>.md`.

- **Quick:** first lens only. **Deep:** all listed. Aggregate by severity with file:line.

| Lens | Axis |
|---|---|
| adversarial | assumptions, decisions |
| code-quality | structure, smells, AI laziness |
| design-rigor | designed vs grown; root cause |
| security | threats, secrets, auth |
| edge-case-hunter | boundaries, null paths |
| editorial | prose clarity |

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
