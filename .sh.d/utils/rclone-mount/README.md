# Cloud drives at login

For the dotfiles owner: `rclone-mount.sh` starts independent cloud mounts now and at user login, without interactive prompts.
Registration is **opt-in per machine**; `bootstrap.sh` does not register services.
After stowing, run this manually only on machines where you want cloud mounts:

```sh
rclone config
sh ~/.sh.d/utils/rclone-mount/rclone-mount.sh --install
```

In a new/reloaded dotfiles shell, use **`rclone-mount-install`** and
**`rclone-mount-uninstall`** for the same install/uninstall actions.
The commands are always available as `sh ~/.sh.d/utils/rclone-mount/rclone-mount.sh --install` / `--uninstall` without aliases.
Rerun install after stowing to refresh registrations and start stopped services; already-running mounts are not restarted.
On macOS, updated definitions for already-loaded jobs take effect at the next GUI login.
If install warns about an updated loaded job, log out/in before rerunning install; otherwise the loaded job can still use its old paths.

Create any of these remote names in `rclone config`; unconfigured clouds simply fail and back off.
Credentials remain in rclone's private, writable config, **not in Git**; login separately on each machine.

| Remote name | Backend to choose | Fixed mountpoint |
| --- | --- | --- |
| `onedrive` | `onedrive` | `~/Cloud/OneDrive` |
| `box` | `box` | `~/Cloud/Box` |
| `dropbox` | `dropbox` | `~/Cloud/Dropbox` |

**MediaFire has no rclone backend** and is not mounted.
Linux needs FUSE (`fusermount3` or `fusermount`); macOS uses rclone's **experimental `nfsmount`**, without an extra FUSE driver.
macOS mounting/LaunchAgent behavior needs verification on a Mac; check `rclone nfsmount --help` for command availability.
The [localhost NFS server has no authentication](https://rclone.org/commands/rclone_serve_nfs/): other local users/processes can access it, so use this path only on a trusted Mac.

**Activation:** install enables/starts unmasked Linux services and loads/starts macOS LaunchAgents without restarting running mounts or re-enabling disabled agents.
Activation failures are reported per cloud, other clouds are still attempted, and install returns an error if any activation failed.
Linux uses enabled `rclone-mount@CLOUD.service` systemd user services (no lingering required); macOS uses `local.rclone-mount.CLOUD` LaunchAgents at GUI login.
Root, unsupported OSes and unavailable systemd user managers are skipped; rerun `--install` inside the intended user session.
Outside a macOS GUI session, definitions are registered but activation is skipped; rerun install from a GUI terminal or log out/in.

**Removing old Google Drive services:** `gdrive` is no longer supported; old registrations are not stopped automatically because uploads may be pending.
Let uploads finish, run `rclone-mount-uninstall` then `rclone-mount-install` (or the explicit `--uninstall` / `--install` commands above) to remove the old service and register only supported clouds.
Until cleaned up, an old Google Drive service may keep retrying the removed command; credentials, cached files and `~/Cloud/GoogleDrive` are kept.

## Retry and recovery

Each cloud attempts immediately, then waits **1, 2, 4, 8… minutes, capped at 6 hours** between attempt starts.
A private, persistent gate survives logout/reboot and sleeps silently: no credential checks or repeated logs while waiting.
The gate resets after its last deadline is over six hours old; a successful listing alone does not reset it, so mount-start failures also back off.

**After login/config changes:** waiting services do not notice credentials until their next attempt.
To retry immediately, stop the service, remove only its state file, then start it again (replace `onedrive` for another cloud):

```sh
# Linux
systemctl --user stop rclone-mount@onedrive.service
rm -f "${XDG_STATE_HOME:-$HOME/.local/state}/rclone-mount/onedrive.state"
systemctl --user start rclone-mount@onedrive.service

# macOS: unload, clear the gate, reload
launchctl bootout "gui/$(id -u)/local.rclone-mount.onedrive"
rm -f "$HOME/Library/Application Support/rclone-mount/onedrive.state"
launchctl bootstrap "gui/$(id -u)" "$HOME/Library/LaunchAgents/local.rclone-mount.onedrive.plist"
```

## Status and opt-out

**Status/logs:** Linux: `systemctl --user status rclone-mount@onedrive.service` and `journalctl --user -u rclone-mount@onedrive.service`.
macOS: `launchctl print "gui/$(id -u)/local.rclone-mount.onedrive"` and `~/Library/Logs/rclone-mount/onedrive.log`.
During backoff, a running service may be sleeping rather than mounted; an unsafe or unwritable state directory can still fail at the supervisor's 30-second safety interval.

**Opt out:** Linux: `systemctl --user mask --now rclone-mount@onedrive.service`; the installer respects masks.
macOS: `launchctl disable "gui/$(id -u)/local.rclone-mount.onedrive"`, then `launchctl bootout "gui/$(id -u)/local.rclone-mount.onedrive"`; registration does not re-enable it.
Generated definitions are updated only when marked as ours; foreign files and symlinks are left untouched with an error.

**Uninstall:** `rclone-mount-uninstall` stops/unloads the helper's services before removing its generated definitions.
It preserves credentials, retry state, caches, logs and mount folders; let pending uploads finish first.
Reinstall remains opt-in and requests activation immediately; it does not clear backoff or override existing Linux masks/macOS disables.

Linux removes only the helper's `default.target.wants` links and template; custom enablement, overrides and masks are not removed.
macOS uninstall requires a terminal in your GUI session and validates the legacy `launchctl list` format, failing closed on unknown output or command errors.
This macOS uninstall path also needs runtime verification on a Mac; `local.rclone-mount.*` labels are reserved for this helper—do not reuse them for other jobs.

**Data safety:** these are live cloud files, not offline copies; deletes propagate remotely.
Writes use local per-cloud VFS caches; allow uploads to finish before logout/stopping, keep pending caches, and avoid duplicate mounts of the same remote.
The cache has no hard size cap and macOS logs have no built-in rotation; a hung but still-running rclone is not health-checked.

## Source layout

`rclone-mount.sh` is the public entrypoint used by aliases and generated services; keep that path stable.
It loads only the modules needed for the selected command; sourcing a module never registers services or starts mounts.

| Source | Responsibility |
| --- | --- |
| `lib/common.sh` | Cloud names/folders and error reporting |
| `lib/retry.sh` | Persistent exponential gate, state validation and interruptible waiting |
| `lib/mount.sh` | Credential preflight, cache paths and foreground rclone execution |
| `services/manage.sh` | Manual lifecycle preconditions and platform dispatch |
| `services/definitions.sh` | Generated-file ownership, validation and atomic updates |
| `services/systemd.sh` | Linux user-service definition, registration, activation and safe removal |
| `services/launchd.sh` | macOS LaunchAgent definition, registration, activation and safe removal |

The entrypoint composes these modules: mounting calls the retry gate before any credential check;
service management loads one native adapter and never loads the mount flow.
Platform adapters share generated-file safety helpers but do not depend on one another.
The dispatcher calls `cloud_names()` from `lib/common.sh` and passes that list to the selected adapter,
alongside the entrypoint path (install) or user ID (uninstall); uninstall also includes retired clouds for cleanup.
Adapters do not read a shared cloud-list global.
