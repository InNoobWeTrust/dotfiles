# JavaScript and TypeScript Default Stack

Use for greenfield JavaScript/TypeScript services, libraries, and shared tooling. Retain a repository's existing compatible choices.

## Baseline

- Prefer TypeScript with strict compiler options. Use Node.js LTS and pnpm by default; Bun is suitable when the project intentionally standardizes on its integrated runtime/toolchain.
- Use Vite for browser applications and `tsup` or a repository-standard build tool for libraries. Use Vitest for unit/integration tests and Playwright for browser end-to-end tests.
- Use Biome where its supported rule set is sufficient; otherwise use ESLint plus Prettier. Always keep `tsc --noEmit` (or the framework equivalent) as a type-check gate.
- Use platform `fetch`, Web APIs, and Node built-ins when suitable. Use Zod for runtime schemas at external boundaries; do not use runtime validation for purely static internal values.

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
