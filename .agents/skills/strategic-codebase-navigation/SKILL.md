---
name: strategic-codebase-navigation
description: Strategic navigation of large, unfamiliar codebases. Use this skill whenever you need to understand an unfamiliar codebase, find where to make a change in a large project, trace how a feature works end-to-end, plan a migration or large refactor, or map system architecture. Also use it when you're lost in a big repo and don't know where to start, or when a user asks you to work on a codebase you haven't seen before.
---

# Strategic Codebase Navigation

Navigate large, unfamiliar codebases efficiently without trying to understand everything at once.

## Quick Start: Pick Your Strategy

```
What do you need to do?
│
├── Make a specific change ──────────► "Logic Bubble" Isolation (#1)
│   (fix a bug, add a feature)
│
├── Understand the architecture ─────► Boundary & Registration Tracing (#2)
│   (how does this system work?)
│
├── Add something similar to ────────► Structural Pattern Matching (#3)
│   what already exists
│
└── Plan a migration or map ─────────► Metadata & Module Auditing (#4)
    the full dependency graph
```

---

## Strategy 1: "Logic Bubble" Isolation

**Use when**: You need to make a targeted change (fix a bug, add a feature) and don't need to understand the whole system.

1. **Find the Entry Point** — where does data or a command enter the flow you care about?
   - Search for route handlers, CLI argument parsers, event listeners, or message handlers related to the feature.
   - Use content search (grep, ripgrep, or agent search tools) for API endpoints, function names, or error messages.

2. **Find the Exit Point** — where does the result get output?
   - Trace from the entry point forward: what gets returned, written to disk, sent over the network, or rendered?

3. **Draw the boundary** — everything between entry and exit is your "bubble." Ignore everything outside it.
   - Read only the files and functions in the bubble. Resist the urge to explore beyond.
   - Use file outline tools or IDE symbols to skim files without reading everything.

4. **Make your change** within the bubble. Test at the entry and exit points.

---

## Strategy 2: Boundary & Registration Tracing

**Use when**: You need to understand the high-level architecture — how modules connect, what the extension points are, how things get wired together.

1. **Find the "Glue" code** — large systems use registration patterns, not direct calls.
   - Search for keywords: `Register`, `Factory`, `Provider`, `Manager`, `Plugin`, `Module`, `Handler`, `Middleware`.
   - Use content search with patterns like `register`, `factory`, `createModule`, `addPlugin`.

2. **Identify the Contract** — find the interface or abstract class that modules must implement.
   - Look at what the registration function accepts. That's the contract.
   - Use code navigation (go-to-definition, symbol search) to inspect the base class or interface.

3. **Map the Lifecycle** — trace when modules are loaded vs. initialized.
   - Search for initialization sequences: `init`, `setup`, `bootstrap`, `configure`.
   - This reveals the true dependency graph (load order = dependency order).

4. **Document what you find** using the Architecture Discovery Report template below.

---

## Strategy 3: Structural Pattern Matching (Clone & Mutate)

**Use when**: You need to add something similar to what already exists (new endpoint, new command, new module).

1. **Find the closest existing example** — search for a feature similar to what you're building.
   - Use file search and content search to locate similar modules, handlers, or components.

2. **Analyze its registration** — how does the existing feature register itself with the system?
   - What files does it touch? What config entries does it need? What interfaces does it implement?

3. **Copy the structure** — duplicate the existing feature's files.

4. **Swap the internal logic** — replace the business logic while keeping the registration boilerplate identical.

5. **Verify registration** — confirm the new module is picked up by the system the same way the original was.

---

## Strategy 4: Metadata & Module Auditing

**Use when**: Planning a migration, mapping the full dependency graph, or understanding which modules can be changed safely.

1. **Start with build configuration** — treat `package.json`, `Cargo.toml`, `build.gradle`, `CMakeLists.txt`, etc. as your schematic.
   - Use `find_by_name` to locate all build/config files.

2. **Classify modules**:
   - **Leaf modules** — no other modules depend on them. Safe to change or migrate first.
   - **Core modules** — many modules depend on them. Change last, with extreme care.
   - Use `grep_search` to trace imports/dependencies between modules.

3. **Start from the leaves** — migrate or refactor leaf modules first, working inward toward the core.

4. **Map side effects** — identify where code touches databases, APIs, file systems, or external services. These are your risk boundaries.

---

## Architecture Discovery Report Template

Fill this out when first analyzing a new codebase.

```markdown
# Architecture Discovery Report: [Project Name]

## 1. System Core
- **Core Module Location:** [Path]
- **Primary Responsibility:** [e.g., Data routing, Engine kernel]
- **Evidence:** [List modules depending on this Core]

## 2. Registration Contract
- **Registration Manager:** [e.g., ModuleManager.cpp, registry.py]
- **Base Interface/Class:** [The class business logic must inherit from]
- **Required Boilerplate:**
    - [ ] Method: [Name]
    - [ ] Registration call: [Example]

## 3. Dependency Hierarchy
- **Leaf Modules (safe to change first):** [Modules with no incoming deps]
- **Core Modules (change last):** [Modules everything depends on]

## 4. Side-Effect Boundaries
- **I/O & Persistence:** [Filesystem, Database classes]
- **Network/API Layer:** [Socket handlers, REST clients]
- **External Services:** [Third-party APIs, message queues]

## 5. Smallest Verification Test
- **Test Location:** [File path]
- **Proposed Change:** [e.g., Change a log string]
- **How to verify:** [How to see the change in the live app]
```

---

## Reference

* **Source Material**: *Navigating Large Codebases — Instructor's Guide with Marc Olano*
* **Primary URL**: https://www.youtube.com/watch?v=YZdVfKJNLfk

---

## What's Next?

After mapping the codebase:

- **Implementing changes?** → Use `requirements-driven-dev` for structured execution
- **Found a bug during navigation?** → Use `strategic-problem-solving` for root cause analysis
- **Planning a refactor?** → Use Strategy 4 output to prioritize modules, then `requirements-driven-dev` for implementation

## Related Skills

- **`strategic-problem-solving`** — For debugging and root cause analysis after navigation reveals issues.
- **`requirements-driven-dev`** — For structured implementation after understanding the codebase.
- **`edge-case-hunter`** — For auditing code paths discovered during navigation.
