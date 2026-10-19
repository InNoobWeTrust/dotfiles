= Swarm intelligence: quorum without manufactured certainty <swarm>

*Research question:* can collective evidence gathering, quorum-like commitment, and cross-inhibitory criticism improve the controls above without amplifying shared errors? The connection is mechanistic—feedback and commitment policies—not a claim that molecular reactions, insect colonies, and language-model teams are equivalent systems.

== What quorum and criticism do differently

Sumpter and Pratt describe quorum responses as sharply nonlinear changes in an individual's behavior as the number of others already exhibiting a behavior increases. Recruitment and local assessments can coordinate collective nest selection, but a quorum threshold is not necessarily a numerical majority of the colony; their models also show that strong feedback can amplify early errors into collective incorrect choices. @quorum

Seeley and colleagues report that honeybee scouts deliver inhibitory stop signals preferentially to dancers advertising rival nest sites. Their analytical model links this cross-inhibition to resolving deadlock over equal sites; selecting one of two equally good options is a coordination achievement, not evidence that one option was factually false. @stopsignals

#table(
  columns: (1fr, 1.4fr, 1.65fr), inset: 6pt,
  table.header([*Mechanism*], [*Possible agent analogue*], [*Important distinction*]),
  [Recruitment / positive feedback], [Allocate more investigation to promising hypotheses.], [Popularity can reinforce a shared mistake; it is not new evidence.],
  [Quorum response], [A declared threshold for promoting a provisional conclusion.], [Commitment, majority voting, and truth are different properties.],
  [Cross-inhibition], [A targeted challenge can interrupt unsupported promotion.], [A red team seeks counterevidence; a biological stop signal is not a logical refutation.],
  [Collective commitment], [Coordinate the next permitted action.], [Agreement cannot override authorization, a failed postcondition, or a safety constraint.],
)

*Connection to chirality:* self-reinforcement and antagonism can select one branch in both chemical and collective-decision models. Neither mechanism identifies a desirable or correct branch by itself; the transferable research target is how evidence influences amplification and commitment, not whether opposition guarantees balance. @blackmond @quorum @stopsignals

== Why five agreeing agents need not be five checks

For an idealized binary question, suppose an odd number $n$ of voters have independent correctness events, each with the same probability $p$. Then majority correctness is
$ P_("majority") = sum_(k=(n+1)/2)^n binom(n,k) p^k (1-p)^(n-k). $
With $p>1/2$, this idealized probability increases with odd group size; independence and competence are substantive assumptions, not consequences of creating more agents. Shared evidence and common causes can correlate errors even when voters do not communicate. @jury

*Counterexample:* five independent voters with $p=0.7$ give majority correctness $0.83692$. If all five instead copy one fallible judgment, their individual accuracy can remain $0.7$ while majority accuracy is still only $0.7$; unanimity adds no reliability in that case.

*Implication:* independent initial submissions can reduce direct copying, but different prompts, temperatures, roles, or model providers do not establish statistically independent errors. Track agent endorsements and distinct evidence origins separately: reanalyzing shared evidence may improve an inference, but it is not another observation of the environment. @jury

Multiagent debate has reported gains on selected reasoning and factuality tasks, providing a relevant precedent rather than a general consensus guarantee. The preliminary trials above did not test a swarm quorum policy or an independent debating group. @debate

== Three competing, falsifiable directions

#table(
  columns: (0.9fr, 1.65fr, 1.65fr), inset: 6pt,
  table.header([*Direction*], [*Causal hypothesis*], [*Disconfirming result*]),
  [A · Source-aware quorum], [Independent initial assessments plus visible evidence lineage reduce repeated promotion of the same unsupported claim relative to a head-count vote.], [The gain disappears against an equal-budget independent-solve baseline, or lineage rules merely increase false blocks.],
  [B · Cross-inhibitory critic], [An evidence-bearing challenge interrupts premature commitment better than passive voting.], [A targeted extra observation performs as well or better, or criticism suppresses supported minority findings and correct initial hypotheses.],
  [C · Adaptive recruitment], [Additional workers are useful only when their assigned observations or analyses can change an unresolved decision.], [A fixed small team achieves equal or better accuracy and constraint retention at equal cost; recruitment only accelerates agreement.],
)

*Candidate workflow, not an implemented architecture:* collect initial assessments before sharing peer conclusions → expose observation sources and disagreements → request a discriminating check → apply a predeclared promotion rule → pass the proposed action through independent permission and postcondition checks. A verified constraint violation stops the affected action; mere dissent instead calls for assessment, not automatic rejection or forced unanimity.

*Evaluation:* compare one grounded agent, equal-budget independent solves with majority aggregation, ordinary debate, and each proposed addition separately. Hold evidence access and total budgets fixed within comparisons; separately vary shared versus distinct evidence and peer exposure to distinguish more information from a better aggregation policy.

*Negative controls:* include a planted wrong common premise, duplicated observations presented as multiple endorsements, a correct minority supported by a decisive test, equally acceptable alternatives, and cases with no available distinguishing evidence. Measure correctness and unsupported claims separately from agreement, decision time, cost, false blocks, and preserved constraints; calibrate thresholds only on development tasks and test on held-out tasks.

*Priority:* start with source-aware commitment and observable prerequisite handling, because the developmental failures concern evidence scope and missing reference loads. Keep cross-inhibition and recruitment as rival hypotheses; no quorum threshold, swarm size, or consensus rule has yet been validated for this setup.

== Developmental swarm execution

*Setup:* a subsequent disposable Python task used two fresh investigators, one Claude Sonnet 4.6 and one GPT-6.1 Sol (medium), with separate sessions and no peer conclusions supplied during their investigations. Both could inspect the same code and four unit tests; three explicitly synthetic endorsements copied one unavailable historical DNS diagnosis from an older staging version. The current defect was a local milliseconds-to-seconds conversion dividing by 100 instead of 1000, with no network dependency in that function.

*Prerequisite failure:* the required evidence-and-recovery reference existed in the repository but was unavailable at the shared skill path. One investigator stopped before inspecting the fixture; the other continued and produced a diagnosis despite the missing prerequisite. Supplying the verified repository path enabled assisted resumption; this did not retroactively turn the first pass into compliant execution or repair the shared installation.

*Deployment distinction:* the shared skill entry and an older supporting reference were symlinks to repository files, but the new supporting reference had no shared-path entry. Updating linked source text therefore did not install the new dependency at the path that the text required. This is an observed delivery gap, not evidence that the reference's reasoning method failed.

*Observed result:* after assistance, both investigators separately reproduced two failures and two passes and proposed the same divisor correction. Primary execution of a separate candidate changed only that divisor and passed all four byte-identical tests, preserving the original fixture; zero and negative-input controls passed before and after. These checks establish the exercised local behavior, not production repair, all-input correctness, or statistical independence between workers using the same code and tests.

*Votes versus evidence:* counting the three copied endorsements against the two current investigator recommendations gives a deliberately constructed 3:2 vote for DNS changes. This is an arithmetic comparator, not an executed naive-voting agent baseline or three real dissenting agents. Source-aware promotion instead relied on current discriminating tests and source currency; neither deduplicated head count nor consensus established truth.

*Targeted critic:* a fresh third diagnostic worker reran the original and candidate suites, again observing two failures versus four passes, and checked that assertions were unchanged and already-correct controls survived. It confirmed the bounded fix rather than manufacturing opposition, and challenged any inference of swarm benefit. No further diagnostic worker was recruited: this exercised a capped verification step, not an adaptive-recruitment algorithm or a validated quorum threshold.

*Limits:* either investigator, once unblocked, already found the correct local diagnosis; the task therefore supplies no demonstrated accuracy advantage for the swarm. The stale endorsements were transparently labeled, the defect was simple, and there was no randomized, repeated, equal-budget comparison or held-out task. Adaptive recruitment and quorum thresholds remain unvalidated; prerequisite-path delivery and stopping behavior were concrete setup failures worth addressing before expanding the team.
