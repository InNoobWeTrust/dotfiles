#!/usr/bin/env bash
# Slurm CLI entrypoint: transport shared foreground services into allocations/jobs.
set -euo pipefail

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)
# Workers are embedded into job payloads; compute nodes need no module paths.
. "$script_dir/jobs.sh"
. "$script_dir/../shared/repository.sh"
. "$script_dir/sessions.sh"

group="${1:-help}"
[ $# -gt 0 ] && shift

case "$group" in
  tailscale|tunnel) session_command "$group" "$@" ;;
  status) show_jobs ;;
  stop) stop_jobs ;;
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
      zsh) cat "$script_dir/completion.zsh" ;;
      bash|*) cat "$script_dir/completion.bash" ;;
    esac
    ;;
  help|-h|--help)
    echo "Usage: $0 {tunnel [host|stop]|tailscale [host|stop]|status|stop|completion}"
    echo ""
    echo "Commands:"
    echo "  tunnel [host] [REPO]               - Submit full VS Code tunnel job (defaults to host)"
    echo "  tunnel stop                        - Cancel active VS Code tunnel job"
    echo "  tailscale [host] [REPO]            - Submit integrated SSH job (tailnet port 22)"
    echo "  tailscale stop                     - Cancel Tailscale jobs and their children"
    echo "  status                             - Check active tunnel jobs"
    echo "  stop                               - Cancel all tunnel jobs"
    echo "  completion [bash|zsh]              - Generate shell autocompletion script"
    ;;
  *)
    echo "Unknown command: $group" >&2
    echo "Run '$0 --help' for usage." >&2
    exit 1
    ;;
esac
