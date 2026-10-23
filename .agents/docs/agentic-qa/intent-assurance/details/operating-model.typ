= The operating model <operation>

== A small facade over inspectable evidence

#figure(
  grid(columns: (1fr, auto, 1fr, auto, 1fr), gutter: 6pt,
    block(fill: rgb("edf3f7"), inset: 8pt)[*Original intent*\ Scope + sources],
    [→],
    block(fill: rgb("edf3f7"), inset: 8pt)[*Bounded delivery*\ Build + observe + repair],
    [→],
    block(fill: rgb("edf3f7"), inset: 8pt)[*Assurance*\ Intent + behavior + exceptions],
  ),
  caption: [The owner inspects consequential exceptions and selected proof; detailed sources remain available. Unresolved material conflicts return before dependent implementation.],
)

*Before generating:* retain original requests and compatible clarifications separately from mutable plans. State the outcome, must-not-change boundaries, relevant source/version and scope, plus one desired example and the closest plausible wrong example; this can be a few lines, not a new specification ladder.

*During delivery:* the builder owns implementation and genuine checks. The existing independent conformance checker compares the cumulative original requirements with the current result; responsibility for critical behavior proof is explicit, using a separate verifier where the contract or consequences require it.

*At handoff:* one card presents intent versus observed result; changed assumptions, removed/substituted/deferred behavior and its authority; one or two critical expected-versus-actual probes with evidence; and the precise unresolved decision with consequences and a recommendation. Detail is available on demand, not hidden or suppressed by the delivery lead.

The useful question is: “Show a case that distinguishes what I asked for from the nearest plausible misunderstanding—and demonstrate which behavior was delivered.” A probe without an actual observation is a planned check, not proof; the owner can choose a different probe or inspect underlying evidence.

== Input integrity: structure supports authority

Progressive disclosure means a small entry map leading to an owner guide and scoped detail/evidence. Drafts, history and transient outputs should remain available for investigation but off the default requirement route; folders and timestamps do not establish governing authority.

Maintain one normative claim with linked intentional summaries, rather than treating every duplicate sentence as waste. During affected work, reconcile source status, scope and supersession, report evidenced material conflicts as soon as found, and update relevant indexes/descriptions/outputs alongside the implementation.

Pause only work dependent on an unresolved conflict, not the whole repository. An already approved supersession is not a reason to ask again; a real retained-consumer or safety obligation is a reason to surface a contract defect rather than silently restore old behavior.

Mechanical checks can reveal missing targets and candidate duplicate text. They cannot prove that a source is authoritative, that two passages contradict each other or that an owner meant a particular outcome; semantic review still needs the original sources.

== Code integrity: do not hide decisions in patches

Current code and passing tests are evidence of what exists, not automatic specifications of what should remain. They can encode legitimate undocumented domain, data, safety or external-consumer constraints; discover those rather than obeying or discarding them reflexively.

Trace intent → current behavior and consumers → mismatch → preserved/deleted or replaced semantics → applicable proof. Choose a local patch when it genuinely fits the authorized responsibility; refactor when the conflicting design must change within settled bounds; escalate unresolved consequential meaning or effects before embedding a workaround.

Ask: “What constraint does this workaround preserve, who requires it, and why is it still valid?” A compatibility adapter can be justified by a real retained interface; preserving an approved-retired path merely to keep tests green is not sufficient justification, and existing tests must not be weakened without approval.

== Enforcement and change control

Executed, failed, skipped and unavailable checks must be distinct for each critical claim. Bind evidence and approvals to the actual source, artifact and configuration; changes invalidate affected proof, and a completed unit cannot stand in for a promised end-to-end outcome.

Repair in-scope defects without routine owner permission. Outcome, acceptance, scope or material-risk changes return through the applicable authority as explicit what/why/impact/options/recommendation proposals; QA success grants no merge, deployment, spending or acceptance rights.

Do not continue an unchanged review/repair loop indefinitely: diagnose by the third round at latest, earlier when a verifier breaks or a fingerprint repeats. Respect stricter existing budgets; this adds neither extra retries nor an arbitrary total-task cap or automatic human interruption when a safe revised path exists.

For authorized releases, observation signals, accountable recovery and a rollback/disable path matter as much as pre-release checks. The current pack's mandatory reviews and human-reserved rights remain the floor: no vendor-derived risk tiers, automatic merge path or newly scheduled service are installed by this guide.
