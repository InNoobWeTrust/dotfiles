# Architecture of AI-Agent Governance

### Two Configuration Layers

AI agent projects use two layers of configuration, kept strictly separate:

**Layer 1: Personal Toolkit** — The lead engineer's private configuration lives in a personal directory (typically `~/.agents/`). This contains:

- Personal preferences (effort level, permission defaults)
- Experimental skills still being tested
- Provider credentials and service connections
- Personal session history

**Layer 2: Project Contract** — The team-shared configuration lives in `<project-root>/.agents/`. This contains:

- Rules that apply to every task in this project
- Skills with workflows tailored to this project's stack and domain
- Memory: short-term session checkpoints + long-term consolidated memory (see `memory` skill)
- Project-specific infrastructure templates

**Why separate them:** A new team member who clones the repo must get the full project configuration without any dependency on the lead's personal tooling. Conversely, the lead's personal configuration should never leak into the team's shared contract.

### The `.agents/` Directory Structure

The project's `.agents/` directory follows this structure:

```
<project-root>/.agents/
├── rules/                    # Non-negotiable constraints active on every task
│   ├── code-quality.md       # Design checkpoint, naming, prohibited patterns
│   ├── tdd.md                # Red-Green-Refactor protocol
│   ├── grooming.md           # Reverse interview before complex tasks
│   ├── ubiquitous-language.md # Sync with GLOSSARY.md before coding
│   ├── slicing.md            # Vertical slicing for feature work
│   ├── skill-compliance.md   # Loading a skill = binding commitment to full workflow
│   └── self-grounded-verification.md # Anti-agreement-bias: separate criteria from artifact
│   ├── memory.md             # When to capture/recall/consolidate/evict memory
│   └── skills-discovery.md   # How to select the right skill for a task
│
├── skills/                   # Complete workflows loaded per-task
│   ├── INDEX.md              # Routing table: which skill fits which task
│   ├── WIRING.md             # How skills compose for complex tasks
│   ├── code-craft/           # Default implementation skill (5-phase workflow)
│   ├── systematic-investigation/ # Debugging and root cause analysis
│   ├── reviewer/             # Multi-lens code/spec review
│   ├── requirements-driven-dev/  # PRD → TRD → BDD specification workflow
│   ├── codebase-exploration/ # Navigating unfamiliar codebases
│   ├── memory/               # Short-term + long-term memory with dream-cycle
│   ├── brainstorming/        # Creative ideation and problem framing
│   └── <project-specific>/   # Skills unique to this project's stack
│
└── memory/                   # short-term/, long-term/, archive/ — see skills/memory
```

### Key Files Explained

**INDEX.md** — A routing table consulted before loading any skill. It has four columns:

| Skill | When to Use | When NOT to Use | Cost |
|---|---|---|---|
| `code-craft` | Any non-trivial code write, feature, or refactor | Typos, formatting, config changes, renames | Medium |

The "When NOT to Use" column is what prevents skill overload — the AI must not load a 500-line workflow for a one-line edit.

**WIRING.md** — Defines how skills compose for complex tasks. Example pathway:

```
Debugging: codebase-exploration → systematic-investigation → code-craft → reviewer
```

This prevents the AI from trying to debug without first understanding the codebase, or fixing without verifying the root cause was addressed.

**Rules** are always active — the AI must follow them on every task without being told. **Skills** are loaded on demand — the AI loads them only when the task matches the skill's trigger phrases.

### Adapting to Harness Limitations

Not every AI coding tool supports loading arbitrary markdown files as rules or consulting an index for skill routing. The most common denominator across tools is two primitives: **skills** (selected by matching user input against a short description string) and a single **instructions file** (a markdown file injected into every session as the AI's system prompt — typically called `AGENTS.md` or similar). This section explains how to make the full governance layer work even when you only have those two primitives available.

#### What Different Harness Tiers Support

The governance model described in this guide assumes a full-featured harness. In practice, you may have fewer capabilities. Here is what each tier can load automatically (without the user manually pasting files):

| Capability | Full-featured harness | Minimal harness |
|---|---|---|
| Rules from separate `rules/*.md` files | ✅ Automatic, always active | ❌ Not supported |
| Skill index (INDEX.md) consulted for routing | ✅ Agent consults index before picking skill | ❌ Skills selected only by matching their `description` field |
| Composition pathways (WIRING.md) | ✅ Used for multi-skill chains | ❌ Agent must infer from skill body or instructions file |
| Single instructions file (AGENTS.md) injected as context | ✅ Full file injected | ✅ Full file injected |

#### General Principle: Embed What the Harness Can't Load

Any governance content the harness cannot load from separate files must be embedded into the one file it always can: the instructions file (AGENTS.md). The sections below show how to embed rules, routing, and composition content — each as a self-contained section within AGENTS.md.

#### Strategy: Embed Rules into the Instructions File

When `rules/` files are not auto-loaded, embed the essential rule content directly into the instructions file.

**What to embed:**

1. **Code quality baseline** — The prohibited patterns list (silent error swallowing, magic literals, mixing layers, guessing through ambiguity, extend-by-parameter). This is the highest-value rule set for preventing AI output quality degradation.
2. **TDD protocol** — Red-Green-Refactor cycle and when it's required vs skippable.
3. **Grooming protocol** — Requirement to ask clarifying questions before complex tasks.
4. **Skill compliance** — Loading a skill = binding commitment to execute its full workflow.
5. **Self-grounded verification** — Before declaring work done, state success criteria independent of the artifact (including a disconfirming check), then evaluate the artifact against them with cited evidence. Counters agreement bias — the tendency to validate whatever is already in context.
6. **Project-specific hard rules** — Where business logic lives, data integrity constraints, rules against manipulating servers.

**What NOT to embed** in the instructions file (keep in separate docs for human reference):

- Full multi-question checklists (summarize the principle, not every item)
- Detailed failure pattern catalogs
- Skill design methodology
- Audit and maintenance processes

**Example — embedded rules in AGENTS.md:**

```

---

## Deeper detail

- [Agent Operating Rules](./details/agent-operating-rules.md)
- [Scope-Based Routing](./details/scope-based-routing.md)
- [Skill Composition Pathways](./details/skill-composition-pathways.md)
