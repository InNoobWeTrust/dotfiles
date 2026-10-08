---
audience: Package operators and final user-acceptance testers
purpose: Reproduce verification and evaluate observable sandbox behavior
scope: Disposable local Docker tests; no host stress tests or production workload mutation
---
# Verification and user acceptance

**User acceptance pending.** Automated verification and independent release reviews are separate from
the final user-acceptance checks below.

## Run checks

From the package directory:

```sh
bun test tests/manager.test.ts
CONTAINER_SANDBOX_E2E=1 bun run tests/e2e.ts
```

The E2E suite launches the actual stdio MCP entrypoint with its normal versioned imports. It uses an
already-local image, a temporary workspace, small resource budgets, and recorded container IDs; cleanup
targets only those IDs. Docker mutations occur through the daemon and are not confined by the shell's
workspace-write policy.

| Gate | Required evidence |
|---|---|
| Ownership | Separate acquire, session-bound handle, expired handle unavailable, release cleanup |
| Isolation | Non-root exec, read-only root and workspace, no network, no host environment or Docker socket |
| Resources | Docker inspect verifies CPU/memory/swap/PIDs, bounded scratch, no restart/logging |
| Exec lifecycle | Auto-extension during command; idle reset after completion; expired → acquire new |
| Failures | Exit and streams preserved; time/output overflow reports failure and destroys only this container |
| Departure | Graceful transport close removes containers; SIGKILL relies on finite container-side expiry |
| Cleanup | All recorded test container IDs absent after completion |

## Verified evidence — 2026-10-09

Checked on macOS with Bun 1.3.11-canary.1 and Docker 29.4.0, using the existing local Ubuntu image.

| Check | Result |
|---|---|
| Critical ownership/lifecycle tests | 29 passed; 139 assertions |
| Actual `mcp-sandbox` launcher and Docker E2E | Repeated PASS: six tools, clean executable workspace, isolation, explicit bind permissions, idle extension/expiry/reacquire, timeout/output destruction, abrupt-loss fallback and graceful close |
| Host migration | Schemas, defaults and supervision match the original; only server injection and profile location changed. Real stdio catalog and host invalid-budget responses verified |
| Types and links | Strict TypeScript with resolved dependency majors and minimal Bun ambient declarations passed; relative documentation links passed |
| Code quality | Biome 2.5.15 lint, formatting and combined checks passed with warnings treated as failures; original/current host catalogs and six validation responses matched through actual stdio |
| Independent release reviews | Product/UX and Security/Operations/Compatibility PASS; source-only reviews, with executed evidence supplied by the primary |
| Internal code reviews | Maintainability and lifecycle-preservation PASS on the final cleaned source; no must-ship findings, execution evidence supplied by the primary |
| Cleanup | Independent Docker query found no remaining package-owned test containers |

Successful host-backend execution was not retested inside the outer macOS sandbox, which denies nested
Seatbelt setup. Check it directly after reconnecting during user acceptance. No CPU contention or resource
exhaustion tests were run; constraints were checked through Docker inspection and effective kernel values.
The pre-start crash window still requires exact-ID operator recovery as documented in [limits](design.md#limits-that-remain).

## Final user acceptance

1. **Connect:** configure the MCP using [README](../README.md) and confirm exactly six tools appear:
   `sandbox_ro`, `sandbox_pure`, `sandbox_rw`, `container_acquire`, `container_exec`, `container_release`.
2. **Host tools:** run `id -u; pwd` with `sandbox_ro`. Confirm the host UID, captured streams, and limits.
3. **Container defaults:** call `container_acquire` with no arguments. Confirm a `container` token,
   `containerId`, and `expiresAt` are returned. Run `id -u; pwd; ls /workspace` and expect non-root UID
   (1000 if the MCP runs as root), `/workspace` as working directory, and writable scratch.
4. **Check boundaries:** write to `/workspace`; confirm success (tmpfs). A write to `/etc` should fail
   (read-only root). Network access should be absent by default.
5. **Host workspace bind:** acquire with `{ "workspace": "<absolute disposable path>", "access": "ro" }`.
   Confirm the workspace is visible but writes fail. Acquire separately with `access: "rw"` and write a
   harmless fixture; confirm the host file exists and release does not roll back the write.
6. **Expiry:** acquire with a short `idleSeconds`; after inactivity the handle should become unavailable.
   Close the MCP connection and observe container removal; abrupt loss relies on the last reported expiry.
7. **Finish:** release all live containers; remove only your disposable workspace fixtures. Existing
   developer containers must remain untouched. Nothing is enabled globally by these tests.
