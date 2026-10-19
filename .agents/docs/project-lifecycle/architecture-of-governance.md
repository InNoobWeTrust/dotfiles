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
├── rules/                    # Short always-on policies (7) + INDEX map
│   ├── INDEX                 # Trigger table: load a policy body only when it fires
│   ├── authority.md          # Decision ownership, consequence-first safety, alignment
│   ├── evidence.md           # Self-grounded verification, tool-call checks, anti-gaslight
│   ├── skill-use.md          # Index-first discovery, activation, binding workflows
│   ├── execution-safety.md   # Pre-execution gate, sandbox routing, secrets, processes
│   ├── git-safety.md         # Staging, committing, pushing, destructive actions
│   ├── code-quality.md       # Reuse-first baseline, design principles, test persistence
│   └── document-formats.md   # Typst/PDF default, Markdown exceptions
│
├── skills/                   # Complete workflows loaded per-task
│   ├── INDEX                 # Routing table: which skill fits which task
│   ├── WIRING               # How skills compose for complex tasks
│   ├── code-craft/           # Smallest verified working implementation
│   ├── code-maintainability/ # Separate assessment now; approved refinement later
│   ├── systematic-investigation/ # Debugging and root cause analysis
│   ├── reviewer/             # Multi-lens code/spec review
│   ├── working-principles/   # Lightweight discovery and planning principles
│   ├── architecture-design/ # Technical constraints, trade-offs, optional specification
│   ├── codebase-exploration/ # Navigating unfamiliar codebases
│   ├── memory/               # Short-term + long-term memory with dream-cycle
│   ├── brainstorming/        # Creative ideation and problem framing
│   └── <project-specific>/   # Skills unique to this project's stack
│
└── memory/                   # short-term/, long-term/, archive/ — see skills/memory
```

Keep policies short and load them through `rules/INDEX`. Detailed methods (testing loops, discovery interviews, phased delivery, slicing, document formats) live in the skills listed above and load only when a workflow needs them. Skills never link back to `rules/` — that one-way boundary is what keeps a skill portable outside a governed harness.

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

**Rules** are always active — the AI must follow them on every task without being told. **Skills** are loaded on demand — the AI loads them only when the task matches the skill's trigger phrases, and activating one binds its workflow steps and stops.

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

1. **Code quality baseline** — The prohibited patterns list (silent error swallowing, magic literals, mixing layers, guessing through ambiguity, extend-by-parameter). This is the highest-value policy for preventing AI output quality degradation.
2. **Decision ownership and safety** — Operating mode, consequence-first classification of actions, and the mandatory human-in-the-loop triggers (`rules/authority.md`).
3. **Evidence discipline** — Before declaring work done, state success criteria independent of the artifact (including a disconfirming check), then evaluate against them with cited evidence (`rules/evidence.md`).
4. **Test persistence boundary** — What may be kept in the repository versus cleaned up, and the protection of existing suites (`rules/code-quality.md` §5).
5. **Skill routing** — Index-first discovery, and that activating a skill binds the smallest applicable workflow track with its stops (`rules/skill-use.md`).
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
