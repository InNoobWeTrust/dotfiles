# Scope and Boundaries

Use this reference first when deciding whether work belongs in an evaluative review flow, a QA orchestration flow, or a raw browser-control flow.

---

## Purpose

Keep responsibilities clean:
- evaluative review flow = judgment and escalation
- browser-control flow = direct interaction mechanics
- QA orchestration flow = evidence workflow, scenarios, and materialization planning

---

## Use an evaluative review flow when
- you are reviewing a PR, spec, screenshot set, acceptance criteria, or QA plan
- heuristic user-visible judgment is enough
- you need to decide whether browser evidence is required
- you are judging findings, not producing them

## Use a browser-control flow when
- you need direct browser control right now
- the task is a live repro, mechanical page verification, scrape, form-fill, or trace capture
- the problem is primarily about browser mechanics, selectors, waits, DOM reachability, or performance tooling

## Use a QA orchestration flow when
- you need a bounded QA run with explicit pass/fail/unverified outcomes
- you need a QA-scoped spot check with evidence expectations rather than one-off clicks
- you need run cards, fixture/auth assumptions, or audit evidence contracts
- you need a scenario pack or a materialization plan
- you want reusable QA artifacts rather than one-off clicks
- you need audience-adapted reports (Excel / PDF / static HTML) derived from QA evidence for business stakeholders

---

## Collaboration Pattern

1. An evaluative review flow identifies risk or the need for evidence.
2. A QA orchestration flow defines scope, scenario, run profile, and audit contract.
3. A browser-control flow executes the browser mechanics when live interaction is required.
4. The QA orchestration flow synthesizes machine evidence (YAML + engineering Markdown).
5. **Only if** audience is non-dev / business / release-owner: run projection gates, then project into Excel / PDF / optional static HTML.
6. The QA orchestration flow decides whether to materialize durable tests.

---

## Anti-Patterns

- stuffing run-book mechanics into the reviewer lens
- treating raw browser interaction as a full QA audit
- escalating every spot check into scenario design and materialization
- confusing performance-debugging with generic QA evidence collection
- handing business stakeholders raw scenario YAML as the primary report
- treating Excel/PDF as the source of truth instead of a projection of machine evidence
- forcing Stakeholder Pack ceremony on eng-only runs
- mapping unverified/blocked to pass in polished reports
- linking sensitive traces/screenshots into business-facing evidence indexes
