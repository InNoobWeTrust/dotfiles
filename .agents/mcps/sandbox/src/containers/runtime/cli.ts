/** Engine-pinned lifecycle state and per-image provisioning flights; provisioning helpers stay stateless. */
import { randomUUID } from "node:crypto"
import { realpath, stat } from "node:fs/promises"
import type { ContainerEngine } from "../../execution/contracts.ts"
import { preserveFailure } from "../../execution/diagnostics.ts"
import { CliStageError } from "../../execution/errors.ts"
import { run } from "../../execution/process.ts"
import type {
  ContainerHandle,
  ContainerRuntime,
  ContainerSpec,
  ExecInput,
  ExecResult,
} from "../contracts.ts"
import { ContainerCreationError, ImageProvisioningError } from "../errors.ts"
import { destroyContainer } from "./provisioning/cleanup.ts"
import { verifyConstraints } from "./provisioning/constraints.ts"
import { buildCreateArgs, buildSupervisorScript } from "./provisioning/create.ts"
import {
  assertOk,
  isImageAbsent,
  isNotFound,
  retainCleanupFailure,
} from "./provisioning/results.ts"
import {
  CLI_PREVIEW_BYTES,
  DEADLINE_FILE,
  PACKAGE,
  T_CREATE,
  T_DEADLINE,
  T_INSPECT,
  T_PULL,
  T_START,
  T_STOP,
  WS_TARGET,
} from "./provisioning/settings.ts"

/**
 * Container CLI runtime pinned to one engine chosen at server startup. Every
 * lifecycle operation, helper, and error message uses that exact binary; there
 * is no fallback to the other engine later, including during cleanup.
 */
export class ContainerCliRuntime implements ContainerRuntime {
  private readonly imageProvisioning = new Map<string, Promise<void>>()

  constructor(
    private readonly instance: string,
    private readonly engine: ContainerEngine,
    private readonly execute: typeof run = run,
  ) {}

  /**
   * Ensures the requested image is available locally, pulling from the registry if absent.
   * Shares one in-flight provision per image; map entries are removed on both outcomes.
   * Throws ImageProvisioningError on any non-absence inspect failure or on pull failure.
   */
  private ensureImage(image: string): Promise<void> {
    const inflight = this.imageProvisioning.get(image)
    if (inflight !== undefined) return inflight
    const work = (async () => {
      const inspResult = await this.execute(
        [this.engine, "image", "inspect", "--format", "{{.Id}}", "--", image],
        { wallTimeMs: T_INSPECT, inlineBytes: CLI_PREVIEW_BYTES },
      )
      if (!inspResult.error && inspResult.stop === "exited" && inspResult.exitCode === 0) return
      if (!isImageAbsent(inspResult)) {
        throw new ImageProvisioningError(
          new CliStageError(this.engine, "image inspect", inspResult),
        )
      }
      // Image absent — pull once, no retries.
      const pullResult = await this.execute([this.engine, "pull", "--", image], {
        wallTimeMs: T_PULL,
        inlineBytes: CLI_PREVIEW_BYTES,
      })
      if (!pullResult.error && pullResult.stop === "exited" && pullResult.exitCode === 0) return
      throw new ImageProvisioningError(new CliStageError(this.engine, "image pull", pullResult))
    })().finally(() => {
      this.imageProvisioning.delete(image)
    })
    this.imageProvisioning.set(image, work)
    return work
  }

  /** Creates and verifies an owned container before starting its supervisor.
   * @throws ImageProvisioningError when the image cannot be provisioned (before allocation).
   * @throws ContainerCreationError with the exact cleanup target after a container create attempt.
   */
  async create(spec: ContainerSpec): Promise<ContainerHandle> {
    // Provision image before workspace validation or any allocation tracking.
    await this.ensureImage(spec.image)

    const workspacePath = spec.workspace
    let canonicalWs: string | undefined
    if (workspacePath !== undefined) {
      if (!workspacePath.startsWith("/") || workspacePath === "/" || /[:,\r\n]/.test(workspacePath))
        throw new Error("Workspace must be an absolute non-root directory without mount delimiters")
      canonicalWs = await realpath(workspacePath)
      if (
        canonicalWs === "/" ||
        /[:,\r\n]/.test(canonicalWs) ||
        !(await stat(canonicalWs)).isDirectory()
      )
        throw new Error("Unsafe canonical workspace path")
    }
    const createArgs = buildCreateArgs(spec, canonicalWs, buildSupervisorScript(spec.idleSeconds))

    // A known name preserves the exact cleanup target even if create loses its ID response.
    const name = `agent-sandbox-${randomUUID()}`
    const handle: ContainerHandle = { id: name, imageId: "" }
    try {
      const createResult = await this.execute(
        [this.engine, "create", "--name", name, ...createArgs],
        {
          wallTimeMs: T_CREATE,
          inlineBytes: CLI_PREVIEW_BYTES,
        },
      )
      assertOk(createResult, this.engine, "create")
      const containerId = createResult.stdout.trim()
      if (!containerId || !/^[0-9a-f]+$/.test(containerId) || containerId.length < 12)
        throw new CliStageError(
          this.engine,
          "create response",
          createResult,
          new Error("Engine returned an unexpected container ID."),
        )
      handle.id = containerId

      // Inspect before start — verify all security constraints hold.
      const inspResult = await this.execute(
        [this.engine, "inspect", "--format", "{{json .}}", handle.id],
        { wallTimeMs: T_INSPECT, inlineBytes: CLI_PREVIEW_BYTES },
      )
      assertOk(inspResult, this.engine, "inspect")
      try {
        const raw = inspResult.stdout.trim()
        if (!raw) throw new Error("Engine inspect returned an empty response.")
        const data = JSON.parse(raw) as Record<string, unknown>
        handle.imageId = typeof data.Image === "string" ? data.Image : ""
        verifyConstraints(data, spec, canonicalWs, this.engine)
      } catch (error) {
        throw new CliStageError(this.engine, "inspect verification", inspResult, error)
      }

      // Start the container; supervisor writes its initial deadline and begins polling.
      const startResult = await this.execute([this.engine, "start", handle.id], {
        wallTimeMs: T_START,
        inlineBytes: CLI_PREVIEW_BYTES,
      })
      assertOk(startResult, this.engine, "start")
      return handle
    } catch (error) {
      // The manager owns cleanup retries, including failures before a usable handle is issued.
      throw new ContainerCreationError(handle, error)
    }
  }

  async alive(id: string): Promise<boolean> {
    const r = await this.execute([this.engine, "inspect", "--format", "{{.State.Running}}", id], {
      wallTimeMs: T_INSPECT,
      inlineBytes: CLI_PREVIEW_BYTES,
    })
    if (isNotFound(r)) return false
    assertOk(r, this.engine, "inspect (alive)")
    return r.stdout.trim() === "true"
  }

  async deadline(id: string, seconds: number): Promise<void> {
    if (seconds <= 0) throw new Error("deadline: seconds must be positive")
    const deadlineSeconds = Math.floor(seconds)
    // Write atomically relative to container clock; only the root supervisor owns control.
    const cmd = `printf '%s\\n' "$(( $(date +%s) + ${deadlineSeconds} ))" > ${DEADLINE_FILE}.new && mv ${DEADLINE_FILE}.new ${DEADLINE_FILE}`
    const r = await this.execute([this.engine, "exec", "--user", "0:0", id, "sh", "-c", cmd], {
      wallTimeMs: T_DEADLINE,
      inlineBytes: CLI_PREVIEW_BYTES,
    })
    assertOk(r, this.engine, "exec (deadline)")
  }

  async exec(id: string, input: ExecInput): Promise<ExecResult> {
    const execArgs = [
      "exec",
      "--user",
      `${process.getuid?.() || 1000}:${process.getgid?.() || 1000}`,
      "--workdir",
      WS_TARGET,
      "--env",
      "HOME=/tmp",
      "--env",
      "TMPDIR=/tmp",
      id,
      "sh",
      "-c",
      input.command,
    ]

    // Workload output keeps the fixed shared preview and is always retained in
    // full on disk, so this call passes no inline allowance.
    const processResult = await this.execute([this.engine, ...execArgs], {
      wallTimeMs: input.wallTimeMs,
    })

    if (processResult.stop !== "exited" || processResult.error !== undefined) {
      // Timeout or a real capture failure: destroy the whole container — all
      // concurrent operations are affected. Preview omission never does this.
      let cleanupError: string | undefined
      let failure: unknown = new CliStageError(this.engine, "exec", processResult)
      try {
        await destroyContainer(this.engine, id, this.execute)
      } catch (error) {
        failure = new AggregateError([failure, error], "Container execution and cleanup failed.")
        cleanupError =
          "Container cleanup could not be confirmed; release the lease to retry cleanup. Processes may remain running."
      }
      return {
        ...preserveFailure("container_exec", failure),
        exitCode: processResult.exitCode,
        stdoutPath: processResult.stdoutPath,
        stderrPath: processResult.stderrPath,
        stdoutBytes: processResult.stdoutBytes,
        stderrBytes: processResult.stderrBytes,
        stdout: processResult.stdout,
        stderr: processResult.stderr,
        termination: processResult.stop === "timeout" ? "timeout" : "runtime_error",
        truncated: processResult.truncated,
        containerDestroyed: cleanupError === undefined,
        error:
          cleanupError ??
          `Container ${id} destroyed after exec ${processResult.stop}; ` +
            `all concurrent operations on this container are affected.`,
      }
    }

    // Normal process exit: workload completed (exit code may be non-zero); container survives.
    return {
      ...(processResult.exitCode !== 0
        ? preserveFailure("container_exec", new CliStageError(this.engine, "exec", processResult))
        : {}),
      exitCode: processResult.exitCode,
      stdoutPath: processResult.stdoutPath,
      stderrPath: processResult.stderrPath,
      stdoutBytes: processResult.stdoutBytes,
      stderrBytes: processResult.stderrBytes,
      stdout: processResult.stdout,
      stderr: processResult.stderr,
      termination: "exited",
      truncated: processResult.truncated,
      containerDestroyed: false,
    }
  }

  /** Removes only this instance's container, succeeding only after confirmed absence.
   * @throws On ownership mismatch or unconfirmed cleanup; callers must retain the target for retry.
   */
  async remove(id: string): Promise<void> {
    // Verify ownership before touching the container.
    const labelResult = await this.execute(
      [this.engine, "inspect", "--format", "{{json .Config.Labels}}", id],
      { wallTimeMs: T_INSPECT, inlineBytes: CLI_PREVIEW_BYTES },
    )
    if (isNotFound(labelResult)) return // already gone; idempotent
    assertOk(labelResult, this.engine, "inspect (labels)")

    try {
      const labels = JSON.parse(labelResult.stdout.trim()) as Record<string, string> | null
      const pkgLabel = labels?.[`${PACKAGE}.package`]
      const instLabel = labels?.[`${PACKAGE}.instance`]
      if (pkgLabel !== PACKAGE || instLabel !== this.instance) {
        throw new Error("Refusing to remove a container not owned by this sandbox instance.")
      }
    } catch (error) {
      throw new CliStageError(this.engine, "inspect labels verification", labelResult, error)
    }

    // Stop with a short grace period; errors are tolerated — rm is the authoritative step.
    const stopped = await this.execute([this.engine, "stop", "--time", "2", id], {
      wallTimeMs: T_STOP,
      inlineBytes: CLI_PREVIEW_BYTES,
    })

    const stopError = retainCleanupFailure(stopped, this.engine, "stop")
    try {
      await destroyContainer(this.engine, id, this.execute)
    } catch (error) {
      if (stopError) throw new AggregateError([stopError, error], "Container removal failed.")
      throw error
    }
  }
}
