# Working with AI Agents as Junior Team Members

### The Junior Engineer Mental Model

When you prompt an AI agent, think of it as delegating to a junior engineer who:

- **Is extremely fast and never gets tired** — but doesn't have judgment
- **Has read every line of your codebase** — but doesn't understand business context
- **Will follow explicit rules mechanically** — but will invent answers to ambiguous questions
- **Can produce 500 lines of code in seconds** — which means 500 lines of technical debt if unguided

This mental model guides everything about how you interact with the AI: how you scope tasks, how you review its output, and how you design the rules that govern it.

### How to Give Good Prompts

The quality of AI output correlates directly with the quality of the prompt. Like delegating to a junior:

```
BAD:  "Add user preferences to the dashboard"
      ↑ Ambiguous. The AI will guess. You will spend time fixing.

GOOD: "Add column visibility preferences to the data grid on the dashboard page.
      The preferences are saved per-user, per-workspace, persisted to the backend.
      Use the existing preferences API pattern (see the preferences module).
      Frontend should store preference state in a workspace-scoped composable,
      not in a global store or in localStorage.
      Acceptance criteria:
      - Columns can be toggled visible/hidden
      - Preference persists across page reloads
      - Preference respects workspace scope
      - Default state is 'all columns visible'"
      ↑ Scoped, references existing patterns, defines acceptance criteria, specifies data ownership.
```

A good prompt has these properties:
1. **Clear scope**: Exactly what to build and, equally important, what NOT to build
2. **Pattern reference**: Points to existing code that does something similar
3. **Data ownership**: Where the data lives, who owns it, how it's persisted
4. **Acceptance criteria**: Specific, verifiable outcomes that define "done"
5. **Architectural constraints**: Where things go, what patterns to follow, what patterns to avoid

### The Skill System: What It Is and How to Use It

Skills are the AI's training manuals — complete workflows for specific task types. They live in `.agents/skills/` as directories with a `SKILL.md` entry point and optional `references/` for deep-dive content.

**Activating a skill is a binding contract.** Reading a catalog entry, description, or `SKILL.md` body to judge suitability costs nothing. Once the agent explicitly invokes a skill, selects a workflow track, or begins its first workflow action, it commits to that track — every phase, checkpoint, and deliverable in it. It cannot selectively skip steps of an activated workflow. This is enforced by the `rules/skill-use.md` policy.

**Skill routing works like this:**
1. The AI checks `INDEX.md` to find which skill matches the current task
2. It loads that skill's `SKILL.md` and follows the workflow exactly
3. For complex tasks, it consults `WIRING.md` for the correct composition pathway

**When to use a skill vs when to skip:**

| Task Type | Load This | Why |
|---|---|---|
| Implement or make an approved code change | `code-craft` | Smallest verified working solution; no upfront SOLID ceremony |
| Assess working code or apply approved maintenance | `code-maintainability` | Record suggestions now; refine only after usefulness and explicit approval |
| Debug a bug | `systematic-investigation` | Structured root cause analysis protocol |
| Define product intent or outcomes | `brainstorming` | Clarify the goal, including an already-settled direction |
| Resolve technical constraints or trade-offs | `architecture-design` | Technical decisions and optional technical specification |
| Define acceptance behavior, including spec-only examples | `code-craft` | Observable outcomes and evidence without requiring implementation |
| Review code or specs | `reviewer` | Multi-lens review with bias-prevention gate |
| Build CI/CD pipeline | Project-specific CI/CD skill | Infrastructure templates and conventions |
| Write E2E tests | Project-specific testing skill | Page object models and data seeding patterns |
| Design UI | `ui-ux` | Design system compliance, accessibility |
| Brainstorm | `brainstorming` | Structured creative ideation |

**When to use NO skill:** Formatting fixes, renaming variables, config value changes, typo corrections. The skill system is for non-trivial work — don't load a 500-line workflow for a one-line edit.

### Skill Composition

For complex tasks, the AI combines multiple skills in sequence. The canonical pathways are defined in WIRING.md:

```
Debugging a bug:
1. codebase-exploration    → Navigate unfamiliar code boundaries
2. systematic-investigation → Root cause analysis and diagnosis
3. code-craft              → Disciplined fix implementation
4. reviewer                → Verify the fix addressed the root cause

Implementing a new feature:
1. working-principles      → Clarify consequential unknowns using references/planning.md
2. codebase-exploration    → Map the target frontend views and backend domains
3. code-craft              → Disciplined implementation
4. reviewer                → Post-implementation review
```

Use `brainstorming` for product intent, `architecture-design` for technical constraints, and `code-craft` for acceptance behavior. Use `ui-ux` for journeys and `doc-craft` for presentation when needed; a PRD → TRD → BDD chain is not required.

### The Clarification Interview (Reverse Interview)

Before the AI builds anything complex, it should ask YOU questions — not the other way around. This prevents the most common AI failure: building the wrong thing because it filled in ambiguous requirements with assumptions.

The AI is required to probe for:

- **Goal & Boundaries** — What is DEFINITELY out of scope? What does "done" look like?
- **Edge Cases & Failure Modes** — What happens when data is missing? When the network fails? When the user does something unexpected?
- **Dependencies** — What existing modules, APIs, or services does this connect to?
- **Interface Concept** — From the caller's/user's perspective, what do they see/do?

The AI should ask only unresolved questions whose answers would change the outcome, prioritized by consequence. Use [discovery and planning principles](../../skills/working-principles/references/planning.md); do not repeat settled questions or require a fixed interview count.

**When to skip the interview:** Simple edits (typos, config values, renames), tasks where the specification is already exact and unambiguous, tasks that are purely mechanical.

### Memory: Context Continuity Across Sessions

When a coding session ends and the task will continue later, a **short-term memory entry** saves the current state so the next session can resume without re-explaining everything. When enough short-term entries accumulate — or when a git commit is about to close the day — a **dream cycle** consolidates the useful ones into **long-term memory** and proposes stale entries for eviction. Session checkpoints are just one kind of short-term entry.

**What a short-term entry contains (self-contained so the next session can act):**
- Current goal and status
- Key decisions made (and why) — mark `(finalised)` or `(fluid)`
- Files touched (with paths)
- Verification state (what tests passed, what's pending)
- Known blockers
- Next actions (prioritized)
- Open questions for the user

**When to write a short-term entry:**
- The user asks for a checkpoint
- A major milestone completes and continuation is likely
- Context length is getting large (the session will soon lose early context)
- The user signals end of session or device switch

**When to run a dream cycle (Consolidate mode):**
- The user explicitly asks ("consolidate memory", "dream cycle")
- A git commit is about to be made and short-term entries are unconsolidated
- Long-term size limits are approaching and eviction candidates need scoring

**Long-term is size-limited.** Growth happens only through consolidation, and eviction is always a scored proposal the human approves — never a silent delete. Corrections are append-only and user-owned.

**Memory location:** Inside a git repo, memory lives under `<project-root>/.agents/memories/` with `short-term/` and `long-term/` subdirectories plus an `archive/` for evicted long-term entries. Outside a repo, it falls back to `~/.agents/memories/`. Full layout, frontmatter templates, dream-cycle phases, scoring function, and eviction protocol live in the `memory` skill (`.agents/skills/memory/`).

**Progressive-disclosure meta-pattern.** The same short-term-leaf ↔ long-term-index shape applies to docs (`docs/README.md` + section indexes → `docs/**/detail-*.md`) and code (module `index.ts` / `__init__.py` / `mod.rs` → individual files). The `memory` skill's Structure mode applies it to any docs directory or source module on request.

---
