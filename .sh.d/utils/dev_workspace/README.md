# Development workspaces

Use `dev_workspace` from the host to manage a development container and run Tailscale SSH or a VS Code tunnel inside it.
It needs Bun and Podman or Docker; Git is needed when REPO is omitted.
[Shared session conventions](../shared/README.md) describe repository selection and transported workers.

| Command | Behavior |
| --- | --- |
| `dev_workspace prepare [REPO]` | Print embedded/adjacent config unchanged, without a container engine or writes. |
| `dev_workspace up [REPO] [--config PATH]` | Create/resume using embedded config or an explicit file. |
| `dev_workspace status [REPO]` | Print the selected engine's container state or `absent`. |
| `dev_workspace stop [REPO]` | Stop without removing the container. |
| `dev_workspace {tailscale\|tunnel} [host] [REPO]` | Foreground worker in the selected container; defaults to host. |
| `dev_workspace tailscale ssh [REPO]` | Connect from a Tailscale device to `vscode@ts-<repo-hash>`. |

## Runtime and engine selection

The shell entrypoint uses `bun --no-env-file`; Commander 15.0.0 is the sole external runtime import and may be fetched/cached.
Devcontainer commands use `bunx --bun --package @devcontainers/cli@0.89.0 devcontainer`.

Run on the host to share its engine.
Each operation checks installed Podman and Docker for this repository's container and uses its owning engine; duplicate workspaces across engines fail without changing either container.
For new workspaces, reachable Podman takes priority, then Docker; unreachable engines are reported and skipped, and if neither is reachable the command fails.

`up` passes the resolved executable to the official CLI with `--docker-path`; status/stop/session commands use the same resolution.
No manual engine selection is needed, and a failed action never retries on another engine.
Engines have separate containers and image stores; no socket service or global `DOCKER_HOST` change is needed for local Podman CLI use.

Compose configurations still require a compatible Compose provider.
Podman compatibility and rootless limits depend on your configuration.

## Configuration and bootstrap

Without `--config`, an adjacent `dev_workspace.json` overrides the embedded template; `up` writes a temporary config and cleans it on exit.
Docker bind-mount delimiters in repository paths are not validated.

The default container is `mcr.microsoft.com/devcontainers/base:ubuntu`, with `vscode` user, writable REPO at `/workspace`, 2 CPUs, 4 GiB memory/total swap, 512 PIDs and a 256 MiB `noexec,nosuid,nodev` `/tmp` tmpfs.
It has no privileged mode, added capabilities, local SSH forwarding or extra mounts; effective runtime controls are not certified by this tool.

Devcontainer CLI installs these dotfiles using `install.sh` once after initial creation; it runs `bootstrap.sh` and the shared VS Code installer.
Restart does not reinstall tools; pre-seeded/custom environments must provide Pixi, both Tailscale binaries and the `vscode` account.
Native credentials are not automatically mounted from the host; recreating a container loses its state unless you supply persistent storage.

> [!WARNING]
> Authenticated container/cluster access must be verified in your target environment. See the [Tailscale SSH guide](../dev_tailscale/README.md) for rootless SSH and cleanup constraints; site/network policy may prevent access.

## Local Distrobox + Kubernetes

After syncing host Pixi tools, run `distrobox-kind-setup` in a normal host shell.
It checks Podman, Distrobox, kind, rootless/cgroup-v2 support and both config files, then assembles `main-box` and creates kind cluster `local` if absent.
It uses stowed configs under `${XDG_CONFIG_HOME:-$HOME/.config}`, falling back to configs next to the shell directory; alternatively pass `distrobox-kind-setup /path/to/dotfiles/.config`.

Existing instances are not replaced or reconfigured; failures stop setup without deleting already-created resources.
It does not install tools, enter the box or change host services/settings.
Then use `distrobox enter main-box` and `kubectl --context kind-local get nodes`.

[Utility index](../README.md)
