---
audience: Agent users, AI harness developers, infrastructure engineers
purpose: Explain sandbox resource budgets, explicit escalation, and failure interpretation
scope: MCP command budgets on Linux and macOS; not hostile-code containment or aggregate resource quotas
---

# Sandbox Resource Budgets

| Goal | Prerequisite | Boundary |
|---|---|---|
| Make command expectations explicit and expose unexpected resource use early | `bwrap` and `prlimit` on Linux; `/bin/sh` and `sandbox-exec` on macOS | Responsible synchronous commands, not guaranteed containment of malicious descendants |

## One execution contract, two controls

**Access controls** define where a command may write and whether it may use the network; **resource budgets** define how much work and output it may produce.
Both apply in the existing `sandbox_pure`, `sandbox_ro`, and `sandbox_rw` tools, rather than requiring agents to compose separate tool calls around one process.
Host files and inherited environment remain readable: these tools do not prevent credential reads or provide hostile-code isolation.

```text
Tool invocation + selected budget
  → inherited OS limits → access sandbox → command
  ↳ supervisor: elapsed-time limit, bounded output, process-group cleanup
  → structured result: budget, exit/signal, stop reason, captured output
```

**A boundary failure is an investigation trigger, not proof of a bug.** It may expose a runaway loop, unexpectedly broad search, excessive parallelism, or a workload whose legitimate requirements exceed the selected budget.
Stopping a command does not undo writes or external effects that already occurred.

## Human-authorized escalation

1. **Inspect:** Read the result and compare the command's behavior with its intended effects; do not automatically increase budgets or change access modes.
2. **Explain:** Identify the observed failure, likely cause, and specific proposed change; distinguish evidence from inference.
3. **Obtain permission:** Ask the human before increasing a budget. Approval is a human–agent/harness responsibility, not an MCP approval boolean.
4. **Retry explicitly:** Supply `limits` overrides for that invocation only. The MCP validates and applies the values without imposing an additional policy ceiling beyond representable implementation values and inherited OS hard limits.

For example, excessive output from an inspection may mean a search omitted its directory filter.
Narrow the search when that was the mistake; request a larger output budget only when the additional output is actually needed.
Resource approval never implicitly authorizes broader filesystem or network access.

## Invocation budgets

The optional `limits` object overrides individual defaults; omitted fields retain their defaults.
All numeric values must be safe integers; zero is accepted only for `coreBytes`.

| Field | Default | Meaning and limitation |
|---|---:|---|
| `wallTimeMs` | 120,000 | Elapsed-time deadline, including launcher setup; maximum 2,147,483,647 ms due to timer representation |
| `maxOutputBytes` | 4,194,304 | Combined stdout/stderr capture budget; excess output stops the command and marks truncation |
| `cpuSeconds` | 60 | Per-process soft CPU-time limit, not CPU throttling or total command-tree time |
| `cpuHardSeconds` | 120 | Per-process hard CPU-time ceiling; must be at least `cpuSeconds` |
| `maxFileBytes` | 104,857,600 | Per-file size ceiling; positive multiple of 1,024 bytes, not a total disk/inode quota |
| `maxOpenFiles` | 256 | Per-process file-descriptor ceiling |
| `coreBytes` | 0 | Core-file ceiling; nonnegative multiple of 1,024 bytes |
| `maxProcesses` | Not set | Optional user-wide process limit; Linux also counts threads. Not an invocation-local process budget |
| `addressSpaceBytes` | Not set | Optional Linux-only per-process virtual-address-space ceiling; positive multiple of 1,024 bytes, not a RAM quota |

**Optional caps are deliberate.** A process-count limit of 64 may block normal commands because existing processes for the same user count toward it.
A small address-space limit can prevent Bun/Node from reserving virtual memory even when physical memory use is modest; macOS requests for this field fail explicitly rather than claiming an equivalent memory ceiling.

Example MCP arguments after approval for a longer build:

```json
{
  "command": "make build",
  "workdir": "/absolute/path/to/project",
  "limits": {
    "wallTimeMs": 300000,
    "cpuSeconds": 180,
    "cpuHardSeconds": 240
  }
}
```

## Reading results

Existing `exitCode`, `stdout`, `stderr`, `workdir`, `workdirSource`, `error`, and `restrictionHint` remain available.
Structured content and the JSON text fallback carry the same result; stdout and stderr remain separate.

| Field | How to interpret it |
|---|---|
| `limits` | Selected invocation budget, including optional caps when requested |
| `limitsApplied` | Launcher confirmed OS-limit installation before executing the sandbox; does not prove the sandbox itself started successfully |
| `termination` | `exited`, `signal`, `timeout`, `output_limit`, `setup_error`, or `execution_error` |
| `signal` | Observed launcher/command termination signal, or `null`; not guessed from an exit number |
| `truncated` | Separate stdout/stderr flags; true when capture omitted bytes or an inherited pipe had to be closed |
| `restrictionHint` | Guidance based on observations or diagnostic evidence, not a definitive root-cause classification |

**Exit values stay observable.** A normal process exit retains its numeric code; a signal termination may have `exitCode: null` and an observed `signal`.
A supervisor stop remains a tool failure even if the command raced to exit with code zero.
Validation or directory-discovery failures can precede budget selection/execution and omit execution metadata.

**Output is bounded, not silently discarded.** The supervisor preserves captured bytes up to the shared budget, then decodes each stream as UTF-8; a cutoff can split a character and produce a replacement character.
Partial output is not a complete log, and a file-size limit does not protect piped output or the MCP server's buffers.

**Diagnose with evidence.** An observed `SIGXCPU` or `SIGXFSZ` suggests a resource-limit event; explicit shell exits can mimic `128 + signal` numbers, which differ across platforms.
Allocation errors, `SIGKILL`, permission errors, and process-creation failures can have unrelated causes; inspect stderr and the selected limits before concluding what failed.

## Enforcement and remaining boundaries

| Component | Implementation | What it does not guarantee |
|---|---|---|
| Linux limit launcher | `prlimit` sets explicit soft/hard limits before the sandbox; missing limiter fails closed | Aggregate memory, CPU, or process quotas; privileged processes may bypass some limits |
| macOS limit launcher | Fixed `/bin/sh` wrapper sets checked `ulimit` values before `exec sandbox-exec`; shell arguments are passed separately | Linux-equivalent memory or process/thread accounting |
| Setup confirmation | Per-invocation scratch marker records successful limit installation before user code executes | Successful sandbox setup, tamper-proof attestation, or a command-start guarantee |
| Supervisor | New process group, deadline, bounded concurrent output capture; attempts to kill remaining group children on command exit | Descendants deliberately escaping the group with a new session; cleanup can also be denied by host policy |
| Pipe cleanup | Brief bounded drain after stopping the group; lingering pipes closed with partial-capture diagnostics | Termination of escaped descendants or rollback of earlier effects |

Limits are inherited across `fork` and `exec`, but each process generally receives its own budget rather than consuming a shared command-tree allowance.
These tools run synchronous commands: do not use them to start persistent background services.
Concurrent invocations also consume separate budgets; there is no server-wide aggregate quota.
Cleanup errors are reported explicitly; if a command cannot be stopped, the result warns that processes may remain running rather than claiming successful termination.

For stronger containment, use Linux cgroup-based aggregate memory/CPU/PID controls and storage quotas, or a suitably isolated VM/container runner.
Keep that capability separate from claims about POSIX `rlimit`s; neither per-file limits nor filesystem access controls guarantee protection against total disk exhaustion.

## Runtime dependencies and verification

The standalone Bun script specifies each external dependency's supported major in its imports: MCP SDK `@1` (including subpaths and type imports) and Zod `@4`.
These selectors allow compatible minor/patch updates; they are not an exact-version lockfile, and Node built-ins follow the Bun runtime rather than npm version selectors.

**Resolve before coding.** Check dependencies from the configured launcher's script directory, not an unrelated package installation or cache, and use APIs supported by those resolved majors.
Do not downgrade dependencies merely to accommodate newly written code; adapt the code to the existing major unless a version change is explicitly agreed.

**Verify the deployed path.** Exercise the actual launcher through MCP initialization and tool listing with its normal imports, then check representative calls and budget validation.
Tests that substitute dependency paths can cover logic, but do not prove deployment compatibility; a schema exception before stdio initialization can appear to the harness only as “Connection closed.”
See Bun's [auto-install version specifiers](https://bun.sh/docs/runtime/auto-install#version-specifiers) for standalone import syntax.

## Maintainer references

- **Implementation:** [`host.ts`](../../../mcps/sandbox/src/host.ts) preserves host-tool schemas, platform launchers, supervision, and diagnostics in the unified [sandbox package](../../../mcps/sandbox/README.md).
- **Access boundary:** [Harness safety](../harness-safety.md) explains modes and installation.
- **Linux semantics:** [`getrlimit(2)`](https://man7.org/linux/man-pages/man2/getrlimit.2.html) describes per-process limits and user-wide `RLIMIT_NPROC`.
- **Darwin semantics:** [Apple's archived `setrlimit(2)` reference](https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man2/setrlimit.2.html); verify current platform behavior rather than assuming Linux parity.
