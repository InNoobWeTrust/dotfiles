import { expect } from "bun:test"
import { spawn } from "node:child_process"
import { chmod, mkdir, mkdtemp, readFile, realpath, rm, symlink, writeFile } from "node:fs/promises"
import { devNull, tmpdir } from "node:os"
import path from "node:path"
import { Client } from "@modelcontextprotocol/sdk@1/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk@1/client/stdio.js"
import type { DelegateOutput, StatusOutput } from "../src/contracts"

const enabled = process.env.DELEGATE_E2E === "1"
const root = path.resolve(import.meta.dir, "..")

/**
 * Stub CLIs stand in for real harnesses so the whole path — detection, tool
 * advertisement, argv, cwd, depth, budgets — is verified without spending a
 * model session. The prompt selects the behaviour, because every harness must
 * receive the prompt as one literal argv element.
 *
 * When DELEGATE_INSPECTION=1 the stub returns hardcoded readiness responses for
 * each known harness so detection succeeds without real credentials.
 */
const STUB = `#!/bin/sh
if [ "$1" = "--version" ]; then printf 'stub 9.9.9\\n'; exit 0; fi

# Readiness inspection mode: return literal DTOs for each harness.
if [ "\${DELEGATE_INSPECTION:-0}" = "1" ]; then
  name=$(basename "$0")
  printf '%s %s %s\\n' "$name" "$1" "$2" >> "$STUB_INSPECTION_LOG"
  case "\${name}:$1:$2" in
    agy:--log-file:${devNull})
      if [ "$3" != "--print" ] || [ "$4" != "/usage" ] || [ "$AGY_CLI_DISABLE_AUTO_UPDATE" != "true" ]; then exit 2; fi
      if [ -f "$HOME/.stub-agy-signed-out" ]; then
        printf 'Authentication required. Please sign in.\\n' >&2; exit 1
      fi
      printf 'Gemini Models\\tWeekly Limit Remaining\\t90%%\\t2026-10-15T11:47:50Z\\n'; exit 0 ;;
    claude:auth:status)
      sleep 0.1
      if [ -f "$HOME/.stub-claude-signed-out" ]; then
        printf '{"loggedIn":false}\\n'; exit 1
      fi
      printf '{"loggedIn":true}\\n'; exit 0 ;;
    codex:login:status)
      printf 'Logged in using stub-provider\\n'; exit 0 ;;
    opencode:api:get)
      case "$3" in
        /api/integration)
          printf '{"data":[{"id":"stub_int","connections":[{"type":"env","name":"STUB_KEY"}]}]}\\n'; exit 0 ;;
        /api/provider)
          if [ -f .stub-opencode-disabled ]; then
            printf '{"data":[{"id":"stub_provider","integrationID":"stub_int","activation":"disabled"}]}\\n'; exit 0
          fi
          printf '{"data":[{"id":"stub_provider","integrationID":"stub_int","activation":"enabled"}]}\\n'; exit 0 ;;
        /api/model)
          printf '{"data":[{"id":"stub_provider/stub_model","providerID":"stub_provider","enabled":true,"status":"active","variants":[]}]}\\n'; exit 0 ;;
      esac ;;
  esac
  # Harnesses with no verified inspection strategy (amp, etc.) fall through;
  # inspectReadiness returns unknown for them without spawning a subprocess.
fi

name=$(basename "$0")
last=""
for arg in "$@"; do last="$arg"; done
{
  printf 'call %s\\n' "$name"
  printf 'cwd %s\\n' "$(pwd)"
  printf 'depth %s\\n' "\${DELEGATE_DEPTH:-unset}"
  for arg in "$@"; do printf 'arg %s\\n' "$arg"; done
} >> "$STUB_LOG"
case "$last" in
  *STUB_BLOCKED_NOISE*) printf 'partial answer\n'; head -c 100000 /dev/zero >&2; printf 'jetski: no output produced — a tool required the "read_url" permission that headless mode cannot prompt for, so it was auto-denied.\n' >&2; exit 0 ;;
  *STUB_BLANK_NOISE*) printf ' \n'; head -c 100000 /dev/zero >&2; exit 0 ;;
  *STUB_BLOCKED*) printf 'jetski: no output produced — a tool required the "read_url" permission that headless mode cannot prompt for, so it was auto-denied.\n' >&2; exit 0 ;;
  *STUB_EMPTY*) exit 0 ;;
  *STUB_SLEEP*) printf 'pid %s\\n' "$$" >> "$STUB_LOG"; sleep 120 ;;
  *STUB_NOISE*) head -c 100000 /dev/zero; printf 'FINAL-ANSWER\n'; printf 'FINAL-ERROR\n' >&2; exit 0 ;;
  *STUB_FAIL*) printf 'stub refused\\n' >&2; exit 3 ;;
*STUB_ORPHAN*)
    echo "pid $$" >> "$STUB_LOG"
    sleep 120 >/dev/null 2>&1 &
    echo "child $!" >> "$STUB_LOG"
    echo "answer from $name"
    exit 0 ;;
esac
printf 'answer from %s\\n' "$name"
`

type Call = {
  name: string
  cwd: string
  depth: string
  argv: string[]
  pid?: string
  child?: string
}

async function callLog(file: string): Promise<Call[]> {
  const text = await readFile(file, "utf8").catch(() => "")
  const calls: Call[] = []
  for (const block of text.split("call ").slice(1)) {
    const lines = block.split("\n")
    const pid = lines.find((line) => line.startsWith("pid "))?.slice(4)
    const child = lines.find((line) => line.startsWith("child "))?.slice(6)
    calls.push({
      name: lines[0],
      cwd: lines.find((line) => line.startsWith("cwd "))?.slice(4) ?? "",
      depth: lines.find((line) => line.startsWith("depth "))?.slice(6) ?? "",
      argv: lines.filter((line) => line.startsWith("arg ")).map((line) => line.slice(4)),
      ...(pid ? { pid } : {}),
      ...(child ? { child } : {}),
    })
  }
  return calls
}

/** Wait until a signalled process is really gone, not merely told to leave. */
async function waitGone(pid: string, why: string, milliseconds = 5000) {
  const end = Date.now() + milliseconds
  while (Date.now() < end) {
    try {
      process.kill(Number(pid), 0)
    } catch {
      return
    }
    await Bun.sleep(50)
  }
  throw new Error(`Delegated process ${pid} survived: ${why}`)
}

function textOf(content: unknown): string {
  const first: unknown = Array.isArray(content) ? content[0] : undefined
  return first && typeof first === "object" && "text" in first && typeof first.text === "string"
    ? first.text
    : ""
}

type Result<T = unknown> = {
  response: Awaited<ReturnType<Client["callTool"]>>
  output: { ok: boolean; data?: T; error?: string }
}

type Api = Awaited<ReturnType<typeof connect>>

async function connect(env: Record<string, string>) {
  const transport = new StdioClientTransport({
    command: path.resolve(root, "bin/mcp-delegate"),
    cwd: root,
    env,
    stderr: "pipe",
  })
  let diagnostics = ""
  transport.stderr?.on("data", (chunk) => {
    diagnostics = (diagnostics + chunk.toString()).slice(-8192)
  })
  const client = new Client({ name: "delegate-e2e", version: "1" })
  try {
    await client.connect(transport)
  } catch (error) {
    await transport.close()
    throw new Error(`${error}; server stderr: ${diagnostics}`)
  }
  /** Rejects an input-schema violation instead of asserting a JSON fallback for it. */
  async function call<T = unknown>(
    name: string,
    input: Record<string, unknown> = {},
  ): Promise<Result<T>> {
    const response = await client.callTool({ name, arguments: input })
    const output = response.structuredContent as {
      ok: boolean
      data?: T
      error?: string
    }
    expect(JSON.parse(textOf(response.content))).toEqual(output)
    return { response, output }
  }
  return { client, transport, call }
}

async function stubEnvironment(scratch: string) {
  const stubDir = path.join(scratch, "bin")
  const logFile = path.join(scratch, "calls.log")
  const inspectionLogFile = path.join(scratch, "inspections.log")
  // HOME is isolated to scratch so readiness probes cannot read real credentials.
  const fakeHome = path.join(scratch, "home")
  await Promise.all([
    mkdir(stubDir),
    mkdir(path.join(scratch, "workspace")),
    mkdir(fakeHome, { recursive: true }),
  ])
  // Mirror the installed package link without exposing any real HOME credentials.
  const mcpDirectory = path.join(fakeHome, ".agents", "mcps")
  await mkdir(mcpDirectory, { recursive: true })
  await symlink(root, path.join(mcpDirectory, "delegate"), "dir")
  for (const name of ["claude", "codex", "agy", "amp", "opencode"]) {
    const file = path.join(stubDir, name)
    await writeFile(file, STUB)
    await chmod(file, 0o755)
  }
  await writeFile(logFile, "")
  await writeFile(inspectionLogFile, "")
  return {
    logFile,
    inspectionLogFile,
    workspacePath: await realpath(path.join(scratch, "workspace")),
    env: {
      ...process.env,
      PATH: [stubDir, path.dirname(Bun.which("bun") ?? "bun"), "/usr/bin", "/bin"].join(":"),
      STUB_LOG: logFile,
      STUB_INSPECTION_LOG: inspectionLogFile,
      HOME: fakeHome,
      XDG_CACHE_HOME: path.join(scratch, "cache"),
    },
  }
}

async function verifyStubbedEndToEnd() {
  const scratch = await mkdtemp(path.join(tmpdir(), "agent-delegate-e2e-"))
  const clients: Api[] = []
  try {
    const { logFile, inspectionLogFile, workspacePath, env } = await stubEnvironment(scratch)
    const api = await connect(env)
    clients.push(api)

    // Exactly two tools regardless of which harnesses are installed.
    const catalog = await api.client.listTools()
    expect(catalog.tools.map((tool) => tool.name).sort()).toEqual([
      "delegate_run",
      "delegate_status",
    ])

    // delegate_run exposes the harness selector plus all existing DelegateInput fields.
    const runTool = catalog.tools.find((tool) => tool.name === "delegate_run")
    if (!runTool) throw new Error("delegate_run was not advertised")
    const statusTool = catalog.tools.find((tool) => tool.name === "delegate_status")
    if (!statusTool) throw new Error("delegate_status was not advertised")
    expect(runTool.description).toMatch(/external.*subagent/i)
    expect(runTool.description).toMatch(/prefer.*agy/i)
    expect(runTool.description).toMatch(/native.*subagent/i)
    expect(statusTool.description).toMatch(/external.*subagent/i)
    const properties = runTool.inputSchema.properties as
      | Record<string, { description?: string }>
      | undefined
    expect(properties?.prompt?.description).toMatch(/self-contained/i)
    expect(properties?.permissionMode?.description).toMatch(/human.*permission/i)
    expect(properties?.permissionMode?.description).toMatch(/not read-only/i)
    expect(Object.keys(runTool.inputSchema.properties ?? {}).sort()).toEqual([
      "agySandbox",
      "harness",
      "model",
      "permissionMode",
      "prompt",
      "wallTimeMs",
      "workdir",
    ])

    // delegate_status reports readiness, reason, models, permissionModes, modelSupported.
    const status = await api.call<StatusOutput>("delegate_status")
    expect(status.output.ok).toBe(true)
    // agy, claude, codex, opencode pass their stubs' readiness checks.
    const harnessIds = status.output.data?.harnesses.map((h) => h.id).sort()
    expect(harnessIds).toEqual(["agy", "claude", "codex", "opencode"])
    expect(status.output.data?.harnesses.every((h) => h.version === null)).toBe(true)
    expect(status.output.data?.harnesses.every((h) => h.readiness === "configured")).toBe(true)
    expect(status.output.data?.harnesses.every((h) => typeof h.reason === "string")).toBe(true)
    expect(status.output.data?.harnesses.every((h) => Array.isArray(h.models))).toBe(true)
    expect(status.output.data?.harnesses.every((h) => Array.isArray(h.permissionModes))).toBe(true)
    expect(status.output.data?.harnesses.every((h) => typeof h.modelSupported === "boolean")).toBe(
      true,
    )
    // opencode stub returns a configured model via /api/model.
    const opencodeSt = status.output.data?.harnesses.find((h) => h.id === "opencode")
    expect(opencodeSt?.models).toEqual(["stub_provider/stub_model"])
    // A quota report proves AGY configuration, not a model catalog or allowlist.
    expect(status.output.data?.harnesses.find((h) => h.id === "agy")?.models).toEqual([])
    expect(status.output.data?.unsupported.find((h) => h.id === "amp")?.readiness).toBe("unknown")
    expect(status.output.data?.unsupported.map((h) => h.id)).toContain("kilo")
    expect(status.output.data?.depth).toBe(0)
    expect(status.output.data?.maxDepth).toBe(2)

    // Refresh: re-detection resolves to the same configured harnesses.
    const refreshed = await api.call<StatusOutput>("delegate_status", { refresh: true })
    expect(refreshed.response.isError).toBe(false)
    expect(refreshed.output.ok).toBe(true)
    expect(refreshed.output.data?.harnesses.map((h) => h.id).sort()).toEqual([
      "agy",
      "claude",
      "codex",
      "opencode",
    ])

    // A changed account removes availability without changing the tool catalog.
    const signedOutMarker = path.join(env.HOME, ".stub-claude-signed-out")
    await writeFile(signedOutMarker, "")
    const [signedOut, signedOutRun] = await Promise.all([
      api.call<StatusOutput>("delegate_status", { refresh: true }),
      api.call("delegate_run", {
        harness: "claude",
        prompt: "STUB_OK signed out must not launch",
      }),
    ])
    expect(signedOut.output.data?.harnesses.map((h) => h.id).sort()).toEqual([
      "agy",
      "codex",
      "opencode",
    ])
    expect(signedOut.output.data?.unsupported.find((h) => h.id === "claude")?.readiness).toBe(
      "not_configured",
    )
    expect(signedOutRun.response.isError).toBe(true)
    expect(await callLog(logFile)).toHaveLength(0)

    // Concurrent refresh requests share one inspection pass (1+1+1+3 CLI probes).
    await rm(signedOutMarker)
    const inspectionsBefore = (await readFile(inspectionLogFile, "utf8")).trim().split("\n").length
    const restored = await Promise.all([
      api.call<StatusOutput>("delegate_status", { refresh: true }),
      api.call<StatusOutput>("delegate_status", { refresh: true }),
    ])
    for (const result of restored) {
      expect(result.response.isError).toBe(false)
      expect(result.output.data?.harnesses.map((h) => h.id).sort()).toEqual([
        "agy",
        "claude",
        "codex",
        "opencode",
      ])
    }
    const inspectionsAfter = (await readFile(inspectionLogFile, "utf8")).trim().split("\n").length
    expect(inspectionsAfter - inspectionsBefore).toBe(6)
    expect((await api.client.listTools()).tools.map((tool) => tool.name).sort()).toEqual([
      "delegate_run",
      "delegate_status",
    ])

    // AGY sign-out removes availability; a refused turn must never reach the CLI.
    const agySignedOutMarker = path.join(env.HOME, ".stub-agy-signed-out")
    await writeFile(agySignedOutMarker, "")
    const agySignedOut = await api.call<StatusOutput>("delegate_status", { refresh: true })
    expect(agySignedOut.output.data?.harnesses.map((h) => h.id)).not.toContain("agy")
    expect(agySignedOut.output.data?.unsupported.find((h) => h.id === "agy")?.readiness).toBe(
      "not_configured",
    )
    const agyRefused = await api.call("delegate_run", {
      harness: "agy",
      prompt: "STUB_OK signed out must not launch",
    })
    expect(agyRefused.response.isError).toBe(true)
    expect(await callLog(logFile)).toHaveLength(0)
    await rm(agySignedOutMarker)
    const agyRestored = await api.call<StatusOutput>("delegate_status", { refresh: true })
    expect(agyRestored.output.data?.harnesses.map((h) => h.id)).toContain("agy")

    // Configured AGY uses its default model unless a native model slug is supplied.
    const agyPrompt = "STUB_OK inspect AGY without edits"
    const agyDefault = await api.call<DelegateOutput>("delegate_run", {
      harness: "agy",
      prompt: agyPrompt,
      workdir: workspacePath,
    })
    expect(agyDefault.response.isError).toBe(false)
    expect(agyDefault.output.data?.stdout).toBe("answer from agy\n")
    expect(agyDefault.output.data?.workdir).toBe(workspacePath)
    expect(agyDefault.output.data?.depth).toBe(1)
    await api.call("delegate_run", {
      harness: "agy",
      prompt: agyPrompt,
      model: "gemini-pro",
      workdir: workspacePath,
    })
    const agyCalls = await callLog(logFile)
    expect(agyCalls).toHaveLength(2)
    expect(agyCalls[0]?.argv).toEqual(["--print", agyPrompt])
    expect(agyCalls[1]?.argv).toEqual(["--print", "--model", "gemini-pro", agyPrompt])
    const sandboxed = await api.call<DelegateOutput>("delegate_run", {
      harness: "agy",
      prompt: agyPrompt,
      agySandbox: true,
    })
    expect(sandboxed.output.data?.argv).toContain("--sandbox")
    expect(sandboxed.output.data?.argv).toContain("--dangerously-skip-permissions")
    expect(sandboxed.output.data?.outcome).toBe("answered")
    const unsupportedSandbox = await api.call("delegate_run", {
      harness: "claude",
      prompt: agyPrompt,
      agySandbox: true,
    })
    expect(unsupportedSandbox.response.isError).toBe(true)
    expect((await callLog(logFile)).length).toBe(3)
    await writeFile(logFile, "")

    // A successful turn: literal prompt, requested cwd, depth handed down.
    const prompt = "STUB_OK summarise this module"
    const ok = await api.call<DelegateOutput>("delegate_run", {
      harness: "claude",
      prompt,
      workdir: path.join(scratch, "workspace"),
      model: "some-model",
      permissionMode: "acceptEdits",
    })
    expect(ok.response.isError).toBe(false)
    const output = ok.output.data
    if (!output) throw new Error("expected data in successful run")
    expect(output.ok).toBe(true)
    expect(output.exitCode).toBe(0)
    expect(output.stdout).toBe("answer from claude\n")
    expect(output.workdir).toBe(workspacePath)
    expect(output.depth).toBe(1)
    expect(output.argv.at(-1)).toBe(`<prompt ${Buffer.byteLength(prompt)} bytes>`)
    const [first] = await callLog(logFile)
    expect(first?.cwd).toBe(workspacePath)
    expect(first?.depth).toBe("1")
    expect(first?.argv.at(-1)).toBe(prompt)

    // A model the caller did not ask for is never invented.
    await api.call("delegate_run", { harness: "codex", prompt: "STUB_OK no model" })
    const second = (await callLog(logFile))[1]
    expect(second?.argv.join(" ")).not.toContain("some-model")

    // Unsupported authority is refused, never silently downgraded.
    const refused = await api.call("delegate_run", {
      harness: "opencode",
      prompt: "STUB_OK nope",
      permissionMode: "bypassPermissions",
    })
    expect(refused.response.isError).toBe(true)
    expect(refused.output.error).toContain("not available for this harness")
    expect((await callLog(logFile)).length).toBe(2)

    // An unavailable harness (amp: unknown readiness) is refused before launch.
    const unavailRun = await api.call("delegate_run", {
      harness: "amp",
      prompt: "STUB_OK should not run",
    })
    expect(unavailRun.response.isError).toBe(true)
    expect(unavailRun.output.error).toContain("not usable")
    expect((await callLog(logFile)).length).toBe(2)

    // An unknown harness ID is refused before touching the snapshot.
    const unknownHarness = await api.call("delegate_run", {
      harness: "nonexistent",
      prompt: "STUB_OK nope",
    })
    expect(unknownHarness.response.isError).toBe(true)
    expect(unknownHarness.output.error).toContain("Unknown harness ID")
    expect((await callLog(logFile)).length).toBe(2)

    // Model allowlist: opencode has a non-empty model list from inspection.
    const badModel = await api.call("delegate_run", {
      harness: "opencode",
      prompt: "STUB_OK check",
      model: "nonexistent/model",
    })
    expect(badModel.response.isError).toBe(true)
    expect(badModel.output.error).toContain("not in the verified model list")
    expect((await callLog(logFile)).length).toBe(2)

    // Project inspection must not inherit the launch directory's availability.
    const projectMarker = path.join(workspacePath, ".stub-opencode-disabled")
    await writeFile(projectMarker, "")
    const projectRun = await api.call("delegate_run", {
      harness: "opencode",
      prompt: "STUB_OK disabled project must not launch",
      workdir: workspacePath,
    })
    expect(projectRun.response.isError).toBe(true)
    expect((await callLog(logFile)).length).toBe(2)
    const launchSnapshot = await api.call<StatusOutput>("delegate_status")
    expect(launchSnapshot.output.data?.harnesses.find((h) => h.id === "opencode")?.models).toEqual([
      "stub_provider/stub_model",
    ])
    await rm(projectMarker)

    // An empty prompt is rejected by the schema before any harness is started.
    const empty = await api.client.callTool({
      name: "delegate_run",
      arguments: { harness: "claude", prompt: "" },
    })
    expect(empty.isError).toBe(true)
    expect(textOf(empty.content)).toContain("prompt")
    expect((await callLog(logFile)).length).toBe(2)

    // A prompt too large for one argv element is refused before launch.
    const oversized = await api.call("delegate_run", {
      harness: "claude",
      prompt: "x".repeat(70_000),
    })
    expect(oversized.response.isError).toBe(true)
    expect(oversized.output.error).toContain("at most")
    expect((await callLog(logFile)).length).toBe(2)

    // A prompt or model that looks like an option is refused before launch, so
    // it can never be executed as a flag or read as a permission escalation.
    for (const arguments_ of [
      { harness: "claude", prompt: "--version" },
      { harness: "claude", prompt: "STUB_OK fine", model: "--yolo" },
    ]) {
      const lookalike = await api.client.callTool({
        name: "delegate_run",
        arguments: arguments_,
      })
      expect(lookalike.isError).toBe(true)
      expect(textOf(lookalike.content)).toContain("must not start with '-'")
    }
    expect((await callLog(logFile)).length).toBe(2)

    // A non-zero exit is a failed delegation: isError=true and data retains the
    // partial output so the caller can inspect stderr.
    const failed = await api.call<DelegateOutput>("delegate_run", {
      harness: "claude",
      prompt: "STUB_FAIL now",
    })
    expect(failed.response.isError).toBe(true)
    expect(failed.output.ok).toBe(false)
    expect(failed.output.error).toBe("Delegated turn failed")
    expect(failed.output.data?.ok).toBe(false)
    expect(failed.output.data?.exitCode).toBe(3)
    expect(failed.output.data?.stderr).toContain("stub refused")
    expect(failed.output.data?.outcome).toBe("failed")

    for (const [prompt, outcome] of [
      ["STUB_BLOCKED", "blocked"],
      ["STUB_EMPTY", "empty"],
      ["STUB_BLOCKED_NOISE", "blocked"],
      ["STUB_BLANK_NOISE", "empty"],
    ]) {
      const incomplete = await api.call<DelegateOutput>("delegate_run", { harness: "agy", prompt })
      expect(incomplete.response.isError).toBe(true)
      expect(incomplete.output.ok).toBe(false)
      expect(incomplete.output.data?.ok).toBe(false)
      expect(incomplete.output.data?.exitCode).toBe(0)
      expect(incomplete.output.data?.outcome).toBe(outcome)
      expect(incomplete.output.data?.stdoutPath).toBeTruthy()
      expect(incomplete.output.data?.stderrPath).toBeTruthy()
      expect(incomplete.output.error).toMatch(
        outcome === "blocked" ? /explicit human approval/ : /without an answer/,
      )
    }

    // The wall-clock limit kills the delegated process group.
    const slow = await api.call<DelegateOutput>("delegate_run", {
      harness: "claude",
      prompt: "STUB_SLEEP long",
      wallTimeMs: 1_000,
    })
    expect(slow.response.isError).toBe(true)
    expect(slow.output.data?.stop).toBe("wall_time")
    expect(slow.output.data?.timedOut).toBe(true)
    expect(slow.output.data?.ok).toBe(false)
    const sleeping = (await callLog(logFile)).find((c) => c.argv.at(-1)?.includes("STUB_SLEEP"))
    if (!sleeping?.pid) throw new Error("The stub never recorded a pid")
    await waitGone(sleeping.pid, "it outlived its wall-clock limit")

    // Preview reduction never stops the run; original streams remain readable.
    const loud = await api.call<DelegateOutput>("delegate_run", {
      harness: "claude",
      prompt: "STUB_NOISE loudly",
    })
    expect(loud.response.isError).toBe(false)
    expect(loud.output.data?.stop).toBe("exited")
    expect(loud.output.data?.truncated).toBe(true)
    expect(loud.output.data?.ok).toBe(true)
    const loudData = loud.output.data
    if (!loudData?.stdoutPath || !loudData.stderrPath)
      throw new Error("Missing complete-output paths")
    expect(await readFile(loudData.stdoutPath, "utf8")).toBe(`${"\0".repeat(100000)}FINAL-ANSWER\n`)
    expect(await readFile(loudData.stderrPath, "utf8")).toBe("FINAL-ERROR\n")
    expect(loudData.stdoutBytes).toBe(100013)
    expect(loudData.stderrBytes).toBe(12)
    const serialized = JSON.stringify(loud.output)
    expect(serialized.indexOf('"stdoutPath":')).toBeLessThan(serialized.indexOf('"stdout":'))
    expect(serialized.indexOf('"stderrPath":')).toBeLessThan(serialized.indexOf('"stdout":'))

    expect(
      Buffer.byteLength(JSON.stringify(loudData.stdout)) +
        Buffer.byteLength(JSON.stringify(loudData.stderr)),
    ).toBeLessThanOrEqual(65_540)

    // A harness that exits 0 while a descendant keeps running does not get to
    // leave that descendant working outside every budget and the slot count.
    const orphaning = await api.call<DelegateOutput>("delegate_run", {
      harness: "claude",
      prompt: "STUB_ORPHAN away",
    })
    expect(orphaning.response.isError).toBe(false)
    expect(orphaning.output.data?.ok).toBe(true)
    const orphan = (await callLog(logFile)).find((c) => c.argv.at(-1)?.includes("STUB_ORPHAN"))
    if (!orphan?.child) throw new Error("The stub never recorded its background child")
    await waitGone(orphan.child, "its parent exited 0 but the descendant was left running")

    // A seventh concurrent turn is refused rather than silently queued.
    const running = Array.from({ length: 6 }, () =>
      api.call("delegate_run", {
        harness: "claude",
        prompt: "STUB_SLEEP queued",
        wallTimeMs: 3_000,
      }),
    )
    await Bun.sleep(250)
    const seventh = await api.call("delegate_run", {
      harness: "claude",
      prompt: "STUB_OK one too many",
    })
    expect(seventh.response.isError).toBe(true)
    expect(seventh.output.error).toContain("already running")
    await Promise.all(running)

    // A server started by another delegate refuses a further hop.
    const nested = await connect({ ...env, DELEGATE_DEPTH: "2" })
    clients.push(nested)
    expect((await nested.call<StatusOutput>("delegate_status")).output.data?.depth).toBe(2)
    const tooDeep = await nested.call("delegate_run", {
      harness: "claude",
      prompt: "STUB_OK again",
    })
    expect(tooDeep.response.isError).toBe(true)
    expect(tooDeep.output.error).toContain("maximum")
    expect((await callLog(logFile)).filter((c) => c.depth === "3")).toHaveLength(0)

    // Closing the server leaves an already-started turn running.
    const survivor = await connect(env)
    clients.push(survivor)
    const running2 = survivor
      .call("delegate_run", { harness: "claude", prompt: "STUB_SLEEP survivor" })
      .catch(() => undefined)
    let survivorPid = ""
    for (let attempt = 0; attempt < 40 && !survivorPid; attempt += 1) {
      const entry = (await callLog(logFile)).find((c) => c.argv.at(-1)?.includes("survivor"))
      survivorPid = entry?.pid ?? ""
      if (!survivorPid) await Bun.sleep(50)
    }
    if (!survivorPid) throw new Error("The surviving stub never started")
    await survivor.client.close()
    await running2
    expect(() => process.kill(Number(survivorPid), 0)).not.toThrow()
    process.kill(-Number(survivorPid), "SIGKILL")

    console.log(
      "PASS: two-tool catalog, startup detection, AGY quota readiness and sign-out refresh, readiness gate, literal prompt argv, model passthrough, refused authority modes, unavailable/unknown harness refusal, model allowlist, option-lookalike rejection, pre-launch validation, failed-turn isError with retained data, exit/wall-time failures, lossless cached output and safe previews, orphan reaping, concurrency refusal, nested depth refusal, refresh, surviving close, quiet shutdown, structured content with JSON fallback",
    )
  } finally {
    for (const api of clients) await api.client.close().catch(() => {})
    await rm(scratch, { recursive: true, force: true })
  }
}

/**
 * A client that hangs up with no harness installed must leave the server dead
 * quiet. The recursion that this used to hide is covered directly in
 * `tests/lifecycle.test.ts`; this keeps the whole process honest end to end.
 */
async function verifyCleanShutdown() {
  const bun = Bun.which("bun")
  if (!bun) throw new Error("bun is not on PATH, so the server cannot be started directly")
  const fakeHome = await mkdtemp(path.join(tmpdir(), "agent-delegate-home-"))
  try {
    // PATH is emptied so startup finds no harness at all: only the two tools are
    // left, and nothing here may depend on a harness being installed. stdin is a
    // pipe rather than /dev/null, because a hang-up has to be an observable event.
    const child = spawn(bun, ["--no-env-file", path.join(root, "src/server.ts")], {
      cwd: root,
      env: { ...process.env, PATH: "", HOME: fakeHome },
      stdio: ["pipe", "pipe", "pipe"],
    })
    let stderr = ""
    child.stderr?.on("data", (chunk) => {
      stderr = (stderr + chunk.toString()).slice(-8192)
    })
    // Startup detects harnesses before it installs its shutdown handlers, so
    // hanging up immediately would race past them.
    await Bun.sleep(750)
    child.stdin?.end()
    const code = await new Promise<number | null>((resolve) => {
      child.on("close", resolve)
    })
    expect({ code, stderr }).toEqual({ code: 0, stderr: "" })
  } finally {
    await rm(fakeHome, { recursive: true, force: true })
  }
}

/** One real turn, paid for in model time. Opt in with DELEGATE_E2E_REAL=1. */
async function verifyRealHarness() {
  const scratch = await mkdtemp(path.join(tmpdir(), "agent-delegate-real-"))
  const client = new Client({ name: "delegate-e2e-real", version: "1" })
  try {
    const transport = new StdioClientTransport({
      command: path.resolve(root, "bin/mcp-delegate"),
      cwd: scratch,
      env: { ...process.env, DELEGATE_DEPTH: "" },
      stderr: "pipe",
    })
    await client.connect(transport)
    const response = await client.callTool({
      name: "delegate_run",
      arguments: {
        harness: "claude",
        prompt: "Reply with exactly this word and nothing else: DELEGATE_OK",
        workdir: scratch,
        wallTimeMs: 180_000,
      },
    })
    const output = response.structuredContent as { ok: boolean; data?: DelegateOutput }
    expect(output.data?.ok).toBe(true)
    expect(output.data?.stdout).toContain("DELEGATE_OK")
    console.log(`PASS: live claude turn in ${output.data?.durationMs}ms`)
    await transport.close()
  } finally {
    await client.close().catch(() => {})
    await rm(scratch, { recursive: true, force: true })
  }
}

if (!enabled) throw new Error("Set DELEGATE_E2E=1 to authorize disposable delegation verification")
await verifyStubbedEndToEnd()
await verifyCleanShutdown()
if (process.env.DELEGATE_E2E_REAL === "1") await verifyRealHarness()
