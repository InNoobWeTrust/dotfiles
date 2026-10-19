// Build locally with Typst 0.15.1: typst compile main.typ
// Built-in features only; fonts: Libertinus Serif and New Computer Modern Math.
#set document(title: "Chirality and Agentic AI: Useful Analogies, Not Safety Proofs", description: "Chemical feedback and stereoselectivity as inspiration for evidence-grounded agent controls and falsifiable research hypotheses.")
#set text(font: "Libertinus Serif", lang: "en", size: 10.5pt)
#set page(paper: "a4", margin: (x: 21mm, y: 19mm), numbering: "1")
#set par(justify: true, leading: 0.65em)
#set heading(numbering: "1.1")
#set table(stroke: 0.4pt + rgb("ccd4df"), fill: (x, y) => if y == 0 { rgb("edf2f7") })
#show heading: set text(fill: rgb("173c5b"))

#text(size: 24pt, weight: "bold", fill: rgb("173c5b"))[Chirality and Agentic AI]

#text(size: 15pt)[Useful analogies, not safety proofs]

#v(6pt)
#table(
  columns: (auto, 1fr), inset: 6pt,
  [*Audience*], [A technically curious reader exploring chemistry-inspired AI controls; basic agent/tool concepts assumed, chemistry explained below.],
  [*Purpose*], [Separate factual chemistry, useful engineering intuitions, and claims requiring experiments.],
  [*Scope*], [Chemical mechanisms, candidate agent controls, preliminary software findings, and swarm-inspired research hypotheses; no claim of validated effectiveness.],
)

*Bottom line:* stop unsupported intermediate claims from acquiring authority through repetition. Four candidate controls—evidence-seeking criticism, claim quarantine, pre-action checks, and evidence-preserving restarts—offer a research direction, but their effectiveness cannot be derived from molecular chemistry.

#outline(title: [Reading map], depth: 1)

= What the chemistry actually establishes

*Chirality* is molecular handedness: enantiomers are non-superimposable mirror-image forms, conventionally designated $R$ and $S$ where applicable. Their relative amounts can be summarized by the magnitude of enantiomeric excess, $"ee" = abs(n_R - n_S)/(n_R + n_S)$, for a nonempty two-enantiomer mixture; this composition statistic says nothing about which outcome is desirable. @blackmond

== Nobel context and chemical mechanisms

*2026 Nobel Prize:* Henri B. Kagan and Kenso Soai received the chemistry prize “for the discovery of non-linear effects and autocatalysis in asymmetric organic synthesis,” announced on 7 October 2026. *2021 Nobel Prize:* Benjamin List and David W. C. MacMillan received the chemistry prize “for the development of asymmetric organocatalysis”; these are related contributions, not the same award or mechanism. @nobel2026 @nobel2021

*Frank’s 1953 model* combines self-reproduction with mutual antagonism: opposite enantiomers deactivate one another. Crucially, the combination can *amplify an initial imbalance*, rather than restore balance; it does not chemically recognize a “wrong” handedness, so symmetric opposition is not inherently a stabilizing mechanism. @blackmond

Represent the deactivation schematically as $R + S -> I$, with $I$ an inactive heterochiral species. Calling every such species a *meso compound* is unjustified without its structure: a mixed-handed aggregate is not automatically a molecule with the internal symmetry required for meso classification.

*Kagan-type nonlinear effects* mean that product ee need not vary linearly with catalyst ee. In reservoir models, heterochiral aggregates sequester both catalyst enantiomers and can enrich the remaining active fraction; the relevant aggregates are not generically “bad” catalyst molecules, and their activities and equilibria matter. @blackmond @nobel2026popular

Some models have catalytically inactive heterochiral species; others have less-active heterochiral species that produce racemic product. Such sequestration can *enhance* stereochemical bias—another reason it does not prove that memory quarantine suppresses an agent’s confirmation bias. @blackmond

*Soai’s reaction* demonstrates asymmetric autocatalysis with amplification of enantiomeric excess: the product-derived zinc alkoxide catalyzes further formation of the same product. Soai and colleagues reported the key discovery in 1995; product/catalyst aggregation, substrate binding, and relative species activities are essential to understanding how this feedback operates. @soai @athavale

Use simple dimer pictures as explanatory models, not a settled universal structure for Soai chemistry: Athavale et al.’s 2020 experimental/computational study develops a tetrameric catalyst and transition-state model. Demonstrating that a laboratory reaction can generate very high ee also does not establish that this reaction actually caused biological homochirality on early Earth. @athavale @blackmond

*Racemization* is interconversion that reduces enantiomeric enrichment toward a racemate under suitable conditions. A 1:1 molecular equilibrium is the idealized expectation for enantiomers interconverting in an achiral environment without selective removal; heating alone does not guarantee rapid, clean racemization, and coupling interconversion to phase separation can give different overall outcomes. @blackmond

*Asymmetric organocatalysis* favors one stereochemical pathway using a chiral organic catalyst. Favoring a pathway is not the same as making every competing pathway impossible; electronic activation and catalyst–substrate organization matter alongside steric effects. @nobel2021popular

For two competing, kinetically controlled pathways with comparable prefactors, define $Delta Delta G^‡ = G^‡_("minor") - G^‡_("major")$. The usual transition-state estimate gives
$ k_("major") / k_("minor") approx exp((Delta Delta G^‡) / (R T)). $
Here $R$ is the gas constant and $T$ the absolute temperature; a finite barrier difference gives finite selectivity, not a guarantee of zero unwanted product. This relationship is chemical background, consistent with transition-state/selectivity comparisons in the mechanistic literature, not a model of how a validator changes an LLM’s error probability. @athavale

= Four analogies, with their limits visible

#table(
  columns: (1fr, 1.15fr, 1.45fr), inset: 7pt,
  table.header([*Chemical inspiration*], [*Proposed AI control*], [*Boundary of the analogy*]),
  [Competing enantiomers], [Evidence-seeking critic], [Opposed claims do not cancel like molecular species; multiple explanations can both contribute.],
  [Catalyst sequestration], [Quarantine unverified claims], [A prompt label does not physically isolate information or establish truth.],
  [Stereoselective catalysis], [Pre-execution gateway], [A schema enforces structure; permissions and semantic checks enforce only their stated rules.],
  [Racemization], [Restart a stagnant search], [Do not restore equal belief in unequal hypotheses or erase evidence and constraints.],
)

#figure(
  block(width: 100%, inset: 10pt, fill: rgb("edf2f7"), radius: 4pt)[
    #align(center)[
      *Candidate claim* → *Discriminating test* → *Observation ledger* \
      ↓ \
      *Evidence review* → *Permission and semantic checks* → *Action* \
      ↓ \
      *Check postcondition; retain failures; restart only the hypothesis search*
    ]
  ],
  caption: [Proposed control flow, not an experimentally validated architecture. Claims require observations before they guide consequential action; failed checks preserve evidence and return to testing.],
)

#include "details/ai.typ"

#include "details/findings.typ"

#block[
  #set par(leading: 0.5em)
  #include "details/swarm.typ"
]

= Conclusion

The chemistry supplies a vocabulary for feedback, selectivity, and sequestration—not a proof that opposing agents eliminate hallucinations. Prefer controls that preserve source lineage, distinguish observations from interpretations, and enforce permissions outside the model; test whether the metaphor-inspired additions outperform simpler, compute-matched alternatives.

*Evidence status:* historical and chemical facts require the sources below; the AI papers provide related precedents, not validation of this combined design. The preliminary software trials reported here are developmental observations, not a controlled benchmark or a chemistry experiment; neither effectiveness nor novelty is established.

#pagebreak(weak: true)
= References <sources>

#bibliography("references.bib", title: none, style: "ieee")
