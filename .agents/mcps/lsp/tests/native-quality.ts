import assert from "node:assert/strict"
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { Client } from "@modelcontextprotocol/sdk@1/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk@1/client/stdio.js"

// Native acceptance only: no imports from the implementation and no authored
// analyzer substitutes. Every fixture, config, cache and build output is owned.
interface Provider {
  provider: string
  mechanism: "lsp" | "cli"
  status: "ok" | "unavailable" | "not-applicable" | "error"
  data?: { diagnostics?: unknown[]; totalDiagnostics?: number }
  diagnostics?: {
    location: string
    severity: string
    message: string
    rule?: string
    tool: string
  }[]
  totalDiagnostics?: number
  truncated?: boolean
  caps?: { timeoutMs?: number; diagnostics?: number }
  evidence: { source: string }
  note?: string
}
const root = await mkdtemp(join(tmpdir(), "lsp-native-e2e-"))
const entrypoint = resolve(import.meta.dir, "../bin/mcp-lsp")
const transports: StdioClientTransport[] = []
const sources = new Map<string, string>()
const exercised = new Set<string>()
const failures: string[] = []
const inheritedEnv = Object.fromEntries(
  Object.entries(process.env).filter((entry): entry is [string, string] => entry[1] !== undefined),
)

async function fixture(path: string, text: string) {
  await mkdir(dirname(join(root, path)), { recursive: true })
  await writeFile(join(root, path), text)
  sources.set(path, text)
}
async function unchanged() {
  for (const [path, text] of sources) {
    assert.equal(
      await readFile(join(root, path), "utf8"),
      text,
      `readonly diagnostics mutated ${path}`,
    )
  }
}
async function connect(path = process.env.PATH ?? "") {
  const transport = new StdioClientTransport({
    command: entrypoint,
    args: [],
    cwd: root,
    env: {
      ...inheritedEnv,
      PATH: path,
      GOPROXY: "off",
      GOSUMDB: "off",
      GOTOOLCHAIN: "local",
      GOCACHE: join(root, "go-cache"),
      GOMODCACHE: join(root, "go-mod-cache"),
      CARGO_NET_OFFLINE: "true",
      CARGO_TARGET_DIR: join(root, "cargo-target"),
    },
    stderr: "pipe",
  })
  transports.push(transport)
  transport.stderr?.on("data", (chunk) => process.stderr.write(chunk))
  const client = new Client({ name: "lsp-native-e2e", version: "1" })
  await client.connect(transport)
  return client
}
function decode(response: unknown): Provider[] {
  const value = response as { isError?: boolean; content: { text: string }[] }
  assert.notEqual(value.isError, true, value.content[0]?.text)
  const data = JSON.parse(value.content[0]?.text ?? "null") as Provider[]
  assert(Array.isArray(data), "readonly wire response is a literal ProviderResult[]")
  assert(data.length > 0)
  for (const result of data) {
    assert(result.provider)
    assert(["ok", "error", "unavailable", "not-applicable"].includes(result.status))
    assert(["lsp", "cli"].includes(result.mechanism))
    assert(result.evidence?.source)
    if (result.status !== "ok") assert(result.note, `${result.provider}: explain non-ok status`)
  }
  assert.equal(data[0]?.mechanism, "lsp")
  return data
}
async function diagnostics(client: Client, file: string, tools?: string[], timeoutMs = 180_001) {
  // Let the real default LSP run alongside each CLI. Explicit unknown server IDs
  // are caller errors; physical LSP absence is exercised separately below.
  const response = await client.callTool(
    {
      name: "diagnostics",
      arguments: {
        file,
        tools,
        timeoutMs,
      },
    },
    undefined,
    { timeout: timeoutMs + 30_000 },
  )
  return decode(response)
}
function provider(results: Provider[], id: string, status: Provider["status"]) {
  const matches = results.filter((item) => item.provider === id && item.mechanism === "cli")
  assert.equal(matches.length, 1, `${id}: exactly one applicable CLI result`)
  const item = matches[0]
  assert(item)
  assert.equal(item.status, status, `${id}: ${item.note ?? JSON.stringify(item)}`)
  assert.equal(item.evidence.source, "cli")
  return item
}
function finding(results: Provider[], id: string, file: string, rule: RegExp) {
  const item = provider(results, id, "ok")
  assert.equal(item.caps?.timeoutMs, 180_001, "caller timeout must not be clamped")
  const records = item.diagnostics ?? []
  assert(records.length > 0, `${id}: native findings must not become an empty pass`)
  assert(
    records.some((record) => rule.test(record.rule ?? "")),
    `${id}: expected native rule ${rule}`,
  )
  for (const record of records) {
    assert(
      record.location.startsWith(`${file}:`),
      `${id}: target-file containment: ${record.location}`,
    )
    assert.match(record.location, /:\d+:\d+$/)
    assert(record.message)
    assert(record.severity)
    assert.equal(record.tool, id)
  }
  assert((item.totalDiagnostics ?? -1) >= records.length)
  exercised.add(id)
  return item
}
async function scenario(name: string, run: () => Promise<void>) {
  try {
    await run()
    await unchanged()
    console.log(`PASS native ${name}`)
  } catch (cause) {
    failures.push(`${name}: ${cause instanceof Error ? cause.stack : String(cause)}`)
    console.error(`FAIL native ${name}: ${String(cause)}`)
  }
}

const deadline = setTimeout(() => {
  console.error("Native E2E deadline exceeded (no silent skips)")
  process.exitCode = 1
  void Promise.allSettled(transports.map((transport) => transport.close()))
}, 360_000)
try {
  await mkdir(join(root, ".git"))
  await fixture("python/ruff.toml", 'fix = true\n[lint]\nselect = ["F401"]\n')
  await fixture("python/main.py", 'import os\nanswer: int = "wrong"\n')
  await fixture("shell/main.sh", "#!/bin/sh\necho $unquoted\n")
  await fixture(
    "js/eslint.config.mjs",
    'export default [{ rules: { "no-unused-vars": "error" } }]\n',
  )
  await fixture("js/main.js", "const unused = 1;\n")
  await fixture(
    "yaml/.yamllint",
    "extends: default\nrules:\n  document-start: disable\n  truthy: disable\n",
  )
  await fixture("yaml/main.yaml", "enabled: yes\nkey: 1\nkey: 2\n")
  await fixture(
    ".github/workflows/test.yml",
    // biome-ignore lint/suspicious/noTemplateCurlyInString: Literal GitHub Actions expression under test.
    "name: Test\non: push\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: echo '${{ totally_unknown.value }}'\n",
  )
  await fixture(
    ".markdownlint-cli2.jsonc",
    '{ "fix": true, "globs": ["**/*.md"], "config": { "default": false, "MD012": true } }\n',
  )
  await fixture("markdown/main.md", "# Title\n\n\nText\n")
  await fixture("markdown/sibling.md", "# Sibling\n\n\nText\n")
  await fixture("css/.stylelintrc.json", '{"rules":{"color-no-invalid-hex":true}}\n')
  await fixture("css/main.css", "a { color: #ggg; }\n")
  await fixture("go/go.mod", "module example.com/nativefixture\n\ngo 1.23\n")
  await fixture(
    "go/main.go",
    'package fixture\nimport "strings"\nfunc Check(s string) bool { return strings.Index(s, "x") >= 0 }\n',
  )
  await fixture(
    "rust/Cargo.toml",
    '[package]\nname = "nativefixture"\nversion = "0.1.0"\nedition = "2021"\n',
  )
  await fixture(
    "rust/src/lib.rs",
    "#![warn(clippy::eq_op)]\npub fn check(value: u32) -> bool { value == value }\n",
  )
  await fixture(
    "rust-denied/Cargo.toml",
    '[package]\nname = "nativedeniedfixture"\nversion = "0.1.0"\nedition = "2021"\n',
  )
  await fixture(
    "rust-denied/src/lib.rs",
    "#![deny(clippy::eq_op)]\npub fn check(value: u32) -> bool { value == value }\n",
  )
  await fixture("unconfigured/main.js", "const unused = 1;\n")
  await fixture("unconfigured/main.css", "a { color: #ggg; }\n")
  await fixture("unconfigured/main.go", "package fixture\n")
  await fixture("unconfigured/main.rs", "pub fn check() {}\n")
  await fixture(
    "invalid/eslint.config.mjs",
    "export default { rules: { 'no-such-native-rule': 'error' } }\n",
  )
  await fixture("invalid/main.js", "const x = 1;\n")
  await fixture("many/ruff.toml", '[lint]\nselect = ["F821"]\n')
  await fixture(
    "many/main.py",
    `${Array.from({ length: 135 }, (_, i) => `undefined_${i}`).join("\n")}\n`,
  )

  const client = await connect()
  await scenario("Ruff + real ty unified, config and fix=true readonly", async () => {
    const results = await diagnostics(client, "python/main.py")
    finding(results, "ruff", "python/main.py", /^F401$/)
    assert.equal(results[0]?.provider, "ty")
    assert.equal(results[0]?.status, "ok", results[0]?.note)
    assert((results[0]?.data?.totalDiagnostics ?? 0) > 0, "real ty must report type mismatch")
    exercised.add("ty")
  })
  for (const [id, file, rule] of [
    ["shellcheck", "shell/main.sh", /^(SC)?2086$/],
    ["eslint", "js/main.js", /^no-unused-vars$/],
    ["yamllint", "yaml/main.yaml", /^key-duplicates$/],
    ["markdownlint-cli2", "markdown/main.md", /MD012/],
    ["stylelint", "css/main.css", /^color-no-invalid-hex$/],
    ["staticcheck", "go/main.go", /^S1003$/],
    ["clippy", "rust/src/lib.rs", /eq_op/],
  ] as const) {
    await scenario(`${id} native findings`, async () => {
      finding(await diagnostics(client, file, [id]), id, file, rule)
    })
  }
  await scenario(
    "Clippy denied findings (native exit 101) are not operational errors",
    async () => {
      finding(
        await diagnostics(client, "rust-denied/src/lib.rs", ["clippy"]),
        "clippy",
        "rust-denied/src/lib.rs",
        /eq_op/,
      )
    },
  )
  await scenario("workflow runs both YAML and actionlint", async () => {
    const results = await diagnostics(client, ".github/workflows/test.yml")
    provider(results, "yamllint", "ok")
    finding(results, "actionlint", ".github/workflows/test.yml", /expression/)
    assert.equal(results.filter((item) => item.mechanism === "cli").length, 2)
  })
  await scenario("project config disables yamllint truthy", async () => {
    const item = provider(
      await diagnostics(client, "yaml/main.yaml", ["yamllint"]),
      "yamllint",
      "ok",
    )
    assert(!item.diagnostics?.some((record) => record.rule === "truthy"))
  })
  await scenario("all required absent configs are not-applicable", async () => {
    for (const [file, id] of [
      ["main.js", "eslint"],
      ["main.css", "stylelint"],
      ["main.go", "staticcheck"],
      ["main.rs", "clippy"],
    ]) {
      provider(await diagnostics(client, `unconfigured/${file}`, [id]), id, "not-applicable")
    }
  })
  await scenario("invalid native config is operational error, not findings or clean", async () => {
    const item = provider(
      await diagnostics(client, "invalid/main.js", ["eslint"]),
      "eslint",
      "error",
    )
    assert(item.note)
  })
  await scenario("diagnostic truncation and total remain honest", async () => {
    const item = finding(
      await diagnostics(client, "many/main.py", ["ruff"]),
      "ruff",
      "many/main.py",
      /^F821$/,
    )
    assert.equal(item.totalDiagnostics, 135)
    assert.equal(item.truncated, true)
    assert.equal(item.diagnostics?.length, item.caps?.diagnostics)
    assert((item.diagnostics?.length ?? 0) < 135)
  })
  await scenario("diagnostics containment and invalid deadline", async () => {
    await symlink(join(root, "shell/main.sh"), join(root, "link.sh"))
    for (const args of [
      { file: resolve(import.meta.dir, "native-quality.ts") },
      { file: "../outside.sh" },
      { file: "link.sh" },
      { file: ".git/config" },
      { file: "shell/main.sh", timeoutMs: 0 },
    ]) {
      const response = await client.callTool({ name: "diagnostics", arguments: args })
      assert.equal(response.isError, true, `must refuse ${JSON.stringify(args)}`)
    }
  })
  await scenario(
    "physical LSP absence does not block CLI; missing binary unavailable",
    async () => {
      const bin = join(root, "minimal-bin")
      await mkdir(bin)
      for (const name of ["dirname", "env", "bun"]) {
        const executable = Bun.which(name)
        assert(executable, `${name} required; not a skip`)
        await symlink(executable, join(bin, name))
      }
      const isolated = await connect(bin)
      let response = await isolated.callTool({
        name: "diagnostics",
        arguments: { file: "shell/main.sh" },
      })
      provider(decode(response), "shellcheck", "unavailable")
      // Reconnect after exposing the actual installed binary, not a fake analyzer.
      await isolated.close()
      const shellcheck = Bun.which("shellcheck")
      assert(shellcheck, "installed ShellCheck required; not a skip")
      await symlink(shellcheck, join(bin, "shellcheck"))
      const cliOnly = await connect(bin)
      response = await cliOnly.callTool({
        name: "diagnostics",
        arguments: { file: "shell/main.sh", timeoutMs: 180_001 },
      })
      const results = decode(response)
      assert.notEqual(results[0]?.status, "ok", "no bash LSP is on PATH")
      finding(results, "shellcheck", "shell/main.sh", /^(SC)?2086$/)
      await cliOnly.close()
    },
  )
  await client.close()
  await unchanged()
  console.log(`Native tools actually exercised: ${[...exercised].sort().join(", ")}`)
  const required = [
    "ruff",
    "ty",
    "eslint",
    "shellcheck",
    "yamllint",
    "actionlint",
    "markdownlint-cli2",
    "stylelint",
    "staticcheck",
    "clippy",
  ]
  for (const id of required)
    assert(exercised.has(id), `${id}: no successful native evidence (not skipped)`)
  assert.equal(failures.length, 0, failures.join("\n\n"))
  console.log("PASS native MCP acceptance; not a claim of full language ecosystem coverage")
} finally {
  clearTimeout(deadline)
  await Promise.allSettled(transports.map((transport) => transport.close()))
  await rm(root, { recursive: true, force: true })
}
