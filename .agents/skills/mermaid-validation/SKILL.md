---
name: mermaid-validation
description: "Use this skill to validate Mermaid diagram syntax before embedding in artifacts, docs, or architecture deliverables. Activate when producing diagrams, diagnosing a parse/render failure, or batch-checking project `.mmd` files. A bundled Bun validator avoids a project install when Bun and authorized package resolution are available; first-run resolution may access a registry, so do not run it without that authorization."
---

# Mermaid Validation

Validate mermaid diagram syntax via `mermaid.parse()` without rendering.
Catches parse errors that would produce broken diagrams in viewers.

## When to Use

- After generating any mermaid code block (diagrams, ER, sequence, state, etc.)
- When a previous mermaid block failed to render
- When batch-checking `.mmd` files in a project

## Quick Start

Resolve `SKILL_ROOT` from the actual loaded skill location—the directory containing
this `SKILL.md`—and use its absolute path for both bundled scripts. Do not infer it
from the current working directory or a repository checkout. Keep diagram inputs
relative to the project directory (or pass their explicit project paths).

The bundled scripts use Bun's package resolution for `mermaid` and
`@happy-dom/global-registrator`. First-run resolution may access a package registry
and populate Bun's cache. No project manifest/install is needed, but this is still
dependency acquisition: run only when it is already available or explicitly
authorized; otherwise stop and use the permitted manual syntax review, noting its
limitation.

### Validate a file

```bash
SKILL_ROOT='<absolute directory containing the loaded SKILL.md>'
bun --preload "$SKILL_ROOT/scripts/happy-dom-preload.ts" \
    "$SKILL_ROOT/scripts/validate-mermaid.ts" diagram.mmd
```

### Validate from stdin

```bash
SKILL_ROOT='<absolute directory containing the loaded SKILL.md>'
echo 'graph TD
    A --> B' | bun --preload "$SKILL_ROOT/scripts/happy-dom-preload.ts" \
                  "$SKILL_ROOT/scripts/validate-mermaid.ts"
```

### Validate multiple files

```bash
SKILL_ROOT='<absolute directory containing the loaded SKILL.md>'
bun --preload "$SKILL_ROOT/scripts/happy-dom-preload.ts" \
    "$SKILL_ROOT/scripts/validate-mermaid.ts" a.mmd b.mmd c.mmd
```

## Write-then-Validate Pattern

When generating diagrams inline, write to a temp file, validate, then embed:

```bash
SKILL_ROOT='<absolute directory containing the loaded SKILL.md>'
DIAGRAM_FILE='diagrams/diagram.mmd' # project-relative input path
cat > "$DIAGRAM_FILE" << 'MERMAID'
graph TD
    A["Service A"] --> B["Service B"]
    subgraph SG["Backend"]
        B --> C["Database"]
    end
MERMAID

bun --preload "$SKILL_ROOT/scripts/happy-dom-preload.ts" \
    "$SKILL_ROOT/scripts/validate-mermaid.ts" "$DIAGRAM_FILE"
# Exit code 0 → safe to embed
```

## Exit Codes

| Code | Meaning |
|------|---------|
| `0`  | All inputs valid |
| `1`  | One or more inputs invalid |
| `2`  | Usage error (no input) |

## How It Works

Mermaid's `parse()` API validates syntax without rendering SVG. However,
mermaid internally depends on DOMPurify which requires browser DOM APIs.
The `happy-dom-preload.ts` module registers [happy-dom](https://github.com/nicedoc/happy-dom)
globals (`window`, `document`, etc.) via Bun's `--preload` flag **before**
mermaid loads, satisfying those dependencies without a real browser.

Details: `references/implementation-notes.md`

## Stop Conditions

- **Valid syntax**: exit 0, proceed with embedding.
- **Invalid syntax**: exit 1 with line/column error. Fix the diagram and re-validate.
- **No bun available**: fall back to manual syntax review; do not skip validation silently.

## Anti-Patterns

| Temptation | Why Wrong | Correct Path |
|---|---|---|
| Skip validation because "the syntax looks right" | LLMs frequently produce subtle syntax errors (unmatched quotes, wrong arrow types, missing `end`) | Always validate before embedding |
| Run without `--preload` flag | DOMPurify errors will cause false negatives on many diagram types | Use the absolute `$SKILL_ROOT/scripts/happy-dom-preload.ts` path |
| Guess script paths from the project root | A standalone skill may be loaded from elsewhere | Resolve the loaded skill root once and pass absolute script paths; if unavailable, stop rather than guess |
| Validate only simple diagrams, skip complex ones | Complex diagrams (subgraphs, HTML labels, class diagrams) are most error-prone | Validate everything |
| Ignore exit code and embed anyway | Broken diagrams degrade deliverable quality | Check exit code; fix before proceeding |

## References

- `scripts/happy-dom-preload.ts` — Bun preload module (happy-dom global registration)
- `scripts/validate-mermaid.ts` — Validation script (file args or stdin)
- `references/implementation-notes.md` — DOM polyfill rationale, supported diagram types, common pitfalls
