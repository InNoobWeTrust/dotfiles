---
metadata:
  materialized_at: "YYYY-MM-DDThh:mm:ssZ"
  source: "~/.agents"
  core_pack_revision: "<git short sha or date>"
  mode: "symlink | copy | mixed | source"
---

# Foundation pack

## Notes

- Core pack membership: see `project-foundation/references/core-pack.md` (global) or this repo's last audit.
- Project-specific skills are not tracked as core.
- For an authoring source pack, set metadata.mode to `source`, omit metadata.materialized_at,
  and record metadata.reviewed_on plus the actual source/revision and bounded
  checked scope.
  A source stamp is not proof of an installed consuming project's foundation.
