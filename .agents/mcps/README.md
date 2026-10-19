---
audience: MCP users and maintainers
purpose: Run and extend repository MCPs without per-project dependency installation
scope: Repository-local Bun MCP launchers and dependency conventions
---
# MCP usage and implementation pattern

These MCPs run directly from source with **Bun-resolved, versioned imports**. They are not separately installed Node projects: users must not need `bun install`, `npm install`, or a local `node_modules` directory to launch them.

## Run

Configure the harness to invoke the server's executable, such as `mcp-lsp` or `mcp-ui-studio`. The shell setup in [`.sh.d/path.sh`](../../.sh.d/path.sh) adds deployed `~/.agents/mcps/*/bin` directories to `PATH`; a new directory needs a fresh shell environment before launching the harness.

Each launcher is a small POSIX shim that selects the server's private Bun package cache, then executes `bin/launch.ts` through Bun:

```sh
#!/bin/sh
set -eu
bin=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
: "${XDG_CACHE_HOME:=$HOME/.cache}"
: "${BUN_INSTALL_CACHE_DIR:=$XDG_CACHE_HOME/agent-mcps/install/<name>}"
exec env "BUN_INSTALL_CACHE_DIR=$BUN_INSTALL_CACHE_DIR" bun --no-env-file "$bin/launch.ts" "$@"
```

```ts
// bin/launch.ts
import { withWarmCache } from "../../shared/startup.ts"
await withWarmCache("<name>", () => import("../src/server.ts"), { sourceDir: join(import.meta.dir, "..") })
```

Bun must be installed and reachable through `PATH`. Check each server's README for other required executables or configuration; Bun resolving JavaScript libraries does not install language servers, container engines or external CLI tools.

## Startup coordination

**Private package caches.** Each launcher sets `BUN_INSTALL_CACHE_DIR` to `$XDG_CACHE_HOME/agent-mcps/install/<name>` (`~/.cache/...` when `XDG_CACHE_HOME` is unset) before Bun starts, because Bun selects its auto-install cache at process start. Servers therefore never populate the same cache concurrently — the setup under which Bun 1.4.2 failed to resolve packages (`Unexpected while resolving package 'ajv-formats'` and similar, followed by connect timeouts). An explicit `BUN_INSTALL_CACHE_DIR` already present in the environment is respected and wins.

**Warm-start fast path.** `withWarmCache(name, load, { sourceDir })` in [shared/startup.ts](shared/startup.ts) records a warm marker under `.../agent-mcps/warm/<name>` after a successful locked load: the Bun version plus a fingerprint (path, mtime, size) of the server's TypeScript sources. While the marker is current, later starts import lockless, so parallel MCP starts never queue behind each other. Cold starts, source edits and cleared caches fall back to a per-MCP lock; a failed warm load drops the marker and retries under the lock.

**Locks.** The guard uses Bun's built-in `bun:ffi` and the system `flock` API on **macOS or glibc Linux**, without another package. Each MCP locks its own `startup-<name>.lock` in the shared `agent-mcps` directory, so distinct servers never serialize; all coordinated launchers must share the same `XDG_CACHE_HOME` (or home directory when unset) on a writable local filesystem. Lock files are persistent by design: the OS releases them on exit, including forced termination, and **deleting one while an MCP starts can split ownership**, so leave them alone. Acquisition waits up to 60 seconds; set `MCP_STARTUP_TIMEOUT_MS` to a larger positive millisecond value for slow downloads. Cold starts still require network access; no per-project installation is needed.

Servers that import more modules after startup (LSP's JSON-RPC client, UI Studio's asset build) guard those loads with the same per-MCP lock. Use the executable or `bun run start`; invoking `src/server.ts` directly bypasses the caches and guards.

## Dependencies: import, do not install

Use Bun's versioned imports in the source, including any required package subpath:

```ts
import { McpServer } from '@modelcontextprotocol/sdk@1/server/mcp.js';
import { z } from 'zod@4';
import MiniSearch from 'minisearch@7.2.0';
import { parse } from 'csv-parse@7.0.3/sync';
```

- **Resolve at runtime:** Bun fetches missing packages into its cache. A cold cache needs network access; offline operation requires cached versions.
- **Keep the checkout clean:** Do not add per-server dependency-install steps, local `node_modules`, or install-generated lockfiles. A scripts-only `package.json` may provide convenient development commands without making installation a prerequisite.
- **Reuse libraries:** Use established TypeScript/JavaScript libraries for capabilities such as BM25 ranking and CSV parsing. Do not handwrite their algorithms or add a second runtime merely to access a library available in this runtime.
- **Preserve the launch pattern:** Do not add `--no-install` blindly; it has prevented versioned-import resolution with the Bun version used here.
- **Coordinate exceptions:** Explain a genuine incompatibility before changing this pattern; do not silently turn one MCP into a separately installed subproject. Pass these constraints explicitly to delegated implementers.

## Verification

Run the server's documented checks directly, for example:

```sh
bun --no-env-file tests/e2e.ts
```

Verify startup without a local dependency tree and exercise the actual MCP stdio interface. Report cold-cache/network failures separately from functional failures; an unresolved import is not a successful test, and an offline cache miss is not a reason to introduce a local install step.

From this directory, run the shared lock checks and discovered-launcher regression:

```sh
bun test shared/tests/startup-lock.test.ts
bun --no-env-file shared/tests/startup.ts
```

The executable regression requires network access and isolates itself: child MCPs receive private package caches and warm markers under a scratch `XDG_CACHE_HOME`, never touching the user's cache. It discovers sibling directories containing `bin/mcp-<directory-name>`, starts them concurrently, and asserts each server populated its private install cache and left a warm marker. When LSP is available, a second instance exercises concurrent lazy JSON-RPC loading. No discovered launchers is an error; the regression does not call paid models or real delegated workers.

## Server guides

[LSP](lsp/README.md) · [Remote memory](remote-memory/README.md) · [Decisions](decisions/README.md) · [Delegation](delegate/README.md) · [Sandbox](sandbox/README.md) · [UI Studio](ui-studio/README.md)
