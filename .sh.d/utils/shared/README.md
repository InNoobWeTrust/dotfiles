# Shared development-session conventions

For users and maintainers of [Tailscale SSH](../dev_tailscale/README.md), [VS Code tunnels](../dev_tunnel/README.md), [Slurm sessions](../dev_slurm/README.md) and [workspaces](../dev_workspace/README.md).
These conventions describe those development-session utilities, not cloud-mount supervision or the agent computer.

## Choose where to run

Already inside a Slurm allocation? Run `dev_tailscale host` or `dev_tunnel host` in that environment; use `dev_slurm` only when you want to schedule a new job.
Ctrl-C stops a foreground session and returns to your shell without canceling your allocation.
The standalone tools deliberately have no background manager, status command or stop command; use your own terminal multiplexer to keep them running.

**Repository selection:** use an explicit existing directory, such as `dev_tailscale host /path/to/repo` or `dev_tunnel host /path/to/repo`.
Commands accepting REPO use the current Git root when omitted and fail outside Git.

## Layering and identity

```text
Standalone CLI ───────────────► shared foreground worker ──► installed service
Slurm adapter ──► sbatch ─────► same worker on compute node
Workspace adapter ──► exec ────► same worker inside container
```

The wrapper owns foreground execution and cleanup; the native service owns authentication.
Adapters select an environment and transport the worker, embedding workers in command payloads so their source paths need not exist on compute nodes or inside containers.

The repository hash is the first 16 hex characters of SHA-256 of the canonical repository path, without a trailing newline.
Adapters resolve it before remote execution, avoiding identities based on a container's `/workspace` mount.
Tailscale uses `ts-<repo-hash>`; VS Code uses `dw-<repo-hash>`.

**Command lookup:** workers prepend `${PIXI_HOME:-$HOME/.pixi}/bin` and `~/.local/bin` to PATH.
Run `pixi global sync` against an updated live manifest for Tailscale, and `install-vscode-cli` for the official standalone VS Code CLI; jobs never install tools themselves.

**Credentials:** native login flows replace the removed wrapper login commands and Slurm auth alias; old wrapper credentials are neither migrated nor deleted.
Containers have their own homes: host credentials are not mounted automatically, and recreating a container loses its state unless you supply persistent storage.
Stopping or canceling a session preserves credentials.

## Shell integration and source map

[Shell functions](../../func.sh) expose all four commands; [shell completion setup](../../completion.sh) loads their Bash/Zsh assets directly.
Use `<command> completion [bash|zsh]` to emit completion assets manually.

| Path under `.sh.d/utils/` | Responsibility |
| --- | --- |
| `dev_tailscale/{dev_tailscale,session}.sh` | Local Tailscale CLI / transportable worker. |
| `dev_tunnel/{dev_tunnel,session}.sh` | Local VS Code CLI / transportable worker. |
| `shared/repository.sh` | Shell repository resolution and hashing. |
| `dev_slurm/{dev_slurm,sessions,jobs}.sh` | Slurm dispatch, scheduling defaults, transport and job management. |
| `dev_workspace/dev_workspace.{sh,ts}` | Bun entrypoint, container lifecycle and transport. |
| `dev_workspace/install.sh` | One-time bootstrap using shared installers. |
| `dev_*/completion.{bash,zsh}` | Shell completion assets. |

[Utility index](../README.md)
