---
audience: AI-agent users and MCP operators
purpose: Spawn an external AI subagent for one bounded task
scope: Harnesses that take the prompt as one command-line argument; not a multi-agent orchestrator, not a session-resumable runner
---
# Delegate MCP

Spawn an **external AI subagent** through two stable tools: `delegate_status` discovers configured workers; `delegate_run` executes one bounded task. CLI presence alone is not readiness; startup runs no model prompt.

| Prerequisite | Notes |
|---|---|
| Bun | Resolves major-versioned MCP SDK@1 and Zod@4 imports automatically; no committed `node_modules` |
| An executable on the MCP server's `PATH` | Shell aliases are not executables and are not resolved by a non-login server |
| Inspectable account/provider configuration | Automatic inspectors: AGY, Claude, Codex, OpenCode; other harnesses report `unknown` readiness |

## Start

`mcp-delegate` is configured in `.claude/mcp.json`, `.codex/config.toml`,
`.gemini/config/mcp_config.json` and `.config/opencode/opencode.jsonc`, each launching
[`mcp-delegate`](bin/mcp-delegate) at `~/.agents/mcps/delegate/bin/mcp-delegate`
directly without a `sh -c` layer. The launcher must exist and Bun must be on
the server's inherited `PATH`; a missing launcher is a startup error, not a harness
readiness result.

Start each client from a shell that has loaded `~/.shrc`; its PATH setup includes
the `bin` directories under `~/.agents/mcps/`. Launchers use the client's exported
environment and do not source shell startup files.

To start directly from this package directory:

```sh
bun --no-env-file src/server.ts
```

## Readiness

Both tools always exist, even when no harness is selectable.

```jsonc
// Discover available harnesses; choose an id from data.harnesses
{ "tool": "delegate_status", "input": {} }
```

| State | Meaning | Selectable |
|---|---|---|
| `configured` | Supported CLI inspection found account/provider configuration | Yes; not a model-access guarantee |
| `not_configured` | Inspection found a missing login or no eligible configured models | No |
| `unknown` | No supported inspection, malformed output, or inspection failed/timed out | No |
| `missing` | No supported executable on the server's `PATH` | No |

AGY uses `agy --print /usage` (a CLI-served account report, not a model turn).
Claude uses `auth status`; Codex uses `login status`; OpenCode uses private API
inspection of integrations, providers and enabled models. Each harness gets an
aggregate eight-second inspection budget, with at most two inspections in flight;
process cleanup can extend that deadline briefly.

**No model-access guarantee:** `configured` does not test a model request or
guarantee billing, quota or access to a chosen model. AGY's `/usage` report can
refresh account data from its backend; OpenCode's catalog alone is insufficient.
Anonymous or inline-key OpenCode providers without inspectable connections stay `unknown`.

**Unknown harnesses:** `cursor`, `amp`, `droid`, `crush`, `hermes`,
`gemini`, `qwen` and `kilo` remain listed with reasons but cannot run until a
reliable inspection strategy is supported. Sign-in commands and model turns are
never used as startup probes.

**After fixing login/configuration or installing an executable:** call
`delegate_status({refresh: true})`; no tool-catalog restart is needed. Reconnect
the MCP after server code changes or changes to its inherited environment or `PATH`.

### Using AGY

Sign in interactively with `agy` once, then verify `agy --print /usage` in the
same account environment as the MCP. A report containing a percentage from 0%
to 100% enables `agy`, regardless of labels or layout. Login prompts, failed probes,
timeouts and output without a valid percentage do not.

Select `"harness": "agy"`. Omit `model` to use AGY's default, or choose a native
slug from `agy models`; that catalog is not login proof. An empty status `models`
list means no verified allowlist, not no models.

### Image generation (AGY / Codex)

`agy` and `codex` can generate images when available for the installed CLI and
account. Readiness inspection does not verify image access or headless
image-generation support. See Google's
[image-generation tool](https://antigravity.google/docs/sdk/tools/) and OpenAI's
[Codex image-generation guide](https://developers.openai.com/codex/image-generation.md).

**Before delegating:** obtain an explicit absolute output file path from the
caller and include it in the worker's prompt. Require the worker to save the
image there and return its actual absolute path, or report a capability/save
failure. `delegate_run` returns text and retained streams, not image attachments.
Existing permission, quota, billing and service-terms constraints still apply;
image capability is not authorization. Check
[Antigravity terms §6](https://antigravity.google/terms) before using a third-party
wrapper.

## Running a task

### AGY permissions

AGY cannot prompt for new permissions in `--print` mode. This integration always
passes `--mode accept-edits --dangerously-skip-permissions` for **every**
`permissionMode` value, including read-only assignments. Use AGY only with
authorization for this all-tool autoapproval profile.

```json
{ "harness": "agy", "agySandbox": true, "prompt": "Your bounded task" }
```

`agySandbox: true` independently adds `--sandbox`. **Every tool is autoapproved** —
file edits, commands, interactive website actions and MCP calls. `agySandbox: false`
or omission adds no sandbox flag and does not disable any sandbox already set in AGY
settings; it does not turn off autoapproval. `permissionMode` cannot restrict AGY's
authority. The sandbox imposes terminal restrictions; it is **not hard read-only
isolation** for native tools or MCP.

If a run is blocked, inspect retained stderr before retrying; do not silently
escalate authority.

### Dispatch

Set `workdir` unless you want the task to run in the connected agent's MCP root.

```jsonc
// Run only after status lists this harness as configured
{ "tool": "delegate_run", "input": { "harness": "agy", "prompt": "Read src/registry.ts and list every harness id it declares, one per line. Read only; no commands, edits, network or further delegation.", "workdir": "/abs/path/to/this/package" } }
// → { "ok": true, "data": { "exitCode": 0, "stdout": "amp\nagy\n…", "stop": "exited", … } }
```

The external subagent receives no parent conversation or resumable session and
cannot ask a follow-up question. Include the goal, necessary context, allowed
actions, exact paths, acceptance criteria and return format in the prompt.

## Tool reference

| Tool | Input | Result |
|---|---|---|
| `delegate_status` | optional `refresh: true` | Discover configured external subagents: readiness, native model IDs when inspectable, permission modes, refusal reasons, depth |
| `delegate_run` | `harness`, `prompt`, optional controls | Exit status, both streams, duration, resolved workdir, redacted argv, depth |

### Input fields

| Field | Default | Meaning |
|---|---|---|
| `harness` | required | CLI ID from `delegate_status().data.harnesses`; unknown or unconfigured IDs are refused |
| `prompt` | required | The whole task, as one argument. Max 64 KiB. Must not begin with `-`. |
| `workdir` | MCP root, else server directory | Absolute directory the harness runs in; supplies working directory, not filesystem isolation |
| `model` | harness default | Exact native ID; an empty inspected model list does not mean no models. Must not begin with `-`. Check `modelSupported`. |
| `permissionMode` | `default` | `default`, `acceptEdits`, or `bypassPermissions`; unsupported modes are refused. AGY autoapproves all tools for every value. |
| `wallTimeMs` | 900000 | Wall-clock limit for the whole turn (max 7200000): CLI startup, model/tool round trips, swarm coordination and synthesis. On expiry the process group is killed and partial output is returned. |
| `agySandbox` | omitted | AGY only: `true` adds `--sandbox`; does not change autoapproval. `false`/omitted adds no flag and does not disable saved AGY settings. Other harnesses refuse this field. |

### Interpreting output

Successful responses are `{ "ok": true, "data": … }`; validation/readiness
failures are `{ "ok": false, "error": … }`. A call rejected by the input schema
arrives as a text-only error rather than this envelope. Failed turns also retain
`data` (including partial output) and set the MCP error flag.

Inside `data`:

- `ok` requires a successful execution with a nonempty answer and no recognized
  AGY headless permission denial — observable execution evidence, not proof the
  task completed correctly. Check the answer.
- `outcome`: `answered`, `blocked`, `empty`, or `failed`. `blocked` and `empty`
  set the MCP error flag even on exit 0. Denial detection matches AGY's known
  stderr diagnostic; it is not a general semantic classifier.
- `stop`: `exited`, `wall_time`, `capture_failed`, `spawn_failed`.
- `truncated: true` means only the inline preview is shortened; read
  `data.stdoutPath` and `data.stderrPath` for the full original streams.
  Preview is fixed at 64 KiB combined (counting JSON escaping); callers cannot
  change the size.

**Retained streams:** Every launched run retains both cache files at
`$XDG_CACHE_HOME/delegate/run-*/{stdout,stderr}`, falling back to
`$HOME/.cache/delegate` when XDG_CACHE_HOME is unset or relative. Directories are
private (0700), files owner-only (0600). Files remain until removed, can contain
sensitive output, and have no automatic expiry. `stdoutBytes` and `stderrBytes`
count raw saved bytes.

For project-sensitive harnesses, a different `workdir` triggers fresh inspection
before launch; the result does not overwrite the server's startup snapshot.

## Costs and limits

Each call runs a real model session on the account the harness CLI is logged
into and may make many model requests before stopping. There is no monetary cap:
the wall-clock limit can end the run, not the bill. A turn that stops midway
leaves existing edits in place. `workdir` sets the starting directory; it does
not confine the harness to that directory.

- `prompt` and `model` cannot begin with `-`; both are refused at the input
  schema before any process starts.
- `bypassPermissions` drops every approval prompt for every tool the harness
  holds. Get human permission before using it.
- `cursor` is always launched with `--trust`; its `acceptEdits` and
  `bypassPermissions` modes both add `--force`.
- At most 6 turns run at once per server; a seventh call is refused, not queued.
- Delegation is two hops deep. A harness started by another delegate is refused
  from starting a third.
- Closing this server does not kill turns already in flight; they finish in their
  own process group.

See [design and limits](docs/design.md) and [verification / acceptance](docs/acceptance.md).

## Development checks

From this package directory:

```sh
bun run check        # lint, formatting and import organization; warnings fail
bun run check:fix    # apply safe fixes and format
bun run format       # format only
bun run test         # registry, detection, process and lifecycle regressions
bun run test:e2e     # drives the real MCP server against stub harness CLIs
```

Biome 2.5.15 resolves through `bunx`; no local installation or committed
`node_modules` is required. `lint` and `format:check` are available separately.
Source, tests and package JSON share the same settings. `test:e2e` is opt-in
because it spawns servers and processes; add `DELEGATE_E2E_REAL=1` for one paid
turn against the real `claude` CLI.
