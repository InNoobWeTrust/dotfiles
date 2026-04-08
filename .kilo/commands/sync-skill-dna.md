---
description: Sync shared skill DNA from canonical sources to consumer skills
---

# Sync Skill DNA

Check for drift between canonical skill files and their synced copies in consumer skills, and optionally apply updates.

// turbo-all

## Steps

1. Check for drift (report only):
```bash
.agents/scripts/sync-skill-dna.sh
```

2. See full diff of what changed:
```bash
.agents/scripts/sync-skill-dna.sh --diff
```

3. Apply sync (copy source to all stale consumers):
```bash
.agents/scripts/sync-skill-dna.sh --apply
```

4. After syncing, review the adapter files in each consumer skill listed in `.agents/skills/skill-dna-manifest.json` to ensure domain-specific references still make sense.

## Notes

- Source → consumer mappings are defined in `.agents/skills/skill-dna-manifest.json`
- Synced files get a version header comment: `<!-- synced-from: ... | last-synced: ... -->`
- Adapter files are NOT synced — they contain domain-specific content that references the synced protocol file
