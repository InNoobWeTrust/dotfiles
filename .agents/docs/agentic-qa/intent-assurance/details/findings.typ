= What the evidence supports <findings>

== Industry: assurance moves, it does not disappear

The Claude Code team says, “We didn't remove review. But we did move most of the reading to machines.” It reports Claude writing about 90% of that team's own code, more than doubling merged PRs between June and September while the reverted share fell by over 40%; this is not a claim about all Anthropic coding, an incident-rate result or a controlled causal comparison. @anthropicreview

#table(columns: (1fr, 2fr), table.header([*Layer*], [*Reported mechanism*]),
  [Before review], [Runnable tests/builds/screenshots and actual outputs; fresh-context review; short goals/non-goals and code-owner failure/evidence criteria.],
  [Agent review], [Multiple finders; separate finding verification; bug/security findings resolved or justified; low-value style/cleanup noise filtered.],
  [Enforcement], [CI and open findings block merge; change-sensitive human requirements, trusted-author limits and sensitive-path exceptions; approvals tied to commits.],
  [Recovery], [Merge queues, internal flags, staged release and monitored revert/disable paths. Automatic circuit breakers tightening approval after deterioration were still a gap.],
  [Reviewer quality], [Daily evaluations from engineer-confirmed historical incidents, clean-case false-positive checks and comment outcomes; after three repair rounds, step back rather than repeat patches.],
)

Humans retain direction, scope, taste, risky-code and architectural judgment, evidence interpretation and accountability. Internal low-risk merge arrangements do not change the public review product's finding-only role, and are not a local approval policy to copy without authority. @anthropicreview

OpenAI describes one newly built internal-beta product with no manually written code, optional human PR review, agent-to-agent review and minimal blocking merge gates. It also describes substantial investment in isolated runnable applications, observability, machine-enforced architecture, a short entry map and linked knowledge, plus recurring cleanup; it does not quantify an escaped-defect comparison and explicitly leaves long-term coherence uncertain. @openaiharness

These accounts differ in approval and flaky-test tolerance; neither establishes a universal safe merge recipe. OpenAI's observation that agents replicate uneven existing patterns is particularly relevant to code as well as documentation contamination. @openaiharness

== Traditional QA was already moving upstream

DORA recommends peer review supported by continuous tests, integration and observability rather than remote approval boards reading every change. Its research found no evidence that more formal external review lowered change failure rates; that is not evidence that agents satisfy human segregation-of-duties or regulatory requirements. @doraapproval

Continuous testing still includes human exploratory, usability and acceptance work. The recent addition is agents doing more building, observation, review and repair, with their own judgments needing calibration—not the disappearance of those assurance responsibilities. @doratesting

== Failure patterns to check

These are general review questions, not findings about any particular implementation. Use them to choose a small amount of evidence against the actual authorized task.

#table(columns: (1fr, 1.5fr), table.header([*Failure pattern*], [*Small owner probe*]),
  [Stale guidance becomes an accidental requirement], [Which approved decision governs, and does the proposed behavior follow it rather than an obsolete description?],
  [A successful command hides missing checks], [Which critical claims were executed, failed, skipped or unavailable on this revision?],
  [A component result is presented as complete delivery], [What required end-to-end behavior remains unproved, and how is the handoff qualified?],
)

A legitimate partial result need not be rejected. The failure is claiming unsupported scope or silently changing the agreed outcome; judging that requires the governing request and actual evidence, not an inference about the author's motives.
