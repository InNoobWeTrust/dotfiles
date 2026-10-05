# Remote Skills Synchronization (`remote-skills-sync`)

Fetch, update, and audit skills and data sources tracked from external GitHub repositories.

The repository tracks remote skills and assets using `.agents/skills/remote-skills-manifest.json` and the sync utility `.agents/scripts/sync-remotes.sh`. The utility uses the GitHub Contents API to compare directory tree SHAs, downloading updates recursively only when remote drift is detected.

---

## Execution Commands

### 1. Check for updates (Dry Run)
Inspect whether any tracked remote skills or data sources have upstream changes:
```bash
.agents/scripts/sync-remotes.sh
```

### 2. Pull and apply updates
Synchronize and update out-of-date remote skills:
```bash
.agents/scripts/sync-remotes.sh --apply
```

### 3. Force full re-download
Re-download all tracked files even if the tree SHA matches:
```bash
.agents/scripts/sync-remotes.sh --apply --force
```

---

## Remote Skills Manifest Schema

Remote skill sources and data sources are configured in `.agents/skills/remote-skills-manifest.json`:

```json
{
  "$schema": "Remote skills manifest — maps local skill directories to their upstream GitHub sources",
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
  },
  "data_sources": {
    "<skill-name>": [
      {
        "name": "source-name",
        "owner": "github-org",
        "repo": "repo-name",
        "path": "data-path",
        "branch": "main",
        "cache_env": "CUSTOM_CACHE_ENV",
        "default_cache": ".cache/custom-cache",
        "last_synced_sha": "",
        "last_synced_at": ""
      }
    ]
  }
}
```

---

## Adding a New Remote Skill

1. Add an entry under `"remotes"` in `.agents/skills/remote-skills-manifest.json`.
2. Run `.agents/scripts/sync-remotes.sh --apply` to execute the initial fetch.
3. Register the new skill in `.agents/skills/INDEX` per `skill-author` Workflow A.
4. Verify the downloaded files comply with progressive disclosure and repository quality gates.

---

## Operational Considerations

- **GitHub API Rate Limits**: Uses unauthenticated GitHub API by default (60 requests/hour). Export `GITHUB_TOKEN` to raise the limit to 5,000 requests/hour.
- **Drift Tracking**: `last_synced_sha` records the upstream directory tree SHA. A discrepancy indicates remote upstream changes.
- **Full Replacement on Apply**: On `--apply`, the local skill target directory is **completely replaced** with remote content. Local modifications will be overwritten unless ported to an overlay or upstreamed.
- **Post-Sync Review**: After updating a remote skill, load the `reviewer` skill to audit incoming changes for breaking interface alterations, prompt injection, or unsupported dependencies.
- **Distinction from Local DNA Sync**: This command manages external GitHub repositories. Internal source-to-consumer protocol copies within the repository are handled separately by `.agents/scripts/sync-skill-dna.sh`.
