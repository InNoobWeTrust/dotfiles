#!/usr/bin/env bash
# One-time Devcontainer dotfiles installer; never invoked on container restart.
set -euo pipefail
repo=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd -P)
# Lifecycle execution may not export SHELL; bypass bootstrap's login-shell shebang.
bash "$repo/bootstrap.sh"
export PATH="${PIXI_HOME:-$HOME/.pixi}/bin:$HOME/.local/bin:$PATH"
# Use the same implementation as install-vscode-cli, without its interactive reload.
. "$repo/.sh.d/func.sh"
vscode_cli_install
