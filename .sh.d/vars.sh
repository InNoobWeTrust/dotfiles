#!/usr/bin/env sh

export use_color=true
export friendly_builtin=true
export with_starship=true
# Set home for cargo of rust
export RUSTUP_HOME="$HOME/.local/rustup"
export CARGO_HOME="$HOME/.local/cargo"
# Set home for go lang
export GOPATH="$HOME/.local/go"
# Set pub cache dir for dart
export PUB_CACHE="$HOME/.local/pub-cache"
# Set root for pyenv
export PYENV_ROOT="$HOME/.local/pyenv"
# Disable prompt for pyenv
export PYENV_VIRTUALENV_DISABLE_PROMPT=1
# Set home for python-poetry
export POETRY_HOME="$HOME/.local/poetry"
# Set home for nvm
export NVM_DIR="$HOME/.local/nvm"
# Set home for volta
export VOLTA_HOME="$HOME/.local/volta"
# Turnoff auto complete for nvm as the loading is slow
export autocomplete_nvm=
# Set prefix for byobu if installed by linuxbrew
if [ -d /home/linuxbrew/.linuxbrew ]; then
    export BREW_HOME=/home/linuxbrew/.linuxbrew
elif [ -d "$HOME/.linuxbrew" ]; then
    export BREW_HOME="$HOME/.linuxbrew"
fi
[ -n "$BREW_HOME" ] && export BYOBU_PREFIX="$BREW_HOME"
export BAT_THEME="gruvbox-dark"
