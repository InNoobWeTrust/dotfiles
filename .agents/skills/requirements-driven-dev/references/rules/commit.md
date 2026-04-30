# Git Commit Convention

> This convention assumes Git-based version control. For non-Git workflows,
> adapt the commit format to your project's versioning system.

## Commit Message Format

```
<type>(<scope>): <summary>

[changelog: <changelog-filename>]

<optional body>
```

### Type

| Type | When |
|------|------|
| `feat` | New feature or behavior |
| `fix` | Bug fix |
| `refactor` | Restructuring (no behavior change) |
| `test` | Adding or updating verifications |
| `docs` | Documentation only |
| `chore` | Build, CI, tooling changes |
| `style` | Formatting, whitespace (no logic change) |

### Scope

The affected module or area:
- Use a short, descriptive label for the part of the system changed
- Examples: `auth`, `search`, `dashboard`, `api`, `client`, `infra`

### Summary

- Imperative mood: "add", "fix", "remove" (not "added", "fixes")
- Max 72 characters
- No period at end

### Changelog Reference (MANDATORY)

Every commit **must** include a `[changelog: <filename>]` line that references
the changelog file in `{CHANGELOG_DIR}`.

`{CHANGELOG_DIR}` and other path placeholders resolve inside the host project,
not inside the shared agent or skill repository.

## Examples

```
feat(auth): add JWT token refresh endpoint

[changelog: 20260303_jwt-refresh.md]

Implements automatic token refresh when access token expires.
Based on `{SPEC_DIR}jwt-refresh.md` scenarios.
```

```
fix(search): handle empty query parameter gracefully

[changelog: 20260303_search-edge-cases.md]
```

```
docs(onboarding): add user onboarding guide

[changelog: 20260310_onboarding-guide.md]

Covers all scenarios from `{SPEC_DIR}user-onboarding.md`
```

## Rules

1. **One logical change per commit** — don't mix feature + refactor
2. **Changelog file must exist** before commit is made
3. **Spec reference** — if the commit implements a BDD spec, mention it in body. Optionally reference the parent TRD and PRD for traceability
4. **Co-authored** — when AI produces deliverables and human reviews, use:
   ```
   Co-authored-by: AI Agent <...>
   ```

## Pre-Commit Checklist

- [ ] Changelog file created in `{CHANGELOG_DIR}`
- [ ] Commit message references changelog
- [ ] All verifications pass
- [ ] Human has reviewed the changes
