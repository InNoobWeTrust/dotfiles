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

## 2. Check actual tracking rules

Consult `.agents/.gitignore` and any applicable nested rules before adding an MCP. The current
root allowlist includes `!/mcps/`; it does not require a separate exception for every server.
Verify intended source files are not ignored, without staging or committing them. Ignore rules
do not protect already tracked files or historical copies.

## 3. Bun-resolved libraries, no per-MCP installation

- **User correction (2026-10-17):** “We don't want to require installing sub-project to be able to use the mcp, bun can resolve dependencies”.
- **Runtime pattern:** MCP launchers execute Bun source directly. Use versioned imports such as
  `minisearch@7.2.0` and `csv-parse@7.0.3/sync`, as already done for SDK/Zod imports. No per-server
  `bun install`/`npm install`, local `node_modules`, or install-generated lockfile is required.
- **Reuse:** Prefer an established TypeScript/JavaScript library over handwritten ranking or a
  Python bridge for a capability available in the same runtime. BM25 scoring belongs to the library.
- **Cache honesty:** A first run may fetch dependencies into Bun's cache; offline use needs cached
  versions. A cache miss does not justify changing the deployment pattern. Do not claim verification
  passed when imports were unresolved.
- **Delegation guard:** Include the no-subproject-install constraint in implementation handoffs.
  Explain any proposed exception before executing it; verify actual stdio startup without a local
  dependency tree. Preserve user staging and unrelated work when removing agent-created artifacts.
- **Canonical guide:** [MCP usage and implementation pattern](../../mcps/README.md).
