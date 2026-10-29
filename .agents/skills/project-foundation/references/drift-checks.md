# Foundation Drift Checks (Audit / Evolve)

Run these checks without rewriting healthy files. Produce a **gap report**, then apply only approved fixes.

For an authoring pack (`mode: source`), apply routing, bundle and affected-content
checks to the declared source scope. Application-specific Makefile/architecture/
UI checks are not automatically applicable; do not generate unrelated files or
claim the entire source pack audited. Record unsupported/uninspected surfaces.

## A. Presence

- [ ] `AGENTS.md` has mandatory sections (source-of-truth, tooling, agent ops, **Structure Contract** with layer order + 1–3 exemplar modules + golden principles, verify commands, security)
- [ ] A `GLOSSARY.md` exists when requested or recurring business ambiguity justifies one; otherwise absence is not a gap. No term-count quota.
- [ ] `.agents/FOUNDATION.md` exists (source, mode, revision, date)
- [ ] Every **required** rule from `core-pack.md` is present and non-empty
- [ ] Every **required** skill tree from `core-pack.md` is present with `SKILL.md`
- [ ] Selected review guidance covers code quality, security, adversarial, design-rigor, edge-case and editorial evaluation; verify the resource locations declared by the installation manifest rather than assuming a sibling directory
- [ ] Selected planning and domain guidance is materialized with its declared resources, not INDEX-only stubs; report missing required capabilities instead of inventing policy bodies
- [ ] `skills/INDEX` lists all required skills with Use When / Do Not Use When
- [ ] `skills/WIRING` exists
- [ ] `Makefile` has help/fix/lint/quality/test/dev/build (or documented equivalents)
- [ ] `docs/architecture.md` and `docs/engineering/quality-gates.md` (with mechanical boundary, complexity/size, duplication, dead-code gates, hook wiring, and legacy baseline/ratchet where needed) exist
- [ ] `DESIGN.md` exists for UI/frontend projects (verified via UI/UX design capability)

## B. Wiring integrity

- [ ] INDEX routes only to skills that exist on disk
- [ ] No INDEX-only stubs for core pack ("references global" without a path agents can load)
- [ ] Symlinks resolve (no dangling links)
- [ ] Project-specific skills are labeled as such in INDEX (not mixed into "core" without note)

## C. Content drift vs reality

- [ ] `AGENTS.md` verify commands match real Makefile / package scripts
- [ ] Stack statements (language, package manager, ports) match the repo
- [ ] `GLOSSARY.md` terms still appear in code; flag dead terms and new unnamed concepts
- [ ] Quality-gates doc thresholds match actual linter configs / CI / Makefile, and existing-project baselines only ratchet downward
- [ ] Exemplar modules named in `AGENTS.md` exist on disk and pass the configured structure gates
- [ ] Architecture non-goals still true; no major subsystem missing from the map
- [ ] `DESIGN.md` passes lint (`npx @google/design.md lint DESIGN.md`) and tokens match UI implementation

## D. Freshness vs global pack (copy mode)

- [ ] Compare `FOUNDATION.md` revision/date to global pack
- [ ] If global core skill/rule is >1 minor change ahead, propose sync (do not silent-overwrite project overlays)
- [ ] Symlink mode: skip content sync; only check link targets

## E. Attention / progressive disclosure health

- [ ] Project INDEX does not list unused mega-skills (video, talent, etc.) unless the team uses them
- [ ] No full duplicate of global docs/ under project `.agents/docs/` unless intentional
- [ ] Rules that are global baselines are not re-expanded into multi-hundred-line project forks without reason
- [ ] `AGENTS.md` length stays within the anti-bloat heuristic; if it exceeds ~150 lines or 8 KB, load the governance skill authoring capability's instruction-bloat guidance and refactor into references or rules
- [ ] Affected entry maps lead to active governing sources; proposals/history and
  descriptions are not silently normative. Material conflicting claims are reported
  before dependent work. Use [Context integrity](context-integrity.md), not blind deduplication.

## Gap report format

```markdown
## Foundation audit — <project> — <date>
Mode: symlink | copy | mixed | source
Source: <path>

### Critical gaps (breaks agent routing)
- ...

### Stale vs reality
- ...

### Optional upgrades
- ...

### Recommended actions
1. ...
```

## When to auto-trigger audit (agent-facing)

Trigger **Audit/Evolve** (not full Bootstrap) when any of:

- User says: audit foundation, evolve agents setup, sync .agents, foundation drift, missing skills
- `skills/INDEX` routes to a skill path that does not exist
- New major subsystem landed and `docs/architecture.md` / `GLOSSARY.md` were not updated in the same change set
- Global pack revision in `FOUNDATION.md` is older than 90 days (copy mode) and user is doing foundation-related work
- First session in a repo that has `AGENTS.md` but no `.agents/FOUNDATION.md`;
  investigate source-vs-installed identity, not automatic full Bootstrap
- `AGENTS.md` exceeds ~150 lines or 8 KB while governance work is already in scope
