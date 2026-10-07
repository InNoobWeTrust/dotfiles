## The Four Pillars (Prompt Contract)

You own the **handoff**, whether the harness exposes a worker-definition field or only a task input. Implement every task pillar in the actual prompt and establish discovery through [Portable Worker Contract](worker-contract.md). Workers select and load useful working principles themselves; personality references and short hints are optional. Named, fallback, and dynamic workers must not depend on inherited parent context.

### Pillar 1 — Precise Scope Instruction

The main agent's environment usually exposes worker/agent names and descriptions. Since those may be generic, the delegation prompt **must** contain the specificity the description omitted.

Rules:
- State the exact deliverable (file paths, function names, URLs, data set, etc.).
- State what is out of scope explicitly.
- Never say "investigate the code" — say "read `src/auth/jwt.ts` lines 40–90 and identify any token expiry edge cases."
- **Context budget**: supply the smallest sufficient context that lets a competent worker begin: relevant decisions, contracts, sources, and boundaries. Use references or targeted excerpts instead of the whole conversation; do not omit essential constraints merely to shrink the prompt. Choose a budget suited to the task and model.
- **Understanding and authority**: state whether the assignment is investigation, design, implementation, or verification; what the user has agreed; what remains uncertain; and what observation the result should help evaluate. Do not present unsettled assumptions as requirements or turn an investigation into a repair mandate. Workers report evidence that changes the approach or exceeds their authority and stop affected implementation; the primary handles user realignment.
- **Code Implementer Contract Locking**: For code implementation tasks, include the exact locked interface signatures, DTO types, and error variants as code. Explicitly instruct the worker:
  > *"The provided interface signatures and DTO schemas are FROZEN. Do not rename methods, alter parameter orders, change types, or reinvent public shapes. Implement internal logic to satisfy this exact contract. If the contract is deficient or cannot be satisfied, STOP and report `INCOMPLETE: CONTRACT_DEFECT`."*

**Example of an exploratory scope** (pair with the Allowed Actions block below):

> Investigate the slow scan; concurrency is a hypothesis, not an approved solution. Inspect the supplied timing evidence and scanner entry point; do not modify code or run new workloads. Return the likely bottleneck, supporting and conflicting evidence, remaining uncertainty, and the next useful check. Report a missing source as a blocker rather than inventing a diagnosis.

### Pillar 2 — Structured Output Contract

Specify what the parent needs to decide next, including evidence, obstacles, uncertainty, and completion state. Choose a proportionate return shape and reporting budget; concise output is not permission to conceal diagnostics. Workers stop at declared task/action limits, not merely when they can fill a report.

**Default report for substantial work:**

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
TASK_COMPLETE, or INCOMPLETE with completed work, remaining steps, blocker, and next safe action.
```

The completion marker states whether the assigned work is complete, not whether the whole project is correct. Short execution-only tasks may use an [execution receipt](context-stewardship.md) instead of these headings; preserve the same material information.

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
Actual command/location, exit status, passed/failed/skipped checks, relevant failure excerpts, and unverified criteria; use approved artifact references if more output is needed.

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

Obstacle information is non-optional, whether in section 3 or a compact receipt. It captures:

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
- READ files: <list specific task files or glob patterns, e.g. src/auth/*.ts>
- READ guidance: <resolved applicable instruction/rule files, working-principles router/catalog, and selected style/domain references only>
- RUN commands: <list specific read-only commands, e.g. git diff HEAD~1 -- src/>
- NO file writes
- NO destructive commands (rm, mv, git reset, etc.)
- NO network requests beyond: <list domains or NONE>
```

For **standard implementation agents** that must write:

```
## Allowed Actions
- READ: all files under src/
- READ guidance: <resolved applicable instruction/rule files, working-principles router/catalog, and selected style/domain references only>
- WRITE: <specific files only, e.g. src/auth/jwt.ts, src/auth/jwt.test.ts>
- RUN: npm test, npm run lint
- NO modifying locked interface/DTO contracts or public signatures
- NO changes outside the listed write targets
- NO git commits or pushes
```

For **Clean-Room TDD implementation agents**:

```
## Allowed Actions
- READ: all files under src/ (EXCLUDING the unit test files and test helper files, e.g. *.test.ts, test_*.py)
- READ guidance: <resolved applicable instruction/rule files, working-principles router/catalog, and selected style/domain references only>; the test-file exclusion remains binding
- WRITE: <specific implementation files only, e.g. src/auth/jwt.ts>
- RUN: <specific test runner command, e.g. npm test -- src/auth/jwt.test.ts>
- NO reading or viewing of the unit test files
- NO modifying locked interface/DTO contracts or public signatures
- NO changes outside the listed write targets
- NO git commits or pushes
```

---

## Material decision brief (explain-before-question)

Use for any material decision, regardless of whether evidence came from main-thread investigation or delegated work. Worker output stays internal when delegation was used; this brief is the only user-facing handoff for the decision. Keep it concise and proportional — full shape when options differ materially, compact form otherwise; one-line summary for low-risk factual work with no decision requested. Do not use this multi-section template during active exploratory Q&A / problem discovery; reserve it for formal commitment gates (locking breaking contracts, irreversible architecture choices, or finalizing plans). In active Q&A, use 1–2 sentences of proportional context instead.

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

## ACI Pass — shared-understanding handoffs

- Result: PASS (instruction contract; not a hard permission boundary).
- Main risks: treating uncertainty as an approved requirement, turning investigation into repair, and hiding evidence that invalidates the chosen approach.
- Interface upgrades applied: assignment intent, settled versus open decisions, outcome-linked observations, exploratory example, and stop/report behavior. Existing exact scope, output contract, and Allowed Actions declarations remain required.
