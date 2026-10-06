# Development sessions and environment adapters

Run Tailscale SSH or a VS Code tunnel **in the environment you are already using**, or let an adapter launch it in a container or Slurm job.

| Goal | Tool | Requirements |
| --- | --- | --- |
| Foreground Tailscale SSH here | `dev_tailscale` | Bash, `tailscale`, `tailscaled` |
| Foreground VS Code tunnel here | `dev_tunnel` | Bash, standalone `code` CLI |
| Container lifecycle and remote sessions | `dev_workspace` | Bun, Docker; Git for implicit REPO |
| Allocate/submit/manage cluster sessions | `dev_slurm` | Bash, Slurm; service binaries on compute nodes |

## Already inside an allocation? Start here

From the repository directory on the compute node, without ending or replacing your allocation:

```bash
dev_tailscale host        # native Tailscale up prints a login URL if needed

# Or, for desktop VS Code / vscode.dev:
dev_tunnel host           # stays in foreground
```

**Ctrl-C** stops the session and returns to your shell; it does not cancel your Slurm allocation. Use your own terminal multiplexer if you want to keep it running—these tools deliberately have no background manager, status command, or stop command.

**Explicit repository:** Use `dev_tailscale host /path/to/repo` or `dev_tunnel host /path/to/repo`. REPO must be an existing directory; commands accepting REPO use the current Git root when it is omitted and fail outside Git.

## Layering

```text
Standalone CLI ───────────────► shared foreground worker ──► installed service
Slurm adapter ──► sbatch ─────► same worker on compute node
Workspace adapter ──► exec ────► same worker inside container
```

The wrapper owns foreground execution and cleanup; the native service owns authentication. Adapters only select an environment and transport the worker. Workers are embedded in command payloads, so their source paths do not need to exist on compute nodes or inside containers.

## Commands

| Command | Behavior |
| --- | --- |
| `dev_tunnel host [REPO]` | Foreground VS Code tunnel with stable repository name. |
| `dev_slurm {tailscale\|tunnel} [host] [REPO]` | Submit a persistent `sbatch` job; defaults to host. Native authentication URLs/prompts appear in job logs. |
| `dev_slurm {tailscale\|tunnel} stop` | Cancel that service's jobs with full-job signaling. |
| `dev_slurm status` / `stop` | Inspect / cancel both services' jobs. |
| `dev_workspace {tailscale\|tunnel} [host] [REPO]` | Foreground worker in the selected container; defaults to host. |
| `dev_workspace tailscale ssh [REPO]` | Connect from a Tailscale device to `vscode@ts-<repo-hash>`. |

**Slurm requirements:** Install dotfiles and service binaries on storage visible to compute nodes; hosting must see persistent state to reuse authentication. Batch jobs have no interactive terminal: if VS Code requests an account/provider selection, run native `code tunnel user login` first in the same user environment with the same home/credential storage. Obtain site permission for outbound traffic and remote access; `dev_slurm` is for scheduling, while the standalone tools are for an allocation you already hold.

**Command lookup:** Workers prepend `${PIXI_HOME:-$HOME/.pixi}/bin` and `~/.local/bin` to PATH. Run `pixi global sync` against an updated live manifest for Tailscale, and `install-vscode-cli` for the official standalone VS Code CLI; jobs never install tools themselves.

## Authentication, identity, and cleanup

`${XDG_STATE_HOME:-$HOME/.local/state}` is the state root, in the environment where the service runs. Private Tailscale state directories use mode 700; new files inherit a restrictive umask.

| Service | Persistent state | Identity |
| --- | --- | --- |
| Tailscale | `dev-tailscale/tailscale/ts-<repo-hash>/state` | One device per canonical repository path. |
| VS Code tunnel | Native VS Code CLI credential storage (unchanged by wrappers). | `dw-<repo-hash>`. |

The repository hash is the first 16 hex characters of SHA-256 of the canonical repository path, without a trailing newline. Adapters resolve it before remote execution, avoiding identities based on a container's `/workspace` mount.

- **Native authentication:** VS Code runs `code tunnel` without overriding credential storage; you can pre-authenticate with `code tunnel user login` in the same environment. Tailscale starts its private daemon, then runs native `tailscale --socket=… up --ssh --hostname=… --timeout=5m`; saved state is reused or Tailscale prints a login URL.
- **State reuse:** Tailscale reuses credentials when the worker user, repository identity, and state root match. Containers have their own homes; host credentials are not mounted automatically.
- **Clean replacement:** Old wrapper credentials are neither migrated nor deleted. Wrapper-level login subcommands and the Slurm auth alias are removed; authenticate through the native flows instead.
- **Tailscale SSH:** Rootless userspace networking needs no TUN device, separate OpenSSH server, or privileged service. It serves the current worker account (your cluster user locally, `vscode` in the default container); tailnet policy must permit network port 22 and SSH as that account.
- **Cleanup:** Ctrl-C, SIGTERM, and SIGHUP stop Tailscale children, remove disposable files under `${XDG_CACHE_HOME:-$HOME/.cache}/dev-tailscale`, and release the identity lock. Container execution also stops on stdin disconnect; ordinary local/Slurm execution does not treat stdin EOF as termination.
- **Lock recovery:** Tailscale sessions acquire `active.lock`; `owner` records hostname, PID, and job ID when available. After SIGKILL or node failure, verify the session and daemon are gone before removing that lock; it is never automatically stolen.
- **Persistence:** Stopping/canceling preserves credentials. Recreating a container loses its state unless you supply persistent storage; no host credential mount is added automatically.

> [!WARNING]
> Authenticated container/cluster access must be verified in your target environment. Rootless integrated SSH was previously checked against Tailscale 1.102.5 source; the Pixi manifest determines the installed version, and site/network policy may still prevent access.

## Workspace lifecycle and setup

| Command | Behavior |
| --- | --- |
| `dev_workspace prepare [REPO]` | Print embedded/adjacent config unchanged, without Docker or writes. |
| `dev_workspace up [REPO] [--config PATH]` | Create/resume using embedded config or an explicit file. |
| `dev_workspace status [REPO]` | Print Docker state or `absent`. |
| `dev_workspace stop [REPO]` | Stop without removing the container. |

**Runtime:** The shell entrypoint uses `bun --no-env-file`; Commander 15.0.0 is the sole external runtime import and may be fetched/cached. Devcontainer commands use `bunx --bun --package @devcontainers/cli@0.89.0 devcontainer`.

**Configuration:** Without `--config`, an adjacent `dev_workspace/dev_workspace.json` overrides the embedded template; `up` writes a temporary config and cleans it on exit. Docker bind-mount delimiters in repository paths are not validated.

**Default container:** `mcr.microsoft.com/devcontainers/base:ubuntu`, `vscode` user, writable REPO at `/workspace`, 2 CPUs, 4 GiB memory/total swap, 512 PIDs, and a 256 MiB `noexec,nosuid,nodev` `/tmp` tmpfs. No privileged mode, added capabilities, local SSH forwarding, or extra mounts; effective runtime controls are not certified by this tool.

**Bootstrap:** Devcontainer CLI installs these dotfiles using `dev_workspace/install.sh` once after initial creation; it runs `bootstrap.sh` and the shared VS Code installer. Restart does not reinstall tools; pre-seeded/custom environments must provide Pixi, both Tailscale binaries, and the `vscode` account.

## Shell integration and source map

`func.sh` exposes all four commands as shell functions. `.sh.d/completion.sh` loads their Bash/Zsh assets directly, or use `<command> completion [bash|zsh]` to emit them manually.

| Path under `.sh.d/utils/` | Responsibility |
| --- | --- |
| `dev_tailscale/{dev_tailscale,session}.sh` | Local Tailscale CLI / transportable worker. |
| `dev_tunnel/{dev_tunnel,session}.sh` | Local VS Code CLI / transportable worker. |
| `shared/repository.sh` | Shell repository resolution and hashing. |
| `dev_slurm/{dev_slurm,sessions,jobs}.sh` | Slurm dispatch, transport, job management. |
| `dev_workspace/dev_workspace.{sh,ts}` | Bun entrypoint, container lifecycle, transport. |
| `dev_workspace/install.sh` | One-time bootstrap using shared installers. |
| `dev_*/completion.{bash,zsh}` | Shell completion assets. |
