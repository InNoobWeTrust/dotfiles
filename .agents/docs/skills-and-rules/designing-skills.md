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

### Writing the SKILL.md

A SKILL.md starts with YAML frontmatter (used by the harness for semantic matching and trigger routing) followed by the workflow body. The frontmatter replaces any inline "When to Load" section — that information is redundant once the skill is already loaded, so keep it out of the body to conserve context.

#### Section 1: YAML Frontmatter (Harness Matching)

The file MUST begin with a YAML frontmatter block delimited by `---`. Two fields are required:

- **`name`** — Machine-readable skill identifier (lowercase, kebab-case)
- **`description`** — Semantic matching string. Contains what the skill does, when to use it, trigger phrases, and exclusion criteria. The harness uses this to decide whether to surface the skill to the agent. It is NOT re-injected into the skill body — the agent does not re-read it after loading.

```
---
name: code-craft
description: "Code design discipline enforcing SOLID, KISS, DRY, modularity, separation of concerns, and human-readability during implementation. Load for any non-trivial code write, feature addition, refactor, or restructuring. Activate on \"refactor\", \"restructure\", \"design this module\", \"clean up this code\", or any implementation touching more than one file. Skip for typos, formatting, config value changes, or renaming without logic changes."
---
```

**Design rules for the description field:**
- Keep it to 2-5 sentences; the harness needs concise signal, not exhaustive documentation
- Include explicit trigger phrases in quotes (e.g., `"refactor"`, `"restructure"`)
- Include explicit exclusion criteria (e.g., "Skip for typos, formatting")
- Use `\"` to escape quotes within the YAML string
- Do NOT duplicate the description content in the skill body — it wastes context

#### Section 2: Workflow Phases

Each phase has a name, a purpose, and a set of artifacts it must produce. Mark mandatory phases explicitly:

```

## Skill Workflow

This skill has five phases. All five must be completed.

### Phase 1 — Design Intent & Resilience Plan
### Phase 2 — SOLID & Clean Architecture Check
### Phase 3 — Write with High-Quality Standards
### Phase 4 — Readability & Robustness Audit
### Phase 5 — Tech Debt Inventory
```

#### Section 3: Stop Conditions (Gates)

Define conditions where the skill workflow must HALT. A stop condition means: "do not proceed past this point until this is satisfied."

Example from code-craft:
```
STOP CONDITION: Isolation test = "no"
→ Redesign the dependency structure. A unit that cannot be isolated
  has too many implicit couplings — extract them.
```

#### Section 4: Deliverable Checklist

What must be true for the task to be considered complete:

```

## Deliverable

The skill's output is working code that satisfies:
- [ ] Design Intent & Resilience Plan block was produced
- [ ] SOLID & Clean Architecture check passed or debt documented
- [ ] Code follows naming, structure, and traceability rules
- [ ] Tests written and passing per TDD protocol
- [ ] Tech Debt Inventory produced
```

#### Section 5: Anti-Pattern Table

The most important section. List the shortcuts the AI will try to take, and what to do instead:

| Temptation | Why It's Wrong | Correct Path |
|---|---|---|
| "I'll add this method to the existing class" | Violates Single Responsibility | Create a separate module/service |
| "I'll use a dict here — it's flexible" | Hides structure; readers can't see fields | Use typed struct, dataclass, or interface |
| "I'll return [] so callers don't break" | Hides contract ambiguity | Surface a typed/domain error |

#### Section 6: References

Point to deep-dive documents that should only be loaded when needed:

```

## References

- `references/code-quality.md` — Detailed code quality checklist
- `references/templates/prd.md` — PRD output template
```

### Quality Bar for Skills

Before deploying a skill, verify:

1. **Completeness**: Does the workflow cover setup → execution → verification → cleanup?
2. **Stop conditions**: Are there gates that prevent the AI from producing bad output?
3. **Anti-pattern table**: Are the most common shortcuts documented and countered?
4. **Deliverable checklist**: Can the user verify the skill was followed correctly?
5. **Length**: Is the SKILL.md under 500 lines? If longer, move deep content to `references/`.

### Skill References: When to Split

References are loaded on demand, not at skill load time. Move content to references when:

- It's only needed for certain variants of the task
- It's implementation detail rather than methodology
- It changes frequently (templates, checklists, domain-specific data)
- It's a sub-workflow that only triggers in specific conditions

Example: The `reviewer` skill keeps its core methodology in `SKILL.md` but loads sub-reviewer lenses (security, code-quality, editorial) as references only when the relevant lens is needed.

---
