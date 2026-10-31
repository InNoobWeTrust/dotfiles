import { parse as parseCsv } from "csv-parse@7.0.3/sync"
import {
  type BigIntStats,
  closeSync,
  type Dirent,
  existsSync,
  fstatSync,
  opendirSync,
  openSync,
  readSync,
  statSync,
} from "node:fs"
import { join, relative } from "node:path"

/** Policy or data error: surfaced to the client as a tool error, never partial success. */
export class EngineError extends Error {}

/** Hard corpus bounds; violations are errors in every profile, never skips. */
export const LIMITS = {
  files: 2000,
  entries: 10000,
  depth: 16,
  file_bytes: 1 << 20,
  total_bytes: 32 << 20,
  docs: 20000,
  snippet_chars: 4096,
  row_chars: 4096,
} as const

/** Documented custom-walk exclusions; hidden names (.git, .venv) are already skipped as hidden. */
const BUILD_DIRS = new Set(["node_modules", "__pycache__", "venv", "dist", "build", "target"])
const CHUNK_LINES = 60
const CHUNK_OVERLAP = 10

export interface SkipCounts {
  symlink: number
  hidden: number
  build: number
  binary: number
  unreadable: number
  changed: number
}

export interface CorpusCounts {
  files: number
  bytes: number
  chunks: number
  rows: number
  entries: number
  skipped: SkipCounts
}

/** Per-call tallies for one index/search; every bound check lives here. */
export class Counter {
  files = 0
  bytes = 0
  chunks = 0
  rows = 0
  entries = 0
  skipped: SkipCounts = {
    symlink: 0,
    hidden: 0,
    build: 0,
    binary: 0,
    unreadable: 0,
    changed: 0,
  }

  bumpEntry(): void {
    this.entries += 1
    if (this.entries > LIMITS.entries)
      throw new EngineError(`visited-entry bound exceeded (${LIMITS.entries})`)
  }

  addFile(size: number): void {
    this.files += 1
    this.bytes += size
    if (this.files > LIMITS.files) throw new EngineError(`file bound exceeded (${LIMITS.files})`)
    if (this.bytes > LIMITS.total_bytes)
      throw new EngineError(`total byte bound exceeded (${LIMITS.total_bytes})`)
  }

  addChunk(): void {
    this.chunks += 1
    this.assertDocBound()
  }

  addRow(): void {
    this.rows += 1
    this.assertDocBound()
  }

  private assertDocBound(): void {
    if (this.chunks + this.rows > LIMITS.docs)
      throw new EngineError(`indexed chunk/row bound exceeded (${LIMITS.docs})`)
  }

  summary(): CorpusCounts {
    return {
      files: this.files,
      bytes: this.bytes,
      chunks: this.chunks,
      rows: this.rows,
      entries: this.entries,
      skipped: { ...this.skipped },
    }
  }
}

/** Read at most file_bytes+1 bytes from an open descriptor. */
function readBounded(fd: number): Buffer {
  const buffer = Buffer.allocUnsafe(LIMITS.file_bytes + 1)
  let offset = 0
  while (offset < buffer.length) {
    const read = readSync(fd, buffer, offset, buffer.length - offset, null)
    if (read === 0) break
    offset += read
  }
  return buffer.subarray(0, offset)
}

/**
 * Read one bounded UTF-8 file with best-effort change detection (path stat, fd stat
 * before/after, and a final path stat compared against the descriptor identity).
 *
 * Policy per encounter table: memory Markdown errors on everything; custom recursive
 * walks skip and count; explicit custom files skip only binary/non-UTF-8 content and
 * treat unreadable/changed files as retryable errors. Bound violations always error.
 */
export function readText(
  path: string,
  skipBinary: boolean,
  skipIo: boolean,
  counter: Counter,
): string | null {
  let before: BigIntStats
  try {
    before = statSync(path, { bigint: true })
  } catch {
    if (skipIo) {
      counter.skipped.unreadable += 1
      return null
    }
    throw new EngineError(`unreadable file: ${path}`)
  }
  if (!before.isFile()) throw new EngineError(`not a regular file: ${path}`)
  if (before.size > BigInt(LIMITS.file_bytes))
    throw new EngineError(`file byte bound exceeded (${LIMITS.file_bytes}): ${path}`)

  let payload: Buffer
  try {
    const fd = openSync(path, "r")
    try {
      const fdBefore = fstatSync(fd, { bigint: true })
      payload = readBounded(fd)
      const fdAfter = fstatSync(fd, { bigint: true })
      let changed =
        fdBefore.dev !== before.dev ||
        fdBefore.ino !== before.ino ||
        fdBefore.size !== before.size ||
        fdBefore.mtimeNs !== before.mtimeNs ||
        fdBefore.ino !== fdAfter.ino ||
        fdBefore.size !== fdAfter.size ||
        fdBefore.mtimeNs !== fdAfter.mtimeNs ||
        payload.length > LIMITS.file_bytes
      if (!changed) {
        try {
          const after = statSync(path, { bigint: true })
          changed =
            after.ino !== fdAfter.ino ||
            after.dev !== fdAfter.dev ||
            after.size !== fdAfter.size ||
            after.mtimeNs !== fdAfter.mtimeNs
        } catch {
          changed = true
        }
      }
      if (changed) {
        if (skipIo) {
          counter.skipped.changed += 1
          return null
        }
        throw new EngineError(`file changed during read: ${path}`)
      }
    } finally {
      closeSync(fd)
    }
  } catch (error) {
    if (error instanceof EngineError) throw error
    if (skipIo) {
      counter.skipped.unreadable += 1
      return null
    }
    throw new EngineError(`unreadable file: ${path}`)
  }

  if (payload.includes(0)) {
    if (skipBinary) {
      counter.skipped.binary += 1
      return null
    }
    throw new EngineError(`binary file: ${path}`)
  }
  let text: string
  try {
    // ignoreBOM keeps a leading BOM as a character, matching a strict UTF-8 decode.
    text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(payload)
  } catch {
    if (skipBinary) {
      counter.skipped.binary += 1
      return null
    }
    throw new EngineError(`non-UTF-8 file: ${path}`)
  }
  counter.addFile(payload.length)
  return text
}

/** 60-line chunks with 10-line overlap; the start line is 1-based like an editor. */
export function chunkLines(text: string): { startLine: number; text: string }[] {
  const lines = text.split("\n")
  // A trailing newline yields one empty final element; drop it so line numbers match editors.
  if (lines.length > 0 && lines[lines.length - 1] === "") lines.pop()
  const step = CHUNK_LINES - CHUNK_OVERLAP
  const chunks: { startLine: number; text: string }[] = []
  for (let start = 0; start < lines.length; start += step) {
    const window = lines.slice(start, start + CHUNK_LINES)
    if (window.length === 0) break
    chunks.push({ startLine: start + 1, text: window.join("\n") })
  }
  return chunks
}

export interface CsvRecord {
  number: number
  row: Record<string, string>
}

/**
 * Strict CSV: quoted/multiline records via csv-parse, then blank/duplicate header,
 * requested field/filter column and record width validation with the contract labels.
 * Filters are case-sensitive exact equality ANDed before any ranking.
 */
export function parseCsvText(
  text: string,
  path: string,
  fields: string[] | undefined,
  filters: Record<string, string> | undefined,
): { header: string[]; records: CsvRecord[] } {
  let rows: string[][]
  try {
    rows = parseCsv(text, {
      relax_column_count: true,
      skip_empty_lines: false,
      max_record_size: LIMITS.file_bytes,
    })
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause)
    throw new EngineError(`malformed CSV ${path}: ${message}`)
  }
  if (rows.length === 0) throw new EngineError(`CSV missing header row: ${path}`)
  const header = rows[0]
  if (header.some((name) => name === "")) throw new EngineError(`blank CSV header in ${path}`)
  if (new Set(header).size !== header.length)
    throw new EngineError(`duplicate CSV header in ${path}`)
  for (const name of fields ?? [])
    if (!header.includes(name))
      throw new EngineError(`requested field '${name}' missing from CSV ${path}`)
  for (const name of Object.keys(filters ?? {}))
    if (!header.includes(name))
      throw new EngineError(`filter column '${name}' missing from CSV ${path}`)

  const activeFilters =
    filters !== undefined && Object.keys(filters).length > 0 ? filters : undefined
  const records: CsvRecord[] = []
  let number = 0
  for (const row of rows.slice(1)) {
    number += 1
    if (row.length !== header.length)
      throw new EngineError(`unequal-width CSV record ${number} in ${path}`)
    if (activeFilters !== undefined) {
      const matched = Object.entries(activeFilters).every(
        ([name, value]) => row[header.indexOf(name)] === value,
      )
      if (!matched) continue
    }
    records.push({ number, row: Object.fromEntries(header.map((name, i) => [name, row[i]])) })
  }
  return { header, records }
}

/** One indexable unit: a text chunk or one CSV data record. */
export type CorpusDocument =
  | { id: number; kind: "text"; path: string; loc: number; text: string }
  | {
      id: number
      kind: "csv"
      path: string
      loc: number
      text: string
      row: Record<string, string>
      rowId?: string
    }

export interface Corpus {
  counts: CorpusCounts
  paths: string[]
  documents: CorpusDocument[]
}

function isDirectory(path: string): boolean {
  try {
    return statSync(path).isDirectory()
  } catch {
    return false
  }
}

/** Enumerate into a bounded buffer before sorting, closing the handle even on a bound error. */
function boundedDirectoryEntries(
  directory: string,
  profile: "memory" | "custom",
  counter: Counter,
): Dirent[] {
  const entries: Dirent[] = []
  try {
    const handle = opendirSync(directory)
    try {
      for (let entry = handle.readSync(); entry !== null; entry = handle.readSync()) {
        counter.bumpEntry()
        entries.push(entry)
      }
    } finally {
      handle.closeSync()
    }
  } catch (error) {
    if (error instanceof EngineError) throw error
    if (profile === "memory") throw new EngineError(`unreadable directory: ${directory}`)
    counter.skipped.unreadable += 1
    return []
  }
  return entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
}

/** Apply encounter policy without following symlinks or inspecting skipped subtrees. */
function classifyEntry(
  profile: "memory" | "custom",
  entry: Dirent,
  path: string,
  counter: Counter,
): "directory" | "file" | "skip" {
  if (profile === "custom" && entry.name.startsWith(".")) {
    counter.skipped.hidden += 1
    return "skip"
  }
  if (entry.isSymbolicLink()) {
    if (profile === "memory")
      throw new EngineError(`symlink below memory root is rejected: ${path}`)
    counter.skipped.symlink += 1
    return "skip"
  }
  if (profile === "custom" && BUILD_DIRS.has(entry.name)) {
    counter.skipped.build += 1
    return "skip"
  }
  if (entry.isDirectory()) return "directory"
  if (!entry.isFile()) return "skip"
  if (profile === "memory" && (!entry.name.endsWith(".md") || entry.name === ".scope.md"))
    return "skip"
  return "file"
}

/** Return candidate file paths per encounter policy, counting every visited entry. */
export function walkTargets(
  profile: "memory" | "custom",
  root: string,
  files: string[] | undefined,
  counter: Counter,
): string[] {
  if (files !== undefined) {
    return files.map((path) => {
      counter.bumpEntry()
      if (!existsSync(path)) throw new EngineError(`file disappeared: ${path}`)
      return path
    })
  }
  const found: string[] = []
  const stack: { directory: string; depth: number }[] = [{ directory: root, depth: 0 }]
  while (stack.length > 0) {
    const { directory, depth } = stack.pop() as { directory: string; depth: number }
    for (const entry of boundedDirectoryEntries(directory, profile, counter)) {
      const entryDepth = depth + 1
      const path = join(directory, entry.name)
      if (entryDepth > LIMITS.depth)
        throw new EngineError(`depth bound exceeded (${LIMITS.depth}) at ${path}`)
      const kind = classifyEntry(profile, entry, path, counter)
      if (kind === "directory") stack.push({ directory: path, depth: entryDepth })
      else if (kind === "file") found.push(path)
    }
  }
  return found
}

/**
 * Walk, read and parse one explicit target into an ephemeral corpus. Direct edits are
 * visible here on every call: nothing is cached beyond this request.
 */
export function collectCorpus(request: {
  profile: "memory" | "custom"
  root: string
  files?: string[]
  fields?: string[]
  filters?: Record<string, string>
}): Corpus {
  const { profile, root, files, fields, filters } = request
  if (profile !== "memory" && profile !== "custom")
    throw new EngineError(`unknown profile: ${profile}`)
  if (!isDirectory(root)) throw new EngineError(`root is not a directory: ${root}`)
  const hasFields = fields !== undefined && fields.length > 0
  const hasFilters = filters !== undefined && Object.keys(filters).length > 0
  if (profile === "memory" && (hasFields || hasFilters))
    throw new EngineError("fields/filters apply to CSV files only, not memory targets")

  const counter = new Counter()
  let paths = walkTargets(profile, root, files, counter)
  if (profile === "memory")
    paths = paths.filter((path) => path.endsWith(".md") && !path.endsWith("/.scope.md"))
  const isCsv = paths.map((path) => path.toLowerCase().endsWith(".csv"))
  if ((hasFields || hasFilters) && !isCsv.every(Boolean)) {
    const offenders = paths.filter((_, index) => !isCsv[index]).slice(0, 5)
    throw new EngineError(
      "fields/filters require explicitly selected CSV files; non-CSV candidates: " +
        offenders.join(", "),
    )
  }

  const skipBinary = profile === "custom"
  const skipIo = profile === "custom" && files === undefined
  const documents: CorpusDocument[] = []
  const indexedPaths: string[] = []
  for (const [index, path] of paths.entries()) {
    const relativePath = relative(root, path)
    const text = readText(path, skipBinary, skipIo, counter)
    if (text === null) continue
    indexedPaths.push(relativePath)
    if (isCsv[index]) {
      const { header, records } = parseCsvText(text, path, fields, filters)
      const searchable = hasFields ? fields : header
      for (const record of records) {
        counter.addRow()
        const rowId = record.row.id
        documents.push({
          id: documents.length,
          kind: "csv",
          path: relativePath,
          loc: record.number,
          text: searchable.map((name) => record.row[name]).join("\n"),
          row: record.row,
          ...(rowId !== undefined ? { rowId } : {}),
        })
      }
    } else {
      for (const chunk of chunkLines(text)) {
        counter.addChunk()
        documents.push({
          id: documents.length,
          kind: "text",
          path: relativePath,
          loc: chunk.startLine,
          text: chunk.text,
        })
      }
    }
  }
  return { counts: counter.summary(), paths: [...indexedPaths].sort(), documents }
}
