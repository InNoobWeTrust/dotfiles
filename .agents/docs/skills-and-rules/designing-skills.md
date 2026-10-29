# Designing a Skill from Scratch

### When to Create a Skill

A skill is warranted when:

1. A task type repeats frequently (3+ times per sprint)
2. The task has multiple phases that must be executed in order
3. Doing the task well requires methodology that isn't obvious from the codebase alone
4. The cost of doing the task poorly is high (bugs, rework, architectural damage)

Do NOT create a skill for:
- One-off tasks
- Tasks that can be described in a single sentence
- Tasks already covered by an existing skill (extend that skill instead)

### The Anatomy of a Skill

Every skill has this structure:

```
skills/<skill-name>/
├── SKILL.md                 # Main workflow document
├── references/              # Deep-dive guides loaded on demand
│   ├── <topic-1>.md
│   ├── <topic-2>.md
│   └── templates/          # Output templates (optional)
└── assets/                  # Data files, CSVs, images (optional)
```

### Keep Reusable Skills Portable and Self-Contained

Write reusable skills for the capability and workflow, not the author's current
machine or harness. “Use an existing solution” means discover and reuse what the
current environment provides; it does not mean require a particular integration.

- **Discover the interface:** Native harness tools, configured integrations and
  other authorized existing interfaces may satisfy the same capability. Read the
  available interface's contract rather than inventing a tool name or schema.
- **Keep the workflow self-contained:** Include the inputs, decision process,
  outputs, safety boundaries and unavailable-capability behavior needed to act
  without the author's chat or local setup. Do not require a machine-specific adapter.
- **Hand off by capability:** State the required work, inputs, output/evidence,
  authority and absence behavior, not another skill's identity or path. Preserve
  essential method details locally or as an actionable required-input contract;
  generic wording must not remove the original safety stops.
- **Separate deployment details:** Named servers, providers, credentials, local
  paths and exact API payloads belong in the relevant integration's documentation,
  not as prerequisites in a reusable skill or its routing pointers.
- **Check portability:** Walk through a harness with a native capability, one
  with a configured integration, and one without the capability. The workflow
  should remain usable or state its limitation without installing a replacement.
  Check the complete directory copied alone, including scripts/templates/catalogs,
  and confirm a sibling rename needs no operational edit to another skill.

For example, say “consult an available decision-support capability using its
documented interface,” not “load our decision-server adapter and call `evaluate`.”
A genuinely product-specific skill may name its required product, but declare
that scope explicitly rather than narrowing a generic request implicitly.

Concrete identities belong in installation/discovery maps, not reusable method
dependencies. See [Portable skill bundles](skill-portability.md) for the boundary,
semantic-preservation check and rename checklist.

### Writing the SKILL.md

A SKILL.md starts with YAML frontmatter (used by the harness for semantic matching and trigger routing) followed by the workflow body. The frontmatter replaces any inline "When to Load" section — that information is redundant once the skill is already loaded, so keep it out of the body to conserve context.

#### Section 1: YAML Frontmatter (Harness Matching)

The file MUST begin with a YAML frontmatter block delimited by `---`. Two fields are required:

- **`name`** — Machine-readable skill identifier (lowercase, kebab-case)
- **`description`** — Semantic matching string. Contains what the skill does, when to use it, trigger phrases, and exclusion criteria. The harness uses this to decide whether to surface the skill to the agent. It is NOT re-injected into the skill body — the agent does not re-read it after loading.

```
---
name: code-craft
description: "Use for non-trivial implementation, fixes, approved refactoring, and behavior/acceptance specifications. Prioritize the simplest verified working solution and fast feedback; defer maintainability assessment to a separate agent after it works. Not for formatting, config-only changes, or maintainability-only assessment."
---
```

**Design rules for the description field:**
- Keep it to 2-5 sentences; the harness needs concise signal, not exhaustive documentation
- Include explicit trigger phrases in quotes (e.g., `"refactor"`, `"restructure"`)
- Include explicit exclusion criteria (e.g., "Skip for typos, formatting")
- Use `\"` to escape quotes within the YAML string
- Do NOT duplicate the description content in the skill body — it wastes context

#### Section 2: Workflow Phases

Name meaningful steps, their purpose and their outputs. Make required steps explicit without imposing phase files or formal documents where inline intent is sufficient; the current Code Craft example is:

```

## Skill Workflow

### 1. Establish the smallest useful outcome
### 2. Implement and verify
### 3. Hand off for separate, report-only maintainability assessment
```

The assessment records suggestions now; applying them later requires demonstrated usefulness and explicit approval. If an assessor or authorized record destination is unavailable, report the assessment or recording as pending rather than simulating completion.

#### Section 3: Stop Conditions (Gates)

Define conditions where the skill workflow must HALT. A stop condition means: "do not proceed past this point until this is satisfied."

Example from code-craft:
```
STOP CONDITION: Human stack approval, required current behavior, root policy evidence,
opted-in compatibility or safe execution is unresolved.
→ Stop affected work; return the evidence and proposed clarification.
  Do not invent fallback semantics or broaden the task into a redesign.
```

A legacy isolation limitation alone is not permission to redesign dependencies; state the verification limitation and preserve the authorized scope.

#### Section 4: Deliverable Checklist

What must be true for the task to be considered complete:

```

## Deliverable

The implementation handoff includes:
- [ ] Requested behavior, relevant checks and verification limitations
- [ ] Human-approved researched stack/custom exceptions with current proposal/receipt
- [ ] Preserved safety/integrity and root-opted-in compatibility, not automatic legacy shims
- [ ] Separate report-only assessment with all library-free flags/numerical reuse-policy deductions directly reported, or explicit pending status and reason
```

#### Section 5: Anti-Pattern Table

The most important section. List the shortcuts the AI will try to take, and what to do instead:

| Temptation | Why It's Wrong | Correct Path |
|---|---|---|
| "I'll add this method to the existing class" | May mix unrelated responsibilities | Keep it when cohesive; introduce a boundary only for a concrete responsibility or consumer need |
| "I'll use a dict here — it's flexible" | May hide a required boundary contract | Validate and expose required fields at domain boundaries; native maps remain valid for local lookups and simple scripts |
| "I'll return [] so callers don't break" | Hides contract ambiguity | Surface a typed/domain error |

#### Section 6: References

Point to deep-dive documents that should only be loaded when needed:

```

## References

- `references/implementation-essentials.md` — Situational implementation guidance
- `references/templates/prd.md` — PRD output template
```

A reusable skill must not link back to `rules/*.md`. Governance rules are universal invariants enforced by the harness; when a skill workflow needs a constraint, the skill states that constraint itself and the rule reinforces it independently.

### Quality Bar for Skills

Before deploying a skill, verify:

1. **Completeness**: Does the workflow cover setup → execution → verification → cleanup?
2. **Stop conditions**: Are there gates that prevent the AI from producing bad output?
3. **Anti-pattern table**: Are the most common shortcuts documented and countered?
4. **Deliverable checklist**: Can the user verify the skill was followed correctly?
5. **Length**: Aim for a router under ~150 lines; 500 is the upper guideline, not a target. Move relevant deep methods to `references/`, not deployment records.
6. **Reader and portability**: Can someone without the author's chat use the skill and its existing explicit references? Check native, integrated and missing-capability cases; do not claim a walkthrough proves runtime behavior.

### Skill References: When to Split

References are loaded on demand, not at skill load time. Move content to references when:

- It's only needed for certain variants of the task
- It's implementation detail rather than methodology
- It changes frequently (templates, checklists, domain-specific data)
- It's a sub-workflow that only triggers in specific conditions

Example: The `reviewer` skill keeps its core methodology in `SKILL.md` but loads sub-reviewer lenses (security, code-quality, editorial) as references only when the relevant lens is needed.

---
