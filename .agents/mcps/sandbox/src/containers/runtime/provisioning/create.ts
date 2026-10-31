/** Build container creation argv and its root supervisor script without process effects. */
import type { ContainerSpec } from "../../contracts.ts"
import { CTRL_DIR, CTRL_TMPFS_BYTES, DEADLINE_FILE, PACKAGE, WS_TARGET } from "./settings.ts"

/**
 * Root supervisor script embedded as the container's CMD.
 * Writes initial deadline relative to the container clock, polls every second,
 * and exits cleanly on expiry or SIGTERM/SIGINT.
 * idleSeconds is a trusted integer from the validated schema — safe to embed.
 */
export function buildSupervisorScript(idleSeconds: number): string {
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

export function buildCreateArgs(
  spec: ContainerSpec,
  canonicalWs: string | undefined,
  supervisorScript: string,
): string[] {
  const { budgets, network, image, access } = spec
  const workspaceArgs = canonicalWs
    ? ["-v", `${canonicalWs}:${WS_TARGET}${access === "ro" ? ":ro" : ""}`]
    : ["--tmpfs", `${WS_TARGET}:rw,exec,nosuid,nodev,size=${budgets.tmpfsBytes},mode=1777`]
  // Deliverables built in container scratch must be runnable; privilege controls
  // remain nosuid/nodev, cap-drop, no-new-privileges and the container boundary.
  const tmpTmpfs = `/tmp:rw,exec,nosuid,nodev,size=${budgets.tmpfsBytes},mode=1777`
  const ctrlTmpfs = `${CTRL_DIR}:rw,noexec,nosuid,nodev,size=${CTRL_TMPFS_BYTES},mode=0700`

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
