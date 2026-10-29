---
metadata:
  prototype-added: "2026-10-30"
  origin: "User-directed: agents produced working but unreviewable code; global defaults with project override, applied to new and existing projects."
  sources: "GitClear AI Copilot Code Quality 2025 (duplication up, moved/refactored code down); CodeScene/Borg et al. code-health and LLM defect risk; SmartBear/Cisco review study (200–400 LOC); OpenAI harness-engineering write-up (forward-only layers, agent-readable custom lint messages, recurring cleanup); SonarSource cognitive complexity; Ousterhout deep modules; Beck Tidy First."
  maintenance-review: "Prototype. Reassess after 1–2 real uses per language. Numeric defaults are policy defaults, not empirical optima; adherence is unverified until gate output is observed."
---

# Code structure standard

Shared contract for implementers, assessors and reviewers. It applies to **new and
existing** projects. Prose cannot hold the line alone: wherever a project can run a
tool, encode these rules as gates (see [structure-gates.csv](../assets/structure-gates.csv)).

**Precedence:** the project's root engineering docs (an AGENTS.md "Structure contract"
section or equivalent) and checked-in linter configuration override these defaults.
Silence means these defaults apply. Raising a limit needs a recorded reason; a single
exception uses the language's native suppression comment with a reason and is listed
in the handoff.

## 1. Organization defaults

1. **Feature first.** Top-level source is grouped by feature/capability
   (`features/<name>/`, Go `internal/<name>/`, a Python package or Rust module per
   capability). Code shared across features lives in a home named for its capability
   (`shared/money`, `platform/http`), never a bucket.
2. **Forward-only layers inside a feature.** Default order: `types/domain` →
   `config` → `ports/repo` → `service` (decisions) → `adapters/runtime/handlers` →
   `ui/entry`. A layer imports only earlier layers. Cross-cutting concerns (auth,
   telemetry, external connectors) enter through explicit providers wired at one
   **composition root** (`main`/bootstrap), not global imports.
3. **Functional core, imperative shell.** Decisions and transformations are plain
   functions over data; I/O, time, randomness and framework calls stay at the edges.
4. **Explicit public surface.** Other features use a feature's declared entry only
   (language-native privacy first: Go `internal/`, Rust `pub(crate)`, Python
   `_private` + `__all__`, TS package `exports`). No cross-feature imports of internals.
5. **Deep modules.** A module hides real behavior behind a small interface. No
   pass-through wrappers, `*Manager`/`*Helper` shells or layers that only forward calls.
6. **One owner per rule.** A business rule exists once. Keep code feature-local until a
   second real consumer appears; then move it to its capability home instead of copying.
7. **Names.** Name files and modules after the concept they own. Banned as new names:
   `utils`, `helpers`, `common`, `misc`, `stuff`, `lib2`, `*_new`, `*V2`, `*_old`,
   `temp*`. One primary concept per file.
8. **Reading order inside a file.** Purpose header (file navigation), public entry
   points first, then helpers in call order. Tests follow one project convention
   (colocated or mirrored).
9. **Replacement removes the old path.** No dead code, unused exports, orphaned files
   or parallel old/new implementations left behind (compatibility only if opted in).

Exemplars: the project names 1–3 exemplar modules. New code copies their layout and
naming. Without exemplars, the first feature that passes this standard and is accepted
by the user becomes one.

## 2. Default limits

Hand-written source only. Generated code, vendored code, lockfiles, data fixtures and
snapshots are exempt and live in marked paths.

| Measure | Default | Typical gate |
|---|---|---|
| Cognitive complexity per function | ≤ 15 | Sonar/Biome cognitive complexity, `gocognit`, clippy |
| Cyclomatic complexity per function | ≤ 10 | Ruff `C901`, ESLint `complexity` |
| Function body | ≤ 50 lines | ESLint `max-lines-per-function`, Ruff `PLR0915`, `funlen` |
| Block nesting depth | ≤ 4 | ESLint `max-depth`, `nestif` |
| Parameters | ≤ 5 (use a typed options object beyond) | Ruff `PLR0913`, ESLint `max-params` |
| Source file | ≤ 400 code lines (tests ≤ 800) | ESLint `max-lines`, custom line check |
| New duplication | no new clone ≥ 50 tokens / 5 lines | jscpd |
| Dead code | none introduced | knip, vulture, `deadcode`, `cargo-machete` |
| Boundaries | zero violations of §1.2/§1.4 | dependency-cruiser, eslint-plugin-boundaries, import-linter, depguard, ArchUnit |
| Reviewable step | ≤ 400 changed hand-written non-test lines, one concern | diff stat in handoff |

A directory with more than ~20 source files, or a file that mixes features, is a
regrouping signal for review, not an automatic gate.

## 3. Structure plan before code

Before the first source write that adds a capability, file group, public surface or
dependency edge, settle a short **structure plan**:

```text
STRUCTURE PLAN
Files: <path> — <responsibility, layer>          (create / modify / delete)
Public surface: <entry symbols other code may use>
New edges: <A → B> (allowed by layer order? yes/no)
Exemplar followed: <path>   Limits/overrides: <default | project rule>
```

The plan is design direction: an eligible direction route or the user authors or
approves it; an execution-only route materializes it. When the code does not fit
the plan, stop and return the conflict; do not write outside the plan. A cohesive
edit inside one existing owner needs only a one-line owner rationale.

## 4. Reviewable change shape

- **One concern per step.** Structural tidying (moves, renames, extractions, dead-code
  removal) and behavior changes are separate commits/steps. A move is a pure move.
- **Within the step budget** (§2). Larger work is split into stacked steps that each
  pass gates on their own.
- **No drive-by edits:** no unrelated reformatting, renames or "while I'm here" fixes.
- **Change map in every handoff:** files in reviewer reading order, each with why it
  changed; added/removed dependency edges; gate commands and their actual output;
  listed suppressions.

## 5. Enforcement independent of the model

These controls hold regardless of which model writes the code; they matter most for
routes that tend to optimize locally (make the test pass, ignore the codebase shape):

- **Gates, not promises.** Run the project's structure gates after edits and before
  handoff; paste the output. A claimed pass without output is UNVERIFIED. Where the
  harness supports after-edit or before-finish hooks, the project wires the gates there.
- **Agent-readable failures.** Custom lint messages state the allowed fix
  (for example `features/billing may not import features/auth/internal; use features/auth`).
- **Bounded dispatch.** Execution workers receive the structure plan's exact paths and
  a step budget; writing outside listed paths, adding a top-level directory, shared
  module or dependency not in the plan is a stop-and-return, not a judgment call.
- **Separate structural review.** A route that did not write the code checks placement,
  boundaries, duplication and limits; an observed violation is FAIL and blocks acceptance.
- **Ratchet.** Violation counts may only go down; a new or worsened violation fails.

## 6. Manual check when no tool is configured

Report "gates not configured" as a foundation gap, then check by reading: plan
compliance, imports against layer order and public surfaces, the largest/most
complex changed functions against §2, new near-duplicates of existing rules
(search for key literals and names), banned names, and leftovers from replaced code.
Manual results are labelled as such, not as gate passes.
