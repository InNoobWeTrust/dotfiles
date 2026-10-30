---
audience: Maintainers of this MCP package
purpose: Explain the delegation design, the limits it enforces, and why each choice was made
scope: Internal design and operating limits; usage lives in ../README.md
---
# Design

## What this server is

A translator for external AI subagents, not an orchestrator. Two stable tools
discover configured workers and run a bounded task through a selected CLI,
returning what it printed. It has no queue, retries, or session resumption;
oversized output is retained in private cache files rather than lost at a response limit.

```
main agent ──MCP stdio──▶ delegate server ──argv──▶ harness CLI ──▶ model
                            │  inspect / refresh      (own process group,
                            │  refuse unknown          own credentials)
                            ▼
                      stdout/stderr, exit code,
                      duration, resolved workdir
```

## Subagent discovery and selection

Initialization instructions and tool descriptions identify this as an external
AI subagent route. The main agent chooses external workers or native subagents
by task suitability, capabilities, interface needs and observed availability,
without a fixed harness or provider priority. A configured route is not a
comparative speed result or proof that an agent will select the tool.

Calls need complete context and action boundaries because
the external worker receives no parent chat, follow-up or resumable session.

Current `delegate_status` is authoritative for readiness. Initialization
instructions show startup availability only: refresh updates the snapshot, not
the instructions already sent to the client.

## Decisions

| Decision | Reason and consequence |
|---|---|
| Stable `delegate_status` and `delegate_run` | The caller learns one interface and gets selectable IDs, capabilities and refusal reasons from status. Installation or login changes can be refreshed without changing the catalog. The earlier unpublished per-harness tools are removed without shims. |
| Keep native argument mapping inside the registry | CLI-specific flags are irreducible, but do not need to become separate tools. A run selects a registry ID only after readiness inspection. |
| Pass the prompt as one trailing argv element | Every supported harness accepts it, so one input schema serves all of them. Consequence: no shell involved at all (`shell: false`), and a prompt cannot be reinterpreted as syntax. The cost is the 64 KiB argv limit. |
| Refuse a `prompt` or `model` that starts with `-` | A trailing positional is only safe if the harness treats it as one. Some harnesses read the prompt from a value-taking flag instead, and a model value can be misread as an option that escalates authority (`--yolo`) or replaces the task (`--version`, which would print a version and exit 0 while the call reported success). Both fields are refused at the schema, before any process starts; there is no `--` delimiter that all twelve CLIs agree on. |
| `promptFlag` per harness | `agy` reads the prompt from `--print`, `gemini`, `qwen`, `hermes` from `-p`/`-z` and `amp` from `-x`; placing that flag immediately before the prompt keeps it the last argv element while leaving nothing between the flag and its value. The server calls `assertRegistryInvariants()` while loading, and `assertArgv()` on the arguments of every call it is about to run, so a malformed entry — a missing prompt flag, a flag in the wrong position, a duplicated one, a prompt that is not last, or a permission mode that disagrees with `buildArgs` — is refused instead of producing one odd command line during a real turn. |
| `opencode run --standalone` | Plain `run` can attach to an already-running OpenCode server, which would run the turn outside this process group and outside the inherited `DELEGATE_DEPTH`. `--standalone` forces a private server so the wall-clock kill and the depth cap still apply. |
| One shared input schema | Shared fields retain harness-specific mappings. AGY always uses `--mode accept-edits --dangerously-skip-permissions` for every `permissionMode`, including read-only assignments; `agySandbox` independently adds `--sandbox`. This user-authorized profile is not hard read-only isolation. Harnesses that lack a flag simply do not get one; `amp` has no model flag, so passing `model` to it is refused rather than dropped. Preview size is server-owned, not an input. |
| Refuse an unsupported permission mode | Silently dropping `--dangerously-skip-permissions` would turn a deliberate escalation into a silent downgrade of the caller's intent, and dropping it upward would run something the caller did not ask for. Failing loudly keeps the tool description honest about what each harness can do. |
| Detached process group, killed as a group | Harness CLIs spawn their own children. Signalling only the direct child leaves those running, still holding tokens and file handles. `spawn(..., { detached: true })` plus `process.kill(-pid, …)` reaps the whole tree, with SIGTERM then SIGKILL after a grace period. |
| Reap the group even when the parent exits 0 | A harness can background a child with its streams redirected and then exit successfully. Settling on the parent's exit would release the concurrency slot while that child keeps working unsupervised, so the group is reaped on clean exit too. |
| Poll for the group's disappearance instead of scheduling a fixed `SIGKILL` | A delayed kill outliving its run is dangerous: process-group ids are reused, so a stale signal can hit an unrelated group. `stopGroup()` therefore signals `SIGTERM`, polls `kill(-pid, 0)` every 50 ms, escalates to `SIGKILL` only if the group is still there after the grace period, and keeps polling until it is gone — once the group is observed gone, nothing further is sent. If it is still there after a short drain the call gives up rather than signalling forever, and reports `ok: false` with the reason, so a surviving process is never reported as a clean turn. |
| Truncate output on UTF-8 boundaries | The byte budget can land mid-character. Decoding the cut sequence produced a replacement character larger than the bytes it represented, so the returned output exceeded its own advertised budget; `decode()` drops the dangling bytes instead. |
| stdin closed (`stdio: ["ignore", …]`) | `codex exec "<prompt>"` hangs indefinitely when stdin is an open pipe with no writer (openai/codex#20919). Closing stdin makes "no interactive input available" immediate instead of a stall. |
| Separate output preservation from presentation | Raw streams are incrementally written to owner-only XDG cache files before preview reduction; memory holds only bounded prefixes. Output size never kills the worker. Files are flushed and closed before paths are returned; storage failure explicitly stops capture and the turn. |
| Only wall-clock expiry ends work for a budget | A delegated turn is billable. The timeout still ends the run and returns partial output; an inline-preview allowance must not decide answer length or execution lifetime. |
| Depth carried in `DELEGATE_DEPTH`, capped at 2 | A delegated harness inherits the same MCP configuration, so it could delegate again. Two hops is deep enough for useful fan-out; the third is refused, which stops a runaway chain without needing session identity. |
| Concurrency refused at 6 | Each turn is a real model session on the user's account. Refusing the seventh call says so, instead of queueing work the caller did not ask to wait for. |
| Depth sent as an environment variable | It is set on the child process, so any harness that happens to launch this server again inherits the count without this server having to know which harness launched it. |
| Prompt redacted in the reported argv | The returned argv is what a caller would paste into a bug report or log. Keeping the prompt out of it prevents a whole task from leaking into transcripts while staying debuggable. |
| Server shutdown leaves in-flight turns alone | A turn that has already been paid for should be allowed to finish. Cutting it off loses the work while the delegated agent may still be spending for the rest of its turn. |
| Shutdown guard deferred by one microtask (`lifecycle.ts`) | The stdio transport's `close()` invokes `onclose` synchronously, and that handler asks for the shutdown again. A plain `closing ??= transport.close()` evaluates the right-hand side before the cache holds anything, so every shutdown re-enters the next one until the stack runs out. Deferring the call puts the guard in place first. This is defence in depth: the resulting `RangeError` is thrown inside an `async` function, so it surfaces only as a swallowed rejection, and the process still exits 0. `tests/lifecycle.test.ts` fails without the deferral. |
| `DELEGATE_DEPTH` counted from the parent, reported in `depth` | `delegate_status` reports the server's own depth and the depth a delegated turn would get, so a nested agent can see its remaining budget without guessing. |

## Effective defaults

| Setting | Value | Where it comes from |
|---|---|---|
| Wall-clock limit | 900000 ms, maximum 7200000 | `wallTimeMs`, default and cap in `contracts.ts` |
| Inline preview | 65536 bytes combined, counting JSON escapes | Fixed `INLINE_OUTPUT_BYTES` in shared/output.ts; not a tool input or generation limit |
| Prompt size | 65536 bytes | `MAX_PROMPT_BYTES`; refused before any process starts |
| Concurrent turns | 6 | `MAX_CONCURRENT` in `server.ts` |
| Chain depth | 2 | `MAX_DEPTH`; the third hop is refused |
| Readiness inspection | Aggregate 8000 ms per harness; at most 2 concurrently | CLI inspection only, no model prompt; cleanup grace may extend elapsed time |
| SIGTERM grace | 2000 ms, then SIGKILL, 250 ms drain | `GRACE_MS` and `DRAIN_MS` in `execute.ts` |

## Output cache

`../../shared/output.ts` writes both raw streams incrementally using standard filesystem APIs;
synchronous chunk writes bound memory without an unbounded pending-write queue.
`execute.ts` owns lifecycle, process teardown, and final cache flush/close.

Each run has a unique 0700 directory and 0600 stream files under the absolute
XDG cache home, or HOME/.cache when XDG is absent/relative. Every run retains
both paths, including successful small and empty output.

There is no automatic expiry or output-size kill threshold. Disk exhaustion or
IO failure yields `capture_failed` and incomplete files, never a clean result;
upstream harness/model generation limits remain outside this MCP's control.

## Working directory

An explicit `workdir` always wins. Otherwise the client's MCP roots are queried
on every call, because a long-lived client can switch workspaces while this
server keeps running; more than one root is an error rather than a guess. With
no roots capability, the server's own working directory is used. The result is
`realpath`-resolved and checked to be a directory, so a harness never starts in
something that cannot be entered.

**Project context:** OpenCode, Codex and Cursor configuration can depend on the
working directory. When it differs from startup, dispatch repeats the applicable
inspection before spawning a turn; unknown readiness refuses the run and the
ephemeral result does not replace the startup snapshot.

## Readiness evidence

`detect.ts` resolves executable files, not shell aliases. `readiness.ts` performs
supported non-model CLI inspections; only successful, bounded, parseable evidence
can make an executable selectable.

| Inspector | Evidence required |
|---|---|
| AGY | Clean `/usage` exit with a percentage from 0% to 100% in stdout and no authentication prompt; labels and layout are ignored |
| Claude | `auth status` JSON explicitly says `loggedIn: true` |
| Codex | `login status` reports the recognized signed-in state; custom-provider proof remains limited |
| OpenCode V2 | Private API GETs join an inspectable integration connection to a non-disabled provider and an enabled, non-deprecated model |
| Other registry IDs | No proven automatic inspector; safe, harness-specific unknown reason, no model probe |

**Fail closed:** A timeout, truncated output, missing required evidence, or failed
refresh cannot retain selectable stale readiness. Reasons are
fixed prose, never raw inspection output or credentials; a configured result
does not guarantee billing, future quota or access to a caller-selected model.

**AGY inspection:** `--print /usage` is a CLI-served report that can refresh
account data without submitting a model prompt. Inspections disable automatic
updates and direct the CLI log file to the platform's null device.
The check only needs one percentage from 0% to 100% (including decimals) in stdout;
new model labels, extra rows, column changes and reset timestamps do not affect readiness.

An unsigned AGY 1.3.3 can still wait for authentication with stdin closed.
The inspection deadline cancels that wait; no authentication URL or quota values
are returned to the caller. Zero remaining quota is still configuration evidence,
not permission to use a model without quota.

**Avoid recursion:** Every inspection subprocess inherits
`DELEGATE_INSPECTION=1`. A Delegate MCP started by that subprocess resolves
presence but runs no inspection probes and reports no selectable harnesses;
the marker is an advisory initialization guard, not security isolation.

**Refresh and failure:** Refreshes are single-flight and runs wait for a pending
refresh. Failed turns set both envelope `ok: false` and the MCP error flag while
retaining partial run data; validation/readiness refusals have no run data.

## The registry

`registry.ts` is the only place that knows a harness's command line. Each entry
declares its binary names, whether it takes a directory flag, the permission
flags it understands, and a `buildArgs` that always ends with the prompt.
Adding a harness needs verified argument mapping and a dedicated, documented
non-model readiness strategy with critical tests. Help or version output alone
cannot enable dispatch; unsupported inspectors stay unknown.

Permission modes per harness, as of the first release:

| Harness | `default` | `acceptEdits` | `bypassPermissions` |
|---|---|---|---|
| `claude`, `codex`, `agy`, `gemini`, `droid`, `cursor` | yes | yes | yes |
| `qwen` | yes | yes (`auto-edit`) | yes (`yolo`) |
| `crush`, `hermes`, `kilo` | yes | no | yes |
| `opencode` | yes | yes (`--auto`) | no |
| `amp` | yes | no | no, and `model` is refused too |

## Limits that remain

- A delegated harness is a separate process with the server's environment. It is
  bounded by budgets and by its own permission flags, not by this server.
- There is no retry. A failed turn is reported as failed so the caller decides.
- Detection is a startup snapshot until explicit refresh. Inherited environment
  changes require restarting this server, not unrelated services.
- The depth guard is advisory. It reads `DELEGATE_DEPTH` from the environment, so
  it bounds ordinary delegation chains and nothing more.
- The registry maps each CLI's own flags, taken from that CLI's published command
  line. When a CLI renames or drops one of those flags, delegation for that
  harness fails with the CLI's own error until the mapping is updated.
- Version remains a nullable compatibility field and is not probed. Inspectable
  configuration is not a guarantee of future account reachability, quota or access to a
  caller-selected model; only returned native model lists are allowlists.

## Sources

- `claude --help`, `agy --help`, `opencode run --help` on the machine that
  produced this package
- openai/codex#20919 for the stdin hang that motivates closing stdin
- google-gemini/gemini-cli `packages/cli/src/config/config.ts` for `-p` taking
  one argument and for `--approval-mode` spelling `auto_edit`
- QwenLM/qwen-code `config.ts` and `top-level-options.ts` for `--approval-mode`
  choices `plan|default|auto-edit|auto|yolo`; the hyphenated `auto-edit` is the
  accepted spelling there, and `auto_edit` is rejected before normalisation
- [OpenCode V2 CLI](https://opencode.ai/v2/docs/cli) and [OpenAPI](https://opencode.ai/v2/openapi.json) for service/private server inspection and integration/provider/model schemas
- [Claude CLI reference](https://code.claude.com/docs/en/cli-reference) for `auth status`
- [Codex authentication](https://developers.openai.com/codex/auth) for `login status`
- [AGY headless mode](https://antigravity.google/docs/cli/headless/) and [/usage](https://antigravity.google/docs/cli/commands/usage/) for CLI-served account reports; quota output verified with AGY 1.3.3
- [AGY troubleshooting](https://antigravity.google/docs/cli/troubleshooting/) for `AGY_CLI_DISABLE_AUTO_UPDATE`
- `@modelcontextprotocol/sdk@1` stdio transport, whose `close()` calls `onclose`
  synchronously
- `../sandbox/` for the response envelope, launcher shim, and process supervision
  patterns this package reuses
