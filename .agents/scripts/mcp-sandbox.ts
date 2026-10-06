#!/usr/bin/env bun
/**
 * MCP command sandbox: Bubblewrap on Linux, Seatbelt (sandbox-exec) on macOS.
 * Both expose host files for reading; this is not a clean hostile-code environment.
 * Exposes the 'sandbox' tool across all MCP-compatible AI agent harnesses:
 * Claude Code, OpenAI Codex, Google Antigravity (AGY), OpenCode, Cursor, and Kilo.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"
import path from "path"
import { mkdtemp, realpath, rm } from "node:fs/promises"
import { tmpdir } from "node:os"

const server = new McpServer({
  name: "sandbox",
  version: "1.0.0",
})

server.tool(
  "sandbox",
  "Execute shell commands with Bubblewrap on Linux or deprecated sandbox-exec on macOS. Supports ro (read-only), rw (workspace writable), and pure (offline read-only), with writable scratch space. Host files and inherited environment remain readable; not a clean environment for hostile code.",
  {
    command: z
      .string()
      .describe("The shell command line to execute inside the sandbox"),
    mode: z
      .enum(["ro", "rw", "pure"])
      .default("ro")
      .describe(
        "Sandbox isolation mode:\n" +
          "- 'ro' (default): Host and workspace writes denied; network allowed. Scratch space remains writable.\n" +
          "- 'rw': Workspace and scratch writes allowed; other host writes denied. Network allowed.\n" +
          "- 'pure': Like ro, with network denied. Host files remain readable.\n" +
          "macOS uses a private $TMPDIR, not isolated /tmp mounts; writes hard-coded to /tmp may fail."
      ),
    login: z
      .boolean()
      .default(true)
      .describe(
        "Whether to execute via the user's login shell ($SHELL -l -c) to inherit profile environment variables, user configuration, and PATH entries. Defaults to true. Set to false to skip login profiles; the process environment is still inherited."
      ),
    shell: z
      .string()
      .optional()
      .describe(
        "Explicit shell binary path to execute inside the sandbox (defaults to $SHELL or /bin/sh)."
      ),
    env: z
      .record(z.string(), z.string())
      .optional()
      .describe(
        "Optional key-value environment variables to inject into the sandbox."
      ),
    workdir: z
      .string()
      .optional()
      .describe(
        "Working directory for the command. Defaults to current working directory."
      ),
  },
  async ({ command, mode, login, shell, env, workdir }) => {
    const cwd = path.resolve(workdir || process.cwd())
    const isMac = process.platform === "darwin"
    const backend = isMac ? "sandbox-exec" : "bwrap"
    const sandboxBin = Bun.which(backend)
    if (!sandboxBin || (!isMac && process.platform !== "linux")) {
      return {
        content: [{ type: "text", text: `Sandbox backend unavailable: ${backend} on ${process.platform}. Refusing unsandboxed execution.` }],
        isError: true,
      }
    }
    let tempDir: string | undefined

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

    switch (mode) {
      case "rw":
        // System read-only, working directory is writable
        bwrapArgs.push("--bind", cwd, cwd)
        bwrapArgs.push("--share-net")
        break
      case "pure":
        // Offline air-gapped: network namespace remains unshared
        break
      case "ro":
      default:
        // Strict read-only everywhere, network enabled
        bwrapArgs.push("--share-net")
        break
    }

    // Set custom environment variables if provided
    if (env) {
      for (const [key, value] of Object.entries(env)) {
        bwrapArgs.push("--setenv", key, value)
      }
    }

    // 3. Resolve shell execution (login shell vs standard subshell)
    const userShell = shell || process.env.SHELL || "/bin/sh"
    const isLogin = login !== false
    const shellArgs = isLogin
      ? [userShell, "-l", "-c", command]
      : [userShell, "-c", command]

    bwrapArgs.push("--", ...shellArgs)

    // Both backends inherit the environment. macOS has no private mounts;
    // only its per-invocation scratch directory is writable outside the workspace.
    try {
      let sandboxArgs = bwrapArgs
      let childEnv = { ...process.env, ...env }
      if (isMac) {
        tempDir = await mkdtemp(path.join(tmpdir(), "sandbox-"))
        const canonicalTemp = await realpath(tempDir)
        const canonicalCwd = await realpath(cwd)
        const profile = path.resolve(import.meta.dir, "../../.config/sandbox/command.sb")
        sandboxArgs = [
          "-D", `MODE=${mode}`,
          "-D", `WORKSPACE=${canonicalCwd}`,
          "-D", `TEMP_DIR=${canonicalTemp}`,
          "-f", profile,
          ...shellArgs,
        ]
        childEnv = { ...childEnv, TMPDIR: canonicalTemp, TMP: canonicalTemp, TEMP: canonicalTemp }
      }
      const proc = Bun.spawn([sandboxBin, ...sandboxArgs], {
        cwd,
        env: childEnv,
        stdout: "pipe",
        stderr: "pipe",
      })

      // Drain both streams concurrently to avoid pipe-buffer deadlocks.
      const [stdoutText, stderrText, exitCode] = await Promise.all([
        new Response(proc.stdout).text(),
        new Response(proc.stderr).text(),
        proc.exited,
      ])
      const stdout = stdoutText.trim()
      const stderr = stderrText.trim()

      if (exitCode !== 0) {
        let output = ""
        if (stdout) output += `${stdout}\n`
        if (stderr) output += `${stderr}\n`
        output += `Command exited with status ${exitCode}`

        if (
          stderr.includes("Read-only file system") ||
          stderr.includes("Operation not permitted")
        ) {
          output +=
            "\n\n[POSSIBLE SANDBOX RESTRICTION]: A filesystem write or another restricted operation may have been denied. " +
            "Inspect the error; use --dry-run or cache under $TMPDIR. " +
            "Use mode='rw' only for intentional workspace writes. In pure mode, network operations are also denied."
        }

        return {
          content: [{ type: "text", text: output }],
          isError: true,
        }
      }

      const resultText =
        stdout ||
        (stderr
          ? `[stderr]:\n${stderr}`
          : "Command completed successfully (exit code 0, no output).")

      return {
        content: [{ type: "text", text: resultText }],
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      return {
        content: [{ type: "text", text: `Failed to execute ${backend} sandbox: ${message}` }],
        isError: true,
      }
    } finally {
      if (tempDir) await rm(tempDir, { recursive: true, force: true })
    }
  }
)

const transport = new StdioServerTransport()
await server.connect(transport)
