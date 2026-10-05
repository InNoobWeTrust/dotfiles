#!/usr/bin/env -S bun --no-env-file
import { Command, CommanderError } from "commander@15.0.0";
import { createHash } from "node:crypto";
import { execFile, spawn } from "node:child_process";
import { mkdtemp, readFile, realpath, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const query = promisify(execFile);
const CLI = ["--bun", "--package", "@devcontainers/cli@0.89.0", "devcontainer"];
const DOTFILES_REPOSITORY = "https://github.com/InNoobWeTrust/dotfiles";
const DOTFILES_INSTALL_COMMAND = "bootstrap.sh";
const VSCODE_CLI = "/home/vscode/.local/bin/code";
const DEVTUNNEL_CLI = "/home/vscode/.local/bin/devtunnel";
const VSCODE_FILE_KEYCHAIN = "VSCODE_CLI_USE_FILE_KEYCHAIN=1";
const SSH_PORT = "22";

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
    forwardPorts: [2222],
    postCreateCommand: `bash -eu -c '
case "$(uname -m)" in
  x86_64) arch=x64 ;;
  aarch64|arm64) arch=arm64 ;;
  *) echo "Unsupported architecture" >&2; exit 1 ;;
esac
mkdir -p "$HOME/.local/bin"
if [ ! -x "$HOME/.local/bin/code" ]; then
  tmp=$(mktemp -d)
  curl -fL "https://update.code.visualstudio.com/latest/cli-linux-$arch/stable" -o "$tmp/code.tar.gz"
  tar -xzf "$tmp/code.tar.gz" -C "$tmp"
  install -m 755 "$tmp/code" "$HOME/.local/bin/code"
  rm -rf "$tmp"
fi
if [ ! -x "$HOME/.local/bin/devtunnel" ]; then
  curl -fsSL -o "$HOME/.local/bin/devtunnel" "https://tunnelsassetsprod.blob.core.windows.net/cli/linux-$arch-devtunnel"
  chmod 755 "$HOME/.local/bin/devtunnel"
fi
if ! command -v sshd >/dev/null 2>&1; then
  sudo apt-get update -qq
  sudo apt-get install -y -qq openssh-server libsecret-1-0
fi
sudo mkdir -p /run/sshd
mkdir -p "$HOME/.ssh"
chmod 700 "$HOME/.ssh"
touch "$HOME/.ssh/authorized_keys"
chmod 600 "$HOME/.ssh/authorized_keys"
echo "vscode:vscode" | sudo chpasswd
sudo ssh-keygen -A
sudo service ssh start || true
'`,
  },
  null,
  2
);

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

function repoHash(repo: string): string {
  return createHash("sha256").update(repo).digest("hex").slice(0, 16);
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
  const adjacentConfig = fileURLToPath(new URL("./dev_workspace.json", import.meta.url));
  try {
    process.stdout.write(await readFile(adjacentConfig, "utf8"));
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
    const adjacentConfig = fileURLToPath(new URL("./dev_workspace.json", import.meta.url));
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
    await writeFile(configPath, DEFAULT_CONFIG, "utf8");
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
    "env",
    VSCODE_FILE_KEYCHAIN,
    VSCODE_CLI,
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
    "env",
    VSCODE_FILE_KEYCHAIN,
    VSCODE_CLI,
    "tunnel",
    "--accept-server-license-terms",
    "--name",
    name,
  ]);
}

async function loginDevtunnel(input?: string): Promise<number> {
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
    DEVTUNNEL_CLI,
    "user",
    "login",
  ]);
}

async function hostDevtunnel(input?: string): Promise<number> {
  const repo = await repository(input);
  const id = await containerId(repo);
  if (!id) { console.log("absent"); return 0; }
  const name = `dt-${repoHash(repo)}`;
  console.log(`Starting Dev Tunnel '${name}' for SSH (port ${SSH_PORT})...`);
  console.log("");
  console.log("To connect from your local terminal app:");
  console.log(`  1. dev_workspace devtunnel connect`);
  console.log(`     (or: devtunnel connect ${name})`);
  console.log("  2. dev_workspace devtunnel ssh");
  console.log("     (or: ssh -p <forwarded-port> vscode@127.0.0.1; default password: vscode)");
  console.log("");

  const setupAndHostScript = [
    "sudo service ssh start || true",
    `"${DEVTUNNEL_CLI}" show "${name}" >/dev/null 2>&1 || "${DEVTUNNEL_CLI}" create "${name}"`,
    `"${DEVTUNNEL_CLI}" port show "${name}" -p ${SSH_PORT} >/dev/null 2>&1 || "${DEVTUNNEL_CLI}" port create "${name}" -p ${SSH_PORT}`,
    `exec "${DEVTUNNEL_CLI}" host "${name}"`,
  ].join(" && ");

  return run("bunx", [
    ...CLI,
    "exec",
    "--container-id",
    id,
    "--workspace-folder",
    repo,
    "bash",
    "-lc",
    setupAndHostScript,
  ]);
}

async function connectDevtunnel(input?: string): Promise<number> {
  const repo = await repository(input);
  const name = `dt-${repoHash(repo)}`;
  console.log(`Connecting to Dev Tunnel '${name}' from host...`);
  return run("devtunnel", ["connect", name]);
}

async function sshDevtunnel(input?: string, options: { port?: string } = {}): Promise<number> {
  const port = options.port ?? "2222";
  return run("ssh", ["-p", port, "vscode@127.0.0.1"]);
}

function generateZshCompletion(): string {
  return `#compdef dev_workspace dev_workspace.ts

_dev_workspace() {
    local curcontext="$curcontext" state line
    typeset -A opt_args

    local -a commands
    commands=(
        'prepare:Print the static devcontainer configuration'
        'up:Start the development container'
        'stop:Stop the development container'
        'status:Show the development container status'
        'tunnel:VS Code remote tunnel commands (defaults to host)'
        'devtunnel:Microsoft Dev Tunnels commands (defaults to host)'
        'completion:Generate shell completion script (bash or zsh)'
    )

    local -a tunnel_cmds
    tunnel_cmds=(
        'host:Start VS Code tunnel in foreground'
        'login:Log in to VS Code tunnel inside container'
    )

    local -a devtunnel_cmds
    devtunnel_cmds=(
        'host:Start hosting Dev Tunnel for SSH (port 22) in foreground'
        'login:Log in to Dev Tunnel inside container'
        'connect:Connect to Dev Tunnel from host machine'
        'ssh:Connect via SSH to container port'
    )

    _arguments -C \\
        '1:command:->cmd' \\
        '*::args:->args'

    case $state in
        cmd)
            _describe -t commands 'dev_workspace command' commands
            ;;
        args)
            case $words[1] in
                tunnel)
                    _arguments -C \\
                        '1:subcommand:->tunnel_sub' \\
                        '*:repository directory:_files -/'
                    case $state in
                        tunnel_sub)
                            _describe -t tunnel_cmds 'tunnel subcommand' tunnel_cmds
                            ;;
                    esac
                    ;;
                devtunnel)
                    _arguments -C \\
                        '1:subcommand:->dt_sub' \\
                        '*::dt_args:->dt_args'
                    case $state in
                        dt_sub)
                            _describe -t devtunnel_cmds 'devtunnel subcommand' devtunnel_cmds
                            ;;
                        dt_args)
                            case $words[1] in
                                ssh)
                                    _arguments \\
                                        '(-p --port)'{-p,--port}'[Local SSH port]:port number:' \\
                                        '*:repository directory:_files -/'
                                    ;;
                                *)
                                    _files -/
                                    ;;
                            esac
                            ;;
                    esac
                    ;;
                up)
                    _arguments \\
                        '--config[Configuration file]:config file:_files' \\
                        '*:repository directory:_files -/'
                    ;;
                prepare|stop|status)
                    _files -/
                    ;;
                completion)
                    local -a shells
                    shells=('bash:Generate bash completion script' 'zsh:Generate zsh completion script')
                    _describe -t shells 'shell' shells
                    ;;
            esac
            ;;
    esac
}

if (( $+functions[compdef] )); then
    compdef _dev_workspace dev_workspace dev_workspace.ts
fi
`;
}

function generateBashCompletion(): string {
  return `_dev_workspace() {
    local cur prev words cword
    if declare -F _init_completion >/dev/null 2>&1; then
        _init_completion || return
    else
        COMPREPLY=()
        cur="\${COMP_WORDS[COMP_CWORD]}"
        prev="\${COMP_WORDS[COMP_CWORD-1]}"
        words=("\${COMP_WORDS[@]}")
        cword=$COMP_CWORD
    fi

    local top_commands="prepare up stop status tunnel devtunnel completion"
    local tunnel_commands="host login"
    local devtunnel_commands="host login connect ssh"

    if [ "$cword" -eq 1 ]; then
        COMPREPLY=( $(compgen -W "$top_commands" -- "$cur") )
        return 0
    fi

    case "\${words[1]}" in
        tunnel)
            if [ "$cword" -eq 2 ]; then
                COMPREPLY=( $(compgen -W "$tunnel_commands" -- "$cur") )
            else
                COMPREPLY=( $(compgen -d -- "$cur") )
            fi
            ;;
        devtunnel)
            if [ "$cword" -eq 2 ]; then
                COMPREPLY=( $(compgen -W "$devtunnel_commands" -- "$cur") )
            elif [ "\${words[2]}" = "ssh" ] && [ "$prev" = "-p" ]; then
                COMPREPLY=()
            else
                COMPREPLY=( $(compgen -d -- "$cur") )
            fi
            ;;
        up)
            if [ "$prev" = "--config" ]; then
                COMPREPLY=( $(compgen -f -- "$cur") )
            elif [[ "$cur" == -* ]]; then
                COMPREPLY=( $(compgen -W "--config" -- "$cur") )
            else
                COMPREPLY=( $(compgen -d -- "$cur") )
            fi
            ;;
        prepare|stop|status)
            COMPREPLY=( $(compgen -d -- "$cur") )
            ;;
        completion)
            COMPREPLY=( $(compgen -W "bash zsh" -- "$cur") )
            ;;
    esac
}

complete -F _dev_workspace dev_workspace dev_workspace.ts
`;
}

export async function main(args: readonly string[]): Promise<number> {
  let exitCode = 0;
  const program = new Command()
    .name("dev_workspace")
    .description("Devcontainer template and command wrappers (grouped by tunnel & devtunnel)")
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

  // 2. Devtunnel group (mimics devtunnel subcommands)
  const devtunnelGroup = program
    .command("devtunnel")
    .description("Microsoft Dev Tunnels commands (defaults to host)");

  devtunnelGroup
    .command("host [REPO]", { isDefault: true })
    .description("Start hosting Dev Tunnel for SSH (port 22) in foreground (mimics devtunnel host)")
    .action(async (input?: string) => {
      exitCode = await hostDevtunnel(input);
    });

  devtunnelGroup
    .command("login [REPO]")
    .description("Log in to Dev Tunnel inside container (mimics devtunnel user login)")
    .action(async (input?: string) => {
      exitCode = await loginDevtunnel(input);
    });

  devtunnelGroup
    .command("connect [REPO]")
    .description("Connect to the Dev Tunnel from host machine (mimics devtunnel connect)")
    .action(async (input?: string) => {
      exitCode = await connectDevtunnel(input);
    });

  devtunnelGroup
    .command("ssh [REPO]")
    .description("Connect via SSH to container port (default: 2222)")
    .option("-p, --port <PORT>", "Local SSH port", "2222")
    .action(async (input: string | undefined, options: { port?: string }) => {
      exitCode = await sshDevtunnel(input, options);
    });

  program
    .command("completion [SHELL]")
    .description("Generate shell completion script (bash or zsh)")
    .action((shellInput?: string) => {
      const targetShell = (
        shellInput || (process.env.SHELL ? basename(process.env.SHELL) : "bash")
      ).toLowerCase();
      if (targetShell === "zsh") {
        process.stdout.write(generateZshCompletion());
      } else {
        process.stdout.write(generateBashCompletion());
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
