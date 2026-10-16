import assert from "node:assert/strict"
import { mkdir, mkdtemp, readdir, readFile, rm, stat, symlink, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { Client } from "@modelcontextprotocol/sdk@1/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk@1/client/stdio.js"
import { runEngine } from "../src/engine.ts"

const workspace = await mkdtemp(join(tmpdir(), "remote-memory-e2e-"))
const home = join(workspace, "home")
const xdg = join(workspace, "xdg")
await mkdir(home, { recursive: true })
await mkdir(xdg, { recursive: true })
const entrypoint = resolve(import.meta.dir, "../bin/mcp-remote-memory")

const transports: StdioClientTransport[] = []
async function cleanup() {
  await Promise.allSettled(transports.map((transport) => transport.close()))
  await rm(workspace, { recursive: true, force: true })
}

type Response = Awaited<ReturnType<Client["callTool"]>>

function decode<T>(response: Response): T {
  const value = response as { content: { text: string }[] }
  const first = value.content[0]
  assert(first && typeof first.text === "string")
  return JSON.parse(first.text) as T
}

function decodeError(response: Response, pattern: RegExp): string {
  assert.equal(response.isError, true, `expected an error for ${pattern}`)
  const value = response as { content: { text: string }[] }
  const text = value.content[0]?.text ?? ""
  let message = text
  try {
    message = (JSON.parse(text) as { error: string }).error
  } catch {
    // SDK schema-validation failures arrive as protocol error text, not our JSON envelope.
  }
  assert.match(message, pattern)
  return message
}

async function connect(env: Record<string, string>) {
  // An independent child cache makes a real cold-server startup test possible;
  // reuse the same directory for a subsequent warm-cache offline suite run.
  const cache = process.env.REMOTE_MEMORY_E2E_SERVER_CACHE_DIR ?? process.env.BUN_INSTALL_CACHE_DIR
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ["--no-env-file", entrypoint],
    cwd: workspace,
    env: {
      PATH: process.env.PATH ?? "",
      XDG_CACHE_HOME: process.env.XDG_CACHE_HOME ?? join(process.env.HOME ?? "", ".cache"),
      ...(cache ? { BUN_INSTALL_CACHE_DIR: cache } : {}),
      ...env,
    },
    stderr: "pipe",
  })
  transports.push(transport)
  transport.stderr?.on("data", (chunk: Buffer) => process.stderr.write(chunk))
  const client = new Client({ name: "remote-memory-e2e", version: "1" })
  await client.connect(transport)
  return client
}

const call = (client: Client, name: string, args: Record<string, unknown>) =>
  client.callTool({ name, arguments: args })

interface Resolved {
  path: string
  scope: string
  schema_version: number
  harness?: string
  repo_id?: string
  task_id?: string
  session_id?: string
}

interface SearchHit {
  kind: "text" | "csv"
  path: string
  score: number
  start_line?: number
  end_line?: number
  snippet?: string
  record?: number
  id?: string
  row?: Record<string, string>
  truncated?: boolean
}

interface SearchResult {
  ok: boolean
  counts: { files: number; skipped: Record<string, number> }
  paths: string[]
  results?: SearchHit[]
}

async function protocolAndResolverCheck() {
  const client = await connect({ HOME: home, XDG_DATA_HOME: xdg })
  assert.deepEqual((await client.listTools()).tools.map((tool) => tool.name).sort(), [
    "index",
    "resolve_root",
    "search",
  ])
  const base = join(xdg, "agent-memory")
  const cases: [Record<string, unknown>, string, string][] = [
    [
      { scope: "harness", harness: "opencode", create: true },
      "harnesses/opencode/global",
      "harness",
    ],
    [
      { scope: "repository", repo_id: "dotfiles", create: true },
      "repos/dotfiles/private",
      "repository",
    ],
    [
      { scope: "task", repo_id: "dotfiles", task_id: "remote-2026", create: true },
      "repos/dotfiles/tasks/remote-2026",
      "task",
    ],
    [
      { scope: "session", harness: "opencode", session_id: "ses-1", create: true },
      "harnesses/opencode/sessions/ses-1",
      "session",
    ],
  ]
  for (const [args, relative, scopeName] of cases) {
    const response = await call(client, "resolve_root", args)
    assert(!response.isError, `resolve_root failed for ${JSON.stringify(args)}`)
    const resolved = response.structuredContent as Resolved | undefined
    assert(resolved, "resolve_root must return structuredContent for the migration client")
    assert.equal(resolved.path, join(base, relative))
    assert.equal(resolved.scope, scopeName)
    assert.equal(resolved.schema_version, 1)
    const metadata = await readFile(join(resolved.path, ".scope.md"), "utf8")
    assert.match(metadata, /^schema_version: 1\n/)
    assert.match(metadata, new RegExp(`^scope: ${scopeName}$`, "m"))
    for (const [key, value] of Object.entries(args)) {
      if (key !== "create" && key !== "scope")
        assert.match(metadata, new RegExp(`^${key}: ${value}$`, "m"))
    }
    assert.deepEqual(
      Object.keys(args).filter((key) => key !== "create" && key !== "scope" && !(key in resolved)),
      [],
    )
  }
  // Reject irrelevant fields, invalid IDs and absent scopes without create.
  decodeError(
    await call(client, "resolve_root", { scope: "harness", harness: "a", repo_id: "x" }),
    /unexpected|invalid/i,
  )
  decodeError(await call(client, "resolve_root", { scope: "harness", harness: ".." }), /invalid/i)
  decodeError(
    await call(client, "resolve_root", { scope: "harness", harness: "absent" }),
    /does not exist/,
  )
  // Metadata mismatch fails closed, including memory index on that scope.
  const harnessRoot = join(base, "harnesses/opencode/global")
  await writeFile(
    join(harnessRoot, ".scope.md"),
    "schema_version: 1\nscope: harness\nharness: other\n",
  )
  decodeError(
    await call(client, "resolve_root", { scope: "harness", harness: "opencode" }),
    /mismatch/,
  )
  decodeError(
    await call(client, "index", {
      target: { kind: "memory", scope: "harness", harness: "opencode" },
    }),
    /mismatch/,
  )
  await writeFile(
    join(harnessRoot, ".scope.md"),
    "schema_version: 1\nscope: harness\nharness: opencode\n",
  )
  assert(!(await call(client, "resolve_root", { scope: "harness", harness: "opencode" })).isError)
  // Missing metadata: create=false errors; create=true refuses to adopt a nonempty directory.
  await rm(join(harnessRoot, ".scope.md"))
  await writeFile(join(harnessRoot, "keep.md"), "stray content\n")
  decodeError(
    await call(client, "resolve_root", { scope: "harness", harness: "opencode" }),
    /metadata/,
  )
  decodeError(
    await call(client, "resolve_root", { scope: "harness", harness: "opencode", create: true }),
    /nonempty/,
  )
  await client.close()
}

async function memoryRootOverrideCheck() {
  const client = await connect({ HOME: home, MEMORY_ROOT: join(workspace, "gone-mount") })
  decodeError(
    await call(client, "resolve_root", { scope: "harness", harness: "x", create: true }),
    /does not exist/,
  )
  await client.close()
  const relative = await connect({ HOME: home, MEMORY_ROOT: "relative/path" })
  decodeError(await call(relative, "resolve_root", { scope: "harness", harness: "x" }), /absolute/)
  await relative.close()
  const gitRoot = join(workspace, "gitroot")
  await mkdir(join(gitRoot, ".git"), { recursive: true })
  await mkdir(join(gitRoot, "agent-memory"), { recursive: true })
  const git = await connect({ HOME: home, MEMORY_ROOT: join(gitRoot, "agent-memory") })
  decodeError(
    await call(git, "resolve_root", { scope: "harness", harness: "x", create: true }),
    /Git worktree/,
  )
  await git.close()
  const mount = join(workspace, "mount")
  await mkdir(mount)
  const valid = await connect({ HOME: home, MEMORY_ROOT: mount })
  const resolved = (
    await call(valid, "resolve_root", {
      scope: "task",
      repo_id: "dotfiles",
      task_id: "t1",
      create: true,
    })
  ).structuredContent as Resolved
  assert.equal(resolved.path, join(mount, "repos/dotfiles/tasks/t1"))
  await valid.close()
}

async function memorySearchCheck() {
  const client = await connect({ HOME: home, XDG_DATA_HOME: xdg })
  const root = join(xdg, "agent-memory/repos/dotfiles/tasks/remote-2026")
  await mkdir(join(root, "sub"), { recursive: true })
  await writeFile(
    join(root, "runbook.md"),
    "deployment runbook for staging\nthe pipeline uses bun\n",
  )
  await writeFile(join(root, "notes.md"), "shopping list for the weekend\n")
  await writeFile(join(root, "sub/child.md"), "deployment notes inside the subtree\n")
  const target = { kind: "memory", scope: "task", repo_id: "dotfiles", task_id: "remote-2026" }
  const indexed = decode<SearchResult>(await call(client, "index", { target }))
  assert.equal(indexed.ok, true)
  assert.deepEqual(indexed.paths.sort(), ["notes.md", "runbook.md", "sub/child.md"])
  const found = decode<SearchResult>(await call(client, "search", { target, query: "deployment" }))
  assert.deepEqual(found.results?.map((hit) => hit.path).sort(), ["runbook.md", "sub/child.md"])
  const runbook = found.results?.find((hit) => hit.path === "runbook.md")
  assert.equal(runbook?.kind, "text")
  assert.equal(runbook?.start_line, 1)
  assert.equal(runbook?.end_line, 2)
  assert.match(runbook?.snippet ?? "", /deployment runbook/)
  // Direct edits are visible on the next call; indexes are disposable and fresh.
  await writeFile(join(root, "runbook.md"), "flibbertigibbet artifact recorded now\n")
  const fresh = decode<SearchResult>(
    await call(client, "search", { target, query: "flibbertigibbet" }),
  )
  assert.deepEqual(
    fresh.results?.map((hit) => hit.path),
    ["runbook.md"],
  )
  // Subtree isolation: results stay inside the requested subdirectory.
  const subtree = decode<SearchResult>(
    await call(client, "search", {
      target: { ...target, subdirectory: "sub" },
      query: "deployment",
    }),
  )
  assert.deepEqual(
    subtree.results?.map((hit) => hit.path),
    ["child.md"],
  )
  // Scope metadata is excluded from memory retrieval.
  const metadata = decode<SearchResult>(
    await call(client, "search", { target, query: "schema_version" }),
  )
  assert.equal(metadata.results?.length, 0)
  // BM25 ranks the denser document first; identical content ties break by path.
  await writeFile(
    join(root, "dense.md"),
    "quetzalcoatl appears\nquetzalcoatl again\nquetzalcoatl once more\n",
  )
  await writeFile(join(root, "sparse.md"), "a single quetzalcoatl mention\n")
  const ranked = decode<SearchResult>(
    await call(client, "search", { target, query: "quetzalcoatl" }),
  )
  assert.equal(ranked.results?.[0]?.path, "dense.md")
  assert.equal(ranked.results?.[1]?.path, "sparse.md")
  assert((ranked.results?.[0]?.score ?? 1) < (ranked.results?.[1]?.score ?? 0))
  await writeFile(join(root, "tie-a.md"), "parallelism token zebra\n")
  await writeFile(join(root, "tie-b.md"), "parallelism token zebra\n")
  const tied = decode<SearchResult>(await call(client, "search", { target, query: "parallelism" }))
  assert.deepEqual(
    tied.results?.map((hit) => hit.path),
    ["tie-a.md", "tie-b.md"],
  )
  assert.equal(tied.results?.[0]?.score, tied.results?.[1]?.score)
  // Traversal, absent subtrees and symlinks fail closed.
  decodeError(
    await call(client, "index", { target: { ...target, subdirectory: "../escape" } }),
    /traverse parents/,
  )
  decodeError(
    await call(client, "index", { target: { ...target, subdirectory: "missing" } }),
    /does not exist/,
  )
  const outside = join(workspace, "outside")
  await mkdir(outside)
  await writeFile(join(outside, "secret.md"), "quokka secret outside\n")
  await symlink(outside, join(root, "escape"), "dir")
  decodeError(
    await call(client, "index", { target: { ...target, subdirectory: "escape" } }),
    /symlink/,
  )
  await client.close()
}

async function customDirectoryCheck() {
  const dir = join(workspace, "custom")
  await mkdir(join(dir, ".git"), { recursive: true })
  await mkdir(join(dir, "node_modules/pkg"), { recursive: true })
  await writeFile(join(dir, "alpha.txt"), "the quokka marsupial hops\nsecond line here\n")
  await writeFile(join(dir, "beta.md"), "quokka facts in markdown\n")
  await writeFile(join(dir, ".hidden.md"), "hidden quokka content\n")
  await writeFile(join(dir, ".git/config"), "quokka git internals\n")
  await writeFile(join(dir, "node_modules/pkg/index.js"), "quokka dependency code\n")
  await writeFile(join(dir, "binary.bin"), Buffer.from([0xff, 0xfe, 0x00, 0x01]))
  await symlink(join(dir, "alpha.txt"), join(dir, "link.txt"))
  const client = await connect({ HOME: home, XDG_DATA_HOME: xdg })
  const target = { kind: "directory", path: dir }
  const found = decode<SearchResult>(await call(client, "search", { target, query: "quokka" }))
  assert.deepEqual(found.results?.map((hit) => hit.path).sort(), ["alpha.txt", "beta.md"])
  assert.equal(found.results?.find((hit) => hit.path === "alpha.txt")?.start_line, 1)
  assert.equal(found.counts.skipped.hidden >= 1, true)
  assert.equal(found.counts.skipped.build >= 1, true)
  assert.equal(found.counts.skipped.symlink >= 1, true)
  assert.equal(found.counts.skipped.binary >= 1, true)
  assert.equal(
    found.paths.some((path) => path.includes(".git") || path.includes("node_modules")),
    false,
  )
  // A root symlink is canonicalized; a search never writes or mutates the directory.
  const before = (await readdir(dir)).sort()
  const mtimes = new Map(
    await Promise.all(
      ["alpha.txt", "beta.md"].map(
        async (name) => [name, (await stat(join(dir, name))).mtimeMs] as const,
      ),
    ),
  )
  await symlink(dir, join(workspace, "customlink"), "dir")
  const viaLink = decode<SearchResult>(
    await call(client, "search", {
      target: { kind: "directory", path: join(workspace, "customlink") },
      query: "quokka",
    }),
  )
  assert.equal(viaLink.results?.length, 2)
  assert.deepEqual((await readdir(dir)).sort(), before)
  for (const [name, mtime] of mtimes) assert.equal((await stat(join(dir, name))).mtimeMs, mtime)
  // Explicit files: containment, hidden allowance, Git refusal, symlink refusal, binary skip.
  const explicit = decode<SearchResult>(
    await call(client, "search", { target: { ...target, files: ["alpha.txt"] }, query: "quokka" }),
  )
  assert.deepEqual(
    explicit.results?.map((hit) => hit.path),
    ["alpha.txt"],
  )
  const hidden = decode<SearchResult>(
    await call(client, "search", { target: { ...target, files: [".hidden.md"] }, query: "quokka" }),
  )
  assert.deepEqual(
    hidden.results?.map((hit) => hit.path),
    [".hidden.md"],
  )
  const binary = decode<SearchResult>(
    await call(client, "search", { target: { ...target, files: ["binary.bin"] }, query: "quokka" }),
  )
  assert.equal(binary.results?.length, 0)
  assert.equal(binary.counts.skipped.binary, 1)
  decodeError(
    await call(client, "search", {
      target: { ...target, files: [".git/config"] },
      query: "quokka",
    }),
    /Git internals/,
  )
  decodeError(
    await call(client, "search", {
      target: { ...target, files: ["../outside/secret.md"] },
      query: "quokka",
    }),
    /traverse parents/,
  )
  decodeError(
    await call(client, "search", { target: { ...target, files: ["link.txt"] }, query: "quokka" }),
    /symlink/,
  )
  decodeError(
    await call(client, "search", {
      target: { ...target, files: ["missing.txt"] },
      query: "quokka",
    }),
    /does not exist/,
  )
  decodeError(
    await call(client, "search", {
      target: { kind: "directory", path: join(workspace, "nope") },
      query: "x",
    }),
    /does not exist/,
  )
  decodeError(
    await call(client, "search", {
      target: { kind: "directory", path: "relative/dir" },
      query: "x",
    }),
    /absolute/,
  )
  await client.close()
}

async function csvCheck() {
  const dir = join(workspace, "csv")
  await mkdir(dir)
  await writeFile(
    join(dir, "catalog.csv"),
    'id,name,notes\n1,apple,"a fruit with quoted, comma and\nmultiline notes about apple"\n2,Banana,"yellow fruit"\n3,CHERRY,"cherry notes"\n',
  )
  const client = await connect({ HOME: home, XDG_DATA_HOME: xdg })
  const target = { kind: "directory", path: dir, files: ["catalog.csv"] }
  const found = decode<SearchResult>(await call(client, "search", { target, query: "apple" }))
  const apple = found.results?.[0]
  assert.equal(apple?.kind, "csv")
  assert.equal(apple?.record, 1)
  assert.equal(apple?.id, "1")
  assert.match(apple?.row?.notes ?? "", /multiline notes about apple/)
  assert.match(apple?.row?.notes ?? "", /quoted, comma/)
  assert.equal(apple?.truncated, false)
  const fruit = decode<SearchResult>(await call(client, "search", { target, query: "fruit" }))
  // BM25 order is by score, so only assert the matching records and ascending scores.
  assert.deepEqual(fruit.results?.map((hit) => hit.record).sort(), [1, 2])
  assert((fruit.results?.[0]?.score ?? 1) <= (fruit.results?.[1]?.score ?? 0))
  // fields restrict searchable columns, not output projection.
  const byName = decode<SearchResult>(
    await call(client, "search", { target, query: "yellow", fields: ["name"] }),
  )
  assert.equal(byName.results?.length, 0)
  const byNotes = decode<SearchResult>(
    await call(client, "search", { target, query: "yellow", fields: ["notes"] }),
  )
  assert.deepEqual(
    byNotes.results?.map((hit) => hit.record),
    [2],
  )
  decodeError(
    await call(client, "search", { target, query: "x", fields: ["nope"] }),
    /missing from CSV/,
  )
  decodeError(
    await call(client, "search", { target, query: "x", fields: ["id", "id"] }),
    /duplicates/,
  )
  // filters are case-sensitive exact equality, ANDed before ranking.
  const filtered = decode<SearchResult>(
    await call(client, "search", { target, query: "fruit", filters: { name: "Banana" } }),
  )
  assert.deepEqual(
    filtered.results?.map((hit) => hit.record),
    [2],
  )
  const caseMiss = decode<SearchResult>(
    await call(client, "search", { target, query: "fruit", filters: { name: "banana" } }),
  )
  assert.equal(caseMiss.results?.length, 0)
  // Filter-only retrieval: no query, score 0, deterministic record order.
  const filterOnly = decode<SearchResult>(
    await call(client, "search", { target, filters: { id: "2" } }),
  )
  assert.equal(filterOnly.results?.length, 1)
  assert.equal(filterOnly.results?.[0]?.record, 2)
  assert.equal(filterOnly.results?.[0]?.score, 0)
  decodeError(await call(client, "search", { target }), /query is required/)
  const mixed = join(workspace, "mixed")
  await mkdir(mixed)
  await writeFile(join(mixed, "data.csv"), "id,name\n1,alpha\n")
  await writeFile(join(mixed, "note.md"), "plain markdown note\n")
  decodeError(
    await call(client, "search", {
      target: { kind: "directory", path: mixed },
      query: "alpha",
      fields: ["id"],
    }),
    /non-CSV/,
  )
  // Header and record errors fail closed.
  await writeFile(join(dir, "dup.csv"), "id,id\n1,2\n")
  decodeError(
    await call(client, "search", {
      target: { kind: "directory", path: dir, files: ["dup.csv"] },
      query: "x",
    }),
    /duplicate CSV header/,
  )
  await writeFile(join(dir, "blank.csv"), "id,\n1,2\n")
  decodeError(
    await call(client, "search", {
      target: { kind: "directory", path: dir, files: ["blank.csv"] },
      query: "x",
    }),
    /blank CSV header/,
  )
  await writeFile(join(dir, "ragged.csv"), "id,name\n1\n")
  decodeError(
    await call(client, "search", {
      target: { kind: "directory", path: dir, files: ["ragged.csv"] },
      query: "x",
    }),
    /unequal-width/,
  )
  await writeFile(join(dir, "broken.csv"), 'id,name\n1,"unbalanced\n')
  decodeError(
    await call(client, "search", {
      target: { kind: "directory", path: dir, files: ["broken.csv"] },
      query: "x",
    }),
    /malformed CSV/,
  )
  // csv-parse strict quoting errors map to the same malformed label.
  await writeFile(join(dir, "junk.csv"), 'id,name\n1,"a"junk,b\n')
  decodeError(
    await call(client, "search", {
      target: { kind: "directory", path: dir, files: ["junk.csv"] },
      query: "x",
    }),
    /malformed CSV/,
  )
  await client.close()
}

async function boundsAndQueryCheck() {
  const dir = join(workspace, "bounds")
  await mkdir(dir)
  await writeFile(join(dir, "big.txt"), "a".repeat((1 << 20) + 1))
  const client = await connect({ HOME: home, XDG_DATA_HOME: xdg })
  decodeError(
    await call(client, "search", { target: { kind: "directory", path: dir }, query: "aaaa" }),
    /file byte bound/,
  )
  decodeError(
    await call(client, "search", {
      target: { kind: "directory", path: dir },
      query: "x".repeat(513),
    }),
    /invalid|too long/i,
  )
  decodeError(
    await call(client, "search", {
      target: { kind: "directory", path: dir },
      query: Array(33).fill("term").join(" "),
    }),
    /word tokens/,
  )
  decodeError(
    await call(client, "search", {
      target: { kind: "directory", path: dir },
      query: "??? --- !!!",
    }),
    /word token/,
  )
  decodeError(
    await call(client, "search", {
      target: { kind: "directory", path: dir },
      query: "x",
      limit: 0,
    }),
    /invalid/i,
  )
  decodeError(
    await call(client, "search", {
      target: { kind: "directory", path: dir },
      query: "x",
      limit: 51,
    }),
    /invalid/i,
  )
  // Skipped entries still count: enumeration must stop at the bound even for hidden files.
  const entries = join(workspace, "entry-bound")
  await mkdir(entries)
  for (let index = 0; index <= 10000; index++) {
    await writeFile(join(entries, `.hidden-${index}`), "")
  }
  decodeError(
    await call(client, "index", { target: { kind: "directory", path: entries } }),
    /visited-entry bound exceeded \(10000\)/,
  )
  await client.close()
}

async function integrationSafetyCheck() {
  const client = await connect({ HOME: home, XDG_DATA_HOME: xdg })
  const identity = { scope: "repository", repo_id: "safety" }
  const scope = decode<Resolved>(await call(client, "resolve_root", { ...identity, create: true }))
  const metadata = join(scope.path, ".scope.md")
  const savedMetadata = await readFile(metadata, "utf8")
  const outside = join(workspace, "outside-metadata")
  await writeFile(outside, savedMetadata)
  await rm(metadata)
  await symlink(outside, metadata)
  decodeError(await call(client, "resolve_root", identity), /symlink/)
  await rm(metadata)
  await writeFile(metadata, savedMetadata)

  const dir = join(workspace, "safety-directory")
  const neighbor = join(workspace, "safety-neighbor")
  await mkdir(dir)
  await mkdir(neighbor)
  await writeFile(join(neighbor, "secret.txt"), "never expose neighbor")
  await symlink(neighbor, join(dir, "linked"))
  decodeError(
    await call(client, "index", {
      target: { kind: "directory", path: dir, files: ["linked/secret.txt"] },
    }),
    /symlink/,
  )
  await writeFile(join(dir, "binary.dat"), "header\u0000payload")
  const indexed = decode<SearchResult>(
    await call(client, "index", {
      target: { kind: "directory", path: dir, files: ["binary.dat"] },
    }),
  )
  assert.equal(indexed.counts.skipped.binary, 1)
  assert.deepEqual(indexed.paths, [])

  await writeFile(join(dir, "large.csv"), `id,note\n1,${"é".repeat(6000)}\n`)
  const csv = decode<SearchResult>(
    await call(client, "search", {
      target: { kind: "directory", path: dir, files: ["large.csv"] },
      filters: { id: "1" },
    }),
  )
  assert.equal(csv.results?.[0]?.truncated, true)
  assert(Buffer.byteLength(JSON.stringify(csv.results?.[0]?.row), "utf8") <= 4096)
  await writeFile(join(dir, "unicode.txt"), `needle ${"é".repeat(3000)}`)
  const text = decode<SearchResult>(
    await call(client, "search", {
      target: { kind: "directory", path: dir, files: ["unicode.txt"] },
      query: "needle",
    }),
  )
  const snippet = text.results?.[0]?.snippet ?? ""
  assert.equal(text.results?.[0]?.truncated, true)
  assert(Buffer.byteLength(snippet, "utf8") <= 4096)
  assert(!snippet.includes("\uFFFD"), "UTF-8 truncation must not split a code point")
  await writeFile(join(dir, "large-id.csv"), `id,note\n${"é".repeat(3000)},needle\n`)
  const largeId = decode<SearchResult>(
    await call(client, "search", {
      target: { kind: "directory", path: dir, files: ["large-id.csv"] },
      query: "needle",
    }),
  )
  assert.equal(largeId.results?.[0]?.truncated, true)
  assert.equal(largeId.results?.[0]?.id, undefined)
  assert(Buffer.byteLength(JSON.stringify(largeId.results?.[0]?.row), "utf8") <= 4096)
  await client.close()

  const repoData = join(workspace, "git-data")
  await mkdir(join(repoData, ".git"), { recursive: true })
  const gitClient = await connect({ HOME: home, XDG_DATA_HOME: repoData })
  decodeError(
    await call(gitClient, "resolve_root", {
      scope: "repository",
      repo_id: "no-leak",
      create: true,
    }),
    /Git worktree/,
  )
  await assert.rejects(stat(join(repoData, "agent-memory")))
  await gitClient.close()

  // The engine is in-process: MCP search must serve with no python3 anywhere on PATH.
  const noPythonBin = join(workspace, "no-python-bin")
  await mkdir(noPythonBin)
  const withoutPython = await connect({ HOME: home, XDG_DATA_HOME: xdg, PATH: noPythonBin })
  const served = decode<SearchResult>(
    await call(withoutPython, "search", {
      target: { kind: "directory", path: dir, files: ["large.csv"] },
      filters: { id: "1" },
    }),
  )
  assert.equal(served.results?.length, 1)
  assert.equal(served.results?.[0]?.record, 1)
  await withoutPython.close()

  // Ranking is delegated to MiniSearch: engine score is exactly the library score,
  // negated only to keep the lower-is-better wire ordering, denser corpus first.
  const ranking = join(workspace, "ranking")
  await mkdir(ranking)
  const denseText = "quetzalcoatl appears\nquetzalcoatl again\nquetzalcoatl once more"
  const sparseText = "a single quetzalcoatl mention"
  await writeFile(join(ranking, "dense.txt"), denseText)
  await writeFile(join(ranking, "sparse.txt"), sparseText)
  const direct = runEngine({
    profile: "custom",
    root: ranking,
    operation: "search",
    tokens: ["quetzalcoatl"],
    limit: 10,
  })
  const hits = direct.results ?? []
  assert.deepEqual(
    hits.map((hit) => hit.path),
    ["dense.txt", "sparse.txt"],
  )
  assert(hits[0].score < hits[1].score)
  // Keep this comparison import local. Bun 1.4.2 fails cold graph resolution of the
  // versioned CSV subpath when this extra MiniSearch import precedes the SDK imports.
  const { default: MiniSearch } = await import("minisearch@7.2.0")
  const library = new MiniSearch<{ id: string; text: string }>({ fields: ["text"] })
  library.addAll([
    { id: "dense.txt", text: denseText },
    { id: "sparse.txt", text: sparseText },
  ])
  const libraryHits = library.search("quetzalcoatl", {
    combineWith: "OR",
    prefix: false,
    fuzzy: false,
  })
  for (const path of ["dense.txt", "sparse.txt"]) {
    const libraryHit = libraryHits.find((hit) => hit.id === path)
    const engineHit = hits.find((hit) => hit.path === path)
    assert(libraryHit, `library must match ${path}`)
    assert.equal(engineHit?.score, -libraryHit.score)
  }
  const rankingClient = await connect({ HOME: home, XDG_DATA_HOME: xdg })
  const servedRanking = decode<SearchResult>(
    await call(rankingClient, "search", {
      target: { kind: "directory", path: ranking },
      query: "quetzalcoatl",
    }),
  )
  assert.deepEqual(servedRanking.results, hits)
  await rankingClient.close()
}

async function skillCatalogCheck() {
  const skills = resolve(import.meta.dir, "../../../skills")
  const cases = [
    {
      directory: "working-principles",
      file: "catalog.csv",
      fields: ["id", "use_when", "perspective"],
      query: "surgical",
      id: "implementation",
    },
    {
      directory: "team-operating-model",
      file: "personas.csv",
      fields: ["id", "name", "use_when"],
      query: "adversarial",
      id: "adversarial-reviewer",
    },
    {
      directory: "code-craft/scripts/data",
      file: "design-patterns.csv",
      fields: ["id", "name", "intent", "when_to_use"],
      query: "Railway",
      id: "pat-result",
    },
    {
      directory: "architecture-design/scripts/data",
      file: "architecture.csv",
      fields: ["id", "name", "when_to_use"],
      query: "Monolith",
      id: "arch-mod-mono",
    },
    {
      directory: "db-design/scripts/data",
      file: "schema.csv",
      fields: ["id", "name", "when_to_use"],
      query: "UUIDv7",
      id: "db-uuidv7-pk",
    },
  ]
  const client = await connect({ HOME: home, XDG_DATA_HOME: xdg })
  for (const test of cases) {
    const target = { kind: "directory", path: join(skills, test.directory), files: [test.file] }
    const found = decode<SearchResult>(
      await call(client, "search", { target, query: test.query, fields: test.fields, limit: 3 }),
    )
    const hit = found.results?.find((candidate) => candidate.id === test.id)
    assert(hit, `${test.file} must return relevant ${test.id} among the first three rows`)
    assert.equal(hit.kind, "csv")
    assert.equal(hit.path, test.file)
    assert((hit.record ?? 0) >= 1)
    assert.equal(hit.row?.id, test.id)
    const exact = decode<SearchResult>(
      await call(client, "search", { target, filters: { id: test.id } }),
    )
    assert.equal(exact.results?.length, 1)
    assert.equal(exact.results?.[0]?.record, hit.record)
    assert.equal(exact.results?.[0]?.score, 0)
    console.log(`PASS SDK catalog ${test.directory}/${hit.path} record ${hit.record}: ${hit.id}`)
  }
  await client.close()
}

const deadline = setTimeout(() => {
  console.error("E2E deadline exceeded")
  process.exit(1)
}, 120_000)
try {
  await protocolAndResolverCheck()
  await memoryRootOverrideCheck()
  await memorySearchCheck()
  await customDirectoryCheck()
  await csvCheck()
  await boundsAndQueryCheck()
  await integrationSafetyCheck()
  await skillCatalogCheck()
  console.log(
    "PASS explicit cases: absent MEMORY_ROOT refused; custom root symlink canonicalized read-only; text path/line locators; quoted multiline CSV record and fields",
  )
  console.log(
    "PASS tools/initialize, four scope identities, metadata create/verify/mismatch, MEMORY_ROOT override/git refusal, memory search freshness/ranking/subtree isolation, traversal/symlink failure, custom directory skips/read-only/explicit files, CSV quoting/fields/filters/filter-only/header/malformed errors, bounds",
  )
  console.log(
    "PASS in-process engine serves search with no python3 on PATH; MiniSearch BM25+ library score equality and denser-first order on a known corpus",
  )
} finally {
  clearTimeout(deadline)
  await cleanup()
}
