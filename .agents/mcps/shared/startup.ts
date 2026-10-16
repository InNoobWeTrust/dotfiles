import { dlopen, read } from "bun:ffi"
import { closeSync, constants, mkdirSync, openSync } from "node:fs"
import { homedir, constants as osConstants } from "node:os"
import { join } from "node:path"

/** Serialize Bun's auto-install graph resolution, not the running MCP servers. */
export async function withStartupLock<T>(
  load: () => Promise<T>,
  options: { directory?: string; timeoutMs?: number } = {},
): Promise<T> {
  const directory = options.directory ?? join(process.env.XDG_CACHE_HOME || join(homedir(), ".cache"), "agent-mcps")
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
    const path = join(directory, "startup.lock")
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
