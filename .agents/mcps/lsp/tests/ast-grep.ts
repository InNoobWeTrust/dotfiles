import assert from "node:assert/strict"
import { chmod, mkdir, mkdtemp, readFile, rename, rm, symlink, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { delimiter, dirname, join, resolve } from "node:path"
import { Client } from "@modelcontextprotocol/sdk@1/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk@1/client/stdio.js"
import { ToolListChangedNotificationSchema } from "@modelcontextprotocol/sdk@1/types.js"

const workspace = await mkdtemp(join(tmpdir(), "ast-grep-mcp-e2e-"))
const bin = join(workspace, "bin")
const entrypoint = resolve(import.meta.dir, "../bin/mcp-lsp")
const transports: StdioClientTransport[] = []
await mkdir(bin)
// The launcher is a POSIX sh shim over Bun: the restricted PATHs below gain a
// separate directory holding only the executables that shim depends on.
const externalBin = join(workspace, "external-bin")
await mkdir(externalBin)
for (const name of ["dirname", "env", "bun"]) {
  const resolved = Bun.which(name)
  assert(resolved, `${name} must be resolvable for the launcher shim`)
  await symlink(resolved, join(externalBin, name))
}
await writeFile(join(workspace, "sample.js"), 'console.log("é");\nconsole.log("two");\n')
await writeFile(join(workspace, "sample.py"), 'print("hello")\n')
await writeFile(join(workspace, ".hidden.js"), 'console.log("hidden");\n')
await writeFile(join(workspace, "--flag.js"), 'console.log("flag");\n')
await mkdir(join(workspace, ".git"))
await symlink(join(workspace, "sample.js"), join(workspace, "link.js"))
await symlink(workspace, join(workspace, "link-dir"))
await mkdir(join(workspace, "tree"))
await mkdir(join(workspace, "tree/.git"))
await mkdir(join(workspace, "tree/.hidden-dir"))
await writeFile(join(workspace, "tree/visible.js"), 'console.log("visible");\n')
await writeFile(join(workspace, "tree/.hidden.js"), 'console.log("hidden");\n')
await writeFile(join(workspace, "tree/ignored.js"), 'console.log("ignored");\n')
await writeFile(join(workspace, "tree/.ignore"), "ignored.js\n")
await writeFile(join(workspace, "tree/.git/inside.js"), 'console.log("git");\n')
await writeFile(join(workspace, "tree/.hidden-dir/inside.js"), 'console.log("hidden-dir");\n')
await symlink(join(workspace, "sample.js"), join(workspace, "tree/nested-link.js"))
await writeFile(
  join(workspace, "sgconfig.yml"),
  "customLanguages:\n  hostile:\n    libraryPath: /definitely-no-native-parser.so\n    extensions: [js]\n",
)

function decode<T>(response: unknown): T {
  const value = response as { content: { text: string }[] }
  assert(value.content[0]?.text)
  return JSON.parse(value.content[0].text) as T
}

const baseTools = ["discover", "events", "start", "stop"]
const astTools = ["ast_grep_discover", "ast_grep_search"]
async function catalog(client: Client, available: boolean) {
  const tools = (await client.listTools()).tools
  assert.deepEqual(
    tools
      .filter((tool) => !tool.name.startsWith("lsp_"))
      .map((tool) => tool.name)
      .sort(),
    [...baseTools, ...(available ? astTools : [])].sort(),
  )
  for (const name of available ? astTools : []) {
    assert.equal(tools.find((tool) => tool.name === name)?.annotations?.readOnlyHint, true)
  }
}

async function connect(path: string, available = true) {
  const transport = new StdioClientTransport({
    command: entrypoint,
    args: [],
    cwd: workspace,
    env: Object.fromEntries(
      Object.entries({ ...process.env, PATH: [path, externalBin].join(delimiter) }).filter(
        (entry): entry is [string, string] => entry[1] !== undefined,
      ),
    ),
    stderr: "pipe",
  })
  transports.push(transport)
  transport.stderr?.on("data", (chunk) => process.stderr.write(chunk))
  const client = new Client({ name: "ast-grep-e2e", version: "1" })
  await client.connect(transport)
  assert(!(await client.listTools()).tools.some((tool) => tool.name.startsWith("lsp_")))
  await catalog(client, available)
  return { client, transport }
}

const query = { language: "javascript", paths: ["sample.js"], pattern: "console.log($A)" }
const search = (client: Client, input: Record<string, unknown> = query) =>
  client.callTool({ name: "ast_grep_search", arguments: input }, undefined, { timeout: 40_000 })
async function expectError(client: Client, input: Record<string, unknown>, message: RegExp) {
  const response = await search(client, input)
  assert.equal(response.isError, true)
  assert.match(decode<{ error: string }>(response).error, message)
}

interface Match {
  text: string
  file: string
  range: { byteOffset: { start: number; end: number } }
  replacement?: string
  replacementOffsets?: { start: number; end: number }
  metaVariables?: { single: { A: { text: string } } }
}
interface SearchResult {
  matches: Match[]
  totalMatches: number
  truncated: boolean
  warnings: string
}

interface Availability {
  available: boolean
  executable: string | null
  version: string | null
  supported: boolean
  minimumVersion: string
  error?: string
}

async function refresh(client: Client) {
  const response = await client.callTool({ name: "discover", arguments: {} })
  assert(!response.isError, JSON.stringify(response))
  const discovered = decode<{ installed: { id: string }[]; astGrep: Availability }>(response)
  assert(Array.isArray(discovered.installed), "AST failure must not hide LSP discovery")
  return discovered.astGrep
}

async function realCli(executable: string) {
  const { client } = await connect(dirname(executable))
  const discovered = decode<{
    available: boolean
    supported: boolean
    executable: string
    version: string
  }>(await client.callTool({ name: "ast_grep_discover", arguments: {} }))
  assert.equal(discovered.available, true)
  assert.equal(discovered.supported, true)
  assert.equal(discovered.executable, executable)
  assert.match(discovered.version, /^\d+\.\d+\.\d+$/)
  const original = await readFile(join(workspace, "sample.js"), "utf8")
  const response = await search(client, { ...query, rewrite: "logger($A)", maxMatches: 1 })
  assert(!response.isError, JSON.stringify(response))
  const preview = decode<SearchResult>(response)
  assert.equal(preview.totalMatches, 2)
  assert.equal(preview.truncated, true)
  assert.equal(preview.matches.length, 1)
  const match = preview.matches[0]
  assert(match)
  assert.equal(match.replacement, 'logger("é")')
  assert.deepEqual(match.replacementOffsets, match.range.byteOffset)
  assert.equal(match.range.byteOffset.end, Buffer.byteLength('console.log("é")'))
  assert.equal(match.metaVariables?.single.A.text, '"é"')
  assert.match(preview.warnings, /custom languages are ignored/)
  assert.equal(await readFile(join(workspace, "sample.js"), "utf8"), original)
  const python = await search(client, {
    language: "python",
    paths: ["sample.py"],
    pattern: "print($A)",
    rewrite: "log($A)",
  })
  assert(!python.isError, JSON.stringify(python))
  assert.equal(decode<SearchResult>(python).matches[0]?.replacement, 'log("hello")')
  assert.equal(await readFile(join(workspace, "sample.py"), "utf8"), 'print("hello")\n')
  const noMatch = await search(client, { ...query, pattern: "missing($A)" })
  assert(!noMatch.isError, JSON.stringify(noMatch))
  assert.deepEqual(decode<SearchResult>(noMatch).matches, [])
  assert.equal(decode<SearchResult>(noMatch).truncated, false)
  for (const file of [".hidden.js", "--flag.js"]) {
    const response = await search(client, { ...query, paths: [file] })
    assert(!response.isError)
    assert.equal(decode<SearchResult>(response).matches.length, 1)
  }
  const kind = await search(client, {
    language: "javascript",
    paths: ["sample.js"],
    kind: "call_expression",
  })
  assert(!kind.isError)
  assert.equal(decode<SearchResult>(kind).matches.length, 2)
  const traversal = await search(client, { ...query, paths: ["tree"] })
  assert(!traversal.isError)
  // --lang includes matching hidden files, but native ignore rules/hidden directories still apply.
  assert.deepEqual(
    decode<SearchResult>(traversal)
      .matches.map((match) => match.file)
      .sort(),
    [join(workspace, "tree/.hidden.js"), join(workspace, "tree/visible.js")],
  )
  const selector = await search(client, {
    ...query,
    pattern: 'const $A = "x"',
    selector: "identifier",
  })
  assert(!selector.isError, JSON.stringify(selector))
  const emptyRewrite = await search(client, { ...query, rewrite: "" })
  assert(!emptyRewrite.isError)
  assert.equal(decode<SearchResult>(emptyRewrite).matches[0]?.replacement, "")
  assert.equal(await readFile(join(workspace, "sample.js"), "utf8"), original)
  await client.close()
  console.log(
    `PASS real CLI ${discovered.version}: JavaScript/Python, native byte ranges/metavariables/replacements, no mutation/no LSP, hostile custom-parser config, hidden/dash paths, ignore defaults/no-follow, kind/selector, empty rewrite, truncation, no-match`,
  )
}

async function fixtures() {
  // sg must never be used, even if it is the only executable available.
  await writeFile(
    join(bin, "sg"),
    `#!${process.execPath}\nthrow new Error("sg must not execute")\n`,
  )
  await chmod(join(bin, "sg"), 0o755)
  const { client: missing } = await connect(bin, false)
  assert.deepEqual(await refresh(missing), {
    available: false,
    executable: null,
    version: null,
    supported: false,
    minimumVersion: "0.51.0",
  })
  for (const name of astTools) {
    const response = await missing.callTool({
      name,
      arguments: name.endsWith("search") ? query : {},
    })
    assert.equal(response.isError, true)
    assert.match((response.content as { text: string }[])[0]?.text ?? "", /Tool .* not found/)
  }
  await missing.close()

  const fixture = join(bin, "ast-grep")
  await writeFile(
    fixture,
    `#!${process.execPath}
import { readFileSync, writeFileSync } from "node:fs";
const mode = readFileSync("mode", "utf8");
if (process.argv[2] === "--version") {
  if (mode === "slow") await Bun.sleep(100);
  if (mode === "probe-error") { console.error("fixture version failure"); process.exit(2); }
  if (mode === "probe-hang") {
    writeFileSync("ast-child.pid", String(process.pid));
    await new Promise(resolve => setTimeout(resolve, 60000));
  }
  console.log(mode === "old" ? "ast-grep 0.50.0" : mode === "version" ? "bogus" : "ast-grep 0.51.0");
} else {
  writeFileSync("ast-child.pid", String(process.pid));
  writeFileSync("ast-argv.json", JSON.stringify(process.argv.slice(2)));
  if (mode === "hang") await new Promise(resolve => setTimeout(resolve, 60000));
  else if (mode === "stdout") await Bun.write(Bun.stdout, Buffer.alloc(4 * 1024 * 1024 + 1, 32));
  else if (mode === "stderr") await Bun.write(Bun.stderr, Buffer.alloc(64 * 1024 + 1, 32));
  else if (mode === "error") { console.error("fixture parse failure"); process.exitCode = 2; }
  else if (mode === "malformed") console.log("not-json");
  else if (mode === "shape") console.log("{}");
  else if (mode === "inconsistent") { console.log('[{"text":"x","file":"x.js","language":"JavaScript","range":{"byteOffset":{"start":0,"end":1},"start":{"line":0,"column":0},"end":{"line":0,"column":1}}}]'); process.exitCode = 1; }
  else { console.log("[]"); process.exitCode = 1; }
}
`,
  )
  await chmod(fixture, 0o755)
  const mode = (value: string) => writeFile(join(workspace, "mode"), value)

  for (const value of ["old", "version", "probe-error"]) {
    await mode(value)
    const { client } = await connect(bin, false)
    const discovered = await refresh(client)
    assert.equal(discovered.supported, false)
    if (value === "old") {
      assert.equal(discovered.available, true)
      assert.equal(discovered.version, "0.50.0")
    } else {
      assert.equal(discovered.available, false)
      assert.match(discovered.error ?? "", /Invalid ast-grep|exited 2: fixture version failure/)
    }
    await catalog(client, false)
    await client.close()
  }

  await mode("normal")
  const { client, transport } = await connect(bin)
  let notifications = 0
  client.setNotificationHandler(ToolListChangedNotificationSchema, () => {
    notifications++
  })
  const changed = async (previous: number) => {
    for (let attempt = 0; attempt < 100 && notifications === previous; attempt++)
      await Bun.sleep(20)
    assert(notifications > previous, "SDK catalog change notification missing")
  }
  for (const value of ["old", "normal", "version", "normal", "probe-error", "normal"]) {
    await mode(value)
    const previous = notifications
    const discovered = await refresh(client)
    assert.equal(discovered.supported, value === "normal")
    await catalog(client, value === "normal")
    await changed(previous)
  }
  await rename(fixture, `${fixture}.disabled`)
  const removed = notifications
  assert.equal((await refresh(client)).available, false)
  await catalog(client, false)
  await changed(removed)
  await rename(`${fixture}.disabled`, fixture)
  await mode("slow")
  const restored = notifications
  const concurrent = await Promise.all(Array.from({ length: 8 }, () => refresh(client)))
  assert(concurrent.every((entry) => entry.available && entry.supported))
  await catalog(client, true)
  await changed(restored)

  // Probe failure must not end an already running LSP or remove its wrappers.
  const lsp = join(bin, "pyright-langserver")
  await writeFile(
    lsp,
    `#!${process.execPath}\nawait import(${JSON.stringify(resolve(import.meta.dir, "fake-lsp.ts"))});\n`,
  )
  await chmod(lsp, 0o755)
  const started = await client.callTool({ name: "start", arguments: { id: "pyright" } })
  assert(!started.isError)
  await mode("probe-error")
  assert.match((await refresh(client)).error ?? "", /fixture version failure/)
  await catalog(client, false)
  const native = { label: "still running" }
  const survived = await client.callTool({
    name: "lsp_pyright_completionItem_resolve",
    arguments: { params: native },
  })
  assert(!survived.isError)
  assert.deepEqual(decode(survived), native)
  const stopped = await client.callTool({
    name: "stop",
    arguments: { session: decode<{ session: string }>(started).session },
  })
  assert(!stopped.isError)
  await mode("normal")
  assert.equal((await refresh(client)).supported, true)
  await catalog(client, true)
  console.log(
    "PASS SDK registration: missing/unsupported/broken/supported startup, discover add/remove/recovery, catalog notifications, concurrent refresh, LSP survives probe failure",
  )

  await mode("old")
  assert.equal(
    decode<{ supported: boolean }>(
      await client.callTool({ name: "ast_grep_discover", arguments: {} }),
    ).supported,
    false,
  )
  await expectError(client, query, /0.51.0 required/)
  await mode("version")
  await expectError(client, query, /Invalid ast-grep --version/)
  await mode("normal")
  for (const path of [
    "../outside.js",
    join(workspace, "sample.js"),
    ".git/config",
    "link.js",
    "link-dir/sample.js",
    "sample.js/../sample.js",
  ]) {
    await expectError(client, { ...query, paths: [path] }, /Unsafe|Symlink/)
  }
  await expectError(client, { ...query, paths: ["absent.js"] }, /ENOENT/)
  await expectError(client, { ...query, kind: "identifier" }, /exactly one/)
  const { pattern: _, ...withoutPattern } = query
  await expectError(client, withoutPattern, /exactly one/)
  assert.equal((await search(client, { ...query, maxMatches: 201 })).isError, true)
  for (const [value, message] of [
    ["error", /exited 2: fixture parse failure/],
    ["malformed", /JSON|Unexpected/],
    ["shape", /array/],
    ["inconsistent", /no-match exit contained matches/],
    ["stdout", /stdout exceeded 4MiB/],
    ["stderr", /stderr exceeded 64KiB/],
  ] as const) {
    await mode(value)
    await expectError(client, query, message)
    await mode("normal")
    assert(!(await search(client)).isError, `request slot leaked after ${value}`)
  }
  const argv = JSON.parse(await readFile(join(workspace, "ast-argv.json"), "utf8")) as string[]
  assert.deepEqual(argv.slice(0, 10), [
    "run",
    "--custom-languages",
    "ignore",
    "--json=compact",
    "--threads",
    "2",
    "--color",
    "never",
    "--lang=javascript",
    "--pattern=console.log($A)",
  ])
  assert.equal(argv[10], "--")
  assert.equal(argv[11], join(workspace, "sample.js"))

  await mode("hang")
  await rm(join(workspace, "ast-child.pid"))
  const pending = search(client)
  const pid = await waitForPid()
  await expectError(client, query, /already active/)
  const busyDiscover = await client.callTool({ name: "ast_grep_discover", arguments: {} })
  assert.equal(busyDiscover.isError, true)
  const busyRefresh = await refresh(client)
  assert.equal(busyRefresh.available, false)
  assert.match(busyRefresh.error ?? "", /already active/)
  await catalog(client, false)
  const timeout = await pending
  assert.equal(timeout.isError, true)
  assert.match(decode<{ error: string }>(timeout).error, /timed out after 30000ms/)
  assert.throws(() => process.kill(pid, 0), { code: "ESRCH" })
  await mode("normal")
  assert.equal((await refresh(client)).supported, true)
  await catalog(client, true)
  assert(!(await search(client)).isError)

  await mode("hang")
  await rm(join(workspace, "ast-child.pid"))
  const shutdownRequest = search(client).catch(() => null)
  const shutdownPid = await waitForPid()
  assert(transport.pid)
  process.kill(transport.pid, "SIGTERM")
  await shutdownRequest
  await waitForExit(shutdownPid)
  await client.close()

  await mode("normal")
  const { client: closing, transport: closingTransport } = await connect(bin)
  await mode("probe-hang")
  await rm(join(workspace, "ast-child.pid"))
  const closingRefresh = refresh(closing).catch(() => null)
  const probePid = await waitForPid()
  assert(closingTransport.pid)
  process.kill(closingTransport.pid, "SIGTERM")
  await closingRefresh
  await waitForExit(probePid)
  await closing.close()
  console.log(
    "PASS subprocess fixtures: missing binary/no sg, version gate, paths, fixed argv, process/malformed/output-cap errors, slot recovery, one active request, 30s timeout+kill, search/probe shutdown+kill",
  )
}

async function waitForPid(): Promise<number> {
  for (let attempt = 0; attempt < 100; attempt++) {
    const text = await readFile(join(workspace, "ast-child.pid"), "utf8").catch(
      (error: NodeJS.ErrnoException) => {
        if (error.code !== "ENOENT") throw error
        return ""
      },
    )
    if (text) return Number(text)
    await Bun.sleep(20)
  }
  throw new Error("Fixture child did not start")
}

async function waitForExit(pid: number) {
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      process.kill(pid, 0)
    } catch (error) {
      assert.equal((error as NodeJS.ErrnoException).code, "ESRCH")
      return
    }
    await Bun.sleep(20)
  }
  throw new Error("Owned ast-grep child survived shutdown")
}

const deadline = setTimeout(() => {
  console.error("AST MCP E2E timed out")
  process.exit(1)
}, 90_000)
try {
  const executable = process.argv[2] ? resolve(process.argv[2]) : Bun.which("ast-grep")
  if (executable) await realCli(executable)
  else
    console.log(
      "SKIP real CLI: ast-grep absent; pass trusted executable as tests/ast-grep.ts argument",
    )
  await fixtures()
} finally {
  clearTimeout(deadline)
  await Promise.allSettled(transports.map((transport) => transport.close()))
  await rm(workspace, { recursive: true, force: true })
}
