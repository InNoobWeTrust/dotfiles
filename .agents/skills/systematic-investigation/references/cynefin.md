# Cynefin — optional investigation context lens

Use when the situation is uncertain, mixed, or resisting the assumed diagnostic
approach. Skip this lens for an evident deterministic defect. Inputs are the
bounded concern, observed constraints and causal evidence, uncertainty, and action
limits. Output is a provisional posture with evidence, disconfirmers and a next
review point, not a required label or a resolution certificate.

## Framework, not method

Cynefin is a sense-making and decision-support framework, not a diagnostic method
or predictive model. Its principle of **bounded applicability** means an approach
can be valid in one context and wrong in another. The five domains are not
Cartesian quadrants, a difficulty score, or a permanent taxonomy. Situations can
move between domains and one incident can contain differently situated concerns.
Classify the situation, never people, teams or their competence.

Cynefin classifies the situation; it grants no action authority. In a chaotic context, only if the human owner has explicitly authorized the specific containment scope, stabilize minimally within that scope and then reassess; otherwise escalate without acting. Urgency alone is not evidence of chaos. Containment and probes never establish verified resolution.

## Retrieve cues, then challenge the fit

The local [domain catalog](../assets/cynefin-domains.csv) lives at
`assets/cynefin-domains.csv`, resolved from the loaded skill root. Inspect its
header; use an available authorized text or CSV search to retrieve a few rows by
observed cues or keywords, then check `disconfirmers` and `posture`. A search hit
is not evidence that a domain applies. If search is unavailable, use header and
known-ID lookup: `clear`, `complicated`, `complex`, `chaotic`, `confusion`. Do not
install tools, create a store or upload the catalog to perform this lookup.

1. Bound the concern and time window; separate observations from inference.
2. Compare cues and disconfirmers. Missing knowledge alone does not establish
   complexity; an unfamiliar bug may be complicated and amenable to analysis.
3. Select a provisional posture, or remain in confusion and decompose the concern
   into coherent parts while gathering evidence. Do not force a single label.
4. Reassess after new evidence, containment, a probe, or changed constraints. State
   what would change the posture; do not treat today's context as permanent.

## Keep investigation as the owner

For clear concerns, use established practice only after checking its applicability
and evidence; a familiar error string is not sufficient. For complicated concerns,
apply the existing diagnostic protocol and appropriate expertise. 5 Whys, Fishbone,
Iceberg and First Principles remain available within their applicable boundaries;
do not force a single linear root cause when causal factors branch or evidence is
incomplete.

For complex concerns, propose bounded hypothesis probes that reveal patterns
through interaction, without promising predictable outcomes or a final root cause.
For chaotic concerns, use only the authority contract above, then reassess and
resume investigation. Confusion is not chaos: separate concerns and obtain evidence
rather than using it as a license to intervene.

### Probe contract

Before any probe, record concisely in the existing investigation/report:

- **Hypothesis:** proposed mechanism or pattern, strongest relevant alternative,
  and observation that would disconfirm it.
- **Owner and authority:** accountable owner and actual authorization; a diagnostic
  or proposal-only assignment cannot execute an experiment.
- **Limits:** affected surface, permitted changes, time/resource budget and bounded
  downside. If harm cannot be bounded, propose a safer check or escalate.
- **Observation:** baseline where available, signals to collect, and what the
  observations can and cannot establish.
- **Stop/rollback:** thresholds, who stops it, and a feasible rollback or containment
  path. Do not call a probe safe-to-fail without these limits.
- **Review:** when/who reviews results and reassesses posture. Preserve negative
  results; a promising probe is not verified remediation or permission to scale.

If a required capability or permission is missing, return the proposal and exact
gap without acting. Containment reports record specific human authorization,
scope, observations, stop/rollback and next review too; containment is not an
experiment that proves the suspected cause. Durable remediation still requires
causal investigation, evidence, challenge and verification under the main flow.

## Official sources and limits

- [Cynefin](https://cynefin.io/wiki/Cynefin), inspected revision 5860: framework,
  bounded applicability, dynamics, and misconceptions about models/quadrants.
- [Cynefin Domains](https://cynefin.io/wiki/Cynefin_Domains), inspected revision
  5763: constraints, order/complexity/chaos, confusion, practice and liminality.
- [The Cynefin Company overview](https://thecynefin.co/about-us/about-cynefin-framework/):
  decisions and approaches matched to context.

This is a small operational adaptation of those sources, not their full treatment
of liminal areas or a guarantee that an agent's classification is correct. The
framework can be used in prose independently of any diagram syntax or renderer;
no beta diagram is needed or supplied here.
