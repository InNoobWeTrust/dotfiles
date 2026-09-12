#!/usr/bin/env sh

export use_color=true
export friendly_builtin=true
export XDG_CONFIG_HOME="$HOME/.config"
# Set home for cargo of rust
export RUSTUP_HOME="$HOME/.local/rustup"
export CARGO_HOME="$HOME/.local/cargo"
export CARGO_INSTALL_ROOT="$HOME/.local/cargo"
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
# Default editor (nvim -> hx -> pkgx hx -> vim -> vi)
if command -v nvim >/dev/null 2>&1; then
    export EDITOR="nvim"
elif command -v hx >/dev/null 2>&1; then
    export EDITOR="hx"
elif command -v pkgx >/dev/null 2>&1; then
    export EDITOR="pkgx +helix-editor.com hx"
elif command -v vim >/dev/null 2>&1; then
    export EDITOR="vim"
else
    export EDITOR="vi"
fi
export VISUAL="$EDITOR"
# Set huggingface token
[ -e "$HOME/.cache/huggingface/token" ] && export HF_TOKEN="$(head -n 1 "$HOME/.cache/huggingface/token")"
