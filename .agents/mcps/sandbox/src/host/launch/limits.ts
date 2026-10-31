/** Install inherited hard ceilings in a child launcher, never in the MCP server. */
import type { ResourceLimits } from "../protocol/contracts.ts"

export function buildLimitedLaunch(
  sandboxArgs: string[],
  limits: ResourceLimits,
  isMac: boolean,
  readyFile: string,
): string[] {
  // A marker in the private invocation scratch directory avoids extra-pipe races in Bun.
  // The path and command are positional arguments, never interpolated shell code.
  const ready = 'printf ready > "$1" || exit 125; shift; exec "$@"'
  if (!isMac) {
    const prlimit = Bun.which("prlimit")
    if (!prlimit) throw new Error("prlimit unavailable; refusing execution without resource limits")
    const args = [
      prlimit,
      `--cpu=${limits.cpuSeconds}:${limits.cpuHardSeconds}`,
      `--fsize=${limits.maxFileBytes}:${limits.maxFileBytes}`,
      `--nofile=${limits.maxOpenFiles}:${limits.maxOpenFiles}`,
      `--core=${limits.coreBytes}:${limits.coreBytes}`,
    ]
    if (limits.maxProcesses !== undefined)
      args.push(`--nproc=${limits.maxProcesses}:${limits.maxProcesses}`)
    if (limits.addressSpaceBytes !== undefined)
      args.push(`--as=${limits.addressSpaceBytes}:${limits.addressSpaceBytes}`)
    return [...args, "--", "/bin/sh", "-c", ready, "sandbox-launcher", readyFile, ...sandboxArgs]
  }
  if (limits.addressSpaceBytes !== undefined) {
    throw new Error(
      "addressSpaceBytes is Linux-only; macOS has no verified equivalent memory ceiling",
    )
  }
  const setup = [
    `ulimit -S -H -t ${limits.cpuHardSeconds}`,
    `ulimit -S -t ${limits.cpuSeconds}`,
    // Apple's /bin/sh uses 1024-byte blocks for file/core limits.
    `ulimit -S -H -f ${limits.maxFileBytes / 1024}`,
    `ulimit -S -H -n ${limits.maxOpenFiles}`,
    `ulimit -S -H -c ${limits.coreBytes / 1024}`,
  ]
  if (limits.maxProcesses !== undefined) setup.push(`ulimit -S -H -u ${limits.maxProcesses}`)
  // Braces keep limits in the exec'ing shell rather than a subshell.
  return [
    "/bin/sh",
    "-c",
    `{ ${setup.join(" && ")}; } || exit 125; ${ready}`,
    "sandbox-launcher",
    readyFile,
    ...sandboxArgs,
  ]
}
