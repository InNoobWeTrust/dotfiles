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
| `dev_workspace devtunnel [host] [REPO]`        | Host SSH port 22 via Dev Tunnel (mimics `devtunnel host`). |
| `dev_workspace devtunnel login [REPO]`         | Authenticate Dev Tunnel inside container (mimics `devtunnel user login`). |
| `dev_workspace devtunnel connect [REPO]`       | Connect to Dev Tunnel from host (mimics `devtunnel connect`). |
| `dev_workspace devtunnel ssh [REPO] [-p PORT]` | Connect via SSH to container port (default: 2222). |
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
- If an adjacent `dev_workspace.json` is present, it will be used as a local override when `--config` is omitted.

## Container template
- Image: `mcr.microsoft.com/devcontainers/base:ubuntu`; writable REPO bind at `/workspace`.
- Requests 2 CPUs, 4 GiB memory, 4 GiB total memory+swap, and 512 PIDs.
- Requests a 256 MiB `/tmp` tmpfs with `noexec,nosuid,nodev`.
- Forwards port 2222 for local SSH access.
- No privilege, added capabilities, or extra mounts; Docker default networking.
- Effective container controls are not inspected or verified; these requests are not sandbox certification.

## Setup inside the container
- Static config selects the `vscode` user and disables environment probing.
- JSON post-create installs both:
  1. Official standalone **VS Code CLI** (`code`) at `~/.local/bin/code`.
  2. Official **Microsoft Dev Tunnels CLI** (`devtunnel`) at `~/.local/bin/devtunnel`.
  3. Preconfigures **OpenSSH server** (`sshd`) on port 22 with `vscode` password/key authentication.
- `--dotfiles-repository` is `https://github.com/InNoobWeTrust/dotfiles`.
- `--dotfiles-install-command` is the executable repository file `bootstrap.sh`.

## Modes: Full VS Code vs Lightweight Devtunnel SSH

- **Full VS Code mode** (`dev_workspace tunnel`):
  Runs `code tunnel` inside the container. Ideal for connecting via desktop VS Code or `vscode.dev` when you want extensions, remote debugging, and GUI.
- **Lightweight Devtunnel mode** (`dev_workspace devtunnel`):
  Hosts SSH port 22 through Microsoft Dev Tunnels. Ideal for terminal apps (iTerm2, Alacritty, Kitty, WezTerm) without extension overhead or heavy Electron memory usage.
  - On client machine: `dev_workspace devtunnel connect` (or `devtunnel connect dt-<hash>`)
  - SSH in any terminal: `dev_workspace devtunnel ssh` (or `ssh -p <port> vscode@127.0.0.1`)

## Slurm Cluster Tunnels (`dev_slurm.sh`)

For HPC / Slurm clusters where node storage and memory are constrained:

| Command | What it does |
| ------- | ------------ |
| `dev_slurm tunnel [host] [REPO]` | Submit full VS Code tunnel batch job (runs `code tunnel`). |
| `dev_slurm tunnel auth` | Interactive PTY shell for authenticating VS Code credentials. |
| `dev_slurm tunnel stop` | Cancel running VS Code tunnel batch job. |
| `dev_slurm devtunnel [host] [REPO] [PORT]` | Submit lightweight Devtunnel batch job for SSH (port 22). |
| `dev_slurm devtunnel auth` | Interactive PTY shell for authenticating Devtunnel credentials. |
| `dev_slurm devtunnel connect [REPO]` | Connect to Dev Tunnel from client machine. |
| `dev_slurm devtunnel stop` | Cancel running Devtunnel batch job. |
| `dev_slurm status`                         | Check running tunnel batch jobs.                             |
| `dev_slurm stop`                           | Cancel all active tunnel batch jobs.                         |
| `dev_slurm completion [SHELL]`             | Generate shell autocompletion script (bash or zsh).          |

## Autocompletion
Both utilities provide built-in autocompletion for themselves:
- **`dev_workspace completion [bash|zsh]`**: Emits full Zsh/Bash completion scripts matching all commands, subcommands, and flags.
- **`dev_slurm completion [bash|zsh]`**: Emits completion scripts for Slurm tunnel commands.
- **Automated caching**: `.sh.d/completion.sh` automatically caches the generated completions into `$XDG_CACHE_HOME` and only re-executes if the underlying script file is updated (`-nt`).

## Shell functions
- `func.sh` exposes `dev_workspace()` and `dev_slurm()`. (Functions use `_`; aliases use `-`).

## File locations

| Path                             | Purpose                                                          |
| -------------------------------- | ---------------------------------------------------------------- |
| `.sh.d/utils/dev_workspace.ts`   | Standalone executable containing the unified tunnel workspace CLI. |
| `.sh.d/utils/dev_slurm.sh`       | Slurm batch job runner for VS Code tunnel and Devtunnel.          |
| `.sh.d/func.sh`                  | Shell functions autoloaded via `.shrc`.                           |

## Tests
- No test file is present; earlier focused tests used the real script with external executable fixtures and were removed.
