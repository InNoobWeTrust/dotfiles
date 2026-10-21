# Invariants for Editing Prompts, Text Files & Code

Rules for editing agent prompts, system instructions, documentation, and configuration code in this repository.

## 1. Prompt & Text Editing: Context Economy & Clean Framing

- Every token in agent descriptions and instructions is repeatedly injected into context across every invocation, routing check, and tool call.
- **Zero benchmark / marketing fluff**: Never include benchmark scores, parameter counts, or architecture trivia in prompts or descriptions (e.g. ban `74.3%+ DeepSWE`, `552B asymmetric MoE`, `frontier-tier`). The model does not need to know its ELO or benchmark ranking to execute tasks.
- **Zero conversational / meta-framing leakage**: Never leak conversational metaphors or meta-discussion terms into production prompt text or headings (e.g. do not write `## Core Mindset & Soul` when the user says "give the agent soul"; use clean, professional headings like `## Core Mindset`).
- Keep agent `description` strictly functional:
  - 1-2 terse sentences defining: role, operational trigger, scope/invariant boundaries, and routing alternatives.
- **Terse, directive instructions**: State actions directly as invariants; omit rationale, historical context, and conversational explanations.
  - Good: `If rate-limited once, immediately fallback to code-fast.`
  - Bad: `If rate-limited once, rather than retrying 3 times as of now which would cause delays, immediately fallback to code-fast using GPT-5.6 Terra.`

## 2. Decouple Instructions from Model Identity

- **Never hardcode model names in prompt prose**: Do not write "powered by GPT-5.6 Terra", "powered by DeepSeek", or "using OpenCode Muse" in instruction bodies.
- **Orchestrator references agent IDs only**: In `build.md` and routing guides, dispatch to agent names (`code`, `code-fast`, `tester`, `reviewer`), never model names in parentheses (e.g. avoid `code (OpenCode Muse Spark)` or `tester (GPT-5.6 Terra)`).
- Model assignment belongs exclusively in YAML frontmatter (`model:`). Embedding model names in prompt text causes prompt-model drift whenever models are swapped and wastes context.
- **Tool `.describe()` strings and JSON schema are the model's interface at invocation time; README is
  human-facing**: at tool-call time the calling model sees the JSON schema and `.describe()` strings
  automatically. The README is for human developers and maintainers; it is not automatically present in
  model context, though a model may explicitly read it via a separate file-read call. Decision triggers,
  probability caveats, neutral-option guidance, and concurrency constraints must therefore appear in
  `.describe()`, not only in documentation. When a tool returns probability-style outputs, the description
  must state "probability estimates, not guarantees."

## 3. Code & Config Editing: Grounding & Invariants

- **Verify schema before setting keys**: Only use configuration keys (`variant`, `options`, etc.) when explicitly supported by the target provider configuration in `kilo.jsonc`.
- **No cargo-culting**: Never copy keys (e.g. `variant: high`) onto providers (e.g. CKey) that do not define or support reasoning variants.
- **Strict naming & signature invariants**: Never alter, rephrase, or invent names for test suites, functions, or interfaces when defined in specs or sibling conventions.
- **Derived artifacts ship a rebuild path**: Any checked-in generated file (e.g. `personas.csv`) keeps its generator script plus a one-line regen note in-repo. Deleting a one-off generator orphans the artifact from its source on the next edit.
- **Check consumers, not file longevity**: Before scoped deletion, check live `SKILL.md` links and other consumers, identify retained contracts outside the change, and update/remove affected in-scope references. Honor approved obsolete-file/interface removal; do not retain a file or pointer-only stub solely for legacy compatibility. Report unresolved consumer impact rather than assuming none.

## 4. Tiered Agent Complexity Pattern

- Structure tiered subagents by complexity rather than model brand:
  - `<agent>-fast`: atomic patches, shallow diffs, trivial single-unit verification, rapid turnaround.
  - `<agent>`: moderate complexity, standard multi-file tasks, deep contextual logic.
  - `<agent>-deep`: macro-architectural contracts, cross-boundary refactors, security-sensitive logic, critical invariants.

## 5. Reusable Skills: Portability & Self-Containment

- **User-confirmed correction (2026-10-15):** Reusable skills must be generic and self-contained, not tailored to the current machine or harness. “Use an existing solution” means discover and reuse an available, authorized capability—not assume MCP, a named server, provider or API.
- Native harness tools, configured integrations and other existing interfaces can provide the same capability. Discover the actual contract; never mandate the author's local adapter, tool name, schema, credential or installation path.
- Keep workflow inputs, outputs, authority boundaries and unavailable-capability behavior understandable without the author's chat or setup. Put deployment-specific instructions in integration documentation; explicitly declare any genuinely product-specific skill scope.
- Check native-capability, configured-integration and unavailable-capability scenarios before claiming portability. Keep skill indexes and composition/worker pointers equally generic.
- This authoring requirement belongs in the knowledge base, not only task memory. Source: explicit user correction to decision-support and subsequent instruction to record it in KB memory. Maintainer guidance: `.agents/docs/skills-and-rules/designing-skills.md`, “Keep Reusable Skills Portable and Self-Contained.”
