---
description: "Shell routing, secret protection, bounded processes and owned-resource cleanup."
globs: "*"
alwaysApply: true
trigger: always_on
---

# Execution Safety

- Load before the session's first shell command; classify every command's writes,
  network and host-context needs. Prefer native read/search/edit tools. Otherwise
  use an available compatible sandbox with the least authorized access: read-only
  and offline by default, restricted workspace/scratch writes when approved.
- Explicit approval of a bounded operation (for example, "commit and push") also
  covers scoped native shell execution when the sandbox is unsuitable, unless
  higher-priority restrictions or mandatory isolation forbid it. Tool choice is
  not a separate approval gate: use native execution directly when the mismatch
  is known, without a predictably failing sandbox attempt or duplicate approval.
- After a sandbox failure, distinguish an environment/tool mismatch from a real
  authorization or safety denial. For an already approved operation needing host
  context, briefly explain and retry through the native shell with the same scope
  and a timeout; do not merely report failure or hand the command back to the user.
  Ask only if permission is missing or effects would expand. A failure alone never
  authorizes new effects, higher budgets, or bypassing mandatory isolation; do not
  disable security checks or modify host configuration to force success.
- MCP-managed container lifecycle and engine side effects are tool operations,
  not host commands to wrap in another sandbox. Installation/download effects
  still require the applicable authority.
- Never read real `.env` values, dump environment/export state, expand secret
  values into output or log credentials. Placeholder templates, variable names
  and existence checks without values are allowed. Arrange secret entry outside
  model context; do not discover values yourself.
- Run custom scripts from approved scratch with declared ephemeral dependencies
  (`uv run --with`, `bun run`); inline custom scripts only when file tools are
  unavailable. Registry runners (`uvx`, `npx`, `bunx`) are for published packages.
  No global/system installs without explicit instruction or undeclared global
  dependencies. Package resolution never overrides network/install permission.
- Ordinary bounded commands/workers need scope, actions, concurrency, timeout
  and cleanup. Recursive-agent/process-tree, parallel fan-out or stress workloads
  additionally need verified CPU, RAM/swap, PID, storage and network bounds.
  Recursive/process-tree or stress workloads run only in constrained containers/VMs,
  not on the host. Stop on exhaustion, proliferation or lost containment.
- Bound jobs with timeouts/watchdogs even when the overall task has no total cap.
  Diagnose failures before retrying. Never touch user processes or existing
  zellij/tmux/screen sessions; manage only agent-created `agent-*` resources.
- Persistent services/watchers use tmux, then screen; otherwise run bounded
  synchronously or ask. No unmonitored `&`/`nohup`. Use `agent-*` names and
  inspectable `/tmp/agent-<name>.log` output; stop gracefully and clean owned
  resources. Simple bounded waits/checks prefer native background notifications,
  not subagents. See [Multiplexer management](references/multiplexer-management.md).
