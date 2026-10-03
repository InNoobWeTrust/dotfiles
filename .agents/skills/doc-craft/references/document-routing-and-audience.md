# Document Routing and Audience Classification

This reference establishes the boundary between **Human-Facing Documentation** (routed to `docs/` or module `README.md`) and **Agent-Facing Coordination Memory** (routed to `MEMORY_DIR`).

---

## 1. The Core Problem

Frontier agents often conflate documentation intended for human mental models with internal task coordination artifacts. This leads to two critical failures:
1. **Polluted `docs/` Directories**: Dumps of low-level tracer-bullet phase specs, step-by-step test runner scratchpads, and inter-agent consensus boards into `docs/`, overwhelming human readers with execution trivia.
2. **Uncalibrated Abstraction Levels**: Human-facing guides bombarded with low-level implementation minutiae, framework jargon, or raw internal logs instead of clear mental models and scannable usage instructions.

---

## 2. Document Classification Matrix

| Dimension | Human-Facing Documentation | Agent Coordination & Execution Memory |
|---|---|---|
| **Primary Audience** | Human engineers, maintainers, users, leadership | Autonomous agents, subagent swarms, execution harnesses |
| **Storage Destination** | `docs/`, `<module>/README.md`, root `README.md` | `MEMORY_DIR` (`.agents/memories/`, `.serena/memories/`) |
| **Primary Purpose** | Build shared mental models; explain purpose, usage, architecture | Track execution progress, maintain atomic plans, record consensus |
| **Content Types** | System architecture, how-to guides, module READMEs, API overviews | Atomic plans (`plan.md`), vertical slice phase specs, consensus boards |
| **Abstraction Level** | **High / Feature-Level**: Concepts, tradeoffs, usage, pseudocode | **Low / Task-Level**: Concrete file deltas, RED/GREEN steps, logs |
| **Tone & Style** | Plain language, jargon-free, concise, visual rhythm, scannable | Dense invariants, exact paths, machine-verifiable gates, strict DTOs |
| **Persistence & Git** | Long-term repository documentation, versioned in git | File-based Markdown + YAML, human-traceable, git-committable |

---

## 3. Destination Routing Decision Tree

```
Does the document represent atomic task execution, phase breakdown, or inter-agent coordination?
├── YES ────────► ROUTE TO MEMORY SKILL (`MEMORY_DIR`)
│                 ├── Atomic feature implementation plan ──► `MEMORY_DIR/plans/<feature>/plan.md`
│                 ├── Detailed vertical slice phase ──────► `MEMORY_DIR/plans/<feature>/phases/<##>-<slice>.md`
│                 └── Inter-agent consensus board ────────► `MEMORY_DIR/consensus/<topic>.md`
│
└── NO (Human-Facing Content)
    ├── Is it explaining a code package/module's purpose & usage?
    │   └── YES ──► `<module>/README.md` (Code Module Abstraction Level)
    │
    └── Is it a system architecture, guide, or high-level feature documentation?
        └── YES ──► `docs/` (Feature / System Abstraction Level)
```

---

## 4. Human-Facing Documentation Guidelines

### Abstraction Level Discipline
- **Focus on What and Why**: Explain the problem the feature or module solves before showing how it works.
- **Conceptual Pseudocode over Line-Level Dumps**: When illustrating algorithms or data flows, use clean pseudocode or minimal illustrative snippets that convey the mental model. Do not dump complete 200-line production files.
- **Feature-Level Boundaries in `docs/`**: Only documents reflecting durable feature-level or system-level abstractions belong in `docs/`. Detailed atomic phases (e.g., "Phase 01: Create schema column X") belong in memory.
- **Jargon Elimination**: Avoid agent orchestration jargon (e.g., "tracer bullet", "RED/GREEN pass", "swarminator", "harness prompt") in human docs. Use standard industry terms (e.g., "integration test", "data model", "event flow").

### Code Module `README.md` Standards
A code module `README.md` must enable an engineer to understand the module in under 60 seconds:
1. **Module Purpose**: 1–2 sentences explaining what capability the module encapsulates and why it exists as an independent unit.
2. **Mental Model & Flow**: A diagram or brief table illustrating how inputs transform into outputs.
3. **Usage Example**: A concise code snippet showing the primary consumer-facing entry point.
4. **Public Interface / Key Abstractions**: A catalog of exported types/services without exposing private internal helpers.
5. **Invariants & Guardrails**: Non-negotiable rules consumers must follow (e.g., thread safety, transaction boundaries).

---

## 5. Agent-Facing Memory Invariants (File-Based & Traceable)

Routing internal agent documents to `MEMORY_DIR` does **not** permit opaque, unreadable, or transient data:
1. **File-Based & Text-Based**: All plans, phases, and consensus records must be stored as plain Markdown (`.md`) files with structured YAML frontmatter.
2. **Human-Traceable**: Files must use clear headings, markdown tables, and unambiguous paths. Any human developer must be able to open and audit them immediately.
3. **Git-Committable**: Content must be clean, deterministic text suitable for Git version control and diff inspection when the project tracks plans in version control.
