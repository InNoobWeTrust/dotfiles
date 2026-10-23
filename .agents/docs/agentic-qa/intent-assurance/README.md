---
audience: Technical owners and maintainers working with coding agents
purpose: Review intent, consequential exceptions and proof without rereading every change
scope: Public industry findings, general assurance principles and this pack's experimental materialization
---

# Intent assurance: review the decisions and proof

**The goal is less owner review plus repair—not more agent reports.** Keep original
intent separate from mutable implementation plans, check the inputs before reuse,
and ask for evidence that distinguishes the right result from a plausible wrong one.

[Read the complete findings and operating guide (PDF)](main.pdf) ·
[Editable source](main.typ) · [Section index](../INDEX.md)

## What changes

- **Before work:** Identify governing intent, affected scope and source status.
  Existing code/tests and stale documents do not automatically become requirements.
- **During work:** Resolve code–intent mismatches before patching over them. Choose
  a justified local fix or scoped refactor; surface consequential unknowns early.
- **Before handoff:** Independent conformance and critical behavior checks return
  one exception-first card: intent versus result, deviations, 1–2 distinguishing
  probes with expected/actual proof, and the exact unresolved decision.
- **Over time:** Calibrate reviewers on defective and clean cases; diagnose
  nonconverging repairs, preserve recovery controls and measure owner effort/rework.

**Owner probe:** “Show a case that distinguishes what I asked for from the nearest
plausible misunderstanding—and demonstrate which behavior was delivered.”

## Findings, not guarantees

[Anthropic's Claude Code team](https://claude.dev/blog/solving-code-review-at-anthropic/)
reports moving most reading to machines, not removing assurance. Its controls include
verified AI findings, enforced checks, risk-sensitive human review, reviewer evaluations
and staged recovery. Its throughput/revert figures are first-party observations,
not proof that this pack or every team can safely remove human review.

[OpenAI's agent-first team](https://openai.com/index/harness-engineering/) emphasizes
a short knowledge map, machine-enforced boundaries and runnable evidence. The guide
turns these public accounts into bounded review questions and working methods.

**Limits:** General review questions are not an application audit. This materialization
does not prove lower owner effort, intent-drift prevention or runtime compliance.
No merge/deploy rights, new risk-tier policy, recurring job or MCP is installed.

## Where enforcement lives

The existing [skill wiring](../../../skills/WIRING) maps responsibilities to source
integrity, code-intent fit, team delivery, reviewer calibration and foundation
checks. Rules retain the authority/evidence floor; methods stay in on-demand
bundle-local references. [Foundation context review](../../../skills/project-foundation/references/context-integrity.md)
checks what affected sources mean and whether they govern; a reachable link alone
does not establish either.

**Next validation:** Try one real capability and measure review + repair time,
misunderstandings caught early, rework/escaped failures and reviewer noise. Preserve
null results; do not relax existing controls merely because a synthetic case passes.
