import { afterAll, expect, test } from "bun:test"
import { existsSync } from "node:fs"
import { mkdir, mkdtemp, rm, stat, symlink, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { withStartupLock, withWarmCache } from "../startup.ts"

const scratch = await mkdtemp(join(tmpdir(), "mcp-lock-test-"))
afterAll(() => rm(scratch, { recursive: true, force: true }))

test("parallel dependency loads are serialized and callback results preserved", async () => {
  let active = 0
  let peak = 0
  const results = await Promise.all([1, 2, 3].map((value) => withStartupLock(async () => {
    peak = Math.max(peak, ++active)
    await Bun.sleep(30)
    active--
    return value
  }, { directory: join(scratch, "parallel") })))
  expect(peak).toBe(1)
  expect(results).toEqual([1, 2, 3])
})

test("failed import releases the lock without replacing its inode", async () => {
  const directory = join(scratch, "failure")
  await expect(withStartupLock(async () => { throw new Error("fixture") }, { directory })).rejects.toThrow("fixture")
  const before = await stat(join(directory, "startup.lock"))
  expect(await withStartupLock(async () => "recovered", { directory })).toBe("recovered")
  expect((await stat(join(directory, "startup.lock"))).ino).toBe(before.ino)
})

test("contention times out; SIGKILL releases the kernel lock without stale recovery", async () => {
  const directory = join(scratch, "killed-owner")
  const module = resolve(import.meta.dir, "../startup.ts")
  const child = Bun.spawn([process.execPath, "--no-env-file", "--eval", [
    `import {withStartupLock} from ${JSON.stringify(module)};`,
    `await withStartupLock(async()=>{console.log("held");await Bun.sleep(30000)},`,
    `{directory:${JSON.stringify(directory)}});`,
  ].join("\n")], { stdout: "pipe", stderr: "pipe" })
  const reader = child.stdout.getReader()
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    const first = await Promise.race([
      reader.read(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("lock holder did not start in 5s")), 5000)
      }),
    ])
    expect(new TextDecoder().decode(first.value)).toContain("held")
    await expect(withStartupLock(async () => "must not enter", { directory, timeoutMs: 60 })).rejects.toThrow("Timed out")
    child.kill("SIGKILL")
    await child.exited
    expect(await withStartupLock(async () => "recovered", { directory, timeoutMs: 1000 })).toBe("recovered")
  } finally {
    clearTimeout(timer)
    reader.releaseLock()
    child.kill("SIGKILL")
    await child.exited
  }
}, 10000)

test("lock-file symlinks are refused", async () => {
  const directory = join(scratch, "symlink")
  await withStartupLock(async () => {}, { directory })
  await rm(join(directory, "startup.lock"))
  const target = join(scratch, "untouched")
  await writeFile(target, "fixture")
  await symlink(target, join(directory, "startup.lock"))
  await expect(withStartupLock(async () => {}, { directory })).rejects.toThrow()
  expect(await Bun.file(target).text()).toBe("fixture")
})

test("children spawned during startup do not inherit the lock", async () => {
  const directory = join(scratch, "child-fd")
  let child: ReturnType<typeof Bun.spawn> | undefined
  try {
    await withStartupLock(async () => {
      child = Bun.spawn([process.execPath, "--no-env-file", "--eval", "await Bun.sleep(30000)"],
        { stdout: "ignore", stderr: "ignore" })
      await Bun.sleep(30)
    }, { directory })
    expect(child?.exitCode).toBeNull()
    expect(await withStartupLock(async () => "released", { directory, timeoutMs: 500 })).toBe("released")
  } finally {
    child?.kill("SIGKILL")
    if (child) await child.exited
  }
})

test("named locks never serialize distinct MCPs", async () => {
  const directory = join(scratch, "named")
  const order: string[] = []
  const holder = withStartupLock(async () => {
    order.push("alpha-start")
    await Bun.sleep(150)
    order.push("alpha-end")
  }, { directory, name: "alpha" })
  await Bun.sleep(30)
  // "beta" shares the directory but not the lock: it must enter while alpha sleeps.
  await withStartupLock(async () => order.push("beta"), { directory, name: "beta", timeoutMs: 90 })
  await holder
  expect(order).toEqual(["alpha-start", "beta", "alpha-end"])
  expect(existsSync(join(directory, "startup-alpha.lock"))).toBe(true)
  expect(existsSync(join(directory, "startup-beta.lock"))).toBe(true)
})

test("warm markers let later starts run while the per-MCP lock is held", async () => {
  const directory = join(scratch, "warm-skip")
  let runs = 0
  const load = async () => ++runs
  expect(await withWarmCache("svc", load, { directory })).toBe(1)
  const holder = withStartupLock(async () => { await Bun.sleep(150) }, { directory, name: "svc" })
  await Bun.sleep(30)
  const started = performance.now()
  expect(await withWarmCache("svc", load, { directory, timeoutMs: 90 })).toBe(2)
  expect(performance.now() - started).toBeLessThan(90)
  await holder
  expect(runs).toBe(2)
})

test("a failing warm load drops the marker, retries under the lock and re-marks", async () => {
  const directory = join(scratch, "warm-fail")
  let calls = 0
  const load = async () => {
    if (++calls === 2) throw new Error("stale package cache")
    return calls
  }
  expect(await withWarmCache("svc", load, { directory })).toBe(1)
  expect(await withWarmCache("svc", load, { directory })).toBe(3)
  expect(calls).toBe(3)
  expect(existsSync(join(directory, "warm", "svc"))).toBe(true)
  expect(await withWarmCache("svc", load, { directory })).toBe(4)
})

test("cold warm-cache starts serialize per name and record the marker", async () => {
  const directory = join(scratch, "warm-cold")
  let active = 0
  let peak = 0
  const results = await Promise.all([1, 2, 3].map((value) => withWarmCache("svc", async () => {
    peak = Math.max(peak, ++active)
    await Bun.sleep(30)
    active--
    return value
  }, { directory })))
  expect(peak).toBe(1)
  expect(results).toEqual([1, 2, 3])
  expect(existsSync(join(directory, "warm", "svc"))).toBe(true)
})

test("source edits invalidate the warm marker and force the lock", async () => {
  const directory = join(scratch, "fingerprint")
  const source = join(scratch, "fingerprint-src")
  await mkdir(source)
  const file = join(source, "server.ts")
  await writeFile(file, "export const version = 1\n")
  let runs = 0
  const load = async () => ++runs
  expect(await withWarmCache("svc", load, { directory, sourceDir: source })).toBe(1)
  const holder = withStartupLock(async () => { await Bun.sleep(200) }, { directory, name: "svc" })
  await Bun.sleep(30)
  // Unchanged sources stay lockless even while the lock is held.
  expect(await withWarmCache("svc", load, { directory, sourceDir: source, timeoutMs: 90 })).toBe(2)
  // An edit changes file size+mtime, so the next start must queue for the lock.
  await writeFile(file, "export const version = 22\n")
  await expect(withWarmCache("svc", load, { directory, sourceDir: source, timeoutMs: 90 })).rejects.toThrow("Timed out")
  await holder
  expect(await withWarmCache("svc", load, { directory, sourceDir: source })).toBe(3)
  expect(runs).toBe(3)
})
