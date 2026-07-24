# Write standards (code-craft Phase 3)

Load only during Phase 3. Hard limits: `rules/code-quality.md`, `rules/tdd.md`.

### Phase 3 — Write with High-Quality Standards

Write the implementation following `rules/code-quality.md` and these advanced crafting guidelines:

#### A. Defensive Boundaries (Robust Exception Handling)
- **Zero Silent Failures:** Never catch exceptions without recording diagnostic information or recovering.
- **Fail Explicitly:** Every network call, file IO, or database query must configure explicit timeouts and an explicit failure contract. Use mapped errors, retries, or contract-approved defaults only when the caller-visible semantics are already defined. Do not invent `[]`, `null`, `false`, or no-op fallbacks just to keep execution moving.
- **Escalate Semantic Ambiguity:** If an edge case can plausibly mean more than one thing, stop and ask the user or surface a domain error. Defensive programming makes uncertainty visible; it does not hide it behind defaults.
- **Preserve Diagnostics:** Propagate source context (error code, field name, upstream status, correlation data) so a reviewer can see why the failure path happened.
- **Sanitize Boundaries:** Validate external API payloads immediately upon receiving them before passing them to internal functions.

#### B. Immutability & State Hygiene
- **Immutability by Default:** Prefer pure functions that receive parameters and return new copies of data instead of mutating inputs or deep state objects.
- **Centralized Mutation:** If state mutation is required, isolate it to a single dedicated manager class or event loop to avoid race conditions.

#### C. Runtime Invariant Assertions
- **Design by Contract:** Place lightweight assertions at the beginning and end of complex algorithmic boundaries to check preconditions (e.g. valid arguments) and invariants.
- **Example (Python):** `assert item_count >= 0, "Item count cannot be negative"`
- **Example (TypeScript):** `if (itemCount < 0) throw new Error("Invariant violated")`

#### D. Strict Type Soundness
- **No Loose Types:** Do not use `any`, `unknown`, `object`, or unstructured dictionaries for core logic.
- **Discriminated Unions / ADTs:** Represent states and outcomes using strong types, union types, and enums rather than raw string matching or magic numbers.

#### E. Test-Driven Development (TDD Cycle)
- **Write Test Cases First:** In accordance with `rules/tdd.md`, implement your test cases and interface stubs *before* writing the logic bodies.
- **RED**: Execute the test command and confirm that the test fails as expected.
- **GREEN**: Write the minimal code to satisfy the test cases. Confirm all tests pass.
- **Refactor**: Refactor to meet all code quality criteria, maintaining passing test states.
- **Deliverable requirement**: You must post the execution of your test command and its passing results in your turn summary.

#### F. Quality Tooling Pass

> **Cross-reference `rules/execution-safety.md`:** Write custom scripts to a temp dir and run with `uv`/`bun`. Use `npx`/`bunx`/`uvx` only for published CLI tools. Never `pip install` or `npm install -g`.

- **Prefer Repo-Native Commands:** Discover and use the repo's existing verification entrypoints first: project scripts, `Makefile`/`justfile`, `tox`/`nox`, `pre-commit`, CI jobs, or documented contributor workflows. These encode the team's actual policy and should win over ad hoc commands.
- **Run the Relevant Set:** For the files and language you touched, run the formatter, linter, type checker, complexity/maintainability checks, duplication checks when warranted, and dependency audit and/or security scan that materially validate the change. Do not run tools just to create noise.
- **Use Mainstream Ecosystem Runners When Setup Is Missing:** If the repo lacks a local install or wrapper, prefer widely used, officially documented ephemeral runners for that ecosystem:
  - **Published CLI tools:** `npx <tool>`, `bunx <tool>`, `pnpm dlx <tool>`, `yarn dlx <tool>`, `uvx <tool>` — these run packages from registries, they do **not** resolve dependencies for custom scripts
  - **Custom scripts with dependencies (Python):** Write to temp dir → `uv run --with <package> python /tmp/script.py` (or `uv run --with <package> python -c '...'` inline only when file write is unavailable)
  - **Custom scripts with dependencies (JS/TS):** Write to temp dir → `bun run /tmp/script.ts` (or `bun -e '...'` inline only when file write is unavailable)
  - **PROHIBITED:** `pip install`, `pip install --user`, `npm install -g`, `yarn global add` — never install dependencies system-wide
- **Treat `pkgx` and `x-cmd` as Optional Fallbacks:** They can be useful local runners, but they are not the default industry recommendation unless the repo, environment, or user already prefers them.
- **Use Exact Doc-Backed Invocation Patterns:** If the package name and binary name differ, use the runner's explicit package-selection flag instead of assuming name inference. Examples: `npm exec --package=typescript -- tsc --noEmit`, `bunx -p typescript tsc --noEmit`, `pnpm dlx --package typescript tsc --noEmit`, `yarn dlx -p typescript tsc --noEmit`.
- **Trigger Complexity Checks on Branch-Heavy Logic:** If you touched parsers, validators, reducers, state machines, policy engines, switch/match-heavy code, nested loops/conditionals, or long data-mapping functions, run an explicit complexity/smell check or document why no suitable check applies.
- **Choose Tools by Ecosystem and Signal:** Common defaults when relevant:
  - JavaScript / TypeScript: ESLint, Prettier, `tsc --noEmit`, `npm audit`
  - JavaScript / TypeScript complexity/smells: ESLint core rules such as `complexity`, `max-depth`, `max-lines-per-function`, `max-params`, `max-statements`; if the repo already uses SonarJS / SonarLint, include cognitive-complexity and duplicate-branch/function rules there as well
  - Python: Ruff (`ruff check`, `ruff format --check`), the repo's configured type checker, `pip-audit`
  - Python complexity/smells: Ruff or Flake8 McCabe `C901` when configured; otherwise `radon cc` for cyclomatic complexity, `radon mi` for maintainability index, and `xenon` when the repo wants fail-on-threshold enforcement
  - Go complexity/smells: the repo's `golangci-lint` complexity/design rules when configured; otherwise `gocyclo -over 15 ./...`
  - JVM complexity/smells: the repo's Checkstyle or PMD cyclomatic/design rules when configured
  - Shell: ShellCheck, `shfmt`
  - Cross-language duplication: `jscpd` or PMD CPD when copy/paste drift is a realistic risk for the touched area
  - Cross-language security / pattern scanning: Semgrep when configured or clearly useful for the touched surface
- **Prefer Existing Rule Sets Over One-Off Installs:** If the repo already carries ESLint, Ruff, golangci-lint, Checkstyle, PMD, Sonar, or pre-commit wiring, extend and run that. Only reach for standalone fallbacks when the existing toolchain has no maintainability signal for the touched language.
- **Use Temporary Default Thresholds Only When the Repo Has None:** Prefer the repository's configured limits. If you must choose a one-off baseline, start around cyclomatic complexity <= 10-15 per function, nesting <= 3-4, maintainability >= B, and duplication < 5%, then tighten only with evidence.
- **Keep Tool Semantics Straight:** Dependency audits, static analysis, formatting, type checking, complexity metrics, and duplication scans answer different questions. Do not claim one category substitutes for another. Example: `npm audit` checks dependency vulnerabilities, Semgrep scans source patterns, `ruff format` formats code, `ruff check` handles lint rules and import sorting, and `radon cc` or ESLint complexity rules expose branchy code that may still be type-safe.
- **Example Official CLI Patterns:** `npx eslint .`, `npx prettier . --check`, `uvx ruff check .`, `uvx ruff format --check .`, `uvx radon cc src -s -a`, `uvx radon mi src -s`, `uvx xenon --max-absolute B --max-modules A --max-average A src`, `npx jscpd src --min-lines 5 --min-tokens 50 --threshold 5`, `uvx pip-audit -r requirements.txt`, `semgrep scan --config p/default .`.
- **Fix or Account for Findings:** Do not ignore tool output. Resolve issues introduced by your change. If a tool surfaces unrelated pre-existing problems outside the agreed scope, leave them untouched but document them as accepted debt when they materially affect your edited path.
- **Do Not Install Permanent Tooling for a One-Off Check:** Avoid adding devDependencies or project config solely to validate a single task unless the user explicitly asked to establish that tooling permanently.
- **Deliverable requirement:** Post the repo-native commands you ran, or the exact fallback commands you recommend, and summarize the results. If you only suggested commands because the repo lacked setup, say so explicitly.

#### G. Docstring & API Documentation Standards
All new or modified public modules, classes, functions, and interfaces MUST include detailed docstrings conforming to ecosystem standards:
- **TypeScript / JavaScript**: Use JSDoc (`/** ... */`) specifying parameters (`@param`), return values (`@returns`), and thrown errors (`@throws`).
- **Python**: Use PEP 257 docstrings (triple quotes) detailing arguments (`Args:`), return types (`Returns:`), and exceptions raised (`Raises:`).
- **Go**: Standard Go doc comments directly preceding the declaration.
- **Content**: The docstring must state *what* the unit does, its invariants, its input preconditions, output postconditions, and all potential side effects or errors.

#### H. Abstraction & Boundary Rules (Avoiding Shallow Helpers)
- **The Abstraction Ratio**: Only extract a function if `Interface Complexity < Implementation Complexity`. Do not extract 1-to-3-line helpers that simply wrap standard operations or lookups.
- **Inline Registry/Mapping Calculations**: Keep lookups, mapping matrices, and registry computations inline using clean, declarative structures (like mapping tables or inline dictionaries) rather than scattering them across single-line helper functions.
- **Single-Use Helpers**: Avoid creating private helpers that are only called once unless they reduce deep nesting or isolate a heavy, self-contained algorithm. Keep linear code linear.

---

### Phase 4 — Readability & Robustness Audit

After writing, read the code as a new engineer with zero context. Answer these:

1. **Entry point** — Is it obvious where execution enters this unit?
2. **Flow traceability** — Can you follow the control flow from function names alone, without reading bodies?
3. **Side effects** — Are all state mutations obvious at the call site?
4. **Error path** — Is the failure path as readable and explicit as the happy path?
5. **Resilience** — What happens if the filesystem is full, a database connection drops, or a network request times out?
6. **Ambiguity handling** — For every fallback or error mapping, can a reviewer tell why this behavior is correct and when execution escalates instead?
7. **Metric smell** — Did any complexity, maintainability, or duplication check flag this unit, and if so, did you refactor or explicitly record the debt?
8. **Docstring Check** — Do all public declarations have complete and accurate docstrings detailing inputs, outputs, errors, and side effects?
9. **Abstraction Boundary** — Are all helper functions deep modules? Did we inline any shallow, single-use, or trivial logic to maintain flow readability?

For any "no" or weak answer, refactor or add a `// CLARITY:` annotation explaining what the code does and why.

#### I. Module README & Architecture Design Audit
For any module directory created or modified, you must ensure it has an up-to-date, high-quality `README.md` documenting its architecture, responsibility, public interface, and behavior:
- **Create**: If the module directory has no `README.md`, create it immediately.
- **Update**: If the changes modify the module's public interface, internal logic flow, dependencies, or core responsibility, update the directory's `README.md`.
- **Content guidelines (flexible but thorough)**: The `README.md` must contain sufficient detail to allow a human auditor to understand what the module does, its responsibility, public APIs, key design decisions, and external coupling without having to read the source code.
