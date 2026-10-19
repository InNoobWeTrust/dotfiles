import { readFile, rename, unlink, writeFile } from "node:fs/promises"
import { absoluteFromUri, resolveWorkspaceDestination, resolveWorkspacePath } from "./paths.ts"
import type { Position0 } from "./semantics.ts"

/** Line-start offsets; \r\n, \n and \r each terminate one line. */
export function lineStarts(content: string): number[] {
  const starts = [0]
  for (let index = 0; index < content.length; index++) {
    const char = content[index]
    if (char === "\r") {
      if (content[index + 1] === "\n") index += 1
      starts.push(index + 1)
    } else if (char === "\n") {
      starts.push(index + 1)
    }
  }
  return starts
}

function lineEnd(content: string, starts: number[], line: number): number {
  const next = starts[line + 1]
  if (next === undefined) return content.length
  let end = next
  if (content[end - 1] === "\n") {
    end -= 1
    if (content[end - 1] === "\r") end -= 1
  } else if (content[end - 1] === "\r") {
    end -= 1
  }
  return end
}

/** UTF-16 length of one 0-based line, excluding its terminator. */
export function lineLength(content: string, starts: number[], line: number): number {
  return lineEnd(content, starts, line) - starts[line]
}

function offsetAt(content: string, starts: number[], at: Position0): number {
  const { line, character } = at
  if (!Number.isInteger(line) || line < 0 || line >= starts.length)
    throw new Error(`Edit line ${line} is out of bounds`)
  const length = lineLength(content, starts, line)
  if (!Number.isInteger(character) || character < 0 || character > length)
    throw new Error(`Edit character ${character} is out of bounds on line ${line}`)
  return starts[line] + character
}

export interface TextEdit0 {
  range: { start: Position0; end: Position0 }
  newText: string
}

/** Applies 0-based LSP text edits to a content string; rejects overlaps and bad ranges. */
export function applyTextEdits(content: string, edits: TextEdit0[]): string {
  const starts = lineStarts(content)
  const ordered = edits
    .map((edit) => {
      const start = offsetAt(content, starts, edit.range.start)
      const end = offsetAt(content, starts, edit.range.end)
      if (end < start) throw new Error("Text edit end precedes start")
      return { start, end, newText: edit.newText }
    })
    .sort((left, right) => left.start - right.start || left.end - right.end)
  for (let index = 1; index < ordered.length; index++) {
    if (ordered[index].start < ordered[index - 1].end) throw new Error("Overlapping text edits")
  }
  let result = content
  for (let index = ordered.length - 1; index >= 0; index--) {
    const edit = ordered[index]
    result = result.slice(0, edit.start) + edit.newText + result.slice(edit.end)
  }
  return result
}

/** Converts a 1-based line/character (UTF-16) to a validated 0-based LSP position. */
export function toLspPosition(content: string, at: { line: number; character: number }): Position0 {
  const starts = lineStarts(content)
  const { line, character } = at
  if (!Number.isInteger(line) || line < 1 || line > starts.length)
    throw new Error(
      `Line ${line} is out of bounds (1-based; the file has ${starts.length} line(s))`,
    )
  const length = lineLength(content, starts, line - 1)
  if (!Number.isInteger(character) || character < 1 || character > length + 1)
    throw new Error(
      `Character ${character} is out of bounds (1-based; line ${line} has ${length} UTF-16 code unit(s))`,
    )
  return { line: line - 1, character: character - 1 }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isPosition(value: unknown): value is Position0 {
  if (!isObject(value)) return false
  const { line, character } = value
  return (
    Number.isInteger(line) &&
    (line as number) >= 0 &&
    Number.isInteger(character) &&
    (character as number) >= 0
  )
}

function collectEdits(value: unknown, target: string): TextEdit0[] {
  if (!Array.isArray(value)) throw new Error(`Invalid workspace edit for ${target}: no edits array`)
  return value.map((item) => {
    if (!isObject(item) || !isObject(item.range) || typeof item.newText !== "string")
      throw new Error(`Invalid workspace edit for ${target}: malformed text edit`)
    const { start, end } = item.range
    if (!isPosition(start) || !isPosition(end))
      throw new Error(`Invalid workspace edit for ${target}: malformed text edit range`)
    return { range: { start, end }, newText: item.newText }
  })
}

export interface AppliedFile {
  uri: string
  display: string
  path: string
  edits: TextEdit0[]
  before: string
  after: string
}

export interface AppliedOperation {
  kind: "create" | "rename" | "delete"
  /** Display path of the created, renamed or deleted target. */
  file: string
  /** Display path the file was renamed from (rename only). */
  from?: string
  /** Display path the file was renamed to (rename only). */
  to?: string
  /** URIs whose open documents may now be stale. */
  uris: string[]
}

export interface AppliedWorkspaceEdit {
  files: AppliedFile[]
  operations: AppliedOperation[]
  totalEdits: number
}

interface EntryOptions {
  overwrite: boolean
  ignoreIfExists: boolean
  ignoreIfNotExists: boolean
}

type RawEntry =
  | { type: "text"; uri: string; edits: TextEdit0[] }
  | { type: "create"; uri: string; options: EntryOptions }
  | { type: "rename"; oldUri: string; newUri: string; options: EntryOptions }
  | { type: "delete"; uri: string; options: EntryOptions }

type Step =
  | {
      type: "text"
      uri: string
      path: string
      display: string
      edits: TextEdit0[]
      before: string
      after: string
    }
  | { type: "create"; path: string; display: string; before: string | null }
  | { type: "delete"; path: string; display: string; before: string }
  | {
      type: "rename"
      oldPath: string
      newPath: string
      from: string
      to: string
      replaced: string | null
    }

type DiskState = { kind: "missing" } | { kind: "directory" } | { kind: "file"; content: string }

const noOptions: EntryOptions = {
  overwrite: false,
  ignoreIfExists: false,
  ignoreIfNotExists: false,
}

function parseOptions(item: Record<string, unknown>): EntryOptions {
  if (item.options === undefined) return noOptions
  if (!isObject(item.options))
    throw new Error("Workspace edit file operation options are malformed")
  return {
    overwrite: item.options.overwrite === true,
    ignoreIfExists: item.options.ignoreIfExists === true,
    ignoreIfNotExists: item.options.ignoreIfNotExists === true,
  }
}

function parseEntry(item: unknown): RawEntry {
  if (!isObject(item)) throw new Error("Workspace edit contains a malformed entry")
  if (typeof item.kind === "string") {
    const options = parseOptions(item)
    if (item.kind === "create" || item.kind === "delete") {
      if (typeof item.uri !== "string")
        throw new Error(`Workspace edit ${item.kind} operation is missing uri`)
      if (item.kind === "create") return { type: "create", uri: item.uri, options }
      return { type: "delete", uri: item.uri, options }
    }
    if (item.kind === "rename") {
      if (typeof item.oldUri !== "string" || typeof item.newUri !== "string")
        throw new Error("Workspace edit rename operation is missing oldUri or newUri")
      return { type: "rename", oldUri: item.oldUri, newUri: item.newUri, options }
    }
    throw new Error(`Unsupported workspace file operation (${item.kind})`)
  }
  const uri = isObject(item.textDocument) ? item.textDocument.uri : undefined
  if (typeof uri !== "string") throw new Error("Workspace edit entry is missing textDocument.uri")
  return { type: "text", uri, edits: collectEdits(item.edits, uri) }
}

/**
 * Validates and applies a WorkspaceEdit to disk, in documentChanges order.
 * Text edits are rendered against an in-memory overlay and file operations
 * (create/rename/delete of regular files) are validated before anything is
 * written. On failure, already-applied steps are rolled back best effort.
 */
export async function applyWorkspaceEdit(
  cwd: string,
  edit: unknown,
  options: { synced?: (uri: string) => string | undefined } = {},
): Promise<AppliedWorkspaceEdit> {
  if (!isObject(edit)) throw new Error("Workspace edit is malformed")
  const { documentChanges, changes } = edit
  if (documentChanges !== undefined && changes !== undefined)
    throw new Error("Workspace edit contains both changes and documentChanges")

  const entries: RawEntry[] = []
  if (documentChanges !== undefined) {
    if (!Array.isArray(documentChanges))
      throw new Error("Workspace edit documentChanges is malformed")
    for (const item of documentChanges) entries.push(parseEntry(item))
  } else if (changes !== undefined) {
    if (!isObject(changes)) throw new Error("Workspace edit changes is malformed")
    for (const [uri, value] of Object.entries(changes))
      entries.push({ type: "text", uri, edits: collectEdits(value, uri) })
  }

  const state = new Map<string, DiskState>()
  const paths = new Map<string, { path: string; display: string }>()
  const checked = new Set<string>()

  async function load(path: string): Promise<DiskState> {
    const known = state.get(path)
    if (known !== undefined) return known
    try {
      const content = await readFile(path, "utf8")
      const value: DiskState = { kind: "file", content }
      state.set(path, value)
      return value
    } catch (cause) {
      const code = (cause as { code?: string } | undefined)?.code
      if (code === "ENOENT") {
        const value: DiskState = { kind: "missing" }
        state.set(path, value)
        return value
      }
      if (code === "EISDIR") {
        const value: DiskState = { kind: "directory" }
        state.set(path, value)
        return value
      }
      throw cause
    }
  }

  async function location(uri: string, destination: boolean) {
    const known = paths.get(uri)
    if (known !== undefined) return known
    const absolute = absoluteFromUri(uri)
    if (absolute === undefined) throw new Error(`Workspace edit targets a non-file URI: ${uri}`)
    let resolved: { path: string; display: string }
    if (destination) {
      resolved = await resolveWorkspaceDestination(cwd, absolute)
    } else {
      try {
        resolved = await resolveWorkspacePath(cwd, absolute)
      } catch (cause) {
        if (!(cause instanceof Error) || !cause.message.startsWith("Path does not exist:"))
          throw cause
        resolved = await resolveWorkspaceDestination(cwd, absolute)
      }
    }
    const value = { path: resolved.path, display: resolved.display }
    paths.set(uri, value)
    return value
  }

  function checkSynced(uri: string, path: string, display: string, content: string) {
    if (checked.has(path)) return
    checked.add(path)
    const expected = options.synced?.(uri)
    if (expected !== undefined && expected !== content)
      throw new Error(
        `File changed on disk since the language server read it: ${display}; nothing was written.`,
      )
  }

  const steps: Step[] = []
  const operations: AppliedOperation[] = []
  for (const entry of entries) {
    if (entry.type === "text") {
      if (entry.edits.length === 0) continue
      const target = await location(entry.uri, false)
      const current = await load(target.path)
      if (current.kind === "missing")
        throw new Error(`Workspace edit targets a missing file: ${target.display}`)
      if (current.kind === "directory")
        throw new Error(`Workspace edit targets a directory: ${target.display}`)
      checkSynced(entry.uri, target.path, target.display, current.content)
      let after: string
      try {
        after = applyTextEdits(current.content, entry.edits)
      } catch (cause) {
        throw new Error(
          `Invalid text edit for ${target.display}: ${cause instanceof Error ? cause.message : String(cause)}`,
        )
      }
      steps.push({
        type: "text",
        uri: entry.uri,
        path: target.path,
        display: target.display,
        edits: entry.edits,
        before: current.content,
        after,
      })
      state.set(target.path, { kind: "file", content: after })
      continue
    }

    if (entry.type === "create") {
      const target = await location(entry.uri, true)
      const current = await load(target.path)
      if (current.kind === "directory")
        throw new Error(`Workspace edit targets a directory: ${target.display}`)
      if (current.kind !== "missing") {
        if (entry.options.ignoreIfExists) continue
        if (!entry.options.overwrite) throw new Error(`File already exists: ${target.display}`)
      }
      if (current.kind === "file")
        checkSynced(entry.uri, target.path, target.display, current.content)
      steps.push({
        type: "create",
        path: target.path,
        display: target.display,
        before: current.kind === "file" ? current.content : null,
      })
      state.set(target.path, { kind: "file", content: "" })
      operations.push({ kind: "create", file: target.display, uris: [entry.uri] })
      continue
    }

    if (entry.type === "delete") {
      const target = await location(entry.uri, false)
      const current = await load(target.path)
      if (current.kind === "missing") {
        if (entry.options.ignoreIfNotExists) continue
        throw new Error(`File does not exist: ${target.display}`)
      }
      if (current.kind === "directory")
        throw new Error(
          `Refusing to delete a directory: ${target.display}; only files are supported`,
        )
      checkSynced(entry.uri, target.path, target.display, current.content)
      steps.push({
        type: "delete",
        path: target.path,
        display: target.display,
        before: current.content,
      })
      state.set(target.path, { kind: "missing" })
      operations.push({ kind: "delete", file: target.display, uris: [entry.uri] })
      continue
    }

    const source = await location(entry.oldUri, false)
    const current = await load(source.path)
    if (current.kind === "missing") throw new Error(`File does not exist: ${source.display}`)
    if (current.kind === "directory")
      throw new Error(`Refusing to rename a directory: ${source.display}; only files are supported`)
    checkSynced(entry.oldUri, source.path, source.display, current.content)
    const target = await location(entry.newUri, true)
    const existing = await load(target.path)
    if (existing.kind === "directory")
      throw new Error(`Refusing to overwrite a directory: ${target.display}`)
    if (existing.kind !== "missing") {
      if (entry.options.ignoreIfExists) continue
      if (!entry.options.overwrite) throw new Error(`File already exists: ${target.display}`)
    }
    if (existing.kind === "file")
      checkSynced(entry.newUri, target.path, target.display, existing.content)
    steps.push({
      type: "rename",
      oldPath: source.path,
      newPath: target.path,
      from: source.display,
      to: target.display,
      replaced: existing.kind === "file" ? existing.content : null,
    })
    state.set(source.path, { kind: "missing" })
    state.set(target.path, { kind: "file", content: current.content })
    operations.push({
      kind: "rename",
      file: target.display,
      from: source.display,
      to: target.display,
      uris: [entry.oldUri, entry.newUri],
    })
  }

  if (steps.length === 0) throw new Error("Workspace edit contains no changes")

  const files: AppliedFile[] = steps
    .filter((step): step is Extract<Step, { type: "text" }> => step.type === "text")
    .map((step) => ({
      uri: step.uri,
      display: step.display,
      path: step.path,
      edits: step.edits,
      before: step.before,
      after: step.after,
    }))

  const undo: Array<{ display: string; run: () => Promise<void> }> = []
  for (const step of steps) {
    const display = step.type === "rename" ? step.to : step.display
    try {
      if (step.type === "text") {
        if (step.after === step.before) continue
        await writeFile(step.path, step.after, "utf8")
        undo.push({
          display,
          run: async () => {
            await writeFile(step.path, step.before, "utf8")
          },
        })
      } else if (step.type === "create") {
        await writeFile(step.path, "", "utf8")
        const before = step.before
        undo.push({
          display,
          run:
            before === null
              ? async () => {
                  await unlink(step.path)
                }
              : async () => {
                  await writeFile(step.path, before, "utf8")
                },
        })
      } else if (step.type === "delete") {
        await unlink(step.path)
        const before = step.before
        undo.push({
          display,
          run: async () => {
            await writeFile(step.path, before, "utf8")
          },
        })
      } else {
        await rename(step.oldPath, step.newPath)
        const replaced = step.replaced
        undo.push({
          display,
          run: async () => {
            await rename(step.newPath, step.oldPath)
            if (replaced !== null) await writeFile(step.newPath, replaced, "utf8")
          },
        })
      }
    } catch (cause) {
      const failed: string[] = []
      for (const previous of undo.reverse()) {
        try {
          await previous.run()
        } catch {
          failed.push(previous.display)
        }
      }
      const rollback =
        undo.length === 0
          ? ""
          : failed.length > 0
            ? `; rollback failed for: ${failed.join(", ")}`
            : "; applied changes were rolled back"
      throw new Error(
        `Failed to apply workspace edit for ${display}: ${cause instanceof Error ? cause.message : String(cause)}${rollback}`,
      )
    }
  }

  return {
    files,
    operations,
    totalEdits: files.reduce((sum, file) => sum + file.edits.length, 0),
  }
}
