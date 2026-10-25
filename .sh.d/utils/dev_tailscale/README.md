# Foreground Tailscale SSH

Run `dev_tailscale` in the environment you already occupy, including an existing Slurm allocation.
It needs Bash, `tailscale` and `tailscaled`; [shared session conventions](../shared/README.md) explain repository selection and adapters.

```sh
dev_tailscale host
dev_tailscale host /path/to/repo
```

The native Tailscale flow reuses saved state or prints a login URL.
Ctrl-C stops the session without canceling an existing Slurm allocation; use your own multiplexer for persistence.
Use [dev_slurm](../dev_slurm/README.md) to schedule a new job, or [dev_workspace](../dev_workspace/README.md) to run inside a container.

## Authentication and state

`${XDG_STATE_HOME:-$HOME/.local/state}` is the state root in the environment where the service runs.
Private state directories use mode 700; new files inherit a restrictive umask.
Tailscale state lives at `dev-tailscale/tailscale/ts-<repo-hash>/state`, with one device per canonical repository path.

The worker starts a private daemon, then runs native `tailscale --socket=… up --ssh --hostname=… --timeout=5m`.
Credentials are reused only when the worker user, repository identity and state root match; containers have separate homes and no automatic host credential mounts.

**Rootless SSH:** userspace networking needs no TUN device, separate OpenSSH server or privileged service.
It serves the current worker account (your cluster user locally, `vscode` in the default container); tailnet policy must permit network port 22 and SSH as that account.

## Cleanup and recovery

Ctrl-C, SIGTERM and SIGHUP stop Tailscale children, remove disposable files under `${XDG_CACHE_HOME:-$HOME/.cache}/dev-tailscale` and release the identity lock.
Container execution also stops on stdin disconnect; ordinary local/Slurm execution does not treat stdin EOF as termination.

**Lock recovery:** sessions acquire `active.lock`; `owner` records hostname, PID and job ID when available.
After SIGKILL or node failure, verify the session and daemon are gone before removing that lock; it is never automatically stolen.
Stopping or canceling preserves credentials; recreating a container loses its state unless you supply persistent storage.

> [!WARNING]
> Authenticated container/cluster access must be verified in your target environment. Rootless integrated SSH was previously checked against Tailscale 1.102.5 source; the Pixi manifest determines the installed version, and site/network policy may still prevent access.

[Utility index](../README.md)
