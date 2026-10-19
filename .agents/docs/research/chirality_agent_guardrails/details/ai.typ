== Evidence-seeking critic, not an agent paid to disagree

*Principle:* challenge a favored explanation before acting on it. Neither a mirror-image prompt nor a second model establishes statistical independence or creates evidence by cancellation.

Instead of asking one agent to “prove the database is broken” and another to “prove it is normal,” ask both to compare database, network, application, and unknown-cause hypotheses against the same incident. Let the critic identify the strongest disconfirming observation and propose a discriminating test; allow mixed causes and abstention.

Multiagent debate has reported improvements on selected reasoning and factuality tasks, but that does not validate this particular controller. Intrinsic self-correction without external feedback sometimes degraded performance in the reasoning experiments of Huang et al.; neither result is a universal theorem about current agents. @debate @selfcorrect

*Limits of subtraction:* a rule such as $A'_t = max(0, A_t - alpha B_t)$ is not a consequence of Frank kinetics. Without a defined evidence scale and calibrated $alpha$, it treats correlated statements as additive and can suppress a correct minority hypothesis; $B_t approx A_t$ is not guaranteed.

*Practice:* record observations for and against each explanation, identify shared sources, and choose the next test by its ability to distinguish explanations. A second opinion is useful when it supplies a different check, not merely a different conclusion.

== Epistemic quarantine with provenance

*Principle:* prevent a tentative claim from becoming an established premise merely through repetition. An *evidence ledger* separates hypotheses, observations, and assessments without assuming that catalyst sequestration has a direct computational equivalent.

#table(
  columns: (1fr, 2.8fr), inset: 7pt,
  table.header([*Record*], [*What it contains*]),
  [Hypothesis], [A concise, revisable claim; proposed test; unresolved alternatives.],
  [Observation], [Source or tool, time, exact scope, result, and known reliability limits.],
  [Assessment], [Which observations support the claim, contradictions, uncertainty, and review date.],
)

*Promotion is claim-specific.* A successful API request proves neither that its payload is true nor that it answers the intended question: a healthy database replica does not establish that the primary is healthy. Retrieved content can also contain indirect prompt injection, so external observations must remain data, not instructions or authorization. @injection

Use short claim summaries and tool-visible evidence, not a requirement to extract or persist private chain-of-thought. A textual `epistemic_status="speculative"` label is a convention, not an access-control mechanism; actual exclusion requires controlling retrieval and prompt assembly, and arbitrary attention masking is not a standard assumption for hosted APIs.

ReAct already interleaves reasoning, action, and external observations, and its paper reports reduced hallucination/error propagation on the evaluated question-answering tasks. Reflexion uses feedback and an episodic memory buffer, so the existing literature supports studying feedback-aware memory—not declaring all model-produced summaries harmful. @react @reflexion

*Limits:* quarantining text does not establish a change of dynamical order from $k > 1$ to $k <= 1$, and unsupported hypotheses do not automatically “decay.” Define expiration or review rules explicitly, while retaining contradictory and historical evidence.

== Pre-execution checks with asymmetric permissions

*Principle:* validate before effects occur, with stronger checks for more consequential actions. The useful asymmetry is an explicit permission and verification policy, not a chemical activation energy.

Require a structured action proposal containing the target, intended effect, supporting observation IDs, expected postcondition, a disconfirming condition, and a recovery plan where feasible. Enforce schema and semantic checks in the tool gateway outside the proposing model; a well-written justification is not authorization.

JSON Schema can constrain fields, types, enumerations, and additional properties, but structural validity does not establish truth or safety. A perfectly valid deletion request can target the wrong resource; unit tests cover their assertions, not all real-world outcomes. @schema

*Risk is broader than read versus write.* Reads can expose secrets, spend money, or invoke unsafe endpoints; writes may be transactional and reversible, and a Git commit is not inherently irreversible. Use least privilege, scope checks, freshness checks immediately before execution, and independent verification proportional to impact; a small checking model remains fallible.

An effectively infinite barrier exists only for a forbidden action that an unavoidable gateway actually rejects. It does not mean all bad actions are recognized, nor does it protect alternate execution paths.

== Evidence-preserving restart, not erasure

*Principle:* stop an unproductive trajectory and reconsider alternatives. Restart from a neutral incident summary while preserving user constraints, observations, failed tests, permissions, and an append-only action history; pruning a search branch must not destroy the audit record.

The proposed cognitive enantiomeric excess,
$ "CEE"_t = abs(p_1 - p_2) / (p_1 + p_2), $
is merely a normalized two-branch imbalance when $p_1 + p_2 > 0$. It does not establish correctness, neglects other hypotheses, and requires probabilities with a defined interpretation; confidence expressed in prose is not a calibrated posterior.

If $p_1 + p_2 = 1$ and $p_1 >= p_2$, then $"CEE" = 2 p_1 - 1$, so a threshold of $0.85$ corresponds to $p_1 = 0.925$. Such a threshold, a three-attempt rule, or restarting three branches would be heuristic choices, not policies validated by the cited literature.

Monitor observable stagnation instead: repeated equivalent actions, unchanged test results, and no new relevant observations. If the proposal invokes *information gain*, specify a belief model and measurement; a count of new observations is only a proxy, not Shannon information gain.

Tree of Thoughts provides precedent for search, backtracking, and evaluated alternatives on specific tasks, not for this CEE-triggered policy. Different prompts or temperatures may diversify outputs but do not guarantee independent errors; raising temperature can also worsen reliability. @tot

== Limits of mathematical and physical analogies

*Not a law of ReAct:* $P_(t+1) prop P_t^k$ lacks a normalization or update rule. For $0 < P_t < 1$ and $k > 1$, $P_t^k < P_t$; even the simplest normalized binary update amplifies the initially larger branch, not necessarily the incorrect branch.

For illustration only, if $p' = p^k / (p^k + (1-p)^k)$, then $p=0.2$ and $k=2$ give $p' approx 0.059$, while $p=0.8$ gives $p' approx 0.941$. Even this simple update can increase or decrease an error probability depending on the starting point; it is not an empirical model of an agent.

*Not quantum noise:* nonzero sampling temperature changes a computational sampling distribution; it does not establish a quantum mechanism, and an error is not inevitable in every sampled answer. Low or zero temperature is also no guarantee of truth.

= How to test the ideas rather than just rename them

*Objects and measurements:* chemical concentrations and enantiomeric excess belong to a molecular reaction; agent claims, evidence records, actions, and task outcomes belong to a software process. The research question is whether the proposed software controls improve these measured outcomes, not whether their terminology resembles chemistry.

#table(
  columns: (0.8fr, 2.1fr, 2.1fr), inset: 7pt,
  table.header([*Candidate*], [*Competing hypothesis*], [*Falsifier*]),
  [A · Conservative], [A simple evidence ledger plus deterministic action checks supplies most of the benefit.], [Matched-budget trials show no reduction in unsupported claims or unsafe attempts versus ordinary tool-grounded operation.],
  [B · Analogical], [An evidence-seeking critic adds benefit beyond ledger and gateway checks.], [A compute-matched extra test or independent solve performs as well or better; debate adds delay or false rejection.],
  [C · High-risk], [A stagnation-triggered restart improves recovery without losing constraints.], [Restarts repeat failed actions, erase essential evidence, increase violations, or provide no matched-budget recovery gain.],
)

*Protocol:* use sandboxed debugging and fact-checking tasks with hidden ground truth, including database, network, application, mixed, and unknown causes. Randomize a misleading early hint, a correct hint, or no hint; include stale or misleading tool output and conflicting observations, without exposing real services or secrets.

*Comparators:* evaluate a tool-grounded baseline, each of the four controls separately, and the combined system. Match total token/tool budgets; include a sham critic that merely paraphrases and an equal-budget additional-observation condition to distinguish useful evidence from extra computation.

*Outcomes:* predeclare task success, unsupported-claim promotion rate, unsafe action attempts, executed violations, false blocks, recovery rate, cost, and latency. Use repeated seeds and task families, paired comparisons and uncertainty intervals; report model versions, prompts, gateway policy, sample size rationale, and all exclusions.

*Kill criteria:* reject the claimed benefit if improvement disappears under budget matching or if safety gains rely on refusing nearly every action. Stop the combined proposal if it raises executed violations or loses required constraints; tune any thresholds on development tasks and evaluate once on held-out tasks.

*Feasibility:* the proposed controlled evaluation is not model training; start with simulated tools and a fixed call/spend cap. The preliminary trials below do not implement this full protocol, so effectiveness, novelty, and any chemical-to-computational causal equivalence remain unverified.
