---
kind: phase
status: complete
topic: sandbox-revision
---
# Simplified ownership unit

Basis plan_container-sandbox.md revision2. WRITE ONLY .agents/mcps/sandbox/src/manager.ts and tests/manager.test.ts; main migrates directory/contracts first. Export ContainerManager with locked signatures in plan. No sharing, renewal/status tools or grant maps. Opaque crypto32byte tokens bound to session; each acquire independent. Authorize after queue wait; expiry cannot resurrect. Serialize per-container exec/release/sweep. Extend deadline before exec by max(idleSeconds,ceil(wallTimeMs/1000)+5); when normal exec completes reset idle to now+idleSeconds with verified runtime deadline first. Preserve completed exec streams/results if resetting fails; report runtime_error/error rather than throw away side effects. Destroyed container cannot exec; expired/missing error simply acquire fresh. release idempotent; wrong session denied, remove failure token retained for retry. Acquire/close and initializing-sweep races protected; close drains in-flight work, removes all owned handles, rejects queued work. Cleanup failures tracked and retryable without fake success. Sweep checks time not UI-idle. Critical tests only these ownership/expiry/failure/serialization races; safe promises in deferred tests, no Bun pending reject matcher blocking setup. READ contracts and phase; RUN NONE/no Docker/subagents/installs. Stop contract defect, no invented files/interfaces. Output taskcomplete/files/caveats.
