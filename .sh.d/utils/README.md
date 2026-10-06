# `dev_workspace` development workspace commands

## Commands
- Requires Bun, Git for implicit repository discovery, and Docker for workspace commands.
- Run with `bun --no-env-file`; Commander 15.0.0 is the only external runtime import, which Bun may fetch/cache.
- Devcontainer commands use `bunx --bun --package @devcontainers/cli@0.89.0 devcontainer`.

| Command                                       | What it does                                      |
| --------------------------------------------- | ------------------------------------------------- |
| `dev_workspace prepare [REPO]`                 | Print unchanged adjacent config; no writes/Docker. |
| `dev_workspace up [REPO] [--config PATH]`      | Create/resume; optionally use an explicit config. |
| `dev_workspace status [REPO]`                  | Print Docker's state string or `absent`.           |
| `dev_workspace stop [REPO]`                    | Stop without removing the container.              |
| `dev_workspace tunnel [host] [REPO]`           | Run VS Code tunnel in foreground (default: `host`). |
| `dev_workspace tunnel login [REPO]`            | Authenticate VS Code tunnel inside container.      |
| `dev_workspace tailscale login [REPO]` | Authenticate interactively and save the repository's identity. |
| `dev_workspace tailscale [host] [REPO]` | Run integrated Tailscale SSH in foreground using saved login. |
| `dev_workspace tailscale ssh [REPO]` | SSH directly from a Tailscale device; no local tunnel proxy. |
| `dev_workspace completion [SHELL]`            | Generate shell autocompletion script (bash or zsh). |
| `dev_workspace help [COMMAND]`                 | Show help.                                        |

## Repository resolution
- Explicit REPO must be an existing directory; it is canonicalized with realpath.
- Omitted REPO uses `git rev-parse --show-toplevel` and fails loudly outside Git.
- Paths must suit Docker bind-mount syntax; mount delimiters are not validated.

## Configuration
- Default: built-in embedded configuration. When `--config` is omitted, `up` writes a temporary configuration to `/tmp` and automatically cleans it up on exit.
- Optional custom config: pass `--config /path/to/devcontainer.json` to use an explicit configuration.
- `prepare`: prints the embedded JSON configuration directly to stdout (useful for piping: `dev_workspace prepare > my-config.json`).
- If `.sh.d/utils/dev_workspace/dev_workspace.json` is present beside the entrypoint, it will be used as a local override when `--config` is omitted.

## Container template
- Image: `mcr.microsoft.com/devcontainers/base:ubuntu`; writable REPO bind at `/workspace`.
- Requests 2 CPUs, 4 GiB memory, 4 GiB total memory+swap, and 512 PIDs.
- Requests a 256 MiB `/tmp` tmpfs with `noexec,nosuid,nodev`.
- No local SSH port forwarding; integrated Tailscale SSH uses tailnet port 22.
- No privilege, added capabilities, or extra mounts; Docker default networking.
- Effective container controls are not inspected or verified; these requests are not sandbox certification.

## Setup inside the container
- Static config selects the `vscode` user and disables environment probing.
- **VS Code CLI:** The one-time dotfiles installer calls the shared `vscode_cli_install()` function used by `install-vscode-cli`, without the alias's interactive shell reload. It installs the official standalone `code` at `~/.local/bin/code` only if absent from PATH; staging uses XDG cache and is cleaned on exit. No suitable Conda package has been verified.
- **Tailscale:** The dotfiles bootstrap syncs `.pixi/manifests/pixi-global.toml`, which declares and exposes both `tailscale` and `tailscaled` from Conda-forge. There is no separate static download or system service installation.
- **Lifecycle:** Devcontainer CLI runs the dotfiles installer during initial setup, after post-create. There are no VS Code install hooks in post-create or post-start, and restarting a container does not reinstall tools. Pixi must be available: bootstrap installs it when provisioning Stow, but skips that installation if Stow already exists; pre-seeded/custom environments must supply Pixi themselves.
- **Command lookup:** Login/host runners prepend `${PIXI_HOME:-$HOME/.pixi}/bin` and `~/.local/bin` to PATH. Pixi exposures take precedence over older standalone binaries; a custom PATH remains available after these directories.
- No OpenSSH server, SSH password setup, or privileged Tailscale service is installed.
- `--dotfiles-repository` is `https://github.com/InNoobWeTrust/dotfiles`.
- `--dotfiles-install-command` is `.sh.d/utils/dev_workspace/install.sh`: run `bootstrap.sh`, load shared functions, and invoke `vscode_cli_install`. Installer logic lives only in `.sh.d/func.sh`.

## Connection modes

- **VS Code:** `dev_workspace tunnel` runs `code tunnel` for desktop VS Code or `vscode.dev`, extensions, and debugging.
- **Terminal SSH:** `dev_workspace tailscale` runs Tailscale’s integrated SSH server for a normal SSH client on another Tailscale device. No separate OpenSSH server or local tunnel proxy is needed.

## Tailscale inside the devcontainer

**Login, then host:** Run `dev_workspace tailscale login [REPO]` and open the URL shown in your terminal. Login exits after saving authentication; then run `dev_workspace tailscale [REPO]` and leave it running. From another device on the same tailnet, use `dev_workspace tailscale ssh [REPO]`; policy must allow network port 22 and Tailscale SSH as `vscode`.

**Isolation and cleanup:** Both binaries run as `vscode` using userspace networking, without a TUN device or added capabilities. Ctrl-C, termination, or loss of the command's stdin connection stops its children, removes disposable files under `${XDG_CACHE_HOME:-$HOME/.cache}/dev-workspace`, and releases its identity lock. Authentication remains in XDG state, so restart does not require another login unless credentials expire or are revoked.

**Identity:** Each repository has one persistent identity named `ts-<repo-hash>`. Login and host take the same atomic directory lock, preventing concurrent daemons from using that identity. `tailscale up --ssh` enables the daemon's integrated SSH server on fixed tailnet port 22.

**Existing/custom containers:** Update the container's live Pixi manifest from the dotfiles manifest and run `pixi global sync`, or rerun the updated dotfiles `bootstrap.sh` to perform both steps. Sync alone uses the existing live manifest, not this repository's copy. Custom configs must supply both binaries and the `vscode` account. The rootless daemon only serves its own account; do not authorize switching to root or other users.

> [!WARNING]
> Existing containers retain previous packages and SSH settings until you change or rebuild them. Rootless integrated SSH was checked against Tailscale 1.102.5 source, but the Pixi manifest now resolves the package version. Real authenticated sessions on your container/cluster have not been verified; version or site restrictions may still prevent use.

## Slurm Cluster Tunnels (`dev_slurm.sh`)

For HPC / Slurm clusters where node storage and memory are constrained:

| Command | What it does |
| ------- | ------------ |
| `dev_slurm tunnel [host] [REPO]` | Submit full VS Code tunnel batch job (runs `code tunnel`). |
| `dev_slurm tunnel login` (or `auth`) | Interactive VS Code account login in a Slurm allocation. |
| `dev_slurm tunnel stop` | Cancel running VS Code tunnel batch job. |
| `dev_slurm tailscale login [REPO]` | Interactive allocation; display login URL directly and save identity. |
| `dev_slurm tailscale [host] [REPO]` | Submit rootless integrated SSH using saved login; no batch-log login flow. |
| `dev_slurm tailscale stop` | Cancel Tailscale jobs with full-job signalling and cleanup. |
| `dev_slurm status`                         | Check running tunnel batch jobs.                             |
| `dev_slurm stop`                           | Cancel all active tunnel batch jobs.                         |
| `dev_slurm completion [SHELL]`             | Generate shell autocompletion script (bash or zsh).          |

**Cluster requirements:** Bootstrap the dotfiles/Pixi manifest on shared cluster storage to install and expose both `tailscale` and `tailscaled`; after updating the live manifest, `pixi global sync` refreshes them. VS Code still requires the official CLI (`install-vscode-cli`); no installer runs inside a Slurm job. Obtain site permission for outbound tailnet traffic and remote access. Login and host allocations must see the same persistent XDG state directory, usually on shared home storage. The SSH account is your current cluster user, not `root`; policy must allow it.

**Stable identity:** Run `dev_slurm tailscale login [REPO]` before submitting `dev_slurm tailscale host [REPO]`. SSH uses the stable name `ts-<repo-hash>` regardless of job ID; one allocation at a time may use that repository's identity. Host fails with a login/readiness hint if saved authentication is missing, expired, or awaiting approval.

## Authentication and state locations

All paths below are inside the container for `dev_workspace`, and on shared cluster storage for `dev_slurm`. `${XDG_STATE_HOME:-$HOME/.local/state}` is the state root; private directories use mode 700 and newly created files inherit a restrictive umask.

| Utility | Tailscale identity | VS Code CLI state |
| ------- | ------------------ | ----------------- |
| `dev_workspace` | `dev-workspace/tailscale/ts-<repo-hash>/state` | `dev-workspace/vscode-cli/` |
| `dev_slurm` | `dev-slurm/tailscale/ts-<repo-hash>/state` | `dev-slurm/vscode-cli/` |

- **VS Code credentials:** Both login and host pass `--cli-data-dir` and enable the CLI's file keychain; `token.json` lives in that directory. The account is shared across repositories within each utility's environment. Old default-location credentials are not moved or deleted; sign in once using the utility's login command.
- **Tailscale credentials:** Login configures SSH and saves the device identity; host reconnects without initiating login. Stop/cancellation preserves state; deleting it while stopped means the next login creates a new identity, and the old device may need removal from your tailnet.
- **Lock recovery:** `active.lock/owner` records the host, PID, and (for Slurm) job ID. Normal exits release the lock; after SIGKILL or node failure, verify the owning session and daemon are gone before removing `active.lock`. Locks are never automatically stolen based on a PID from another node.
- **Persistence boundary:** Stopping a container preserves its state, but deleting/recreating it does not unless your custom configuration mounts persistent storage. No host bind mount is added automatically.

## Autocompletion
Both utilities provide built-in autocompletion for themselves:
- **`dev_workspace completion [bash|zsh]`**: Emits full Zsh/Bash completion scripts matching all commands, subcommands, and flags.
- **`dev_slurm completion [bash|zsh]`**: Emits completion scripts for Slurm tunnel commands.
- **Direct loading**: `.sh.d/completion.sh` sources each available utility's Bash or Zsh completion asset directly, without starting the CLI or writing a completion cache.

## Shell functions
- `func.sh` exposes `dev_workspace()` and `dev_slurm()`. (Functions use `_`; aliases use `-`).

## File locations

| Path                             | Purpose                                                          |
| -------------------------------- | ---------------------------------------------------------------- |
| `.sh.d/utils/dev_workspace/dev_workspace.sh` | Shell entrypoint; checks Bun and delegates arguments/status using `exec`. |
| `.sh.d/utils/dev_workspace/dev_workspace.ts` | Bun implementation: command parsing, container lifecycle, and remote sessions. |
| `.sh.d/utils/dev_slurm/dev_slurm.sh` | Slurm shell entrypoint; wires backend commands, job helpers, help, and completions. |
| `.sh.d/utils/dev_slurm/{vscode,tailscale}.sh` | Backend workers and their Slurm submission, login, and cancellation commands. |
| `.sh.d/utils/dev_slurm/jobs.sh` | Shared repository hashing, cross-backend status, and cancellation. |
| `.sh.d/utils/dev_slurm/completion.{bash,zsh}` | Slurm shell-specific completion assets. |
| `.sh.d/utils/dev_workspace/install.sh` | One-time workspace dotfiles setup; reuses bootstrap and the shared VS Code installer. |
| `.sh.d/utils/dev_workspace/{vscode,tailscale}.sh` | Container session scripts loaded by the CLI and passed to `bash -c`. |
| `.sh.d/utils/dev_workspace/completion.{bash,zsh}` | Shell-specific completion assets sourced directly during shell setup. |
| `.sh.d/func.sh`                  | Shell functions autoloaded via `.shrc`.                           |

## Tests
- No test file is present; earlier focused tests used the real script with external executable fixtures and were removed.
