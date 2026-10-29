---
metadata:
  maintenance-review: |-
    ACI source-interface evidence — source only, runtime compliance unverified,
    review after first 1–2 uses. Inputs/output/question set/failure contract
    declared; three medium examples; portable skill-relative links; no harness,
    install, or path assumed.
---

# Artifact Context — Settle Reader and Use Assumptions

Apply before authoring or updating any artifact: document, code, slide, visual,
config, or other output. Resolve who the artifact is for, why they need it, and
what constraints apply — before producing content. This is a crosscutting
pre-check, not a domain workflow or schema; it does not activate a documentation-domain or other medium-specific workflow.

**Scope:** every authoring or update task. Small edits (typos, formatting,
rewording within a settled context) reuse known context without ceremony;
they are not exempt from identifying it. Recheck changed assumptions when
audience, intended use or constraints change.

## Inputs

What to have before starting:
- Stated requirements or user intent
- Existing artifact (if updating)
- Intended use context

## Question set

Answer what is knowable; infer inconsequential gaps; stop affected writing on
high-impact unknowns.

| Question | What to establish |
|---|---|
| **Who?** | Human, machine consumer, API caller, or maintainer — more than one? List them. |
| **Expertise** | Prior knowledge and vocabulary the audience brings; what can be assumed without definition |
| **Purpose / use context** | The decision, action, or understanding the artifact enables |
| **Medium and constraints** | Format, rendering environment, length limits, access path (e.g., Markdown in a terminal, printed slide, API response) |
| **Earlier requirements / exclusions** | Domain schemas, licenses, directives, or audience-specific conventions already in force |

## Output

A minimal resolved reader context, used to shape the artifact. No compulsory
form or artifact block — a one-line mental note is sufficient for simple cases.
Carry only the relevant resolved constraints in authoring handoffs, not the
conversation or full research trail.

**Preserve:** existing domain metadata, frontmatter required by the owning
skill, licenses, and source citations the audience needs.  
**Exclude:** unrelated authoring provenance, session history, raw internal tool
output and secrets. Preserve requested research findings, methods, evidence and
limitations when they serve the artifact's audience; do not hide necessary facts
under the label of context removal.

## Updating an existing artifact

Preserve the established reader contract unless the user changes audience or
intent. Reuse settled assumptions without ceremony, but check new requirements
and re-evaluate affected assumptions when usage, audience or constraints change.

## Examples

| Situation | Resolved context |
|---|---|
| Code library README | Consumer: developer integrating the library; assumes language familiarity; purpose: understand usage and constraints; medium: Markdown on GitHub |
| Slide deck for leadership | Audience: non-technical executives; purpose: funding decision; medium: displayed slides; no code or jargon |
| Caller-facing skill description | Reader: routing agent; purpose: decide when to load; medium: compact YAML description field; execution guidance stays in the skill body |

## Failure contract

- **Missing high-impact context** (audience, purpose, or medium not inferable):
  ask before writing the affected section; do not fill in with alternatives or
  session history.
- **Conflicting requirements:** surface the conflict; do not silently resolve it.
- Medium-specific requirements: use an available medium or domain authoring capability, or state the constraints inline; e.g. human-facing technical documents need audience-appropriate structure, progressive disclosure and citations, while UI artifacts need journey, state and accessibility criteria. Do not duplicate that owner's full method here.
- No tool installs, network access, or environment assumptions required for this
  check.
