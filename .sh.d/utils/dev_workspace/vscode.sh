#!/usr/bin/env bash
set -euo pipefail
export PATH="${PIXI_HOME:-$HOME/.pixi}/bin:$HOME/.local/bin:$PATH"
code=$(command -v code) || { echo "VS Code CLI not found; install-vscode-cli inside the container." >&2; exit 1; }
umask 077
state="${XDG_STATE_HOME:-$HOME/.local/state}/dev-workspace/vscode-cli"
mkdir -p -- "$state"
chmod 700 "$state"
exec env VSCODE_CLI_USE_FILE_KEYCHAIN=1 "$code" --cli-data-dir "$state" "$@"
