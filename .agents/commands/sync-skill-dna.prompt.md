**Sync Skill DNA** — Check for drift between canonical skill files and their synced copies in consumer skills, and optionally apply updates.

## Steps

1. Check for drift (report only):
```bash
~/.agents/scripts/sync-skill-dna.sh
```

2. See full diff of what changed:
```bash
~/.agents/scripts/sync-skill-dna.sh --diff
```

3. Apply sync (copy source to all stale consumers):
```bash
~/.agents/scripts/sync-skill-dna.sh --apply
```

4. After syncing, review the adapter files in each consumer skill listed in `~/.agents/skills/skill-dna-manifest.json` to ensure domain-specific references still make sense.

## Notes

- Source → consumer mappings are defined in `~/.agents/skills/skill-dna-manifest.json`
- Synced files get a version header comment: `<!-- synced-from: ... | last-synced: ... -->`
- Adapter files are NOT synced — they contain domain-specific content that references the synced protocol file

---

## Invocation Arguments

Additional command input, if any, appears below exactly as provided:

```text
$ARGUMENTS
```

Use the block above as raw additional user input. Preserve whitespace, blank lines, and quoting exactly. If the block is empty, rely on the conversation context instead.

Follow the instructions above to work on the user's actual request right below.

---
