#!/usr/bin/env -S bun --no-env-file
import { Command, CommanderError } from "commander@15.0.0";
import { createHash } from "node:crypto";
import { execFile, spawn } from "node:child_process";
import { readFile, realpath, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const query = promisify(execFile);
const CLI = ["--bun", "--package", "@devcontainers/cli@0.89.0", "devcontainer"];
const CONFIG = fileURLToPath(new URL("./dev_workspace.json", import.meta.url));
const DOTFILES_REPOSITORY = "https://github.com/InNoobWeTrust/dotfiles";
const DOTFILES_INSTALL_COMMAND = "bootstrap.sh";
const VSCODE_CLI = "/home/vscode/.local/bin/code";
const VSCODE_FILE_KEYCHAIN = "VSCODE_CLI_USE_FILE_KEYCHAIN=1";

function exitStatus(code: number | null, signal: NodeJS.Signals | null): number {
  if (code !== null) return code;
  if (signal === "SIGINT") return 130;
  if (signal === "SIGTERM") return 143;
  return 1;
}

async function run(command: string, args: string[]): Promise<number> {
  return new Promise((resolveExit, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code, signal) => resolveExit(exitStatus(code, signal)));
  });
}

async function repository(input?: string): Promise<string> {
  const path = input ?? (await query("git", ["rev-parse", "--show-toplevel"], { timeout: 5000 })).stdout.trim();
  const repo = await realpath(resolve(path));
  if (!(await stat(repo)).isDirectory()) throw new Error("REPO must be an existing directory");
  return repo;
}

async function containerId(repo: string): Promise<string | undefined> {
  const result = await query("docker", [
    "ps",
    "-a",
    "-q",
    "--filter",
    `label=dev-workspace.repo=${repo}`,
  ], { timeout: 5000 });
  const ids = result.stdout.trim().split(/\s+/).filter(Boolean);
  if (ids.length > 1) throw new Error("Multiple containers match this repository");
  return ids[0];
}

async function prepare(input?: string): Promise<number> {
  await repository(input);
  process.stdout.write(await readFile(CONFIG, "utf8"));
  return 0;
}

async function up(input: string | undefined, options: { config?: string }): Promise<number> {
  const repo = await repository(input);
  const config = options.config ? resolve(options.config) : CONFIG;
  return run("bunx", [
    ...CLI,
    "up",
    "--workspace-folder",
    repo,
    "--config",
    config,
    "--id-label",
    `dev-workspace.repo=${repo}`,
    "--dotfiles-repository",
    DOTFILES_REPOSITORY,
    "--dotfiles-install-command",
    DOTFILES_INSTALL_COMMAND,
  ]);
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

async function login(input?: string): Promise<number> {
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
    "env",
    VSCODE_FILE_KEYCHAIN,
    VSCODE_CLI,
    "tunnel",
    "user",
    "login",
  ]);
}

async function tunnel(input?: string): Promise<number> {
  const repo = await repository(input);
  const id = await containerId(repo);
  if (!id) { console.log("absent"); return 0; }
  const name = `dw-${createHash("sha256").update(repo).digest("hex").slice(0, 16)}`;
  return run("bunx", [
    ...CLI,
    "exec",
    "--container-id",
    id,
    "--workspace-folder",
    repo,
    "env",
    VSCODE_FILE_KEYCHAIN,
    VSCODE_CLI,
    "tunnel",
    "--accept-server-license-terms",
    "--name",
    name,
  ]);
}

export async function main(args: readonly string[]): Promise<number> {
  let exitCode = 0;
  const program = new Command()
    .name("dev_workspace")
    .description("Devcontainer template and command wrappers")
    .exitOverride();
  const commands: Record<string, {
    description: string;
    run: (input: string | undefined, options: { config?: string }) => Promise<number>;
  }> = {
    prepare: { description: "Print the static devcontainer configuration", run: prepare },
    up: { description: "Start the development container", run: up },
    stop: { description: "Stop the development container", run: stop },
    status: { description: "Show the development container status", run: status },
    login: { description: "Log in to the VS Code tunnel CLI", run: login },
    tunnel: { description: "Start the VS Code tunnel", run: tunnel },
  };
  for (const [name, { description, run }] of Object.entries(commands)) {
    const command = program.command(`${name} [REPO]`).description(description);
    if (name === "up") command.option("--config <PATH>", "Pass an existing configuration unchanged to the official CLI");
    command.action(async (input: string | undefined, options: { config?: string }) => {
      exitCode = await run(input, options);
    });
  }
  try { await program.parseAsync([...args], { from: "user" }); return exitCode; }
  catch (error) {
    if (error instanceof CommanderError) return error.exitCode;
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

if (import.meta.main) process.exitCode = await main(process.argv.slice(2));
