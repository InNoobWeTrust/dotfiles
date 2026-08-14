# Vanilla JavaScript and Web Components Default Stack

Use for browser-native widgets, design systems, and micro-frontend boundaries where a full UI framework is not warranted. Retain a repository's existing compatible choices.

## Default choices

- Use native Custom Elements, Shadow DOM, ES modules, `fetch`, `CustomEvent`, and Constraint Validation APIs when they meet the requirements.
- Use Lit for reactive, maintainable component development. Use Stencil when producing a broadly consumed component library that benefits from its compiler and generated bindings.
- Use Vite library mode for bundled browser packages; use TypeScript or well-checked JSDoc for type contracts.
- Use Vitest for unit tests and Playwright for browser behavior. Use Zod at API/message boundaries when runtime schema validation is required.
- Do not add a router or global store unless the component host requires one; routing and application state usually belong to the consuming application.

## Sources

- https://developer.mozilla.org/docs/Web/API/Web_components
- https://lit.dev/docs/
- https://stenciljs.com/docs/introduction
- https://developer.mozilla.org/docs/Learn_web_development/Extensions/Forms/Form_validation
- https://vite.dev/guide/build.html
