import type { Stats } from "node:fs"
import {
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  statSync,
  writeFileSync,
} from "node:fs"
import { dirname, isAbsolute, join, normalize, sep } from "node:path"

/** Identity fields are caller-selected stable nonsecret IDs; scope selects exactly which are required. */
export type ScopeIdentifiers =
  | { scope: "harness"; harness: string }
  | { scope: "repository"; repo_id: string }
  | { scope: "task"; repo_id: string; task_id: string }
  | { scope: "session"; harness: string; session_id: string }

export type ScopeRequest = ScopeIdentifiers & { create?: boolean }

export interface ResolvedScope {
  path: string
  scope: string
  schema_version: number
  [identity: string]: string | number
}

export interface BaseDirectory {
  path: string
  custom: boolean
}

const SCOPE_METADATA = ".scope.md"
const SCHEMA_VERSION = 1

function identityFields(request: ScopeIdentifiers): Record<string, string> {
  switch (request.scope) {
    case "harness":
      return { harness: request.harness }
    case "repository":
      return { repo_id: request.repo_id }
    case "task":
      return { repo_id: request.repo_id, task_id: request.task_id }
    case "session":
      return { harness: request.harness, session_id: request.session_id }
  }
}

function scopeRelativePath(request: ScopeIdentifiers): string {
  const identities = identityFields(request)
  switch (request.scope) {
    case "harness":
      return `harnesses/${identities.harness}/global`
    case "repository":
      return `repos/${identities.repo_id}/private`
    case "task":
      return `repos/${identities.repo_id}/tasks/${identities.task_id}`
    case "session":
      return `harnesses/${identities.harness}/sessions/${identities.session_id}`
  }
}

/** MEMORY_ROOT is a user-supplied mount: absolute and already present, never recreated or replaced. */
export function configuredBase(env: NodeJS.ProcessEnv): BaseDirectory {
  const override = env.MEMORY_ROOT
  if (override !== undefined) {
    if (!isAbsolute(override)) throw new Error("MEMORY_ROOT must be an absolute path")
    return { path: override, custom: true }
  }
  const dataHome = env.XDG_DATA_HOME
  if (dataHome !== undefined && dataHome !== "") {
    if (!isAbsolute(dataHome)) throw new Error("XDG_DATA_HOME must be an absolute path")
    return { path: join(dataHome, "agent-memory"), custom: false }
  }
  const home = env.HOME
  if (home === undefined || home === "" || !isAbsolute(home))
    throw new Error("HOME must be an absolute path when XDG_DATA_HOME and MEMORY_ROOT are unset")
  return { path: join(home, ".local", "share", "agent-memory"), custom: false }
}

function containsGitWorktree(path: string): string | undefined {
  let current = path
  for (;;) {
    try {
      lstatSync(join(current, ".git"))
      return current
    } catch (error) {
      if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error
      // No .git entry here; keep walking toward the filesystem root.
    }
    const parent = dirname(current)
    if (parent === current) return undefined
    current = parent
  }
}

/** Check the nearest existing physical ancestor before creating a default base. */
export function assertBaseOutsideGit(path: string): void {
  let current = path
  for (;;) {
    try {
      const worktree = containsGitWorktree(realpathSync(current))
      if (worktree !== undefined)
        throw new Error(`memory base is inside a Git worktree (${worktree})`)
      return
    } catch (error) {
      if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error
      const parent = dirname(current)
      if (parent === current) throw error
      current = parent
    }
  }
}

/** Canonicalize the configured base once per process and refuse bases inside Git worktrees. */
export class BaseResolver {
  private readonly canonical = new Map<string, string>()

  resolve(base: BaseDirectory): string {
    const cached = this.canonical.get(base.path)
    if (cached !== undefined) {
      statSync(cached)
      return cached
    }
    let canonical: string
    try {
      canonical = realpathSync(base.path)
    } catch {
      if (base.custom) throw new Error(`MEMORY_ROOT does not exist: ${base.path}`)
      throw new Error(
        `memory base does not exist: ${base.path}; call resolve_root with create=true to create it`,
      )
    }
    const worktree = containsGitWorktree(canonical)
    if (worktree !== undefined)
      throw new Error(
        `memory base ${canonical} is inside a Git worktree (${join(worktree, ".git")})`,
      )
    this.canonical.set(base.path, canonical)
    return canonical
  }
}

function assertNoSymlinkComponents(base: string, target: string): void {
  const relative = target
    .slice(base.length)
    .split(sep)
    .filter((part) => part !== "")
  let current = base
  for (const part of relative) {
    current = join(current, part)
    try {
      if (lstatSync(current).isSymbolicLink())
        throw new Error(`symlink below memory base is rejected: ${current}`)
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("symlink below")) throw error
      if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error
      // Missing components are created or reported by the caller, not symlinks.
    }
  }
}

/** Flat YAML (key: value lines) written and verified by this resolver only. */
export function parseScopeMetadata(text: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const line of text.split("\n")) {
    const trimmed = line.trim()
    if (trimmed === "") continue
    const separator = trimmed.indexOf(":")
    if (separator <= 0) throw new Error(`malformed .scope.md line: ${trimmed}`)
    const key = trimmed.slice(0, separator).trim()
    const value = trimmed.slice(separator + 1).trim()
    if (key in result) throw new Error(`duplicate .scope.md key: ${key}`)
    result[key] = value
  }
  return result
}

function expectedMetadata(request: ScopeIdentifiers): Record<string, string> {
  return {
    schema_version: String(SCHEMA_VERSION),
    scope: request.scope,
    ...identityFields(request),
  }
}

function verifyScopeMetadata(metadataPath: string, request: ScopeIdentifiers): void {
  let actual: Record<string, string>
  try {
    actual = parseScopeMetadata(readFileSync(metadataPath, "utf8"))
  } catch (error) {
    throw new Error(`unreadable scope metadata ${metadataPath}: ${String(error)}`)
  }
  const expected = expectedMetadata(request)
  const sameKeys =
    Object.keys(actual).length === Object.keys(expected).length &&
    Object.keys(expected).every((key) => key in actual)
  if (!sameKeys || Object.entries(expected).some(([key, value]) => actual[key] !== value))
    throw new Error(
      `scope metadata mismatch at ${metadataPath}: expected ${JSON.stringify(expected)}, found ${JSON.stringify(actual)}`,
    )
}

function isDirectory(path: string): boolean {
  try {
    return statSync(path).isDirectory()
  } catch {
    return false
  }
}

function writeScopeMetadata(metadataPath: string, request: ScopeIdentifiers): void {
  const entries = Object.entries(expectedMetadata(request))
  writeFileSync(metadataPath, `${entries.map(([key, value]) => `${key}: ${value}`).join("\n")}\n`, {
    mode: 0o600,
    flag: "wx",
  })
}

/** Resolve one external scope root; verify identity metadata on every call, never silently repair. */
export function resolveScope(request: ScopeRequest, canonicalBase: string): ResolvedScope {
  const scopeRoot = join(canonicalBase, scopeRelativePath(request))
  const metadataPath = join(scopeRoot, SCOPE_METADATA)
  assertNoSymlinkComponents(canonicalBase, metadataPath)
  if (!isDirectory(scopeRoot)) {
    if (request.create !== true) throw new Error(`scope does not exist: ${scopeRoot}`)
    mkdirSync(scopeRoot, { recursive: true, mode: 0o700 })
    writeScopeMetadata(metadataPath, request)
  } else if (!exists(metadataPath)) {
    if (request.create !== true)
      throw new Error(`scope metadata ${SCOPE_METADATA} missing in ${scopeRoot}`)
    if (readdirSync(scopeRoot).length > 0)
      throw new Error(`refusing to adopt nonempty directory without metadata: ${scopeRoot}`)
    writeScopeMetadata(metadataPath, request)
  } else {
    verifyScopeMetadata(metadataPath, request)
  }
  return {
    path: scopeRoot,
    scope: request.scope,
    schema_version: SCHEMA_VERSION,
    ...identityFields(request),
  }
}

function exists(path: string): boolean {
  try {
    lstatSync(path)
    return true
  } catch {
    return false
  }
}

/** Memory target root: verified scope root plus a contained subdirectory, no symlinks below base. */
export function resolveMemorySubdirectory(
  scopeRoot: string,
  subdirectory: string | undefined,
): string {
  const relative = subdirectory ?? "."
  if (relative === "") throw new Error("subdirectory must not be empty")
  if (isAbsolute(relative)) throw new Error(`subdirectory must be relative: ${relative}`)
  const parts = normalize(relative)
    .split(sep)
    .filter((part) => part !== "" && part !== ".")
  if (parts.some((part) => part === ".."))
    throw new Error(`subdirectory must not traverse parents: ${relative}`)
  let target = scopeRoot
  for (const part of parts) target = join(target, part)
  assertNoSymlinkComponents(scopeRoot, target)
  if (!isDirectory(target))
    throw new Error(`subdirectory does not exist or is not a directory: ${target}`)
  return target
}

export interface DirectoryTarget {
  path: string
  files?: string[]
}

/** Custom directory target: canonicalize the root, then contain each exact relative file. */
export function resolveDirectoryTarget(target: DirectoryTarget): {
  root: string
  files?: string[]
} {
  if (!isAbsolute(target.path))
    throw new Error(`directory target path must be absolute: ${target.path}`)
  let root: string
  try {
    root = realpathSync(target.path)
  } catch {
    throw new Error(`directory target does not exist: ${target.path}`)
  }
  if (!isDirectory(root)) throw new Error(`directory target is not a directory: ${target.path}`)
  if (target.files === undefined) return { root }
  const files = target.files.map((file) => containFile(root, file))
  return { root, files }
}

function containFile(root: string, file: string): string {
  if (file === "") throw new Error("files entries must not be empty")
  if (isAbsolute(file)) throw new Error(`files entries must be relative: ${file}`)
  const parts = normalize(file)
    .split(sep)
    .filter((part) => part !== "" && part !== ".")
  if (parts.length === 0 || parts.some((part) => part === ".."))
    throw new Error(`files entries must not traverse parents: ${file}`)
  if (parts.includes(".git")) throw new Error(`refusing to read Git internals: ${file}`)
  const path = join(root, ...parts)
  assertNoSymlinkComponents(root, path)
  let stats: Stats
  try {
    stats = lstatSync(path)
  } catch {
    throw new Error(`file does not exist: ${file}`)
  }
  if (stats.isSymbolicLink()) throw new Error(`symlinked files are rejected: ${file}`)
  if (!stats.isFile()) throw new Error(`not a regular file: ${file}`)
  return path
}
