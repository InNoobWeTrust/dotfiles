import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test"
import type { AcquireInput } from "../src/contracts.ts"
import { ContainerCliRuntime } from "../src/docker.ts"
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
type Failure =
  | "none"
  | "inspect"
  | "start"
  | "create_timeout"
  | "invalid_id"
  | "create_rejected"
  | "exec_timeout"

type ImageInspect = "present" | "absent" | "error"
type PullOutcome = "success" | "timeout" | "fail"
type PodmanCapsState = "null" | "nonempty" | "missing"

function result(stdout = "", stderr = "", exitCode = 0): processRunner.ProcessResult {
  return {
    stdoutPath: null,
    stderrPath: null,
    stdoutBytes: 0,
    stderrBytes: 0,
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

// Podman with --cap-drop ALL reports EffectiveCaps/BoundingCaps as null at the top level;
// CapDrop is expanded to specific cap names, not the sentinel "ALL".
const PODMAN_CAP_DROP_EXPANDED = [
  "CAP_AUDIT_CONTROL",
  "CAP_AUDIT_READ",
  "CAP_BLOCK_SUSPEND",
  "CAP_BPF",
  "CAP_CHECKPOINT_RESTORE",
  "CAP_DAC_READ_SEARCH",
  "CAP_IPC_LOCK",
  "CAP_IPC_OWNER",
  "CAP_LINUX_IMMUTABLE",
  "CAP_MAC_ADMIN",
  "CAP_MAC_OVERRIDE",
]

function podmanInspection(capsState: PodmanCapsState): Record<string, unknown> {
  const base = inspection()
  const r: Record<string, unknown> = {
    ...base,
    HostConfig: { ...base.HostConfig, CapDrop: PODMAN_CAP_DROP_EXPANDED },
  }
  if (capsState !== "missing") {
    r.EffectiveCaps = capsState === "null" ? null : ["CAP_NET_ADMIN", "CAP_SYS_ADMIN"]
    r.BoundingCaps = capsState === "null" ? null : ["CAP_NET_ADMIN", "CAP_SYS_ADMIN"]
  }
  return r
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
let imageInspect: ImageInspect
let pullOutcome: PullOutcome
let podmanCapsState: PodmanCapsState
let engineMode: "docker" | "podman"

beforeEach(() => {
  calls = []
  exists = false
  name = ""
  failure = "none"
  removeFailures = 0
  confirmationFails = false
  confirmationReply = result("", "private daemon error", 1)
  labelInstance = instance
  imageInspect = "present"
  pullOutcome = "success"
  podmanCapsState = "null"
  engineMode = "docker"
  const runner = spyOn(processRunner, "run").mockImplementation(async (args) => {
    calls.push([...args])
    const operation = args[1]
    // Image provisioning: inspect and pull run before any container allocation.
    if (operation === "image") {
      if (imageInspect === "present") return result("sha256:local-image-id")
      if (imageInspect === "error") return result("", "private engine inspect error", 1)
      return result("", "Error: No such image: local:test", 1)
    }
    if (operation === "pull") {
      if (pullOutcome === "timeout") return { ...result(), exitCode: null, stop: "timeout" }
      if (pullOutcome === "fail") return result("", "private pull error", 1)
      imageInspect = "present"
      return result()
    }
    if (operation === "create") {
      name = args.includes("--name") ? (args[args.indexOf("--name") + 1] ?? "") : ""
      if (failure === "create_rejected") return result("", "No such image: local:test", 1)
      exists = true
      if (failure === "create_timeout") return { ...result(), exitCode: null, stop: "timeout" }
      return result(failure === "invalid_id" ? "invalid response" : id)
    }
    // Deadline exec places the id directly after --user; workload exec adds --workdir/--env first.
    const target =
      operation === "exec" ? (args.includes("--workdir") ? args.at(-4) : args[4]) : args.at(-1)
    if (!exists || (target !== id && target !== name))
      return result("", "Error: No such container", 1)
    if (operation === "exec" && failure === "exec_timeout" && args.includes("--workdir"))
      return { ...result(), exitCode: null, stop: "timeout" }
    if (operation === "inspect") {
      if (args[3] === "{{json .Config.Labels}}")
        return result(
          JSON.stringify({ "sandbox.package": "sandbox", "sandbox.instance": labelInstance }),
        )
      if (args[3] === "{{.Id}}") return confirmationFails ? confirmationReply : result(id)
      if (args[3] === "{{json .}}")
        return failure === "inspect"
          ? result("", "private inspect error", 1)
          : result(
              JSON.stringify(
                engineMode === "podman" ? podmanInspection(podmanCapsState) : inspection(),
              ),
            )
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
  manager = new ContainerManager(new ContainerCliRuntime(instance, "docker"), instance)
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

describe("selected engine reaches every operation and cleanup", () => {
  test.each(["podman", "docker"] as const)(
    "every lifecycle and cleanup CLI call pins the selected engine binary",
    async (engine) => {
      engineMode = engine
      manager = new ContainerManager(new ContainerCliRuntime(instance, engine), instance)
      failure = "exec_timeout"
      const container = await manager.acquire(input, owner)
      const execution = await manager.exec(
        {
          container: container.container,
          command: "printf ok",
          wallTimeMs: 1000,
        },
        owner,
      )
      expect(execution.containerDestroyed).toBe(true)
      await manager.release(container.container, owner)
      expect(calls.filter((args) => args[1] === "kill")).toHaveLength(1)
      expect(calls.length).toBeGreaterThan(0)
      expect(calls.every((args) => args[0] === engine)).toBe(true)
      await manager.close()
    },
  )
})

describe("image provisioning before container allocation", () => {
  test("present image skips pull and proceeds to create", async () => {
    imageInspect = "present"
    await manager.acquire(input, owner)
    expect(calls.filter((args) => args[1] === "image").length).toBe(1)
    expect(calls.filter((args) => args[1] === "pull").length).toBe(0)
    expect(calls.some((args) => args[1] === "create")).toBe(true)
    await manager.close()
  })

  test("absent image triggers pull then proceeds to create", async () => {
    imageInspect = "absent"
    await manager.acquire(input, owner)
    const imageCalls = calls.filter((args) => args[1] === "image")
    const pullCalls = calls.filter((args) => args[1] === "pull")
    expect(imageCalls.length).toBe(1)
    expect(pullCalls.length).toBe(1)
    expect(pullCalls[0]).toContain("local:test")
    expect(calls.some((args) => args[1] === "create")).toBe(true)
    await manager.close()
  })

  test("unknown inspect failure aborts before allocation with sanitized error and no pull or create", async () => {
    imageInspect = "error"
    const { ImageProvisioningError } = await import("../src/errors.ts")
    const error = await manager.acquire(input, owner).catch((e) => e as Error)
    expect(error).toBeInstanceOf(ImageProvisioningError)
    expect(error.message).toBe(ImageProvisioningError.MESSAGE)
    expect(error.message).not.toContain("private")
    expect(error.message).not.toContain("local:test")
    expect(calls.filter((args) => args[1] === "pull").length).toBe(0)
    expect(calls.filter((args) => args[1] === "create").length).toBe(0)
    expect(exists).toBe(false)
    await manager.close()
  })

  test("pull timeout aborts before allocation with sanitized error and no create", async () => {
    imageInspect = "absent"
    pullOutcome = "timeout"
    const { ImageProvisioningError } = await import("../src/errors.ts")
    const error = await manager.acquire(input, owner).catch((e) => e as Error)
    expect(error).toBeInstanceOf(ImageProvisioningError)
    expect(error.message).toBe(ImageProvisioningError.MESSAGE)
    expect(error.message).not.toContain("private")
    expect(calls.filter((args) => args[1] === "pull").length).toBe(1)
    expect(calls.filter((args) => args[1] === "create").length).toBe(0)
    expect(exists).toBe(false)
    await manager.close()
  })

  test("pull failure aborts before allocation with sanitized error and no create", async () => {
    imageInspect = "absent"
    pullOutcome = "fail"
    const { ImageProvisioningError } = await import("../src/errors.ts")
    const error = await manager.acquire(input, owner).catch((e) => e as Error)
    expect(error).toBeInstanceOf(ImageProvisioningError)
    expect(error.message).toBe(ImageProvisioningError.MESSAGE)
    expect(error.message).not.toContain("private")
    expect(calls.filter((args) => args[1] === "pull").length).toBe(1)
    expect(calls.filter((args) => args[1] === "create").length).toBe(0)
    expect(exists).toBe(false)
    await manager.close()
  })

  test("concurrent acquires for the same absent image share one in-flight pull", async () => {
    imageInspect = "absent"
    const runtime = new ContainerCliRuntime(instance, "docker")
    const mgr = new ContainerManager(runtime, instance)
    const [first, second] = await Promise.all([
      mgr.acquire(input, owner),
      mgr.acquire(input, owner),
    ])
    expect(first.container).not.toBe(second.container)
    // Image inspect runs once per concurrent pair; pull runs at most once.
    expect(calls.filter((args) => args[1] === "pull").length).toBe(1)
    await mgr.close()
  })

  test("create args include --pull=never and no nr_inodes in any tmpfs option", async () => {
    await manager.acquire(input, owner)
    const createCall = calls.find((args) => args[1] === "create")
    expect(createCall).toBeDefined()
    expect(createCall).toContain("--pull=never")
    const tmpfsValues = createCall?.filter((_, i, arr) => i > 0 && arr[i - 1] === "--tmpfs")
    expect(tmpfsValues?.length).toBeGreaterThan(0)
    expect(tmpfsValues?.every((v) => !v.includes("nr_inodes"))).toBe(true)
    await manager.close()
  })
})

describe("Podman capability constraints", () => {
  test("Podman with null EffectiveCaps and BoundingCaps passes verification", async () => {
    engineMode = "podman"
    podmanCapsState = "null"
    manager = new ContainerManager(new ContainerCliRuntime(instance, "podman"), instance)
    const container = await manager.acquire(input, owner)
    expect(container.container).toMatch(/^[a-f0-9]{64}$/)
    await manager.close()
  })

  test("Podman with nonempty EffectiveCaps fails verification and cleans up", async () => {
    engineMode = "podman"
    podmanCapsState = "nonempty"
    manager = new ContainerManager(new ContainerCliRuntime(instance, "podman"), instance)
    const error = await manager.acquire(input, owner).catch((e) => e as Error)
    expect(error).toBeInstanceOf(Error)
    expect(error.message).not.toContain("private")
    expect(exists).toBe(false)
    await manager.close()
  })

  test("Podman with missing EffectiveCaps/BoundingCaps fields fails closed and cleans up", async () => {
    engineMode = "podman"
    podmanCapsState = "missing"
    manager = new ContainerManager(new ContainerCliRuntime(instance, "podman"), instance)
    const error = await manager.acquire(input, owner).catch((e) => e as Error)
    expect(error).toBeInstanceOf(Error)
    expect(error.message).not.toContain("private")
    expect(exists).toBe(false)
    await manager.close()
  })

  test("Docker keeps CapDrop ALL check and is not affected by Podman capability logic", async () => {
    engineMode = "docker"
    manager = new ContainerManager(new ContainerCliRuntime(instance, "docker"), instance)
    const container = await manager.acquire(input, owner)
    expect(container.container).toMatch(/^[a-f0-9]{64}$/)
    await manager.close()
  })
})
