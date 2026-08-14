# Vue Default Stack

Use for greenfield Vue applications. Retain a repository's existing compatible choices.

## Default choices

- Use `create-vue` with Vite and TypeScript. Select Nuxt when SSR, server routes, or its full-stack conventions are required.
- Use Vue Router for routing and Pinia for shared client state; prefer component state/composables when sufficient.
- Use Vue's compiler-aware type checking (`vue-tsc`) in addition to TypeScript tooling.
- Use TanStack Query Vue for non-trivial server-state caching/invalidation. Use VeeValidate plus Zod for complex forms; retain native form validation for simple cases.
- Use Vue Test Utils with Vitest and Playwright for browser end-to-end flows.

## Sources

- https://vuejs.org/guide/scaling-up/tooling.html
- https://router.vuejs.org/
- https://pinia.vuejs.org/
- https://nuxt.com/docs
- https://tanstack.com/query/latest/docs/framework/vue/overview
- https://test-utils.vuejs.org/
- https://vee-validate.logaretm.com/
