# Portability and Reader Contract

Apply to a reusable skill's description, body, references, scripts, assets and routing pointers.
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

## Capability handoffs, not sibling dependencies

A reusable skill is distributed as one directory. Another skill's name, path or
continued installation is not an operational contract. Describe cross-domain work
by the capability needed, its inputs, required output/evidence, authority and
unavailable-capability behavior. The current agent or another authorized capable
owner may supply it; discovering a skill is optional, not a dependency.

For example: “Given the approved interface and acceptance cases, implement within
the authorized files and return behavior-check evidence; if implementation or
verification cannot be performed safely, report the gap and do not claim ready.”
Do not replace a named method with “use a suitable capability” and lose its gates.

- Keep essential steps, schemas and stops in this bundle, or state an actionable
  required-input contract. Missing required evidence blocks the affected step.
  Do not copy an entire unrelated method merely to avoid a link.
- Bundle-relative resources are valid. Resolve paths from the loaded skill root,
  including scripts and catalogs; never assume a checkout's skill directory.
   Inspect CSV fields, templates and code examples as well as Markdown links.
   Scan bare pack-document paths and named governance rules too: bundle necessary
   guidance or state its actionable contract instead of assuming the author's
   documentation or policy files are installed. Distinguish actual prerequisites
   from explicit installation destinations, prohibitions and upstream citations.
- Concrete skill identities belong in installation/discovery indexes, composition
  maps and explicit pack-selection manifests. Those are maintained rename points,
  not prerequisite files for using an individual skill. An operational routing
  table inside a skill is not exempt merely because it looks like an index.
- Own identity, self-links, upstream citations and genuine scoped products/APIs
  may stay named. A product name that also resembles a skill name is not a reason
  to erase real compatibility requirements or commands.

## Check the intended outcome

| Scenario | Expected behavior |
|---|---|
| Native capability exists | Use its documented interface without requiring an integration |
| Authorized integration exists | Use its actual contract without assuming that schema elsewhere |
| Capability is absent | Report the limitation; stop or use permitted ordinary judgment, not install a replacement |
| Reader has no author chat | Inputs, terms, constraints and explicit resources suffice |
| Tool needs an absolute runtime path | Resolve it at invocation; keep published links/examples portable and clearly rooted |
| Only this skill directory is copied | Required bundled resources resolve; no sibling, pack-doc or author-host prerequisite is hidden |
| Another installed skill is renamed | No operational edit to this bundle is needed; update only explicit installation/discovery mappings |

Keep descriptions focused on selection: capability, triggers and relevant
constraints. Remove investigation residue, account history and catalog snapshots;
retain real privacy, compatibility and permission constraints.

Verify referenced files exist and are reachable from their documented root.
Check a copy of the complete bundle outside the pack, scan names and path escapes,
and manually reconcile each removed handoff with the original method's safeguards.
Use a sibling-absent walkthrough for required capabilities; a missing capability
may block its step but must not prompt an install or a fabricated success.
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
- **Discover available search:** Let agents use available authorized capabilities,
  preferring BM25 row search or efficient CSV queries over reading whole catalogs.
  Options include SQLite CSV import into a temporary database, DuckDB SQL over CSV,
  Nushell, an existing BM25 CLI, or a configured MCP capability. Describe retrieval
  needs rather than shipping duplicate per-skill search wrappers. Inspect the actual
  interface and CSV header; scope to exact catalogs resolved from the loaded bundle.
  Preserve field/filter/ID semantics and return bounded rows with source locators.
  Do not require a particular tool or MCP server, create a memory store, install
  dependencies or upload catalogs just to search. Keep database/index artifacts
  temporary and source CSVs unchanged. If search is unavailable, use bounded
  header/known-ID lookup or bundled quick references and state the gap, not a full
  CSV context dump.
- **Verify proportionately:** Check CSV parsing and representative capability
  queries with available tools, plus the no-search fallback. Distinguish executed
  retrieval from source walkthroughs; do not claim equivalent ranking across tools
  or improved agent decisions merely because the catalog is searchable.
