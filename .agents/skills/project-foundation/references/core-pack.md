# Core Pack — What Every Project Gets

Materialize this pack into `<project>/.agents/` so agents work **even when global `~/.agents` is unavailable** (CI, teammates, fresh machines). Prefer **symlinks to the global source of truth** when the repo is only used on machines that have the global pack; **copy** when the repo must be self-contained (shared team repos).

## Rules (always materialize)

| File | Required | Notes |
|---|---|---|
| `code-quality.md` | Yes | Always-on baseline |
| `tdd.md` | Yes | Logic modules |
| `grooming.md` | Yes | Ambiguity / reverse interview |
| `ubiquitous-language.md` | Yes | Points at project `GLOSSARY.md` |
| `slicing.md` | Yes | Feature planning |
| `skill-compliance.md` | Yes | Binding skill execution |
| `self-grounded-verification.md` | Yes | Anti agreement-bias |
| `autonomy-safety.md` | Yes | Elevated autonomy / AFK |
| `INDEX` | Yes (project) | Rule map required by `agent-instructions.md` |
| `skills-discovery.md` | Yes (project) | Index-first routing |
| `memory.md` | Yes (project) | Capture / recall / consolidate / evict |
| `command-routing.md` | Optional | Only if project has local commands |

Do **not** invent project-only rule bodies that duplicate global content. Materialize from the global pack, then add **project overlays** only for true local exceptions (prefer `AGENTS.md` for product constraints). Treat a missing `rules/INDEX` as a broken instruction-routing foundation.

## Skills (core — materialize full trees, not INDEX stubs)

| Skill | Required | Why |
|---|---|---|
| `code-craft` | Yes | Default implementation skill |
| `systematic-investigation` | Yes | Debug / root cause |
| `codebase-exploration` | Yes | Unfamiliar navigation |
| `reviewer` (+ `references/`) | Yes | Explicit review; needs sub-reviewers |
| `requirements-driven-dev` (+ `references/`) | Yes | Specs / PRD / TRD / BDD |
| `memory` | Yes | Two-tier memory + dream cycle + progressive-disclosure structuring |
| `subagent-dispatch` | Yes | Safe delegation prompts |
| `project-foundation` | Yes | Re-audit / evolve this pack |
| `skill-author` | Recommended | Governance maintenance |
| `bounded-iteration` | Recommended | AFK / verify loops |
| `architecture-writer` | Optional | Deep architecture docs |
| `devsecops` | Optional | CI/CD + security scanning |

Also materialize:

- `skills/INDEX.md` — project routing table (may slim specialized skills)
- `skills/WIRING.md` — composition (can symlink to global)

## Skills (do **not** force-copy unless the project uses them)

`swarm-intelligence` (Single-Node + Full Swarm via mode router; pin with `/external-subagent` or `/swarm`), `data-storytelling`, `cdp-browser-automation`, `ui-ux` (materialize when project contains UI/frontend components or maintains a `DESIGN.md` visual system), `video-production`, `talent-screening`, `model-benchmarking`, featherless personas, large asset CSVs — **link or copy only on demand**. Putting them in every repo wastes disk and INDEX attention.

**INDEX slim rule:** project `skills/INDEX.md` lists core pack + used domain skills only. Unused global rows are noise for attention routing.

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
- Extra rows in `INDEX.md` for those skills
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
