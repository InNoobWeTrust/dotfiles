= What DO-178B and DO-178C establish <standards>

DO-178B (1992) and DO-178C (2011) are editions of *Software Considerations in Airborne Systems and Equipment Certification*, paired with EUROCAE ED-12B/C. They describe software lifecycle objectives and evidence used in airborne certification, not a programming language, a mandatory waterfall method or a promise of zero defects. RTCA identifies C as the current edition and references FAA AC 20-115D as its recognition route. @rtca178 @jacklin2012

Certification concerns a particular aircraft or system and the applicable authority's accepted means of compliance. Buying a standard, following a checklist or using a vendor tool does not itself certify a product. These public notes do not determine whether DO-178B is permitted for a particular new or modified project.

== The assurance argument comes before the paperwork

#figure(
  block(width: 100%, inset: 12pt, fill: rgb("edf3f7"), radius: 4pt)[
    #align(center)[
      *System safety context* → *Software requirements* \
      ↓ \
      *Implementation* → *Requirements-based verification* \
      ↓ \
      *Controlled evidence* → *Certification assessment*
    ]
  ],
  caption: [A conceptual assurance chain. Planning, quality assurance, configuration control and discrepancy handling support every stage; this is not a mandated development sequence.],
)

*Requirements-based verification* checks intended behavior and relevant abnormal inputs against requirements, rather than merely testing whatever the implementation happens to do. *Traceability* connects requirements, implementation and tests so omissions and unjustified functionality can be investigated. *Configuration management* keeps the versions, dependencies and results belonging to a conclusion under control. @jacklin2012

These ideas were already central to B. NASA's comparison describes substantial continuity in software levels, lifecycle processes and verification; C clarifies and extends that foundation. Pothon's specialist interpretation—not regulator or normative text—also discusses clarifications to independence and reverification rather than treating them as inventions of C. @jacklin2012[§II] @pothon2012[§4.3]

== Rigor follows failure consequences

Software levels are assigned in the system safety context, not from code size or confidence in the developer. The following shorthand introduces the categories; it is not an assignment procedure. NASA's coverage tutorial predates C and supports B-era coverage foundations, not C-only changes. @jacklin2012[§II.A] @hayhurst2001[§2.2]

#table(
  columns: (auto, 1fr, 1.55fr),
  table.header([*Level*], [*Associated failure condition*], [*Structural coverage emphasis*]),
  [A], [Catastrophic], [Statement, decision and modified condition/decision coverage (MC/DC)],
  [B], [Hazardous / severe-major], [Statement and decision coverage],
  [C], [Major], [Statement coverage],
  [D], [Minor], [No structural coverage objective],
  [E], [No effect on safety], [No DO-178 software assurance objectives],
)

*Statement coverage* asks whether statements were exercised; *decision coverage* asks whether decision outcomes were exercised. *MC/DC* additionally asks whether each condition can independently affect its decision's outcome. These are structural measures, not a proof that the requirements are correct or that all defects have been eliminated. @hayhurst2001[§§2.2–2.5]

Structural coverage analysis supplements requirements-based tests. Uncovered code can indicate a missing test, a missing requirement, erroneous or extraneous code, or legitimate deactivated code; those cases require different resolution. Recording an explanation is not a license to retain unintended dead code. @hayhurst2001 @pothon2012

Some verification objectives require independence from the producer of the item being checked. The separation is objective-specific: a different name, organization or model provider alone does not demonstrate that the relevant independence condition is met. @pothon2012[§4.3]

== What C changed or clarified

#table(
  columns: (1fr, 2.65fr),
  table.header([*Topic*], [*B → C learning*]),
  [Bidirectional traceability], [C makes verifiable links in both directions explicit; B already had traceability intent. Forward links expose omissions; backward links expose unjustified implementation. @jacklin2012[§III.C]],
  [Additional executable code], [For Level A, compiler/linker-generated code not directly traceable to source needs additional verification. C makes this objective explicit in Annex A. @pothon2012[§4.3]],
  [Parameter data], [C gives explicit attention to parameter data affecting behavior: an executable depends on more than its source files. @jacklin2012[§III.D]],
  [Tool qualification], [B contained tool guidance; C uses criteria with separate DO-330 guidance. Intended use, possible errors and output checking matter more than the tool's brand. @jacklin2012[§§III.E, VI] @rapita330],
  [New technologies], [Technology supplements add, modify or delete applicable core guidance, rather than grant blanket exemptions. @rtca178],
)

The principal trace relationships include system-to-software requirements, high-to-low-level requirements, requirements-to-code and requirements-to-test cases, followed by cases-to-procedures and procedures-to-results. “B had no traceability” is therefore an incorrect account of the change. @jacklin2012[§III.C]

== Companion documents and their boundaries

#table(
  columns: (auto, 1fr),
  table.header([*Document*], [*Role*]),
  [DO-248C], [Supporting information, FAQs and discussion papers],
  [DO-330], [Standalone software tool qualification guidance],
  [DO-331], [Model-based development and verification supplement],
  [DO-332], [Object-oriented technology and related techniques supplement],
  [DO-333], [Formal methods supplement],
)

Formal methods can satisfy specified verification activities when their assumptions and remaining obligations are addressed. They are neither a universal replacement for testing nor categorically barred from replacing particular activities. A tool qualification argument is likewise bounded by the functions, version, operational environment and certification use involved; a qualification kit is not blanket qualification of every feature. @jacklin2012[§IX] @rapita330
