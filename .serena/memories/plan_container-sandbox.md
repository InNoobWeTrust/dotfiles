---
kind: plan
status: ready-for-user-acceptance
topic: container-sandbox
---
# Container sandbox delivery

Revision 2, user correction: migrate the existing host MCP into .agents/mcps/sandbox, retaining sandbox_ro/pure/rw and their schemas/results/limits. Add only container_acquire/exec/release. Remove unpublished attach/status/renew sharing interface; one session owns each opaque container handle. Exec automatically extends lifetime, then resets inactivity expiry after completion; expired callers acquire a fresh container. Workspace optional: absent means a clean bounded writable scratch environment, present means explicit ro/rw bind. Scratch must support executing built deliverables, so remove noexec only for container scratch (keep nosuid/nodev/private root control). Local image selection retained for different Linux distributions; no automatic image pulls or configuration hooks. Existing executable mcp-sandbox points to the new unified server; old source is moved, not duplicated or shimmed. Update only current documentation references plus .agents/.gitignore. User autonomous authority continues; no commit/global config modifications.

Revised locked tree .agents/mcps/sandbox/{src/{host,contracts,process,docker,manager,server}.ts,tests/{manager.test,e2e}.ts,README.md,docs/{design,acceptance}.md,package.json,tsconfig.json,.gitignore}; .local/bin/mcp-sandbox and current host-budget reference; old container-sandbox path removed by exact file migration. Contracts: ContainerManager acquire(AcquireInput,Owner):Promise<ContainerView>, exec(ExecInput,Owner):Promise<ExecResult>, release(token:string,Owner):Promise<{released:boolean}>,close():Promise<void>,sweep():Promise<void>. ContainerView {container:string,containerId:string,imageId:string,workspace?:string,access:'ro'|'rw',network:'none'|'bridge',budgets:AcquireInput['budgets'],expiresAt:string}. AcquireInput workspace optional, idleSeconds replaces leaseSeconds (default900,max86400); runtime ContainerSpec includes instance and idleSeconds. ExecInput container:string,command:string,wallTimeMs120000,maxOutputBytes4194304. Runtime signatures otherwise preserved, automatic expiry internal. Independent UX and safety/compatibility review required on revised product; prior reviews do not prove revision.
## Initial unpublished prototype — superseded by revision 2 above

Integration adjustments: execution follows MCP process's non-root UID/GID (root fallback 1000) to preserve bind permissions without chmod/chown. E2E filename is tests/e2e.ts, run through Bun's normal runtime because this test runner cannot resolve versioned selectors; normal actual server/client imports are retained. 22 critical unit tests and a full real Docker E2E pass; independent review corrections ongoing.

Completion evidence: repeated actual stdio/Docker E2E pass, 22 units/113 assertions, strict TypeScript and links pass, independent package-label query empty. Product/UX and Security reviewers cleared blockers after corrective rechecks and dialogue relay; source-only reviewer sign-off explicitly distinguished from main's executed proof. Creation-before-start orphan window documented with exact-ID operator recovery; no cross-instance sweep. Final human acceptance separate; no commit, global enablement or existing-container changes.

User authorizes autonomous design, package implementation, disposable bounded E2E tests and independent multi-perspective review. No commits/global config/existing-container changes. Memory backend Serena; directory .serena/memories.

## Locked scope

Only new .agents/mcps/container-sandbox: src/{contracts,process,docker,manager,server}.ts, tests/manager.test.ts, tests/e2e.ts, README.md, docs/{design,acceptance}.md, package.json, tsconfig.json, .gitignore. Concrete DTOs in contracts.ts. Existing sandbox/dev_workspace untouched. Tools acquire/attach/exec/status/renew/release, opaque session-bound leases; explicit attach for sharing. New container by default. Idle is not departure. Container-side expiring root-owned deadline survives abrupt MCP loss; graceful close removes only instance-owned containers. No arbitrary devcontainer configs/hooks, pulls, builds or daemon socket mounts. Strict resources, nonroot exec, read-only root, explicit workspace access/network.

Integration scope addition: .agents/.gitignore narrowly allows mcps/container-sandbox to be tracked; other MCP package directories remain ignored. Existing ignore-by-default policy would otherwise hide the requested standalone deliverable.

## Phases

- phase_container-sandbox_01.md: runtime and bounded process adapter.
- phase_container-sandbox_02.md: ownership manager and critical tests.
- Main: MCP adapter, docs, live E2E, independent security/UX challenge and corrections.

## Iteration contract

Native bounded iterations, not unattended shared-workspace CLI loop. PASS requires critical tests + real stdio/Docker tests for isolation, resource enforcement, expiry, sharing/refcounts, output/deadlines, crash/graceful cleanup; no remaining feature containers; independent security/UX reviewers without release blockers. FAIL permits only scoped reversible fixes; UNVERIFIED blocks release. Stop on unavailable Docker, violated isolation, unsafe action or oscillation. No stress/exhaustion/global prune/unrestricted execution/budget raises. Durable tests only E2E and important ownership logic. Product decisions/evidence in package docs, execution tracking here.

## Revision 2 executed proof — 2026-10-09

29 critical manager tests / 139 assertions passed; repeated actual legacy-launcher stdio/Docker E2E passed for all six tool registrations, host validation/result contracts, clean executable workspace, explicit bind permissions, session separation, automatic command extension/idle refresh/expiry/reacquire, effective kernel budgets, timeout/output destruction, SIGKILL fallback and graceful close. Host core exact-baseline comparison (apart from server injection/profile relocation), actual-source strict TypeScript with resolved SDK/Zod major declarations and minimal Bun ambient shim, relative links, and git diff --check passed. Independent Docker query found no sandbox.package=sandbox containers. Old container-sandbox empty directories removed. UX source review PASS; Security/Compatibility review and cross-perspective relay pending. No host execution success claimed from nested Seatbelt tests; final direct host check belongs to user acceptance after reconnect.

Final convergence: independent UX and Security/Operations/Compatibility source-only PASS with zero MustShip findings on the unified six-tool product. Clarified already-local default image in discovery/consumer docs, host responses remain top-level, only clean scratch is tmpfs, and no environment/socket option is implied. Withdrew unsupported bridge-prefix compatibility suggestion and false missing-state cleanup assumption; exact network matching and truthful unknown state retained. Corrected reviewer misstatement: never-started containers cannot run the watchdog and need exact-ID operator recovery; no automatic removal claimed for that narrow crash window. Current-artifact repeated unit/Docker E2E, static preservation/type/link checks and independent zero-container query passed. Ready for final human acceptance; no commit/config change/restart/user-work overwrite.

## Code-quality follow-up

User397 approves the public interface and requests linters/formatter, readable code and internal team code review. Approved separate unit phase_sandbox_code_cleanup.md preserves all public and runtime contracts while cleaning existing source files. Primary may add package-local biome.json and quality scripts/documentation with ephemeral major-versioned Biome, without committed node_modules. Release requires lint/format, type/critical tests and Docker E2E plus independent maintainability and lifecycle review. No commit, global configuration changes, or unrelated governance edits.
