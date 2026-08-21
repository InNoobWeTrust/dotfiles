---
name: project-foundation
description: "Use this skill to bootstrap, audit, or evolve a project's AI-augmented foundation — AGENTS.md, GLOSSARY.md, rules, skills core pack, Makefile, architecture docs, and quality gates. Activate for new project setup, foundation drift detection, syncing .agents from global, or when INDEX.md points at missing skills. Skip when editing a single existing rule or skill body with no pack-level change."
---

# Project Foundation

Keeps a repo’s agent-facing foundation **complete, loadable, and honest relative to the codebase**. Bootstrap is only one mode — **Audit/Evolve** is the ongoing mode.

Progressive disclosure: this file is the workflow. Pack membership and checklists live in:

- `references/core-pack.md` — what must be on disk
- `references/drift-checks.md` — audit checklist + auto-trigger signals
- `references/FOUNDATION.template.md` — stamp written to `.agents/FOUNDATION.md`

---

## Mode Selection (mandatory first step)

| Signal | Mode |
|---|---|
| No `AGENTS.md` / no `.agents/` / "set up new project" | **A — Bootstrap** |
| "audit foundation", "evolve", "sync .agents", missing skill at runtime, stale architecture/glossary | **B — Audit/Evolve** |
| Core skills only as INDEX stubs; teammate can't load skills | **C — Materialize core pack** (often inside A or B) |

State the chosen mode in one line before acting.

---

## Mode A — Bootstrap

Run phases in order. Adapt to what exists; never overwrite substantive local content without asking.

### A1 — Discover context

Read README, manifests (`package.json` / `pyproject.toml` / `go.mod`), `docs/`, and primary source trees.

**Conditional rapid-demo decision:** select `rapid-demo` only when the user explicitly states hackathon, prototype, rapid-demo, or funding-demo intent. When active, establish the project archetype/capability need, fixed delivery window, confirmation that synthetic data suffices, and whether remote sharing/hosting is needed; then load `references/rapid-demo-profile.md`. Requests involving real customer/production data, production intent, or non-deferrable security, compliance, recovery, or public-compatibility needs are ineligible: stay on the standard path and use canonical delivery guidance. Otherwise, standard behavior remains unchanged.

Deliverable:

```
PROJECT CONTEXT
===============
Language/stack   :
Database         :
External services:
Build system     :
Domain concepts  : [10–15 nouns]
Existing foundation files:
Materialization preference: symlink | copy | ask
```

If materialization preference is unknown and the repo is shared: **default to copy** for core pack. Solo + global pack present: **symlink** is fine.

### A2 — AGENTS.md

Create/update project `AGENTS.md` with: product one-liner, source-of-truth hierarchy, project rules, tooling, agent operating rules (default `code-craft`, full-skill commitment), code quality pointers, source layout, verify commands, security (no secrets; secret scan expectation).

Stop: if comprehensive, leave it; if incomplete, patch sections only.

### A3 — GLOSSARY.md

Bootstrap ≥10 domain terms from code/schema (or fewer with justification). Canonical names + prohibited aliases. Extend existing file; do not rename canon without drift resolution.

### A4 — Rules

Materialize **required rules** from `references/core-pack.md` into `.agents/rules/` (symlink or copy). Do not hand-write full rule bodies when a global source exists.

### A5 — Skills core pack (critical)

Materialize **required skill trees** from `references/core-pack.md` — full directories including `references/` for `reviewer` and `requirements-driven-dev`.

**Forbidden:** creating only `INDEX.md` / `WIRING.md` that *mention* global skills without a project-resolvable path.

Also write:

- `skills/INDEX.md` — core rows + any project-specific skills only
- `skills/WIRING.md` — symlink to global or minimal local composition
- `.agents/FOUNDATION.md` — from `references/FOUNDATION.template.md` (source, mode, revision, date)

#### A5.1 — Optional: setup skill overlay

If the project has non-trivial onboarding (more than three setup steps, multiple runtimes, or environment detection), consider creating a project-local `setup` skill. See `references/setup-skills.md` for the pattern, bootstrap commands, and verification checklist.

### A6 — Makefile

Thin targets: `help`, `fix`, `lint`, `quality`, `test`, `dev`, `dev-up`, `build`. Adapt to stack; never delete existing targets.

### A7 — Architecture, quality gates + visual design system (DESIGN.md)

- `docs/architecture.md` — responsibility split, data ownership, data flow, API contracts, integration modes, non-goals
- `docs/engineering/quality-gates.md` — command matrix, thresholds, escalation, rollout
- `DESIGN.md` — **For projects with UI/frontend or brand identity**: reference `ui-ux` to initialize `DESIGN.md` at repo root per Google Labs spec (YAML frontmatter tokens + canonical prose sections) and add `npx @google/design.md lint DESIGN.md` to visual quality checks.

When the `rapid-demo` profile is active, also complete the compact **Demo Receipt** and production checkpoint in `references/rapid-demo-profile.md`. Reuse the existing phased-delivery Delivery Contract and Active Milestone Packet architecture note; do not duplicate them.

### A8 — Verify

Use the presence checklist in `references/drift-checks.md` section A. All critical items must pass.

---

## Mode B — Audit/Evolve

Use when the foundation already exists. **Do not re-bootstrap from scratch.**

1. Read `.agents/FOUNDATION.md` (if missing → treat as critical gap).
2. Run `references/drift-checks.md` sections A–E.
3. Emit the gap report format from that file.
4. Apply fixes in this priority order:
   1. Critical routing breaks (missing core skills/rules, dangling INDEX)
   2. Reality drift (AGENTS verify commands, glossary, architecture, DESIGN.md)
   3. Freshness sync from global (copy mode only; preserve project overlays)
   4. INDEX slim-down (drop unused mega-skills from the default table)
5. Update `FOUNDATION.md` date/revision after changes.
6. Stop after the report if the user only asked for an audit.

### Proactive trigger (when this skill is not yet loaded)

If, during normal work, you detect a **critical** drift signal from `references/drift-checks.md` §E / auto-trigger list (e.g. INDEX points at a missing skill), **load this skill in Mode B** or tell the user the foundation is broken and offer Mode B. Do not silently continue with a half pack.

---

## Mode C — Materialize core pack

Standalone fix for "bootstrap left stubs / missing companion skills":

1. Resolve global source (`references/core-pack.md` → Detect global source).
2. Choose symlink vs copy (ask if shared-repo impact is unclear).
3. Materialize every **required** rule and skill tree.
4. Rewrite `INDEX.md` so every row resolves on disk.
5. Write/update `FOUNDATION.md`.
6. Run drift-checks section A–B only.

---

## Stop conditions

- **Conflict:** local file differs substantially from global source → show diff summary and ask before overwrite.
- **No global source** and copy requested → ask for path; do not invent rule/skill bodies from memory.
- **Update-only request** → Mode B; skip greenfield sections.
- **Single skill edit** → stop; this skill is pack-level, not skill-authoring (use `skill-author`).

---

## Deliverable checklist

**Mode A**

- [ ] Context summary
- [ ] AGENTS.md + GLOSSARY.md
- [ ] Required rules materialized
- [ ] Required skills materialized (full trees)
- [ ] (optional) Project-local `setup` skill materialized if stack is non-trivial (§A5.1)
- [ ] INDEX + WIRING + FOUNDATION.md
- [ ] Makefile + architecture + quality-gates + DESIGN.md (if UI project via `ui-ux`)
- [ ] Drift-checks A passed

**Mode B**

- [ ] Gap report
- [ ] Critical gaps fixed (or explicitly deferred with owner)
- [ ] FOUNDATION.md updated

**Mode C**

- [ ] Core pack on disk and INDEX-consistent
- [ ] FOUNDATION.md written

---

## Anti-patterns

| Temptation | Why wrong | Correct path |
|---|---|---|
| INDEX + WIRING only; "skills live globally" | Many environments resolve project `.agents/skills` first; CI/teammates lack `~/.agents` | Materialize core pack (symlink or copy) |
| Copy entire global skills tree including swarm/video assets | Attention + disk bloat; INDEX becomes unusable | Core pack only; optional skills on demand |
| Rewrite all rules by hand each bootstrap | Drift from global; stale security/TDD | Materialize from source; overlay in AGENTS.md |
| Bootstrap once; never re-open the skill | Architecture/glossary/INDEX rot | Mode B on drift signals and explicit audit |
| Overwrite project-specific skills during sync | Destroys local value | Sync core only; leave `kpur`-style custom skills |
| Load this skill for a one-line rule typo | Wrong tool | Edit the file; use skill-author only for structural skill work |

---

## References

- `references/core-pack.md`
- `references/drift-checks.md`
- `references/setup-skills.md` — executable onboarding skill pattern
- `references/feedback-flywheel.md` — post-session harness improvement checklist
- `references/rapid-demo-profile.md` — conditional local-first, synthetic-data demo profile matrix
- Compose with: `architecture-design` (deep arch / design), `devsecops` (pipeline), `skill-author` (new skills), `codebase-exploration` (domain scan for glossary)
