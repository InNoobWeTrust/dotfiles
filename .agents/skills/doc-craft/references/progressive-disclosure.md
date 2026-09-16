# Progressive Disclosure for Documentation

Documentation becomes unreadable when too much information is loaded at once. The **Index → Entry → Leaf** pattern bounds reader cognitive load and agent context windows by enforcing strict information layering.

---

## The Three-Layer Shape

```
INDEX (Always loaded / Top-level overview)
 └─ ENTRY (Loaded on topic selection / Router & core flow)
     └─ LEAF (Loaded on demand / Deep implementation details)
```

| Layer | Responsibility | Typical Size | Example |
|---|---|---|---|
| **Index** | Maps the domain; routes reader to topics based on intent | < 40 rows | `docs/README.md`, `docs/<section>/INDEX.md` |
| **Entry** | Core workflow, high-level architecture, decision router | < 8 KB | `docs/<section>/<topic>.md` |
| **Leaf** | Deep dive, edge cases, extensive schema tables, raw logs | < 16 KB | `docs/<section>/details/<leaf>.md` |

---

## The Four Invariants of an Index

A file qualifies as an Index only when it satisfies all four:
1. **Small**: Rows are bounded (under 40 rows per table).
2. **Complete**: Every entry it governs is listed. No orphan files.
3. **Actionable**: Every row provides a crisp "When to read / Trigger" column, not just a bare title.
4. **Regenerable**: The index can be reconstructed by inspecting the entry files.

---

## Sharding Large Documents (The Shard-Doc Recipe)

When a document exceeds **12 KB** or addresses multiple distinct audiences / concerns, shard it:

### Step 1: Identify Leaf Candidates
- Deep edge case descriptions or failure matrices
- Extensive reference tables (API parameters, error codes)
- Specialized configuration guides for secondary environments
- Implementation details unnecessary for 80% of readers

### Step 2: Extract Leaves
- Move deep content to `details/<leaf-name>.md`.
- Ensure each leaf has a backlink to its parent entry.
- Ensure each leaf is self-contained enough to read in isolation.

### Step 3: Replace Detail with Scannable Router
In the parent entry, replace the extracted prose with:
1. A 1–2 sentence conceptual summary.
2. An actionable router row pointing to the leaf:
   > For low-level timeout configuration and TCP socket tuning under high load, see [`details/socket-tuning.md`](details/socket-tuning.md).

### Step 4: Validate Navigation
- Run a link audit to confirm no broken relative paths.
- Confirm the parent entry is reduced below the 8 KB soft limit.

---

## Directory Layout Standards

```
docs/
├── README.md                     # Top-level index: catalog of sections & reader journeys
├── <section>/
│   ├── INDEX.md                  # Section index (when section has 3+ entries)
│   ├── <topic-1>.md              # Topic entry
│   ├── <topic-2>.md
│   └── details/
│       ├── <leaf-a>.md           # Deep leaf details
│       └── <leaf-b>.md
└── glossary.md                   # Shared terminology (optional)
```
