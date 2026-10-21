// Build: typst compile main.typ main.pdf
// Verified compiler: Typst 0.15.1. Built-in features; no external packages.
// Font: Libertinus Serif (bundled with Typst).
#set document(
  title: "DO-178B/C: Assurance Principles for Agent Workflows",
  description: "An introduction to airborne software assurance, cautious agent-workflow transfers, and the limits of preliminary experiments.",
)
#set text(font: "Libertinus Serif", lang: "en", size: 10.5pt)
#set page(paper: "a4", margin: (x: 22mm, y: 20mm), numbering: "1")
#set par(leading: 0.6em)
#set heading(numbering: "1.1")
#show heading: set text(fill: rgb("193b54"))
#set table(inset: 7pt, stroke: 0.4pt + rgb("c8d4df"), fill: (x, y) => if y == 0 { rgb("edf3f7") })

#text(size: 27pt, weight: "bold", fill: rgb("193b54"))[DO-178B/C]

#text(size: 17pt)[Assurance principles for agent workflows]

#v(8pt)
#table(
  columns: (auto, 1fr),
  table.header([*Reader contract*], [*What this guide provides*]),
  [Audience], [Agent-workflow maintainers and engineering leads. No aviation background is assumed.],
  [Purpose], [Understand the standards' core ideas, distinguish transferable mechanisms from analogy, and interpret the local experiments.],
  [Scope], [Public-source learning and provisional review practices—not certification guidance, a compliance audit, or proof of agent safety.],
)

*Bottom line:* build a defensible connection between specified behavior, relevant verification and the conclusion being claimed. Two-way review, source-first judgment and consequence-directed optional checks are implemented locally, but small exploratory comparisons did *not* demonstrate an advantage over baseline.

*Evidence boundary:* source research was conducted on 20 October 2026; this guide consolidates the subsequent exploratory work through 21 October 2026. Licensed normative standards were not inspected. Important authority and experiment limits remain alongside the claims they qualify.

#outline(title: [Contents], depth: 1)

#pagebreak()
#include "details/standards.typ"
#pagebreak()
#include "details/agent-practices.typ"
#pagebreak()
#include "details/evidence.typ"
#pagebreak()
= References and source limits <sources>

Normative RTCA DO-178B/C texts were not purchased or read; the public explanations cited here do not replace the applicable licensed texts or certification authority. Direct retrieval of FAA AC 20-115D returned HTTP 403, so detailed provisions and legacy-B transition permissions remain unverified. @faa20115d

The agent practices and experiments are local work, not NASA, RTCA or vendor findings. Provider diversity is not aviation independence; tool calls and checklist completion are not MC/DC. Neither the literature nor the local exploratory observations establish agent certification or comparative production effectiveness.

#bibliography("references.bib", title: none, style: "ieee")
