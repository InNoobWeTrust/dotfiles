# Black-Box QA Reviewer

User-observable review for applications, especially web frontends. This lens answers a different question than code-quality or security:

> **Can a real user complete the task successfully, across expected devices and interaction modes, without relying on implementation details?**

Use this lens when reviewing UI features, acceptance/E2E artifacts, browser-audit outputs, responsive changes, accessibility-sensitive flows, or regression-prone user journeys.

---

## Relationship to Other Sub-Reviewers

- **`code-quality.md`** checks structural maintainability. This lens checks user-visible behavior.
- **`design-rigor.md`** checks whether the solution was properly designed and investigated. This lens checks whether the experience actually works.
- **`security.md`** finds vulnerabilities and abuse paths. This lens checks what a normal user perceives and whether failures are survivable.
- **`edge-case-hunter.md`** enumerates internal branching paths. This lens evaluates external task completion, state transitions, and interaction choreography.
- **`editorial.md`** refines wording. This lens finds whether the wording is usable in context (forms, errors, instructions).

Run this lens early for frontend work. A feature can be structurally elegant and still fail the user.

---

## Scope

### In scope
- Web frontend task completion
- Forms, validation, feedback, and recovery
- Loading, empty, success, and error states
- Navigation, URL/state continuity, and back/refresh behavior
- Responsive/mobile behavior
- Accessibility & Keyboard Access
- Cross-browser sanity
- Perceived performance and obvious regressions
- Browser-audit reports, E2E specs, and acceptance journey definitions

### Out of scope
- Internal code architecture
- Security threat modeling beyond user-visible trust/safety breakdowns
- Backend correctness when there is no user-visible manifestation
- Pure copy-editing without UX context

---

## Core Law

> **Judge the experience from the outside in.**

Do not rely on implementation details such as component names, CSS selectors, framework patterns, or hidden state. Score what a user can perceive and accomplish.

---

## Review Modes

### Mode 1: Heuristic review
Use when you have PRs, screenshots, acceptance criteria, Storybook outputs, design docs, diffs, traces, or a browser-audit summary — but not necessarily a runnable app.

### Mode 2: Browser audit
Use when the application is runnable and browser automation is available. Execute the user journeys, capture screenshots/traces, and report failures with repro steps.

### Mode 3: Test materialization
Use when the feature is stable enough to convert critical journeys into durable automated tests (E2E, accessibility smoke, responsive checks, visual diffs, performance budgets).

---

## Attack Vectors

### 1. User Journey Choreography
- Is the happy path obvious from the first screen?
- Can a first-time user complete the task without hidden prerequisites?
- Are success, failure, and recovery paths all coherent?
- Are key state transitions visible, timely, and understandable?
- Does the flow survive back/refresh/re-entry in a predictable way?

### 2. Forms & Input Handling
- Are labels, required fields, and input expectations obvious?
- Are validation errors specific, timely, and actionable?
- Does submit enable/disable behavior match user expectations?
- After failure, is useful input preserved and sensitive input handled appropriately?
- Is duplicate submission prevented or explained?

### 3. State Coverage
- What do loading, empty, success, partial, and error states look like?
- Are retries possible and understandable?
- Does the system avoid “blank screen” ambiguity?
- Are long-running states distinguishable from broken states?

### 4. Navigation & State Continuity
- Do URLs, tabs, modals, drawers, and back/forward actions behave predictably?
- Can users recover their place after refresh or deep-link entry?
- Does state persistence help rather than confuse?

### 5. Responsive & Viewport Behavior
- Does the UI remain operable on common mobile, tablet, and desktop widths?
- Are controls clipped, obscured, or pushed below sticky overlays?
- Are tap targets usable and key actions reachable?
- Does keyboard-open or zoom create unusable layouts on mobile?

### 6. Accessibility & Keyboard Access
- Can the flow be completed without a mouse?
- Is focus visible, logical, and retained through dialogs and route changes?
- Are control names, errors, and status messages available to assistive technology?
- Is color the only signal for important state?

### 7. Cross-Browser & Device Sanity
- What user-visible behaviors are likely to diverge across Chromium, Firefox, and WebKit?
- Are browser-sensitive controls, layouts, uploads, media, or clipboard flows covered?
- Is the critical path still usable on the minimum supported matrix?

### 8. Perceived Performance
- Does the page feel responsive during the critical journey?
- Is critical content visible quickly enough to orient the user?
- Are layout jumps, jank, or interaction stalls obvious?
- Does the experience respect known budgets such as LCP / INP / CLS when evidence exists?

### 9. Data Presentation Integrity
- Are dates, numbers, currency, filters, sort order, and empty states trustworthy?
- Is truncation hiding critical meaning?
- Does the UI imply freshness or persistence it cannot guarantee?

### 10. Regression-Sensitive Visual/Interaction Surfaces
- Are overlays, z-index layers, fixed bars, dropdowns, and animations still usable?
- Have spacing/alignment regressions broken the flow?
- Are visual changes cosmetic, or do they block task completion?

---

## Execution Boundary

### Heuristic review
Use when only artifacts are available. Produce findings from the attack vectors above, then call out what requires live browser evidence.

### Executable QA handoff
If the app is runnable and live evidence is required, delegate to the project’s executable QA workflow rather than expanding this lens into a run-book. If the need is a quick browser interaction or live repro, use browser automation directly. If the need is a structured audit, scenario pack, or test-materialization plan, hand off to the dedicated QA automation/audit skill. If business stakeholders need Excel, PDF, or hosted HTML summaries, that projection also belongs to the executable QA workflow (stakeholder-report path, only when audience is non-dev) — this lens stays evaluative and does not invent stakeholder packs.

Not every heuristic becomes a test. Only stable, repeatable, high-value assertions should graduate into a durable suite.

---

## Output Format

```markdown
## Black-Box QA Review: [Target]

**Mode**: Heuristic review / Browser audit / Test materialization
**Primary journey**: [task being evaluated]
**Coverage**: [happy path, error path, mobile viewport, keyboard nav, etc.]

### Critical Findings
- [Severity] [Journey/selector/viewport] — observed failure, user impact, repro

### High Priority Findings
- ...

### Passed Checks
- [Positive proof of behaviors that worked]

### Regression Candidates
- [Stable scenarios worth converting into durable tests]

### Evidence
- [screenshots, trace names, acceptance artifact, browser matrix, or “heuristic only” note]
```

---

## Rules

1. **User-visible first** — do not anchor on internal implementation details.
2. **Evidence beats intuition** — if live browser proof exists, prefer it over speculation.
3. **State completeness matters** — loading/error/empty paths count as product behavior.
4. **Mobile and keyboard are not edge cases** — they are part of the normal review surface.
5. **Do not over-automate heuristics** — only materialize stable, high-value checks into the test suite.
6. **Escalate appropriately** — if a finding requires real browser evidence, say so rather than pretending the heuristic is final proof.

---

## Related References

- `references/sub-reviewers/security.md` — for user-visible trust/safety concerns that may mask deeper vulnerabilities
- `references/sub-reviewers/editorial.md` — for wording-level follow-up after UX issues are identified
