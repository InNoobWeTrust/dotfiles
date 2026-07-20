# Skill Composition Pathways

### Debugging & Fixing
1. `codebase-exploration` — navigate unfamiliar boundaries
2. `systematic-investigation` — root cause analysis
3. `code-craft` — disciplined implementation of the fix
4. `reviewer` — verify fix addressed root cause

### Feature Implementation
1. `requirements-driven-dev` — if feature is large/ambiguous
2. `codebase-exploration` — map target areas
3. `code-craft` — disciplined implementation
4. `reviewer` — post-implementation review
```

#### Skill Frontmatter: The Only Routing Mechanism

Under a minimal harness, the `description` field in each skill's YAML frontmatter is the ONLY mechanism the tool uses to decide which skill to offer for a given task. This makes the `description` field critical — it must contain both trigger phrases AND exclusion criteria:

```
---
name: code-craft
description: "Code design discipline enforcing SOLID, KISS, modularity, separation of concerns, and human-readability. Load for any non-trivial code write, feature addition, refactor, or restructuring. Activate on \"refactor\", \"restructure\", \"design this module\", \"clean up this code\", \"make this maintainable\", or any implementation touching more than one file. Skip for typos, formatting, config value changes, or renaming without logic changes."
---
```

**Design rules for the description field:**

- Include BOTH trigger phrases and exclusion criteria — the harness needs both to avoid false matches
- Use `\"` to escape internal quotes within the YAML string
- Keep it concise; exact length limits vary by tool
- Do NOT duplicate this content in the skill body — it wastes context window space

#### Progressive Enhancement Strategy

Build the full structure (`rules/` + `skills/` with index and wiring) even if your current harness only supports a subset. When the harness can't load a file automatically, embed its content into the instructions file instead. When the team upgrades to a harness that supports more primitives, remove the embedded version from the instructions file — the separate files become the authoritative source.

**Migration path:**

1. Start with instructions-file-only (embedded rules, routing table, composition pathways)
2. When the harness supports loading separate rule files, extract embedded rules into `rules/*.md` and replace the instructions file content with a short reference (`Follow all rules in rules/*.md`)
3. When the harness supports a skill index, extract the routing table into `.agents/skills/INDEX.md`
4. When the harness supports composition wiring, extract pathways into `.agents/skills/WIRING.md`

### What Goes in AGENTS.md

The `AGENTS.md` file at the project root is the entry point for every AI session. It must answer these questions within the first 60 seconds of reading:

1. **What does this project do?** — First paragraph or a link to the requirements document
2. **Where is the source of truth?** — An explicit hierarchy resolving conflicts between documents and code
3. **How do I run things?** — Tooling rules (package managers, build commands)
4. **What are the hard rules?** — Project constraints that must never be violated
5. **How do I verify my work?** — Quality gate commands and their escalation rules
6. **Where is everything located?** — A source code organization map with file paths

### The Source-of-Truth Hierarchy

Every project needs an explicit priority order for resolving conflicts between documents and code. A typical hierarchy:

```
1. Product requirements document     ← WHAT to build (business decisions)
2. UX/design guidelines              ← HOW it should feel (interaction decisions)
3. Architecture document             ← HOW it should be built (system decisions)
4. Existing implementation           ← What already exists in code
5. Legacy docs, mockups, notes       ← Historical context only (lowest priority)
```

Write this hierarchy in AGENTS.md. Enforce it ruthlessly. If a decision contradicts a higher-tier document, it is always wrong — no exceptions.

---
