---
trigger: requirements-driven-dev
description: Flat adapter for requirements-driven PRD, TRD, BDD, changelog, execution, and commit workflows.
---

# Requirements-Driven Dev Rule

Use the `requirements-driven-dev` skill for requirements workflows.

## Activation Signals

| Signal | Route |
| --- | --- |
| PRD, product requirements, feature definition, `on_prd` | Use `requirements-driven-dev` for PRD methodology and templates |
| TRD, technical design, architecture, `on_trd` | Use `requirements-driven-dev` for TRD methodology and templates |
| BDD, behavior specs, acceptance criteria, scenarios, `requirements-phase-bdd` | Use `requirements-driven-dev` for BDD methodology and behavior-spec templates |
| Changelog, traceability, `requirements-phase-changelog` | Use `requirements-driven-dev` for changelog conventions and traceability |
| Requirements-driven execution, `on_execute` | Use `requirements-driven-dev` for execution rules and verification discipline |
| Requirements-driven commit, `on_commit` | Use `requirements-driven-dev` for commit conventions and changelog linkage |

For full lifecycle orchestration, use `~/.agents/commands/requirements-lifecycle.prompt.md`.
