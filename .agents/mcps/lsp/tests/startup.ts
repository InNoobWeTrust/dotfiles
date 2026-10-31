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
const staticTools = [
  "ast_grep_search",
  "definition",
  "diagnostics",
  "format",
  "hover",
  "references",
  "rename",
  "request",
  "symbols",
  "workspace_symbols",
]
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
  assert.deepEqual(initialTools, staticTools)
  console.log(`PASS executable startup, initialize and static tools/list: ${command}`)

  // Simulate an unavailable client dependency without touching the user's Bun cache.
  const isolatedRoot = join(cwd, "mcps/lsp")
  await mkdir(join(cwd, "mcps/shared/startup"), { recursive: true })
  await cp(
    join(import.meta.dir, "../../shared/startup/coordination.ts"),
    join(cwd, "mcps/shared/startup/coordination.ts"),
  )
  await cp(join(import.meta.dir, "../src"), join(isolatedRoot, "src"), { recursive: true })
  const failure = "LSP client dependency unavailable (startup fixture)"
  await writeFile(
    join(isolatedRoot, "src/language-service/protocol/client.ts"),
    `throw new Error(${JSON.stringify(failure)});\n`,
  )
  await mkdir(join(cwd, ".venv/bin"), { recursive: true })
  await writeFile(join(cwd, ".venv/bin/pyright-langserver"), "#!/bin/sh\nexit 99\n", {
    mode: 0o755,
  })
  await writeFile(join(cwd, "scratch.py"), "value = 1\n")
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
    const isolatedTools = (await isolatedClient.listTools()).tools.map((tool) => tool.name).sort()
    assert.deepEqual(isolatedTools, staticTools)
    for (let attempt = 0; attempt < 2; attempt++) {
      const failed = await isolatedClient.callTool({
        name: "hover",
        arguments: { file: "scratch.py", line: 1, character: 1 },
      })
      assert.equal(failed.isError, true)
      const content = failed.content as { text: string }[]
      assert.equal(JSON.parse(content[0]?.text ?? "null").error, failure)
    }
    assert((await isolatedClient.listTools()).tools.some((tool) => tool.name === "ast_grep_search"))
    console.log("PASS static tools without client dependency, semantic errors and slot recovery")
  } finally {
    await isolatedTransport.close()
  }
} finally {
  await transport.close()
  clearTimeout(deadline)
  await rm(cwd, { recursive: true, force: true })
}
