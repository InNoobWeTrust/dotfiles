#!/usr/bin/env bash
# Transportable foreground worker: NAME. Authentication and credentials belong to code.
set -euo pipefail
name="${1:?Expected tunnel name}"
export PATH="${PIXI_HOME:-$HOME/.pixi}/bin:$HOME/.local/bin:$PATH"
code=$(command -v code) || { echo "VS Code CLI not found; run install-vscode-cli in this environment." >&2; exit 1; }
exec "$code" tunnel --accept-server-license-terms --name "$name"
