# Progressive Disclosure — the meta pattern

Memory (short-term leaves + long-term index) is one instance of a wider design. The same shape governs how this repo organizes rules, skills, docs, and code. This file names the pattern so the other references can reuse it without redefinition.

---

## The shape

```
INDEX (small, always-loaded)
 └─ ENTRY (loaded on demand)
     └─ LEAF (loaded only when the entry says so)
```

Three layers, three loading rules:

| Layer | Loading rule | Example |
|---|---|---|
| **Index** | Always available in context | `.agents/skills/INDEX.md`, `long-term/INDEX.md`, `docs/README.md`, module `index.ts` |
| **Entry** | Loaded when a user or router picks a topic | `SKILL.md`, `long-term/topics/<topic>.md`, doc section, exported symbol |
| **Leaf** | Loaded when the entry defers to it | `references/*.md`, `short-term/*.md`, internal helper file, private function |

An agent traverses index → entry → leaf. It stops as soon as the current layer answers the question.

---

## Four properties an index must have

An index earns its always-loaded slot only when it has all four:

1. **Small** — tokens, KB, or rows are bounded. The size limit is stated in the index itself or in the routing rule that governs it (`SKILL.md` §Size limits, `INDEX.md` limit frontmatter, module header comment).
2. **Complete** — every entry it governs is listed. No hidden entries. If the entry isn't in the index, it can't be routed to.
3. **Actionable** — each row tells the reader when to descend (a trigger phrase, a topic, a condition). A dead catalogue that just lists files is not an index.
4. **Regenerable** — the index can be rebuilt from the entries. Sources of truth live in the entries, not the index. This keeps the two in sync across edits.

If any property is missing, the layer becomes a bottleneck instead of a router.

---

## Four properties a leaf must have

Leaves earn their optionality only when they have all four:

1. **Focused** — one concern per leaf. Splitting reduces the leaf; growth is a signal to split, not to append.
2. **Referenced** — an entry points to the leaf. Orphan leaves are dead code.
3. **Self-contained enough** — a reader who arrived here directly has enough context to act, or a clear pointer back to the entry.
4. **Loadable in isolation** — the leaf does not require sibling leaves to make sense. Cross-leaf dependencies belong in the entry.

---

## Depth rule

Prefer three layers. Add a fourth only when a leaf itself becomes an index for a set of sub-leaves — and then that new index must satisfy the four properties above.

Excessive depth defeats the point. Two-layer designs are fine for small domains (a rules directory with `INDEX` + rule bodies).

---

## Reference quality and loading ownership

When an index or entry points to a leaf, the **pointer text** must explain which content or decision is covered — enough for a reader to decide whether to descend without opening the file.

- Wrong: "See `topics/api.md` for details."
- Right: "API versioning constraints and backward-compat rules that block dependency upgrades: `topics/api.md`."

Two invariants:

1. **Loading guidance lives in the referrer, not the leaf.** The index row or entry's routing section states when and why to descend. The leaf does not repeat this. If a leaf explains when to load itself, that guidance belongs in the nearest referring entry instead.
2. **Content lives in the leaf, not the index.** The index carries only the key, a one-line summary, and a pointer. Detail in the index violates the Regenerable property and grows the always-loaded layer. Move detail down to the leaf; the index entry becomes a row.

Topic/folder grouping makes the graph explicit. In the portable memory contract the leaf for each topic is `long-term/topics/<topic>.md` — one flat file per topic, no subdirectories unless a separate storage contract explicitly defines them and places an index at each subfolder level satisfying the four properties above. Group loose entries into named topic files rather than leaving them at the `long-term/` root.

### Root-first traversal for long-term memory

When recalling or querying the long-term store:

1. Open `MEMORY_DIR/long-term/INDEX.md`.
2. Identify the relevant row(s) by key or Summary scan.
3. Follow the `Bucket` pointer and load only that bucket or topic file.

This prevents loading every topic file when only one is needed, and keeps the always-loaded INDEX layer thin.

Short-term recall does not require INDEX traversal — query `short-term/` directly by branch slug or topic slug (see `hierarchy-and-storage.md` §Recall mode). The root-first rule applies only to the structured long-term store.

---

## Anti-patterns

| Temptation | Why wrong | Correct path |
|---|---|---|
| Copy leaf content into the index "for convenience" | Duplicates the source of truth; edits diverge | Keep the pointer only. Load the leaf when needed. |
| Load every leaf at session start "to be safe" | Blows context budget and defeats routing | Load index first. Descend only when triggered. |
| Add rows to the index without the corresponding entry | Router points at nothing; runtime error | Create the entry first, then index it. |
| Store detail in the index and use the leaf as an alias | Inverts the layers; index grows until it isn't small anymore | Detail belongs in the leaf. Index carries key + pointer. |
| Cross-reference leaves directly | Creates a hidden dependency graph outside the index | Route through the index or through an entry that owns both leaves. |
| Deep hierarchy (5+ layers) for a small domain | Overhead dominates the payload | Flatten. Merge trivial intermediate layers. |
| Reference names the target but says nothing about its content | Reader must open the leaf to decide whether it is relevant; defeats routing | Describe which content or decision is covered in the surrounding text of the pointer |
| Loading guidance ("load this when X") placed inside the leaf | Creates a hidden dependency; the leaf must be loaded to discover when to load itself | Put load triggers in the index row or the entry's routing section |

---

## When to apply

Apply this pattern when any of these fire:

- A single file exceeds a soft size limit and holds multiple concerns.
- Readers keep saying "I don't know where X lives".
- The same content is being loaded but rarely used in full.
- A search-first workflow is emerging in a place that should be routed instead.

Concrete recipes live in:

- `pattern-docs.md` — applying the shape to a docs directory (shard-doc / index-docs).
- `pattern-code.md` — applying the shape to a source module (public surface, private detail).

The memory storage layout in `hierarchy-and-storage.md` is the canonical example.
