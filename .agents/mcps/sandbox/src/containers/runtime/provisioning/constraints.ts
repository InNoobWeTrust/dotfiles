/** Verify engine inspection against the declared container isolation, mounts and resource budgets. */
import type { ContainerEngine } from "../../../execution/contracts.ts"
import type { ContainerSpec } from "../../contracts.ts"
import { CTRL_DIR, WS_TARGET } from "./settings.ts"

/** Check the declared workspace bind without assuming engines serialize its options identically. */
function isValidWorkspaceBind(binds: unknown, canonicalWs: string, access: "ro" | "rw"): boolean {
  if (!Array.isArray(binds) || binds.length !== 1 || typeof binds[0] !== "string") return false
  const fields = binds[0].split(":")
  if (
    fields.length < 2 ||
    fields.length > 3 ||
    fields[0] !== canonicalWs ||
    fields[1] !== WS_TARGET
  )
    return false
  if (fields.length === 2) return access === "rw"

  const options = fields[2].split(",")
  const allowed = new Set(["ro", "rw", "rprivate", "rbind"])
  if (options.some((option) => !option || !allowed.has(option))) return false
  if (new Set(options).size !== options.length) return false
  const accessModes = options.filter((option) => option === "ro" || option === "rw")
  return accessModes.length <= 1 && (accessModes[0] ?? "rw") === access
}

/**
 * Verify that the engine-inspect object matches all declared security
 * constraints and resource budgets. Throws with a combined failure list
 * rather than stopping at the first mismatch. Docker uses CapDrop ALL;
 * Podman with --cap-drop ALL reports null for EffectiveCaps and BoundingCaps.
 */
export function verifyConstraints(
  data: Record<string, unknown>,
  spec: ContainerSpec,
  canonicalWs?: string,
  engine?: ContainerEngine,
): void {
  const hostConfig = (data.HostConfig ?? {}) as Record<string, unknown>
  const failures: string[] = []

  if (hostConfig.ReadonlyRootfs !== true)
    failures.push(`ReadonlyRootfs: expected true, got ${hostConfig.ReadonlyRootfs}`)

  if (engine === "podman") {
    // Podman expands --cap-drop ALL into a list of cap names; use EffectiveCaps and
    // BoundingCaps instead. Both must be present and each null or empty array.
    const isNullOrEmpty = (v: unknown): boolean =>
      v === null || (Array.isArray(v) && (v as unknown[]).length === 0)
    const eff = Object.hasOwn(data, "EffectiveCaps") ? data.EffectiveCaps : undefined
    const bnd = Object.hasOwn(data, "BoundingCaps") ? data.BoundingCaps : undefined
    if (!isNullOrEmpty(eff))
      failures.push(
        `EffectiveCaps: Podman --cap-drop ALL requires null or empty array, got ${JSON.stringify(eff)}`,
      )
    if (!isNullOrEmpty(bnd))
      failures.push(
        `BoundingCaps: Podman --cap-drop ALL requires null or empty array, got ${JSON.stringify(bnd)}`,
      )
  } else {
    const capDrop = Array.isArray(hostConfig.CapDrop) ? (hostConfig.CapDrop as string[]) : []
    if (!capDrop.some((c) => c.toUpperCase() === "ALL"))
      failures.push(`CapDrop: expected ALL, got ${JSON.stringify(capDrop)}`)
  }

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

  if (canonicalWs) {
    if (!isValidWorkspaceBind(hostConfig.Binds, canonicalWs, spec.access))
      failures.push("Requested workspace bind missing")
  } else {
    const binds = Array.isArray(hostConfig.Binds) ? hostConfig.Binds : []
    if (binds.length || !(WS_TARGET in tmpfs))
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
  if (
    canonicalWs &&
    !mounts.some(
      (mount) =>
        mount.Type === "bind" && mount.Source === canonicalWs && mount.Destination === WS_TARGET,
    )
  )
    failures.push("Requested workspace mount missing")

  for (const target of ["/tmp", CTRL_DIR, ...(canonicalWs ? [] : [WS_TARGET])]) {
    const flags = String(tmpfs[target] ?? "").split(",")
    const required =
      target === CTRL_DIR ? ["noexec", "nosuid", "nodev"] : ["exec", "nosuid", "nodev"]
    if (!required.every((flag) => flags.includes(flag))) failures.push(`Unsafe tmpfs ${target}`)
  }

  if (failures.length > 0)
    throw new Error(`Container isolation verification failed:\n  ${failures.join("\n  ")}`)
}
