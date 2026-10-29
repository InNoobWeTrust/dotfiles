---
name: domain-curation
description: "Acquire task-focused knowledge in an unfamiliar domain and curate practitioners' conditional judgment into usable guidance. Use for 'learn this domain quickly', 'curate veterans’ experience', 'extract tacit knowledge', 'map what matters', 'build a domain playbook', or 'prepare knowledge for a new skill'. Not for simple fact lookup, scientific hypothesis generation alone, candidate vetting, or authoring an already-grounded skill."
metadata:
  lifecycle: "prototype"
  created: "2026-10-15"
  review-after: "1–2 real uses or 2026-11-15"
  maintenance-note: "First-use evidence is not yet available. After 1–2 real uses or the review date, inspect which decisions improved, which advice failed to transfer, and whether overhead was proportionate. Do not fabricate usage metrics; route revisions through the governance skill authoring capability."
---

# Domain Curation

Turn sources and practitioners' experience into decisions a learner can actually use. The outcome is bounded working knowledge, not a claim of expertise or an automatic new skill.

## Reader, input and authority contract

For a human or agent curator helping a learner. Start with domain, concrete task, learner baseline, time/resource limits, stakes, and accessible material. Infer harmless defaults explicitly; ask only for missing details that materially change the task or safety. No chosen domain/task means clarify before researching.

Use supplied sources first. Discover available native retrieval or already-authorized integrations only when needed; no required provider, MCP, interview access or installation. If retrieval is unavailable, analyze supplied material and label coverage gaps. If neither usable sources nor evidence are available, return a scoped acquisition plan, not factual guidance.

Reading does not authorize outreach, recording, publication, purchases, tool installation, risky practice or access to private material. Respect consent, licensing and confidentiality; anonymize sensitive anecdotes and do not persist personal details unnecessarily. Apply the relevant domain safety constraints; high-stakes guidance remains educational until appropriately qualified review and execution authority exist.

## 1 — Frame the learning job (mandatory)

- Define one observable task and success/failure criteria **before** gathering advice: e.g., diagnose a fault, choose between alternatives, or perform a bounded procedure.
- State learner starting knowledge and likely costly mistakes; set scope, evidence needs and a time/source budget proportional to stakes.
- Separate prerequisite concepts from situational judgment. Pick one representative case and one boundary/counterexample to try later.

## 2 — Map and ground sources (mandatory)

Load [Source evidence](references/source-evidence.md). Build a small map of prerequisites, decisions, terms and failure modes, not an exhaustive syllabus.

Prefer relevant primary/authoritative material and inspect practitioner cases for applicability. Preserve source locators and origin chains. Seek independent corroboration for consequential advice; multiple retellings of one origin are one evidence line. Single-source or unsupported claims stay provisional, never silently upgraded. Stop gathering when the agreed scope is covered or budget reached; report remaining gaps.

## 3 — Extract practitioner judgment (mandatory when available)

Load [Practitioner elicitation](references/practitioner-elicitation.md). Use an authorized conversation or supplied/public accounts of actual incidents. Capture cues, decisions, alternatives, trade-offs, failures, exceptions and context; distinguish quoted/paraphrased experience from the curator's inference.

Without practitioner evidence, label this phase unavailable and propose targeted questions. Never invent an interview or infer experience from prestige. Reconcile differing advice by conditions rather than choosing the most confident speaker.

## 4 — Challenge and try (mandatory)

Load [Validation and handoff](references/validation-and-handoff.md). Reconcile evidence against the predeclared criteria; try the representative case and boundary case only within available authority and resources.

An executed task, expert feedback, desk analysis and a synthetic walkthrough are different evidence types. Record which occurred, what changed, failures and unresolved assumptions. A walkthrough can expose ambiguity; it cannot demonstrate domain competence. Without safe execution, deliver provisional guidance plus the next discriminating check.

## 5 — Deliver, then decide whether to package (mandatory)

Deliver the smallest useful domain brief or checklist. It may contain all outputs below; separate files are optional and persistence requires authorized scope. For human-facing saved documents, follow applicable format rules and use a document format and presentation capability when document design is needed.

- [ ] Task, audience/baseline, constraints and success criteria.
- [ ] Minimal concept/decision map and glossary where necessary.
- [ ] Source-linked conditional judgment cards and costly mistakes.
- [ ] Disagreements, origin dependencies, unknowns and advice limits.
- [ ] Check receipt: planned versus performed, outcomes and unresolved risks.
- [ ] Next learning/practice action and packaging decision with reasons.

Default to **no new skill**. Only hand off to a skill authoring capability when a recurring workflow merits reuse, its critical guidance has appropriately scoped evidence, and a real task attempt has informed its limits. Transfer sources, conditions, failure evidence and untested branches. Authoring authorization is separate; the new skill still starts as a prototype, not expertise certification. If the authoring capability is unavailable, retain the brief and packaging checklist as the deliverable without creating a skill.

## Just-in-time composition

Load only the matching dependency, not a whole chain:

| Need | Handoff |
|---|---|
| Explain an observed failure | Root-cause investigation capability; apply structured failure analysis (5 Whys, Fishbone) inline if unavailable |
| Scientific hypotheses/experiments | Scientific research capability; keep scientific scope separate from practical domain curation |
| Meaningful uncertain choice | Decision-support capability; advisory only; do not substitute for missing evidence |
| Challenge guidance or evidence | Independent review capability; if unavailable, apply adversarial self-challenge and document remaining uncertainty |
| Reader-ready learning material | Document format and presentation capability; if unavailable, deliver in plain structured Markdown |
| Requested retention/recall | Memory management capability; no automatic profiling; if unavailable, note the retention request as an open action |
| Grounded repeatable skill | Skill authoring capability; packaging authorization is separate |

## Stop or narrow scope

- Missing concrete task → clarify the learning job before acquisition.
- Critical advice untraceable or conflicting beyond safe resolution → stop that recommendation, explain gaps and seek discriminating evidence; continue safe unrelated work.
- Missing access/consent, dangerous practice or resource limit → stop affected action, offer an authorized lower-risk check; do not bypass restrictions.
- Budget exhausted → deliver current evidence with limits; do not call coverage complete.
- Packaging criteria unmet → retain brief/checklist; no invented validation or forced skill.

## Anti-patterns

| Temptation | Why wrong | Instead |
|---|---|---|
| Collect everything | Volume hides decisions | Curate against the concrete task |
| Treat seniority as proof | Experience has a context | Capture an incident and limits |
| Count citations as consensus | Retellings share origins | Trace independence |
| Flatten advice into rules | Exceptions disappear | Write conditional cards |
| Hide disagreements | Learner cannot judge transfer | Preserve competing conditions |
| Call a simulation validation | No real task evidence | Label the evidence type |
| Turn every brief into a skill | Adds maintenance without reuse | Apply packaging gate |
