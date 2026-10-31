# Syntax Validation

The bundled script calls Mermaid's `parse()` API. It checks syntax only: not SVG
rendering, destination-host compatibility, diagram semantics, or whether the visual
is understandable. Select and inspect the destination separately as described in
`selection-and-compatibility.md`.

## Resolve and Run

Resolve `SKILL_ROOT` as the absolute directory containing the loaded `SKILL.md`.
Do not infer it from the project working directory or a repository checkout. Keep
diagram input paths relative to the project or pass their explicit paths.

```bash
SKILL_ROOT='<absolute directory containing the loaded SKILL.md>'
bun --preload "$SKILL_ROOT/scripts/happy-dom-preload.ts" \
    "$SKILL_ROOT/scripts/validate-mermaid.ts" diagram.mmd
```

For standard input:

```bash
SKILL_ROOT='<absolute directory containing the loaded SKILL.md>'
cat diagram.mmd | bun --preload "$SKILL_ROOT/scripts/happy-dom-preload.ts" \
    "$SKILL_ROOT/scripts/validate-mermaid.ts"
```

For multiple files, pass each path after the script path. For a newly authored
block, save the exact fenced-block contents (without Markdown fence lines) to a
temporary or project file and validate that file before embedding it. Do not
substitute a different “similar” sample.

## Dependencies and Permission

The scripts need Bun plus `mermaid` and `@happy-dom/global-registrator`. Bun may
resolve missing packages from a registry and write to its configured cache; that is
dependency acquisition. Run only if dependencies are already available or that
acquisition is explicitly authorized. Do not install packages, add a manifest, or
enable network access to make validation pass. If Bun or dependencies are unavailable
or unauthorized, use a manual syntax review only if appropriate and report parsing
as **unverified**.

## Exit and Failure Contract

| Exit code | Meaning | Required response |
|---|---|---|
| `0` | All supplied input parsed | Record syntax parse success only; target rendering and semantic correctness remain separate |
| `1` | One or more inputs failed to parse | Fix the exact source and rerun before describing syntax as verified |
| `2` | No input supplied (usage error) | Supply file input or non-empty stdin; this is not a syntax result |

Read errors, import failures, missing dependencies, and other setup/runtime
exceptions are not successful validations and may not use these three documented
result meanings. Report the observed exception, do not claim a syntax result, and
do not retry by installing or changing the environment without authorization. The
preload must run before the validator using the absolute loaded-root path; omitting
it may cause DOM-related failures.

## Safe Embedding

Only an exit code of `0` establishes that the installed parser accepted the exact
input. Exit `1` must be corrected and rechecked. Exit `2` or a setup/read exception
does not establish either validity or invalidity. Manual review is an explicitly
unverified fallback. Never describe parse success as rendering, image export,
semantic validation, or proof that the Markdown host supports the diagram.
