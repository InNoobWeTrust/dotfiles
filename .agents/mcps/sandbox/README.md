---
audience: AI-agent users and MCP operators
purpose: Start and use the unified sandbox server (host tools + container tools)
scope: Local host sandbox and Podman- or Docker-backed containers; not a devcontainer runner or multi-tenant service
---
# Sandbox MCP

One server exposes both host process sandboxes and isolated Linux containers.

| Prerequisite | Notes |
|---|---|
| Bun | Resolves major-versioned MCP SDK@1 and Zod@4 imports automatically; no committed `node_modules` |
| Usable Podman or Docker engine (containers only) | Probed once at startup: Podman first, then Docker; without a usable engine the server is host-only |
| Linux or macOS (host tools) | Bubblewrap on Linux, sandbox-exec on macOS |

## Start

`mcp-sandbox` is configured separately in `.claude/mcp.json`, `.codex/config.toml`, `.gemini/config/mcp_config.json`, `.config/kilo/kilo.jsonc` and `.config/opencode/opencode.jsonc`. Start the client from a shell that has loaded `~/.shrc` so its inherited `PATH` includes the package-local [launcher](bin/mcp-sandbox) and Bun. The Claude shell alias passes its config using `--mcp-config`.

To start directly from this package directory:

```sh
bun --no-env-file src/server.ts
```

## Choose: host tools or container

**Host tools** (`sandbox_ro`, `sandbox_pure`, `sandbox_rw`) execute commands in a sandboxed shell with your
existing host files readable. Use for inspections, workspace builds, and bounded file writes.

**Container tools** give a clean isolated Linux environment without forwarding host environment or mounting
host files or the container engine socket by default. Host files are exposed only through an explicit
`workspace` bind. Use for test execution, deliverable builds, or a different local Linux distro image; one
session owns each handle.

## Container engine selection (startup snapshot)

Container tools are registered only when a usable engine is detected while the server starts, probed in the
built-in priority order **Podman, then Docker**. The probe is a bounded `engine info` connectivity check: it
does not certify image availability or resource enforcement, and acquisition stays fail-closed with strict
inspect verification before any workload starts.

- Podman usable → container tools plus a `<container_sandbox engine="podman">` instruction block.
- Podman unusable, Docker usable → the same with `engine="docker"`.
- Neither usable → host tools: no container tools and no container instruction block;
  the host sandbox keeps working unchanged.

Selection is a startup snapshot with **no hot fallback** to the other engine later, including during
container cleanup. Restart the server (reconnect the MCP client) after installing or repairing an engine.
Agent-facing instructions are scoped blocks: the `<host_sandbox>` block is always present, and capability
blocks such as `<container_sandbox>` are appended only when the matching tools are registered.

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

Failed acquisition issues no handle; unconfirmed cleanup stays tracked for automatic retry and shutdown
cleanup, without another tool call or option.

## Failure traces and persistence

Container failures return `tracePath` pointing to the exact private JSON trace at
`$XDG_CACHE_HOME/sandbox/run-*/stderr` (default root `~/.cache/sandbox`). The trace preserves original
exception stacks, nested causes, cleanup failures, and available engine-command stream references. Read
the referenced `stdoutPath` and `stderrPath` files for complete command output; inline responses stay
concise and do not expose raw engine diagnostics. Startup and background failures log trace references on
server stderr.

Cache directories are private (`0700`) and files are `0600`; traces may contain sensitive local error
details. A failed trace write reports `tracePath: null` and `traceError` rather than claiming a saved
artifact. Artifacts remain until removed.

## Tool reference

| Tool | Key input | Result fields (container results nest under `data`) |
|---|---|---|
| `sandbox_ro` | `command`; opt `workdir`, `limits` | Exit code, streams, limits applied, restriction hints |
| `sandbox_pure` | same | Same; offline (no network) |
| `sandbox_rw` | same | Same; resolved workdir is writable |
| `container_acquire` | opt `workspace`, `access`, `network`, `image`, `idleSeconds`, `budgets` | `container` handle, `containerId`, `imageId`, `expiresAt`, budgets |
| `container_exec` | `container`, `command`; opt `wallTimeMs` | Exit code, `stdoutPath`/`stderrPath`/`stdoutBytes`/`stderrBytes`, bounded stream previews, `termination`, `truncated`, `containerDestroyed` |
| `container_release` | `container` | `{ released: boolean }` |

Every container response: `{ "ok": true/false, "data": ... }` or `{ "ok": false, "error": ..., "tracePath": ... }`.
Structured content and the JSON text fallback match. Check both `ok` and `termination`.

**No output-size option, no output-size termination.** There is no output limit to choose and no volume
that can kill a command. Complete `stdout` and `stderr` are always written to private cache files
(`stdoutPath`/`stderrPath`) under the sandbox XDG cache, and the `stdout`/`stderr` fields are bounded
previews that point at them. `stdoutBytes`/`stderrBytes` report the retained file sizes, and `truncated`
marks previews that omitted bytes or are not losslessly representable. The paths are absolute and always
private; they are null only when capture setup failed before the command ran. A genuine capture failure or
a timeout reports a runtime error and destroys only that container.

`container_acquire` options: `workspace` (optional absolute host path), `access` (`ro` default / `rw`
explicit), `network` (`none` default / `bridge` explicit), `image` (Linux image; default
`mcr.microsoft.com/devcontainers/base:ubuntu`; missing images are pulled automatically from the registry
using normal engine credentials before container creation — no extra login or secret handling is added;
image fetch uses the host network, separate from the container workload network which remains none by
default), `idleSeconds` (default 900, max 86400), `budgets` (`cpus`, `memoryBytes`, `pids`,
`tmpfsBytes`; see [defaults](docs/design.md#effective-defaults)).

Container commands run as the MCP process's non-root UID/GID (root falls back to 1000). `HOME` and `TMPDIR`
are `/tmp`; scratch and a clean `/workspace` are separate bounded tmpfs mounts. An explicit host workspace
bind is not a tmpfs or storage quota. Host-tool responses carry the same `stdoutPath`/`stderrPath`/
`stdoutBytes`/`stderrBytes` fields plus their top-level host fields, without `ok`/`data` wrapping.

**Private output cache.** Raw stream files live under the sandbox namespace of the configured XDG cache
(`$XDG_CACHE_HOME/sandbox`, falling back to `$HOME/.cache/sandbox`). Directories are `0700` and files `0600`;
creation happens before the command starts, and files are flushed and closed before a response advertises
their paths. Internal engine-CLI calls keep a wider preview allowance so their responses still parse, while
workload output uses the fixed combined preview. Budgets cover CPU, memory, PIDs, scratch, wall time and file
size only — never output volume.

**No unsandboxed fallback.** On restriction or backend failure, report the failure and investigate.
Obtain explicit approval before raising budgets, enabling bridge networking, or requesting `access: "rw"`.

See [design and limits](docs/design.md) and [verification / acceptance](docs/acceptance.md).

## Development checks

From this package directory:

```sh
bun run check        # lint, formatting and import organization; warnings fail
bun run check:fix    # apply safe fixes and format
bun run format      # format only
bun run test         # ownership/cleanup, engine pinning, startup capability and output-integrity regressions
CONTAINER_SANDBOX_E2E=1 bun run tests/e2e.ts
```

Biome 2.5.15 resolves through `bunx`; no local installation or committed `node_modules` is required.
`lint` and `format:check` are available separately. Source, tests and package JSON share the same settings;
the E2E harness drives Docker specifically and requires its local engine and image as described above.
