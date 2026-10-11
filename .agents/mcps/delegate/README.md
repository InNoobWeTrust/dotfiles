---
audience: AI-agent users and MCP operators
purpose: Delegate one non-interactive task to another agent CLI
scope: Harnesses that take the prompt as one command-line argument; not a multi-agent orchestrator, not a session-resumable runner
---
# Delegate MCP

Delegate one bounded task through two stable tools: inspect configuration with
`delegate_status`, then use `delegate_run` with the selected harness ID.
CLI presence alone is not readiness; startup never submits a model prompt.

| Prerequisite | Notes |
|---|---|
| Bun | Resolves major-versioned MCP SDK@1 and Zod@4 imports automatically; no committed `node_modules` |
| An executable on the MCP server's `PATH` | Shell aliases are not executables and are not resolved by a non-login server |
| Inspectable account/provider configuration | Supported automatic inspectors: AGY, Claude, Codex, OpenCode; the status call explains other harnesses' unknown readiness |

## Start

`mcp-delegate` is configured in `.agents/mcp.json`, `.gemini/config/mcp_config.json`
and `.config/opencode/opencode.jsonc`. The first two resolve it on `PATH`;
OpenCode uses `{env:HOME}/.local/bin/mcp-delegate`. This checkout's `.local/bin`
is linked by the normal dotfiles `./bootstrap.sh` flow, like `mcp-sandbox`;
that command installs the broader dotfiles setup, not just this MCP.

The launcher must exist at `~/.local/bin/mcp-delegate`, and Bun must be on the
server's inherited `PATH`. A missing launcher is a startup error, not a harness
readiness result.

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

Set `workdir` unless you want the task to run in the connected agent's MCP root.

```jsonc
// 2. Run only after status lists this harness as configured
{ "tool": "delegate_run", "input": { "harness": "claude", "prompt": "Read src/registry.ts and list every harness id it declares, one per line. Read only; no commands, edits, network or further delegation.", "workdir": "/abs/path/to/this/package" } }
// → { "ok": true, "data": { "exitCode": 0, "stdout": "amp\nagy\n…", "stop": "exited", … } }
```

The delegated harness sees only the prompt. It cannot ask a follow-up question,
so include the paths, the constraints, and the output you need back.

This server makes delegation available; the main agent still chooses which
independent tasks to dispatch. It does not automatically schedule work.

## Tool reference

| Tool | Input | Result |
|---|---|---|
| `delegate_status` | optional `refresh: true` | Readiness, native model IDs when inspectable, supported permission modes, refusal reasons and depth |
| `delegate_run` | `harness`, `prompt`, optional controls below | Exit status, both streams, duration, resolved workdir, redacted argv and depth |

### Shared input

| Field | Default | Meaning |
|---|---|---|
| `harness` | required | ID from `delegate_status().data.harnesses`; unknown or unconfigured IDs are refused |
| `prompt` | required | The whole task, as one argument. Max 64 KiB. Must not begin with `-`. |
| `workdir` | MCP root, else the server's directory | Absolute directory the harness runs in |
| `model` | the harness's default | Exact native ID when status has a model list; otherwise passed to the native CLI without claiming model access. Must not begin with `-`; check `modelSupported`. |
| `permissionMode` | `default` | `default`, `acceptEdits`, or `bypassPermissions`, mapped to that harness's own flag. An unsupported mode is refused, never downgraded. |
| `wallTimeMs` | 900000 | Wall-clock limit for the whole turn; maximum 7200000 |
| `maxOutputBytes` | 4194304 | Combined stdout+stderr budget; maximum 33554432 |

Successful responses are `{ "ok": true, "data": … }`; validation/readiness
failures are `{ "ok": false, "error": … }`. Failed turns also retain `data`,
including partial output, and set the MCP error flag; the text fallback contains
the same JSON. A call the input schema rejects is
answered by the MCP SDK before the delegate handler runs, so it arrives as a
text-only error rather than in this shape.
Inside `data`, `ok` is true only when the harness exited 0 inside every limit;
`stop` says why a run ended (`exited`, `wall_time`, `output_limit`,
`spawn_failed`).

For project-sensitive harnesses, a different workdir triggers fresh inspection
before launch; the check does not overwrite the server's startup snapshot.

**Limits are kill limits.** On wall-clock or output expiry the whole delegated
process group is signalled, then killed, and whatever it printed is returned. A
partial answer is the normal result of a tight budget.

## What a turn costs and can do

Each call runs a real model session on the account that harness CLI is logged
into, and it may make many model requests before it stops. There is no monetary
cap here: the wall-clock and output budgets end the run, not the bill. A turn
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
