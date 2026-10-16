---
audience: MCP users and maintainers
purpose: Run and extend repository MCPs without per-project dependency installation
scope: Repository-local Bun MCP launchers and dependency conventions
---
# MCP usage and implementation pattern

These MCPs run directly from source with **Bun-resolved, versioned imports**. They are not separately installed Node projects: users must not need `bun install`, `npm install`, or a local `node_modules` directory to launch them.

## Run

Configure the harness to invoke the server's executable, such as `mcp-lsp` or `mcp-remote-memory`. The shell setup in [`.sh.d/path.sh`](../../.sh.d/path.sh) adds deployed `~/.agents/mcps/*/bin` directories to `PATH`; a new directory needs a fresh shell environment before launching the harness.

Each launcher uses this pattern:

```ts
#!/usr/bin/env -S bun --no-env-file
await import('../src/server.ts');
```

Bun must be installed and reachable through `PATH`. Check each server's README for other required executables or configuration; Bun resolving JavaScript libraries does not install language servers, container engines or external CLI tools.

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

## Server guides

[LSP](lsp/README.md) · [Remote memory](remote-memory/README.md) · [Decisions](decisions/README.md) · [Delegation](delegate/README.md) · [Sandbox](sandbox/README.md)
