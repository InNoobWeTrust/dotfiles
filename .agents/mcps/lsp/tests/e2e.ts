import assert from "node:assert/strict"
import { access, chmod, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { pathToFileURL } from "node:url"
import { Client } from "@modelcontextprotocol/sdk@1/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk@1/client/stdio.js"
import { discover } from "../src/discovery.ts"
import { recipeLanguages, recipes } from "../src/recipes.ts"

const workspace = await mkdtemp(join(tmpdir(), "lsp-mcp-e2e-"))
const projectBin = join(workspace, ".venv/bin")
const globalBin = join(workspace, "global-bin")
await mkdir(projectBin, { recursive: true })
await mkdir(globalBin)
await mkdir(join(workspace, ".git"))
const fixture = resolve(import.meta.dir, "fake-lsp.ts")
const entrypoint = resolve(import.meta.dir, "../bin/mcp-lsp")
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

interface LauncherConfig {
  expectArgs?: unknown[]
  env?: Record<string, unknown>
  tag?: string
  pidFile?: string
}
async function launcher(directory: string, name: string, config: LauncherConfig) {
  const lines = [`#!${process.execPath}`]
  if (config.expectArgs !== undefined) {
    lines.push(
      `if (JSON.stringify(process.argv.slice(2)) !== ${JSON.stringify(JSON.stringify(config.expectArgs))}) process.exit(42);`,
    )
  }
  if (config.env)
    lines.push(`process.env.LSP_FAKE_OPTIONS = ${JSON.stringify(JSON.stringify(config.env))};`)
  if (config.tag) lines.push(`process.env.LSP_FAKE_TAG = ${JSON.stringify(config.tag)};`)
  if (config.pidFile)
    lines.push(
      `process.env.LSP_FAKE_PID_FILE = ${JSON.stringify(join(workspace, config.pidFile))};`,
    )
  lines.push(`await import(${JSON.stringify(fixture)});`)
  const path = join(directory, name)
  await writeFile(path, `${lines.join("\n")}\n`)
  await chmod(path, 0o755)
}

for (const directory of [projectBin, globalBin]) {
  await launcher(directory, "pyright-langserver", { expectArgs: ["--stdio"] })
  await launcher(directory, "ty", { expectArgs: ["server"], tag: "ty", pidFile: "ty.pid" })
  await launcher(directory, "pyrefly", { expectArgs: ["lsp"] })
  await launcher(directory, "basedpyright-langserver", {
    expectArgs: ["--stdio"],
    env: { crash: true },
  })
}
await launcher(globalBin, "rust-analyzer", {
  expectArgs: [],
  env: { pullDiagnostics: true, definitions: 12, references: 120, workspaceSymbols: 60 },
  pidFile: "rust.pid",
})
await launcher(globalBin, "gopls", { expectArgs: [], env: { publish: "none" }, pidFile: "go.pid" })
await launcher(globalBin, "bash-language-server", {
  expectArgs: ["start"],
  env: { publish: "delayed", supports: { references: false } },
  pidFile: "bash.pid",
})
await launcher(globalBin, "marksman", {
  expectArgs: ["server"],
  env: { noRename: true, formatMode: "empty", definitions: 0, references: 0 },
})
await launcher(globalBin, "vue-language-server", {
  expectArgs: ["--stdio"],
  env: { renameFileOps: true, supports: { references: false } },
})
// The launcher is a POSIX sh shim over Bun: keep the hermetic PATH functional
// by adding exactly the executables the shim needs before it execs the server.
for (const name of ["dirname", "env", "bun"]) {
  const resolved = Bun.which(name)
  assert(resolved, `${name} must be resolvable for the launcher shim`)
  await symlink(resolved, join(globalBin, name))
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

async function connect(extra: Record<string, string> = {}) {
  const transport = new StdioClientTransport({
    command: entrypoint,
    args: [],
    cwd: workspace,
    env: Object.fromEntries(
      Object.entries({ ...process.env, PATH: globalBin, ...extra }).filter(
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

async function call<T>(client: Client, name: string, args: object): Promise<T> {
  const response = await client.callTool({ name, arguments: args })
  assert.notEqual(
    response.isError,
    true,
    `${name} failed: ${(response.content as { text: string }[])[0]?.text}`,
  )
  return decode<T>(response)
}

async function fails(client: Client, name: string, args: object): Promise<string> {
  const response = await client.callTool({ name, arguments: args })
  assert.equal(response.isError, true, `${name} unexpectedly succeeded`)
  const content = response.content as { text: string }[]
  const error = JSON.parse(content[0]?.text ?? "null") as { error?: string }
  return error.error ?? ""
}

const readText = (name: string) => readFile(join(workspace, name), "utf8")
const readPid = async (name: string) => Number(await readText(name))
const exists = (path: string) =>
  access(path).then(
    () => true,
    () => false,
  )
const alive = (pid: number) => {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}
async function waitForDead(pid: number, ms = 5000) {
  const end = Date.now() + ms
  while (Date.now() < end) {
    if (!alive(pid)) return true
    await Bun.sleep(50)
  }
  return false
}

async function metadataCheck() {
  assert.equal(recipes.length, 18)
  assert.equal(new Set(recipes.map((recipe) => recipe.id)).size, recipes.length)
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
  for (const recipe of recipes) {
    for (const extension of recipe.extensions) {
      assert(
        recipe.languages[extension],
        `${recipe.id} is missing a language mapping for ${extension}`,
      )
    }
    for (const key of Object.keys(recipe.languages)) {
      assert(recipe.extensions.includes(key), `${recipe.id} maps unlisted language key ${key}`)
    }
  }
  assert.deepEqual(
    recipeLanguages("temp.rs").map(({ recipe, languageId }) => [recipe.id, languageId]),
    [["rust", "rust"]],
  )
  assert.deepEqual(
    recipeLanguages("Dockerfile").map(({ recipe, languageId }) => [recipe.id, languageId]),
    [["dockerfile", "dockerfile"]],
  )
  assert.deepEqual(
    recipeLanguages("go.work").map(({ recipe }) => recipe.id),
    ["go"],
  )
  assert.deepEqual(recipeLanguages("unknown.zzz"), [])
  assert.equal(recipeLanguages("module.pyi")[0]?.recipe.id, "ty")
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

async function reuseCheck() {
  const client = await connect()
  await writeFile(join(workspace, "reuse.py"), "alpha = 1\nbeta = 2\n")
  const first = await call<{ hover: string }>(client, "hover", {
    file: "reuse.py",
    line: 1,
    character: 1,
  })
  assert.equal(first.hover, "pos:0:0")
  const pid = await readPid("ty.pid")
  const definition = await call<{ locations: { location: string }[]; totalLocations: number }>(
    client,
    "definition",
    { file: "reuse.py", line: 1, character: 1 },
  )
  assert.equal(definition.totalLocations, 1)
  assert.equal(definition.locations[0]?.location, "reuse.py:2:3")
  const uri = pathToFileURL(join(workspace, "reuse.py")).href
  const echo = await call<{ calls: string[]; tag: string; processId: number }>(client, "request", {
    server: "ty",
    method: "textDocument/hover",
    params: { textDocument: { uri }, position: { line: 0, character: 0 } },
  })
  assert.deepEqual(echo.calls, ["open", "definition"])
  assert.equal(echo.tag, "ty")
  assert.equal(echo.processId, pid)
  await writeFile(join(workspace, "reuse.py"), "gamma = 3\n")
  const drift = await call<{ hover: string }>(client, "hover", {
    file: "reuse.py",
    line: 1,
    character: 1,
  })
  assert.equal(drift.hover, "pos:0:0")
  const after = await call<{ calls: string[]; processId: number }>(client, "request", {
    server: "ty",
    method: "textDocument/hover",
    params: { textDocument: { uri }, position: { line: 1, character: 0 } },
  })
  assert(after.calls.includes("change"), "disk drift must be synced with didChange")
  assert.equal(after.processId, pid)
  assert.equal(await readPid("ty.pid"), pid)
  await client.close()
}

async function conversionCheck() {
  const client = await connect()
  await writeFile(join(workspace, "conv.py"), "😀x\nvalue = 2\n")
  const emoji = await call<{ hover: string }>(client, "hover", {
    file: "conv.py",
    line: 1,
    character: 4,
  })
  assert.equal(emoji.hover, "pos:0:3")
  const second = await call<{ hover: string }>(client, "hover", {
    file: "conv.py",
    line: 2,
    character: 4,
  })
  assert.equal(second.hover, "pos:1:3")
  assert.match(
    await fails(client, "hover", { file: "conv.py", line: 1, character: 5 }),
    /out of bounds/,
  )
  assert.match(
    await fails(client, "hover", { file: "conv.py", line: 9, character: 1 }),
    /out of bounds/,
  )
  const definition = await call<{ locations: { location: string }[] }>(client, "definition", {
    file: "conv.py",
    line: 2,
    character: 1,
  })
  assert.equal(definition.locations[0]?.location, "conv.py:2:3")
  await client.close()
}

async function parallelCheck() {
  const client = await connect()
  await writeFile(join(workspace, "parallel.py"), "first = 1\nsecond = 2\n")
  const [hover, definition] = await Promise.all([
    call<{ hover: string }>(client, "hover", {
      file: "parallel.py",
      line: 1,
      character: 1,
    }),
    call<{ locations: { location: string }[]; totalLocations: number }>(client, "definition", {
      file: "parallel.py",
      line: 1,
      character: 1,
    }),
  ])
  assert.equal(hover.hover, "pos:0:0")
  assert.equal(definition.totalLocations, 1)
  const uri = pathToFileURL(join(workspace, "parallel.py")).href
  const echo = await call<{ calls: string[] }>(client, "request", {
    server: "ty",
    method: "textDocument/hover",
    params: { textDocument: { uri }, position: { line: 0, character: 0 } },
  })
  assert.deepEqual(
    echo.calls.filter((name) => name === "open"),
    ["open"],
    "parallel calls on one file must coalesce into a single didOpen",
  )
  await client.close()
}

async function digestCheck() {
  const client = await connect()
  await writeFile(join(workspace, "digest.rs"), "first line\nsecond line\n")
  assert.match(
    await fails(client, "workspace_symbols", { query: "cold" }),
    /no single server can be inferred/,
  )
  const definition = await call<{
    locations: { location: string; preview?: string }[]
    totalLocations: number
    truncated: boolean
  }>(client, "definition", { file: "digest.rs", line: 1, character: 1 })
  assert.equal(definition.totalLocations, 12)
  assert.equal(definition.locations.length, 10)
  assert.equal(definition.truncated, true)
  assert.equal(definition.locations[0]?.location, "digest.rs:2:3")
  assert.equal(definition.locations[0]?.preview, "second line")
  const references = await call<{
    locations: unknown[]
    totalLocations: number
    truncated: boolean
  }>(client, "references", { file: "digest.rs", line: 1, character: 1 })
  assert.equal(references.totalLocations, 120)
  assert.equal(references.locations.length, 100)
  assert.equal(references.truncated, true)
  const symbols = await call<{
    symbols: {
      kind: string
      name: string
      location: string
      children?: { kind: string; name: string; location: string }[]
    }[]
    totalSymbols: number
    truncated: boolean
  }>(client, "symbols", { file: "digest.rs" })
  assert.equal(symbols.totalSymbols, 2)
  assert.equal(symbols.truncated, false)
  assert.equal(symbols.symbols[0]?.kind, "Class")
  assert.equal(symbols.symbols[0]?.name, "Widget")
  assert.equal(symbols.symbols[0]?.location, "digest.rs:1:7")
  assert.equal(symbols.symbols[0]?.children?.[0]?.kind, "Method")
  assert.equal(symbols.symbols[0]?.children?.[0]?.location, "digest.rs:2:3")
  const viaWarm = await call<{
    symbols: { kind: string; location: string }[]
    totalSymbols: number
  }>(client, "workspace_symbols", { query: "sym" })
  assert.equal(viaWarm.symbols[0]?.kind, "Function")
  assert.equal(viaWarm.symbols[0]?.location, "ws.js:1:1")
  const forced = await call<{ symbols: unknown[]; totalSymbols: number; truncated: boolean }>(
    client,
    "workspace_symbols",
    { query: "sym", server: "rust" },
  )
  assert.equal(forced.totalSymbols, 60)
  assert.equal(forced.symbols.length, 50)
  assert.equal(forced.truncated, true)
  await writeFile(join(workspace, "notes.md"), "# Notes\n")
  const emptyDefinition = await call<{ locations: unknown[]; note?: string }>(
    client,
    "definition",
    {
      file: "notes.md",
      line: 1,
      character: 1,
    },
  )
  assert.equal(emptyDefinition.locations.length, 0)
  assert.match(emptyDefinition.note ?? "", /No definition found/)
  const emptyReferences = await call<{ locations: unknown[]; note?: string }>(
    client,
    "references",
    {
      file: "notes.md",
      line: 1,
      character: 1,
    },
  )
  assert.equal(emptyReferences.locations.length, 0)
  assert.match(emptyReferences.note ?? "", /No references found/)
  await client.close()
}

async function diagnosticsCheck() {
  const client = await connect()
  interface Diagnostics {
    diagnostics: { location: string; severity: string; message: string; source?: string }[]
    totalDiagnostics: number
    source: string
    note?: string
  }
  await writeFile(join(workspace, "diag.py"), "solo = 1\n")
  const pushed = await call<Diagnostics>(client, "diagnostics", { file: "diag.py" })
  assert.equal(pushed.source, "push")
  assert.equal(pushed.totalDiagnostics, 0)
  await writeFile(join(workspace, "diag.sh"), "echo hi\n")
  const delayed = await call<Diagnostics>(client, "diagnostics", { file: "diag.sh" })
  assert.equal(delayed.source, "push")
  assert.equal(delayed.totalDiagnostics, 1)
  assert.equal(delayed.diagnostics[0]?.location, "diag.sh:1:2")
  assert.equal(delayed.diagnostics[0]?.severity, "Warning")
  assert.equal(delayed.diagnostics[0]?.message, "delayed warning")
  assert.equal(delayed.diagnostics[0]?.source, "fake")
  await writeFile(join(workspace, "diag.go"), "package main\n")
  const coldStart = Date.now()
  const cold = await call<Diagnostics>(client, "diagnostics", { file: "diag.go" })
  const coldMs = Date.now() - coldStart
  assert.equal(cold.source, "cache")
  assert.equal(cold.totalDiagnostics, 0)
  assert.match(cold.note ?? "", /no fresh diagnostics/)
  assert(coldMs >= 900, `expected a bounded wait, took ${coldMs}ms`)
  const cachedStart = Date.now()
  const cached = await call<Diagnostics>(client, "diagnostics", { file: "diag.go" })
  const cachedMs = Date.now() - cachedStart
  assert.equal(cached.source, "cache")
  assert(cachedMs < 800, `expected no wait when nothing was synced, took ${cachedMs}ms`)
  await writeFile(join(workspace, "diag.rs"), "fn main() {}\n")
  const pulled = await call<Diagnostics>(client, "diagnostics", { file: "diag.rs" })
  assert.equal(pulled.source, "pull")
  assert.equal(pulled.totalDiagnostics, 1)
  assert.equal(pulled.diagnostics[0]?.location, "diag.rs:1:1")
  assert.equal(pulled.diagnostics[0]?.severity, "Error")
  assert.equal(pulled.diagnostics[0]?.message, "pull problem")
  assert.equal(pulled.diagnostics[0]?.source, "fake")
  await client.close()
}

async function capabilityCheck() {
  const client = await connect()
  await writeFile(join(workspace, "cap.sh"), "echo cap\n")
  assert.match(
    await fails(client, "references", { file: "cap.sh", line: 1, character: 1 }),
    /does not support textDocument\/references/,
  )
  await client.close()
}

async function renameCheck() {
  const client = await connect()
  await writeFile(join(workspace, "ren.py"), "old = 1\n")
  await writeFile(join(workspace, "other.py"), "old = 2\n")
  // Sync other.py, then change it on disk behind the session: the rename must refuse all writes.
  await call(client, "hover", { file: "other.py", line: 1, character: 1 })
  await writeFile(join(workspace, "other.py"), "alt = 2\n")
  assert.match(
    await fails(client, "rename", { file: "ren.py", line: 1, character: 1, new_name: "fresh" }),
    /changed on disk/,
  )
  assert.equal(await readText("other.py"), "alt = 2\n")
  assert.equal(await readText("ren.py"), "old = 1\n")
  await call(client, "hover", { file: "other.py", line: 1, character: 1 })
  const applied = await call<{
    applied: boolean
    files: { file: string; edits: number; changed: boolean }[]
    totalEdits: number
  }>(client, "rename", { file: "ren.py", line: 1, character: 1, new_name: "fresh" })
  assert.equal(applied.applied, true)
  assert.equal(applied.totalEdits, 2)
  assert.deepEqual(
    applied.files.map((entry) => [entry.file, entry.edits, entry.changed]),
    [
      ["ren.py", 1, true],
      ["other.py", 1, true],
    ],
  )
  assert.equal(await readText("ren.py"), "fresh = 1\n")
  assert.equal(await readText("other.py"), "fresh = 2\n")
  await writeFile(join(workspace, "ren.md"), "# Title\n")
  const noop = await call<{ applied: boolean; note?: string }>(client, "rename", {
    file: "ren.md",
    line: 1,
    character: 1,
    new_name: "x",
  })
  assert.equal(noop.applied, false)
  assert.match(noop.note ?? "", /no rename edits/)
  await writeFile(join(workspace, "ren.vue"), "<template></template>\n")
  const moved = await call<{
    applied: boolean
    operations: { kind: string; file: string; from?: string; to?: string }[]
    totalEdits: number
  }>(client, "rename", { file: "ren.vue", line: 1, character: 1, new_name: "x" })
  assert.equal(moved.applied, true)
  assert.deepEqual(moved.operations, [
    { kind: "rename", file: "ren.moved.vue", from: "ren.vue", to: "ren.moved.vue" },
  ])
  assert.equal(await exists(join(workspace, "ren.vue")), false)
  assert.equal(await readText("ren.moved.vue"), "xmplate></template>\n")
  const movedHover = await call<{ hover: string }>(client, "hover", {
    file: "ren.moved.vue",
    line: 1,
    character: 1,
  })
  assert.equal(movedHover.hover, "pos:0:0")
  await client.close()
}

async function formatCheck() {
  const client = await connect()
  await writeFile(join(workspace, "fmt.py"), "bad code\n")
  const applied = await call<{
    applied: boolean
    files: { file: string; edits: number; changed: boolean }[]
    totalEdits: number
  }>(client, "format", { file: "fmt.py" })
  assert.equal(applied.applied, true)
  assert.equal(applied.totalEdits, 1)
  assert.equal(applied.files[0]?.file, "fmt.py")
  assert.equal(await readText("fmt.py"), "good code\n")
  const echo = await call<{ calls: string[] }>(client, "request", {
    method: "textDocument/hover",
    file: "fmt.py",
    params: {
      textDocument: { uri: pathToFileURL(join(workspace, "fmt.py")).href },
      position: { line: 0, character: 0 },
    },
  })
  assert(echo.calls.includes("change"), "applying edits must notify the server with didChange")
  await writeFile(join(workspace, "notes2.md"), "# Notes\n")
  const noop = await call<{ applied: boolean; note?: string }>(client, "format", {
    file: "notes2.md",
  })
  assert.equal(noop.applied, false)
  assert.match(noop.note ?? "", /no formatting changes/)
  await client.close()
}

async function requestCheck() {
  const client = await connect()
  await writeFile(join(workspace, "req.py"), "value = 1\n")
  assert.match(
    await fails(client, "request", { method: "completionItem/resolve", params: { label: "a" } }),
    /warm yet/,
  )
  const cold = await call<{
    configuration: unknown[]
    edit: { applied: boolean }
    tag: string | null
  }>(client, "request", { server: "pyright", method: "textDocument/hover", params: {} })
  assert.deepEqual(cold.configuration, [null, null])
  assert.equal(cold.edit.applied, false)
  assert.equal(cold.tag, null)
  const reqUri = pathToFileURL(join(workspace, "req.py")).href
  const viaFile = await call<{ tag: string; params: { position: { line: number } } }>(
    client,
    "request",
    {
      file: "req.py",
      method: "textDocument/hover",
      params: { textDocument: { uri: reqUri }, position: { line: 5, character: 0 } },
    },
  )
  assert.equal(viaFile.tag, "ty")
  assert.equal(viaFile.params.position.line, 5)
  assert.match(
    await fails(client, "request", { method: "textDocument/hover", params: {} }),
    /Several language server sessions are warm/,
  )
  assert.match(
    await fails(client, "request", { server: "ty", method: "textDocument/didOpen", params: {} }),
    /managed/,
  )
  assert.match(
    await fails(client, "request", { server: "ty", method: "shutdown", params: {} }),
    /managed/,
  )
  assert.match(
    await fails(client, "request", { server: "nope", method: "textDocument/hover", params: {} }),
    /not installed/,
  )
  await client.close()
}

async function crashCheck() {
  const client = await connect()
  await writeFile(join(workspace, "crash.py"), "value = 1\n")
  const crashUri = pathToFileURL(join(workspace, "crash.py")).href
  const crashed = await client.callTool({
    name: "request",
    arguments: {
      server: "basedpyright",
      file: "crash.py",
      method: "textDocument/hover",
      params: { textDocument: { uri: crashUri }, position: { line: 0, character: 0 } },
    },
  })
  assert.equal(crashed.isError, true)
  const recovery = await call<unknown[]>(client, "request", {
    server: "basedpyright",
    file: "crash.py",
    method: "textDocument/definition",
    params: { textDocument: { uri: crashUri } },
  })
  assert.equal(recovery.length, 1)
  assert.equal((recovery[0] as { uri: string }).uri, crashUri)
  const healthy = await call<{ hover: string }>(client, "hover", {
    file: "crash.py",
    line: 1,
    character: 1,
  })
  assert.equal(healthy.hover, "pos:0:0")
  await client.close()
}

async function lruCheck() {
  const client = await connect({ LSP_MAX_SESSIONS: "2" })
  await writeFile(join(workspace, "lru.py"), "a = 1\n")
  await writeFile(join(workspace, "lru.rs"), "fn main() {}\n")
  await writeFile(join(workspace, "lru.go"), "package main\n")
  await call(client, "hover", { file: "lru.py", line: 1, character: 1 })
  const firstPid = await readPid("ty.pid")
  await call(client, "hover", { file: "lru.rs", line: 1, character: 1 })
  const rustPid = await readPid("rust.pid")
  await call(client, "hover", { file: "lru.go", line: 1, character: 1 })
  const goPid = await readPid("go.pid")
  assert(await waitForDead(firstPid), "expected the least-recently-used session to be stopped")
  await call(client, "hover", { file: "lru.py", line: 1, character: 1 })
  const secondPid = await readPid("ty.pid")
  assert.notEqual(secondPid, firstPid)
  assert(alive(goPid), "the most recently used session must survive")
  assert(await waitForDead(rustPid), "expected the next oldest session to be stopped")
  await call(client, "hover", { file: "lru.go", line: 1, character: 1 })
  assert.equal(await readPid("go.pid"), goPid)
  await client.close()
}

async function surfaceCheck() {
  const client = await connect()
  const tools = (await client.listTools()).tools.map((tool) => tool.name).sort()
  assert.deepEqual(tools, staticTools)
  await writeFile(join(workspace, "search.js"), "const x = 1\n")
  assert.match(
    await fails(client, "ast_grep_search", {
      language: "javascript",
      paths: ["search.js"],
      pattern: "x",
    }),
    /ast-grep not found/,
  )
  assert.match(
    await fails(client, "hover", { file: "missing.py", line: 1, character: 1 }),
    /does not exist/,
  )
  await writeFile(join(workspace, "out.zzz"), "x\n")
  assert.match(
    await fails(client, "hover", { file: "out.zzz", line: 1, character: 1 }),
    /No language server recipe/,
  )
  assert.match(
    await fails(client, "hover", {
      file: resolve(import.meta.dir, "e2e.ts"),
      line: 1,
      character: 1,
    }),
    /escapes the workspace/,
  )
  await symlink(join(workspace, "out.zzz"), join(workspace, "link.zzz"))
  assert.match(
    await fails(client, "hover", { file: "link.zzz", line: 1, character: 1 }),
    /Symlink path component refused/,
  )
  assert.match(
    await fails(client, "hover", { file: ".git/config", line: 1, character: 1 }),
    /Refused \.git/,
  )
  await client.close()
}

const deadline = setTimeout(() => {
  console.error("E2E deadline exceeded")
  process.exit(1)
}, 60_000)
try {
  await metadataCheck()
  await reuseCheck()
  await conversionCheck()
  await parallelCheck()
  await digestCheck()
  await diagnosticsCheck()
  await capabilityCheck()
  await renameCheck()
  await formatCheck()
  await requestCheck()
  await crashCheck()
  await lruCheck()
  await surfaceCheck()
  console.log(
    "PASS discovery metadata, reuse and disk sync, parallel call coalescing, position conversion, digest caps, diagnostics push/pull/cache, capability errors, rename/format application with drift guard and file operations, raw request rules, crash respawn, session LRU and folded ast-grep errors",
  )
} finally {
  clearTimeout(deadline)
  await cleanup()
}
