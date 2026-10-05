#!/usr/bin/env bash
# dev_slurm.sh - Run remote tunnels (VS Code tunnel or Devtunnel SSH) on Slurm nodes
#
# Usage:
#   dev_slurm tunnel [host|auth|stop] [REPO]
#   dev_slurm devtunnel [host|auth|connect|stop] [REPO] [PORT]
#   dev_slurm status
#   dev_slurm stop
#
# Examples:
#   dev_slurm devtunnel auth                  # 1. Login to Devtunnel in interactive PTY shell
#   dev_slurm devtunnel host . 22             # 2. Host port 22 in background (zero extensions, lightweight)
#   dev_slurm devtunnel connect .             # 3. Connect to tunnel from client machine
#   ssh -p <port> $USER@127.0.0.1             # 4. SSH into the node
#
#   dev_slurm tunnel auth                     # VS Code tunnel login
#   dev_slurm tunnel host .                   # Host full VS Code tunnel in background

set -euo pipefail

VSCODE_FILE_KEYCHAIN="VSCODE_CLI_USE_FILE_KEYCHAIN=1"

group="${1:-help}"
[ $# -gt 0 ] && shift

generate_zsh_completion() {
  cat << 'EOF'
#compdef dev_slurm dev_slurm.sh

_dev_slurm() {
    local curcontext="$curcontext" state line
    typeset -A opt_args

    local -a commands
    commands=(
        'tunnel:Submit or manage VS Code tunnel Slurm jobs'
        'devtunnel:Submit or manage Devtunnel SSH Slurm jobs'
        'status:Check active tunnel jobs'
        'stop:Cancel all tunnel jobs'
        'completion:Generate shell completion script (bash or zsh)'
    )

    local -a tunnel_cmds
    tunnel_cmds=(
        'host:Submit full VS Code tunnel job (defaults to host)'
        'auth:Interactive PTY shell for VS Code auth'
        'login:Interactive PTY shell for VS Code auth'
        'stop:Cancel active VS Code tunnel job'
    )

    local -a devtunnel_cmds
    devtunnel_cmds=(
        'host:Submit lightweight Devtunnel job for SSH (default: port 22)'
        'auth:Interactive PTY shell for Devtunnel auth'
        'login:Interactive PTY shell for Devtunnel auth'
        'connect:Connect to Dev Tunnel from client'
        'stop:Cancel active Devtunnel job'
    )

    _arguments -C \
        '1:command:->cmd' \
        '*::args:->args'

    case $state in
        cmd)
            _describe -t commands 'dev_slurm command' commands
            ;;
        args)
            case $words[1] in
                tunnel)
                    _arguments -C \
                        '1:subcommand:->tunnel_sub' \
                        '*:repository directory:_files -/'
                    case $state in
                        tunnel_sub)
                            _describe -t tunnel_cmds 'tunnel subcommand' tunnel_cmds
                            ;;
                    esac
                    ;;
                devtunnel)
                    _arguments -C \
                        '1:subcommand:->dt_sub' \
                        '*:arguments:->dt_args'
                    case $state in
                        dt_sub)
                            _describe -t devtunnel_cmds 'devtunnel subcommand' devtunnel_cmds
                            ;;
                        dt_args)
                            _files -/
                            ;;
                    esac
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
    compdef _dev_slurm dev_slurm dev_slurm.sh
fi
EOF
}

generate_bash_completion() {
  cat << 'EOF'
_dev_slurm() {
    local cur prev words cword
    if declare -F _init_completion >/dev/null 2>&1; then
        _init_completion || return
    else
        COMPREPLY=()
        cur="${COMP_WORDS[COMP_CWORD]}"
        prev="${COMP_WORDS[COMP_CWORD-1]}"
        words=("${COMP_WORDS[@]}")
        cword=$COMP_CWORD
    fi

    local top_commands="tunnel devtunnel status stop completion"
    local tunnel_commands="host auth login stop"
    local devtunnel_commands="host auth login connect stop"

    if [ "$cword" -eq 1 ]; then
        COMPREPLY=( $(compgen -W "$top_commands" -- "$cur") )
        return 0
    fi

    case "${words[1]}" in
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
            else
                COMPREPLY=( $(compgen -d -- "$cur") )
            fi
            ;;
        completion)
            COMPREPLY=( $(compgen -W "bash zsh" -- "$cur") )
            ;;
    esac
}

complete -F _dev_slurm dev_slurm dev_slurm.sh
EOF
}

repo_hash() {
  local target="${1:-.}"
  printf '%s' "$(realpath "$target" 2>/dev/null || echo "$target")" | sha256sum | cut -c1-16
}

case "$group" in
  tunnel)
    action="host"
    if [ $# -gt 0 ]; then
      case "$1" in
        host|auth|login|stop)
          action="$1"
          shift
          ;;
        *)
          action="host"
          ;;
      esac
    fi

    case "$action" in
      auth|login)
        echo "=== Interactive PTY shell for VS Code Tunnel auth ==="
        echo "Run 'code tunnel' (or 'code tunnel user login'), then type 'exit' when done."
        echo ""
        exec srun --pty bash
        ;;
      host)
        repo="${1:-.}"
        hash="$(repo_hash "$repo")"
        name="dw-$hash"
        echo "=== Submitting full VS Code tunnel job (unlimited time) ==="
        sbatch \
          --job-name=vscode-tunnel \
          --time=0 \
          --output="$PWD/vscode-tunnel-%j.out" \
          --error="$PWD/vscode-tunnel-%j.err" \
          --wrap="bash -lc 'code=\$(command -v code) || { echo \"code CLI not found in PATH\" >&2; exit 1; }; env $VSCODE_FILE_KEYCHAIN \"\$code\" tunnel --accept-server-license-terms --name $name'"

        echo ""
        echo "Job submitted (job-name: vscode-tunnel). Check status with: squeue -u $USER -n vscode-tunnel"
        echo "Logs: $PWD/vscode-tunnel-<jobID>.out and $PWD/vscode-tunnel-<jobID>.err (%j is the job ID)"
        echo "Connect via: https://vscode.dev/tunnel/$name or VS Code Desktop"
        echo "Stop with: $0 tunnel stop"
        ;;
      stop)
        jobids="$(squeue -u "$USER" -n vscode-tunnel -h -o %i 2>/dev/null | tr '\n' ' ')"
        if [ -z "${jobids// /}" ]; then
          echo "No vscode-tunnel jobs found for $USER"
          exit 0
        fi
        echo "Cancelling vscode-tunnel job(s): $jobids"
        scancel $jobids
        ;;
    esac
    ;;

  devtunnel)
    action="host"
    if [ $# -gt 0 ]; then
      case "$1" in
        host|auth|login|connect|stop)
          action="$1"
          shift
          ;;
        *)
          action="host"
          ;;
      esac
    fi

    case "$action" in
      auth|login)
        echo "=== Interactive PTY shell for Devtunnel auth ==="
        echo "Run 'devtunnel user login', then type 'exit' when done."
        echo ""
        exec srun --pty bash
        ;;
      host)
        repo="${1:-.}"
        port="${2:-22}"
        hash="$(repo_hash "$repo")"
        name="dt-$hash"
        echo "=== Submitting lightweight Devtunnel job for SSH (port $port, unlimited time) ==="
        sbatch \
          --job-name=devtunnel \
          --time=0 \
          --output="$PWD/devtunnel-%j.out" \
          --error="$PWD/devtunnel-%j.err" \
          --wrap="bash -lc 'dt=\$(command -v devtunnel) || { echo \"devtunnel CLI not found in PATH\" >&2; exit 1; }; \"\$dt\" show \"$name\" >/dev/null 2>&1 || \"\$dt\" create \"$name\"; \"\$dt\" port show \"$name\" -p \"$port\" >/dev/null 2>&1 || \"\$dt\" port create \"$name\" -p \"$port\"; \"\$dt\" host \"$name\"'"

        echo ""
        echo "Job submitted (job-name: devtunnel). Check status with: squeue -u $USER -n devtunnel"
        echo "Logs: $PWD/devtunnel-<jobID>.out and $PWD/devtunnel-<jobID>.err (%j is the job ID)"
        echo ""
        echo "To connect from your local terminal app:"
        echo "  1. dev_slurm devtunnel connect $repo"
        echo "     (or: devtunnel connect $name)"
        echo "  2. ssh -p <forwarded-port> $USER@127.0.0.1"
        echo ""
        echo "Stop with: $0 devtunnel stop"
        ;;
      connect)
        repo="${1:-.}"
        hash="$(repo_hash "$repo")"
        name="dt-$hash"
        echo "Connecting to Dev Tunnel '$name' from host..."
        exec devtunnel connect "$name"
        ;;
      stop)
        jobids="$(squeue -u "$USER" -n devtunnel -h -o %i 2>/dev/null | tr '\n' ' ')"
        if [ -z "${jobids// /}" ]; then
          echo "No devtunnel jobs found for $USER"
          exit 0
        fi
        echo "Cancelling devtunnel job(s): $jobids"
        scancel $jobids
        ;;
    esac
    ;;

  status)
    squeue -u "$USER" -n vscode-tunnel,devtunnel
    ;;

  stop)
    jobids="$(squeue -u "$USER" -n vscode-tunnel,devtunnel -h -o %i 2>/dev/null | tr '\n' ' ')"
    if [ -z "${jobids// /}" ]; then
      echo "No tunnel jobs found for $USER"
      exit 0
    fi
    echo "Cancelling all tunnel job(s): $jobids"
    scancel $jobids
    ;;

  completion)
    shell_type="${1:-}"
    if [ -z "$shell_type" ]; then
      if [ -n "${ZSH_VERSION:-}" ]; then
        shell_type="zsh"
      elif [ -n "${BASH_VERSION:-}" ]; then
        shell_type="bash"
      else
        shell_type="$(basename "${SHELL:-bash}")"
      fi
    fi
    case "$shell_type" in
      zsh)
        generate_zsh_completion
        ;;
      bash|*)
        generate_bash_completion
        ;;
    esac
    exit 0
    ;;

  help|-h|--help)
    echo "Usage: $0 {tunnel [host|auth|stop]|devtunnel [host|auth|connect|stop]|status|stop|completion}"
    echo ""
    echo "Commands:"
    echo "  tunnel [host] [REPO]               - Submit full VS Code tunnel job (defaults to host)"
    echo "  tunnel auth                        - Interactive PTY shell for VS Code auth"
    echo "  tunnel stop                        - Cancel active VS Code tunnel job"
    echo "  devtunnel [host] [REPO] [PORT]     - Submit lightweight Devtunnel job for SSH (default: port 22)"
    echo "  devtunnel auth                     - Interactive PTY shell for Devtunnel auth"
    echo "  devtunnel connect [REPO]           - Connect to Dev Tunnel from client"
    echo "  devtunnel stop                     - Cancel active Devtunnel job"
    echo "  status                             - Check active tunnel jobs"
    echo "  stop                               - Cancel all tunnel jobs"
    echo "  completion [bash|zsh]              - Generate shell autocompletion script"
    exit 0
    ;;

  *)
    echo "Unknown command: $group" >&2
    echo "Run '$0 --help' for usage." >&2
    exit 1
    ;;
esac
