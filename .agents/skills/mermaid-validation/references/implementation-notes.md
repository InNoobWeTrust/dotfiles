# Implementation Notes

## Why happy-dom?

Mermaid (v11+) bundles DOMPurify internally. DOMPurify calls browser DOM APIs
(`DOMPurify.addHook`, `document.createElement`, etc.) even during parse-only
operations. Without a DOM polyfill, `mermaid.parse()` throws on many diagram
types — notably those using quoted labels, subgraphs, class diagrams, state
diagrams, pie charts, and gantt charts.

**happy-dom** provides a lightweight DOM implementation that satisfies these
dependencies. It must be registered **before** mermaid is imported, which is
why we use Bun's `--preload` flag rather than importing it in the script body.

### Why not other approaches?

| Approach | Result |
|---|---|
| `isomorphic-dompurify` | Doesn't patch mermaid's internal DOMPurify import |
| `globalThis.DOMPurify = ...` | Same — mermaid resolves its own bundled copy |
| `jsdom` | Works but much heavier than happy-dom |
| Import happy-dom in script body | Race condition — mermaid may import before registration completes |
| `--preload` with happy-dom | ✅ Registers globals before any module loads |

## Supported Diagram Types

All mermaid diagram types are supported (validated against mermaid v11.16):

- `graph` / `flowchart` (including subgraphs, HTML labels, quoted nodes)
- `sequenceDiagram`
- `classDiagram`
- `stateDiagram-v2`
- `erDiagram`
- `gantt`
- `pie`
- `gitGraph`
- `mindmap`
- `timeline`

## Common Syntax Pitfalls

| Pitfall | Example | Fix |
|---------|---------|-----|
| Missing node after arrow | `A -->` | `A --> B` |
| Unquoted special chars in labels | `A[Label (v2)]` | `A["Label (v2)"]` |
| Wrong arrow in sequence diagram | `Alice->Bob: Hi` | `Alice->>Bob: Hi` (for arrow) |
| Missing `end` for subgraph | `subgraph S ...` | Add `end` keyword |
| Tabs instead of spaces | `\tA --> B` | Use spaces for indentation |
| Unescaped quotes inside labels | `A["say "hello""]` | `A["say 'hello'"]` or escape |

## Bun Auto-Install

Bun automatically installs `mermaid` and `@happy-dom/global-registrator` from
npm on first run — no explicit `bun add` or `npm install` step needed. The
packages are cached in `~/.bun/install/cache/` and reused across runs.

## Performance

First run includes dependency download (~2-5s). Subsequent runs complete
in under 1 second for typical diagrams.
