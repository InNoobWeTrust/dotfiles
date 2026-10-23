# Discoverable configuration and task invocation

Use when configuration or command discovery is the selected friction. Preserve
existing invocation, setting names and precedence unless a change is authorized.
Source lineage: [sources](sources.md), “Configuration and invocation.”

## Configuration: one authority, three distinct products

Inspect the actual loader, types/schema and runtime validation. Static types help
authors; external files/environment/CLI still need boundary validation. Prefer
existing typed settings/schema tooling rather than a second config framework.

Keep these distinct:
1. **Declaration:** keys, types, required/optional/null/empty semantics, valid ranges, descriptions and code-authoritative defaults.
2. **Safe template/example:** generated from that declaration where supported, or checked against it if hand-authored. Placeholders are not runnable defaults; secret fields must not expose live values.
3. **Effective configuration:** resolved runtime values and, where useful, their winning source. Inspection must redact secrets before output, including debug logs.

JSON Schema `default`/`examples` are annotations, not automatic value assignment
or validation of those values. Inspect the framework's actual behavior; do not
infer runtime defaults from a schema export.

### Improvement path

- Reuse existing schema/default export, init/template command or editor schema support. If absent and in scope, expose a small template/export path from the authoritative declarations; avoid copied default constants.
- Make the template easy to find from the real command help or project entry page. Show required inputs, accepted types/units and safe examples close to settings, not only in a distant manual.
- Document the loader's **actual** precedence, merging, unknown-key handling and missing/empty/null semantics. Do not prescribe a universal order; existing user expectations are a compatibility constraint.
- Verify defaults are valid, wrong types/ranges fail usefully, and misspelled keys/environment names do not silently select surprising values without documented handling.
- Errors identify the field, expected form and corrective action without echoing secrets. Handle invalid input before destructive work.
- For source inspection/effective-config commands, show provenance only through an allowlisted/redacted projection. Flags, process environment, files and secret stores have different exposure properties; choose within the project's threat model, not a universal “environment is safe” rule.

### Verification, including simple configs

Validate the **whole** generated safe template with the real parser/validator,
using declared safe fixtures for required/secret values. Separately verify that
placeholders fail usefully or are explicitly non-runnable, not mistaken for defaults.

Compare all exposed nonsecret defaults from declarations/template generation
against resolved runtime defaults where introspection exists. Without automated
enumeration, compare the bounded declared setting set manually and state its
coverage; omitted, redacted or dynamic settings remain **unverified**, not certified
by a sample. Exercise override precedence and invalid/missing values for the
changed behavior. Check generation/inspection/error output for secret leakage.

Counterexample: a template says `timeout: 30`, code defaults to `10`, and bad
strings are rejected correctly. A bad-value smoke check passes while default
discoverability is still broken; type validation cannot replace parity checks.

## Common tasks: discover one path, avoid duplicate orchestration

Inventory common existing actions relevant to the task: setup, run, check/test,
build, inspect, debug or reproduce. Use the project's established CLI, package
scripts, Makefile, justfile or equivalent. Do not wrap commands just to introduce
another preferred tool; if a thin wrapper is useful, keep the underlying command
and ownership clear.

- A developer can list tasks or get help without reading implementation code. Provide a minimal example and describe prerequisites/working directory and expected result.
- Use consistent names/options; keep defaults safe. Expensive, destructive or remote effects must be visible before invocation, not hidden behind “setup” or “check.”
- Use meaningful nonzero failures, actionable errors, results on stdout and diagnostics on stderr where the existing CLI contract permits.
- Support non-interactive execution explicitly: no unexpected prompts/TTY dependency, decorative ANSI or progress noise in machine output. Preserve documented compatibility if changing output.
- Avoid secrets in command arguments or examples. Do not install dependencies, contact services or mutate data merely to display help/list tasks.
- Reuse task/build semantics: a command runner is not automatically an incremental build engine; avoid two copies of the same dependency logic.

### Copyable task brief (not a required file)

```text
Project: <resolved root>; entry point: <existing help/list command>
Developer task: adjust <setting> and run <existing task>
Scope: config/template/help only; preserve precedence and task names
Check: safe template parses; exposed defaults match runtime; invalid input
       fails with a useful message; task works without a TTY
Effects allowed: <explicit local/remote limits>; unrun checks: <reason>
```

Execute help/list + one ordinary path + a relevant invalid/non-TTY path within
authority. Record source-only checks separately if prerequisites prevent execution.
