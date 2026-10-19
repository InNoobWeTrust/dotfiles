# Core Pack — What Every Project Gets

Materialize this pack into `<project>/.agents/` so agents work **even when global `~/.agents` is unavailable** (CI, teammates, fresh machines). Prefer **symlinks to the global source of truth** when the repo is only used on machines that have the global pack; **copy** when the repo must be self-contained (shared team repos).

## Governance installation artifacts

When the requested foundation includes a governance pack, discover its current
manifest/index at the authorized source and copy/link the selected artifact tree.
Do not hardcode a historical filename list or require that pack to execute this
skill. Governance is installation input/output, not a workflow dependency.
Preserve its index and relative layout, validate copied links, and add project
overlays only for real local constraints. Do not synthesize duplicate policy
bodies or overwrite existing project instructions blindly. If a requested source
is missing, report that installation gap; do not invent its policies.

## Skills (core — materialize full trees, not INDEX stubs)

| Skill | Required | Why |
|---|---|---|
| `code-craft` | Yes | Default implementation skill |
| `code-maintainability` | Yes | Separate post-working assessment; record suggestions, refine only after usefulness and explicit approval |
| `systematic-investigation` | Yes | Debug / root cause |
| `codebase-exploration` | Yes | Unfamiliar navigation |
| `reviewer` (+ `references/`) | Yes | Explicit review; needs sub-reviewers |
| `working-principles` (+ `references/` and catalog) | Yes | Lightweight planning, shared understanding and task perspectives |
| `memory` | Yes | Two-tier memory + dream cycle + progressive-disclosure structuring |
| `subagent-dispatch` | Yes | Safe delegation prompts |
| `project-foundation` | Yes | Re-audit / evolve this pack |
| `skill-author` | Recommended | Governance maintenance |
| `team-operating-model` | Recommended | Real-team delivery, deliberation, persistent coordination, and verified AFK / evaluation loops |
| `architecture-design` | Optional | Deep architecture docs, system design, ADRs |
| `devsecops` | Optional | CI/CD + security scanning |

Also materialize:

- Referenced guidance needed by enabled routes: include the full `team-operating-model` tree when consumers need its delivery/slicing methods; those standalone references do not require team activation. Include `brainstorming`, `architecture-design` and `doc-craft` when product/technical specification or publication routes are enabled. Verify cross-skill targets; do not advertise unavailable owners through INDEX stubs. Optional routes may instead be omitted until their complete guidance is available.

- `skills/INDEX` — project routing table (may slim specialized skills)
- `skills/WIRING` — composition (can symlink to global)

## Skills (do **not** force-copy unless the project uses them)

`data-storytelling`, `cdp-browser-automation`, `ui-ux` (materialize when project contains UI/frontend components or maintains a `DESIGN.md` visual system), `video-production`, `talent-screening`, `model-benchmarking`, large asset CSVs — **link or copy only on demand**. Putting them in every repo wastes disk and INDEX attention.

**INDEX slim rule:** project `skills/INDEX` lists core pack + used domain skills only. Unused global rows are noise for attention routing.

## Materialization methods

| Method | When | How |
|---|---|---|
| **Symlink** | Solo / machines with `~/.agents` (or org shared path) | `ln -s <global>/skills/<name> <project>/.agents/skills/<name>` |
| **Copy** | Shared team repo, CI, no global guarantee | `cp -a` full skill trees including `references/` |
| **Git submodule / subtree** | Multi-repo org standard | One shared agents repo |
| **INDEX-only stub** | **Forbidden for core pack** | Causes "skill missing" at runtime |

### Detect global source

Try in order:

1. `$AGENTS_HOME` if set
2. `~/.agents`
3. Path of this skill when loaded from global (`…/skills/project-foundation/../`)

If none found and copy is required, stop and ask where the source pack lives.

## Project overlays (allowed local drift)

- Extra skills under `.agents/skills/<project-specific>/`
- Extra rows in `INDEX` for those skills
- Product rules in `AGENTS.md` (not duplicated into global rule files)
- Optional thin adapters that only point at global skills (keep adapters <30 lines)

## Version / freshness

Record in `.agents/FOUNDATION.md` (created by the skill):

```markdown
# Foundation pack
source: ~/.agents | path | copy
materialized_at: ISO-8601
core_pack_revision: <git short sha of source if available, else date>
mode: symlink | copy
```

Use this file in Audit/Evolve to detect stale copies.
