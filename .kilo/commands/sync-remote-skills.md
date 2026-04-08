---
description: Sync skills from remote GitHub repositories to local copies
---

# Sync Remote Skills

Fetch and update skills sourced from external GitHub repositories. Uses the GitHub Contents API to detect drift via tree SHA comparison, then recursively downloads all files when updates are available.

// turbo-all

## Steps

1. Check for available updates (dry run):
```bash
.agents/scripts/sync-remote-skills.sh
```

2. Pull updates from remote:
```bash
.agents/scripts/sync-remote-skills.sh --apply
```

3. Force re-download even if SHA matches:
```bash
.agents/scripts/sync-remote-skills.sh --apply --force
```

4. After syncing, review the updated skill files for any breaking changes or new capabilities that may affect dependent workflows.

## Configuration

Remote skill sources are defined in `.agents/skills/remote-skills-manifest.json`:

```json
{
    "remotes": {
        "<skill-name>": {
            "owner": "github-org",
            "repo": "repo-name",
            "path": "path/to/skill",
            "branch": "main",
            "local_path": "local-skill-dir",
            "last_synced_sha": "",
            "last_synced_at": ""
        }
    }
}
```

### Adding a new remote skill

1. Add an entry to `remote-skills-manifest.json` under `remotes`
2. Run `.agents/scripts/sync-remote-skills.sh --apply` to perform initial fetch
3. Update `.agents/skills/index.md` with the new skill entry

## Notes

- Uses unauthenticated GitHub API by default (60 requests/hour). Set `GITHUB_TOKEN` environment variable for 5000 req/hr.
- The `last_synced_sha` field tracks the remote directory tree SHA. When the remote SHA changes, the skill is flagged as having drift.
- On `--apply`, the local skill directory is **fully replaced** with the remote contents. Local modifications will be overwritten.
- This workflow is separate from the local DNA sync (`sync-skill-dna.sh`) which handles source→consumer protocol copies within the repo.

## Related Workflows

- [Sync Skill DNA](./sync-skill-dna.md) — local source→consumer protocol sync
- [Skill Review](./review.md) — post-sync review checklist
