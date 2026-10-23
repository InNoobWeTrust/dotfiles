# Portable Skill Bundles

**For skill authors and pack maintainers:** a reusable skill must remain usable
when its directory is copied alone or an unrelated installed skill is renamed.
Passing link checks inside the complete pack is not enough.

## Two distinct layers

**Reusable methods describe capabilities.** A handoff states the work needed,
its inputs, required output/evidence, authority boundaries and behavior when the
capability is absent. The current agent or an authorized capable owner may supply
it. Do not require a sibling skill's name, path, installation or pack index.

**Installation maps bind capabilities to names.** Discovery indexes, composition
registries and explicit pack-selection manifests may contain concrete skill
identities. These are intentional rename points. An operational routing table
inside a reusable skill is not automatically an installation map.

Own identity, bundle-relative resources, upstream citations and genuinely scoped
products/APIs may stay named. Do not erase a real browser command or compatibility
constraint merely because a product name also resembles a skill name.

## Preserve the contract, not the dependency

Instead of “load the implementation skill,” write:

> Given the approved design and acceptance cases, implement within the authorized
> files and return behavior-check evidence. If safe implementation or verification
> is unavailable, report the gap and do not claim readiness.

This wording does not itself replace an essential method. Keep necessary schemas,
steps and stops in the bundle, or specify an actionable required-input contract.
For example, failed checkpoint capture must still block substantive continuation
when that was the original safety rule. Generic “use a suitable capability” wording
must not weaken independence, approval, evidence or scope requirements.

Avoid copying an entire unrelated workflow just to eliminate a link. Bundle small
essential guidance where needed and keep each workflow's responsibility clear.

## Check the whole distribution

1. Inspect the description, body, deep references, templates, scripts and catalogs.
   A CSV path or command example can hide the same coupling as a Markdown link.
   Include bare pack-document paths and named policy files: express their required
   behavior locally rather than assuming that documentation or rule pack exists.
   Triage installation destinations, prohibitions and upstream citations separately.
2. Resolve resources from the actual loaded skill root. Do not assume a particular
   repository checkout, home directory or integration installation. Keep runtime
   input/output paths separate from bundled program paths.
3. Copy the complete skill directory outside the pack. Check local references and
   script/catalog resource resolution without sibling directories or pack docs.
4. Walk through native-capability, authorized-integration and absent-capability
   cases without the author's chat. Missing capabilities do not authorize installs,
   reconfiguration, launches or fabricated verification.
5. Rename a sibling in scratch. Only explicit discovery/installation mappings
   should need edits; another skill's operational instructions should not.
6. Reconcile removed dependencies against the original methods: inputs, outputs,
   authority, evidence, independence and stops must survive.

Static checks and walkthroughs establish source-level properties, not actual agent
compliance or improved productivity. Report executed checks separately and review
the next representative uses before claiming effectiveness.

## When renaming or installing

Update the renamed bundle's own identity and the destination installation's
explicit discovery/composition/selection records. Do not repair coupling by
propagating the new name through unrelated workflows. Fix the capability boundary
instead. Installation examples are examples, not implicit defaults for all machines.

**Related:** [Designing skills](designing-skills.md) ·
[Skill template](templates-skill.md) · [Installation composition map](skill-composition.md)
