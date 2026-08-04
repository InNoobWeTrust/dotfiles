---
name: mermaid-validation
description: "Use this skill to validate mermaid diagram syntax before embedding in artifacts, docs, or architecture deliverables. Activate when producing mermaid diagrams, when a previous mermaid block caused a render error, or when batch-validating existing .mmd files. Provides a self-executing Bun script — no npm install required."
---

# Mermaid Validation

Validate mermaid diagram syntax via `mermaid.parse()` without rendering.
Catches parse errors that would produce broken diagrams in viewers.

## When to Use

- After generating any mermaid code block (diagrams, ER, sequence, state, etc.)
- When a previous mermaid block failed to render
- When batch-checking `.mmd` files in a project

## Quick Start

All commands run from the **repository root** (`$GIT_ROOT`).
Bun auto-installs `mermaid` and `@happy-dom/global-registrator` on first run.

### Validate a file

```bash
bun --preload ./.agents/skills/mermaid-validation/scripts/happy-dom-preload.ts \
    .agents/skills/mermaid-validation/scripts/validate-mermaid.ts diagram.mmd
```

### Validate from stdin

```bash
echo 'graph TD
    A --> B' | bun --preload ./.agents/skills/mermaid-validation/scripts/happy-dom-preload.ts \
                  .agents/skills/mermaid-validation/scripts/validate-mermaid.ts
```

### Validate multiple files

```bash
bun --preload ./.agents/skills/mermaid-validation/scripts/happy-dom-preload.ts \
    .agents/skills/mermaid-validation/scripts/validate-mermaid.ts a.mmd b.mmd c.mmd
```

## Write-then-Validate Pattern

When generating diagrams inline, write to a temp file, validate, then embed:

```bash
cat > /tmp/diagram.mmd << 'MERMAID'
graph TD
    A["Service A"] --> B["Service B"]
    subgraph SG["Backend"]
        B --> C["Database"]
    end
MERMAID

bun --preload ./.agents/skills/mermaid-validation/scripts/happy-dom-preload.ts \
    .agents/skills/mermaid-validation/scripts/validate-mermaid.ts /tmp/diagram.mmd
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
| Run without `--preload` flag | DOMPurify errors will cause false negatives on many diagram types | Always use `--preload ./.agents/skills/mermaid-validation/scripts/happy-dom-preload.ts` |
| Use relative path without `./` prefix for preload | Bun requires `./` prefix for relative preload paths | Always prefix with `./` |
| Validate only simple diagrams, skip complex ones | Complex diagrams (subgraphs, HTML labels, class diagrams) are most error-prone | Validate everything |
| Ignore exit code and embed anyway | Broken diagrams degrade deliverable quality | Check exit code; fix before proceeding |

## References

- `scripts/happy-dom-preload.ts` — Bun preload module (happy-dom global registration)
- `scripts/validate-mermaid.ts` — Validation script (file args or stdin)
- `references/implementation-notes.md` — DOM polyfill rationale, supported diagram types, common pitfalls
