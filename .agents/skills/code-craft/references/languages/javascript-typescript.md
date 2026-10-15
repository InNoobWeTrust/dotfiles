# JavaScript and TypeScript Default Stack

Use for greenfield JavaScript/TypeScript services, libraries, and shared tooling. Retain a repository's existing compatible choices.

## Baseline

- Prefer TypeScript with strict compiler options and Bun for package management and application/script execution. Use Node.js when required by dependencies, deployment targets, existing-project compatibility, or explicit team preference; it is not the greenfield default.
- Prefer a project-pinned Vite+ toolchain for compatible new browser applications, using its bundled Vitest, Oxlint, and Oxfmt rather than duplicating them with standalone test/lint/format tools. Keep Playwright for browser end-to-end tests. For libraries, consider Vite+ pack/tsdown after verifying emitted imports, declarations, and consumer compatibility; retain repository-standard builds in existing projects.
- Bun-first does not mean Node-free: Vite+ currently documents Node.js as its tooling runtime and Bun as a separate package-manager choice. Verify the selected release's requirements; do not assume selecting Bun switches Vite+ tooling to the Bun runtime.
- Always keep `tsc --noEmit` (or the framework equivalent) as a type-check gate unless an equivalent replacement is verified. Vite+ `check` requires both `lint.options.typeAware: true` and `lint.options.typeCheck: true` for full type checking; do not assume framework-specific checks are covered. Where Vite+ is unsuitable, use Vitest and Biome if their coverage is sufficient, otherwise ESLint plus Prettier; add overlapping tools only for demonstrated gaps.
- Use platform `fetch`, Web APIs, and runtime-compatible built-ins when suitable. Use Zod for runtime schemas at external boundaries; do not use runtime validation for purely static internal values.

## Standalone Bun Dependencies

- **Resolve first:** Inspect dependencies from the actual script directory and retain their resolved majors. Use Bun's [versioned imports](https://bun.sh/docs/runtime/auto-install#version-specifiers), such as `"zod@4"` and `"@modelcontextprotocol/sdk@1/server/mcp.js"`; include every external runtime and type-only import, but do not version Node built-ins.
- **Match APIs and evidence:** Write against those majors and verify the configured launcher without rewriting imports to another installation. Major selectors are not exact reproducibility; use the repository's manifest/lockfile when available, and do not downgrade to accommodate incorrect code without agreement.

## CLI and Terminal Tooling

- Use **Commander** for structured command-line argument parsing and subcommands; use **citty** (Unjs) or **cac** when minimal overhead is preferred.
- Use **Zod** (or **Valibot** for minimal bundle size) to validate parsed arguments, flags, and environment configurations into strongly typed DTOs.
- Use **Chalk** (or zero-dependency **picocolors**) for terminal coloring and formatting; pair with **cli-table3** and **boxen** for tables and bordered output.
- Use **`@clack/prompts`** for modern inline interactive CLI wizards (selects, multi-selects, text inputs, spinners) without taking over the full terminal window.
- Use **OpenTUI** (`@opentui/react` / `@opentui/solid`) for high-performance, full-screen TUIs only when the selected release's runtime and platform requirements are acceptable; check its [runtime requirements](https://github.com/anomalyco/opentui/tree/main/packages/core#runtime-and-platform-support), including Node ESM/FFI requirements, rather than assuming compatibility with Bun or Node LTS. Prefer **Ink** when targeting Node LTS or using its mature React-for-CLI ecosystem.
- For cross-language patterns and decision guidance, see [CLI & TUI Stacks](cli-tui-stacks.md).

## Sources

- https://www.typescriptlang.org/tsconfig/#strict
- https://nodejs.org/en/about/previous-releases
- https://bun.sh/docs
- https://viteplus.dev/guide/local-cli
- https://viteplus.dev/guide/env
- https://viteplus.dev/guide/check
- https://viteplus.dev/guide/pack
- https://vite.dev/guide/
- https://vitest.dev/
- https://playwright.dev/
- https://biomejs.dev/
- https://eslint.org/
- https://zod.dev/
- https://github.com/anomalyco/opentui
- https://github.com/natemoo-re/clack
- https://github.com/tj/commander.js
