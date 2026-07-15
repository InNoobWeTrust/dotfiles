---
name: reviewer
description: "Multi-lens review orchestrator for code, specs, architecture, config, docs, and infrastructure. Hybrid execution: direct technical review using sub-reviewer references, or delegate to independent agents/workers for multi-perspective, audit, or specialized reviews. Sub-lenses: code-quality, design-rigor, adversarial, security, edge-case, editorial. Activate on \"review\", \"check\", \"audit\", \"challenge\", \"QA\", or any explicit review request."
---

# Reviewer

Hybrid review: **direct** technical lenses or **delegated** multi-perspective / audit. Lazy-load sub-reviewers — never load all at once.

---

## Gate 1 — Author bias

**If you created or edited the artifact → MUST delegate** all reviews. Self-review with sub-reviewer files is not independent judgment.

Trivial exception: &lt;10 lines, no structural impact → skip review rather than fake self-review.

## Gate 2 — Self-grounded verification

Any in-context review must follow `rules/self-grounded-verification.md`: criteria + disconfirming test **before** judging the artifact; then PASS/FAIL/UNVERIFIED with evidence.

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
