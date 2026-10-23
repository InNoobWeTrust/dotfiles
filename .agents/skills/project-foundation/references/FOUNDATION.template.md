# Foundation pack

source: ~/.agents
materialized_at: YYYY-MM-DDThh:mm:ssZ
core_pack_revision: <git short sha or date>
mode: symlink | copy | mixed | source

## Notes

- Core pack membership: see `project-foundation/references/core-pack.md` (global) or this repo's last audit.
- Project-specific skills are not tracked as core.
- For an authoring source pack, use `mode: source`, omit `materialized_at`, and
  record `reviewed_on` plus the actual source/revision and bounded checked scope.
  A source stamp is not proof of an installed consuming project's foundation.
