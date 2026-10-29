---
name: game-theory
description: "Use when outcomes depend on other people's choices: why won't they cooperate, will people adopt it, who can veto, how will others respond, is that promise credible, or will this incentive backfire. Apply game theory to incentives, coordination, bargaining, information, power and institutional change alongside the owning domain skill. Not for mechanical or actor-free technical tasks, evidence-free motive attribution, or harmful manipulation."
metadata:
  prototype: "2026-10-22"
  review-after: "1–2 real uses or 2027-01-22"
  review-criteria: "Review after 1–2 real uses for useful predictions, unsupported attribution, missed actors and unnecessary analytical overhead."
---

# Game Theory

A technically sound proposal can fail because people lack a reason, capacity or
credible expectation to act on it. Explain that mechanism, then look for an
arrangement in which useful behavior makes sense without requiring heroism.
Game theory models interdependent choices; it is not a complete theory of society,
a substitute for domain knowledge, or proof that everyone is selfish or rational.

## Contract and proportionality

For general-purpose agents; no economics credential, solver or special tool required.
**Inputs:** the decision or puzzling outcome, available observations, affected people,
known rules and action limits. **Output:** a concise, evidence-labelled causal account,
likely responses, options, distributional effects and a discriminating next check.
Return this to the owning workflow; analysis does not decide its values or authorize action.

**Short path:** frame the observation → identify relevant actors and their likely
response → compare a rival explanation and name a check. A few sentences often suffice.
If no relevant choice depends on another actor's behavior, skip this skill.
Expand through the five steps below only as complexity and consequence require.

Use supplied evidence first, then an authorized native capability or integration
if needed. With no retrieval, keep explanations hypothetical and name missing evidence;
do not invent motives, install tools or turn missing data into a confident prediction.

## 1. Frame the outcome, not the villain

State what happened versus what is desired, compared with which baseline (including
no change), over what time horizon. Separate observations, interpretations and unknowns.
Distinguish physical limits, technical/economic conditions, institutional rules and
value judgments. “Cannot,” “will not,” and “cannot authorize” predict different remedies.
Ask what function the status quo serves before calling it either optimal or corrupt.

## 2. Reconstruct the game people actually face

Identify decision-makers, implementers, beneficiaries, cost-bearers and non-deciders.
For the pivotal actors, establish feasible choices, rewards/losses, beliefs and private
information, timing, resources, outside options, and ability to commit or block a change.
Check actual approval, coalition and agenda rules; an organization is not one mind.
Include mission, fairness, identity, trust, status and liability alongside money.
Keep observed incentives separate from inferred preferences; do not invent utility scores.
An actor may lack attention, competence or resources rather than be strategically opposed.

## 3. Explain the mechanism and trace responses

Use only relevant patterns. [Mechanisms](assets/mechanisms.csv) uses
`id,use_when,avoid_when,perspective,reference`; resolve paths relative to this skill.
Retrieve at most three candidates by the actual need in `id/use_when/perspective`,
inspect exclusions, then read the linked section. Use available CSV-aware search,
targeted text lookup or a bounded ordinary read; no search service is required.
If lookup is unavailable, use the short path or a named section of
[the mechanism reference](references/mechanisms.md), not an invented match.

Trace **change → actor's feasible response → others' response → resulting outcome**.
Include exit, delay, workarounds, learning and feedback when they could change the answer;
stop at a useful horizon rather than imagining endless moves. Identify which link is uncertain.
Compare strategic explanations with cost, technical difficulty, habit, mistakes and
good-faith disagreement. Causes can coexist. “Who benefits?” is a hypothesis prompt,
not evidence of intent. Give serious rivals different predictions or disconfirmers.
An equilibrium is model-conditional, may not be unique, and is neither a welfare verdict
nor proof of what real people will do. Do not assume selection of your preferred outcome.

## 4. Generate better moves and, when appropriate, better rules

Challenge apparent impossibility: what changes with different information, technology,
ownership, standards, risk allocation, timing or decision rights? Separate a better move
within today's rules from a proposed change to the rules. Ask who can legitimately change them.
This is mechanism design in practical form: after each change, is participation and the
desired behavior still sensible for each pivotal actor? Could they profitably evade it,
misreport, shift costs, capture the process or optimize the metric instead of the goal?
Also examine feasibility, enforcement cost, credible commitments and transition losses.

Seek greatest defensible contextual benefit or least harm within stated constraints,
not merely a binary verdict or a winning strategy for the strongest actor. Compare the
baseline, alternatives and their effects on each affected group, including non-deciders.
Make horizon, uncertainty and defensible weights explicit; do not force incomparable
outcomes into a fake scalar. Include externalities, rights, consent, unequal power and
reversibility. A stable or profitable arrangement is not automatically desirable.
Expose unresolved value choices to the legitimate decision owner. Vary plausible beliefs,
preferences and constraints: prefer robust options over ones requiring perfect rationality.

## 5. Discriminate, then hand back

Name the smallest useful evidence check: a record, measurement, authorized conversation
or permitted reversible test. State what would weaken the explanation and stop the test.
Inquiry does not authorize outreach, spending, changing rules or experimenting on people.
Use a short narrative, not a theory-name checklist:

> Under **these conditions**, **X** persists because **A** faces **these choices/costs**
> and expects **B** to respond **this way**. Changing **C** could lead to **D**, unless
> **E**; **F** is a competing explanation. Benefits/harms fall on **these groups**.
> Evidence **G** would distinguish them. **H** remains unknown; next authorized check: **I**.

See [worked cases and source limits](references/examples-and-evidence.md) when a
concrete example or the evidential basis is needed. Return options and uncertainty,
not an invented final decision, to the workflow that requested the analysis.

## Stops and limits

- Missing pivotal rules, evidence or preferences: qualify the affected prediction;
  request a discriminating input, not a confident story. Preserve the owner's hard stops.
- Conflicting values or unauthorized effects: return the choice/boundary to its owner.
- Feasibility is not endorsement. Question norms and explore unconventional or harmful
  historical ideas at a safe analytical level, not as a warrant to impose harm.
  Do not operationalize harm, deception, coercion, manipulation, illegal acts or control
  bypass. Defensive analysis of such behavior is different from helping carry it out.

## Deliverable check

- [ ] Relevant actors, real choices/information and pivotal constraints are explicit.
- [ ] Response mechanism, rival explanation and disconfirming check are distinguishable.
- [ ] Alternatives, affected non-deciders, uncertainty and value/authority limits remain visible.
- [ ] Handback is proportionate, usable by its owner, and does not claim unobserved effects.

## Anti-patterns

| Temptation | Why wrong | Better approach |
|---|---|---|
| Everyone is selfish; follow the money | Misses mission, norms and constraints | Check actual motivations and feasible choices |
| Benefits prove a conspiracy | Outcome is not intent | Compare causal mechanisms and disconfirmers |
| Everyone should just cooperate | May punish the first mover | Explain credible participation and transition costs |
| More reward guarantees more desired behavior | Can change selection, meaning or gaming | Trace responses and test rival effects |
| A threat, signal or equilibrium proves the outcome | Credibility and model assumptions may fail | Check incentives, information and alternatives |
| Strategy means defeating another party | Many games admit mutual gains | Improve rules and consider all affected groups |
| Discard norms or treat them as infallible | Both skip causal and value analysis | Examine their function, evidence and consequences |

Source checks and walkthroughs are not demonstrated agent
improvement.
