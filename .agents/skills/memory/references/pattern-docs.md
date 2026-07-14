# Pattern — Docs

Apply the progressive-disclosure shape (`progressive-disclosure-pattern.md`) to a docs directory. This is the recipe behind the existing `shard-doc` and `index-docs` commands, generalized so any docs tree can adopt it.

---

## Target layout

```
docs/
├── README.md                     # top-level index: what lives here, who maintains what
├── <section>/
│   ├── INDEX.md                  # section index (rows point at entries)
│   ├── <entry-1>.md              # topic entry
│   ├── <entry-2>.md
│   └── details/
│       └── <leaf-*>.md           # deep detail loaded on demand
└── glossary.md                   # cross-section terminology (optional)
```

Three layers, matching the meta pattern:

- `docs/README.md` and each `INDEX.md` are indexes.
- `<entry-*>.md` are entries.
- `details/<leaf-*>.md` are leaves.

---

## Workflow

### 1 — Audit the current tree

- List every `.md` under `docs/`.
- For each file, record: size in KB, number of top-level headings, and cross-links in.
- Flag files over 12 KB or with more than one dominant concern. These are candidates for splitting.

### 2 — Group by concern

- Cluster files that answer the same "what is X" or "how does X work" question.
- Each cluster becomes a section under `docs/<section>/`.
- If a cluster has only one file, keep it flat; don't invent a section just for symmetry.

### 3 — Extract leaves

For every entry over the size threshold or with multiple concerns:

- Move the deep detail into `details/<leaf-*>.md`.
- Keep the entry as a router: overview, when to read each leaf, and a link block.
- Verify the entry stays under 8 KB after extraction.

### 4 — Build the index

For each section:

- Write `INDEX.md` with one row per entry: title, one-line summary, "read this when".
- Row order: reader journey, not alphabetic.
- Keep the section INDEX under 40 rows. If it grows past that, split the section.

Update `docs/README.md` to point at every section index.

### 5 — Verify links

- Every leaf must be referenced from at least one entry.
- Every entry must be referenced from an INDEX row.
- Every INDEX must be referenced from `docs/README.md`.
- Orphans go in a report — do not silently delete.

### 6 — Regenerability check

Confirm that the section INDEX and the top README can be rebuilt from the entries. If a fact only lives in the index, move it to the entry it describes.

---

## Sizing defaults

| Layer | Soft limit | Hard limit |
|---|---|---|
| `docs/README.md` rows | 20 sections | 30 |
| Section `INDEX.md` rows | 40 entries | 60 |
| Entry file | 8 KB | 16 KB |
| Leaf file | 12 KB | 24 KB |

Override in the top `docs/README.md` frontmatter for a specific repo.

---

## Stop conditions

- Any move would break external links (blog posts, other repos) → stop and produce a redirect list first.
- A file is referenced from `AGENTS.md`, `README.md`, or a CI config → include those consumers in the impact list before moving.
- Section grouping is ambiguous (a file spans two concerns equally) → stop and ask the user to name the primary concern.

---

## Deliverable

- [ ] Audit table (file, size, concerns, cross-refs) printed before edits.
- [ ] Clusters proposed with names before any moves.
- [ ] Leaves extracted; entries stay under soft limit.
- [ ] Section INDEX.md written for every non-flat section.
- [ ] `docs/README.md` regenerated.
- [ ] Link report produced (orphans, redirects, external consumers).
