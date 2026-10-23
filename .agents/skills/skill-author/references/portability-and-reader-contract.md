# Portability and Reader Contract

Apply to a reusable skill's description, body, references and routing pointers.
Self-contained means usable with its explicit resources, not one giant file.

## Before drafting

Identify the reader, the action or decision the skill enables, and the knowledge
or resources that reader can reasonably access. A short mental check suffices for
a small edit; do not create a separate specification by default.

- **Define the capability:** State necessary inputs, workflow, outputs, authority,
  verification and unavailable-capability behavior. Do not assume inherited chat,
  repository context or worker tooling.
- **Discover the interface:** “Use an existing solution” can mean a native harness
  tool, a configured integration or another authorized existing interface. Inspect
  the actual contract; do not invent tool names, schemas or installation paths.
- **Keep scope honest:** A product-specific skill may require that product when
  its description and compatibility constraints say so. Do not silently narrow a
  generic workflow to the author's provider, account or harness.
- **Separate deployment:** Server names, account routes, credentials, host paths
  and deployment payloads belong in scoped integration/configuration docs, not as
  prerequisites hidden in a generic skill's `references/` directory.
- **Preserve safety:** Discovery does not authorize installation, reconfiguration,
  permission escalation, external disclosure or worker launches. On unavailable
  capability, state the limitation and preserve the active workflow's stops.

## Check the intended outcome

| Scenario | Expected behavior |
|---|---|
| Native capability exists | Use its documented interface without requiring an integration |
| Authorized integration exists | Use its actual contract without assuming that schema elsewhere |
| Capability is absent | Report the limitation; stop or use permitted ordinary judgment, not install a replacement |
| Reader has no author chat | Inputs, terms, constraints and explicit resources suffice |
| Tool needs an absolute runtime path | Resolve it at invocation; keep published links/examples portable and clearly rooted |

Keep descriptions focused on selection: capability, triggers and relevant
constraints. Remove investigation residue, account history and catalog snapshots;
retain real privacy, compatibility and permission constraints.

Verify referenced files exist and are reachable from their documented root.
Read without the chat: remove irrelevant history and add missing necessary context.
Walkthroughs establish source-level usability only; report executed evidence
separately and do not claim that editing instructions proves agent compliance.

## Searchable choice catalogs

For comparisons used to select among tools, libraries, patterns or other alternatives,
store the conditional choices in a lightweight structured catalog such as CSV.
Reuse a suitable existing catalog and its schema before creating another file or
search mechanism; workflow steps and checklists need not become database records.

Keep static lookup catalogs in the skill's `assets/` directory; `scripts/` holds
executable code and `references/` explanatory documentation. These are AgentSkills
recommended conventions, not a prohibition on additional files or directories.
State the reference-resolution root explicitly; moving a catalog into `assets/`
does not change skill-root-relative reference values.

- **Model the decision:** Use stable IDs and fields that capture capabilities,
  requirements/use conditions, alternatives, limitations and rationale or sources.
  Adapt to the existing schema rather than forcing a new universal format. Quote
  commas, quotes and multiline values correctly; keep one authoritative record.
- **Keep the router small:** Link the catalog and explain how to query it from an
  explicit skill-relative root. Do not repeat its comparison matrix in Markdown;
  a requested human-facing table can be a view of the records, not a second source.
- **Search by need:** Query actual required capabilities, not only product names.
  Where supported, select positive capability/use-condition fields for ranking;
  inspect exclusions and constraints in returned rows before choosing. Retrieve a
  few candidates with stable IDs or source locators; a top score is not approval.
- **Discover available search:** Use native CSV-aware tools, an existing skill CLI,
  or an authorized external integration. Inspect its schema and scope to the exact
  catalog; resolve absolute tool paths only at invocation. Do not require a specific
  MCP server, create a memory store, install dependencies or replace an engine just
  to search. If search is unavailable, use bounded ordinary reads and state the gap.
- **Verify proportionately:** Check CSV parsing and representative capability
  queries with available tools, plus the no-search fallback. Distinguish executed
  retrieval from source walkthroughs; do not claim equivalent ranking across tools
  or improved agent decisions merely because the catalog is searchable.
