import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test"
import type {
  AcquireInput,
  ContainerHandle,
  ContainerRuntime,
  ContainerSpec,
  ExecInput,
  ExecResult,
} from "../src/contracts.ts"
import { ContainerManager } from "../src/manager.ts"

// Critical ownership, expiry, atomicity, cleanup, and queue races protect data and avoid stranded containers.
const alice = { session: "alice-private-session" }
const bob = { session: "bob-private-session" }
const input: AcquireInput = {
  workspace: "/workspace",
  access: "ro",
  network: "none",
  image: "local:test",
  idleSeconds: 10,
  budgets: { cpus: 1, memoryBytes: 536870912, pids: 128, tmpfsBytes: 67108864 },
}
const success: ExecResult = {
  exitCode: 0,
  stdout: "ok",
  stderr: "",
  termination: "exited",
  truncated: { stdout: false, stderr: false },
  containerDestroyed: false,
}

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}

// Attach rejection handlers immediately without running Bun's matcher against a pending promise.
function observe<T>(promise: Promise<T>) {
  return promise.then(
    (value) => ({ value, error: undefined }),
    (error) => ({ value: undefined, error: error as Error }),
  )
}

class FakeRuntime implements ContainerRuntime {
  readonly live = new Set<string>()
  readonly specs: ContainerSpec[] = []
  readonly deadlines: { id: string; seconds: number }[] = []
  readonly removals: string[] = []
  readonly executions: string[] = []
  createHook?: () => Promise<void>
  deadlineHook?: (id: string, seconds: number) => Promise<void>
  execHook?: (id: string) => Promise<ExecResult>
  aliveHook?: (id: string) => Promise<boolean>
  removeHook?: (id: string) => Promise<void>

  async create(spec: ContainerSpec): Promise<ContainerHandle> {
    this.specs.push(spec)
    const id = `container-${this.specs.length}`
    if (this.createHook) await this.createHook()
    this.live.add(id)
    return { id, imageId: "sha256:local-image" }
  }

  async alive(id: string): Promise<boolean> {
    return this.aliveHook ? this.aliveHook(id) : this.live.has(id)
  }

  async deadline(id: string, seconds: number): Promise<void> {
    this.deadlines.push({ id, seconds })
    if (this.deadlineHook) await this.deadlineHook(id, seconds)
  }

  async exec(id: string, _input: ExecInput): Promise<ExecResult> {
    this.executions.push(id)
    const result = this.execHook ? await this.execHook(id) : success
    if (result.containerDestroyed) this.live.delete(id)
    return result
  }

  async remove(id: string): Promise<void> {
    this.removals.push(id)
    if (this.removeHook) await this.removeHook(id)
    this.live.delete(id)
  }
}

// WHY: global — Bun hooks recreate the fake runtime and restore the clock for each isolated test.
let now: number
let runtime: FakeRuntime
let manager: ContainerManager
let restoreClock: () => void

beforeEach(() => {
  now = Date.UTC(2026, 0, 1)
  const clock = spyOn(Date, "now").mockImplementation(() => now)
  restoreClock = () => {
    clock.mockRestore()
  }
  runtime = new FakeRuntime()
  manager = new ContainerManager(runtime, "test-instance")
})
afterEach(() => {
  restoreClock()
})

function command(container: string, wallTimeMs = 1000): ExecInput {
  return { container, command: "printf ok", wallTimeMs, maxOutputBytes: 1024 }
}

describe("session-bound independent containers", () => {
  test("each acquire creates a distinct opaque handle and supports no workspace", async () => {
    const { workspace: _workspace, ...scratch } = input
    const first = await manager.acquire(scratch, alice)
    const second = await manager.acquire(input, alice)
    expect(first.container).toMatch(/^[a-f0-9]{64}$/)
    expect(second.container).not.toBe(first.container)
    expect(second.containerId).not.toBe(first.containerId)
    expect(first.workspace).toBeUndefined()
    expect(runtime.specs[0]?.workspace).toBeUndefined()
    expect(
      runtime.specs.every((spec) => spec.instance === "test-instance" && spec.idleSeconds === 10),
    ).toBe(true)
    expect(Date.parse(first.expiresAt)).toBe(now + 10000)
    await manager.close()
    expect(runtime.live.size).toBe(0)
  })

  test("wrong sessions cannot exec or release and denial exposes no private identifiers", async () => {
    const container = await manager.acquire(input, alice)
    for (const operation of [
      () => manager.exec(command(container.container), bob),
      () => manager.release(container.container, bob),
    ]) {
      const outcome = await observe<unknown>(operation())
      expect(outcome.error).toBeInstanceOf(Error)
      expect(outcome.error?.message).toContain("Container unavailable")
      for (const secret of [alice.session, container.container, container.containerId]) {
        expect(outcome.error?.message).not.toContain(secret)
      }
    }
    expect(runtime.executions).toEqual([])
    expect(runtime.removals).toEqual([])
    expect((await manager.exec(command(container.container), alice)).stdout).toBe("ok")
    await manager.close()
  })

  test("release is idempotent and never removes another independent container", async () => {
    const first = await manager.acquire(input, alice)
    const second = await manager.acquire(input, bob)
    expect(await manager.release(first.container, alice)).toEqual({ released: true })
    expect(await manager.release(first.container, bob)).toEqual({ released: false })
    expect(await manager.release("f".repeat(64), alice)).toEqual({ released: false })
    expect(runtime.live.has(second.containerId)).toBe(true)
    await expect(manager.exec(command(first.container), alice)).rejects.toThrow(
      "Container unavailable",
    )
    await manager.close()
  })

  test("failed removal retains owner authorization for retry even after expiry", async () => {
    const container = await manager.acquire(input, alice)
    runtime.removeHook = async () => {
      throw new Error(`secret:${bob.session}`)
    }
    const failed = await observe(manager.release(container.container, alice))
    expect(failed.error?.message).toContain("Container removal failed")
    expect(failed.error?.message).not.toContain(bob.session)
    now += 10000
    await expect(manager.exec(command(container.container), alice)).rejects.toThrow(
      "Container unavailable",
    )
    await expect(manager.release(container.container, bob)).rejects.toThrow("Container unavailable")
    runtime.removeHook = undefined
    expect(await manager.release(container.container, alice)).toEqual({ released: true })
    expect(runtime.live.size).toBe(0)
  })
})

describe("expiry and verified deadline changes", () => {
  test("exec extends by rounded wall budget plus grace then resets idle from completion", async () => {
    const container = await manager.acquire(input, alice)
    now += 1000
    runtime.execHook = async () => {
      now += 20000
      return success
    }
    expect(await manager.exec(command(container.container, 20501), alice)).toEqual(success)
    expect(runtime.deadlines.map((value) => value.seconds)).toEqual([10, 26, 10])
    runtime.execHook = undefined
    now += 9999
    await manager.sweep()
    expect(runtime.live.size).toBe(1)
    now += 1
    await expect(manager.exec(command(container.container), alice)).rejects.toThrow(
      "Container unavailable",
    )
    await manager.sweep()
    expect(runtime.live.size).toBe(0)
  })

  test("short exec uses the idle budget rather than shortening to wall time", async () => {
    const container = await manager.acquire(input, alice)
    await manager.exec(command(container.container), alice)
    expect(runtime.deadlines.map((value) => value.seconds)).toEqual([10, 10, 10])
    await manager.close()
  })

  test("expiry is time-based, live sweep does not renew, and expired handles cannot resurrect", async () => {
    const container = await manager.acquire(input, alice)
    now += 9999
    await manager.sweep()
    expect(runtime.live.size).toBe(1)
    expect(runtime.deadlines.length).toBe(1)
    now += 1
    await expect(manager.exec(command(container.container), alice)).rejects.toThrow(
      "Container unavailable",
    )
    expect(runtime.executions).toEqual([])
    await manager.sweep()
    expect(runtime.live.size).toBe(0)
    const fresh = await manager.acquire(input, alice)
    expect(fresh.container).not.toBe(container.container)
    await manager.close()
  })

  test("failed pre-exec deadline never executes or commits a later expiry", async () => {
    const container = await manager.acquire(input, alice)
    now += 2000
    runtime.deadlineHook = async () => {
      throw new Error(`secret:${bob.session}:${container.container}`)
    }
    const failed = await observe(manager.exec(command(container.container, 20000), alice))
    expect(failed.error?.message).toContain("expiry change was not committed")
    expect(failed.error?.message).not.toContain(bob.session)
    expect(failed.error?.message).not.toContain(container.container)
    expect(runtime.executions).toEqual([])
    now += 8000
    runtime.deadlineHook = undefined
    await manager.sweep()
    expect(runtime.live.size).toBe(0)
  })

  test("expiry during pre-exec deadline write cannot regain execution rights", async () => {
    const container = await manager.acquire(input, alice)
    runtime.deadlineHook = async () => {
      now += 11000
    }
    await expect(manager.exec(command(container.container, 20000), alice)).rejects.toThrow(
      "Container unavailable",
    )
    expect(runtime.executions).toEqual([])
    runtime.deadlineHook = undefined
    await manager.sweep()
    expect(runtime.live.size).toBe(0)
  })

  test("expiry during liveness check cannot authorize a later deadline change", async () => {
    const container = await manager.acquire(input, alice)
    runtime.aliveHook = async () => {
      now += 10000
      return true
    }
    await expect(manager.exec(command(container.container), alice)).rejects.toThrow(
      "Container unavailable",
    )
    expect(runtime.deadlines.length).toBe(1)
    expect(runtime.executions).toEqual([])
    await manager.sweep()
  })

  test("failed post-exec reset preserves streams, exit code and truncation with explicit runtime error", async () => {
    const container = await manager.acquire(input, alice)
    const completed: ExecResult = {
      ...success,
      exitCode: 7,
      stdout: "written",
      stderr: "warning",
      truncated: { stdout: true, stderr: false },
    }
    runtime.execHook = async () => {
      now += 1000
      runtime.deadlineHook = async () => {
        throw new Error(`secret:${bob.session}`)
      }
      return completed
    }
    const result = await manager.exec(command(container.container, 20000), alice)
    expect(result).toEqual({
      ...completed,
      termination: "runtime_error",
      error: expect.stringContaining("Execution completed"),
    })
    expect(result.error).not.toContain(bob.session)
    expect(result.error).toContain("do not blindly retry")
    runtime.deadlineHook = undefined
    now += 10000
    await manager.sweep()
    expect(runtime.live.size).toBe(1) // Failed idle reset leaves only the previously committed execution deadline.
    now += 14000
    await manager.sweep()
    expect(runtime.live.size).toBe(0)
  })

  test("expiry during post-exec reset cannot resurrect but still returns completed output", async () => {
    const container = await manager.acquire(input, alice)
    runtime.execHook = async () => {
      runtime.deadlineHook = async () => {
        now += 11000
      }
      return success
    }
    const result = await manager.exec(command(container.container), alice)
    expect(result.stdout).toBe("ok")
    expect(result.exitCode).toBe(0)
    expect(result.termination).toBe("runtime_error")
    await expect(manager.exec(command(container.container), alice)).rejects.toThrow(
      "Container unavailable",
    )
    await manager.sweep()
    expect(runtime.live.size).toBe(0)
  })

  test("sweep attempts every expired container and retries only failed cleanup", async () => {
    const first = await manager.acquire(input, alice)
    const second = await manager.acquire(input, bob)
    now += 10000
    runtime.removeHook = async (id) => {
      if (id === first.containerId) throw new Error("remove failed")
    }
    await expect(manager.sweep()).rejects.toThrow("Container sweep failed")
    expect(runtime.live.has(first.containerId)).toBe(true)
    expect(runtime.live.has(second.containerId)).toBe(false)
    runtime.removeHook = undefined
    await manager.sweep()
    expect(runtime.live.size).toBe(0)
    expect(runtime.removals.filter((id) => id === second.containerId).length).toBe(1)
  })
})

describe("initialization, queue ordering, and missing containers", () => {
  test("failed initial deadline issues no handle and removes the newly created container", async () => {
    runtime.deadlineHook = async () => {
      throw new Error("private runtime failure")
    }
    await expect(manager.acquire(input, alice)).rejects.toThrow("no handle was issued")
    expect(runtime.live.size).toBe(0)
    expect(runtime.removals).toEqual(["container-1"])
    await manager.close()
    expect(runtime.removals.length).toBe(1)
  })

  test("failed acquisition cleanup stays tracked for sweep without issuing a token", async () => {
    runtime.deadlineHook = async () => {
      throw new Error("deadline failed")
    }
    runtime.removeHook = async () => {
      throw new Error("remove failed")
    }
    await expect(manager.acquire(input, alice)).rejects.toThrow("cleanup failed")
    expect(runtime.live.size).toBe(1)
    runtime.removeHook = undefined
    await manager.sweep()
    expect(runtime.live.size).toBe(0)
  })

  test("initialization expiry does not publish a handle", async () => {
    runtime.deadlineHook = async () => {
      now += 10000
    }
    await expect(manager.acquire(input, alice)).rejects.toThrow("no handle was issued")
    expect(runtime.live.size).toBe(0)
  })

  test("sweep waits for initialization instead of removing a temporarily tokenless container", async () => {
    const started = deferred<void>()
    const finish = deferred<void>()
    runtime.deadlineHook = async () => {
      started.resolve(undefined)
      await finish.promise
    }
    const acquisition = observe(manager.acquire(input, alice))
    await started.promise
    const sweeping = observe(manager.sweep())
    expect(runtime.removals).toEqual([])
    finish.resolve(undefined)
    const acquired = await acquisition
    expect(acquired.error).toBeUndefined()
    expect(acquired.value?.container).toMatch(/^[a-f0-9]{64}$/)
    expect((await sweeping).error).toBeUndefined()
    expect(runtime.live.size).toBe(1)
    expect(runtime.removals).toEqual([])
    await manager.close()
  })

  test("destroyed execution skips idle reset and forbids further exec", async () => {
    const container = await manager.acquire(input, alice)
    const destroyed: ExecResult = {
      ...success,
      exitCode: null,
      termination: "timeout",
      containerDestroyed: true,
    }
    runtime.execHook = async () => destroyed
    expect(await manager.exec(command(container.container), alice)).toEqual(destroyed)
    expect(runtime.deadlines.length).toBe(2)
    await expect(manager.exec(command(container.container), alice)).rejects.toThrow(
      "Container is missing",
    )
    expect(runtime.executions.length).toBe(1)
    expect(await manager.release(container.container, alice)).toEqual({ released: true })
  })

  test("external loss prevents execution and allows owner cleanup", async () => {
    const container = await manager.acquire(input, alice)
    runtime.live.delete(container.containerId)
    await expect(manager.exec(command(container.container), alice)).rejects.toThrow(
      "Container is missing",
    )
    expect(runtime.executions).toEqual([])
    expect(runtime.deadlines.length).toBe(1)
    await manager.release(container.container, alice)
  })

  test("release waits for same-container exec while another container remains usable", async () => {
    const first = await manager.acquire(input, alice)
    const second = await manager.acquire(input, bob)
    const started = deferred<void>()
    const finish = deferred<ExecResult>()
    runtime.execHook = async (id) => {
      if (id !== first.containerId) return success
      started.resolve(undefined)
      return finish.promise
    }
    const execution = observe(manager.exec(command(first.container), alice))
    await started.promise
    const release = observe(manager.release(first.container, alice))
    await manager.exec(command(second.container), bob)
    expect(runtime.removals).toEqual([])
    finish.resolve(success)
    expect((await execution).error).toBeUndefined()
    expect((await release).value).toEqual({ released: true })
    expect(runtime.removals).toEqual([first.containerId])
    await manager.close()
  })

  test("queued exec reauthorizes after successful release and cannot use a removed container", async () => {
    const container = await manager.acquire(input, alice)
    const started = deferred<void>()
    const finish = deferred<void>()
    runtime.removeHook = async () => {
      started.resolve(undefined)
      await finish.promise
    }
    const release = observe(manager.release(container.container, alice))
    await started.promise
    const queued = observe(manager.exec(command(container.container), alice))
    finish.resolve(undefined)
    expect((await release).value).toEqual({ released: true })
    expect((await queued).error?.message).toContain("Container unavailable")
    expect(runtime.executions).toEqual([])
  })

  test("queued exec cannot revive expiry while waiting for failed removal", async () => {
    const container = await manager.acquire(input, alice)
    const started = deferred<void>()
    const finish = deferred<void>()
    runtime.removeHook = async () => {
      started.resolve(undefined)
      await finish.promise
      throw new Error("remove failed")
    }
    const release = observe(manager.release(container.container, alice))
    await started.promise
    const queued = observe(manager.exec(command(container.container), alice))
    now += 10000
    finish.resolve(undefined)
    expect((await release).error?.message).toContain("Container removal failed")
    expect((await queued).error?.message).toContain("Container unavailable")
    expect(runtime.executions).toEqual([])
    runtime.removeHook = undefined
    await manager.sweep()
  })

  test("sweep queued during exec observes the refreshed idle deadline after completion", async () => {
    const container = await manager.acquire(input, alice)
    const started = deferred<void>()
    const finish = deferred<ExecResult>()
    runtime.execHook = async () => {
      started.resolve(undefined)
      return finish.promise
    }
    const execution = observe(manager.exec(command(container.container, 20000), alice))
    await started.promise
    now += 12000
    const sweeping = observe(manager.sweep())
    expect(runtime.removals).toEqual([])
    finish.resolve(success)
    expect((await execution).error).toBeUndefined()
    expect((await sweeping).error).toBeUndefined()
    expect(runtime.live.size).toBe(1)
    now += 10000
    await manager.sweep()
    expect(runtime.live.size).toBe(0)
  })

  test("runtime failure does not poison the queue and does not expose raw diagnostics", async () => {
    const container = await manager.acquire(input, alice)
    runtime.execHook = async () => {
      throw new Error(`private command ${bob.session}`)
    }
    const failed = await observe(manager.exec(command(container.container), alice))
    expect(failed.error?.message).toContain("Container execution failed")
    expect(failed.error?.message).not.toContain(bob.session)
    runtime.execHook = undefined
    expect((await manager.exec(command(container.container), alice)).stdout).toBe("ok")
    await manager.close()
  })
})

describe("shutdown races and retryable cleanup", () => {
  test("close during create drains acquisition and removes its late-created container", async () => {
    const started = deferred<void>()
    const finish = deferred<void>()
    runtime.createHook = async () => {
      started.resolve(undefined)
      await finish.promise
    }
    const acquisition = observe(manager.acquire(input, alice))
    await started.promise
    const closing = observe(manager.close())
    const denied = observe(manager.acquire(input, bob))
    finish.resolve(undefined)
    expect((await denied).error?.message).toContain("closing")
    expect((await acquisition).error?.message).toContain("no handle was issued")
    expect((await closing).error).toBeUndefined()
    expect(runtime.live.size).toBe(0)
    expect(runtime.removals.length).toBe(1)
  })

  test("close during initial deadline retries tracked failed acquisition cleanup", async () => {
    const started = deferred<void>()
    const finish = deferred<void>()
    runtime.deadlineHook = async () => {
      started.resolve(undefined)
      await finish.promise
    }
    let failures = 1
    runtime.removeHook = async () => {
      if (failures-- > 0) throw new Error("first removal fails")
    }
    const acquisition = observe(manager.acquire(input, alice))
    await started.promise
    const closing = observe(manager.close())
    finish.resolve(undefined)
    expect((await acquisition).error?.message).toContain("cleanup failed")
    expect((await closing).error).toBeUndefined()
    expect(runtime.live.size).toBe(0)
    expect(runtime.removals.length).toBe(2)
  })

  test("close attempts every container, reports failures, and retries only survivors", async () => {
    const first = await manager.acquire(input, alice)
    const second = await manager.acquire(input, bob)
    runtime.removeHook = async (id) => {
      if (id === first.containerId) throw new Error(`secret ${bob.session}`)
    }
    await expect(manager.close()).rejects.toThrow("could not remove all containers")
    expect(runtime.removals).toContain(first.containerId)
    expect(runtime.removals).toContain(second.containerId)
    expect(runtime.live.has(second.containerId)).toBe(false)
    await expect(manager.exec(command(first.container), alice)).rejects.toThrow("closing")
    runtime.removeHook = undefined
    await manager.close()
    expect(runtime.live.size).toBe(0)
    expect(runtime.removals.filter((id) => id === second.containerId).length).toBe(1)
  })

  test("concurrent close calls share cleanup without duplicate removal", async () => {
    await manager.acquire(input, alice)
    const started = deferred<void>()
    const finish = deferred<void>()
    runtime.removeHook = async () => {
      started.resolve(undefined)
      await finish.promise
    }
    const first = observe(manager.close())
    await started.promise
    const second = observe(manager.close())
    finish.resolve(undefined)
    expect((await first).error).toBeUndefined()
    expect((await second).error).toBeUndefined()
    expect(runtime.removals.length).toBe(1)
  })

  test("close drains active exec, rejects queued exec/release/sweep, then removes", async () => {
    const container = await manager.acquire(input, alice)
    const started = deferred<void>()
    const finish = deferred<ExecResult>()
    runtime.execHook = async () => {
      started.resolve(undefined)
      return finish.promise
    }
    const execution = observe(manager.exec(command(container.container), alice))
    await started.promise
    const queuedExec = observe(manager.exec(command(container.container), alice))
    const queuedRelease = observe(manager.release(container.container, alice))
    const queuedSweep = observe(manager.sweep())
    const closing = observe(manager.close())
    expect(runtime.removals).toEqual([])
    finish.resolve(success)
    expect((await execution).value).toEqual(success)
    expect((await queuedExec).error?.message).toContain("closing")
    expect((await queuedRelease).error?.message).toContain("closing")
    expect((await queuedSweep).error?.message).toContain("Container sweep failed")
    expect((await closing).error).toBeUndefined()
    expect(runtime.executions.length).toBe(1)
    expect(runtime.removals.length).toBe(1)
    expect(runtime.live.size).toBe(0)
  })
})
