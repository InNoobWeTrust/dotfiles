# workflow-a-create

## Workflow A — Create or Modify a Skill

For an existing skill, confirm the gap and preserve its intended contract; do not
repeat new-skill justification or registration unless scope/routing changes.

### Phase A1 — Validate Need for a New Skill

1. **Does an existing skill already cover this?** Check `skills/INDEX` — could this be handled by extending an existing skill with a new `references/` file?

2. **Does this task type repeat frequently?** A skill is warranted when:
   - The task type repeats 3+ times per sprint
   - The task has multiple phases that must be executed in order
   - Doing the task well requires methodology not obvious from the codebase alone
   - The cost of doing the task poorly is high

3. **Is this NOT a one-off?** Do NOT create a skill for one-off tasks, tasks describable in a single sentence, or tasks already covered by an existing skill.

**STOP CONDITION**: If any answer is "no," propose extending an existing skill or using a general-purpose approach.

### Phase A2 — Define Skill Scope

Write the contract before the body:

1. **Name**: Lowercase, kebab-case, unique.
2. **Purpose**: One sentence — what does this skill do?
3. **Trigger phrases**: 5-8 phrases users might say (in quotes).
4. **Exclusion criteria**: When should this skill NOT be loaded?
5. **Inputs**: What does the skill need to start?
6. **Outputs**: What does the skill produce?
7. **Estimated phases**: 3-10 is typical.
8. **Reader and capability contract**: Who acts, what context/resources can they access, and what happens if a capability is missing? Apply `portability-and-reader-contract.md`; declare product-specific requirements rather than assuming a local setup.

**Deliverable**:
```
SKILL SCOPE
===========
Name              : [kebab-case]
Purpose           : [one sentence]
Triggers          : ["trigger 1", "trigger 2", ...]
Exclusions        : [when NOT to load]
Inputs            : [what's needed]
Outputs           : [what's produced]
Estimated phases  : [N]
```

### Phase A3 — Design the Workflow

Design each phase before writing prose:

1. **Phase list**: Name + one-sentence purpose per phase. Sequential order.
2. **Stop conditions**: 2-5 gates where execution must halt.
3. **Deliverable checklist**: 5-10 completion criteria.
4. **Anti-patterns**: 5-10 shortcuts the AI will try, with why wrong + correct path.
5. **ACI pass**: if the skill/command/tool exposes an interface another agent must use, run `references/aci-checklist.md`, note any guardrails or examples that belong in the interface contract, and leave the `ACI Pass` evidence block in the workflow/design outline or in the short-term handoff/checkpoint entry if work pauses.

For choice comparisons, apply [searchable choice catalogs](portability-and-reader-contract.md#searchable-choice-catalogs): put capability-based alternatives in an existing suitable CSV catalog, and keep only the retrieval instructions and essential constraints in the workflow.

**Format**:
```
WORKFLOW OUTLINE
================
Phase 1 — [Name]: [Purpose. Steps. Artifacts.]
...
STOP CONDITIONS:
- [condition] → [action]
DELIVERABLES:
- [ ] [criterion]
ANTI-PATTERNS:
| Shortcut | Why Wrong | Correct Path |
|---|---|---|
```

### Phase A4 — Write SKILL.md

Write the file following the documented template:

Carry the A2 inputs, reader assumptions, authority and capability/absence contract
into the body or an explicit reachable resource; do not leave it only in a design outline.

1. **YAML frontmatter**: `name`, `description` (2-5 sentences with trigger phrases AND exclusion criteria). Use `\"` to escape internal quotes. Do NOT duplicate description content in the skill body.

2. **Intro paragraph**: 1-2 sentences expanding the frontmatter with post-loading context.

3. **Workflow phases**: One section per phase. Purpose, exact steps, artifacts. Mark mandatory explicitly.

4. **Stop conditions section**: Every condition that halts execution.

5. **Deliverable checklist**: Markdown checkboxes.

6. **Anti-pattern table**: 5-10 rows (Temptation, Why Wrong, Correct Path).

7. **ACI details when applicable**: examples, explicit path roots/file shapes, failure modes, and misuse-resistant wording. Resolve absolute tool paths at runtime; do not publish host-specific paths as reusable prerequisites.

8. **References section**: Related docs, skills, or reference files that exist and resolve from an explicit root. A planned reference is unfinished work, not a usable resource. Deployment records do not become reusable methodology merely by moving them to `references/`.

**Length guideline**: Aim for a router under ~150 lines; 500 lines is the upper guideline, not a target. Move relevant deep methods and variants to `references/`, not unrelated deployment details. Before delivery, check the native-capability, configured-integration and unavailable-capability scenarios and read the workflow without its author chat. Report walkthroughs separately from executed behavior.

### Phase A5 — Register the Skill

1. **Add to INDEX**: New row in the routing table:
   ```
   | `skill-name` | cost | Use When: [from trigger phrases] | Do Not Use When: [exclusion criteria] |
   ```
   Cost: low (simple), medium (multi-phase with tooling), high (multi-agent/external).

2. **Add to WIRING**: If the skill composes with others, add composition patterns and handoff points.

3. **Create directory**: `skills/<skill-name>/` with `SKILL.md`, optionally `references/` and `assets/`.

### Phase A6 — Queue for Audit

Mark the new skill for maintenance rotation:
- **Lifecycle stage**: Stage 1: Prototype (1-2 uses). Track first usage in whatever audit system the org maintains.
- Register the creation date as a known point for the next quarterly audit cycle.

Before expanding guidance, use a small paired evaluation on representative tasks:
compare the current guidance with the proposed revision under the same inputs,
capabilities and acceptance criteria. Include a failure/unavailable-capability case.
Correctness and safety are gates; only then compare unnecessary edits, completion
time and user corrections. Keep evaluation notes in the existing audit/task record,
not an always-on checklist or new benchmark framework. Separate observed runs from
walkthroughs, record confounders, and report missing evidence instead of inventing
improvement metrics. After the first 1–2 real uses, retain, revise or remove the
guidance based on those observations.

---
