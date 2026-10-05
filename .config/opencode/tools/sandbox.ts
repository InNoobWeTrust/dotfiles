import { tool } from "@opencode-ai/plugin"
import path from "path"

export default tool({
  description:
    "Execute shell commands inside an isolated Bubblewrap (bwrap) sandbox. Use this tool for running shell commands with safety sandboxing and fault detection. Different modes provide different levels of filesystem and network isolation, with full support for login shell environment inheritance.",
  args: {
    command: tool.schema
      .string()
      .describe("The shell command to execute inside the sandbox"),
    mode: tool.schema
      .enum(["ro", "rw", "pure"])
      .default("ro")
      .describe(
        "Sandbox isolation mode:\n" +
          "- 'ro' (default, Strict Read-Only): System root and working directory are strictly read-only, network enabled. Ideal for safe inspection (git status/diff, rg, cat, dry-runs, log reading). Catches unexpected side-effects.\n" +
          "- 'rw' (Workspace Writable): System root is read-only, but working directory is writable. Network enabled. For builds, tests, linters with --fix bounded to current project.\n" +
          "- 'pure' (Air-Gapped Offline): Both system and working directory are read-only, network completely disabled. For untrusted code execution."
      ),
    login: tool.schema
      .boolean()
      .default(true)
      .describe(
        "Whether to execute via the user's login shell ($SHELL -l -c) to inherit profile environment variables, user configuration, and PATH entries. Defaults to true. Set to false to run a clean, non-login subshell."
      ),
    shell: tool.schema
      .string()
      .optional()
      .describe(
        "Explicit shell binary path to execute inside the sandbox (defaults to $SHELL or /bin/sh)."
      ),
    env: tool.schema
      .record(tool.schema.string(), tool.schema.string())
      .optional()
      .describe(
        "Optional key-value environment variables to inject into the sandbox."
      ),
    workdir: tool.schema
      .string()
      .optional()
      .describe(
        "Working directory for the command. Defaults to the current session directory."
      ),
  },
  async execute(args, context) {
    const cwd = path.resolve(args.workdir || context?.directory || process.cwd())

    // 1. Probe for bwrap availability
    const bwrapBin = Bun.which("bwrap")
    if (!bwrapBin) {
      return (
        "bwrap: Bubblewrap executable not found or not supported on this platform.\n" +
        `Current OS/Platform: ${process.platform} (${process.arch})\n` +
        "Note: bwrap requires unprivileged Linux user namespaces (Linux distributions, Dev Containers, WSL2, or Docker).\n" +
        "If running on macOS, execute read-only commands directly or run inside a Linux devcontainer."
      )
    }

    // 2. Build sandbox arguments
    const bwrapArgs: string[] = [
      "--ro-bind", "/", "/",
      "--dev", "/dev",
      "--proc", "/proc",
      "--tmpfs", "/tmp",
      "--tmpfs", "/var/tmp",
      "--unshare-all",
      "--die-with-parent",
      "--chdir", cwd,
    ]

    switch (args.mode) {
      case "rw":
        // System read-only, but current working directory is writable
        bwrapArgs.push("--bind", cwd, cwd)
        bwrapArgs.push("--share-net")
        break
      case "pure":
        // Offline air-gapped: network namespace remains unshared (offline)
        break
      case "ro":
      default:
        // Strict read-only everywhere, network enabled
        bwrapArgs.push("--share-net")
        break
    }

    // Set custom environment variables if provided
    if (args.env) {
      for (const [key, value] of Object.entries(args.env)) {
        bwrapArgs.push("--setenv", key, value)
      }
    }

    // 3. Resolve shell execution (login shell vs standard subshell)
    const userShell = args.shell || process.env.SHELL || "/bin/sh"
    const isLogin = args.login !== false
    const shellArgs = isLogin
      ? [userShell, "-l", "-c", args.command]
      : [userShell, "-c", args.command]

    bwrapArgs.push("--", ...shellArgs)

    // 4. Execute inside the sandbox
    try {
      const proc = Bun.spawn([bwrapBin, ...bwrapArgs], {
        cwd,
        env: process.env,
        stdout: "pipe",
        stderr: "pipe",
      })

      const stdout = (await new Response(proc.stdout).text()).trim()
      const stderr = (await new Response(proc.stderr).text()).trim()
      const exitCode = await proc.exited

      if (exitCode !== 0) {
        let output = ""
        if (stdout) output += `${stdout}\n`
        if (stderr) output += `${stderr}\n`
        output += `Command exited with status ${exitCode}`

        // Detect sandbox protection triggers
        if (
          stderr.includes("Read-only file system") ||
          stderr.includes("Operation not permitted")
        ) {
          output +=
            "\n\n[SANDBOX PROTECTION TRIGGERED]: The command attempted to mutate a read-only filesystem path. " +
            "This confirms unexpected write side-effects. Debug the command to run with read-only flags (e.g. --dry-run, caching in /tmp), " +
            "or switch to mode='rw' if modifying files in the current workspace is intentionally required."
        }

        return output
      }

      if (stdout) return stdout
      if (stderr) return `[stderr]:\n${stderr}`
      return "Command completed successfully (exit code 0, no output)."
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      return `Failed to execute bwrap sandbox: ${message}`
    }
  },
})
