#!/usr/bin/env -S bun
/**
 * MCP command sandbox: Bubblewrap on Linux, Seatbelt (sandbox-exec) on macOS.
 * Both expose host files for reading; this is not a clean hostile-code environment.
 * Exposes mode-specific tools across MCP-compatible AI agent harnesses:
 * Claude Code, OpenAI Codex, Google Antigravity (AGY), OpenCode, Cursor, and Kilo.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"
import path from "path"
import { mkdtemp, realpath, rm, stat } from "node:fs/promises"
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js"
import { tmpdir } from "node:os"

const server = new McpServer(
  { name: "sandbox", version: "2.0.0" },
  {
    instructions:
      "Use sandbox_ro for read-only commands needing network, sandbox_pure for offline checks, and sandbox_rw only for intentional, authorized workspace writes. " +
      "Tools accept command and optional absolute workdir; shells never load login profiles. " +
      "Without workdir, use one client-provided MCP directory root, or the server launch directory when roots are unsupported or empty. " +
      "Multiple or unusable roots require explicit workdir. Results report the chosen directory and source; launch-directory inference is not verified agent context. " +
      "Specify workdir whenever the default is uncertain, especially for sandbox_rw. Use $TMPDIR for scratch/cache writes. " +
      "On a restriction or unavailable backend, inspect and report the failure; do not retry unsandboxed or escalate to rw just to make a read-only command pass. " +
      "Host files and inherited environment remain readable: never dump secrets or treat this as hostile-code isolation. Native read/edit tools do not need wrapping.",
  }
)

type SandboxMode = "ro" | "pure" | "rw"
const launchDirectory = process.cwd()
const inputSchema = {
  command: z.string().min(1).describe("Shell command to execute inside the sandbox"),
  workdir: z.string().refine(path.isAbsolute, "workdir must be absolute").optional()
    .describe("Absolute working directory. Defaults to a single MCP directory root, otherwise the inferred server launch directory. Multiple roots require this argument."),
}

async function resolveWorkdir(workdir?: string): Promise<{ cwd: string; source: string }> {
  let directory = workdir ?? launchDirectory
  let source = workdir ? "explicit workdir" : "inferred server launch directory; client roots unsupported"
  if (!workdir && server.server.getClientCapabilities()?.roots) {
    // Query on every invocation: a long-lived client can switch workspaces.
    const { roots } = await server.server.listRoots({}, { timeout: 5000 })
    if (roots.length > 1) throw new Error("Multiple MCP roots; provide an absolute workdir. No command executed.")
    if (roots.length === 1) {
      const uri = new URL(roots[0].uri)
      if (uri.protocol !== "file:" || (uri.hostname && uri.hostname !== "localhost")) {
        throw new Error("MCP root is not a local file URI; provide an absolute workdir.")
      }
      directory = Bun.fileURLToPath(uri)
      source = "client MCP root"
    } else {
      source = "inferred server launch directory; client roots empty"
    }
  }
  const cwd = await realpath(directory)
  if (!(await stat(cwd)).isDirectory()) throw new Error("workdir/MCP root must be an existing directory; provide an absolute workdir.")
  return { cwd, source }
}

async function executeSandbox(command: string, mode: SandboxMode, cwd: string): Promise<CallToolResult> {
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

    // Skip login profiles but retain the inherited environment and PATH.
    const userShell = Bun.env.SHELL || "/bin/sh"
    const shellArgs = [userShell, "-c", command]

    bwrapArgs.push("--", ...shellArgs)

    // Both backends inherit the environment. macOS has no private mounts;
    // only its per-invocation scratch directory is writable outside the workspace.
    try {
      let sandboxArgs = bwrapArgs
      let childEnv = { ...Bun.env }
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
        Bun.readableStreamToText(proc.stdout),
        Bun.readableStreamToText(proc.stderr),
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
            "Use sandbox_rw only for intentional workspace writes. sandbox_pure also denies network operations."
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

const tools: { name: string; mode: SandboxMode; description: string }[] = [
  { name: "sandbox_ro", mode: "ro", description: "Read-only host/workspace with network access: inspections and queries needing network." },
  { name: "sandbox_pure", mode: "pure", description: "Offline read-only host/workspace: git status/diff, searches, and non-mutating checks without network." },
  { name: "sandbox_rw", mode: "rw", description: "Authorized workspace writes with network access: builds, edits, and bounded side effects. The resolved workdir becomes writable; specify it if uncertain." },
]

for (const { name, mode, description } of tools) {
  server.tool(name,
    `${description} Non-login shell, writable scratch at $TMPDIR. Host files/environment remain readable; not hostile-code isolation. Investigate denials; never silently retry unrestricted.`,
    inputSchema,
    async ({ command, workdir }): Promise<CallToolResult> => {
      try {
        const { cwd, source } = await resolveWorkdir(workdir)
        const result = await executeSandbox(command, mode, cwd)
        return { ...result, content: [{ type: "text", text: `Workdir: ${cwd} (${source})` }, ...result.content] }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        return { content: [{ type: "text", text: `Sandbox failed: ${message}. Provide an absolute workdir if directory discovery failed.` }], isError: true }
      }
    }
  )
}

const transport = new StdioServerTransport()
await server.connect(transport)
