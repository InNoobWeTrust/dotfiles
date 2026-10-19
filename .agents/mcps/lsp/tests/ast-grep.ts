import assert from "node:assert/strict"
import { chmod, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { delimiter, dirname, join, resolve } from "node:path"
import { Client } from "@modelcontextprotocol/sdk@1/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk@1/client/stdio.js"

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
async function connect(path: string) {
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
  const tools = (await client.listTools()).tools
  assert.deepEqual(tools.map((tool) => tool.name).sort(), staticTools)
  assert.equal(
    tools.find((tool) => tool.name === "ast_grep_search")?.annotations?.readOnlyHint,
    true,
  )
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

async function realCli(executable: string) {
  const { client } = await connect(dirname(executable))
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
    "PASS real CLI: JavaScript/Python, native byte ranges/metavariables/replacements, no mutation/no LSP, hostile custom-parser config, hidden/dash paths, ignore defaults/no-follow, kind/selector, empty rewrite, truncation, no-match",
  )
}

async function fixtures() {
  // sg must never be used, even if it is the only executable available.
  await writeFile(
    join(bin, "sg"),
    `#!${process.execPath}\nthrow new Error("sg must not execute")\n`,
  )
  await chmod(join(bin, "sg"), 0o755)
  const { client: missing } = await connect(bin)
  await expectError(missing, query, /ast-grep not found on PATH/)
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
  const { client, transport } = await connect(bin)

  // Availability is reported by the search call itself; the old discover tool is folded away.
  for (const [value, message] of [
    ["old", /0.51.0 required/],
    ["version", /Invalid ast-grep --version/],
    ["probe-error", /exited 2: fixture version failure/],
  ] as const) {
    await mode(value)
    await expectError(client, query, message)
  }

  await mode("normal")
  for (const path of [
    "../outside.js",
    ".git/config",
    "link.js",
    "link-dir/sample.js",
    "sample.js/../sample.js",
  ]) {
    await expectError(client, { ...query, paths: [path] }, /Unsafe|Symlink|Refused/)
  }
  await expectError(client, { ...query, paths: ["absent.js"] }, /Path does not exist/)
  // Absolute paths inside the workspace became valid with the shared path policy.
  const absolute = await search(client, { ...query, paths: [join(workspace, "sample.js")] })
  assert(!absolute.isError, JSON.stringify(absolute))
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
  const timeout = await pending
  assert.equal(timeout.isError, true)
  assert.match(decode<{ error: string }>(timeout).error, /timed out after 30000ms/)
  assert.throws(() => process.kill(pid, 0), { code: "ESRCH" })
  await mode("normal")
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
  const closingSearch = search(closing).catch(() => null)
  const probePid = await waitForPid()
  assert(closingTransport.pid)
  process.kill(closingTransport.pid, "SIGTERM")
  await closingSearch
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
