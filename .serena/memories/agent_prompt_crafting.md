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
- **Orchestrator references agent IDs only**: In `autonomous.md` and routing guides, dispatch to agent names (`code`, `code-fast`, `tester`, `reviewer`), never model names in parentheses (e.g. avoid `code (OpenCode Muse Spark)` or `tester (GPT-5.6 Terra)`).
- Model assignment belongs exclusively in YAML frontmatter (`model:`). Embedding model names in prompt text causes prompt-model drift whenever models are swapped and wastes context.

## 3. Code & Config Editing: Grounding & Invariants

- **Verify schema before setting keys**: Only use configuration keys (`variant`, `options`, etc.) when explicitly supported by the target provider configuration in `kilo.jsonc`.
- **No cargo-culting**: Never copy keys (e.g. `variant: high`) onto providers (e.g. CKey) that do not define or support reasoning variants.
- **Strict naming & signature invariants**: Never alter, rephrase, or invent names for test suites, functions, or interfaces when defined in specs or sibling conventions.

## 4. Tiered Agent Complexity Pattern

- Structure tiered subagents by complexity rather than model brand:
  - `<agent>-fast`: atomic patches, shallow diffs, trivial single-unit verification, rapid turnaround.
  - `<agent>`: moderate complexity, standard multi-file tasks, deep contextual logic.
  - `<agent>-deep`: macro-architectural contracts, cross-boundary refactors, security-sensitive logic, critical invariants.
