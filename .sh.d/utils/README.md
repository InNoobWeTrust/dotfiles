# `dev_workspace` development workspace commands

## Commands
- Requires Bun, Git for implicit repository discovery, and Docker for workspace commands.
- Run with `bun --no-env-file`; Commander 15.0.0 is the only external runtime import, which Bun may fetch/cache.
- Devcontainer commands use `bunx --bun --package @devcontainers/cli@0.89.0 devcontainer`.

| Command                          | What it does                                      |
| -------------------------------- | ------------------------------------------------- |
| `dev_workspace prepare [REPO]`    | Print unchanged adjacent config; no writes/Docker. |
| `dev_workspace up [REPO] [--config /path/to/devcontainer.json]` | Create/resume; optionally use an explicit config. |
| `dev_workspace status [REPO]`     | Print Docker's state string or `absent`.           |
| `dev_workspace stop [REPO]`       | Stop without removing the container.              |
| `dev_workspace login [REPO]`      | Authenticate interactively inside the container.  |
| `dev_workspace tunnel [REPO]`     | Run the remote tunnel in the foreground.          |
| `dev_workspace help [COMMAND]`    | Show help.                                        |

## Repository resolution
- Explicit REPO must be an existing directory; it is canonicalized with realpath.
- Omitted REPO uses `git rev-parse --show-toplevel` and fails loudly outside Git.
- Paths must suit Docker bind-mount syntax; mount delimiters are not validated.

## Configuration
- Default: adjacent static `dev_workspace.json`; nothing is generated or cached.
- Edit the fixed `name` (`dev-workspace`) and other settings directly, or copy the file and pass `--config`.
- `.devcontainer/devcontainer.json` and `.devcontainer.json` in REPO are ignored unless named by `--config`.
- Explicit configs pass unchanged, without parsing or compatibility validation.
- Custom configs need not supply template limits, user, mount, or VS Code setup; none are guaranteed.
- `prepare` prints unchanged adjacent JSON bytes; the official CLI resolves literal `${localWorkspaceFolder}`.

## Container template
- Image: `mcr.microsoft.com/devcontainers/base:ubuntu`; writable REPO bind at `/workspace`.
- Requests 2 CPUs, 4 GiB memory, 4 GiB total memory+swap, and 512 PIDs.
- Requests a 256 MiB `/tmp` tmpfs with `noexec,nosuid,nodev`.
- No privilege, added capabilities, extra mounts, or forwarded ports; Docker default networking.
- Effective container controls are not inspected or verified; these requests are not sandbox certification.

## Setup inside the container
- Static config selects the `vscode` user and disables environment probing.
- JSON post-create installs the official standalone VS Code CLI for Linux x64/arm64 at `~/.local/bin/code`.
- The hook reuses an existing executable; network access is required and post-create is not skipped.
- `--dotfiles-repository` is `https://github.com/InNoobWeTrust/dotfiles`.
- `--dotfiles-install-command` is the executable repository file `bootstrap.sh`.
- Dotfiles are not a custom JSON field or clone lifecycle hook; bootstrap and installed binaries are not verified live.

## Lifecycle
- `stop`/`status`/`login`/`tunnel` match the exact `dev-workspace.repo` canonical-path label.
- No match prints `absent`; multiple matches refuse; `stop` stops without removing.
- `up` delegates creation/resume to the official CLI without parsing output or verifying retained IDs.
- Failed setup never auto-removes the container.

## Remote access
- `login`/`tunnel` run inside the matched container via the official CLI with inherited stdio; stopped containers may fail.
- Both run `/home/vscode/.local/bin/code tunnel` with `VSCODE_CLI_USE_FILE_KEYCHAIN=1`.
- `login` adds `user login`; `tunnel` adds `--accept-server-license-terms` and a deterministic `dw-` name.
- Authenticate interactively, then keep the tunnel foreground; custom configs must supply that user/path.
- Install and authenticate OpenCode manually in the remote terminal if wanted; the wrapper never installs it or copies credentials.

## Output and exit codes
- Official output and errors are inherited unchanged; `status` prints Docker's state string.
- Exit codes: 0 for success/help/absent; Commander-native for argument errors; 1 for wrapper errors; child status for delegation.
- Queries have a five-second timeout; foreground commands have no wrapper timeout.

## Shell function
- `func.sh` exposes `dev_workspace` and forwards every argument to the standalone script.
- Returns the child's status without exiting the shell; fails loudly for an unreadable script or missing `bun` in `PATH`.

## File locations

| Path                             | Purpose                                                          |
| -------------------------------- | ---------------------------------------------------------------- |
| `.sh.d/utils/dev_workspace.ts`    | Standalone executable containing the entire utility.             |
| `.sh.d/utils/dev_workspace.json`  | Static devcontainer config `up` passes to the official CLI.       |
| `.sh.d/func.sh`                   | Shell wrapper `dev_workspace()` autoloaded via `.shrc`.           |

## Tests
- No test file is present; earlier focused tests used the real script with external executable fixtures and were removed.
