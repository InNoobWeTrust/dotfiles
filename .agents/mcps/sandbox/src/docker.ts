import { realpath, stat } from "node:fs/promises"
import type {
  ContainerHandle,
  ContainerRuntime,
  ContainerSpec,
  ExecInput,
  ExecResult,
} from "./contracts.ts"
import { run } from "./process.ts"

const PACKAGE = "sandbox"
const CTRL_DIR = "/run/agent-sandbox"
const DEADLINE_FILE = `${CTRL_DIR}/deadline`
const WS_TARGET = "/workspace"

// Control tmpfs: only holds the deadline file; kept minimal and root-only.
const CTRL_TMPFS_BYTES = 65_536 // 64 KiB
const CTRL_TMPFS_INODES = 32
const TMP_TMPFS_INODES = 16_384

// Per-operation timeouts (ms)
const T_CREATE = 60_000
const T_INSPECT = 10_000
const T_START = 30_000
const T_DEADLINE = 10_000
const T_KILL = 5_000
const T_STOP = 15_000
const T_RM = 15_000

// ── internal helpers ────────────────────────────────────────────────────────

type RunResult = Awaited<ReturnType<typeof run>>

/**
 * True only when docker CLI reports the object does not exist.
 * Distinguishes absence from a daemon reachability or permission error.
 */
function isNotFound(r: RunResult): boolean {
  return r.stop === "exited" && r.exitCode !== 0 && /no such (container|object)/i.test(r.stderr)
}

/**
 * Throw a descriptive error when the result is not a clean success.
 * Callers that must distinguish "not found" should check isNotFound first.
 */
function assertOk(r: RunResult, op: string): void {
  if (r.stop === "exited" && r.exitCode === 0) return
  const detail = r.stderr.trim() || r.error || `exit ${r.exitCode} stop=${r.stop}`
  throw new Error(`docker ${op}: ${detail}`)
}

/**
 * Verify that the docker-inspect object matches all declared security
 * constraints and resource budgets. Throws with a combined failure list
 * rather than stopping at the first mismatch.
 */
function verifyConstraints(
  data: Record<string, unknown>,
  spec: ContainerSpec,
  canonicalWs?: string,
): void {
  const hostConfig = (data.HostConfig ?? {}) as Record<string, unknown>
  const failures: string[] = []

  if (hostConfig.ReadonlyRootfs !== true)
    failures.push(`ReadonlyRootfs: expected true, got ${hostConfig.ReadonlyRootfs}`)

  const capDrop = Array.isArray(hostConfig.CapDrop) ? (hostConfig.CapDrop as string[]) : []
  if (!capDrop.some((c) => c.toUpperCase() === "ALL"))
    failures.push(`CapDrop: expected ALL, got ${JSON.stringify(capDrop)}`)

  const secOpt = Array.isArray(hostConfig.SecurityOpt) ? (hostConfig.SecurityOpt as string[]) : []
  if (!secOpt.some((o) => o === "no-new-privileges" || o === "no-new-privileges=true"))
    failures.push(`SecurityOpt: no-new-privileges missing, got ${JSON.stringify(secOpt)}`)

  const netMode = typeof hostConfig.NetworkMode === "string" ? hostConfig.NetworkMode : ""
  // Verify the selected built-in network exactly; do not accept similarly named networks.
  if (netMode !== spec.network)
    failures.push(`NetworkMode: expected ${spec.network}, got ${netMode}`)

  const logType = ((hostConfig.LogConfig ?? {}) as Record<string, unknown>).Type
  if (logType !== "none") failures.push(`LogConfig.Type: expected none, got ${logType}`)

  const tmpfs = (hostConfig.Tmpfs ?? {}) as Record<string, unknown>
  if (!("/tmp" in tmpfs)) failures.push("Tmpfs[/tmp]: absent")
  if (!(CTRL_DIR in tmpfs)) failures.push(`Tmpfs[${CTRL_DIR}]: absent`)

  const binds = Array.isArray(hostConfig.Binds) ? (hostConfig.Binds as string[]) : []
  if (canonicalWs) {
    const wsPrefix = `${canonicalWs}:${WS_TARGET}`
    if (!binds.includes(spec.access === "ro" ? `${wsPrefix}:ro` : wsPrefix))
      failures.push("Requested workspace bind missing")
  } else if (binds.length || !(WS_TARGET in tmpfs)) {
    failures.push("Clean workspace must be tmpfs without host binds")
  }

  if (hostConfig.PidsLimit !== spec.budgets.pids)
    failures.push(`PidsLimit: expected ${spec.budgets.pids}, got ${hostConfig.PidsLimit}`)

  if (hostConfig.Memory !== spec.budgets.memoryBytes)
    failures.push(`Memory: expected ${spec.budgets.memoryBytes}, got ${hostConfig.Memory}`)

  // Docker's total memory+swap budget equal to RAM permits no extra swap.
  const expectedSwap = spec.budgets.memoryBytes
  if (hostConfig.MemorySwap !== expectedSwap)
    failures.push(`MemorySwap: expected ${expectedSwap} (equal swap), got ${hostConfig.MemorySwap}`)

  if (hostConfig.NanoCpus !== Math.round(spec.budgets.cpus * 1e9))
    failures.push("CPU bandwidth differs from request")
  if (hostConfig.Privileged !== false || hostConfig.AutoRemove !== true || hostConfig.Init !== true)
    failures.push("Privilege, init, or auto-remove mismatch")

  const restartPolicy = (hostConfig.RestartPolicy ?? {}) as Record<string, unknown>
  if (restartPolicy.Name !== "no") failures.push("Restart policy mismatch")

  const config = (data.Config ?? {}) as Record<string, unknown>
  if (config.User !== "0:0")
    failures.push("Supervisor must run as root to protect the control directory")

  const mounts = Array.isArray(data.Mounts) ? (data.Mounts as Record<string, unknown>[]) : []
  const hasUnexpectedMount = mounts.some((mount) => {
    if (mount.Type === "volume") return true
    if (mount.Type !== "bind") return false
    return (
      mount.Source !== canonicalWs ||
      mount.Destination !== WS_TARGET ||
      mount.RW !== (spec.access === "rw")
    )
  })
  if (hasUnexpectedMount) failures.push("Unexpected writable volume or bind mount")

  for (const target of ["/tmp", CTRL_DIR, ...(canonicalWs ? [] : [WS_TARGET])]) {
    const flags = String(tmpfs[target] ?? "").split(",")
    const required =
      target === CTRL_DIR ? ["noexec", "nosuid", "nodev"] : ["exec", "nosuid", "nodev"]
    if (!required.every((flag) => flags.includes(flag))) failures.push(`Unsafe tmpfs ${target}`)
  }

  if (failures.length > 0)
    throw new Error(`Container isolation verification failed:\n  ${failures.join("\n  ")}`)
}

/**
 * Root supervisor script embedded as the container's CMD.
 * Writes initial deadline relative to the container clock, polls every second,
 * and exits cleanly on expiry or SIGTERM/SIGINT.
 * idleSeconds is a trusted integer from the validated schema — safe to embed.
 */
function buildSupervisorScript(idleSeconds: number): string {
  const initialSeconds = Math.floor(idleSeconds)
  return `DEADLINE=$(( $(date +%s) + ${initialSeconds} ))
printf '%s\\n' "$DEADLINE" > ${DEADLINE_FILE} || exit 1
trap 'exit 0' TERM INT
while true
do
  now=$(date +%s)
  dl=$(cat ${DEADLINE_FILE} 2>/dev/null)
   case "$dl" in ''|*[!0-9]*) exit 1 ;; esac
  [ "$now" -ge "$dl" ] && exit 0
  sleep 1
done`
}

function buildCreateArgs(
  spec: ContainerSpec,
  canonicalWs: string | undefined,
  supervisorScript: string,
): string[] {
  const { budgets, network, image, access } = spec
  const workspaceArgs = canonicalWs
    ? ["-v", `${canonicalWs}:${WS_TARGET}${access === "ro" ? ":ro" : ""}`]
    : [
        "--tmpfs",
        `${WS_TARGET}:rw,exec,nosuid,nodev,size=${budgets.tmpfsBytes},mode=1777,nr_inodes=${TMP_TMPFS_INODES}`,
      ]
  // Deliverables built in container scratch must be runnable; privilege controls
  // remain nosuid/nodev, cap-drop, no-new-privileges and the container boundary.
  const tmpTmpfs = `/tmp:rw,exec,nosuid,nodev,size=${budgets.tmpfsBytes},mode=1777,nr_inodes=${TMP_TMPFS_INODES}`
  const ctrlTmpfs = `${CTRL_DIR}:rw,noexec,nosuid,nodev,size=${CTRL_TMPFS_BYTES},mode=0700,nr_inodes=${CTRL_TMPFS_INODES}`

  return [
    "--pull=never",
    "--init",
    "--rm",
    "--restart=no",
    "--read-only",
    "--user",
    "0:0",
    "--stop-signal",
    "SIGTERM",
    "--cap-drop",
    "ALL",
    "--security-opt",
    "no-new-privileges=true",
    "--network",
    network,
    "--cpus",
    String(budgets.cpus),
    "--memory",
    String(budgets.memoryBytes),
    "--memory-swap",
    String(budgets.memoryBytes),
    "--pids-limit",
    String(budgets.pids),
    "--log-driver",
    "none",
    "--tmpfs",
    tmpTmpfs,
    "--tmpfs",
    ctrlTmpfs,
    ...workspaceArgs,
    "--label",
    `${PACKAGE}.package=${PACKAGE}`,
    "--label",
    `${PACKAGE}.instance=${spec.instance}`,
    "--entrypoint",
    "sh",
    image,
    "-c",
    supervisorScript,
  ]
}

/**
 * Terminate the exact container and confirm removal, including auto-remove races.
 */
async function destroyContainer(id: string): Promise<void> {
  await run(["docker", "kill", id], { wallTimeMs: T_KILL })
  const removed = await run(["docker", "rm", "--force", id], { wallTimeMs: T_RM })
  if (isNotFound(removed)) return
  // --rm and explicit removal can race. Only observed absence proves cleanup,
  // not the CLI acknowledgement or an "already removing" error.
  const end = Date.now() + 5000
  do {
    const remaining = await run(["docker", "inspect", "--format", "{{.Id}}", id], {
      wallTimeMs: T_INSPECT,
    })
    if (isNotFound(remaining)) return
    assertOk(remaining, "cleanup confirmation")
    await new Promise((resolve) => setTimeout(resolve, 100))
  } while (Date.now() < end)
  throw new Error("Container removal was not confirmed")
}

// ── exported class ───────────────────────────────────────────────────────────

export class DockerRuntime implements ContainerRuntime {
  constructor(private readonly instance: string) {}

  async create(spec: ContainerSpec): Promise<ContainerHandle> {
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

    // Create container (does not start it).
    const createResult = await run(["docker", "create", ...createArgs], { wallTimeMs: T_CREATE })
    assertOk(createResult, "create")
    const containerId = createResult.stdout.trim()
    if (!containerId || !/^[0-9a-f]+$/.test(containerId) || containerId.length < 12)
      throw new Error(`docker create: unexpected container ID: "${containerId.slice(0, 80)}"`)

    // Inspect before start — verify all security constraints hold.
    let imageId: string
    try {
      const inspResult = await run(["docker", "inspect", "--format", "{{json .}}", containerId], {
        wallTimeMs: T_INSPECT,
      })
      assertOk(inspResult, "inspect")
      const raw = inspResult.stdout.trim()
      if (!raw) throw new Error("docker inspect: empty response")
      const data = JSON.parse(raw) as Record<string, unknown>
      imageId = typeof data.Image === "string" ? data.Image : ""
      verifyConstraints(data, spec, canonicalWs)
    } catch (err) {
      // Clean up the created (not-yet-started) container before re-throwing.
      await run(["docker", "rm", containerId], { wallTimeMs: T_RM })
      throw err
    }

    // Start the container; supervisor writes its initial deadline and begins polling.
    const startResult = await run(["docker", "start", containerId], { wallTimeMs: T_START })
    if (startResult.stop !== "exited" || startResult.exitCode !== 0) {
      await run(["docker", "rm", "--force", containerId], { wallTimeMs: T_RM })
      const detail =
        startResult.stderr.trim() || startResult.error || `exit ${startResult.exitCode}`
      throw new Error(`docker start: ${detail}`)
    }

    return { id: containerId, imageId }
  }

  async alive(id: string): Promise<boolean> {
    const r = await run(["docker", "inspect", "--format", "{{.State.Running}}", id], {
      wallTimeMs: T_INSPECT,
    })
    if (isNotFound(r)) return false
    assertOk(r, "inspect (alive)")
    return r.stdout.trim() === "true"
  }

  async deadline(id: string, seconds: number): Promise<void> {
    if (seconds <= 0) throw new Error("deadline: seconds must be positive")
    const deadlineSeconds = Math.floor(seconds)
    // Write atomically relative to container clock; only the root supervisor owns control.
    const cmd = `printf '%s\\n' "$(( $(date +%s) + ${deadlineSeconds} ))" > ${DEADLINE_FILE}.new && mv ${DEADLINE_FILE}.new ${DEADLINE_FILE}`
    const r = await run(["docker", "exec", "--user", "0:0", id, "sh", "-c", cmd], {
      wallTimeMs: T_DEADLINE,
    })
    assertOk(r, "exec (deadline)")
  }

  async exec(id: string, input: ExecInput): Promise<ExecResult> {
    const dockerArgs = [
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

    const processResult = await run(["docker", ...dockerArgs], {
      wallTimeMs: input.wallTimeMs,
      maxOutputBytes: input.maxOutputBytes,
    })

    if (
      processResult.stop === "timeout" ||
      processResult.stop === "output_limit" ||
      processResult.error
    ) {
      // Destroy the whole container — all concurrent operations are affected.
      let cleanupError: string | undefined
      try {
        await destroyContainer(id)
      } catch {
        cleanupError =
          "Container cleanup could not be confirmed; release the lease to retry cleanup. Processes may remain running."
      }
      return {
        exitCode: processResult.exitCode,
        stdout: processResult.stdout,
        stderr: processResult.stderr,
        termination: processResult.stop === "exited" ? "runtime_error" : processResult.stop,
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
      exitCode: processResult.exitCode,
      stdout: processResult.stdout,
      stderr: processResult.stderr,
      termination: "exited",
      truncated: processResult.truncated,
      containerDestroyed: false,
    }
  }

  async remove(id: string): Promise<void> {
    // Verify ownership before touching the container.
    const labelResult = await run(
      ["docker", "inspect", "--format", "{{json .Config.Labels}}", id],
      { wallTimeMs: T_INSPECT },
    )
    if (isNotFound(labelResult)) return // already gone; idempotent
    assertOk(labelResult, "inspect (labels)")

    const labels = JSON.parse(labelResult.stdout.trim()) as Record<string, string> | null
    const pkgLabel = labels?.[`${PACKAGE}.package`]
    const instLabel = labels?.[`${PACKAGE}.instance`]
    if (pkgLabel !== PACKAGE || instLabel !== this.instance) {
      throw new Error(
        `Refusing to remove container ${id}: not owned by ${PACKAGE}/${this.instance} ` +
          `(package=${pkgLabel}, instance=${instLabel})`,
      )
    }

    // Stop with a short grace period; errors are tolerated — rm is the authoritative step.
    await run(["docker", "stop", "--time", "2", id], { wallTimeMs: T_STOP })

    const rmResult = await run(["docker", "rm", id], { wallTimeMs: T_RM })
    if (isNotFound(rmResult)) return // container removed by stop or auto-rm (--rm flag); done
    assertOk(rmResult, "rm")
  }
}
