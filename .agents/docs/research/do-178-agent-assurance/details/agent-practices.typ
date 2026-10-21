= Transfer the principles, not aviation bureaucracy <practices>

The useful local question is whether a review connects requested behavior, actual changes and sufficient observations to a justified conclusion. Aircraft failure classifications, certification roles and coverage obligations do not transfer wholesale to nondeterministic agents. The mechanisms below are local research proposals, not findings established by the aviation sources.

== Start from what the setup already does

Before this work, the setup already required criteria derived from requirements, separate reviewers for applicable work, revision-bounded evidence and explicit unresolved outcomes. It also required checking an action's intended result rather than treating tool success as completion. The opportunity was to improve how those controls are applied, not to invent an absent assurance system.

#table(
  columns: (1fr, 1.7fr),
  table.header([*Assurance principle*], [*Agent-workflow interpretation*]),
  [Requirements first], [Derive checks from the user's cumulative request and applicable safety constraints, not solely from the delivered artifact.],
  [Bidirectional tracing], [Ask both what remains unsupported and what changed without justification.],
  [Meaningful independence], [Let the reviewer assess raw sources before being anchored by the author's interpretation.],
  [Controlled evidence], [Limit conclusions to the observed target and conditions; assess relevant changes before reusing a result.],
  [Consequence-linked rigor], [Direct discretionary effort toward consequential failure paths without reducing mandatory checks.],
)

== A: review in both directions

*Request → result:* which requested outcome remains unsupported, contradicted or untested where testing is required? This catches omissions that disappear when a review follows only the author's summary.

*Change → justification:* which changed behavior or side effect lacks a requirement, necessary implementation rationale or safety justification? This catches unjustified additions without assuming that every implementation detail must appear literally in the user's wording.

A private helper needed to preserve a public interface can be justified derived work. Enabling telemetry while changing a retry default is a different behavioral change and needs its own justification. Use the existing review response; no requirement ledger or unrelated legacy cleanup is needed.

*Hypothesis and falsifier:* these two directions should reduce accepted omissions and unjustified changes compared with current review at matched effort. No improvement—or increased rejection of justified work—would undermine that proposed benefit.

== B: judge sources before the author's narrative

+ *First view:* supply the cumulative requirements, applicable constraints, artifact or action observations and all essential raw facts. Defer the author's interpretation, not facts needed to decide correctly.
+ *Provisional judgment:* record a brief source-based view in the existing response or checkpoint. A private reasoning transcript is neither required nor requested.
+ *Reconciliation:* read the author's explanation, investigate differences and revise only when the evidence warrants it.

Use the existing reviewer where possible. If the narrative was already read, is embedded in the source, or cannot be separated, disclose that limitation rather than claim blinding. A fresh context or different provider is not proof of uncorrelated error or aviation-grade independence.

*Hypothesis and falsifier:* changing information order may reduce anchoring on an author's plausible story. No reduction in accepted defects, or more blocking of clean work, would undermine the benefit. The local experiment exercised a fresh-worker relay, not same-session anchoring reduction; see @evidence.

== C: direct optional checks toward consequences

Reserve every mandatory safety, authority, contract, independent-review and existing quality-gate check first. Within the remaining authorized budget, prefer checks likely to expose consequential failures—especially those difficult to reverse or unlikely to be observed before harm. An unclear boundary needs inspection before it can be treated as low consequence.

#table(
  columns: (1fr, 1.65fr),
  table.header([*Example*], [*Useful additional check*]),
  [Tenant data export], [A synthetic two-tenant case for cross-tenant leakage],
  [Deletion scope], [An authorized disposable dry run checking sibling paths],
  [Refund rounding], [A negative half-cent boundary, not another positive example],
  [Help-text typo], [Inspect the affected sentence, rather than unrelated money or deletion paths],
)

These examples prioritize checks, not permission to execute harmful workloads. Use authorized disposable reproductions rather than live privacy, deletion or financial hazards. Do not assign official aviation A–E labels to agent tasks or let a risk estimate waive a mandatory gate.

*Hypothesis and falsifier:* consequence-directed optional checks should expose more consequential errors within the same budget. No detection benefit, wasteful escalation on clean tasks, or misclassification of important failures would challenge that claim.

== Keep ideation attached to its causal question

The research-ideation skill now asks for a visible chain:

#figure(
  block(width: 100%, inset: 12pt, fill: rgb("edf3f7"), radius: 4pt)[
    #align(center)[
      *Source principle* → *Intervention* → *Mechanism* \
      ↓ \
      *User-relevant outcome* → *Disconfirming observation*
    ]
  ],
  caption: [A relevance check for a hypothesis, not evidence that its mechanism works.],
)

Separate a source's causal principles from contingent examples, formats and tooling. When a leaf detail dominates, ask why it is causally necessary and whether a simpler intervention tests the same idea. After null results, revisit the hypothesis rather than adding bookkeeping or increasingly elaborate prompts.

Do not discard necessary measurement detail in the name of abstraction. A bacterial assay's dilution factor and detection limit are essential to interpreting colony counts; an archive-naming convention usually is not. First-principles stories remain conjectures until tested, and contrary evidence must survive a persuasive analogy.

*Operational placement:* the existing reviewer skill and its delegation guidance reference these review practices; the research-ideation entry, tournament and proposal template carry the drift check. They add no tool, ledger, mandatory reviewer or approval gate. Their implemented status does not establish their effectiveness.
