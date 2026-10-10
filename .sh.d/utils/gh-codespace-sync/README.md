---
audience: Dotfiles users managing their GitHub Codespaces configuration
purpose: Install and use the inline Codespaces synchronization extension
scope: Local extension setup, selection controls, and write safety
---

# Codespaces inline wizard

| Goal | Requirements | Boundary |
| --- | --- | --- |
| Upload selected local entries or grant repository access | Bun, GitHub CLI, interactive terminal | User-level Codespaces configuration only |

## Install and run

Interactive dotfiles shells register this local extension in the background only
when it is missing and `gh` is available. Once installed, startup skips setup
without running `gh`; non-interactive shells always skip it. Existing extensions
and alias expansions are never replaced, and registration failures warn without
delaying shell startup.

First-time registration may finish after the prompt appears. It also adds
`gh codespace sync` if missing; to restore only a deleted alias, use the manual
command below.

If setup is forcibly killed, its lock may remain. After confirming no installer
is running, clear it with
`rmdir "${XDG_DATA_HOME:-$HOME/.local/share}/gh/extensions/.gh-codespace-sync-installing"`
and open another interactive shell.

Run either command:

```sh
gh codespace-sync
gh codespace sync
```

For a shell that does not load these dotfiles, register manually from this directory:

```sh
gh extension install .
gh codespace-sync
```

Local installation links to this directory; dotfiles updates take effect without
reinstallation. Keep the checkout at this path, or remove and reinstall the
extension after moving it. No separate extension repository is needed locally.

First-time registration adds this nested command; manual equivalent:

```sh
gh alias set 'codespace sync' 'codespace-sync'
gh codespace sync
```

Use `gh codespace-sync --help` for usage. To unregister, run
`gh alias delete 'codespace sync'` if you added it, then
`gh extension remove codespace-sync`; the source files remain.
Removing the extension lets a later interactive dotfiles shell register it again.

Without registering an extension, run `gh_codespace` after sourcing
`~/.sh.d/func.sh`, or:

```sh
sh ~/.sh.d/utils/gh-codespace-sync/gh-codespace-sync
```

Requires Bun (verified with 1.3.11), GitHub CLI, and an interactive terminal.
Bun downloads pinned prompt/dotenv/encryption dependencies on first use and caches them.
The launcher uses a private cache under `${XDG_CACHE_HOME:-$HOME/.cache}/gh-codespace-sync`.
Its cache key follows the pinned imports, avoiding Bun's cached-version resolution bug.
If `BUN_INSTALL_CACHE_DIR` is set, that directory becomes the parent of this private cache.
Authenticate with the account whose user-level Codespaces entries you manage:

```sh
gh auth refresh -h github.com -s codespace:secrets
```

## Steps

1. **Action:** upload local values or grant access to existing GitHub entries.
2. **Entries:** choose names; values never appear. Upload parses `~/.vars.user`
   as literal dotenv, without executing shell code or expanding `$VARIABLE`.
3. **Owned repositories:** choose your account's current repositories.
4. **External repositories:** independently choose accessible non-owned repos.
5. **Review:** inspect every chosen name and repository; choose **Apply reviewed changes** to start.
6. **Progress/result:** completed writes, current operation and final outcome.

Each step uses a visual inline selector, not a fullscreen application.

| Key | Action |
| --- | --- |
| ↑ / ↓ | Move through the choices; long lists scroll |
| Space | Toggle the focused checkbox |
| Enter | Submit the displayed choices or confirm the focused menu item |
| A | Toggle all entries or owned repositories; disabled for external repos |
| Escape | Go back; previously submitted selections remain checked |
| Ctrl-C / Ctrl-D | Cancel the current prompt |

Nothing is preselected. External repositories always require individual toggles.
Changing the action clears selections. Review defaults to **Cancel**, not Apply.
During execution, Ctrl-C stops after the current request, before any next write.

Uploads add/update selected entries only and leave existing access unchanged.
Upload-only permits no repositories; access-only needs at least one.
New repositories are not automatically included: rerun and select explicitly.

## Batching and partial results

For each selected entry, repository grants read its current access (all pages),
merge the selected repositories and send **one batch write**. This preserves
existing explicit grants, including non-owned repositories not selected this run.
If the access read fails or is incomplete, no replacement write is made.

**Do not edit repository access elsewhere during a run.** GitHub's batch endpoint
replaces the list: a concurrent change between our read and write could be lost.
There is no single batch endpoint across all entries. Access-only uses one write
per entry, plus reads; upload with grants uses one upload and one access write
per entry. Progress counts these writes, not discovery/read requests.

Writes stop on the first failure, without rollback or automatic retry. Completed
writes remain applied. A timed-out request (60 seconds) may have applied at GitHub
without being counted complete. Review the result before rerunning. Uploads use
the local values loaded for that run; grants read current access again.

After updating dotfiles, open a new shell or source `~/.sh.d/func.sh` to refresh
the `gh_codespace` helper's path.

## Maintenance

`github.ts` owns GitHub calls, dotenv parsing, encryption and access-list merging;
`wizard.ts` owns separate steps and operation plans; `prompts.ts` adapts Inquirer
checkboxes/menus; `gh_codespace.ts` owns process cancellation. The `gh-codespace-sync` launcher runs the entry
point with `--no-env-file`. [UX-SPEC.md](UX-SPEC.md) records the UX contract.
Dependency versions are in imports, not a shared manifest. Resource-name encoding
is casual-search obfuscation, not confidentiality. No fullscreen UI dependency.
Run through the launcher or registered command: invoking `gh_codespace.ts` with
Bun directly bypasses the private-cache setup.
