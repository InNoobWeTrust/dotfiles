import { afterAll, expect, test } from "bun:test"
import { mkdtemp, rm, stat, symlink, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { withStartupLock } from "../startup.ts"

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
