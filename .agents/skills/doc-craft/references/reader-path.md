# Reader Path and Supporting Layers

| Reader contract | Scope |
|---|---|
| **Audience** | Authors and editors of human-facing technical documentation |
| **Purpose** | Decide what readers must encounter and where optional depth belongs |
| **Boundary** | Information organization, not a replacement for domain requirements, format selection, or accessibility checks |

Borrow books' selective depth, not their density or footnotes as a universal format. Readers should be able to follow the main argument or task without taking every detour, while worthwhile supporting information remains findable.

## Establish the main path before formatting

Start with the declared audience, prior knowledge, and the understanding, decision, or action the document enables. Order essential material around that goal; introduce concepts near their use and keep information readers must compare together rather than forcing repeated jumps.

| Material | Placement | Guardrail |
|---|---|---|
| Core explanation, actions, prerequisites, conclusions, consequential uncertainty or caveats | Main text, near the relevant claim or action | Never require an optional detour to interpret or act correctly |
| Brief optional clarification or source citation | Footnote, endnote, embedded link, or short linked note as the medium permits | Notes must not become a second argument |
| Extended evidence, methods, derivations, schemas, or specialist detail | Named appendix, reference section, or supporting page | Retain the usable conclusion and important limitations inline |
| Repetition, irrelevant history, or detail serving no reader need | Remove | Appendices are not storage for everything cut |

**Optional is audience-relative:** a definition may be essential for a beginner but unnecessary for an expert. Technical detail is not automatically optional, and a short paragraph is not automatically well placed.

## Choose the support channel

| Channel | Use when | Avoid when |
|---|---|---|
| Footnote | A brief, passage-specific aside or citation is useful in a book/PDF with suitable note navigation | Readers need it to understand the claim; numerous notes crowd the page |
| Endnotes or references | Citation-heavy material can sit outside the continuous reading path | Frequent back-and-forth is needed to understand the main text |
| Appendix or named reference section | A substantial supporting topic needs its own structure | Its conclusions or limitations would disappear from the main path |
| Linked supporting page | Web readers need optional depth, independently useful and clearly labeled | A routine task would require hopping between tightly coupled fragments |

**Book/PDF:** provide navigable contents for substantial documents and include named appendices in the delivered artifact. Notes, internal links, and bookmarks should work in the actual PDF, not just the source checkout.

**Web:** favor meaningful headings, descriptive links, and named supporting sections/pages over footnotes. GOV.UK explicitly discourages webpage footnotes; this is medium-specific institutional guidance, not a universal prohibition for every publication.

## Provide a map and a return route

- **Contents:** Show the main journey and named supporting sections in a substantial document; do not reproduce every minor heading. A short page may need only clear headings.
- **Signposts:** State what the destination offers: “For how the estimates were calculated, see Appendix A: Estimation method,” not “See more.”
- **Return paths:** Give notes and supporting pages a usable way back to their originating passage or parent topic.
- **Readable hierarchy:** Use placement, spacing, and clear labels to subordinate support, not tiny type or low contrast. Preserve semantic headings for assistive navigation.
- **Proportion:** Add only navigation that helps this reader; do not impose a contents page, notes, and appendices on every short document.

## Check both paths

Use the same reader/task to compare the current and revised arrangement. First read the main path while skipping every optional note; then locate one named supporting detail and return to the main path.

| Desk-check case | Unlayered arrangement | Proposed arrangement and acceptance condition |
|---|---|---|
| Representative, hypothetical report export | Action, format history, field definitions, success check, and coverage limitation interrupt one another | Main text retains export action, date-range/total checks, and “Exports exclude archived records”; optional rationale becomes a note and field definitions a named appendix |
| Boundary: misleading simplification | Shorten the main text by moving the archived-record limitation to an appendix | Reject: readers could interpret an incomplete export as complete; restore the limitation beside the action |
| Missing navigation/rendering capability | Assume source links or note syntax work in the recipient's format | Check source destinations only and report the delivery check unavailable; do not claim a tested PDF/web reading path or install tooling without authorization |

These are synthetic editorial walkthroughs, not observed reader outcomes. For real validation, ask a target reader to complete the main task and find a supporting detail; record confusion, unnecessary jumps, and missing context without inventing improvement metrics.

## Evidence and maintenance

These are conditional editorial judgments informed by the following guidance, not universal word-count rules or proof of a readability effect. Chicago is a separate editorial tradition; GOV.UK and DWP are related sources, not independent confirmations of the same footnote advice.

| Source | Relevant guidance and limits |
|---|---|
| [Chicago Manual of Style: notes Q&A](https://www.chicagomanualofstyle.org/qanda/data/faq/topics/Documentation/faq0080.html) | Notes can cite sources or add explanation; placement depends on author/editor judgment about readers |
| [GOV.UK: Create a clear structure](https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/writing-guidelines/clear-structure/) | Discourages webpage footnotes: important information belongs in the body; unimportant information can be omitted |
| [DWP research report guidance](https://www.gov.uk/government/publications/dwp-research-reports-style-guide/dwp-research-reports-guidance) | Contents, standalone executive summary, and detailed methods/supporting material in appendices; publication-specific rules are not generic mandates |
| [Google: Organizing large documents](https://developers.google.com/tech-writing/two/large-docs) | Task-oriented outlines, navigation, and concepts near use; longer tutorials and reference documents can still suit their readers |
| [W3C: Headings](https://www.w3.org/WAI/tutorials/page-structure/headings/) | Semantic heading structure supports navigation, including assistive technology; not evidence for a specific note policy |

**Maintenance:** This addition has source reconciliation and synthetic checks, not target-reader validation. After the first 1–2 real uses, review which placement decisions helped or obstructed the task; retain, revise, or remove guidance accordingly.
