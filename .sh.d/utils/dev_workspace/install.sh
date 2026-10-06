#!/usr/bin/env bash
# One-time Devcontainer dotfiles installer; never invoked on container restart.
set -euo pipefail
repo=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd -P)
export PATH="${PIXI_HOME:-$HOME/.pixi}/bin:$HOME/.local/bin:$PATH"
# Conda-forge Stow has no Linux ARM64 build; provision it once in the Ubuntu workspace.
if ! command -v stow >/dev/null 2>&1; then
    command -v apt-get >/dev/null 2>&1 || {
        echo "Stow is missing; install it in this container before running workspace setup." >&2
        exit 1
    }
    apt=(apt-get)
    if [ "$(id -u)" -ne 0 ]; then
        apt=(sudo -n apt-get)
    fi
    "${apt[@]}" update
    "${apt[@]}" install -y --no-install-recommends stow
fi
# Bootstrap otherwise skips Pixi provisioning when system Stow is already present.
if ! command -v pixi >/dev/null 2>&1; then
    curl -fsSL --connect-timeout 5 --max-time 30 https://pixi.sh/install.sh | sh
fi
# Lifecycle execution may not export SHELL; bypass bootstrap's login-shell shebang.
bash "$repo/bootstrap.sh"
# Use the same implementation as install-vscode-cli, without its interactive reload.
. "$repo/.sh.d/func.sh"
vscode_cli_install
