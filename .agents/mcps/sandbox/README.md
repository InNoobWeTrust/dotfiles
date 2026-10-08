---
audience: AI-agent users and MCP operators
purpose: Start and use the unified sandbox server (host tools + container tools)
scope: Local host sandbox and Docker-backed containers; not a devcontainer runner or multi-tenant service
---
# Sandbox MCP

One server exposes both host process sandboxes and isolated Linux containers.

| Prerequisite | Notes |
|---|---|
| Bun | Resolves major-versioned MCP SDK@1 and Zod@4 imports automatically; no committed `node_modules` |
| Trusted Docker daemon (containers only) | Local images only; no automatic pulls, builds, or hooks |
| Already-local Linux image | Default: `mcr.microsoft.com/devcontainers/base:ubuntu`; otherwise supply an available compatible `image` |
| Linux or macOS (host tools) | Bubblewrap on Linux, sandbox-exec on macOS |

## Start

`mcp-sandbox` is already configured in `.agents/mcp.json`. No second server or global enablement is needed.

To start directly from this package directory:

```sh
bun --no-env-file src/server.ts
```

## Choose: host tools or container

**Host tools** (`sandbox_ro`, `sandbox_pure`, `sandbox_rw`) execute commands in a sandboxed shell with your
existing host files readable. Use for inspections, workspace builds, and bounded file writes.

**Container tools** give a clean isolated Linux environment without forwarding host environment or mounting
host files or the Docker socket by default. Host files are exposed only through an explicit `workspace`
bind. Use for test execution, deliverable builds, or a different local Linux distro image; one session owns each handle.

## Container first-use (3 calls)

```jsonc
// 1. acquire — default: clean writable /workspace scratch, no network, no host mounts
{ "tool": "container_acquire", "input": {} }
// → { "ok": true, "data": { "container": "<token>", "containerId": "...", "expiresAt": "..." } }

// 2. exec (automatically refreshes inactivity expiry after completion)
{ "tool": "container_exec", "input": { "container": "<token>", "command": "id -u; pwd" } }

// 3. release (safe and idempotent)
{ "tool": "container_release", "input": { "container": "<token>" } }
```

Container expired or destroyed? Acquire a new one. There is no renew, status, or share workflow.

## Tool reference

| Tool | Key input | Result fields (container results nest under `data`) |
|---|---|---|
| `sandbox_ro` | `command`; opt `workdir`, `limits` | Exit code, streams, limits applied, restriction hints |
| `sandbox_pure` | same | Same; offline (no network) |
| `sandbox_rw` | same | Same; resolved workdir is writable |
| `container_acquire` | opt `workspace`, `access`, `network`, `image`, `idleSeconds`, `budgets` | `container` handle, `containerId`, `imageId`, `expiresAt`, budgets |
| `container_exec` | `container`, `command`; opt `wallTimeMs`, `maxOutputBytes` | Exit code, streams, `termination`, `truncated`, `containerDestroyed` |
| `container_release` | `container` | `{ released: boolean }` |

Every container response: `{ "ok": true/false, "data": ... }` or `{ "ok": false, "error": ... }`.
Structured content and the JSON text fallback match. Check both `ok` and `termination`: output overflow
can race a successful process exit.

`container_acquire` options: `workspace` (optional absolute host path), `access` (`ro` default / `rw`
explicit), `network` (`none` default / `bridge` explicit), `image` (already-local Linux distro only; no
automatic pulls), `idleSeconds` (default 900, max 86400), `budgets` (`cpus`, `memoryBytes`, `pids`,
`tmpfsBytes`; see [defaults](docs/design.md#effective-defaults)).

Container commands run as the MCP process's non-root UID/GID (root falls back to 1000). `HOME` and `TMPDIR`
are `/tmp`; scratch and a clean `/workspace` are separate bounded tmpfs mounts. An explicit host workspace
bind is not a tmpfs or storage quota. Host-tool responses retain their top-level fields, without `ok`/`data` wrapping.

**No unsandboxed fallback.** On restriction or backend failure, report the failure and investigate.
Obtain explicit approval before raising budgets, enabling bridge networking, or requesting `access: "rw"`.

See [design and limits](docs/design.md) and [verification / acceptance](docs/acceptance.md).

## Development checks

From this package directory:

```sh
bun run check        # lint, formatting and import organization; warnings fail
bun run check:fix    # apply safe fixes and format
bun run format      # format only
bun test tests/manager.test.ts
CONTAINER_SANDBOX_E2E=1 bun run tests/e2e.ts
```

Biome 2.5.15 resolves through `bunx`; no local installation or committed `node_modules` is required.
`lint` and `format:check` are available separately. Source, tests and package JSON share the same settings;
Docker E2E checks require the local image and daemon described above.
