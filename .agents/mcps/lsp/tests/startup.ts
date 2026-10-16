import assert from "node:assert/strict"
import { mkdtemp, rm } from "node:fs/promises"
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
  assert.deepEqual((await client.listTools()).tools.map((tool) => tool.name).sort(), [
    "discover",
    "events",
    "start",
    "stop",
  ])
  const result = await client.callTool({ name: "discover", arguments: {} })
  assert.notEqual(result.isError, true)
  console.log(`PASS executable startup, initialize, tools/list and discover: ${command}`)
} finally {
  await transport.close()
  clearTimeout(deadline)
  await rm(cwd, { recursive: true, force: true })
}
