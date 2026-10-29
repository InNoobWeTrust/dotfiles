---
name: decision-support
description: Consult an existing decision-support capability for meaningful choices among plausible options, autonomous next steps, recommendations before asking the user, and worker continue-versus-return triage. Use proactively when trade-offs or uncertainty matter; skip trivial deterministic choices. Harness- and provider-independent; advisory output does not replace evidence, user authority, mandatory stops, domain workflows or independent review.
metadata:
  lifecycle: "prototype"
  created: "2026-10-15"
  review-after: "2026-11-15"
  maintenance-review: |-
    Prototype: audit after representative primary and worker uses, including an error
    case; review by the metadata date. Do not infer adoption or effectiveness from
    registration alone.
---

# Decision Support

Use an existing decision-support capability to sharpen a bounded choice, not to outsource
responsibility. This is a cross-domain consultation, not ideation, evidence
collection, a worker launch, or a substitute for a real team or independent review.

## 1. Frame the choice

- Establish the goal, observed facts, unknowns, constraints, authority owner and
  plausible alternatives. Gather missing decision-relevant evidence first.
- Skip deterministic or obvious choices. Do not turn every action into a call.
- Apply hard safety, scope and approval boundaries **before** considering options.
  An unsafe or unauthorized action is not an alternative to score.
- For a user-owned choice, prepare a recommendation; consultation never supplies
  the user's preferences or approval.

## 2. Discover and consult an existing capability

Inspect the current harness's available capabilities and their documented contracts.
A suitable solution may be a native decision tool, an already configured integration,
or another authorized existing interface. Do not assume a transport, provider,
tool name, schema or installation path. Use the discovered interface as documented;
do not create a service or launch a worker solely to provide consultation.
Availability in the primary's harness does not imply availability in a worker's harness.

Supply the goal, evidence, uncertainty and authority boundary explicitly; do not
assume the capability inherits chat, repository or tool context. Frame comparable
neutral alternatives and the decision criteria in its supported input format.
Batch related questions only when supported. Respect its documented cost, data
handling, concurrency and timeout limits. Do not send
secrets, unnecessary personal data or raw private transcripts.

## 3. Decide within authority

Consultation never substitutes for the eligible proposal, original-source
validation or applicable authority under the active direction-eligibility policy.

- Inspect the documented success/error result and any returned advice or estimates. Check the suggested option
  against evidence and constraints; reject unsupported or disallowed suggestions.
- **Autonomous primary:** apply the active direction policy and applicable
  authority; consultation informs but does not make an ineligible primary the
  decision-maker. When decision-support is the authority, apply its documented
  output mechanically within the supplied alternatives; do not reinterpret the
  question after seeing the answer. Reject hard-constraint violations and return
  to the proposer/validator rather than substitute another option. Record the
  confirmed choice and rationale in existing task context, not a new decision log.
- **Before asking the user:** explain the practical trade-off and recommend an
  option with evidence and remaining uncertainty. Do not present probabilities
  as calibrated risk, proof or pressure to agree.
- **Worker:** use consultation when genuinely uncertain between an authorized
  bounded next check and returning current evidence to the primary. Missing
  authority, mandatory proof, an unsafe operation or a contract defect still
  requires return/stop; no score can waive it. Include the chosen next action and
  relevant uncertainty in the normal receipt, not raw model output.

If unavailable or failed, state that limitation and use another authorized route
or block affected consequential work; ineligible ordinary judgment is not a fallback.
Preserve mandatory stops; do not loop,
install, reconfigure, escalate permissions or silently select another provider.

## Output

Return a clear choice/recommendation, its evidence-based reason, remaining
uncertainty and the next authorized action. Distinguish observed evidence from
the advisory estimate. No separate file or raw consultation transcript is needed.

## Examples

| Situation | Action |
|---|---|
| Harness exposes a native decision tool | Use its documented contract; no external integration is required |
| Harness exposes an authorized decision integration | Use that interface without assuming its schema applies elsewhere |
| Two compatible rollout approaches differ in rollback cost | After eligible proposal/validation, consult; the applicable authority decides and the primary records and executes within the settled boundary |
| User must choose latency versus budget | Consult to sharpen a recommendation; explain and ask the user |
| Worker can run one safe targeted check or return partial findings | Consult if the trade-off is unresolved; primary retains scope ownership |
| Test deterministically identifies a missing required argument | Fix within scope without consulting |
| Worker needs unauthorized network access | Return the blocker; do not ask the model to grant access |
