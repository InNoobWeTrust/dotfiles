#!/usr/bin/env bash
# Local foreground CLI. Always execute, never source: session traps must not affect the caller.
set -euo pipefail
script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)
. "$script_dir/../shared/repository.sh"
action="${1:-help}"
[ $# -eq 0 ] || shift
case "$action" in
  host)
    [ $# -le 1 ] || { echo "Usage: dev_tailscale $action [REPO]" >&2; exit 1; }
    repo="$(dev_repository "$@")"
    name="ts-$(dev_repo_hash "$repo")"
    exec bash "$script_dir/session.sh" "$name"
    ;;
  completion)
    case "${1:-bash}" in
      bash|zsh) cat "$script_dir/completion.${1:-bash}" ;;
      *) echo "Supported shells: bash, zsh" >&2; exit 1 ;;
    esac
    ;;
  help|-h|--help)
    echo "Usage: dev_tailscale host [REPO]"
    echo "Run rootless Tailscale SSH here, without Slurm or Docker. Host stays in foreground."
    echo "REPO defaults to the current Git root. Tailscale handles authentication during startup."
    echo "Ctrl-C stops this session, preserves authentication, and returns to your shell."
    echo "dev_tailscale completion [bash|zsh] emits shell completions."
    ;;
  *) echo "Unknown command: $action. Run dev_tailscale --help." >&2; exit 1 ;;
esac
