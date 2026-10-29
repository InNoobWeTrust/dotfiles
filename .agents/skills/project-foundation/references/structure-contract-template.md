# Structure Contract & Quality Gates Template

Use during **Mode A (Bootstrap)** and **Mode B (Audit/Evolve)** so new and existing
repositories enforce source organization, boundaries, complexity/size limits and
reviewable change shape mechanically rather than relying on model judgment.

---

## 1. `AGENTS.md` — Structure Contract section

Include a concise block (keep total `AGENTS.md` within the ~150-line / 8 KB budget):

```markdown
## Structure Contract

- **Organization:** Feature-first (`<src>/features/<feature>/` or language equivalent).
  Shared code lives in capability-named modules (`shared/money`, `platform/http`),
  never catch-all buckets.
- **Forward-only layers inside each feature:**
  `types/domain` → `config` → `ports/repo` → `service` → `adapters/runtime` → `ui/entry`.
  Earlier layers never import later layers. Cross-cutting providers wire at the
  composition root only.
- **Public surface:** Cross-feature imports target only the feature's declared entry
  (`index.ts`, `__all__`, Go non-`internal/`, Rust `pub`).
- **Exemplars (copy layout and naming from these):**
  - `<path/to/exemplar-feature-1>`
  - `<path/to/exemplar-feature-2>`
- **Golden principles (checkable invariants):**
  1. Plan file homes, public surface and dependency edges before writing code.
  2. Functional core (pure decisions over data), imperative shell (I/O at edges).
  3. Ban bucket/versioned names: `utils`, `helpers`, `common`, `misc`, `manager`, `*V2`, `*_new`, `*_old`.
  4. Delete replaced code and unused exports in the same change (unless compatibility is opted in below).
  5. Separate structural tidy steps (pure moves/renames) from behavior changes; keep each reviewable step ≤ 400 hand-written non-test LOC.
  6. Test-flight slices narrow scope, not structure; once behavior is locked, clean all structural findings inside the task footprint before completion.
- **Limits (project overrides; omit rows that use global defaults):**
  - Cognitive complexity ≤ 15 | Cyclomatic ≤ 10 | Function ≤ 50 lines | Nesting ≤ 4 | Params ≤ 5 | File ≤ 400 code lines (tests ≤ 800) | No new clone ≥ 50 tokens.
- **Structure gate command:** `make quality` (must pass with pasted output before handoff).
```

---

## 2. `docs/engineering/quality-gates.md` — Mechanical Gates & Legacy Ratchet

Define the concrete tool commands, thresholds, agent-readable error messages and
ratchet policy for the stack:

```markdown
# Engineering Quality Gates

## 1. Gate Matrix

| Gate | Tool / Rule | Threshold | Command |
|---|---|---|---|
| Formatting & style | <biome / prettier / ruff format / gofmt / rustfmt> | zero diff | `make lint` |
| Complexity & size | <eslint / biome / ruff C90+PLR / golangci-lint / clippy> | cog ≤ 15, cyc ≤ 10, fn ≤ 50 LOC, depth ≤ 4, params ≤ 5, file ≤ 400 LOC | `make quality` |
| Architecture boundaries | <dependency-cruiser / eslint-plugin-boundaries / import-linter / depguard / cargo-deny / ArchUnit> | zero forbidden or circular edges | `make quality` |
| Duplication | `jscpd` (min-tokens 50, min-lines 5) | zero new clones | `make quality` |
| Dead code | <knip / vulture / deadcode / cargo-machete> | zero new unused exports/files/deps | `make quality` |
| Step size | `git diff --stat` (hand-written non-test paths) | ≤ 400 changed lines per concern | handoff check |

## 2. Agent-Readable Boundary Rules

Write custom lint/boundary rule comments so failures tell the agent the exact fix:

- Bad message: `Forbidden dependency`
- Good message: `features/<A> cannot import features/<B>/internal; import from features/<B> public entry or move shared capability to shared/<capability>.`
- Good message: `service layer cannot import adapters/http; pass a port interface from ports/ and wire the adapter at the composition root.`

## 3. Existing-Project Baseline & Ratchet

When adopting this standard on a codebase with existing violations:

1. **Baseline once:** record current violation counts or suppressions in checked-in
   baseline files (for example ESLint bulk suppressions, Ruff per-file ignores with
   tracked count, `golangci-lint` `new-from-rev`, or `betterer`).
2. **Ratchet rule:** CI and `make quality` fail on any **new** violation or any
   touched file whose violation count increases. Counts may only go down.
3. **Touched-unit cleanup:** when editing a legacy file, fix its local violations
   in a separate pure-tidy step if they fit within the 400-LOC step budget.
4. **Target map & batches:** list legacy buckets (`utils/`, god-files) below with
   their target feature homes; migrate one bounded batch at a time after lock checks.

## 4. Hook Wiring (Self-Correction Before Handoff)

- **Git pre-commit / pre-push:** run `make quality` (or scoped file gates) via
  `lefthook`, `pre-commit`, or `husky`.
- **Agent harness hooks:** where the active harness supports `afterEdit` or
  `beforeFinish` hooks, wire the fast lint/boundary check so the agent receives
  the failure output immediately and repairs violations before returning to the user.
```
