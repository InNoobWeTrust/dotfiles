#!/usr/bin/env sh

# Add ~/.local/**/bin to PATH if it's not there
[[ -d $HOME/.local ]] && for bin_path in $(find $HOME/.local -maxdepth 3 -name bin -type d 2>/dev/null); do
    [[ ":$PATH:" != *":$bin_path:"* ]] && [[ -d $bin_path ]] && export PATH="$bin_path:$PATH"
done

# Set neovim as default editor
if usable nvim ; then
    export EDITOR="$(command -v nvim)"
    export VISUAL="$(command -v nvim)"
else
    export EDITOR=/usr/bin/nano
fi

# dart-sdk
[[ -d /usr/lib/dart/bin ]] && [[ ":$PATH:" != *":/usr/lib/dart/bin:"* ]] && export PATH="$PATH:/usr/lib/dart/bin"

# pub cache
[[ -d $PUB_CACHE/bin ]] && [[ ":$PATH:" != *":$PUB_CACHE/bin:"* ]] && export PATH="$PUB_CACHE/bin:$PATH"

# GOPATH
[[ -d $GOPATH/bin ]] && export PATH="$GOPATH/bin:$PATH"

# cargo
[[ -d $CARGO_HOME/bin ]] && [[ ":$PATH:" != *":$CARGO_HOME/bin:"* ]] && export PATH="$CARGO_HOME/bin:$PATH"

# Wasmer
[[ -s "$WASMER_DIR/wasmer.sh" ]] && export WASMER_DIR="$HOME/.wasmer" && source "$WASMER_DIR/wasmer.sh"

# Foundry
[[ -d "$HOME/.foundry/bin" ]] && export PATH="$PATH:$HOME/.foundry/bin"

# homebrew
[[ -n "$BREW_HOME" ]] && eval $($BREW_HOME/bin/brew shellenv)

# python-poetry
[[ -d $POETRY_HOME ]] && source $POETRY_HOME/env

# nvm
[[ -s "$NVM_DIR/nvm.sh" ]] && \. "$NVM_DIR/nvm.sh"  # This loads nvm

# Nix
if [ -r $HOME/.nix-profile/etc/profile.d/nix.sh ]; then source $HOME/.nix-profile/etc/profile.d/nix.sh; fi

# Rancher desktop
[[ -d "$HOME/.rd/bin" ]] && export PATH="$HOME/.rd/bin:$PATH"
