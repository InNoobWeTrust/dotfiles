# Configuration

This skill uses **configurable directories** for requirement documents and changelog files.

By default:

| Variable          | Default            | Purpose                                                          |
| ----------------- | ------------------ | ---------------------------------------------------------------- |
| `{PRD_DIR}`       | `docs/prds/`       | Product requirement documents — one `.md` per product/initiative |
| `{TRD_DIR}`       | `docs/trds/`       | Technical requirement documents — one `.md` per component/system |
| `{SPEC_DIR}`      | `docs/specs/`      | Behavior specs — one `.md` per feature                           |
| `{CHANGELOG_DIR}` | `docs/changelogs/` | Artifact scope tracker — one file per feature                    |

### Project-specific overrides

Before using defaults, **check existing project conventions first**:

1. **Scan for existing directories** — Look for `docs/`, `specs/`, `prds/`,
   `.specs/`, `requirements/`, or similar directories already in the project
2. **Check agent config files** — Read `AGENT.md`, `.cursorrules`,
   `CLAUDE.md`, `.gemini/`, or similar config files for declared paths
3. **Infer from existing artifacts** — If PRDs already exist somewhere,
   use that location
4. **Fall back to defaults** — Only if no convention is detected

When declaring overrides explicitly, add to any project-level agent config:

```markdown
## Requirements-Driven Dev Configuration

- **PRD directory**: `docs/prds/`
- **TRD directory**: `docs/trds/`
- **Spec directory**: `docs/specs/`
- **Changelog directory**: `docs/changelogs/`
```

If no override is provided and no convention detected, the skill uses
the defaults above.

### Additional project overrides

The host project may also configure:

- **Verification tools** — e.g., pytest, vitest, manual checklist, etc.
- **Source layout** — where deliverables live
- **Commit convention extensions** — additional `type` values
- **Domain-specific execution rules** — extend `references/rules/execution.md`

These overrides live in the project's own agent config, not in this skill.
