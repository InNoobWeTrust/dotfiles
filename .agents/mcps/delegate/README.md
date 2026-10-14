---
audience: AI-agent users and MCP operators
purpose: Spawn an external AI subagent for one bounded task
scope: Harnesses that take the prompt as one command-line argument; not a multi-agent orchestrator, not a session-resumable runner
---
# Delegate MCP

Spawn an **external AI subagent** through two stable tools: discover configured
workers with `delegate_status`, then use `delegate_run` with a CLI harness ID.
CLI presence alone is not readiness; startup never submits a model prompt.

| Prerequisite | Notes |
|---|---|
| Bun | Resolves major-versioned MCP SDK@1 and Zod@4 imports automatically; no committed `node_modules` |
| An executable on the MCP server's `PATH` | Shell aliases are not executables and are not resolved by a non-login server |
| Inspectable account/provider configuration | Supported automatic inspectors: AGY, Claude, Codex, OpenCode; the status call explains other harnesses' unknown readiness |

## Start

`mcp-delegate` is configured separately in `.claude/mcp.json`, `.codex/config.toml`,
`.config/kilo/kilo.jsonc` and `.config/opencode/opencode.jsonc`.
All launch the package-local
[`mcp-delegate`](bin/mcp-delegate) at `~/.agents/mcps/delegate/bin/mcp-delegate`
directly, without a `sh -c` layer. This package is linked by the normal
dotfiles `./bootstrap.sh` flow, like `mcp-sandbox`;
that command installs the broader dotfiles setup, not just this MCP.

The launcher must exist at `~/.agents/mcps/delegate/bin/mcp-delegate`, and Bun must be on the
server's inherited `PATH`. A missing launcher is a startup error, not a harness
readiness result.

Start each client from a shell that has loaded `~/.shrc`: its PATH setup includes
the package `bin` directories under `~/.agents/mcps/`. The Claude shell alias
passes its separate config using `--mcp-config`.
Launchers use the client's exported environment; they do not
source shell startup files or override client environment filtering.

To start directly from this package directory instead:

```sh
bun --no-env-file src/server.ts
```

## What you get

Both tools always exist, even when no harness is selectable. Status separates
configured harnesses from missing, unconfigured, or unknown ones:

```jsonc
// 1. Inspect configuration; choose an id from data.harnesses
{ "tool": "delegate_status", "input": {} }
// Each configured entry includes permissionModes, modelSupported and models.
// Unsupported entries include a readiness state and a safe explanation.
```

### What readiness means

| State | Meaning | Selectable |
|---|---|---|
| `configured` | Supported CLI inspection found account/provider configuration | Yes; not a model-access guarantee |
| `not_configured` | Inspection found a missing login or no eligible configured models | No |
| `unknown` | No supported inspection, malformed output, or inspection failed/timed out | No |
| `missing` | No supported executable on the server's `PATH` | No |

AGY uses the CLI-served `/usage` account quota report, not a model turn.
Claude uses `auth status`; Codex uses `login status`; OpenCode uses private,
non-model API inspection of integrations, providers and enabled models.
Each harness gets an aggregate eight-second inspection budget, with at most two
inspections in flight; process cleanup can extend that deadline briefly.

**No model-access guarantee:** `configured` does not test a model request or
guarantee billing, remaining quota or access to your chosen model. AGY's report
may refresh account data from its backend; OpenCode's catalog alone is insufficient.
Anonymous or inline-key OpenCode providers without inspectable connections stay unknown.

**Unknown harnesses:** `cursor`, `amp`, `droid`, `crush`, `hermes`,
`gemini`, `qwen`, and `kilo` remain listed with reasons but cannot run through
this server until a reliable inspection strategy is supported. Sign-in commands
and model turns are never used as startup probes; raw inspection output is not
returned.

After fixing login/configuration or installing an executable, call
`delegate_status({refresh: true})`; no tool-catalog restart is needed. Reconnect
the MCP after server code changes or changes to its inherited environment or `PATH`.

### Using AGY

Sign in interactively with `agy` once, then check `agy --print /usage` in the
same account environment as the MCP. A recognized quota report enables `agy`;
login prompts, timeouts and unfamiliar output do not.

Select `"harness": "agy"` in `delegate_run`. Omit `model` to use AGY's default,
or choose a native model slug from `agy models`; that catalog is not login proof.
An empty status `models` list means no verified model allowlist, not no models.

## First delegation
### Headless web research

AGY cannot prompt for new permissions in `--print` mode. This integration always
passes `--mode accept-edits --dangerously-skip-permissions`, for **every**
`permissionMode`, including read-only assignments. Use AGY only with authorization
for this all-tool autoapproval profile. To additionally select its sandbox profile:

```json
{ "harness": "agy", "agySandbox": true, "prompt": "Your bounded task" }
```

This independently adds `--sandbox`. **Every tool is autoapproved**, not
just URL reads: file edits, commands, interactive website actions and MCP calls.
Delegate does not edit user settings or create a temporary configuration.

The sandbox imposes terminal restrictions; it is **not hard read-only isolation**
for native tools or MCP, and the workspace can remain writable. Scope the task
within authorization. `agySandbox: false` or omission adds no sandbox flag; it
does not disable any sandbox already enabled in AGY settings, and does not turn
off autoapproval. `permissionMode` cannot restrict AGY's authority. All options
precede `--print`, which immediately precedes the final prompt so it cannot
consume another flag as its value.

If a run is blocked, inspect retained stderr before retrying; do not silently
escalate authority or replace independent research with main-agent excerpts.
Label any agreed fallback as synthesis of supplied sources.

### Dispatch

**Prefer ready AGY:** For independent exploration, research, scoped implementation
or verification, prefer `delegate_run` with `"harness": "agy"` over a native
subagent when this one-turn interface fits. Use a native subagent when a required
capability is unavailable here; keep tightly coupled work with the main agent.

Set `workdir` unless you want the task to run in the connected agent's MCP root.

```jsonc
// 2. Run only after status lists this harness as configured
{ "tool": "delegate_run", "input": { "harness": "agy", "prompt": "Read src/registry.ts and list every harness id it declares, one per line. Read only; no commands, edits, network or further delegation.", "workdir": "/abs/path/to/this/package" } }
// → { "ok": true, "data": { "exitCode": 0, "stdout": "amp\nagy\n…", "stop": "exited", … } }
```

The external subagent receives no parent conversation or resumable session and
cannot ask a follow-up question. Include the goal, necessary context, allowed
actions, exact paths, acceptance criteria and return format in the prompt.

The AGY preference is routing guidance, not a speed benchmark or an automatic
scheduler. The main agent still decides what to dispatch and checks the result.

## Tool reference

| Tool | Input | Result |
|---|---|---|
| `delegate_status` | optional `refresh: true` | Discover configured external subagents: readiness, native model IDs when inspectable, permission modes, refusal reasons and depth |
| `delegate_run` | `harness`, `prompt`, optional controls below | Run one external-subagent task and return exit status, both streams, duration, resolved workdir, redacted argv and depth |

### Shared input

| Field | Default | Meaning |
|---|---|---|
| `harness` | required | ID from `delegate_status().data.harnesses`; unknown or unconfigured IDs are refused |
| `prompt` | required | The whole task, as one argument. Max 64 KiB. Must not begin with `-`. |
| `workdir` | MCP root, else the server's directory | Absolute directory the harness runs in |
| `model` | the harness's default | Exact native ID when status has a model list; otherwise passed to the native CLI without claiming model access. Must not begin with `-`; check `modelSupported`. |
| `permissionMode` | `default` | `default`, `acceptEdits`, or `bypassPermissions`, mapped per harness. Unsupported modes are refused. AGY always autoapproves all tools for every value; this field cannot restrict it. |
| `wallTimeMs` | 900000 | Wall-clock limit for the whole turn; maximum 7200000 |
| `agySandbox` | omitted | AGY only: `true` independently adds `--sandbox`; all AGY calls already autoapprove all tools. `false`/omitted adds no sandbox flag, without disabling saved settings. Other harnesses refuse this field. No settings edits; not hard read-only isolation. |

Successful responses are `{ "ok": true, "data": … }`; validation/readiness
failures are `{ "ok": false, "error": … }`. Failed turns also retain `data`,
including partial output, and set the MCP error flag; the text fallback contains
the same JSON. A call the input schema rejects is
answered by the MCP SDK before the delegate handler runs, so it arrives as a
text-only error rather than in this shape.
Inside `data`, `ok` requires a successful execution with a nonempty answer and
no recognized AGY headless permission denial. `outcome` is `answered`, `blocked`,
`empty`, or `failed`. This is observable execution evidence, not proof that the
task was completed correctly; the main agent must check the answer. Denial
detection matches AGY's known stderr diagnostic and is not a general semantic
classifier. `blocked` and `empty` set the MCP error flag even on exit 0;
`stop` says why a run ended (`exited`, `wall_time`, `capture_failed`,
`spawn_failed`).

For project-sensitive harnesses, a different workdir triggers fresh inspection
before launch; the check does not overwrite the server's startup snapshot.

**Server-controlled preview:** Combined previews are fixed at 64 KiB (counting JSON escaping); callers cannot choose a size. The former `maxOutputBytes` input is removed.

**Long answers finish normally.** When `truncated: true`, only the inline preview
is shortened: read `data.stdoutPath` and `data.stderrPath` to get the original
streams, including their ending. `stdoutBytes` and `stderrBytes` count raw saved bytes.

**Cache location:** `$XDG_CACHE_HOME/delegate/run-*/{stdout,stderr}`, falling back
to `$HOME/.cache/delegate` when XDG_CACHE_HOME is unset or relative. Run directories
are private (0700) and files owner-only (0600); the returned paths are absolute.

**Retention:** Every launched run retains both files and returns their paths,
including small or empty replies. Files remain until you remove them.
They can contain sensitive output and consume disk space; there is no automatic expiry.

**Raw bytes:** Non-UTF-8 output also retains cache files and sets `truncated`, even
when small, because JSON text cannot represent it losslessly. MCP storage/cleanup
diagnostics appear in the envelope `error`, not in the original stderr preview.

**Failures stay explicit.** Wall-clock expiry kills the process group and returns
captured partial output. Cache creation/write/flush failure reports `capture_failed`,
not success; any returned files may be incomplete.

## What a turn costs and can do

Each call runs a real model session on the account that harness CLI is logged
into, and it may make many model requests before it stops. There is no monetary
cap here: the wall-clock limit can end the run, not the bill. Output size does not. A turn
that stops midway leaves whatever edits it already made in place, and
`workdir` only chooses where it starts — it does not confine the harness to
that directory.

## Argument safety

`prompt` and `model` cannot begin with `-`. Some harnesses take the prompt as a
trailing positional while others read it from a value-taking flag; a value that
looks like an option would be parsed as a flag by one of them and could silently
run the wrong command or escalate authority. Both fields are refused at the
input schema before any process starts. The prompt is passed as one literal
argv element with `shell: false`, so its content is never re-parsed as shell
syntax.

Some harnesses accept the prompt through a value-taking flag rather than a
trailing argument: `gemini`, `qwen`, and `hermes` read the prompt from `-p`/`-z`
respectively, and `amp` reads it from `-x`. The registry emits that flag
immediately before the prompt so nothing sits between the flag and its value.

`opencode` is always launched with `--standalone` so it starts its own server
instead of attaching to a shared, long-lived one, which would let a turn escape
the wall-clock kill and the depth guard.

A harness that exits 0 while a background descendant keeps running has that
descendant reaped before the call returns, so a leftover process cannot
outlive the budget it was launched under. Reaping escalates from `SIGTERM` to
`SIGKILL` after a short grace period; if the group still refuses to die the call
returns `ok: false` with an error saying so, rather than reporting a clean turn.

## Limits that remain

- The delegated harness inherits this server's environment, so it can reach the
  same accounts, files, and network a terminal would. Narrow it with
  `permissionMode`, and with the harness's own sandbox flag.
- `bypassPermissions` drops every approval prompt for every tool the harness
  holds. Get human permission before using it.
- `cursor` is always launched with `--trust`, and its `acceptEdits` and
  `bypassPermissions` modes both add `--force`, so that harness cannot be asked
  to stop at an edit prompt.
- At most 6 turns run at once per server; a seventh call is refused rather than
  queued silently.
- Delegation is two hops deep. A harness started by another delegate gets the
  same MCP configuration, so it refuses to start a third. This is a `DELEGATE_DEPTH`
  environment variable, so it bounds ordinary chains only; a harness that drops
  or rewrites the variable is not stopped by it.
- Closing this server does not kill turns already in flight; they finish in
  their own process group.

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
