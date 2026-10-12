---
audience: MCP operators and package maintainers
purpose: Container ownership, isolation, cleanup and operational trade-offs
scope: Container CLI runtime (Podman/Docker) and session ownership; excludes host quotas and UI presence detection
---
# Ownership and isolation

| Decision | Reason and consequence |
|---|---|
| One container per acquire; no sharing | Conversations do not inherit another session's state |
| Single owner per container | Token plus calling session; no capability grant or share workflow |
| In-memory ownership per MCP process | No persisted tokens or adoption of user containers; reconnect creates a new ownership domain |
| Container-side deadline | A crashed MCP cannot keep workloads alive merely by leaving the engine running |
| Direct constrained container CLI runtime | Arbitrary devcontainer `initializeCommand` can execute on the host; no repository configs or hooks evaluated |

## Engine selection (startup snapshot)

`detectEngine` probes `podman info` then `docker info` once at startup, each bounded to 5 s with an internal
4 MiB combined preview allowance wide enough for the engine's own response to be read in full. Only a clean
exit with no error, timeout, or omitted preview bytes selects an engine; every failed
probe is skipped with a terse name/status-only diagnostic on server stderr — raw CLI output and environment
values never leak. Both probes failing leaves the server host-only: no container tools, no container
instruction block, no manager or sweep timer. A missing engine is not a startup failure.

The probe proves CLI connectivity only, not lifecycle capability: image availability and resource
enforcement remain unverified, and acquisition keeps its fail-closed `inspect` verification. Both engines
are held to the same Docker inspect semantics; no weaker Podman normalization is assumed. The selected
engine is pinned for the process lifetime — every lifecycle operation, helper, and error message uses that
exact binary, with no hot fallback to the other engine later, including cleanup. No devcontainer
configuration participates in selection.

## Ownership flow

```text
caller → acquire → container handle → exec (auto-extends deadline) → release
MCP disappears → last deadline → supervisor exits → container auto-removed
```

`exec` extends the deadline to cover the command wall-time, then resets the inactivity expiry after
completion. Expired callers acquire a fresh container; there is no renew path. Graceful close drains the
current command before removal, bounded by its declared deadline; queued new work is rejected before drain.

Failed acquisition retains its exact allocation ID (or unique creation name) without issuing a token.
Cleanup verifies this instance's labels and confirms removal; failures stay tracked for the existing
sweep and shutdown retries. No other instance's containers are adopted or pruned.

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
| Command time | 120 s | Timeout destroys only this container; no output limit exists |
| Output capture | Fixed 64 KiB combined inline preview | Never a process limit; complete raw streams always retained in the private cache |
| Inactivity expiry | 900 s (`idleSeconds`) | Automatic; exec resets it; max 86400 s |

Control tmpfs at `/run/agent-sandbox` is `noexec`, `0700`, root-only: the supervisor writes the deadline
file there. All settings are verified against the selected engine's `inspect` before any workload starts.

## Output capture and recovery

Both host commands and container exec write every byte to private cache files before any inline preview is
derived, so output volume can neither truncate nor terminate a command. The shared capture module owns the
fixed combined 64 KiB preview, the private `$XDG_CACHE_HOME/sandbox/run-*` directories (`0700`, files `0600`),
synchronous writes with `fsync`/`close` before a path is advertised, and bounded preview decoding that never
inflates malformed UTF-8. Results report `stdoutPath`/`stderrPath`/`stdoutBytes`/`stderrBytes` ahead of the
previews so recovery metadata survives downstream client clipping; paths are null only when capture setup
failed before the command started. Previews are bounded representations only: internal engine-CLI calls
retain a wider allowance so `inspect` output still parses, and a preview that omits bytes never affects the
process or the container. Only a genuine cache failure terminates and reports explicitly — container exec
then reports `runtime_error` and destroys its container, host tools report `execution_error`.

## Limits that remain

- **Trusted host components:** MCP process and container engine have host authority; containers receive no socket, host secrets, or inherited environment. Explicitly mounted workspaces may contain secrets.
- **Image trust:** local images are operator-selected; this is not a defense against kernel/container escapes.
- **Writable workspace:** writes are persistent and not rolled back on release.
- **Command disruption:** a timeout or a genuine output-cache failure destroys the container; all pending work on it is affected. Output volume alone never does.
- **Clock and availability:** deadline expiry depends on engine scheduling and clock stability; VM suspension or engine outage delays cleanup.
- **Creation crash window:** abrupt server loss before supervisor startup, or a create request completing after cleanup has already observed absence, can leave a `created`-state orphan without a running watchdog. No startup sweep adopts another instance's containers. An operator can inspect containers labeled `sandbox.package=sandbox`, confirm the creating MCP process has exited, and remove only the exact orphan ID; do not prune all labeled containers while other instances are active.

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
