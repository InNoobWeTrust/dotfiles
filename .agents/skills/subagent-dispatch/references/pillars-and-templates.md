## The Four Pillars (Input-Side Only)

Because you own the **input prompt**, not the delegated worker's config, every pillar is implemented inside the prompt you write.

### Pillar 1 — Precise Scope Instruction

The main agent's environment usually exposes worker/agent names and descriptions. Since those may be generic, the delegation prompt **must** contain the specificity the description omitted.

Rules:
- State the exact deliverable (file paths, function names, URLs, data set, etc.).
- State what is out of scope explicitly.
- Never say "investigate the code" — say "read `src/auth/jwt.ts` lines 40–90 and identify any token expiry edge cases."
- **Context budget**: limit pasted context to the minimum that would let a competent engineer start immediately — typically under 500 lines or one logical unit. A delegated worker receiving a 50k-token blob will still wander regardless of how precise the task statement is.

### Pillar 2 — Structured Output Contract

Include a numbered output template in the prompt. The delegated worker fills in each section and stops when all sections are complete. This is the primary mechanism to prevent runaway execution.

**Required sections for any delegation:**

```
Return your findings in exactly this format:

## 1. Objective Recap
One sentence restating what you were asked to do.

## 2. Findings
<domain-specific findings here>

## 3. Obstacles Encountered
List any: setup issues · workarounds used · commands that needed special flags
· dependencies or imports that caused problems · environment quirks.
Write NONE if the task was clean.

## 4. Confidence & Caveats
Rate your confidence (High / Medium / Low) and list any assumptions made.

## 5. Done Signal
Write exactly: TASK_COMPLETE
```

The `DONE Signal` section forces an unambiguous completion marker the orchestrating agent can scan for.

**Domain-specific Findings templates** — slot one into section 2 based on task type:

<details>
<summary>Code review</summary>

```
## 2. Findings

### Critical Issues
Security vulnerabilities, data integrity risks, or logic errors requiring immediate fix.

### Major Issues
Architecture misalignment, quality problems, or significant performance concerns.

### Minor Issues
Style inconsistencies, documentation gaps, minor optimizations.

### Approval Status
APPROVE | APPROVE_WITH_CHANGES | REJECT — and one sentence why.
```

</details>

<details>
<summary>Research / analysis</summary>

```
## 2. Findings

### Summary
Two-to-four sentence overview.

### Key Evidence
Bullet list of concrete facts, values, or citations.

### Open Questions
What you could not confirm and why.
```

</details>

<details>
<summary>Implementation / code change</summary>

```
## 2. Findings

### Changes Made
File-by-file list of what was changed and why.

### Verification Result
Output of the test/lint/typecheck command run after changes.

### Rollback Notes
What to undo and how if the change needs reverting.
```

</details>

<details>
<summary>Debugging / investigation</summary>

```
## 2. Findings

### Root Cause
One clear sentence.

### Evidence Trail
Observable symptoms, commands/results, code locations, and minimal causal explanation linking them. Do not include private chain-of-thought or reasoning traces.

### Proposed Fix
Concrete code or config change. State UNKNOWN if not found.
```

</details>

---

Section 3 of the output template ("Obstacles Encountered") is non-optional. It captures:

- Commands that needed special flags or env vars
- Dependencies or imports that failed and how they were resolved
- Environment quirks (missing tools, wrong versions, permission errors)
- Workarounds discovered mid-task

**Why it matters**: without this, the orchestrating agent rediscovers the same issues on its own, wasting tokens and time.

If the delegated worker has no obstacles to report, it writes `NONE`. This still confirms the section was evaluated.

---

### Pillar 4 — Allowed Actions Declaration

You cannot change which tools the delegated worker has access to. You compensate by **declaring allowed actions in the prompt** and relying on the worker's instruction-following to respect them.

> **Soft contract**: this is enforced by instruction-following, not a hard sandbox. If hard tool isolation is required, configure actual permission grants separately — this declaration alone does not provide it.

Include a `## Allowed Actions` block in every delegation prompt:

```
## Allowed Actions
- READ files: <list specific files or glob patterns, e.g. src/auth/*.ts>
- RUN commands: <list specific read-only commands, e.g. git diff HEAD~1 -- src/>
- NO file writes
- NO destructive commands (rm, mv, git reset, etc.)
- NO network requests beyond: <list domains or NONE>
```

For **standard implementation agents** that must write:

```
## Allowed Actions
- READ: all files under src/
- WRITE: <specific files only, e.g. src/auth/jwt.ts, src/auth/jwt.test.ts>
- RUN: npm test, npm run lint
- NO changes outside the listed write targets
- NO git commits or pushes
```

For **Clean-Room TDD implementation agents**:

```
## Allowed Actions
- READ: all files under src/ (EXCLUDING the unit test files and test helper files, e.g. *.test.ts, test_*.py)
- WRITE: <specific implementation files only, e.g. src/auth/jwt.ts>
- RUN: <specific test runner command, e.g. npm test -- src/auth/jwt.test.ts>
- NO reading or viewing of the unit test files
- NO changes outside the listed write targets
- NO git commits or pushes
```

---

## Material decision brief (explain-before-question)

Use for any material decision, regardless of whether evidence came from main-thread investigation or delegated work. Worker output stays internal when delegation was used; this brief is the only user-facing handoff for the decision. Keep it concise and proportional — full shape when options differ materially, compact form otherwise; one-line summary for low-risk factual work with no decision requested.

```
### Decision brief: [the approval or choice needed]
- Observed facts / evidence: [verifiable findings + sources; no inference]
- Interpretation: [what the facts suggest; labeled as inference]
- Unknowns: [what could not be confirmed and why]
- Mental model: [2–3 plain-language sentences on how the relevant part works]
- Key terms: [each decision-relevant term — one-line definition]
- Example: [one project-specific consequence, e.g. "in `src/auth/jwt.ts` this means ..."]
- Options & consequences:
  - A — [what changes] → [practical consequence / reversibility / risk]
  - B — [what changes] → [practical consequence / reversibility / risk]
- Recommendation: [A/B + one sentence why when justified; otherwise "No recommendation — insufficient evidence" with the verification or gap report]
```

Rules:
- Never forward worker prose or transcripts verbatim; never expose chain-of-thought or orchestration mechanics; keep user-facing output to a concise evidence summary.
- Never ask a question that depends on unseen files or results — explain first.
- If evidence cannot support the brief, verify or report the gap; do not manufacture certainty.
- After the user answers, restate the agreed model and remaining uncertainties. An answer given without adequate context is non-binding: explicitly say the earlier answer lacked context, present the missing context, and ask the user to confirm or change that decision; never silently upgrade the old answer.
