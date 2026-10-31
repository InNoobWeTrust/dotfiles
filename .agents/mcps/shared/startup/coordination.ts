import { dlopen, read } from "bun:ffi"
import { closeSync, constants, mkdirSync, openSync } from "node:fs"
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises"
import { homedir, constants as osConstants } from "node:os"
import { dirname, join } from "node:path"

const namePattern = /^[a-z0-9][a-z0-9-]*$/

function requireLockName(name: string): string {
  if (!namePattern.test(name)) throw new Error(`Invalid MCP startup name ${JSON.stringify(name)}; expected [a-z0-9-]+`)
  return name
}

function agentMcpsDirectory(override?: string): string {
  return override ?? join(process.env.XDG_CACHE_HOME || join(homedir(), ".cache"), "agent-mcps")
}

/** Serialize Bun's auto-install graph resolution, not the running MCP servers. */
export async function withStartupLock<T>(
  load: () => Promise<T>,
  options: { directory?: string; name?: string; timeoutMs?: number } = {},
): Promise<T> {
  const directory = agentMcpsDirectory(options.directory)
  const timeoutMs = options.timeoutMs ?? Number(process.env.MCP_STARTUP_TIMEOUT_MS ?? 60000)
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error("MCP_STARTUP_TIMEOUT_MS must be a positive number")
  const platform = process.platform
  if (platform !== "linux" && platform !== "darwin") throw new Error(`MCP startup locking requires Linux glibc or macOS; got ${platform}`)

  const library = platform === "darwin" ? "/usr/lib/libSystem.B.dylib" : "libc.so.6"
  const errnoAccessor = platform === "darwin" ? "__error" : "__errno_location"
  // Node's fs constants omit O_CLOEXEC. Values are from Linux/Apple fcntl.h;
  // Bun openSync does not set it implicitly, and startup can spawn children.
  const closeOnExec = platform === "darwin" ? 0x01000000 : 0x80000
  const native = (() => {
    try {
      return dlopen(library, {
        flock: { args: ["i32", "i32"], returns: "i32" },
        [errnoAccessor]: { args: [], returns: "ptr" },
      })
    } catch (error) {
      throw new Error(`MCP startup needs native flock from ${library} on ${platform}: ${String(error)}`)
    }
  })()
  let fd: number | undefined
  try {
    mkdirSync(directory, { recursive: true, mode: 0o700 })
    // Named locks are per-MCP: distinct servers never serialize against each other.
    const path = join(directory, options.name === undefined ? "startup.lock" : `startup-${requireLockName(options.name)}.lock`)
    fd = openSync(path, constants.O_CREAT | constants.O_RDWR | constants.O_NOFOLLOW | closeOnExec, 0o600)
    const deadline = performance.now() + timeoutMs
    // LOCK_EX | LOCK_NB: never block Bun's event loop while another MCP loads.
    while (native.symbols.flock(fd, 2 | 4) !== 0) {
      const errnoAddress = native.symbols[errnoAccessor]()
      if (!errnoAddress) throw new Error(`MCP startup could not read errno from ${library}`)
      const errno = read.i32(errnoAddress)
      if (errno !== osConstants.errno.EINTR && errno !== osConstants.errno.EAGAIN && errno !== osConstants.errno.EWOULDBLOCK) {
        throw new Error(`MCP startup flock failed for ${path} (errno ${errno})`)
      }
      const remaining = deadline - performance.now()
      if (remaining <= 0) throw new Error(`Timed out waiting for MCP dependency startup lock ${path}; increase MCP_STARTUP_TIMEOUT_MS for slow downloads`)
      await Bun.sleep(Math.min(50, remaining))
    }
    return await load()
  } finally {
    // Keep the inode: unlinking would let another process lock a different file.
    // Closing also releases on process death; no stale-file recovery is needed.
    if (fd !== undefined) closeSync(fd)
    native.close()
  }
}

type WarmMarker = { bun: string; files?: Array<[string, string]> }

/**
 * Run an MCP's dependency load with a warm fast path.
 *
 * A marker under `$agentMcps/warm/<name>` records that the load already
 * succeeded under the per-MCP lock, together with a fingerprint of the
 * package's TypeScript sources (and the Bun version). Steady-state starts take
 * that path and run lockless, so parallel MCP starts never queue behind each
 * other. Cold starts, source changes and manually cleared caches fall back to
 * the named lock for the actual Bun auto-install graph resolution.
 */
export async function withWarmCache<T>(
  name: string,
  load: () => Promise<T>,
  options: { directory?: string; sourceDir?: string; timeoutMs?: number } = {},
): Promise<T> {
  requireLockName(name)
  const root = agentMcpsDirectory(options.directory)
  const marker = join(root, "warm", name)
  if (await warmMarkerIsCurrent(marker, options.sourceDir)) {
    try {
      return await load()
    } catch {
      // The marker can outlive its packages (manual cache cleanup, interrupted
      // population, changed imports). Drop it and retry under the lock.
      await rm(marker, { force: true }).catch(() => {})
    }
  }
  return await withStartupLock(async () => {
    const value = await load()
    await writeWarmMarker(marker, options.sourceDir).catch(() => {
      // The marker is an optimization: if it cannot be written, later starts
      // simply take the lock again.
    })
    return value
  }, { directory: root, name, timeoutMs: options.timeoutMs })
}

async function warmMarkerIsCurrent(marker: string, sourceDir?: string): Promise<boolean> {
  let parsed: WarmMarker
  try {
    parsed = JSON.parse(await readFile(marker, "utf8"))
  } catch {
    return false
  }
  if (parsed.bun !== Bun.version) return false
  if (sourceDir === undefined) return parsed.files === undefined
  if (!Array.isArray(parsed.files)) return false
  try {
    return JSON.stringify(await sourceFingerprint(sourceDir)) === JSON.stringify(parsed.files)
  } catch {
    return false
  }
}

async function writeWarmMarker(marker: string, sourceDir?: string): Promise<void> {
  const payload: WarmMarker = { bun: Bun.version }
  if (sourceDir !== undefined) payload.files = await sourceFingerprint(sourceDir)
  await mkdir(dirname(marker), { recursive: true, mode: 0o700 })
  await writeFile(marker, JSON.stringify(payload), { mode: 0o600 })
}

/** Sorted [relative path, mtime+size] pairs for every TypeScript file below `directory`. */
async function sourceFingerprint(directory: string): Promise<Array<[string, string]>> {
  const entries: Array<[string, string]> = []
  for await (const relative of new Bun.Glob("**/*.ts").scan({ cwd: directory })) {
    const info = await stat(join(directory, relative))
    if (info.isFile()) entries.push([relative, `${info.mtimeMs}:${info.size}`])
  }
  return entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
}
