// Research book entry: shared presentation, included chapters and bibliography.
#set document(title: "Cordis, Spatiotemporal Composability and Flow-Based Programming")
#set page(paper: "a4", margin: 22mm, numbering: "1")
#set text(font: "Libertinus Serif", size: 11pt, lang: "en")
#set par(spacing: 0.7em, first-line-indent: 0pt)
#set heading(numbering: "1.1")
#show raw: set text(font: "DejaVu Sans Mono", size: 9pt)
#show heading: set block(above: 1.2em, below: 0.5em)

#title[ Cordis, Spatiotemporal Composability and Flow-Based Programming ]
#text(size: 13pt)[Research findings and conditional agent-design lessons]

*Research-phase — not battle-tested. Source snapshot: 29 October 2026; synthesis: 30 October 2026.*

#table(
  columns: (auto, 1fr),
  inset: 7pt,
  table.header([*Reader contract*], [*Value*]),
  [Audience], [Technically literate maintainers and agents; familiarity with modules, dependencies and asynchronous execution is assumed.],
  [Purpose], [Understand two distinct composition models and evaluate optional questions for design and implementation.],
  [Scope], [Primary-source findings, limitations, conditional guidance and one pilot; no framework adoption, production promotion or performance claim.],
)

*Read first:* lifecycle cleanup is not arbitrary rollback; bounded buffers do not guarantee progress; context controls do not sandbox hostile code. No local accepted use or measured agent improvement is claimed.

#outline(title: [Contents])
#pagebreak()
#include "details/foundations.typ"
#pagebreak()
#include "details/limits.typ"
#pagebreak()
#include "details/guidance.typ"
#pagebreak()
#include "details/evidence.typ"
#pagebreak()
#bibliography("references.bib", title: [Sources])
