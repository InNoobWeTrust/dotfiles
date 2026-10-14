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
