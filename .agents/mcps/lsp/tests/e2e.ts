import assert from "node:assert/strict"
import { chmod, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { Client } from "@modelcontextprotocol/sdk@1/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk@1/client/stdio.js"
import { discover } from "../src/discovery.ts"
import { supportedMethods } from "../src/methods.ts"
import { recipes, wrapperName } from "../src/recipes.ts"

const workspace = await mkdtemp(join(tmpdir(), "lsp-mcp-e2e-"))
const projectBin = join(workspace, ".venv/bin")
const globalBin = join(workspace, "global-bin")
await mkdir(projectBin, { recursive: true })
await mkdir(globalBin)
await mkdir(join(workspace, ".git"))
const fixture = resolve(import.meta.dir, "fake-lsp.ts")
const entrypoint = resolve(import.meta.dir, "../bin/mcp-lsp")
for (const directory of [projectBin, globalBin]) {
  const path = join(directory, "pyright-langserver")
  await writeFile(path, `#!${process.execPath}\nawait import(${JSON.stringify(fixture)});\n`)
  await chmod(path, 0o755)
  for (const [name, args] of [
    ["ty", ["server"]],
    ["pyrefly", ["lsp"]],
    ["basedpyright-langserver", ["--stdio"]],
  ] as const) {
    const launcher = join(directory, name)
    await writeFile(
      launcher,
      `#!${process.execPath}\nif (JSON.stringify(process.argv.slice(2)) !== ${JSON.stringify(JSON.stringify(args))}) process.exit(42);\nawait import(${JSON.stringify(fixture)});\n`,
    )
    await chmod(launcher, 0o755)
  }
}
const transports: StdioClientTransport[] = []
async function cleanup() {
  await Promise.allSettled(transports.map((transport) => transport.close()))
  await rm(workspace, { recursive: true, force: true })
}

function decode<T>(response: unknown): T {
  const value = response as { content: { text: string }[] }
  const first = value.content[0]
  assert(first && typeof first.text === "string")
  return JSON.parse(first.text) as T
}

async function connect() {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ["--no-env-file", entrypoint],
    cwd: workspace,
    env: Object.fromEntries(
      Object.entries({ ...process.env, PATH: globalBin }).filter(
        (entry): entry is [string, string] => entry[1] !== undefined,
      ),
    ),
    stderr: "pipe",
  })
  transports.push(transport)
  transport.stderr?.on("data", (chunk) => process.stderr.write(chunk))
  const client = new Client({ name: "lsp-e2e", version: "1" })
  await client.connect(transport)
  return client
}

async function discoveryCheck() {
  assert.equal(new Set(recipes.map((recipe) => recipe.id)).size, recipes.length)
  assert.equal(new Set(recipes.map((recipe) => wrapperName(recipe.name, ""))).size, recipes.length)
  // Snapshot of Mason registry package identities, not lspconfig aliases or binary names.
  assert.deepEqual(Object.fromEntries(recipes.map(({ id, name }) => [id, name])), {
    typescript: "typescript-language-server",
    ty: "ty",
    pyrefly: "pyrefly",
    pyright: "pyright",
    basedpyright: "basedpyright",
    rust: "rust-analyzer",
    go: "gopls",
    bash: "bash-language-server",
    dockerfile: "dockerfile-language-server",
    markdown: "marksman",
    typst: "tinymist",
    makefile: "autotools-language-server",
    yaml: "yaml-language-server",
    json: "json-lsp",
    html: "html-lsp",
    css: "css-lsp",
    vue: "vue-language-server",
    tailwind: "tailwindcss-language-server",
  })
  const allCapabilities: Record<string, unknown> = Object.fromEntries(
    [
      "hoverProvider",
      "definitionProvider",
      "declarationProvider",
      "typeDefinitionProvider",
      "implementationProvider",
      "referencesProvider",
      "documentSymbolProvider",
      "completionProvider",
      "signatureHelpProvider",
      "documentHighlightProvider",
      "foldingRangeProvider",
      "selectionRangeProvider",
      "documentFormattingProvider",
      "documentRangeFormattingProvider",
      "diagnosticProvider",
      "workspaceSymbolProvider",
    ].map((provider) => [provider, { resolveProvider: true }]),
  )
  allCapabilities.textDocumentSync = 1
  for (const recipe of recipes) {
    for (const { method } of supportedMethods(allCapabilities)) {
      assert.match(wrapperName(recipe.name, method), /^[A-Za-z0-9_]{1,64}$/)
    }
  }
  const records = await discover(workspace, globalBin)
  const python = records.find((record) => record.id === "pyright")
  assert.equal(python?.executable, join(projectBin, "pyright-langserver"))
  assert.deepEqual(
    records.filter((record) => record.languageIds.includes("python")).map((record) => record.id),
    ["ty", "pyrefly", "pyright", "basedpyright"],
  )
  assert(
    records.every((record) => record.source.startsWith("project:") || record.source === "PATH"),
  )
}

async function pythonRecipeCheck() {
  const client = await connect()
  const sessions = new Map<string, string>()
  for (const id of ["ty", "pyrefly", "pyright"]) {
    const response = await client.callTool({ name: "start", arguments: { id } })
    assert(!response.isError)
    const result = decode<{ session: string; recipe: string; server: string }>(response)
    assert.equal(result.recipe, id)
    assert.equal(result.server, id)
    sessions.set(id, result.session)
  }
  const names = async () => (await client.listTools()).tools.map((tool) => tool.name).sort()
  const before = (await names()).filter((name) => name.startsWith("lsp_ty_"))
  assert(before.includes("lsp_ty_textDocument_hover"))
  assert(!(await names()).some((name) => /^lsp_s\d+_/.test(name)))
  assert(
    !(await client.callTool({ name: "stop", arguments: { session: sessions.get("ty") } })).isError,
  )
  assert(!(await names()).some((name) => name.startsWith("lsp_ty_")))
  for (const id of ["pyrefly", "pyright"]) {
    assert((await names()).includes(`lsp_${id}_textDocument_hover`))
  }
  const uri = `file://${workspace}/survivor.py`
  await client.callTool({
    name: "lsp_pyrefly_textDocument_didOpen",
    arguments: {
      params: {
        textDocument: { uri, languageId: "python", version: 1, text: "x" },
      },
    },
  })
  assert(
    !(
      await client.callTool({
        name: "lsp_pyrefly_textDocument_hover",
        arguments: {
          params: {
            textDocument: { uri },
            position: { line: 0, character: 0 },
          },
        },
      })
    ).isError,
  )
  const restarted = decode<{ session: string }>(
    await client.callTool({ name: "start", arguments: { id: "ty" } }),
  )
  assert.notEqual(restarted.session, sessions.get("ty"))
  assert.deepEqual(
    (await names()).filter((name) => name.startsWith("lsp_ty_")),
    before,
  )
  sessions.set("ty", restarted.session)
  for (const session of sessions.values()) {
    assert(!(await client.callTool({ name: "stop", arguments: { session } })).isError)
  }
  assert(!(await names()).some((name) => name.startsWith("lsp_")))
  await client.close()
}

async function protocolCheck() {
  const client = await connect()
  assert.deepEqual((await client.listTools()).tools.map((tool) => tool.name).sort(), [
    "discover",
    "events",
    "start",
    "stop",
  ])
  const discovered = decode<{ installed: { id: string }[] }>(
    await client.callTool({ name: "discover", arguments: {} }),
  )
  assert(discovered.installed.some((recipe: { id: string }) => recipe.id === "pyright"))
  const started = decode<{ session: string }>(
    await client.callTool({
      name: "start",
      arguments: { id: "pyright", settings: { test: { answer: 42 } } },
    }),
  )
  assert.equal(started.session, "s1")
  const tools = (await client.listTools()).tools.map((tool) => tool.name)
  assert(tools.includes("lsp_pyright_textDocument_hover"))
  assert(!tools.includes("lsp_pyright_textDocument_definition"))
  assert(tools.includes("lsp_pyright_completionItem_resolve"))
  const call = async (method: string, params: object) =>
    client.callTool({ name: `lsp_pyright_${method}`, arguments: { params } })
  const uri = `file://${workspace}/unicode.py`
  await call("textDocument_didOpen", {
    textDocument: { uri, languageId: "python", version: 1, text: "😀x" },
  })
  const duplicate = await call("textDocument_didOpen", {
    textDocument: { uri, languageId: "python", version: 1, text: "😀x" },
  })
  assert.equal(duplicate.isError, true)
  const native = { textDocument: { uri }, position: { line: 0, character: 2 } }
  const hover = decode<{
    params: unknown
    calls: unknown
    configuration: unknown
    edit: { applied: boolean }
  }>(await call("textDocument_hover", native))
  assert.deepEqual(hover.params, native)
  assert.deepEqual(hover.calls, ["open"])
  assert.deepEqual(hover.configuration, [42, null])
  assert.equal(hover.edit.applied, false)
  await call("textDocument_didChange", {
    textDocument: { uri, version: 2 },
    contentChanges: [{ text: "😀y" }],
  })
  assert.equal(
    (
      await call("textDocument_didChange", {
        textDocument: { uri, version: 2 },
        contentChanges: [{ text: "z" }],
      })
    ).isError,
    true,
  )
  const events = decode<{ entries: { method: string }[] }>(
    await client.callTool({ name: "events", arguments: { session: "s1" } }),
  )
  assert(
    events.entries.some(
      (entry: { method: string }) => entry.method === "textDocument/publishDiagnostics",
    ),
  )
  await call("textDocument_didClose", { textDocument: { uri } })
  await client.callTool({ name: "stop", arguments: { session: "s1" } })
  assert(!(await client.listTools()).tools.some((tool) => tool.name.startsWith("lsp_pyright_")))
  await client.close()
}

async function encodingCheck() {
  const client = await connect()
  const response = await client.callTool({
    name: "start",
    arguments: { id: "pyright", initializationOptions: { encoding: "utf-8" } },
  })
  assert.equal(response.isError, true)
  assert.equal((await client.listTools()).tools.length, 4)
  assert.equal(
    decode<{ session: string }>(
      await client.callTool({ name: "start", arguments: { id: "pyright" } }),
    ).session,
    "s2",
  )
  await client.close()
}

async function crashCheck() {
  const client = await connect()
  await client.callTool({
    name: "start",
    arguments: { id: "pyright", initializationOptions: { crash: true } },
  })
  const response = await client.callTool({
    name: "lsp_pyright_textDocument_hover",
    arguments: { params: {} },
  })
  assert.equal(response.isError, true)
  assert(!(await client.listTools()).tools.some((tool) => tool.name.startsWith("lsp_pyright_")))
  await client.close()
}

async function concurrentStartCheck() {
  const client = await connect()
  const responses = await Promise.all(
    Array.from({ length: 3 }, () =>
      client.callTool({ name: "start", arguments: { id: "pyright" } }),
    ),
  )
  assert.equal(responses.filter((response) => !response.isError).length, 1)
  assert.equal(responses.filter((response) => response.isError).length, 2)
  await client.close()
}

async function cleanupCheck() {
  const { LspClient } = await import("../src/client.ts")
  for (const initializationOptions of [{ hang: true }, { stubborn: true }]) {
    const client = new LspClient({
      executable: process.execPath,
      args: ["--no-env-file", fixture],
      cwd: workspace,
      initializationOptions,
      requestTimeoutMs: 100,
      onEvent() {},
      onExit() {},
    })
    let pid: number | undefined
    try {
      await client.initialize()
      if (initializationOptions.hang)
        await assert.rejects(client.call("textDocument/hover", {}), /timed out/)
      else pid = ((await client.call("textDocument/hover", {})) as { processId: number }).processId
    } finally {
      await client.stop()
      await client.stop()
    }
    if (pid !== undefined) assert.throws(() => process.kill(pid, 0), { code: "ESRCH" })
  }
}

const deadline = setTimeout(() => {
  console.error("E2E deadline exceeded")
  process.exit(1)
}, 60_000)
try {
  await discoveryCheck()
  await protocolCheck()
  await encodingCheck()
  await crashCheck()
  await concurrentStartCheck()
  await pythonRecipeCheck()
  await cleanupCheck()
  console.log(
    "PASS discovery, Python preference/launch arguments, MCP entrypoint, capability wrappers, sync, encoding isolation, child death, timeout and forced cleanup",
  )
} finally {
  clearTimeout(deadline)
  await cleanup()
}
