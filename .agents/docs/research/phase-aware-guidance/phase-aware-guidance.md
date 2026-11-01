---
audience: Skill maintainers and agent orchestrators
purpose: Examine proportionate engineering through principles, templates and specialist advice
scope: Prototype/MVP design and review; not adopted governance or production assurance
status: provisional research; not field-validated
---

# Phase-aware engineering judgment

**Learning job:** Separate current requirements from speculative needs without an “MVP” harm exemption. Success: sourced conditions and counterexamples, not a template ban or systematic review.

## Findings and uncertainty

**Neither extreme is established.** Anthropic places instructions between brittle hardcoded logic and vague guidance [1], distinguishing predictable workflows from flexible agents [2]. This vendor/practitioner guidance is not a controlled comparison of skill templates.

**Purpose changes the work.** GOV.UK alpha uses non-public prototypes to test risky assumptions, not production-quality code [3]; beta rolls a working service out to users [4]. Alpha/beta are not synonyms for prototype/MVP or universal startup obligations.

**Deferral has prerequisites.** Fowler’s YAGNI rejects speculative capabilities, not refactoring, testing or code health [5]. Sacrificial architecture accepts eventual replacement, but poor internal quality can hurt first [6].

**Checklist outcomes vary.** A prospective before/after surgical study associated a checklist programme with fewer deaths/complications [7]; an Ontario study found no significant reductions after adoption [8]. Neither observational study proves causation, explains the contrast or establishes LLM efficacy.

**Unproven:** templates caused the reported overengineering, principles alone fix it, or more instructions necessarily degrade reasoning. No failed delegation transcript or controlled agent comparison was examined.

## Local source observations

| Source | Observed text |
|---|---|
| [Architecture router](../../../skills/architecture-design/SKILL.md) | Strong defaults precede milestone calibration; artifact type/size alone do not establish maturity. |
| [Reviewer Gate 3](../../../skills/reviewer/SKILL.md#gate-3--contract-bounded-phase-review) | Requires a phase contract; hypothetical scale, elegance and flexibility cannot expand scope. |
| [Delegation examples](../../../skills/reviewer/references/delegation/framework.md) | Ask for “full adversarial protocol,” production resilience or 1×/10×/100× performance without carrying that contract. |
| [Ostrich lens](../../../skills/reviewer/references/sub-reviewers/pragmatic-triage.md) | Matrix per complexity; only HIGH×HIGH justifies significant architecture. Simplicity guidance also prescribes machinery. |
| [Phased delivery](../../../skills/team-operating-model/references/phased-delivery.md) | Permits inline contracts, must-ship/may-defer/never-defer and no future infrastructure prebuilding; current obligations remain. |

Ostrich is a heuristic, not validation or permission to waive obligations. Unknown probability is not low probability; rarity alone does not dispose of irreversible harm.

## Conditional judgment from sources

- **Future capability [5]:** For presumed later needs, compare build/delay/carry/repair costs and imagine the later refactoring before adding extension points. Cheap choices reducing later costs without extra complexity are an exception. Check changeability, not just code size.
- **Learning prototype [3]:** In non-public alpha, build enough to test risky assumptions; difficult integration may itself be that uncertainty. Check learning and the proceed/stop decision, not production headings completed.
- **Instruction detail [1,2]:** Known paths favour workflows; unpredictable paths may need agent flexibility. Inspect failures before adding instructions; avoid brittle exhaustive branches and vague principles. Document templates are not necessarily coded workflows.
- **Checklist transfer [7,8]:** Structure can support communication and recurring safety actions inside complex work. Check context and implementation evidence before transfer; these contrasting studies neither explain their difference nor justify direct LLM conclusions.

**Practitioner failure:** Fowler reports unnecessary microservices slowing feature pipelines [6]: distribution/asynchrony without sufficient need traded present complexity for replaceability. Attributed experience, not underlying project data or a quantified universal effect.

**Boundary account:** GOV.UK reports Register to Vote testing integration with over 400 council systems during alpha because feasibility was essential [3]. Official secondary account, not our interview; it challenges “early phase means happy path only.”

## Decision support and specialist judgment

**Accountability is not advice.** Scrum assigns product-value/backlog accountability to the Product Owner and Definition-of-Done quality to Developers [9], not an AI PM/PO/QA/QC panel or prototype/MVP process.

**Existing method:** [Decision support](../../../skills/decision-support/SKILL.md) requires evidence, alternatives, uncertainty and authority boundaries. Scores cannot supply permission, missing evidence or independent review; this is a method, not demonstrated efficacy.

**Open question:** Can bounded PM/PO, QA/QC or engineering advice clarify scope-versus-risk trade-offs without importing every specialist checklist? Role labels do not demonstrate expertise; AI role-play is not practitioner testimony. No role allocation, mandatory panel or numerical risk threshold is adopted.

## Check receipt and next evidence

**Two synthetic desk cases—not executed practice:**

- **Representative:** A local synthetic-data prototype tests one interaction: alpha guidance does not require full production implementation; YAGNI preserves changeability.
- **Boundary:** A public personal-data MVP exceeds alpha’s non-public conditions: privacy/security obligations apply, but not automatically every scaling mechanism.

**Limits:** Fowler, GOV.UK and Anthropic each supply two sources, not two independent origins. Surgical datasets/settings differ; only abstracts were read. No expert interview, field trial, consultation efficacy test or independent directional validation occurred.

**Next evidence:** Matched actual-task observations under current/candidate guidance with identical phase/exposure information, including early delivery with a genuine obligation. Measure unnecessary requirements added AND necessary ones omitted, complexity and effort—not word count alone. Unexecuted comparison question, not an approved protocol.

**Packaging:** Research only; no policy adoption.

## Sources

Accessed 2026-11-01. Surgical abstracts: Europe PMC API after PubMed cookie gates; article landing pages returned 403 during verification. WHO manual unread.

1. Anthropic (2025), [Context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents), “Anatomy of effective context.”
2. Anthropic (2024), [Building effective agents](https://www.anthropic.com/research/building-effective-agents), when/when not to use agents.
3. GOV.UK (2019 update), [Alpha](https://www.gov.uk/service-manual/agile-delivery/how-the-alpha-phase-works), risky assumptions.
4. GOV.UK (2021 update), [Beta](https://www.gov.uk/service-manual/agile-delivery/how-the-beta-phase-works), stages and information reuse.
5. Fowler (2015), [Yagni](https://martinfowler.com/bliki/Yagni.html), costs/code health.
6. Fowler (2014), [Sacrificial Architecture](https://martinfowler.com/bliki/SacrificialArchitecture.html), quality/microservices.
7. Haynes et al. (2009), [Surgical safety checklist](https://europepmc.org/article/MED/19144931), abstract; DOI 10.1056/NEJMsa0810119.
8. Urbach et al. (2014), [Ontario checklists](https://europepmc.org/article/MED/24620866), abstract; DOI 10.1056/NEJMsa1308261.
9. Schwaber/Sutherland (2020), [Scrum Guide](https://scrumguides.org/scrum-guide.html), accountabilities/Definition of Done.
