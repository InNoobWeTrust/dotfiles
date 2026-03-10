---
trigger: always_on
description: Changelog file convention — tracks which artifacts are in scope for a feature.
---

# Changelog Convention

## Purpose

Changelog files track **which artifacts (added/modified/removed) belong to a feature scope**.
They provide a live audit trail of changes tied to specific timestamps, enabling
teams to trace work across time and validate scope adherence.

## File Convention

- **Location**: `{CHANGELOG_DIR}`
- **Naming**: `<yyyymmdd>_<feature-slug>.md`
  - `yyyymmdd` — date the feature work **started** (e.g., `20260303`)
  - `feature-slug` — lowercase, hyphen-separated, matches `{SPEC_DIR}<feature-slug>.md`
  - Full example: `20260303_jwt-refresh.md`
- **One file per feature** — created when the first artifact for that feature is modified, appended for each subsequent change
- **Maps 1:1 to a BDD spec** — `{SPEC_DIR}jwt-refresh.md` → `{CHANGELOG_DIR}20260303_jwt-refresh.md`
- **Date prefix enables milestone filtering** — collect changelogs by time range for release notes

## Required Content

```markdown
# Changelog: <Feature Name>

**Spec**: {SPEC_DIR}<feature-slug>.md
**Status**: completed | in-progress | blocked

---

## Session: <YYYY-MM-DDTHH:MM>

### Summary
<1-3 sentences: what was accomplished in this session>

### Changes
- Added: <new artifact or capability>
- Modified: <artifact> — <what changed and why>
- Removed: <artifact> — <reason>

### Decisions
- <key decision and rationale>

### Known Issues
- <issue, if any>

### Next Steps
- [ ] <pending task>

### Verification Status
- <verification area>: <X passed, Y failed>

---

## Session: <YYYY-MM-DDTHH:MM> (append new sessions below)

...
```

## Rules

1. **One changelog per feature (BDD spec)** — each spec has exactly one changelog file
2. **Append, never overwrite** — each modification adds a `## Session: <YYYY-MM-DDTHH:MM>` entry at the bottom
3. **Create on first modification** — when the first artifact for a feature is modified, create the changelog
4. **Update immediately after changes** — record each Added/Modified/Removed action to keep scope current
5. **Be compact** — each session entry should be 5-10 lines (focus on what changed, not why it was changed)
6. **Reference the BDD spec** — link to `{SPEC_DIR}<feature-slug>.md` for behavior context
7. **Never delete** — changelogs are append-only audit history
8. **Session timestamp for traceability** — the `YYYY-MM-DDTHH:MM` enables tracing scope changes back to exact moment

## Querying Scope

To see which artifacts are in scope for a feature, search the changelog directory
for files matching the feature slug.

To collect all features started in a time range (for release notes), filter
changelog filenames by their date prefix.
