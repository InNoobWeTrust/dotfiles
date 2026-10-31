// Register memory tools and preserve their existing validation/response behavior.
import { existsSync, mkdirSync } from "node:fs"
import type { McpServer } from "@modelcontextprotocol/sdk@1/server/mcp.js"
import {
  assertBaseOutsideGit,
  type BaseResolver,
  configuredBase,
  resolveScope,
} from "../scopes/scope.ts"
import {
  DEFAULT_LIMIT,
  indexInput,
  type indexShape,
  MAX_QUERY_CHARS,
  MAX_TOKENS,
  resolveOutput,
  resolveRootInput,
  type resolveRootShape,
  searchInput,
  type searchShape,
} from "./contracts.ts"
import { prepareTarget, toIdentifiers } from "./targets.ts"

type RunEngine = typeof import("../retrieval/engine.ts").runEngine

function registerSearchTool(
  server: McpServer,
  baseResolver: BaseResolver,
  runEngine: RunEngine,
): void {
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
        const target = prepareTarget(request.target, baseResolver)
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
}

const result = (value: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(value ?? null) }],
})
const error = (cause: unknown) => ({
  ...result({ error: cause instanceof Error ? cause.message : String(cause) }),
  isError: true,
})

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

export function registerMemoryTools(
  server: McpServer,
  baseResolver: BaseResolver,
  runEngine: RunEngine,
): void {
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
        const target = prepareTarget(request.target, baseResolver)
        return result(runEngine({ ...target, operation: "index" }))
      } catch (cause) {
        return error(cause)
      }
    },
  )

  registerSearchTool(server, baseResolver, runEngine)
}
