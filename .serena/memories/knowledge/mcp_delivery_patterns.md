---
kind: knowledge
created: 2026-10-12
---

# MCP Delivery Patterns

Stable implementation patterns for MCP servers in this repository.

## 1. Container Engine Detection (Sandbox MCP)

- **Priority**: Podman first, Docker fallback. Probe each candidate sequentially; first clean
  exit-0 probe wins.
- **Missing binary is safe**: a missing engine binary (ENOENT) resolves without throwing; the probe
  skips to the next candidate.
- **Probe contract**: exact probe limits (wallTimeMs, maxOutputBytes) and the Podman-specific
  environment allowlist extensions are implementation values in the sandbox MCP source; consult
  `.agents/mcps/sandbox/README.md` and `src/engine.ts` for current authoritative values.
- **Engine pinned at startup, no hot fallback**: once selected, the engine is fixed for the session
  lifetime. Lifecycle failures report the selected engine; they do not trigger re-detection. This is
  intentional fail-closed design.
- **Host-only mode**: when no engine is detected, omit all container tools and the container
  instruction block. The `<host_sandbox>` block is always present; `<container_sandbox engine="…">`
  is appended only when an engine is selected.
- **UNVERIFIED**: live Podman lifecycle (inspect field parity, cgroup v2, memory-swap enforcement)
  was not tested under the sandbox's read-only runtime restriction; tests use synthetic executables.

## 2. `.agents/.gitignore` Allowlist for MCPs

Each MCP package directory added under `.agents/mcps/` must be explicitly allowed in
`.agents/.gitignore` with a `!/mcps/<package>/` entry. Without it, source files are silently
excluded from repository tracking by the default-deny pattern (`/*` followed by `/mcps/*`).
Consult `.agents/.gitignore` directly for the canonical list of currently tracked MCP packages;
do not rely on any enumeration here. Omitting the allowlist entry when adding a new MCP means
its delivered source is never committed.
