# OpenUI integration

Use alongside [generative-ui.md](generative-ui.md) when the selected runtime is
[thesysdev/openui](https://github.com/thesysdev/openui), not the similarly named
UI code-generation projects. OpenUI Lang is a streaming component-composition
language, not arbitrary generated React source. This reference guides integration;
it does not install packages or authorize hosted services.

## Establish the actual API

1. Inspect the app's framework, package manager, lockfile, installed `@openuidev/*`
   versions, chat surface, backend client and stream protocol.
2. Prefer installed package source/types, then the project's integration, then
   upstream source and docs. For new dependencies, verify published versions and
   peer compatibility before an authorized install. `main` may be ahead of npm;
   do not copy a current example into an older runtime without checking it.
3. Read the relevant upstream examples instead of assuming React, Next.js,
   LangGraph, Gateway or a new chat shell. Preserve the existing app stack.

| Capability | Package boundary |
|---|---|
| Server-safe parser, types and prompt generation | `@openuidev/lang-core` |
| React catalog and renderer | `@openuidev/react-lang`: `defineComponent`, `createLibrary`, `Renderer` |
| Built-in React components and optional chat shell | `@openuidev/react-ui`: libraries, styles, `AgentInterface` |
| Existing custom React chat state/transport | `@openuidev/react-headless`, only if needed |
| Other frontend frameworks | `@openuidev/vue-lang`, `svelte-lang`, `angular-lang`; verify compatible core versions |
| LangChain/LangGraph server integration | `@openuidev/langchain`; AG-UI transport, not an in-process agent drop-in |
| No-build embedding | `@openuidev/browser-bundle`; evaluate packaging/CSP and versioning first |

Select only the packages needed by the app. A Rust or Python backend does not
become a JavaScript service automatically: settle how a versioned library spec
and prompt reach it. Keep rendering outside domain/data-only modules.

## Existing-app path

1. **Catalog:** reuse existing design-system components or start with a compatible
   built-in library. Define schemas and register the allowed components; keep
   calculations and permissions in application services, not model-generated props.
2. **Server prompt:** export a server-safe library spec. Upstream documents the
   CLI `generate <library-file> --spec --out <spec-file>`; use the project's runner
   only when execution/dependency access is authorized. Regenerate the spec when
   the catalog changes, ideally through the existing build. Do not import
   browser-only components into server prompt-generation code.
3. **Inference:** generate one OpenUI system prompt from that spec using
   `generateSystemPrompt` from `@openuidev/lang-core`, with the matching prompt
   options. Keep trusted application instructions separate from untrusted tool
   content. Do not leave conflicting instructions that demand Markdown-only output.
4. **Transport:** preserve existing streaming infrastructure and replace only
   the intended assistant-content renderer. Match adapters to the actual protocol;
   OpenAI-compatible SSE, AI SDK streams and AG-UI are not interchangeable.
5. **Renderer:** use the same catalog as the prompt, required library styles,
   current renderer props and `isStreaming` until stream closure. Wire `onAction`
   explicitly when interaction is intended; it does not implement server authorization.
6. **History:** retain original structured assistant output for replay rather
   than DOM text or summaries. Inspect the installed version's storage envelope
   and marker handling before returning history to the model. Keep cancelled or
   failed turns distinct from successfully completed turns.

### Direct-provider prompt example

This is the documented prompt-generation shape, not a complete app or a promise
that every installed version supports the same signature:

```ts
import { generateSystemPrompt } from "@openuidev/lang-core";

// librarySpec is the server-safe spec exported from the rendering catalog.
// promptOptions comes from that catalog's compatible prompt configuration.
const systemPrompt = generateSystemPrompt({
  library: librarySpec,
  promptOptions,
});
```

Confirm the actual exported types and runtime behavior before implementation.
For a direct provider, current upstream guidance puts trusted app instructions in
`promptOptions.preamble`. Do not hand-maintain a second catalog description.

## Provider and service boundaries

The open-source renderer can use a direct model provider. OpenUI Gateway is an
optional hosted inference/correction path, not a prerequisite for this branch.
The vendor's coding skill recommends Gateway by default; that recommendation is
not authorization to migrate an existing provider or disclose application data.

- **Direct provider:** current guidance uses the full generated prompt; there is
  no automatic Gateway correction. Implement the agreed validation/fallback path.
- **Gateway:** current guidance uses `generateSystemPrompt({ cloud: true, ... })`
  and a server-side Thesys key. The config-block prompt is not interchangeable
  with the direct-provider prompt. Confirm supported prompt options/features;
  upstream warns live data bindings need the full prompt.
- **Autofix and cloud observability:** separate service choices with additional
  external data flows. Explain privacy, cost and credential requirements before
  enabling them. Do not enable feedback, deployment or telemetry automatically.

Never read or request secret values. User-managed credentials stay server-side.
Do not assume server-side authorization from component validation or streamed
correction, and do not describe hosted correction as a guarantee of valid UI.
Query/mutation components can invoke browser-side tools: omit them unless the
application has an explicit authorized `toolProvider` contract. Restrict URL
actions as well as custom events.

## Debug and acceptance

Check installed-version examples and diagnostics for unknown components, schema
errors, missing roots, parse failures, render failures and missing action handlers.
Do not treat a dropped component or a last-good frame as a complete successful
response. First check catalog/spec drift, prompt mode and transport framing;
do not invent parser repairs or switch providers as a debugging shortcut.

Apply the parent branch's fixtures and live checks. Include a known-valid
program, unknown component, malformed/truncated stream, cancelled turn, replay
and invalid action. If package/runtime/browser access is absent, return the
integration plan and explicitly UNVERIFIED checks; never claim a working app.

## Source lineage and maintenance

Inspected 2026-10-18; upstream `main` is mutable and exact published versions were
not validated during authoring. Re-check version-specific signatures at use time.
This is locally curated guidance, not a vendored or automatically synchronized
copy of the upstream skill; no remote-sync manifest entry is needed.

- [Framework README and package map](https://github.com/thesysdev/openui)
- [Official coding skill](https://github.com/thesysdev/skills/tree/main/skills/openui)
- [Existing-app integration](https://github.com/thesysdev/skills/blob/main/skills/openui/references/existing-app.md)
- [Component libraries](https://github.com/thesysdev/skills/blob/main/skills/openui/references/component-library.md)
- [Direct provider](https://github.com/thesysdev/skills/blob/main/skills/openui/references/direct-provider.md)
- [Reliability](https://github.com/thesysdev/skills/blob/main/skills/openui/references/reliability.md)
- [Documentation index](https://www.openui.com/llms.txt)

Prototype and review schedule follow [generative-ui.md](generative-ui.md).
