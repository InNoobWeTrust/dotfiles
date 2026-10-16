import assert from "node:assert/strict"
import { cp, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { delimiter, join, resolve } from "node:path"
import { Client } from "@modelcontextprotocol/sdk@1/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk@1/client/stdio.js"

// Exercise OS executable/shebang resolution, not `bun <script>` as in the protocol suite.
const command = resolve(process.argv[2] ?? join(import.meta.dir, "../bin/mcp-lsp"))
const cwd = await mkdtemp(join(tmpdir(), "lsp-startup-"))
const env = Object.fromEntries(
  Object.entries({
    ...process.env,
    XDG_CACHE_HOME: join(cwd, "cache"),
    PATH: (process.env.PATH ?? "")
      .split(delimiter)
      .filter((path) => !path.endsWith("/mcps/lsp/bin"))
      .join(delimiter),
  }).filter((entry): entry is [string, string] => entry[1] !== undefined),
)
const transport = new StdioClientTransport({ command, args: [], cwd, env, stderr: "pipe" })
transport.stderr?.on("data", (chunk) => process.stderr.write(chunk))
const client = new Client({ name: "lsp-startup", version: "1" })
const deadline = setTimeout(() => {
  console.error("Startup smoke timed out")
  process.exit(1)
}, 20000)
try {
  await client.connect(transport)
  const initialTools = (await client.listTools()).tools.map((tool) => tool.name).sort()
  const result = await client.callTool({ name: "discover", arguments: {} })
  assert.notEqual(result.isError, true)
  const discovered = JSON.parse((result.content as { text: string }[])[0]?.text ?? "null") as {
    astGrep: { available: boolean; supported: boolean }
  }
  assert.deepEqual(initialTools, [
    ...(discovered.astGrep.available && discovered.astGrep.supported
      ? ["ast_grep_discover", "ast_grep_search"]
      : []),
    "discover",
    "events",
    "start",
    "stop",
  ])
  console.log(`PASS executable startup, initialize, tools/list and discover: ${command}`)

  // Simulate an unavailable client dependency without touching the user's Bun cache.
  const isolatedRoot = join(cwd, "mcps/lsp")
  await mkdir(join(cwd, "mcps/shared"), { recursive: true })
  await cp(join(import.meta.dir, "../../shared/startup.ts"), join(cwd, "mcps/shared/startup.ts"))
  await cp(join(import.meta.dir, "../src"), join(isolatedRoot, "src"), { recursive: true })
  const failure = "LSP client dependency unavailable (startup fixture)"
  await writeFile(join(isolatedRoot, "src/client.ts"), `throw new Error(${JSON.stringify(failure)});\n`)
  await mkdir(join(cwd, ".venv/bin"), { recursive: true })
  await writeFile(join(cwd, ".venv/bin/pyright-langserver"), "#!/bin/sh\nexit 99\n", {
    mode: 0o755,
  })
  const isolatedTransport = new StdioClientTransport({
    command: process.execPath,
    args: ["--no-env-file", join(isolatedRoot, "src/server.ts")],
    cwd,
    env,
    stderr: "pipe",
  })
  isolatedTransport.stderr?.on("data", (chunk) => process.stderr.write(chunk))
  const isolatedClient = new Client({ name: "lsp-startup-isolation", version: "1" })
  try {
    await isolatedClient.connect(isolatedTransport)
    assert((await isolatedClient.listTools()).tools.some((tool) => tool.name === "discover"))
    assert.notEqual(
      (await isolatedClient.callTool({ name: "discover", arguments: {} })).isError,
      true,
    )
    for (let attempt = 0; attempt < 2; attempt++) {
      const failed = await isolatedClient.callTool({ name: "start", arguments: { id: "pyright" } })
      assert.equal(failed.isError, true)
      const content = failed.content as { text: string }[]
      assert.equal(JSON.parse(content[0]?.text ?? "null").error, failure)
    }
    assert.notEqual(
      (await isolatedClient.callTool({ name: "discover", arguments: {} })).isError,
      true,
    )
    console.log("PASS startup/discovery without client dependency, start errors and slot recovery")
  } finally {
    await isolatedTransport.close()
  }
} finally {
  await transport.close()
  clearTimeout(deadline)
  await rm(cwd, { recursive: true, force: true })
}
