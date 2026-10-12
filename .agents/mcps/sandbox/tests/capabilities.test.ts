import { expect, test } from "bun:test"
import { spawn } from "node:child_process"
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"

// Startup capability behavior of the real src/server.ts over real MCP stdio:
// synthetic engine executables under per-test scratch decide detection; a real
// Podman or Docker engine must never be reached. The bun test runner cannot
// resolve the major-versioned SDK imports, so this runner imports only
// bun:test and standard Node/Bun APIs and spawns a generated scratch probe
// script via bun (not bun test). The probe drives the actual SDK
// Client/StdioClientTransport with normal @1 imports and reports
// {instructions, toolNames, diagnostics} as one JSON object on stdout.
const root = path.resolve(import.meta.dir, "..")
const serverPath = path.join(root, "src", "server.ts")
const HOST_TOOLS = ["sandbox_pure", "sandbox_ro", "sandbox_rw"]
const ALL_TOOLS = [
  "container_acquire",
  "container_exec",
  "container_release",
  "sandbox_pure",
  "sandbox_ro",
  "sandbox_rw",
]
const LEAK_MARKER = "private-engine-stderr-must-not-leak"
const MAX_CAPTURE_BYTES = 262_144
const WATCHDOG_MS = 30_000
const TEST_TIMEOUT_MS = 40_000
type EngineState = "healthy" | "failing" | "absent"
type ProbeOutput = { instructions: string; toolNames: string[]; diagnostics: string }

// Generated into per-test scratch only, never a committed file. Normal
// major-qualified SDK imports; launches the real server with a PATH that
// contains only the synthetic engine binaries.
const PROBE_HELPER = [
  'import { Client } from "@modelcontextprotocol/sdk@1/client/index.js"',
  'import { StdioClientTransport } from "@modelcontextprotocol/sdk@1/client/stdio.js"',
  "",
  "const [serverPath, binDir] = process.argv.slice(2)",
  'if (!serverPath || !binDir) throw new Error("usage: probe <serverPath> <binDir>")',
  'let diagnostics = ""',
  "const transport = new StdioClientTransport({",
  "  command: process.execPath,",
  '  args: ["--no-env-file", serverPath],',
  "  // Only synthetic engines are reachable, including when an engine is absent.",
  "  env: { ...process.env, PATH: binDir },",
  '  stderr: "pipe",',
  "})",
  'transport.stderr?.on("data", (chunk) => {',
  "  diagnostics = (diagnostics + chunk.toString()).slice(-8192)",
  "})",
  'const client = new Client({ name: "capabilities-probe", version: "1" })',
  "try {",
  "  await client.connect(transport)",
  "  const catalog = await client.listTools()",
  "  process.stdout.write(",
  "    JSON.stringify({",
  '      instructions: client.getInstructions() ?? "",',
  "      toolNames: catalog.tools.map((tool) => tool.name).sort(),",
  "      diagnostics,",
  "    }),",
  "  )",
  "} finally {",
  "  await client.close()",
  "  await transport.close()",
  "}",
  "",
].join("\n")

async function writeEngine(bin: string, name: string, state: Exclude<EngineState, "absent">) {
  const script =
    state === "healthy"
      ? "#!/bin/sh\nexit 0\n"
      : `#!/bin/sh\nprintf '%s' '${LEAK_MARKER}' >&2\nexit 1\n`
  await writeFile(path.join(bin, name), script, { mode: 0o755 })
}

/** Spawn the scratch probe in its own process group with bounded stdout/stderr capture. */
function probeServer(helperPath: string, bin: string): Promise<ProbeOutput> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["--no-env-file", helperPath, serverPath, bin], {
      cwd: root,
      // Inherit for bun's module cache; the server child still gets only bin on PATH.
      env: { ...process.env },
      stdio: ["ignore", "pipe", "pipe"],
      // Own process group so the watchdog terminates helper and server together.
      detached: true,
    })
    let stdout = ""
    let stderr = ""
    let settled = false
    const terminateGroup = (): string | undefined => {
      if (child.pid === undefined) return "child has no pid"
      try {
        process.kill(-child.pid, "SIGKILL")
        return undefined
      } catch (error) {
        // ESRCH: the group already exited; nothing further to terminate.
        return (error as NodeJS.ErrnoException).code === "ESRCH"
          ? undefined
          : `group termination failed: ${String(error)}`
      }
    }
    const watchdog = setTimeout(() => {
      if (settled) return
      settled = true
      const failure = terminateGroup()
      reject(
        new Error(
          failure
            ? `watchdog: probe timed out and ${failure}`
            : "watchdog: initialize/catalog handshake timed out",
        ),
      )
    }, WATCHDOG_MS)
    const capture = (stream: "stdout" | "stderr", chunk: Buffer) => {
      if (stream === "stdout") stdout += chunk.toString()
      else stderr += chunk.toString()
      if (!settled && stdout.length + stderr.length > MAX_CAPTURE_BYTES) {
        settled = true
        clearTimeout(watchdog)
        const failure = terminateGroup()
        reject(
          new Error(
            failure
              ? `probe output budget exceeded and ${failure}`
              : "probe output budget exceeded",
          ),
        )
      }
    }
    child.stdout?.on("data", (chunk: Buffer) => capture("stdout", chunk))
    child.stderr?.on("data", (chunk: Buffer) => capture("stderr", chunk))
    child.on("error", (error) => {
      if (settled) return
      settled = true
      clearTimeout(watchdog)
      reject(error)
    })
    child.on("close", (code) => {
      if (settled) return
      settled = true
      clearTimeout(watchdog)
      if (code !== 0) {
        reject(new Error(`probe exited with status ${String(code)}: ${stderr.slice(-2048)}`))
        return
      }
      try {
        resolve(JSON.parse(stdout) as ProbeOutput)
      } catch (error) {
        reject(new Error(`probe emitted invalid JSON: ${String(error)}`))
      }
    })
  })
}

async function runProbe(engines: Record<"podman" | "docker", EngineState>): Promise<ProbeOutput> {
  const scratch = await mkdtemp(path.join(tmpdir(), "sandbox-capabilities-"))
  try {
    const bin = path.join(scratch, "bin")
    await mkdir(bin)
    for (const name of ["podman", "docker"] as const) {
      const state = engines[name]
      if (state !== "absent") await writeEngine(bin, name, state)
    }
    const helperPath = path.join(scratch, "probe.ts")
    await writeFile(helperPath, PROBE_HELPER, { mode: 0o644 })
    return await probeServer(helperPath, bin)
  } finally {
    // Teardown failures surface as errors; scratch is agent-created and always removed.
    await rm(scratch, { recursive: true, force: true })
  }
}

test(
  "both engines usable selects podman and appends only its scoped container block",
  async () => {
    const probe = await runProbe({ podman: "healthy", docker: "healthy" })
    expect(probe.toolNames).toEqual(ALL_TOOLS)
    expect(probe.instructions).toContain("<host_sandbox>")
    expect(probe.instructions).toContain('<container_sandbox engine="podman">')
    expect(probe.instructions).not.toContain('engine="docker"')
    expect(probe.diagnostics).not.toContain(LEAK_MARKER)
  },
  TEST_TIMEOUT_MS,
)

test(
  "failed podman probe skips to docker without leaking probe output",
  async () => {
    const probe = await runProbe({ podman: "failing", docker: "healthy" })
    expect(probe.toolNames).toEqual(ALL_TOOLS)
    expect(probe.instructions).toContain("<host_sandbox>")
    expect(probe.instructions).toContain('<container_sandbox engine="docker">')
    expect(probe.diagnostics).not.toContain(LEAK_MARKER)
  },
  TEST_TIMEOUT_MS,
)

test(
  "absent podman skips to docker without reaching any real host engine",
  async () => {
    const probe = await runProbe({ podman: "absent", docker: "healthy" })
    expect(probe.toolNames).toEqual(ALL_TOOLS)
    expect(probe.instructions).toContain("<host_sandbox>")
    expect(probe.instructions).toContain('<container_sandbox engine="docker">')
    expect(probe.diagnostics).not.toContain(LEAK_MARKER)
  },
  TEST_TIMEOUT_MS,
)

test(
  "no usable engine serves exactly the host tools and host-only instructions",
  async () => {
    const probe = await runProbe({ podman: "failing", docker: "failing" })
    expect(probe.toolNames).toEqual(HOST_TOOLS)
    expect(probe.instructions).toContain("<host_sandbox>")
    expect(probe.instructions).not.toContain("<container_sandbox")
    expect(probe.instructions).not.toContain("container_acquire")
    expect(probe.diagnostics).not.toContain(LEAK_MARKER)
  },
  TEST_TIMEOUT_MS,
)
