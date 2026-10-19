import assert from "node:assert/strict"
import { existsSync } from "node:fs"
import { mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { Client } from "@modelcontextprotocol/sdk@1/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk@1/client/stdio.js"

// Keep the driver on its normal cache; child MCPs get private caches under the scratch XDG root.
const root = resolve(import.meta.dir, "../..")
const servers = (await readdir(root))
  .filter((name) => existsSync(join(root, name, "bin", `mcp-${name}`)))
  .sort()
assert(servers.length > 0, "no MCP launchers discovered")
const hasLSP = servers.includes("lsp")
const scratch = await mkdtemp(join(tmpdir(), "mcp-startup-"))
const memory = join(scratch, "memory")
await mkdir(memory)
if (hasLSP) {
  await mkdir(join(scratch, ".venv/bin"), { recursive: true })
  await writeFile(join(scratch, ".venv/bin/pyright-langserver"),
    `#!${process.execPath}\nawait import(${JSON.stringify(join(root, "lsp/tests/fake-lsp.ts"))});\n`,
    { mode: 0o755 })
}
const env = Object.fromEntries(Object.entries({
  ...process.env,
  MEMORY_ROOT: memory,
  XDG_CACHE_HOME: join(scratch, "user-cache"),
}).filter((entry): entry is [string, string] => entry[1] !== undefined))

async function check(name: string, round: string) {
  const start = performance.now()
  assert(!existsSync(join(root, name, "node_modules")), `${name}: local dependencies mask startup`)
  let stderr = ""
  let timer: ReturnType<typeof setTimeout> | undefined
  const transport = new StdioClientTransport({
    command: join(root, name, "bin", `mcp-${name}`),
    args: [], cwd: scratch, env, stderr: "pipe",
  })
  transport.stderr?.on("data", (chunk) => { stderr = (stderr + chunk.toString()).slice(-16000) })
  const client = new Client({ name: "mcp-startup-regression", version: "1" })
  try {
    await Promise.race([
      (async () => {
        await client.connect(transport)
        assert.equal(client.getServerVersion()?.name, name)
        const tools = (await client.listTools()).tools
        assert(tools.length > 0, `${name}: no registered tools`)
        if (name === "lsp") {
          const started = await client.callTool({ name: "start", arguments: { id: "pyright" } })
          assert.notEqual(started.isError, true, JSON.stringify(started.content))
          const session = JSON.parse((started.content as { text: string }[])[0].text).session
          assert.equal(typeof session, "string")
          assert.notEqual((await client.callTool({ name: "stop", arguments: { session } })).isError, true)
        }
      })(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("60s startup deadline")), 60000)
      }),
    ])
    console.log(`PASS ${round} concurrent executable startup: ${name} (${Math.round(performance.now() - start)}ms)`)
  } catch (error) {
    throw new Error(`${round} ${name}: ${String(error)}\n${stderr}`)
  } finally {
    clearTimeout(timer)
    await transport.close()
  }
}

try {
  for (const round of ["cold-cache", "warm-cache"]) {
    // When available, two LSP instances also contend for lazy JSON-RPC loading.
    const concurrentServers = hasLSP ? [...servers, "lsp"] : servers
    const results = await Promise.allSettled(concurrentServers.map((name) => check(name, round)))
    const failures = results.filter((result) => result.status === "rejected")
    assert.equal(failures.length, 0, failures.map((failure) => String(failure.reason)).join("\n"))
    assert(!existsSync(join(scratch, "node_modules")), "startup must not create local dependencies")
  }
  // Per-MCP isolation: each launcher populated its own install cache below the
  // scratch XDG root and recorded that the dependency graph is warm.
  const agentRoot = join(scratch, "user-cache", "agent-mcps")
  for (const name of servers) {
    const install = join(agentRoot, "install", name)
    assert(existsSync(install), `${name}: no private install cache under the scratch XDG root`)
    assert((await readdir(install)).length > 0, `${name}: private install cache stayed empty`)
    const marker = join(agentRoot, "warm", name)
    const deadline = Date.now() + 5000
    while (!existsSync(marker) && Date.now() < deadline) await Bun.sleep(50)
    assert(existsSync(marker), `${name}: warm marker missing after successful startup`)
  }
} finally {
  await rm(scratch, { recursive: true, force: true })
}
