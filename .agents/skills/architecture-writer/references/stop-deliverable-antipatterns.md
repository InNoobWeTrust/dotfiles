## Stop Conditions

- **Insufficient codebase knowledge**: If the project is too large to map in one pass, focus on the core data path (one write flow, one read flow) and mark the rest as "to be mapped."
- **Architecture doc already exists and is current**: Audit the existing doc against the 6 sections. Report gaps; don't overwrite.
- **Project has no backend/data layer**: For static sites or simple frontend projects, the architecture doc is minimal — just the responsibility split and data flow.
- **No deployable units identified**: If the project is a monolith with no distinct deployable boundaries, document the single-unit split (app, database, external services) and skip component-boundary detail — the doc still has value as a data-flow and ownership map.

---

## Deliverable

- [ ] Architecture inventory (Phase 1)
- [ ] Responsibility split documented (Phase 2)
- [ ] Data ownership table (Phase 3)
- [ ] ASCII data flow diagram (Phase 4)
- [ ] API contract strategy (Phase 5)
- [ ] Non-goals section (Phase 6)
- [ ] Final `docs/architecture.md` written with all 6 sections

---

## Design Decision Anti-Patterns

| Temptation | Why It's Wrong | Correct Path |
|---|---|---|
| "I'll describe every class and module" | An architecture doc is not a code tour — it's about component boundaries | Describe components and their relationships, not internal module structure |
| "I'll draw the diagram as a Mermaid block" | ASCII diagrams render everywhere (terminal, GitHub, docs); Mermaid requires a renderer | Use ASCII art for the main diagram; optionally add Mermaid as a supplement |
| "I'll skip non-goals — they're obvious" | Without explicit non-goals, scope creeps and readers assume the doc covers everything | List at least 3-5 things the doc explicitly does NOT cover |
| "I'll generate architecture from code structure alone" | Code structure reflects implementation, not intent or boundaries | Infer boundaries from deployable units, not directory structure |
| "The data flow is too complex for ASCII" | If it's too complex to diagram, it's too complex to understand | Simplify to the primary read path and primary write path |
