# React Default Stack

Use for greenfield React applications. Retain a repository's existing compatible choices.

## Default choices

- Select Next.js when server rendering, React Server Components, or a full-stack React application is required. Use its App Router, server data access, and framework-native routing before adding replacements.
- Select Vite plus React Router for a client-rendered SPA. Do not introduce a second router into Next.js.
- Use component-local state and context first. Use Zustand only for shared client state that does not fit those primitives.
- Use TanStack Query for client-side server-state caching/invalidation. In Server Component applications, prefer server data loading instead of duplicating it with a client cache.
- Use React Hook Form with Zod for complex forms and boundary validation. Use native controls for small forms.
- Use React Testing Library with Vitest and Playwright for end-to-end flows.

## Sources

- https://nextjs.org/docs
- https://vite.dev/guide/
- https://reactrouter.com/
- https://tanstack.com/query/latest
- https://react-hook-form.com/
- https://testing-library.com/docs/react-testing-library/intro/
- https://playwright.dev/
