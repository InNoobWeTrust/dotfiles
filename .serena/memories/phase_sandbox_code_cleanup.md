---
kind: phase
status: complete
topic: sandbox-code-quality
---
# Behavior-preserving source cleanup

User authorizes package linters/formatter and internal team code review. Preserve all six MCP names, input/output schemas, defaults, instructions, session ownership, expiry ordering, error/stream semantics, host backends, profile path, resource limits and cleanup behavior. Public contract is explicitly approved; do not redesign it.

Source implementation unit: edit only existing .agents/mcps/sandbox/src/{host,contracts,process,docker,manager,server}.ts. Preserve all existing exported signatures and DTOs. Private helpers/types within these files are approved when they expose meaningful validation, capture, setup or cleanup responsibilities; no new files, dependencies, generic frameworks or class hierarchies. Replace cryptic names, compressed statements, dead branches and opaque long expressions; keep ordered effects and concurrency invariants explicit. Internal helper names may change; runtime behavior may not. Stop on a necessary behavior change or uncertain invariant and report it rather than silently fixing it.

Primary owns Biome setup (biome.json, package scripts), formatting of package files, README maintenance, type verification, critical tests and actual Docker E2E. Worker uses native reads/patch only; no RUN/network/Docker/installs/Git/subagents. Independent maintainability and lifecycle reviewers must pass the final source, not just formatter output. Existing user governance changes remain untouched. Existing tests are preserved and formatted; no extra durable verification artifacts.

Completion: Biome 2.5.15 check/lint/format gates pass without warnings; strict TypeScript on actual source/tests passes with minimal Bun ambient shim; original/current host catalogs and six validation/default responses match through actual stdio. Critical tests 29 pass/139 assertions and real Docker E2E pass after final dead-branch removal. Independent maintainability and lifecycle source reviewers converge PASS/no must-ship findings; runtime evidence is primary-executed, not reviewer-executed. Successful nested Seatbelt execution remains unavailable under outer sandbox; unchanged user-acceptance limitation. No public contract changes, commits or index manipulation.
