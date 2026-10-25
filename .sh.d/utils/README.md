# Shell utilities

For dotfiles users: choose a utility below for setup, commands and safety notes.
Each utility keeps its implementation and documentation in its own directory; this page is the index, not a combined manual.

| Utility | Use it for | Requirements |
| --- | --- | --- |
| [Cloud mounts](rclone-mount/README.md) | Optional login mounts; `rclone-mount-install` / `rclone-mount-uninstall` | rclone, Perl; Linux FUSE/systemd or macOS GUI (experimental NFS) |
| [Tailscale SSH](dev_tailscale/README.md) | Foreground SSH access in the current environment | Bash, `tailscale`, `tailscaled` |
| [VS Code tunnel](dev_tunnel/README.md) | Foreground VS Code access in the current environment | Bash, standalone `code` CLI |
| [Slurm sessions](dev_slurm/README.md) | Schedule and manage development services on compute nodes | Bash, Slurm; service binaries on compute nodes |
| [Workspaces](dev_workspace/README.md) | Container lifecycle and remote development sessions | Bun, Podman or Docker; Git for implicit REPO |
| [Agent computer](agent_computer/README.md) | Browser-automation desktop | Podman or Docker; host `curl` (`jq` optional) |
| [Codespaces sync](gh-codespace-sync/README.md) | Interactive `gh codespace-sync` configuration | Bun, GitHub CLI |
| [Shared session conventions](shared/README.md) | Repository identity, worker layering and shell integration | Used by the development-session utilities |

**Cloud mounts are opt-in per machine.** Bootstrap does not register them; installation only registers startup services, and mounts begin at the next login.
Missing credentials back off exponentially up to six hours; see the cloud utility's guide for supported providers, platform caveats and recovery.

## Standalone maintenance helpers

| Helper | Purpose |
| --- | --- |
| [install-blesh.sh](install-blesh.sh) | Install a checksum-pinned upstream ble.sh build; used by bootstrap. |
| [setup_user.sh](setup_user.sh) | Provision a remote user over an existing root SSH connection; run `--help` before use. |
| [stow-prune.sh](stow-prune.sh) | Preview or remove obsolete, matching Stow links before restowing. |

### Obsolete Stow links

Preview from the repository with `sh .sh.d/utils/stow-prune.sh --source "$PWD" --target "$HOME"`;
add `--apply` to remove matching dangling links. Bootstrap runs this before Stow, and host Perl is required even if Stow runs in an isolated Pixi environment.

Only absent-source links with the exact repository-to-target dotfile mapping are eligible.
Valid/foreign links, files, directory symlinks and Stow-ignored paths stay untouched; no directories are removed.
Traversal stays within current managed top-level roots, including orphaned nested directories; `--root NAME` adds a former top-level root.

Preview filenames are escaped. Do not run concurrently with Stow, checkout or path renames: checks are conservative, not atomic protection against hostile filesystem changes.
An error stops bootstrap before Stow; earlier removals are reported and are not rolled back.
