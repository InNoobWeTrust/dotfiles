import type { Stats } from "node:fs"
import { lstat, realpath } from "node:fs/promises"
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

export interface WorkspacePath {
  /** Canonical absolute path (symlinks resolved). */
  path: string
  /** Canonical workspace root. */
  root: string
  /** Workspace-relative display path when inside the root, otherwise the absolute path. */
  display: string
  /** file: URI of the canonical path. */
  uri: string
}

function missing(input: string, cause: unknown): Error {
  const code = (cause as { code?: string } | undefined)?.code
  if (code === "ENOENT" || code === "ENOTDIR") return new Error(`Path does not exist: ${input}`)
  return cause instanceof Error ? cause : new Error(String(cause))
}

function inside(root: string, absolute: string): boolean {
  const rest = relative(root, absolute)
  return rest === "" || (!rest.startsWith(`..${sep}`) && rest !== ".." && !isAbsolute(rest))
}

/**
 * Resolves one caller-supplied path against the workspace root.
 * Relative paths reject traversal, .git and symlink components; absolute paths
 * are allowed only when they resolve inside the workspace (symlinked parents are fine).
 */
export async function resolveWorkspacePath(
  cwd: string,
  input: string,
  options: { directory?: boolean } = {},
): Promise<WorkspacePath> {
  if (input.includes("\0")) throw new Error(`Unsafe path: ${input}`)
  const components = input.split(/[\\/]/).filter((part) => part && part !== ".")
  if (components.includes("..")) throw new Error(`Unsafe path: ${input}`)
  if (components.includes(".git")) throw new Error(`Refused .git path: ${input}`)

  let root: string
  try {
    root = await realpath(cwd)
  } catch (cause) {
    throw missing(cwd, cause)
  }

  let target: string
  if (isAbsolute(input)) {
    try {
      target = await realpath(resolve(input))
    } catch (cause) {
      throw missing(input, cause)
    }
    if (!inside(root, target)) throw new Error(`Path escapes the workspace: ${input}`)
  } else {
    let current = root
    for (const component of components.filter((part) => part !== ".")) {
      current = join(current, component)
      let info: Stats
      try {
        info = await lstat(current)
      } catch (cause) {
        throw missing(input, cause)
      }
      if (info.isSymbolicLink()) throw new Error(`Symlink path component refused: ${input}`)
    }
    try {
      target = await realpath(current)
    } catch (cause) {
      throw missing(input, cause)
    }
    if (!inside(root, target)) throw new Error(`Path escapes the workspace: ${input}`)
  }

  const info = await lstat(target)
  if (!info.isFile() && !info.isDirectory())
    throw new Error(`Not a regular file or directory: ${input}`)
  if (info.isDirectory() && !options.directory)
    throw new Error(`Expected a file but found a directory: ${input}`)

  return {
    path: target,
    root,
    display: displayPath(root, target),
    uri: pathToFileURL(target).href,
  }
}

/** True when the canonical absolute path sits inside the canonical root. */
export function within(root: string, absolute: string): boolean {
  return inside(root, absolute)
}

export interface WorkspaceDestination {
  /** Absolute path; the leaf may not exist yet. */
  path: string
  /** Canonical workspace root. */
  root: string
  /** Workspace-relative display path. */
  display: string
}

/**
 * Resolves a destination that may not exist yet (file create/rename targets).
 * Parent directories must exist and stay inside the workspace; relative
 * components must not be symlinks, and an existing leaf must be a regular file
 * or directory, never a symlink.
 */
export async function resolveWorkspaceDestination(
  cwd: string,
  input: string,
): Promise<WorkspaceDestination> {
  if (input.includes("\0")) throw new Error(`Unsafe path: ${input}`)
  const components = input.split(/[\\/]/).filter((part) => part && part !== ".")
  if (components.includes("..")) throw new Error(`Unsafe path: ${input}`)
  if (components.includes(".git")) throw new Error(`Refused .git path: ${input}`)
  if (components.length === 0) throw new Error(`Expected a file path: ${input}`)

  let root: string
  try {
    root = await realpath(cwd)
  } catch (cause) {
    throw missing(cwd, cause)
  }

  let parent: string
  let leaf: string
  if (isAbsolute(input)) {
    const absolute = resolve(input)
    leaf = basename(absolute)
    try {
      parent = await realpath(dirname(absolute))
    } catch (cause) {
      throw missing(input, cause)
    }
  } else {
    leaf = components[components.length - 1]
    let current = root
    for (const component of components.slice(0, -1)) {
      current = join(current, component)
      let info: Stats
      try {
        info = await lstat(current)
      } catch (cause) {
        throw missing(input, cause)
      }
      if (info.isSymbolicLink()) throw new Error(`Symlink path component refused: ${input}`)
      if (!info.isDirectory()) throw new Error(`Path component is not a directory: ${input}`)
    }
    try {
      parent = await realpath(current)
    } catch (cause) {
      throw missing(input, cause)
    }
  }
  if (!inside(root, parent)) throw new Error(`Path escapes the workspace: ${input}`)

  const target = join(parent, leaf)
  try {
    const info = await lstat(target)
    if (info.isSymbolicLink()) throw new Error(`Symlink path component refused: ${input}`)
    if (!info.isFile() && !info.isDirectory())
      throw new Error(`Not a regular file or directory: ${input}`)
  } catch (cause) {
    const code = (cause as { code?: string } | undefined)?.code
    if (code !== "ENOENT") throw cause instanceof Error ? cause : new Error(String(cause))
  }
  return { path: target, root, display: displayPath(root, target) }
}

/** Workspace-relative display form when possible; absolute otherwise. */
export function displayPath(root: string, absolute: string): string {
  return inside(root, absolute) ? relative(root, absolute) || "." : absolute
}

/** Converts a file: URI to an absolute path; undefined for other URI schemes. */
export function absoluteFromUri(uri: string): string | undefined {
  try {
    return fileURLToPath(uri)
  } catch {
    return undefined
  }
}

/** Display form of a server-reported URI; non-file URIs are shown unchanged. */
export function displayUri(root: string, uri: string): string {
  const absolute = absoluteFromUri(uri)
  return absolute === undefined ? uri : displayPath(root, absolute)
}
