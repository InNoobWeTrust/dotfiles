#!/usr/bin/env sh

# Add ~/.local/*/bin to PATH if it's not there
[ -d "$HOME/.local" ] && \
    for d in "$HOME"/.local/*/bin; do
        setPath "$d"
    done

# Set neovim as default editor
if usable nvim ; then
    EDITOR="$(command -v nvim)"
    VISUAL="$(command -v nvim)"
    export EDITOR
    export VISUAL
else
    export EDITOR=/usr/bin/nano
fi

# dart-sdk
[ -d /usr/lib/dart/bin ] && setPath '/usr/lib/dart/bin'

# pub cache
[ -d "$PUB_CACHE/bin" ] && setPath "$PUB_CACHE/bin"

# GOPATH
[ -d "$GOPATH/bin" ] && setPath "$GOPATH/bin"

# cargo
[ -d "$CARGO_HOME/bin" ] && setPath "$CARGO_HOME/bin"

# Wasmer
# shellcheck source=/dev/null
[ -s "$WASMER_DIR/wasmer.sh" ] && export WASMER_DIR="$HOME/.wasmer" && . "$WASMER_DIR/wasmer.sh"

# Foundry
[ -d "$HOME/.foundry/bin" ] && setPath "$HOME/.foundry/bin"

# homebrew
[ -n "$BREW_HOME" ] && eval "$("$BREW_HOME"/bin/brew shellenv)"

# python-poetry
# shellcheck source=/dev/null
[ -d "$POETRY_HOME" ] && . "$POETRY_HOME/env"

# nvm
# shellcheck source=/dev/null
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm

# deno
[ -d "$HOME/.deno/bin" ] && setPath "$HOME/.deno/bin"

# Nix
# shellcheck source=/dev/null
[ -r "$HOME/.nix-profile/etc/profile.d/nix.sh" ] && . "$HOME/.nix-profile/etc/profile.d/nix.sh"

# Rancher desktop
[ -d "$HOME/.rd/bin" ] && setPath "$HOME/.rd/bin"
