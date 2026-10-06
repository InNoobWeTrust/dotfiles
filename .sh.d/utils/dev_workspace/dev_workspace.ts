#!/usr/bin/env -S bun --no-env-file
import { Command, CommanderError } from "commander@15.0.0";
import { mkdtemp, realpath, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";

async function query(command: string, args: string[]): Promise<string> {
  const child = Bun.spawn([command, ...args], {
    stdin: "ignore", stdout: "pipe", stderr: "pipe", timeout: 5000, killSignal: "SIGKILL",
  });
  const [stdout, stderr, code] = await Promise.all([
    new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited,
  ]);
  if (code !== 0) throw new Error(`${command} failed (${code}): ${stderr.trim()}`);
  return stdout;
}
const CLI = ["--bun", "--package", "@devcontainers/cli@0.89.0", "devcontainer"];
const DOTFILES_REPOSITORY = "https://github.com/InNoobWeTrust/dotfiles";
const DOTFILES_INSTALL_COMMAND = ".sh.d/utils/dev_workspace/install.sh";

async function shellScript(name: string): Promise<string> {
  return Bun.file(join(import.meta.dir, name)).text();
}

const DEFAULT_CONFIG = JSON.stringify(
  {
    name: "dev-workspace",
    image: "mcr.microsoft.com/devcontainers/base:ubuntu",
    remoteUser: "vscode",
    userEnvProbe: "none",
    workspaceFolder: "/workspace",
    workspaceMount: "type=bind,source=${localWorkspaceFolder},target=/workspace",
    runArgs: [
      "--cpus=2",
      "--memory=4294967296",
      "--memory-swap=4294967296",
      "--pids-limit=512",
      "--tmpfs=/tmp:rw,noexec,nosuid,nodev,size=268435456",
    ],
    privileged: false,
    capAdd: [],
    securityOpt: [],
    mounts: [],
    // The one-time dotfiles installer bootstraps Pixi and installs the shared VS Code CLI.
    // No post-start installation: restarting a container only resumes existing setup.
  },
  null,
  2
);

function exitStatus(code: number | null, signal: Bun.Subprocess["signalCode"]): number {
  if (code !== null && code >= 0) return code;
  if (signal === "SIGHUP") return 129;
  if (signal === "SIGINT") return 130;
  if (signal === "SIGTERM") return 143;
  return 1;
}

async function run(command: string, args: string[], stdinLifeline = false): Promise<number> {
  const child = Bun.spawn([command, ...args], {
    stdin: stdinLifeline ? "pipe" : "inherit", stdout: "inherit", stderr: "inherit",
  });
  const signals = ["SIGINT", "SIGTERM", "SIGHUP"] as const;
  let cancelled: (typeof signals)[number] | undefined;
  const handlers = signals.map(signal => () => {
    cancelled ??= signal;
    // EOF reaches the container supervisor; killing docker exec alone would orphan it.
    try {
      if (child.stdin && typeof child.stdin !== "number") child.stdin.end();
    } catch {
      // Remote exit may already have closed the lifeline.
    }
  });
  if (stdinLifeline) signals.forEach((signal, i) => process.on(signal, handlers[i]));
  try {
    await child.exited;
    return cancelled ? exitStatus(null, cancelled) : exitStatus(child.exitCode, child.signalCode);
  } finally {
    if (stdinLifeline) signals.forEach((signal, i) => process.off(signal, handlers[i]));
  }
}

async function repository(input?: string): Promise<string> {
  const path = input ?? (await query("git", ["rev-parse", "--show-toplevel"])).trim();
  const repo = await realpath(resolve(path));
  if (!(await stat(repo)).isDirectory()) throw new Error("REPO must be an existing directory");
  return repo;
}

function repoHash(repo: string): string {
  return new Bun.CryptoHasher("sha256").update(repo).digest("hex").slice(0, 16);
}

async function containerId(repo: string): Promise<string | undefined> {
  const result = await query("docker", [
    "ps",
    "-a",
    "-q",
    "--filter",
    `label=dev-workspace.repo=${repo}`,
  ]);
  const ids = result.trim().split(/\s+/).filter(Boolean);
  if (ids.length > 1) throw new Error("Multiple containers match this repository");
  return ids[0];
}

async function prepare(input?: string): Promise<number> {
  await repository(input);
  const adjacentConfig = join(import.meta.dir, "dev_workspace.json");
  try {
    process.stdout.write(await Bun.file(adjacentConfig).text());
  } catch {
    process.stdout.write(DEFAULT_CONFIG + "\n");
  }
  return 0;
}

async function up(input: string | undefined, options: { config?: string }): Promise<number> {
  const repo = await repository(input);
  let configPath = options.config ? resolve(options.config) : undefined;
  let tempDir: string | undefined;

  if (!configPath) {
    const adjacentConfig = join(import.meta.dir, "dev_workspace.json");
    try {
      if ((await stat(adjacentConfig)).isFile()) {
        configPath = adjacentConfig;
      }
    } catch {
      // Adjacent file does not exist, use embedded configuration
    }
  }

  if (!configPath) {
    tempDir = await mkdtemp(join(tmpdir(), "dev-workspace-"));
    configPath = join(tempDir, "devcontainer.json");
    await Bun.write(configPath, DEFAULT_CONFIG);
  }

  try {
    return await run("bunx", [
      ...CLI,
      "up",
      "--workspace-folder",
      repo,
      "--config",
      configPath,
      "--id-label",
      `dev-workspace.repo=${repo}`,
      "--dotfiles-repository",
      DOTFILES_REPOSITORY,
      "--dotfiles-install-command",
      DOTFILES_INSTALL_COMMAND,
    ]);
  } finally {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}

async function stop(input?: string): Promise<number> {
  const id = await containerId(await repository(input));
  if (!id) { console.log("absent"); return 0; }
  return run("docker", ["stop", id]);
}

async function status(input?: string): Promise<number> {
  const id = await containerId(await repository(input));
  if (!id) { console.log("absent"); return 0; }
  return run("docker", ["inspect", "--format", "{{.State.Status}}", id]);
}

async function loginVscode(input?: string): Promise<number> {
  const repo = await repository(input);
  const id = await containerId(repo);
  if (!id) { console.log("absent"); return 0; }
  return run("bunx", [
    ...CLI,
    "exec",
    "--container-id",
    id,
    "--workspace-folder",
    repo,
    "bash", "-c", await shellScript("vscode.sh"), "dev-workspace-vscode",
    "tunnel",
    "user",
    "login",
  ]);
}

async function hostVscode(input?: string): Promise<number> {
  const repo = await repository(input);
  const id = await containerId(repo);
  if (!id) { console.log("absent"); return 0; }
  const name = `dw-${repoHash(repo)}`;
  return run("bunx", [
    ...CLI,
    "exec",
    "--container-id",
    id,
    "--workspace-folder",
    repo,
    "bash", "-c", await shellScript("vscode.sh"), "dev-workspace-vscode",
    "tunnel",
    "--accept-server-license-terms",
    "--name",
    name,
  ]);
}

async function runTailscale(input: string | undefined, mode: "login" | "host"): Promise<number> {
  const repo = await repository(input);
  const id = await containerId(repo);
  if (!id) { console.log("absent"); return 0; }
  console.log(mode === "login"
    ? "Logging in to Tailscale inside the container; authentication will be saved."
    : "Starting integrated Tailscale SSH using saved login; Ctrl-C stops the session.");
  return run("docker", [
    "exec", "-i", "--user", "vscode", id,
    "bash", "-c", await shellScript("tailscale.sh"), "dev-workspace-tailscale", `ts-${repoHash(repo)}`, mode,
  ], true);
}

async function sshTailscale(input?: string): Promise<number> {
  const name = `ts-${repoHash(await repository(input))}`;
  return run("ssh", [`vscode@${name}`]);
}

export async function main(args: readonly string[]): Promise<number> {
  let exitCode = 0;
  const program = new Command()
    .name("dev_workspace")
    .description("Devcontainer template and remote access via VS Code or integrated Tailscale SSH")
    .exitOverride();

  // Container lifecycle commands
  program
    .command("prepare [REPO]")
    .description("Print the static devcontainer configuration")
    .action(async (input?: string) => {
      exitCode = await prepare(input);
    });

  program
    .command("up [REPO]")
    .description("Start the development container (uses temporary config if none provided)")
    .option("--config <PATH>", "Pass an existing configuration unchanged to the official CLI")
    .action(async (input: string | undefined, options: { config?: string }) => {
      exitCode = await up(input, options);
    });

  program
    .command("stop [REPO]")
    .description("Stop the development container")
    .action(async (input?: string) => {
      exitCode = await stop(input);
    });

  program
    .command("status [REPO]")
    .description("Show the development container status")
    .action(async (input?: string) => {
      exitCode = await status(input);
    });

  // 1. VS Code Tunnel group
  const tunnelGroup = program
    .command("tunnel")
    .description("VS Code remote tunnel commands (defaults to host)");

  tunnelGroup
    .command("host [REPO]", { isDefault: true })
    .description("Start VS Code tunnel in foreground")
    .action(async (input?: string) => {
      exitCode = await hostVscode(input);
    });

  tunnelGroup
    .command("login [REPO]")
    .description("Log in to VS Code tunnel inside container")
    .action(async (input?: string) => {
      exitCode = await loginVscode(input);
    });

  const tailscaleGroup = program
    .command("tailscale")
    .description("Rootless Tailscale inside the devcontainer (defaults to host)");

  tailscaleGroup
    .command("host [REPO]", { isDefault: true })
    .description("Run integrated Tailscale SSH in foreground using saved login")
    .action(async (input?: string) => {
      exitCode = await runTailscale(input, "host");
    });

  tailscaleGroup
    .command("login [REPO]")
    .description("Log in interactively and save this repository's Tailscale identity")
    .action(async (input?: string) => {
      exitCode = await runTailscale(input, "login");
    });

  tailscaleGroup
    .command("ssh [REPO]")
    .description("SSH directly from a Tailscale device (host session must be running)")
    .action(async (input?: string) => {
      exitCode = await sshTailscale(input);
    });

  program
    .command("completion [SHELL]")
    .description("Generate shell completion script (bash or zsh)")
    .action(async (shellInput?: string) => {
      const targetShell = (
        shellInput || (process.env.SHELL ? basename(process.env.SHELL) : "bash")
      ).toLowerCase();
      if (targetShell === "zsh") {
        process.stdout.write(await shellScript("completion.zsh"));
      } else {
        process.stdout.write(await shellScript("completion.bash"));
      }
      exitCode = 0;
    });

  try {
    await program.parseAsync([...args], { from: "user" });
    return exitCode;
  } catch (error) {
    if (error instanceof CommanderError) return error.exitCode;
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

if (import.meta.main) process.exitCode = await main(process.argv.slice(2));
