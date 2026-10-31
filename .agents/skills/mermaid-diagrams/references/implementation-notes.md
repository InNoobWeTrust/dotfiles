# Parser Implementation Notes

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

## Coverage Limitations

The bundled script calls the installed Mermaid parser; coverage depends on that installed version and its registered diagrams. The catalog records documented non-beta families, not a tested parser-support matrix. ZenUML requires an external plugin and is not supported by this unmodified script. No claim of all-types validation is made.

## Common Syntax Pitfalls

| Pitfall | Example | Fix |
|---------|---------|-----|
| Missing node after arrow | `A -->` | `A --> B` |
| Unquoted special chars in labels | `A[Label (v2)]` | `A["Label (v2)"]` |
| Wrong arrow in sequence diagram | `Alice->Bob: Hi` | `Alice->>Bob: Hi` (for arrow) |
| Missing `end` for subgraph | `subgraph S ...` | Add `end` keyword |
| Tabs instead of spaces | `\tA --> B` | Use spaces for indentation |
| Unescaped quotes inside labels | `A["say "hello""]` | `A["say 'hello'"]` or escape |

## Bun Dependency Resolution

Bun may resolve `mermaid` and `@happy-dom/global-registrator` from the configured
package source on first run; the project does not need a manifest or local
`bun add`/`npm install`. Resolution can access a registry and write to Bun's
configured cache, so it is not an authorization-free or offline guarantee. Run
only when the required packages are already available or dependency resolution is
explicitly authorized. Do not install or enable network access to make validation
work. If resolution is unavailable or unauthorized, use only the permitted manual
syntax review and report that parse validation was not executed. Cache location is
runtime-configured; this skill does not require a host-specific cache path.

## Performance

First run may include dependency resolution/download. Later runs depend on the
runtime cache and diagram size; no timing guarantee is part of this skill.
