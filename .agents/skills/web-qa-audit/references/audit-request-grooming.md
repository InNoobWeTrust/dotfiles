# Audit Request Grooming

Use this reference when QA needs help **composing** an auditable input file before any browser execution starts.

---

## Goal

Turn a fuzzy request such as:
- “please test this PR”
- “retest this bug fix”
- “check checkout on mobile”

into a bounded, reviewable artifact such as:
- `qa/audit-requests/<run>.yaml`
- a run card
- a reusable scenario file

This is a **grooming mode**, not an execution mode.

---

## Auto-entry signals

Enter this path first when any of these are true:

1. the user wants executable QA, but no audit-request, run-card, or scenario input file exists yet
2. the skill was invoked directly by QA rather than delegated from `reviewer`, and the request is still broad or ambiguous
3. the user has a PR / bug / ticket but has not locked environment, auth, fixtures, top scenarios, or grading rules
4. a live browser run would require guessing the scope

If the inputs are already explicit and auditable, skip this path and move to the narrower execution path.

---

## Output contract

Before any browser run, produce exactly these layers in order:

1. **Missing assumptions / blockers**
2. **Proposed audit scope summary**
3. **Draft input artifact** (`audit-request.yaml`, run card, or scenario file)
4. **Review checklist for the human QA owner**

Do **not** start browser execution inside this path unless the user explicitly approves the draft and asks to continue.

---

## Interview workflow

### Phase 1 — Lock the run type

Identify what this request is:
- PR smoke / change validation
- bug repro / retest
- regression spot check
- release audit slice

If unclear, ask:

```text
What kind of QA request is this: PR smoke, bug retest, regression spot check, or release audit slice?
```

### Phase 2 — Lock target and access

Ask only for the minimum needed:
- sanctioned environment
- base URL or route entry point
- anonymous vs authenticated
- role/account type
- seed data / feature flags / setup assumptions

If environment or auth is unknown, stop at the assumptions layer instead of guessing.

### Phase 3 — Narrow the scope

Keep the first draft small:
- 1 feature/change
- 1 environment
- 1 role/account type
- 3–5 scenarios max

Ask for the top risky journeys, not everything.

Good question:

```text
What are the top 3 risky user journeys for this run?
```

Bad question:

```text
What should I test in the whole app?
```

### Phase 4 — Lock the rubric

For each scenario, collect:
- intent
- pass conditions
- fail conditions
- unverified conditions
- blocked prerequisites when relevant

If the operator gives only a broad intention, ask a narrowing follow-up:

```text
What exact user-visible result would prove this scenario passed?
```

### Phase 5 — Lock execution/report settings

Collect only what changes the run contract:
- browser(s)
- viewport(s)
- screenshot / trace expectations
- eng-only vs stakeholder-facing audience
- report template path if one exists

If there is no known template, leave that field blank or flag it as an open question.

---

## Recommended questioning style

Use short, serial questions.

Preferred pattern:
1. ask one narrow question
2. reflect the answer briefly
3. ask the next missing piece
4. summarize after 5–8 turns
5. draft the file only after enough fields are locked

Example:

```text
You said this is a preview-environment checkout retest for a seeded shopper account.
Next question: what seed data must exist before the run starts?
```

This is better than requesting a giant spec dump upfront.

---

## Questions to avoid

Do not ask:
- “Tell me everything about the feature”
- “Give me all requirements in detail”
- “What should I test?”
- “Can you explain the entire app flow?”

These waste time and increase ambiguity.

---

## Summary template before drafting

Before writing the file, produce this summary and ask for confirmation:

```text
Proposed audit scope
- Request type: ...
- Target: ...
- Environment: ...
- Auth / role: ...
- Fixtures / flags: ...
- Scenarios: ...
- Stop conditions: ...
- Audience: ...
- Open questions: ...
```

If the operator corrects anything, update the summary before drafting YAML.

---

## Drafting rules

When drafting the input file:
- use only explicit information gathered in the conversation
- if a field is missing, place it under `assumptions` or `open_questions`
- do not fabricate fixtures, URLs, roles, or rubrics
- prefer a small runnable draft over a comprehensive speculative one
- keep status terms aligned with the evidence model: `pass`, `fail`, `unverified`, `blocked`

---

## Escalation / stop conditions

Stop grooming and report back when:
- no sanctioned environment is available
- QA cannot identify a valid role/account model
- required fixtures or flags are unknown and critical
- scope is too large to fit one bounded request
- the user is actually asking for heuristic review only, not executable QA

In the last case, route back to `reviewer` rather than forcing orchestration.

---

## Hand-off conditions to execution

Only move from grooming to browser execution when all of these are true:

- target is sanctioned
- auth model is known or unnecessary
- fixtures are known or explicitly marked absent
- 1–5 scenarios are defined
- each scenario has pass/fail/unverified logic
- stop conditions are present
- a human QA owner has reviewed the draft

Then hand off to:
- `browser-audit-protocol.md` for bounded audits
- `browser-run-cookbook.md` when startup/auth/fixture mechanics need deeper execution planning
- `scenario-schema.md` when the artifact should become reusable coverage

---

## Anti-patterns

- jumping straight into browser automation from a vague request
- silently inventing fixtures or credentials
- writing a giant 20-scenario request for the first pass
- using grooming mode to self-approve execution scope with no QA confirmation
- rewriting weak rubrics after the run
- treating a reviewer-originated risk note as already-executable scope
