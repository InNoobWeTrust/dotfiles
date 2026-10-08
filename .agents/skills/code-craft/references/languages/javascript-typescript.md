# JavaScript and TypeScript Default Stack

Use for greenfield JavaScript/TypeScript services, libraries, and shared tooling. Retain a repository's existing compatible choices.

## Baseline

- Prefer TypeScript with strict compiler options. Use Node.js LTS and pnpm by default; Bun is suitable when the project intentionally standardizes on its integrated runtime/toolchain.
- Use Vite for browser applications and `tsup` or a repository-standard build tool for libraries. Use Vitest for unit/integration tests and Playwright for browser end-to-end tests.
- Use Biome where its supported rule set is sufficient; otherwise use ESLint plus Prettier. Always keep `tsc --noEmit` (or the framework equivalent) as a type-check gate.
- Use platform `fetch`, Web APIs, and Node built-ins when suitable. Use Zod for runtime schemas at external boundaries; do not use runtime validation for purely static internal values.

## CLI and Terminal Tooling

- Use **Commander** for structured command-line argument parsing and subcommands; use **citty** (Unjs) or **cac** when minimal overhead is preferred.
- Use **Zod** (or **Valibot** for minimal bundle size) to validate parsed arguments, flags, and environment configurations into strongly typed DTOs.
- Use **Chalk** (or zero-dependency **picocolors**) for terminal coloring and formatting; pair with **cli-table3** and **boxen** for tables and bordered output.
- Use **`@clack/prompts`** for modern inline interactive CLI wizards (selects, multi-selects, text inputs, spinners) without taking over the full terminal window.
- Use **OpenTUI** (`@opentui/react` / `@opentui/solid`) for high-performance, full-screen TUIs only when the selected release's runtime and platform requirements are acceptable; check its [runtime requirements](https://github.com/anomalyco/opentui/tree/main/packages/core#runtime-and-platform-support), including Node ESM/FFI requirements, rather than assuming compatibility with Node LTS. Prefer **Ink** when retaining the Node LTS baseline or using its mature React-for-CLI ecosystem.
- For cross-language patterns and decision guidance, see [CLI & TUI Stacks](cli-tui-stacks.md).

## Sources

- https://www.typescriptlang.org/tsconfig/#strict
- https://nodejs.org/en/about/previous-releases
- https://pnpm.io/
- https://vite.dev/guide/
- https://vitest.dev/
- https://playwright.dev/
- https://biomejs.dev/
- https://eslint.org/
- https://zod.dev/
- https://github.com/anomalyco/opentui
- https://github.com/natemoo-re/clack
- https://github.com/tj/commander.js
