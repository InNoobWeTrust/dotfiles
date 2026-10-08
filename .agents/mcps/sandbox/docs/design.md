---
audience: MCP operators and package maintainers
purpose: Container ownership, isolation, cleanup and operational trade-offs
scope: Docker runtime and session ownership; excludes host quotas and UI presence detection
---
# Ownership and isolation

| Decision | Reason and consequence |
|---|---|
| One container per acquire; no sharing | Conversations do not inherit another session's state |
| Single owner per container | Token plus calling session; no capability grant or share workflow |
| In-memory ownership per MCP process | No persisted tokens or adoption of user containers; reconnect creates a new ownership domain |
| Container-side deadline | A crashed MCP cannot keep workloads alive merely by leaving Docker running |
| Direct constrained Docker runtime | Arbitrary devcontainer `initializeCommand` can execute on the host; no repository configs or hooks evaluated |

## Ownership flow

```text
caller → acquire → container handle → exec (auto-extends deadline) → release
MCP disappears → last deadline → supervisor exits → container auto-removed
```

`exec` extends the deadline to cover the command wall-time, then resets the inactivity expiry after
completion. Expired callers acquire a fresh container; there is no renew path. Graceful close drains the
current command before removal, bounded by its declared deadline; queued new work is rejected before drain.

## Effective defaults

| Setting | Default | Boundary |
|---|---|---|
| CPU | 1 CPU bandwidth | Aggregate container CFS quota, not reserved cores |
| Memory / memory+swap | 512 MiB / 512 MiB | No additional permitted swap |
| PIDs | 128 | Container cgroup process/thread accounting |
| Scratch `/tmp` and `/workspace` (no host bind) | 64 MiB each | Bounded tmpfs; nosuid/nodev; **not noexec** — enables deliverable test execution |
| Root filesystem | Read-only | Workspace bind and tmpfs are separate mounts |
| Workspace | Absent → clean tmpfs; present → bind mount | `ro` default; `rw` requires explicit `access` |
| Network | None | `bridge` is explicit opt-in |
| Exec user | MCP process UID/GID; root falls back to 1000 | Preserves bind-mount permissions without chown |
| Capabilities | All dropped | No new privileges; Docker default seccomp retained |
| Logs / restart | None / no | Output captured only through bounded exec streams |
| Command time / output | 120 s / 4 MiB combined | Overflow or deadline destroys this container |
| Inactivity expiry | 900 s (`idleSeconds`) | Automatic; exec resets it; max 86400 s |

Control tmpfs at `/run/agent-sandbox` is `noexec`, `0700`, root-only: the supervisor writes the deadline
file there. All settings are verified against `docker inspect` before any workload starts.

## Limits that remain

- **Trusted host components:** MCP process and Docker daemon have host authority; containers receive no socket, host secrets, or inherited environment. Explicitly mounted workspaces may contain secrets.
- **Image trust:** local images are operator-selected; this is not a defense against kernel/container escapes.
- **Writable workspace:** writes are persistent and not rolled back on release.
- **Command disruption:** timeout or output overflow destroys the container; all pending work on it is affected.
- **Clock and availability:** deadline expiry depends on daemon scheduling and clock stability; VM suspension or daemon outage delays cleanup.
- **Creation crash window:** abrupt server loss between `docker create` and supervisor startup leaves a `created`-state orphan whose watchdog has not run. No startup sweep adopts another instance's containers. An operator can inspect containers labeled `sandbox.package=sandbox`, confirm the creating MCP process has exited, and remove only the exact orphan ID; do not prune all labeled containers while other instances are active.

## Relationship to host tools and dev_workspace

Host sandbox tools (`sandbox_ro/pure/rw`) run via Bubblewrap or sandbox-exec against host files and are
not affected by container operations. The existing
[dev_workspace utility](../../../../.sh.d/utils/dev_workspace/dev_workspace.ts) provides persistent
developer environments with repository configs and dotfile provisioning; this package deliberately does not
adopt its containers or invoke its hooks.

## Sources

- [Docker resource constraints](https://docs.docker.com/engine/containers/resource_constraints/)
- [Docker run controls](https://docs.docker.com/reference/cli/docker/container/run/)
- [Dev Container lifecycle hooks](https://containers.dev/implementors/json_reference/)
