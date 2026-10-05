#!/usr/bin/env bun
/**
 * Universal Model Context Protocol (MCP) Server for Bubblewrap (bwrap) Sandboxing.
 * Exposes the 'sandbox' tool across all MCP-compatible AI agent harnesses:
 * Claude Code, OpenAI Codex, Google Antigravity (AGY), OpenCode, Cursor, and Kilo.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"
import path from "path"

const server = new McpServer({
  name: "sandbox",
  version: "1.0.0",
})

server.tool(
  "sandbox",
  "Execute shell commands inside an isolated Bubblewrap (bwrap) sandbox container with fault detection and login shell environment inheritance. Supports 'ro' (strict read-only), 'rw' (workspace writable), and 'pure' (offline air-gapped) modes.",
  {
    command: z
      .string()
      .describe("The shell command line to execute inside the sandbox"),
    mode: z
      .enum(["ro", "rw", "pure"])
      .default("ro")
      .describe(
        "Sandbox isolation mode:\n" +
          "- 'ro' (default, Strict Read-Only): System root and working directory are strictly read-only, network enabled. Catches unexpected write side-effects.\n" +
          "- 'rw' (Workspace Writable): System root is read-only, but working directory is writable. Network enabled. For builds, tests, linters with --fix bounded to current project.\n" +
          "- 'pure' (Air-Gapped Offline): Both system and working directory are read-only, network completely disabled. For untrusted code execution."
      ),
    login: z
      .boolean()
      .default(true)
      .describe(
        "Whether to execute via the user's login shell ($SHELL -l -c) to inherit profile environment variables, user configuration, and PATH entries. Defaults to true. Set to false to run a clean, non-login subshell."
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

    // 1. Probe for bwrap availability
    const bwrapBin = Bun.which("bwrap")
    if (!bwrapBin) {
      const msg =
        "bwrap: Bubblewrap executable not found or not supported on this platform.\n" +
        `Current OS/Platform: ${process.platform} (${process.arch})\n` +
        "Note: bwrap requires unprivileged Linux user namespaces (Linux distributions, Dev Containers, WSL2, or Docker).\n" +
        "If running on macOS, execute read-only commands directly or run inside a Linux devcontainer."
      return {
        content: [{ type: "text", text: msg }],
        isError: true,
      }
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

        if (
          stderr.includes("Read-only file system") ||
          stderr.includes("Operation not permitted")
        ) {
          output +=
            "\n\n[SANDBOX PROTECTION TRIGGERED]: The command attempted to mutate a read-only filesystem path. " +
            "This confirms unexpected write side-effects. Debug the command to run with read-only flags (e.g. --dry-run, caching in /tmp), " +
            "or switch to mode='rw' if modifying files in the current workspace is intentionally required."
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
        content: [{ type: "text", text: `Failed to execute bwrap sandbox: ${message}` }],
        isError: true,
      }
    }
  }
)

const transport = new StdioServerTransport()
await server.connect(transport)
