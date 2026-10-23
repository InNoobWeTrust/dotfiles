// Build: typst compile main.typ main.pdf
// Typst 0.15.1; built-in features and bundled Libertinus Serif; no packages.
#set document(title: "Intent Assurance for Agent Delivery", description: "Industry findings, source and code integrity, and a bounded owner-facing assurance workflow.")
#set text(font: "Libertinus Serif", lang: "en", size: 10.5pt)
#set page(paper: "a4", margin: (x: 22mm, y: 20mm), numbering: "1")
#set par(leading: 0.6em)
#set heading(numbering: "1.1")
#show heading: set text(fill: rgb("193b54"))
#set table(inset: 7pt, stroke: 0.4pt + rgb("c8d4df"), fill: (x, y) => if y == 0 { rgb("edf3f7") })

#text(size: 27pt, weight: "bold", fill: rgb("193b54"))[Intent assurance]

#text(size: 17pt)[Review the decisions and proof, not every generated line]

#v(8pt)
#table(columns: (auto, 1fr),
  table.header([*Reader contract*], [*What this guide provides*]),
  [Audience], [Technical owners and agent-workflow maintainers; basic delivery knowledge assumed.],
  [Purpose], [Detect misunderstood intent, contaminated inputs and unsupported delivery claims without exhaustive owner review.],
  [Scope], [Public industry accounts, general assurance principles and experimental guidance in this pack—not production certification or an audit of applications.],
)

*Bottom line:* give agents executable obligations and independent checks; give the owner consequential exceptions and selected proof. Existing code, tests and documents inform the work but must not silently rewrite approved intent.

*Evidence boundary:* industry reports describe particular teams, not universal causal proof. General review questions are not observed defects; governance changes and synthetic exercises do not establish reduced owner effort or reliable future compliance.

#outline(title: [Contents], depth: 2)
#pagebreak()
#include "details/findings.typ"
#pagebreak()
#include "details/operating-model.typ"
#pagebreak()
#include "details/materialization.typ"
#pagebreak()
= Sources <sources>
Public sources were inspected directly; multiple accounts from one company are not independent evidence lines. The source pack's approval, privacy and execution boundaries remain authoritative for its use; a vendor's merge policy is not permission here.
#bibliography("references.bib", title: none, style: "ieee")
