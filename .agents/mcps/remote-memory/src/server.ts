import { z } from "zod@4"
import { existsSync, mkdirSync } from "node:fs"
import { McpServer } from "@modelcontextprotocol/sdk@1/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk@1/server/stdio.js"
import {
  assertBaseOutsideGit,
  BaseResolver,
  configuredBase,
  resolveDirectoryTarget,
  resolveMemorySubdirectory,
  resolveScope,
  type ScopeIdentifiers,
} from "./scope.ts"

// Resolve the SDK graph before the engine graph. Bun 1.4.2 can fail to resolve
// csv-parse's versioned /sync subpath on a cold cache when both graphs load together.
const { runEngine } = await import("./engine.ts")

const instructions = `Scoped external-memory resolver and read-only BM25 search. resolve_root returns the
absolute path of one external scope so the agent reads/edits Markdown and YAML there directly; this server
never writes or manages memory files. Scope identities are caller-selected stable nonsecret IDs; metadata in
.scope.md is verified on every call and mismatches fail closed. index/search rebuild an ephemeral in-memory
MiniSearch BM25+ index per call, so direct edits appear on the next call. Targets are explicit: a memory scope
(optionally one subdirectory) or a custom directory with optional exact relative files; never glob patterns,
never parents.
Custom walks skip and count hidden/build/dependency entries; memory walks fail closed on symlinks and
non-UTF-8 Markdown. fields/filters apply to explicitly selected CSV files only; filters are exact case-sensitive
equality ANDed before ranking. Host-local paths require the same filesystem namespace or a user-supplied
mount. Scope conventions are not filesystem ACLs; normal filesystem permissions still apply.`

const server = new McpServer({ name: "remote-memory", version: "0.1.0" }, { instructions })
const baseResolver = new BaseResolver()

const ident = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/)
const scopes = z.enum(["harness", "repository", "task", "session"])
const MAX_QUERY_CHARS = 512
const MAX_TOKENS = 32
const DEFAULT_LIMIT = 10

const identityKeys = ["harness", "repo_id", "task_id", "session_id"] as const
type IdentityKey = (typeof identityKeys)[number]
const requiredIdents: Record<string, IdentityKey[]> = {
  harness: ["harness"],
  repository: ["repo_id"],
  task: ["repo_id", "task_id"],
  session: ["harness", "session_id"],
}

interface RefineContext {
  addIssue(issue: { code: "custom"; message: string; path?: (string | number)[] }): void
}

interface IdentityCarrier {
  harness?: string
  repo_id?: string
  task_id?: string
  session_id?: string
}

/** Enforce exactly the identity fields each scope requires and reject irrelevant ones. */
function checkScopeIdents(scope: string, value: IdentityCarrier, ctx: RefineContext) {
  const required = requiredIdents[scope]
  if (required === undefined) {
    ctx.addIssue({ code: "custom", message: `unknown scope: ${scope}` })
    return
  }
  for (const key of identityKeys) {
    if (required.includes(key)) {
      if (value[key] === undefined)
        ctx.addIssue({ code: "custom", message: `${scope} scope requires ${key}`, path: [key] })
    } else if (value[key] !== undefined) {
      ctx.addIssue({ code: "custom", message: `${scope} scope rejects ${key}`, path: [key] })
    }
  }
}

const resolveRootShape = {
  scope: scopes,
  harness: ident.optional(),
  repo_id: ident.optional(),
  task_id: ident.optional(),
  session_id: ident.optional(),
  create: z.boolean().optional(),
}
const resolveRootInput = z
  .strictObject(resolveRootShape)
  .superRefine((value, ctx) => checkScopeIdents(value.scope, value, ctx))

// One strict object per contract wire shape; raw shapes are kept for SDK typing (see registerTool casts).
const targetShape = {
  kind: z.enum(["memory", "directory"]),
  scope: scopes.optional(),
  harness: ident.optional(),
  repo_id: ident.optional(),
  task_id: ident.optional(),
  session_id: ident.optional(),
  subdirectory: z.string().optional(),
  path: z.string().optional(),
  files: z.array(z.string()).optional(),
}
const targetInput = z.strictObject(targetShape).superRefine((value, ctx) => {
  if (value.kind === "memory") {
    if (value.path !== undefined)
      ctx.addIssue({ code: "custom", message: "memory target rejects path", path: ["path"] })
    if (value.files !== undefined)
      ctx.addIssue({ code: "custom", message: "memory target rejects files", path: ["files"] })
    if (value.scope === undefined)
      ctx.addIssue({ code: "custom", message: "memory target requires scope", path: ["scope"] })
    else checkScopeIdents(value.scope, value, ctx)
  } else {
    if (value.path === undefined)
      ctx.addIssue({ code: "custom", message: "directory target requires path", path: ["path"] })
    for (const key of ["scope", ...identityKeys, "subdirectory"] as const) {
      if (value[key] !== undefined)
        ctx.addIssue({
          code: "custom",
          message: `directory target rejects ${key}`,
          path: [key],
        })
    }
  }
})

const indexShape = { target: targetInput }
const indexInput = z.strictObject(indexShape)
const searchShape = {
  target: targetInput,
  query: z.string().max(MAX_QUERY_CHARS).optional(),
  limit: z.number().int().min(1).max(50).optional(),
  fields: z.array(z.string().min(1)).optional(),
  filters: z.record(z.string(), z.string()).optional(),
}
const searchInput = z.strictObject(searchShape)
const resolveOutput = {
  path: z.string(),
  scope: z.string(),
  schema_version: z.number().int(),
  harness: z.string().optional(),
  repo_id: z.string().optional(),
  task_id: z.string().optional(),
  session_id: z.string().optional(),
}

type Target = z.infer<typeof targetInput>

const result = (value: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(value ?? null) }],
})
const error = (cause: unknown) => ({
  ...result({ error: cause instanceof Error ? cause.message : String(cause) }),
  isError: true,
})

/** Identity presence per scope is already enforced by the input schema's superRefine. */
function toIdentifiers(value: { scope?: string } & IdentityCarrier): ScopeIdentifiers {
  switch (value.scope) {
    case "harness":
      return { scope: "harness", harness: value.harness as string }
    case "repository":
      return { scope: "repository", repo_id: value.repo_id as string }
    case "task":
      return { scope: "task", repo_id: value.repo_id as string, task_id: value.task_id as string }
    case "session":
      return {
        scope: "session",
        harness: value.harness as string,
        session_id: value.session_id as string,
      }
    default:
      throw new Error(`unknown scope: ${value.scope}`)
  }
}

function prepareTarget(target: Target): {
  profile: "memory" | "custom"
  root: string
  files?: string[]
} {
  if (target.kind === "directory") {
    const resolved = resolveDirectoryTarget({ path: target.path as string, files: target.files })
    return { profile: "custom", ...resolved }
  }
  const base = configuredBase(process.env)
  const canonical = baseResolver.resolve(base)
  const scope = resolveScope(toIdentifiers(target), canonical)
  const root = resolveMemorySubdirectory(scope.path, target.subdirectory)
  return { profile: "memory", root }
}

function tokenize(query: string): string[] {
  if (query.length > MAX_QUERY_CHARS) throw new Error(`query exceeds ${MAX_QUERY_CHARS} characters`)
  const tokens = query.match(/[\p{L}\p{N}_]+/gu) ?? []
  if (tokens.length === 0) throw new Error("query must contain at least one word token")
  if (tokens.length > MAX_TOKENS) throw new Error(`query exceeds ${MAX_TOKENS} word tokens`)
  return tokens
}

function validateFields(fields: string[] | undefined) {
  if (fields !== undefined && new Set(fields).size !== fields.length)
    throw new Error("fields must not contain duplicates")
}

server.registerTool(
  "resolve_root",
  {
    title: "Resolve memory root",
    description:
      "Resolve one external memory scope to its absolute path (create only with create=true), verifying .scope.md identity metadata.",
    // The SDK types raw shapes only; runtime uses the strict checked schema (verified by E2E).
    inputSchema: resolveRootInput as unknown as typeof resolveRootShape,
    outputSchema: resolveOutput,
  },
  async (request) => {
    try {
      const base = configuredBase(process.env)
      if (request.create === true && !base.custom && !existsSync(base.path)) {
        // Only create=true lazily creates the default base; custom mounts must already exist.
        assertBaseOutsideGit(base.path)
        mkdirSync(base.path, { recursive: true, mode: 0o700 })
      }
      const canonical = baseResolver.resolve(base)
      const scope = resolveScope({ ...toIdentifiers(request), create: request.create }, canonical)
      return { ...result(scope), structuredContent: scope }
    } catch (cause) {
      return error(cause)
    }
  },
)

server.registerTool(
  "index",
  {
    title: "Index target",
    description:
      "Rebuild a fresh in-memory index of one explicit target; returns counts, bytes, skip reasons and indexed relative paths.",
    inputSchema: indexInput as unknown as typeof indexShape,
  },
  async (request) => {
    try {
      const target = prepareTarget(request.target)
      return result(runEngine({ ...target, operation: "index" }))
    } catch (cause) {
      return error(cause)
    }
  },
)

server.registerTool(
  "search",
  {
    title: "Search target",
    description:
      "Fresh in-process MiniSearch BM25+ search of one explicit target; query is required unless filters alone retrieve CSV rows; terms are OR, filters are exact AND applied before ranking.",
    inputSchema: searchInput as unknown as typeof searchShape,
  },
  async (request) => {
    try {
      validateFields(request.fields)
      const filterOnly = request.query === undefined
      if (
        filterOnly &&
        (request.filters === undefined || Object.keys(request.filters).length === 0)
      )
        throw new Error("query is required unless nonempty filters retrieve CSV rows")
      const target = prepareTarget(request.target)
      return result(
        runEngine({
          ...target,
          operation: "search",
          tokens: filterOnly ? undefined : tokenize(request.query as string),
          filter_only: filterOnly,
          limit: request.limit ?? DEFAULT_LIMIT,
          fields: request.fields,
          filters: request.filters,
        }),
      )
    } catch (cause) {
      return error(cause)
    }
  },
)

async function close() {
  await server.close()
}
process.stdin.once("end", () => void close())
process.once("SIGTERM", () => void close())
process.once("SIGINT", () => void close())
await server.connect(new StdioServerTransport())
