// Provenance, corrected secondary claims and explicit limits of observation.
= Evidence, versions and open questions

== Source priority and snapshot

The research inspected the paper, upstream Cordis materials, DSH's documentation/vendor manifest and Morrison's original FBP explanations. The AgentAtlas article is a secondary introduction, not the authority for theorem scope, implementation behavior or chronology. @paper @cordis @vendor @primer @fbp @agentatlas

#table(
  columns: (1fr, 2fr), inset: 6pt,
  table.header([*Source*], [*Observed scope and limitation*]),
  [Paper], [arXiv 2608.25512 v1, submitted 26 August 2026, 92 pages. Formal claims are scoped to the model and assumptions; proofs were not independently mechanized or re-proved in this research.],
  [Upstream Cordis], [Inspected main tree reported 4.0.0-rc.12 and unstable API status. This is a tree snapshot, not verification of a release tag or immutable source pin.],
  [DeepSeek Harness], [Vendor manifest reports `@deepseek-ai/cordis` 4.0.0-rc.7, upstream commit 56b3d4f725681cf4556c1a8695a709cc3b6eed74 and 24 local modifications. A modified vendored tree is not interchangeable with upstream main.],
  [Koishi case study], [Paper §5.3 reports more than 4000 community plugins over four years. Its footnote says Koishi uses Cordis V3, whereas the paper concerns V4; adoption is observational evidence, not a controlled quality or safety comparison.],
  [FBP], [Morrison's conceptual account and deadlock discussion support the model and counterexample, not claims about every current runtime's buffering policy.],
)

The report preserves these observations as a dated snapshot, not a promise about today's moving branches. Before adopting an API or comparing behavior, inspect and pin the exact intended artifact; no Cordis or FBP runtime was installed or run for this research.

== Secondary-source corrections

The AgentAtlas post is dated 17 August 2026 and places the preprint earlier than arXiv's recorded v1 submission. Use arXiv's 26 August metadata for the submission date; the post's claimed 13 August DSH release is a secondary attribution, not independently established release evidence. Repository creation is not proof of release. @agentatlas @paper

An initial delegated interpretation alleged that the article's nested `ctx.effect` cleanup example leaked. Original-source proofreading rejected that allegation: the outer execution thunk is called immediately and its returned cleanup is collected for teardown; the example is not evidence of that leak. @fiber @agentatlas

This research does not establish the current buffering behavior of NoFlo or Node-RED. It makes no current unbounded-queue claim for either, and does not generalize all reactive programming to one scheduling model.

== What has and has not been established

*Established at source level:* the distinction between lifecycle/dependency composition and packet-flow composition; scoped cleanup ordering; the paper's reversibility, compatibility and security limits; and a documented bounded-buffer deadlock counterexample. Independent proofreading corrected delegated overclaims rather than treating an agent response as evidence by itself.

*Not established:* local Cordis/DSH behavior, performance, security or recovery; correctness of a combined Cordis–FBP agent architecture; runtime equivalence across versions; actual agent use of the optional links; or an improvement in modularity, flexibility or output quality. Those are future hypotheses, not conclusions of this document.

*Open questions:* which concrete workload needs dynamic lifecycle composition; whether a runtime is necessary at all; how its dataflow shutdown and durable state contracts interact; and whether the optional questions detect useful defects without adding noise. These require task-specific evidence and existing approval boundaries, not blanket adoption.
