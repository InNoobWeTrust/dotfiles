# DB Design Reference Index

This directory contains specialized database engineering references for `db-design`.

| Guide | Description |
|---|---|
| [`schema-modeling.md`](file:///home/innoobwetrust/Developer/InNoobWeTrust/dotfiles/.agents/skills/db-design/references/schema-modeling.md) | Normalization (1NF–3NF), entity relationships, PK/FK strategies (UUIDv7/ULID vs BigInt) |
| [`indexing-performance.md`](file:///home/innoobwetrust/Developer/InNoobWeTrust/dotfiles/.agents/skills/db-design/references/indexing-performance.md) | Index types, composite column ordering, partial indexes, GIN/GiST, and query access patterns |
| [`integrity-constraints.md`](file:///home/innoobwetrust/Developer/InNoobWeTrust/dotfiles/.agents/skills/db-design/references/integrity-constraints.md) | Database-level constraints (CHECK, UNIQUE, NOT NULL, FK ON DELETE RESTRICT/CASCADE) |
| [`state-auditing-history.md`](file:///home/innoobwetrust/Developer/InNoobWeTrust/dotfiles/.agents/skills/db-design/references/state-auditing-history.md) | Soft deletes vs append-only audit tables vs temporal logging vs CDC outbox |
| [`concurrency-locking.md`](file:///home/innoobwetrust/Developer/InNoobWeTrust/dotfiles/.agents/skills/db-design/references/concurrency-locking.md) | Optimistic locking (`version` field), pessimistic row locks, MVCC, and transaction isolation levels |
| [`migrations-evolution.md`](file:///home/innoobwetrust/Developer/InNoobWeTrust/dotfiles/.agents/skills/db-design/references/migrations-evolution.md) | Zero-downtime schema evolution, Expand-Contract pattern, non-blocking DDL |
| [`typed-mapping.md`](file:///home/innoobwetrust/Developer/InNoobWeTrust/dotfiles/.agents/skills/db-design/references/typed-mapping.md) | Mapping DB queries/repositories to strongly-typed DTOs (eliminating raw tuples & untyped dicts) |
