# Global Instructions Across Harnesses

| Goal | Prerequisite | Boundary |
|---|---|---|
| Load the same user instructions in every project, including fresh repositories | Install these dotfiles with the existing Stow bootstrap | Instructions guide the model; they do not enforce tool permissions |

## One Source, Native Entry Points

Maintain [the canonical instructions](../../AGENTS.md) once at `~/.agents/AGENTS.md`. Each supported harness discovers its own global file, which links to the canonical source; no instruction file needs to be added to each repository.

| Harness | Default global entry point | Adapter |
|---|---|---|
| OpenCode V2 | `~/.config/opencode/AGENTS.md` | Relative symlink |
| Claude Code | `~/.claude/CLAUDE.md` | Relative symlink |
| Codex CLI | `~/.codex/AGENTS.md` | Relative symlink |
| Gemini CLI | `~/.gemini/GEMINI.md` | Relative symlink |
| Antigravity | `~/.gemini/GEMINI.md` | Same symlink as Gemini CLI |
| Kilo Code | `~/.config/kilo/AGENTS.md` | Relative symlink; verify support in the installed CLI/extension |
| Hermes | `~/.hermes/SOUL.md` | Preserve personality; ask the model to read the canonical file before acting |

**Shared path resolution:** Resolve `rules/`, `skills/`, and documentation paths in the canonical instructions against `~/.agents/`, not the current repository or the harness entry point's directory.

**Hermes limitation:** Hermes automatically loads `SOUL.md`, but does not document a global `AGENTS.md` slot or automatic include here. Its bootstrap relies on the model reading the referenced file; it is not equivalent to directly loading the canonical contents.

## Installation and Overrides

Use the repository's existing [bootstrap](../../../bootstrap.sh) to install the adapters with Stow. Relative links work both inside this checkout and after installation; do not overwrite conflicting user files to force installation.

- **Custom homes:** `XDG_CONFIG_HOME` changes OpenCode's config location; `CODEX_HOME` changes Codex's home; `HERMES_HOME` changes Hermes's home. Install the respective adapter in that location if customized.
- **Codex override:** A non-empty `AGENTS.override.md` in Codex's home replaces its `AGENTS.md`; inspect it before concluding the shared instructions are active.
- **Local context:** Project instruction files remain project-specific and can change how the model interprets shared instructions. User-global files are context, not immutable policy.
- **Version support:** Documentation describes current harness behavior. Verify installed versions, particularly Kilo surfaces and Antigravity variants.

## Verification

**Installation check:** Install the adapters into a temporary home with Stow and confirm each instruction entry point reads the canonical contents from a fresh repository outside the dotfiles tree. Check Hermes's bootstrap reference separately.

**Runtime check:** Start each installed harness in that fresh repository and inspect its loaded context using its documented context view, where available. Files resolving correctly proves installation, not that a particular harness/version loaded them; an agent merely claiming to have loaded them is not sufficient evidence.

**Execution behavior:** Prefer compatible sandboxes, but explicit approval of a bounded operation also covers native shell execution when sandboxing is unsuitable; no separate tool-choice approval is needed. Use the shell directly for a known mismatch, or explain an observed mismatch and retry the approved operation with the same scope and a timeout, rather than stopping at the sandbox failure. This does not authorize new effects, larger budgets, disabling security checks or bypassing mandatory isolation or higher-priority restrictions.

## Shared Sandbox Tools

The existing sandbox MCP exposes three tools with a required `command`, optional absolute `workdir`, and optional invocation-scoped `limits`. All use non-login shells and inherit the environment; set command-local variables with `env NAME=value command` or explicitly invoke another shell when needed.

| Tool | Workspace writes | Network |
|---|---|---|
| `sandbox_ro` | Denied | Allowed |
| `sandbox_pure` | Denied | Denied |
| `sandbox_rw` | Allowed in the resolved workdir only | Allowed |

**Directory discovery:** An explicit workdir wins. Otherwise each call requests client MCP roots: one existing local directory is used, multiple or unusable roots require an explicit workdir, and unsupported/empty roots fall back to the server's launch directory. A failed roots request stops execution rather than guessing; results report the directory and whether it was explicit, client-declared, or inferred.

**Inference boundary:** The launch directory is inherited process context, not proof of the active agent workspace. Specify `workdir` when uncertain, particularly before writable execution; no parent-process inspection or workspace caching is used.

**Example:** `sandbox_pure({command: "git status --short"})` uses directory discovery. Add `workdir: "/absolute/project/path"` to select the target explicitly; macOS scratch writes must use `$TMPDIR`, not hard-coded `/tmp`.

**Migration:** The old generic `sandbox` tool and its mode/login/shell/env arguments are removed. OpenCode grants the exact actions `sandbox_sandbox_ro`, `sandbox_sandbox_pure`, and `sandbox_sandbox_rw`; reconnect the MCP server through the harness to refresh its tool catalog without restarting unrelated services.

### ACI Pass

- **Result:** PASS.
- **Main risks:** Ambiguous workspace discovery, inferred directories widening the wrong writable scope, and stale tool permissions/catalogs.
- **Interface upgrades:** Command, optional workdir and invocation budgets; fixed isolation modes and non-login execution, explicit ambiguity errors, per-call roots discovery, disclosed defaults, and exact permission names.

### Resource budgets (prlimit / ulimit)

Filesystem/network restrictions do not limit resource consumption. Each tool also applies inherited CPU, per-file size, file-descriptor, and core-dump limits, plus supervisor-controlled elapsed-time and output budgets; these are not aggregate RAM, process-tree, or disk quotas.

**Escalation:** Investigate a boundary failure, explain the proposed change, and obtain human permission before raising budgets through the optional `limits` object. Overrides apply only to that invocation; the MCP applies them without deciding human approval or silently retrying.

**Execution contract:** Commands are synchronous; the supervisor attempts to stop remaining children in the command's process group on exit or budget breach and reports cleanup failures. Stopping does not roll back previous side effects, and deliberately detached descendants are not guaranteed to be contained.

See [Sandbox Resource Budgets](./details/sandbox-resource-limits.md) for defaults, platform limitations, structured results, and failure interpretation.

### Isolated Linux checks

Use `container_acquire`, `container_exec`, and `container_release` for an isolated Linux workload rather than treating host `ulimit` as a memory or process-tree quota. Acquisition defaults to no network or host mounts; a read-only workspace mount is explicit, and commands automatically refresh the container's idle expiry.

**Approval boundary:** Writable host mounts, network access, and increased budgets need scoped human approval. Release only your own returned handle; failed acquisition exposes no usable handle and the server retains exact owned cleanup targets for retries. See the [sandbox package](../../mcps/sandbox/README.md) for enforced defaults and runtime requirements.

## Cross-Harness Delegation

### Periodic wake-ups

For “check periodically” requests, use [Periodic Progress Checks](../../skills/subagent-dispatch/references/periodic-checks.md). The workload stays in tmux/screen or its distributed scheduler; prefer a bounded native background command with completion notification for sleeps and simple shell checks. Do not launch a subagent just to wait or relay command output.

**Capability boundary:** synchronous `sleep` resumes the current waiting turn when the tool returns. To continue other work meanwhile, the harness must deliver a background completion notification to the parent. A detached sleep, log update, or synchronous external delegate alone does not schedule a new parent turn. Verify the selected tool's notification behavior before promising background monitoring; if unavailable, offer synchronous checking or report the limitation.

**Timing and lifetime:** notifications may queue while the parent is busy, so cadence is approximate. Shutdown, disconnection, and restart persistence are not implied. Checkpoint the monitoring owner and next action, report lost monitoring, and never confuse persisted state with an active wake-up. Background commands require explicit timeouts, retained output, and cancellation or bounded expiry; they do not relax workload lifecycle or sandbox rules.

### External worker boundaries

The [Delegate MCP](../../mcps/delegate/README.md) exposes two stable tools. `delegate_status({})` reports inspected configuration and refusal reasons; `delegate_run({harness: "opencode", prompt: "Inspect the named file without edits", workdir: "/absolute/project/path"})` starts one bounded turn only for a selectable harness.

**Readiness boundary:** An executable or shell alias is not an account/provider configuration. Startup and `delegate_status({refresh: true})` use supported CLI inspection commands, never a model prompt; `configured` is not proof of valid billing, quota, credentials, or backend reachability. Unknown readiness is not selectable, and a changed working directory can require fresh inspection.

**Authority boundary:** Delegation is not a sandbox. The child inherits the environment, accounts and native permissions; its prompt must name allowed reads, writes, commands, network, and stop conditions. Obtain human approval before `permissionMode: "bypassPermissions"`; do not infer authority from a tool being callable.

**Lifetime boundary:** Time and output caps attempt process-group cleanup but do not bound token spend or provide hard filesystem, RAM, PID or storage isolation. Nested delegation has a depth guard, not a security boundary; closing the MCP connection does not cancel a running turn. Use the [worker contract](../../skills/subagent-dispatch/references/worker-contract.md) and verified isolation for resource-sensitive or recursive work.

## Official References

- **Standards:** [AGENTS.md](https://agents.md/) and [Agent Skills](https://agentskills.io/) describe shared formats, not one universal global-instruction discovery mechanism.
- **OpenCode:** [Global instructions](https://opencode.ai/v2/docs/instructions).
- **Claude:** [User memory and instruction files](https://code.claude.com/docs/en/memory).
- **Codex:** [Instruction discovery and overrides](https://developers.openai.com/codex/guides/agents-md).
- **Gemini:** [Global context files](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/gemini-md.md).
- **Antigravity:** [Global rules](https://antigravity.google/docs/rules/).
- **Kilo:** [Global custom instructions](https://kilo.ai/docs/customize/custom-instructions).
- **Hermes:** [Context files and global SOUL.md](https://hermes-agent.nousresearch.com/docs/user-guide/features/context-files).
