import { expect } from "bun:test"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { Client } from "@modelcontextprotocol/sdk@1/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk@1/client/stdio.js"
import type { ContainerView, ExecResult } from "../src/contracts"
import { run } from "../src/process"

const enabled = process.env.CONTAINER_SANDBOX_E2E === "1"
const root = path.resolve(import.meta.dir, "..")
function expectJsonFallback(content: unknown, output: unknown) {
  const first: unknown = Array.isArray(content) ? content[0] : undefined
  if (!first || typeof first !== "object" || !("text" in first) || typeof first.text !== "string") {
    throw new Error("MCP response is missing its JSON text fallback")
  }
  expect(JSON.parse(first.text)).toEqual(output)
}
async function docker(args: string[]) {
  const result = await run(["docker", ...args])
  if (result.exitCode !== 0) throw new Error(`Docker ${args[0]} failed: ${result.stderr}`)
  return result.stdout
}
async function present(id: string) {
  return (await docker(["ps", "-a", "--no-trunc", "--format", "{{.ID}}"]))
    .trim()
    .split("\n")
    .includes(id)
}
async function waitRemoved(id: string, milliseconds = 10000) {
  const end = Date.now() + milliseconds
  while (await present(id)) {
    if (Date.now() >= end) throw new Error(`Feature container still present: ${id}`)
    await Bun.sleep(200)
  }
}
async function connect() {
  const transport = new StdioClientTransport({
    command: path.resolve(root, "../../../.local/bin/mcp-sandbox"),
    cwd: root,
    env: { ...process.env, CONTAINER_SANDBOX_HOST_ONLY: "not-forwarded-to-container" },
    stderr: "pipe",
  })
  let diagnostics = ""
  transport.stderr?.on("data", (chunk) => {
    diagnostics = (diagnostics + chunk.toString()).slice(-8192)
  })
  const client = new Client({ name: "container-e2e", version: "1" })
  try {
    await client.connect(transport)
  } catch (error) {
    await transport.close()
    throw new Error(`${error}; server stderr: ${diagnostics}`)
  }
  async function call<T>(
    name: string,
    input: Record<string, unknown>,
    session = "session-a",
  ): Promise<T> {
    const response = await client.callTool({
      name,
      arguments: input,
      _meta: { "ai.opencode/sessionID": session },
    })
    const output = response.structuredContent as { ok: boolean; data: T; error?: string }
    expectJsonFallback(response.content, output)
    if (!output.ok && !(name === "container_exec" && output.data)) throw new Error(output.error)
    return output.data
  }
  return { client, transport, call }
}

async function verifyEndToEnd() {
  const workspace = await mkdtemp(path.join(tmpdir(), "agent-container-e2e-"))
  const ids = new Set<string>()
  const clients: Awaited<ReturnType<typeof connect>>[] = []
  const settings = {
    workspace,
    idleSeconds: 60,
    budgets: { cpus: 0.25, memoryBytes: 134217728, pids: 32, tmpfsBytes: 8388608 },
  }
  try {
    await writeFile(path.join(workspace, "fixture"), "workspace-visible")
    const api = await connect()
    clients.push(api)
    const catalog = await api.client.listTools()
    expect(catalog.tools.map((tool) => tool.name).sort()).toEqual([
      "container_acquire",
      "container_exec",
      "container_release",
      "sandbox_pure",
      "sandbox_ro",
      "sandbox_rw",
    ])
    for (const name of ["sandbox_pure", "sandbox_ro", "sandbox_rw"]) {
      const tool = catalog.tools.find((tool) => tool.name === name)
      if (!tool) throw new Error(`Missing expected tool: ${name}`)
      expect(Object.keys(tool.inputSchema.properties ?? {}).sort()).toEqual([
        "command",
        "limits",
        "workdir",
      ])
      expect(tool.outputSchema?.properties).toHaveProperty("exitCode")
      const failure = await api.client.callTool({
        name,
        arguments: { command: "printf must-not-run", limits: { cpuHardSeconds: 30 } },
      })
      const output = failure.structuredContent as {
        exitCode: number | null
        stdout: string
        termination: string
        limitsApplied: boolean
      }
      expect(failure.isError).toBe(true)
      expect(output.stdout).toBe("")
      expect(output.termination).toBe("setup_error")
      expect(output.limitsApplied).toBe(false)
      expectJsonFallback(failure.content, output)
    }
    async function acquire(overrides: Record<string, unknown> = {}, session = "session-a") {
      const lease = await api.call<ContainerView>(
        "container_acquire",
        { ...settings, ...overrides },
        session,
      )
      ids.add(lease.containerId)
      return lease
    }
    const ro = await acquire()
    const isolation = await api.call<ExecResult>("container_exec", {
      container: ro.container,
      command: `id -u; cat fixture; test ! -e /sys/class/net/eth0; test -z "\${CONTAINER_SANDBOX_HOST_ONLY:-}"; printf warning >&2; exit 7`,
    })
    expect(isolation.exitCode).toBe(7)
    expect(isolation.stdout).toBe(`${process.getuid?.() || 1000}\nworkspace-visible`)
    expect(isolation.stderr).toBe("warning")
    expect(isolation.containerDestroyed).toBe(false)
    const denied = await api.call<ExecResult>("container_exec", {
      container: ro.container,
      command: "touch cannot-write-workspace",
    })
    expect(denied.exitCode).not.toBe(0)
    const rootDenied = await api.call<ExecResult>("container_exec", {
      container: ro.container,
      command: "touch /etc/cannot-write-root",
    })
    expect(rootDenied.exitCode).not.toBe(0)
    const controlDenied = await api.call<ExecResult>("container_exec", {
      container: ro.container,
      command: "ls /run/agent-sandbox",
    })
    expect(controlDenied.exitCode).not.toBe(0)
    const inspect = JSON.parse(await docker(["inspect", ro.containerId]))[0]
    expect(inspect.HostConfig.Memory).toBe(134217728)
    expect(inspect.HostConfig.MemorySwap).toBe(134217728)
    expect(inspect.HostConfig.PidsLimit).toBe(32)
    expect(inspect.HostConfig.NanoCpus).toBe(250000000)
    expect(inspect.HostConfig.ReadonlyRootfs).toBe(true)
    expect(inspect.HostConfig.NetworkMode).toBe("none")
    expect(inspect.HostConfig.LogConfig.Type).toBe("none")
    const kernelLimits = await api.call<ExecResult>("container_exec", {
      container: ro.container,
      command:
        "cat /sys/fs/cgroup/memory.max /sys/fs/cgroup/memory.swap.max /sys/fs/cgroup/pids.max; df -B1 /tmp | tail -1 | awk '{print $2}'",
    })
    expect(kernelLimits.exitCode).toBe(0)
    expect(kernelLimits.stdout).toBe("134217728\n0\n32\n8388608\n")
    const scratch = await api.call<ExecResult>("container_exec", {
      container: ro.container,
      command:
        "printf '#!/bin/sh\\nexit 0\\n' > /tmp/deliverable; chmod +x /tmp/deliverable; /tmp/deliverable",
    })
    expect(scratch.exitCode).toBe(0)
    const hiddenEnv = await api.call<ExecResult>("container_exec", {
      container: ro.container,
      command: `test -z "\${CONTAINER_SANDBOX_HOST_ONLY:-}" && test ! -S /var/run/docker.sock && test ! -e /sys/class/net/eth0`,
    })
    expect(hiddenEnv.exitCode).toBe(0)
    await expect(
      api.call("container_exec", { container: ro.container, command: "true" }, "session-b"),
    ).rejects.toThrow()
    await api.call("container_release", { container: ro.container })
    await waitRemoved(ro.containerId)
    expect(
      (await api.call<{ released: boolean }>("container_release", { container: ro.container }))
        .released,
    ).toBe(false)

    // The default journey needs no host path, renewal, attachment or status call.
    const clean = await api.call<ContainerView>("container_acquire", {})
    ids.add(clean.containerId)
    const cleanInspect = JSON.parse(await docker(["inspect", clean.containerId]))[0]
    expect(
      cleanInspect.Mounts.filter((mount: { Type: string }) => mount.Type === "bind"),
    ).toHaveLength(0)
    const cleanRun = await api.call<ExecResult>("container_exec", {
      container: clean.container,
      command:
        "test ! -e fixture && printf '#!/bin/sh\\nprintf delivered\\n' > deliverable && chmod +x deliverable && ./deliverable",
    })
    expect(cleanRun.exitCode).toBe(0)
    expect(cleanRun.stdout).toBe("delivered")
    await api.call("container_release", { container: clean.container })

    const rw = await acquire({ access: "rw" })
    const write = await api.call<ExecResult>("container_exec", {
      container: rw.container,
      command: "printf written > explicit-write; cat explicit-write",
    })
    expect(write.exitCode).toBe(0)
    expect(write.stdout).toBe("written")
    const separate = await acquire()
    expect(separate.containerId).not.toBe(rw.containerId)
    await api.call("container_release", { container: rw.container })
    await api.call("container_release", { container: separate.container })

    const overflowLease = await acquire()
    const overflow = await api.call<ExecResult>("container_exec", {
      container: overflowLease.container,
      command: "printf 1234567890",
      maxOutputBytes: 4,
    })
    expect(overflow.termination).toBe("output_limit")
    expect(overflow.stdout).toBe("1234")
    expect(overflow.truncated.stdout).toBe(true)
    expect(overflow.containerDestroyed).toBe(true)
    await waitRemoved(overflowLease.containerId)

    const deadlineLease = await acquire()
    const timed = await api.call<ExecResult>("container_exec", {
      container: deadlineLease.container,
      command: "sleep 10",
      wallTimeMs: 200,
    })
    expect(timed.termination).toBe("timeout")
    expect(timed.containerDestroyed).toBe(true)
    await waitRemoved(deadlineLease.containerId)

    const expiring = await acquire({ idleSeconds: 2 })
    const longRun = await api.call<ExecResult>("container_exec", {
      container: expiring.container,
      command: "sleep 3; printf alive",
      wallTimeMs: 5000,
    })
    expect(longRun.exitCode).toBe(0)
    expect(longRun.stdout).toBe("alive")
    const refreshed = await api.call<ExecResult>("container_exec", {
      container: expiring.container,
      command: "printf refreshed",
    })
    expect(refreshed.stdout).toBe("refreshed")
    await waitRemoved(expiring.containerId)
    await expect(
      api.call("container_exec", { container: expiring.container, command: "true" }),
    ).rejects.toThrow()
    const replacement = await acquire()
    await api.call("container_release", { container: replacement.container })

    const crashApi = await connect()
    clients.push(crashApi)
    const orphan = await crashApi.call<ContainerView>("container_acquire", {
      ...settings,
      idleSeconds: 3,
    })
    ids.add(orphan.containerId)
    if (!crashApi.transport.pid) throw new Error("Missing MCP PID")
    process.kill(crashApi.transport.pid, "SIGKILL")
    await waitRemoved(orphan.containerId)

    const orderly = await acquire()
    await api.client.close()
    await waitRemoved(orderly.containerId)
    console.log(
      "PASS: unified legacy launcher/host contracts, three-call clean executable workspace, session isolation, effective budgets, explicit rw, automatic idle refresh/expiry/reacquire, output/time destruction, SIGKILL fallback, graceful close",
    )
  } finally {
    for (const api of clients) await api.client.close().catch(() => {})
    for (const id of ids) {
      // Only exact IDs created and recorded by this test; never global prune/label adoption.
      if (await present(id)) await docker(["rm", "--force", id])
    }
    await rm(workspace, { recursive: true, force: true })
    for (const id of ids) expect(await present(id)).toBe(false)
  }
}
if (!enabled)
  throw new Error("Set CONTAINER_SANDBOX_E2E=1 to authorize disposable Docker verification")
await verifyEndToEnd()
