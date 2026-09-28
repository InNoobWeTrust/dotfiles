#!/usr/bin/env sh

export use_color=true
export friendly_builtin=true
export XDG_CONFIG_HOME="$HOME/.config"
# Keep Rust tools and build artifacts on the external volume when mounted.
if [ -n "$CARGO_EXT_DIR" ]; then
    export CARGO_HOME="$CARGO_EXT_DIR/.cargo"
    export CARGO_INSTALL_ROOT="$CARGO_HOME"
    export RUSTUP_HOME="$CARGO_EXT_DIR/.rustup"
    export CARGO_TARGET_DIR="$CARGO_EXT_DIR/.cargo-target"
else
    # Fall back to local homes and project-local targets when the volume is unmounted.
    export CARGO_HOME="$HOME/.local/cargo"
    export CARGO_INSTALL_ROOT="$CARGO_HOME"
    export RUSTUP_HOME="$HOME/.local/rustup"
    export CARGO_TARGET_DIR="$HOME/.local/.cargo-target"
fi
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

# Puppeteer / mermaid-cli browser path
if [ -z "$PUPPETEER_EXECUTABLE_PATH" ]; then
    if [ "$(uname -s)" = "Darwin" ]; then
        if [ -x "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]; then
            export PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
        elif [ -x "/Applications/Chromium.app/Contents/MacOS/Chromium" ]; then
            export PUPPETEER_EXECUTABLE_PATH="/Applications/Chromium.app/Contents/MacOS/Chromium"
        fi
    elif [ "$(uname -s)" = "Linux" ]; then
        if command -v google-chrome-stable >/dev/null 2>&1; then
            export PUPPETEER_EXECUTABLE_PATH="$(command -v google-chrome-stable)"
        elif command -v google-chrome >/dev/null 2>&1; then
            export PUPPETEER_EXECUTABLE_PATH="$(command -v google-chrome)"
        elif command -v chromium >/dev/null 2>&1; then
            export PUPPETEER_EXECUTABLE_PATH="$(command -v chromium)"
        fi
    fi
fi

# Enable MPS for PyTorch if available
if [ "$(uname -s)" = "Darwin" ]; then
    export PYTORCH_ENABLE_MPS_FALLBACK=1
fi
