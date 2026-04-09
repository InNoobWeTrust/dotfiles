---
branch: master
topic: agents review and handoff system
status: paused
updated: 2026-03-24T02:35:00+07:00
agent: antigravity
---

# .agents Review and Handoff System

## Status

All major workstreams complete:

1. ✅ **Round 2 review fixes** — 9 findings fixed + 3 bonus lint fixes
2. ✅ **Fix mode** — Added to `review.md`, tested on itself
3. ✅ **Handoff system** — Directory structure, command, rule, and demo created
4. ✅ **MCP Sync Refactoring** — Synced `.agents` from `remote host`, refactored `sync-mcp.md` to be agent-native, removed shell script.

## Key Decisions

- **Fix mode** added to existing `review.md` command (not a new skill)
- **Self-orientation step** (step 0) in fix mode loop — re-read planning notes each cycle
- **Agent-agnostic language** throughout — "your planning notes" not "task.md"
- **Handoff naming**: `<branch-slug>--<topic-slug>.md` with `--` separator
- **Handoff lifecycle**: auto-save + manual; archive by moving to `archive/`
- **Three-layer design**: rule (always loaded) → command (on demand) → README (reference)
- **Self-contained principle**: handoffs must inline all context from agent-internal
  artifacts — never assume next session has access to your storage
- **sync-skill-dna.sh bug fixed** — false-positive drift from blank line mismatch,
  fixed with `sed '/./,$!d'`
- **skill-creator is untouchable** — copied as-is from Claude skills
- **MCP Sync command**: Deprecated `sync-mcp.sh` bash script in favor of agent-native JSON parsing and merging. Absolute paths required in canonical `mcp.json`.

## Blockers

None.

## Next Steps

- Remove auto-activate language from `handoff.md` command description
  (redundant now that `.agents/rules/handoff.md` handles auto-triggers)
- Table alignment (MD060) across `.agents/*.md` — ~50 tables, cosmetic
- Consider handoff integration with `requirements-driven-dev` lifecycle gates

## Open Questions

- Should handoffs include conversation summaries or just task-level context?
- Does the three-layer design (rules → commands → docs) need documenting
  as a general `.agents` convention?

## Recent Changes

### This session

**New files:**

- `.agents/handoffs/README.md` — Discovery protocol, file format, naming, lifecycle
- `.agents/handoffs/archive/.gitkeep` — Empty dir placeholder
- `.agents/commands/handoff.md` — Save/restore/archive command
- `.agents/rules/handoff.md` — Always-loaded rule for auto-save triggers and startup check

**Modified files:**

- `.agents/commands/review.md` — Fix mode, self-orientation, agent-agnostic language
- `.agents/skills/adversarial-reviewer/SKILL.md` — Italic syntax (10 instances)
- `.agents/skills/security-reviewer/SKILL.md` — Related Skills, italics, blank lines
- `.agents/skills/editorial-reviewer/SKILL.md` — Related Skills section
- `.agents/skills/requirements-driven-dev/references/core/lifecycle.md` — Italic fixes
- `.agents/scripts/sync-skill-dna.sh` — False-positive drift detection fix
- `.agents/scripts/gap-check.sh` — Safe printf format
- `.agents/commands/shard-doc.md` — Step numbering fix
- `.agents/commands/sync-mcp.md` — Complete rewrite to be agent-native, resolving multiple edge cases flagged by adversarial review.
- Legacy `sync-mcp` workflow path and `.agents/scripts/sync-mcp.sh` — Deleted in favor of the new structure.
- `.agents/rules/handoff.md` & `.agents/commands/handoff.md` — Synced updates from `remote host`.

---

## Context: Handoff System Design

### Problem

Each agent stores context in proprietary locations (~/.claude/, .cursor/,
Antigravity brain/). Switching devices or agents means losing all state.

### Solution

Directory of scoped handoff files at `.agents/handoffs/` with:

- Branch+topic naming: `<branch-slug>--<topic-slug>.md`
- YAML frontmatter (branch, topic, status, updated, agent)
- Self-contained content (no external artifact dependencies)

### Architecture

| Layer | File | Loaded | Purpose |
|---|---|---|---|
| Rule | `.agents/rules/handoff.md` | Always | Startup check + auto-save triggers |
| Command | `.agents/commands/handoff.md` | On demand | Detailed save/restore/archive steps |
| Convention | `.agents/handoffs/README.md` | On demand | File format, naming, lifecycle |

### Concurrency model

- Sequential agents on same topic: latest write wins
- Concurrent agents on same topic: append timestamped sections
- Different topics on same branch: separate files

---

## Context: Fix Mode (review.md)

Loop protocol added as 4th mode alongside Quick/Standard/Deep:

```
0. Orient: re-read planning notes
1. Run Standard review
2. Classify: 🔴 Blocking → 🟡 Warning → 🟢 Info → ⚪ Cosmetic
3. Apply fixes, track progress
4. Re-verify
5. Loop to step 0 if new issues
6. Pre-present checklist
7. Present summary
```

Auto-fix matrix: syntax/formatting ✅, cross-refs ✅, script bugs ✅,
synced drift ✅, permissions ✅ | restructuring ⚠️ | tables ❌, design ❌

Guardrails: max 3 cycles, respect exclusions, preserve author voice.

---

## Context: Review Round 2 Findings

| Finding | File | Fix |
|---|---|---|
| DNA drift (3 copies) | adversarial-protocol copies | sync-skill-dna.sh --apply |
| Italic syntax | adversarial-reviewer/SKILL.md | 10 replacements |
| Missing Related Skills | security-reviewer, editorial-reviewer | Added sections |
| printf vulnerability | gap-check.sh | `printf '%s' "$GAPS"` |
| Scripts not executable | both scripts | chmod +x |
| Duplicate step numbers | shard-doc.md | 3,3,4 → 3,4,5 |
| Italic in lifecycle.md | lifecycle.md | 2 replacements |
| False-positive drift | sync-skill-dna.sh | `sed '/./,$!d'` |

Intentionally skipped: MD060 tables (~50), MD040 template blocks,
MD024 intentional duplicates, SCRIPT_DIR unused, skill-creator untouched.
