import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test"
import type { AcquireInput } from "../src/contracts.ts"
import { DockerRuntime } from "../src/docker.ts"
import { ContainerManager } from "../src/manager.ts"
import * as processRunner from "../src/process.ts"

// Critical allocation/removal transitions must not strand containers or remove another instance's work.
const instance = "cleanup-test-instance"
const id = "a".repeat(64)
const owner = { session: "cleanup-test-session" }
const input: AcquireInput = {
  access: "ro",
  network: "none",
  image: "local:test",
  idleSeconds: 10,
  budgets: { cpus: 1, memoryBytes: 536870912, pids: 128, tmpfsBytes: 67108864 },
}
type Failure = "none" | "inspect" | "start" | "create_timeout" | "invalid_id" | "create_rejected"

function result(stdout = "", stderr = "", exitCode = 0): processRunner.ProcessResult {
  return {
    stdout,
    stderr,
    exitCode,
    stop: "exited",
    truncated: { stdout: false, stderr: false },
  }
}

function inspection() {
  return {
    Image: "sha256:local-image",
    Config: { User: "0:0" },
    Mounts: [],
    HostConfig: {
      ReadonlyRootfs: true,
      CapDrop: ["ALL"],
      SecurityOpt: ["no-new-privileges=true"],
      NetworkMode: "none",
      LogConfig: { Type: "none" },
      Tmpfs: {
        "/tmp": "rw,exec,nosuid,nodev,size=67108864,mode=1777",
        "/workspace": "rw,exec,nosuid,nodev,size=67108864,mode=1777",
        "/run/agent-sandbox": "rw,noexec,nosuid,nodev,size=65536,mode=0700",
      },
      Binds: [],
      PidsLimit: input.budgets.pids,
      Memory: input.budgets.memoryBytes,
      MemorySwap: input.budgets.memoryBytes,
      NanoCpus: 1e9,
      Privileged: false,
      AutoRemove: true,
      Init: true,
      RestartPolicy: { Name: "no" },
    },
  }
}

// WHY: global — hooks reset a fake Docker allocation and restore the CLI spy after each test.
let calls: string[][]
let exists: boolean
let name: string
let failure: Failure
let removeFailures: number
let confirmationFails: boolean
let confirmationReply: processRunner.ProcessResult
let labelInstance: string
let manager: ContainerManager
let restoreRun: () => void

beforeEach(() => {
  calls = []
  exists = false
  name = ""
  failure = "none"
  removeFailures = 0
  confirmationFails = false
  confirmationReply = result("", "private daemon error", 1)
  labelInstance = instance
  const runner = spyOn(processRunner, "run").mockImplementation(async (args) => {
    calls.push([...args])
    const operation = args[1]
    if (operation === "create") {
      name = args.includes("--name") ? (args[args.indexOf("--name") + 1] ?? "") : ""
      if (failure === "create_rejected") return result("", "No such image: local:test", 1)
      exists = true
      if (failure === "create_timeout") return { ...result(), exitCode: null, stop: "timeout" }
      return result(failure === "invalid_id" ? "invalid response" : id)
    }
    const target = operation === "exec" ? args[4] : args.at(-1)
    if (!exists || (target !== id && target !== name))
      return result("", "Error: No such container", 1)
    if (operation === "inspect") {
      if (args[3] === "{{json .Config.Labels}}")
        return result(
          JSON.stringify({ "sandbox.package": "sandbox", "sandbox.instance": labelInstance }),
        )
      if (args[3] === "{{.Id}}") return confirmationFails ? confirmationReply : result(id)
      if (args[3] === "{{json .}}")
        return failure === "inspect"
          ? result("", "private inspect error", 1)
          : result(JSON.stringify(inspection()))
      return result("true")
    }
    if (operation === "start" && failure === "start") return result("", "private start error", 1)
    if (operation === "rm") {
      if (removeFailures-- > 0) return result("", "private removal error", 1)
      if (!confirmationFails) exists = false
    }
    return result()
  })
  restoreRun = () => runner.mockRestore()
  manager = new ContainerManager(new DockerRuntime(instance), instance)
})
afterEach(() => restoreRun())

describe("failed Docker acquisition cleanup", () => {
  test.each(["inspect", "start"] as const)(
    "%s failure retains failed cleanup for automatic retry",
    async (stage) => {
      failure = stage
      removeFailures = 1
      confirmationFails = true
      const error = await manager.acquire(input, owner).catch((cause) => cause as Error)
      expect(error).toBeInstanceOf(Error)
      expect((error as Error).message).toContain("cleanup failed")
      expect((error as Error).message).toContain("no handle was issued")
      expect((error as Error).message).not.toContain("private")
      expect(exists).toBe(true)
      confirmationFails = false
      await manager.sweep()
      expect(exists).toBe(false)
      expect(calls.filter((args) => args[1] === "rm").map((args) => args.at(-1))).toEqual([id, id])
      await manager.close()
    },
  )

  test("shutdown retries cleanup of a container whose creation never returned a handle", async () => {
    failure = "inspect"
    removeFailures = 1
    confirmationFails = true
    await expect(manager.acquire(input, owner)).rejects.toThrow("cleanup failed")
    confirmationFails = false
    await manager.close()
    expect(exists).toBe(false)
    expect(calls.filter((args) => args[1] === "rm")).toHaveLength(2)
  })

  test.each(["create_timeout", "invalid_id"] as const)(
    "%s cleans the exact allocation even without a returned ID",
    async (stage) => {
      failure = stage
      await expect(manager.acquire(input, owner)).rejects.toThrow("no handle was issued")
      expect(exists).toBe(false)
      expect(name).toMatch(/^agent-sandbox-[0-9a-f-]{36}$/)
      expect(calls.filter((args) => args[1] === "rm").map((args) => args.at(-1))).toEqual([name])
      await manager.sweep()
      expect(calls.filter((args) => args[1] === "rm")).toHaveLength(1)
      await manager.close()
    },
  )

  test("a rejected create with no allocation does not invent a cleanup failure", async () => {
    failure = "create_rejected"
    await expect(manager.acquire(input, owner)).rejects.toThrow("no handle was issued")
    expect(exists).toBe(false)
    expect(calls.some((args) => ["stop", "kill", "rm"].includes(args[1] ?? ""))).toBe(false)
    await manager.close()
  })
})

describe("verified exact-container removal", () => {
  test("a removal acknowledgement without confirmed absence retains the handle for retry", async () => {
    const container = await manager.acquire(input, owner)
    confirmationFails = true
    await expect(manager.release(container.container, owner)).rejects.toThrow(
      "Container removal failed",
    )
    expect(exists).toBe(true)
    confirmationFails = false
    expect(await manager.release(container.container, owner)).toEqual({ released: true })
    expect(exists).toBe(false)
    expect(await manager.release(container.container, owner)).toEqual({ released: false })
  })

  test("ownership mismatch refuses every destructive operation", async () => {
    const container = await manager.acquire(input, owner)
    labelInstance = "another-instance"
    await expect(manager.release(container.container, owner)).rejects.toThrow(
      "Container removal failed",
    )
    expect(exists).toBe(true)
    expect(calls.some((args) => ["stop", "kill", "rm"].includes(args[1] ?? ""))).toBe(false)
    labelInstance = instance
    await manager.release(container.container, owner)
    expect(exists).toBe(false)
  })

  test("transport errors cannot count as confirmed absence or success", async () => {
    const container = await manager.acquire(input, owner)
    confirmationFails = true
    for (const reply of [result("", "No such container", 1), result(id)]) {
      confirmationReply = { ...reply, error: "private transport error" }
      await expect(manager.release(container.container, owner)).rejects.toThrow(
        "Container removal failed",
      )
      expect(exists).toBe(true)
    }
    confirmationFails = false
    expect(await manager.release(container.container, owner)).toEqual({ released: true })
    expect(exists).toBe(false)
  })
})
