import { randomBytes } from "node:crypto"
import type {
  AcquireInput,
  ContainerHandle,
  ContainerRuntime,
  ContainerView,
  ExecInput,
  ExecResult,
  Owner,
} from "./contracts.ts"

type Container = {
  handle: ContainerHandle
  input: AcquireInput
  session: string
  token?: string
  expiresAt: number
  state: "running" | "missing"
  queue: Promise<void>
}

const EXEC_GRACE_SECONDS = 5
const UNAVAILABLE =
  "Container unavailable: expired, released, or not owned by this session. Acquire a fresh container."
const IDLE_REFRESH_FAILED =
  "Execution completed, but the container inactivity deadline could not be reset. Execution side effects may have occurred; do not blindly retry the command."

/** Owns independent session-bound containers and serializes their runtime effects. */
export class ContainerManager {
  private readonly containers = new Set<Container>()
  private readonly handles = new Map<string, Container>()
  private readonly acquisitions = new Set<Promise<ContainerView>>()
  private closing = false
  private closeTask: Promise<void> | undefined

  /** @param runtime Bounded container adapter. @param instance Labels this manager's containers. */
  constructor(
    private readonly runtime: ContainerRuntime,
    private readonly instance: string,
  ) {}

  /** Creates a distinct container with an opaque handle. @throws On shutdown or runtime failure. */
  async acquire(input: AcquireInput, owner: Owner): Promise<ContainerView> {
    this.ensureOpen()
    const task = this.createContainer({ ...input, budgets: { ...input.budgets } }, owner.session)
    this.acquisitions.add(task)
    try {
      return await task
    } finally {
      this.acquisitions.delete(task)
    }
  }

  /** Executes exclusively, extending the deadline first and resetting inactivity afterward.
   * @throws Before execution on expired/wrong-session handles or runtime setup failures.
   * Completed results retain their streams and side-effect evidence if idle refresh fails.
   */
  async exec(input: ExecInput, owner: Owner): Promise<ExecResult> {
    this.ensureOpen()
    const request = { ...input }
    const session = owner.session
    const container = this.handles.get(request.container)
    if (!container) throw new Error(UNAVAILABLE)
    return this.serialize(container, async () => {
      this.ensureOpen()
      this.authorize(container, request.container, session)
      await this.requireRunning(container)
      const seconds = Math.max(
        container.input.idleSeconds,
        Math.ceil(request.wallTimeMs / 1000) + EXEC_GRACE_SECONDS,
      )
      const expiresAt = Math.max(container.expiresAt, Date.now() + seconds * 1000)
      await this.commitDeadline(container, request.container, session, expiresAt)
      const result = await this.effect(
        () => this.runtime.exec(container.handle.id, request),
        "Container execution failed; side effects may have occurred. Do not blindly retry the command.",
      )
      if (result.containerDestroyed) {
        container.state = "missing"
        return result
      }
      try {
        await this.commitDeadline(
          container,
          request.container,
          session,
          Date.now() + container.input.idleSeconds * 1000,
        )
        return result
      } catch {
        // The command already ran: a deadline failure must not erase its output or exit code.
        return {
          ...result,
          termination: "runtime_error",
          error: result.error ? `${result.error} ${IDLE_REFRESH_FAILED}` : IDLE_REFRESH_FAILED,
        }
      }
    })
  }

  /** Removes the owner's container, including expired handles. Failure retains the handle for retry.
   * @returns Whether a tracked container was removed; repeated release is idempotent.
   * @throws On wrong session, shutdown, or failed removal.
   */
  async release(token: string, owner: Owner): Promise<{ released: boolean }> {
    this.ensureOpen()
    const session = owner.session
    const container = this.handles.get(token)
    if (!container) return { released: false }
    return this.serialize(container, async () => {
      this.ensureOpen()
      if (this.handles.get(token) !== container) return { released: false }
      if (container.session !== session) throw new Error(UNAVAILABLE)
      await this.remove(container)
      return { released: true }
    })
  }

  /** Rejects new/queued work, drains active work, and removes every owned container.
   * @throws If any cleanup fails; subsequent close calls retry surviving containers.
   */
  async close(): Promise<void> {
    this.closing = true
    if (!this.closeTask) {
      this.closeTask = this.closeAll().finally(() => {
        this.closeTask = undefined
      })
    }
    return this.closeTask
  }

  /** Removes time-expired containers and failed acquisition cleanup, not merely UI-idle ones.
   * @throws On shutdown or cleanup failure; failures remain tracked for retry.
   */
  async sweep(): Promise<void> {
    this.ensureOpen()
    const results = await Promise.allSettled(
      [...this.containers].map((container) =>
        this.serialize(container, async () => {
          this.ensureOpen()
          if (!this.containers.has(container)) return
          if (!container.token || container.expiresAt <= Date.now()) await this.remove(container)
        }),
      ),
    )
    if (results.some((result) => result.status === "rejected"))
      throw new Error("Container sweep failed for one or more containers; retry sweep.")
  }

  private async createContainer(input: AcquireInput, session: string): Promise<ContainerView> {
    const handle = await this.effect(
      () => this.runtime.create({ ...input, instance: this.instance }),
      "Container creation failed. Check Docker connectivity, local image availability, workspace path/permissions, and image compatibility before retrying.",
    )
    const container: Container = {
      handle,
      input,
      session,
      expiresAt: 0,
      state: "running",
      queue: Promise.resolve(),
    }
    this.containers.add(container)
    // Initialization occupies the queue before sweep can observe a temporarily tokenless container.
    return this.serialize(container, async () => {
      try {
        this.ensureOpen()
        const expiresAt = Date.now() + input.idleSeconds * 1000
        await this.setDeadline(container, expiresAt)
        this.ensureOpen()
        if (expiresAt <= Date.now()) throw new Error(UNAVAILABLE)
        const token = this.newToken()
        container.token = token
        container.expiresAt = expiresAt
        this.handles.set(token, container)
        return {
          container: token,
          containerId: handle.id,
          imageId: handle.imageId,
          workspace: input.workspace,
          access: input.access,
          network: input.network,
          budgets: { ...input.budgets },
          expiresAt: new Date(expiresAt).toISOString(),
        }
      } catch {
        try {
          await this.remove(container)
        } catch {
          throw new Error(
            "Container acquisition failed and container cleanup failed; no handle was issued. Automatic sweep will retry tracked cleanup. Close the MCP connection to request shutdown; the container deadline is the fallback after server loss.",
          )
        }
        throw new Error("Container acquisition failed or manager is closing; no handle was issued.")
      }
    })
  }

  private serialize<T>(container: Container, operation: () => Promise<T>): Promise<T> {
    const task = container.queue.then(operation)
    // Queue recovery leaves the caller's rejection intact and lets later cleanup proceed.
    container.queue = task.then(
      () => {},
      () => {},
    )
    return task
  }

  private authorize(container: Container, token: string, session: string): void {
    if (
      this.handles.get(token) !== container ||
      container.session !== session ||
      container.expiresAt <= Date.now()
    ) {
      throw new Error(UNAVAILABLE)
    }
  }

  private async commitDeadline(
    container: Container,
    token: string,
    session: string,
    expiresAt: number,
  ): Promise<void> {
    this.authorize(container, token, session)
    await this.setDeadline(container, expiresAt)
    // Expiry during an external call cannot resurrect execution rights.
    this.authorize(container, token, session)
    if (expiresAt <= Date.now()) throw new Error(UNAVAILABLE)
    container.expiresAt = expiresAt
  }

  private async setDeadline(container: Container, expiresAt: number): Promise<void> {
    const seconds = Math.max(1, Math.ceil((expiresAt - Date.now()) / 1000))
    await this.effect(
      () => this.runtime.deadline(container.handle.id, seconds),
      "Container deadline update failed; expiry change was not committed. Retry only while the handle is live.",
    )
  }

  private async requireRunning(container: Container): Promise<void> {
    if (container.state === "running") {
      const alive = await this.effect(
        () => this.runtime.alive(container.handle.id),
        "Container liveness check failed; retry while the handle is live.",
      )
      if (!alive) container.state = "missing"
    }
    if (container.state === "missing")
      throw new Error(
        "Container is missing; acquire a fresh container. Releasing the old handle is optional cleanup.",
      )
  }

  private async remove(container: Container): Promise<void> {
    await this.effect(
      () => this.runtime.remove(container.handle.id),
      "Container removal failed; retry release or cleanup.",
    )
    if (container.token) this.handles.delete(container.token)
    this.containers.delete(container)
  }

  private async closeAll(): Promise<void> {
    // Acquisition callers receive their failures; any survivors remain in the tracked set.
    await Promise.allSettled([...this.acquisitions])
    const results = await Promise.allSettled(
      [...this.containers].map((container) =>
        this.serialize(container, async () => {
          if (this.containers.has(container)) await this.remove(container)
        }),
      ),
    )
    if (results.some((result) => result.status === "rejected"))
      throw new Error("Manager close could not remove all containers; retry close.")
  }

  private newToken(): string {
    let token: string
    do {
      token = randomBytes(32).toString("hex")
    } while (this.handles.has(token))
    return token
  }

  private ensureOpen(): void {
    if (this.closing)
      throw new Error(
        "Container manager is closing; start a new server session to acquire a container.",
      )
  }

  private async effect<T>(operation: () => Promise<T>, message: string): Promise<T> {
    try {
      return await operation()
    } catch {
      // Runtime diagnostics can contain commands, paths, or another session's secrets.
      throw new Error(message)
    }
  }
}
