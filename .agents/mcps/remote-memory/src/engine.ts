import MiniSearch from "minisearch@7.2.0"
import { z } from "zod@4"
import {
  type CorpusCounts,
  type CorpusDocument,
  collectCorpus,
  EngineError,
  LIMITS,
} from "./corpus.ts"

export interface EngineRequest {
  profile: "memory" | "custom"
  root: string
  files?: string[]
  operation: "index" | "search"
  tokens?: string[]
  filter_only?: boolean
  limit?: number
  fields?: string[]
  filters?: Record<string, string>
}

const SkippedCounts = z.strictObject({
  symlink: z.number().int().nonnegative(),
  hidden: z.number().int().nonnegative(),
  build: z.number().int().nonnegative(),
  binary: z.number().int().nonnegative(),
  unreadable: z.number().int().nonnegative(),
  changed: z.number().int().nonnegative(),
})

const Counts = z.strictObject({
  files: z.number().int().nonnegative(),
  bytes: z.number().int().nonnegative(),
  chunks: z.number().int().nonnegative(),
  rows: z.number().int().nonnegative(),
  entries: z.number().int().nonnegative(),
  skipped: SkippedCounts,
})
type Counts = z.infer<typeof Counts>

const TextHit = z.strictObject({
  kind: z.literal("text"),
  path: z.string(),
  start_line: z.number().int(),
  end_line: z.number().int(),
  snippet: z.string(),
  truncated: z.boolean(),
  score: z.number(),
})
type TextHit = z.infer<typeof TextHit>

const CsvHit = z.strictObject({
  kind: z.literal("csv"),
  path: z.string(),
  record: z.number().int(),
  id: z.string().optional(),
  row: z.record(z.string(), z.string()),
  truncated: z.boolean(),
  score: z.number(),
})
type CsvHit = z.infer<typeof CsvHit>

const EngineResult = z.strictObject({
  ok: z.literal(true),
  counts: Counts,
  paths: z.array(z.string()),
  results: z.array(z.union([TextHit, CsvHit])).optional(),
})
type EngineResult = z.infer<typeof EngineResult>

export type { Counts, CsvHit, EngineResult, TextHit }

/**
 * Rebuild one ephemeral corpus, then rank it with MiniSearch's BM25+ (library
 * defaults) or bypass ranking entirely for filter-only CSV retrieval. Everything runs
 * in-process and synchronously: there is no hard preemptive timeout, only the hard
 * corpus and response-size bounds enforced while collecting and shaping results.
 *
 * Library scores are higher-is-better; they are negated solely to keep the
 * lower-is-better wire ordering, with deterministic score/path/loc ordering applied
 * before the limit.
 *
 * @throws {EngineError} policy, bound or data errors — tool errors, never partial success
 */
export function runEngine(request: EngineRequest): EngineResult {
  const corpus = collectCorpus(request)
  const payload: {
    ok: true
    counts: CorpusCounts
    paths: string[]
    results?: (TextHit | CsvHit)[]
  } = { ok: true, counts: corpus.counts, paths: corpus.paths }
  if (request.operation === "search") {
    if (request.limit === undefined) throw new EngineError("search requires a limit")
    payload.results =
      request.filter_only === true
        ? filterOnlyHits(corpus.documents, request.limit)
        : rankHits(corpus.documents, request.tokens, request.limit)
  }
  const parsed = EngineResult.safeParse(payload)
  if (!parsed.success) throw new Error("search engine result failed validation")
  return parsed.data
}

/** Filter-only retrieval: exact matching CSV rows, deterministic order, score 0, no BM25. */
function filterOnlyHits(documents: CorpusDocument[], limit: number): (TextHit | CsvHit)[] {
  return documents
    .filter((document): document is Extract<CorpusDocument, { kind: "csv" }> => {
      return document.kind === "csv"
    })
    .sort(comparePathLoc)
    .slice(0, limit)
    .map((document) => buildHit(document, 0))
}

/**
 * Rank the whole corpus with one ephemeral MiniSearch index: query terms combined
 * with OR, no prefix expansion, no fuzziness, BM25+ at library defaults. Results are
 * ordered by negated score, then path, then locator before the limit is applied.
 */
function rankHits(
  documents: CorpusDocument[],
  tokens: string[] | undefined,
  limit: number,
): (TextHit | CsvHit)[] {
  if (tokens === undefined)
    throw new EngineError("tokens are required unless filters retrieve CSV rows")
  const index = new MiniSearch<CorpusDocument>({ fields: ["text"] })
  index.addAll(documents)
  const matches = index.search(tokens.join(" "), {
    combineWith: "OR",
    prefix: false,
    fuzzy: false,
  })
  const hits = matches.map((match) => {
    const document = documents[match.id as number]
    if (document === undefined)
      throw new Error(`search engine returned an unknown document id: ${String(match.id)}`)
    return buildHit(document, -match.score)
  })
  hits.sort(compareHits)
  return hits.slice(0, limit)
}

function comparePathLoc(
  a: { path: string; loc: number },
  b: { path: string; loc: number },
): number {
  if (a.path !== b.path) return a.path < b.path ? -1 : 1
  return a.loc - b.loc
}

/** Lower-is-better score first, then path, then locator — applied before the limit. */
function compareHits(a: TextHit | CsvHit, b: TextHit | CsvHit): number {
  if (a.score !== b.score) return a.score - b.score
  const locA = a.kind === "text" ? a.start_line : a.record
  const locB = b.kind === "text" ? b.start_line : b.record
  return comparePathLoc({ path: a.path, loc: locA }, { path: b.path, loc: locB })
}

/** Longest UTF-8 prefix of text that fits in maxBytes, never splitting a code point. */
function utf8Prefix(text: string, maxBytes: number): string {
  const bytes = Buffer.from(text, "utf8").subarray(0, maxBytes)
  for (let end = bytes.length; end > 0; end--) {
    try {
      return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(
        bytes.subarray(0, end),
      )
    } catch {
      // The byte cut split a multi-byte sequence; drop trailing bytes until decodable,
      // the same result as decoding a truncated UTF-8 prefix with errors ignored.
    }
  }
  return ""
}

/** Trailing columns are omitted until the serialized row fits the UTF-8 byte bound. */
function boundRow(row: Record<string, string>): {
  row: Record<string, string>
  truncated: boolean
} {
  const bounded: Record<string, string> = { ...row }
  const byteLength = () => Buffer.byteLength(JSON.stringify(bounded), "utf8")
  const truncated = byteLength() > LIMITS.row_chars
  const keys = Object.keys(bounded)
  for (let index = keys.length - 1; index >= 0 && byteLength() > LIMITS.row_chars; index--) {
    delete bounded[keys[index]]
  }
  return { row: bounded, truncated }
}

/** Shape one hit within the 4096-byte snippet/row/id limits; `score` is already wire-scaled. */
function buildHit(document: CorpusDocument, score: number): TextHit | CsvHit {
  if (document.kind === "text") {
    const snippet = utf8Prefix(document.text, LIMITS.snippet_chars)
    return {
      kind: "text",
      path: document.path,
      start_line: document.loc,
      end_line: document.loc + (document.text.match(/\n/g)?.length ?? 0),
      snippet,
      truncated: snippet !== document.text,
      score,
    }
  }
  const bounded = boundRow(document.row)
  let truncated = bounded.truncated
  let id = document.rowId
  if (id !== undefined && Buffer.byteLength(id, "utf8") > LIMITS.row_chars) {
    id = undefined
    truncated = true
  }
  const hit: CsvHit = {
    kind: "csv",
    path: document.path,
    record: document.loc,
    row: bounded.row,
    truncated,
    score,
  }
  if (id !== undefined) hit.id = id
  return hit
}
