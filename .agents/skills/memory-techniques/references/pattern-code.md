# Pattern — Code

Apply the progressive-disclosure shape (`progressive-disclosure-pattern.md`) to a source module. Public surface is the index. Detail lives in leaves that consumers do not need to see.

---

## Target layout

Language-agnostic shape for a small module. Adapt filenames to the language.
This public-surface example is not a maximum directory depth for a subsystem.
Larger subsystems preserve nested abstraction levels: subsystem → layer/stage →
bounded responsibility → component/mechanism. Count directories along one path,
starting with the subsystem root as level 1; sibling buckets add breadth, and
files add no directory levels. For example,
`pretraining/stage1_data_cache/ingestion/engine/` has four directory levels.
Use valid package identifiers (`stage1_data_cache`, not `1_data_cache`, in Python).
Shared capabilities may be shallower and CLI entrypoint files may stay at the root.

```
<module>/
├── index.ts | __init__.py | mod.rs | package.<lang>   # public surface (index)
├── <feature>.ts                                        # feature entry
├── <feature>/
│   ├── index.ts                                        # sub-module index
│   ├── <helper>.ts                                     # leaf: internal helper
│   └── types.ts                                        # leaf: internal types
└── internal/
    └── <private>.ts                                    # leaf: not re-exported
```

Layer mapping:

- **Index** — the file consumers import from. Only re-exports and public types.
- **Entry** — a feature file that owns one capability. Imported by the index.
- **Leaf** — helpers, internal types, private state. Not exported through the index.

---

## Workflow

### 1 — Map the public surface

- Grep every `import` of the module across the repo.
- List every symbol consumers actually reach for.
- Anything not on that list is a leaf candidate.

### 2 — Draft the index

Write the module's entry point as a pure re-export file:

```ts
// index.ts
export { authenticate, logout } from './auth'
export { encrypt, decrypt } from './crypto'
export type { AuthResult, Session } from './types'
```

Keep the index under one screen. If it doesn't fit, the module is doing too much and needs to be split at the module level.

### 3 — Extract leaves

For each feature entry:

- Move helpers, internal types, and private state into their owning responsibility
  or mechanism directory. Sibling files or an `internal/` folder suffice within a
  small cohesive owner; they do not replace a subsystem's vertical hierarchy.
- Leaves must not be re-exported through the module index.
- Consumers reaching into leaves is a lint smell — flag it.

### 4 — Verify consumers still compile

- Build the module.
- Run the tests.
- Grep for any consumer importing a leaf directly. Replace with an import from the index or add the symbol to the index if the leak was intentional.

### 5 — Document the surface

Add a comment or `README.md` at the module root listing:

- What the module owns.
- What it does **not** own (pointers to sibling modules).
- Public symbols and their entry file.

This is the module-scale INDEX.md.

---

## Sizing heuristics

Language-agnostic, tune per project:

| Layer | Soft limit | Hard limit |
|---|---|---|
| Public index | 40 re-exports | 60 |
| Feature entry file | 200 LOC | 400 |
| Leaf file | 300 LOC | 600 |

Growth past these limits is the split signal.
Directory depth has no universal cap here: each nested directory must narrow its
parent's responsibility. Preserve meaningful levels; do not pad every branch to
the same depth or flatten a subsystem merely to meet a numeric limit.

---

## Naming rules

- **Index** file always named `index.<ext>`, `__init__.py`, `mod.rs`, or the language equivalent. Never a domain name.
- **Entry** file named after the capability (`auth.ts`, not `helpers.ts`).
- **Leaf** file named after the shape it exports (`token-cache.ts`, not `utils.ts`).
- Files named `utils`, `helpers`, `misc`, or `common` are red flags — they are unowned dumping grounds. Rename them by concern before extracting.

---

## Anti-patterns

| Temptation | Why wrong | Correct path |
|---|---|---|
| Re-export everything from the index "for convenience" | Consumers reach into internals; refactors break the world | Export only the intended surface. Leaves stay private. |
| Add a public function to a leaf because it's "close to the data" | Splits the surface across the module; consumers can't find it | Move it to the feature entry, re-export from the index. |
| Flatten a subsystem into sibling buckets | Breadth does not express successive abstraction levels | Preserve subsystem → layer/stage → responsibility → mechanism; show an actual directory chain. |
| Add directories solely to reach a depth count | Empty levels do not clarify ownership | Keep meaningful boundaries; allow shallow shared capabilities and root entrypoints. |
| `utils.ts` grows to 800 LOC | It's not a module; it's a dump | Split by concern into named leaves. |
| Circular imports between leaves | Hidden dependency graph outside the index | Route shared code through the entry that owns both leaves. |

---

## Stop conditions

- Moving a symbol would break an external package consumer → stop and produce a deprecation plan (re-export from the old path for one release).
- A split breaks an established check or leaves a consequential behavior unverified → investigate before finishing. A coverage-number drop alone does not justify new maintained tests; apply the assignment's test-persistence boundaries (retain tests for critical logic; internal verification checks remain temporary unless explicitly approved).
- The public surface still exceeds the soft limit after extraction → this module owns too many capabilities. Split at the module level, not the file level.

---

## Deliverable

- [ ] Public surface list printed before edits.
- [ ] Proposed leaf/entry split shown before moving files.
- [ ] Build + tests pass after the move.
- [ ] Consumer imports still resolve via the index.
- [ ] Module README or header comment lists owned/not-owned scope.
