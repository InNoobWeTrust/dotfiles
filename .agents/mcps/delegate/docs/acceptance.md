---
audience: The maintainer accepting this package
purpose: Record the evidence that the delegation server works, and the steps to confirm it yourself
scope: Verification of this MCP package only; usage lives in ../README.md
---
# Acceptance

## Run checks

From `.agents/mcps/delegate`:

```sh
bun run check                # lint, formatting, import organization
bun run test                 # registry, readiness, detection, process, lifecycle
bun run test:e2e             # real MCP server against stub harness CLIs
```

`test:e2e` is opt-in in `package.json` because the end-to-end run spawns servers
and processes. Add `DELEGATE_E2E_REAL=1` for one paid turn against the real
`claude` CLI; that leg is the only one that costs model time.

## Gates

| Gate | Evidence |
|---|---|
| The interface stays simple | E2E asserts exactly `delegate_status` and `delegate_run`, including an empty harness PATH; discovery comes from status rather than dynamic tool names |
| Presence is not readiness | Critical tests distinguish missing, unconfigured and unknown executables; unsupported inspectors spawn no model/login probes and are not selectable |
| Inspection is bounded and non-recursive | Tests assert exact private non-model CLI argv, aggregate inspection budgets, at most two concurrent inspections, fixed safe reasons and no probes under `DELEGATE_INSPECTION=1` |
| Status recovers without catalog churn | E2E refreshes after configuration changes and verifies unknown/unconfigured harnesses cannot launch a turn |
| A prompt reaches the CLI as one literal argument | E2E stub logs every argv element and the prompt appears verbatim as the last element; unit tests pass a prompt containing shell syntax and an argument that looks like one to every `buildArgs` and to `runProcess`, and neither is ever re-parsed |
| An option-shaped value cannot reach a CLI | E2E calls with `prompt: "--version"` and with `model: "--yolo"`, both refused by the schema with `must not start with '-'`, and no stub is launched. `registry.test.ts` asserts that a harness with a `promptFlag` emits it at `argv.length - 2` and nowhere earlier, so nothing sits between a value-taking flag and its value; `assertRegistryInvariants()`, which the server runs at startup, additionally refuses a registry that declares the flag twice |
| A malformed registry entry stops the server | `registry.test.ts` feeds the argv assertions five broken entries — a prompt that is not the last argument, a mode advertised but rejected, a mode accepted but not advertised, a model option wedged between a prompt flag and its value, and a dropped prompt flag — and each is refused with a message naming the problem. `server.ts` runs the entry-level check while loading, so a broken entry fails at startup rather than during a real turn. Because that startup probe supplies no model, `server.ts` also runs `assertArgv()` against the arguments of every call it is about to execute, and a separate test feeds `assertArgv()` a builder whose defect only appears once a model is supplied |
| Authority is explicit and never downgraded | `delegate_run` selecting `opencode` with `bypassPermissions` fails with `not available for this harness`, and no turn stub is launched |
| A failed turn is reported, not thrown away | Non-zero exit, spawn failure, wall-clock expiry, and output overflow each return envelope `ok: false`, MCP `isError: true`, and run data with `stop` and partial output. Failed cleanup also prevents a clean result even when the harness exited 0 |
| Limits end the work | E2E reads the stub's PID from its log and waits until the process is really gone after the wall-clock limit |
| Work does not outlive a successful parent | `execute.test.ts` backgrounds a descendant that ignores `SIGTERM`, confirms the run still exits 0 with `stop: "exited"` and no `error`, and asserts the descendant's pid is gone by the time the run resolves — which fails if teardown is made fire-and-forget. E2E does the same through the MCP server with a stub and confirms the turn still returns `ok: true`, then polls for up to 5 s after the response for the descendant to disappear |
| A nested server stops | A server started with `DELEGATE_DEPTH=2` refuses every delegation and launches nothing |
| Shutdown runs once | `lifecycle.test.ts` drives the re-entrant close path and asserts the transport closes exactly once; it fails (`Expected: 1 / Received: 11`) against the naive guard. E2E additionally confirms the server exits 0 with empty stderr on stdin hang-up |
| Protocol shape holds | Every response the server produces is parsed twice: once as structured content and once from the JSON text fallback, and both must be equal. A call the input schema rejects is answered by the MCP SDK before the delegate handler runs, so it arrives as a text-only error and is not covered here. |

## Current verification — 2026-10-11

| Check | Result |
|---|---|
| Repository `bun run check` | PASS: 17 files, no diagnostics |
| Repository `bun run test` | PASS: 47 tests, 497 assertions across 5 files |
| Strict TypeScript | PASS with temporary import aliases for Bun's version-qualified SDK/Zod imports |
| Actual launcher, stub CLI E2E | PASS: two-tool catalog, readiness/refusal, literal arguments, model/mode validation, failed-run output, time/output limits, process cleanup, depth/concurrency and quiet shutdown |
| Refresh and project isolation | PASS: sign-out removal and recovery, concurrent refresh shares five inspection calls, runs wait for refresh, disabled project refuses without changing the launch snapshot |
| Live account/backend/model calls | NOT RUN; `configured` remains configuration evidence, not live access or billing proof |

Checks ran offline after dependency setup in temporary Linux containers with a
read-only checkout, isolated HOME, no host credentials, one CPU, 1 GiB RAM with
no swap, 128 processes and 256 MiB scratch. These are verification limits, not
new production defaults; the real launcher used a fixture installation in HOME.

## Prior reported baseline — 2026-10-10

The following report accompanied the earlier per-harness interface. It is
preserved for provenance, not proof of the current readiness implementation;
the paid leg has not been repeated during this revision.

| Check | Result |
|---|---|
| `bun run check` | 15 files, no diagnostics |
| `bun run test` | 35 pass, 0 fail, 320 assertions across 4 files |
| `bun run test:e2e` | PASS: startup detection advertises only installed harnesses, literal prompt argv, model passthrough, refused authority modes, option-lookalike rejection, pre-launch validation, exit/wall-time/output failures, orphan reaping, concurrency refusal, nested depth refusal, surviving close, quiet shutdown, structured content with JSON fallback |
| `DELEGATE_E2E_REAL=1 bun run test:e2e` | PASS: live `claude` turn, 10694 ms, stdout contained the requested token |

That report states it ran in a sandbox with a writable temporary directory,
without staging or committing. Current revision checks use temporary,
resource-bounded Linux containers with a read-only checkout, isolated HOME and
no host credentials; dependency setup is followed by offline verification.

Three known limits of the prior report: the twelve-harness registry was validated
against `claude`, `agy`, and `opencode` on this machine — the other nine are
registered from their published command lines and have not been run here because
they are not installed — the end-to-end run drives stubs for the timeout,
overflow, and shutdown paths, not real CLIs, and the quiet-shutdown check
confirms the server exits cleanly but does not distinguish the re-entrancy guard
that `tests/lifecycle.test.ts` covers directly.

## Final user acceptance

**Startup:** Ensure the existing dotfiles install links
`~/.local/bin/mcp-delegate`, and the MCP process can find Bun on its inherited
PATH. See [Start](../README.md#start); the normal bootstrap installs more than
this package and need not be repeated when those links already exist.

Then, from a main agent that has the `delegate` MCP server connected:

1. **Inspect:** Call `delegate_status`. Expect configured entries with supported
   modes/models, and separate missing, unconfigured or unknown entries with
   reasons; neither an alias nor a catalog is enough to become selectable.
2. **Refresh:** After an intentional account/configuration change, call status
   with `refresh: true`. Expect the same two tools and updated readiness; a
   changed server environment still requires a restart.
3. **Authorize one turn:** If desired, approve the model spend and use
   `delegate_run` with a configured ID and an explicit absolute workdir to list
   exported harnesses from `src/registry.ts`, read-only with no commands, edits,
   network or further delegation. Expect `ok: true` and `stop: "exited"`, or a
   clearly failed run retaining its output; configuration is not a live guarantee.
4. **Check refusal:** An unknown/unconfigured ID or a prompt of `"--version"`
   must fail without launching a turn. An unsupported permission mode must also
   fail; do not use a supported bypass mode without separate human approval.
5. **Check limits with stubs:** Use `test:e2e` to verify timeout/output/cleanup
   behavior without paying for a deliberately interrupted model session.
