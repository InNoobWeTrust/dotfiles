# Foundation Drift Checks (Audit / Evolve)

Run these checks without rewriting healthy files. Produce a **gap report**, then apply only approved fixes.

## A. Presence

- [ ] `AGENTS.md` has mandatory sections (source-of-truth, tooling, agent ops, verify commands, security)
- [ ] `GLOSSARY.md` exists with ≥10 domain terms (or justified fewer for tiny repos)
- [ ] `.agents/FOUNDATION.md` exists (source, mode, revision, date)
- [ ] Every **required** rule from `core-pack.md` is present and non-empty
- [ ] Every **required** skill tree from `core-pack.md` is present with `SKILL.md`
- [ ] `reviewer/references/sub-reviewers/` has at least: code-quality, security, adversarial, design-rigor, edge-case-hunter, editorial
- [ ] `requirements-driven-dev/references/` exists if that skill is listed required
- [ ] `skills/INDEX.md` lists all required skills with Use When / Do Not Use When
- [ ] `skills/WIRING.md` exists
- [ ] `Makefile` has help/fix/lint/quality/test/dev/build (or documented equivalents)
- [ ] `docs/architecture.md` and `docs/engineering/quality-gates.md` exist

## B. Wiring integrity

- [ ] INDEX routes only to skills that exist on disk
- [ ] No INDEX-only stubs for core pack ("references global" without a path agents can load)
- [ ] Symlinks resolve (no dangling links)
- [ ] Project-specific skills are labeled as such in INDEX (not mixed into "core" without note)

## C. Content drift vs reality

- [ ] `AGENTS.md` verify commands match real Makefile / package scripts
- [ ] Stack statements (language, package manager, ports) match the repo
- [ ] `GLOSSARY.md` terms still appear in code; flag dead terms and new unnamed concepts
- [ ] Quality-gates doc thresholds match CI / Makefile
- [ ] Architecture non-goals still true; no major subsystem missing from the map

## D. Freshness vs global pack (copy mode)

- [ ] Compare `FOUNDATION.md` revision/date to global pack
- [ ] If global core skill/rule is >1 minor change ahead, propose sync (do not silent-overwrite project overlays)
- [ ] Symlink mode: skip content sync; only check link targets

## E. Attention / progressive disclosure health

- [ ] Project INDEX does not list unused mega-skills (swarm, video, talent, etc.) unless the team uses them
- [ ] No full duplicate of global docs/ under project `.agents/docs/` unless intentional
- [ ] Rules that are global baselines are not re-expanded into multi-hundred-line project forks without reason

## Gap report format

```markdown
## Foundation audit — <project> — <date>
Mode: symlink | copy | mixed
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
- `INDEX.md` routes to a skill path that does not exist
- New major subsystem landed and `docs/architecture.md` / `GLOSSARY.md` were not updated in the same change set
- Global pack revision in `FOUNDATION.md` is older than 90 days (copy mode) and user is doing foundation-related work
- First session in a repo that has `AGENTS.md` but no `.agents/FOUNDATION.md`
