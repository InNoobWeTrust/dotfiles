#!/usr/bin/env -S ${SHELL} -l

if [ -n "${BASH_SOURCE[0]:-}" ]; then
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
elif [ -n "${ZSH_VERSION:-}" ]; then
    # shellcheck disable=SC2296
    SCRIPT_DIR="$(cd "$(dirname "${(%):-%x}")" && pwd)"
else
    SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
fi

# Ensure ~/.local/bin is in PATH for this session
case ":$PATH:" in
    *:"$HOME/.local/bin":*) ;;
    *) PATH="$HOME/.local/bin:$PATH" ;;
esac

# Install pkgx into ~/.local/bin if not already there (skip on Termux — no /usr access)
if [ -z "$TERMUX_VERSION" ]; then
    if ! command -v pkgx >/dev/null 2>&1; then
        echo "Installing pkgx to $HOME/.local/bin..."
        mkdir -p "$HOME/.local/bin"
        PKG_URL="https://pkgx.sh/$(uname)/$(uname -m).tgz"
        if command -v curl >/dev/null 2>&1; then
            curl -fsSL "$PKG_URL" | tar -xz -C "$HOME/.local/bin"
        elif command -v wget >/dev/null 2>&1; then
            wget -qO- "$PKG_URL" | tar -xz -C "$HOME/.local/bin"
        else
            echo "Error: Neither curl nor wget found. Cannot download pkgx." >&2
        fi
        [ -x "$HOME/.local/bin/pkgx" ] || chmod +x "$HOME/.local/bin/pkgx" 2>/dev/null || true
    fi
fi

# Build --ignore flags from .stow-ignore (one regex pattern per line)
STOW_IGNORE_ARGS=""
if [ -f "$SCRIPT_DIR/.stow-ignore" ]; then
    while IFS= read -r pattern || [ -n "$pattern" ]; do
        # Skip blank lines and comments
        case "$pattern" in
            ''|\#*) continue ;;
        esac
        STOW_IGNORE_ARGS="$STOW_IGNORE_ARGS --ignore='$pattern'"
    done < "$SCRIPT_DIR/.stow-ignore"
fi

# Use pkgx to run stow, or fall back to plain stow (e.g. on Termux)
if command -v pkgx >/dev/null 2>&1; then
    STOW_CMD="pkgx stow"
elif command -v stow >/dev/null 2>&1; then
    STOW_CMD="stow"
else
    echo "Error: Neither pkgx nor stow is available. Cannot symlink dotfiles." >&2
    exit 1
fi

# Symlink dotfiles by running stow
echo "Symlinking dotfiles..."
eval "$STOW_CMD -d '$SCRIPT_DIR' . -t ~ --dotfiles $STOW_IGNORE_ARGS"

# Load .shrc from shell config file by checking default shell
echo "Set autoload of .shrc from shell config file..."
if [ -n "$ZSH_VERSION" ] && [ -z "$CONF_SH_DIR" ]; then
    grep -qxF '[ -e ~/.shrc ] && . ~/.shrc' ~/.zshrc 2>/dev/null || echo "[ -e ~/.shrc ] && . ~/.shrc" >> ~/.zshrc
elif [ -n "$BASH_VERSION" ] && [ -z "$CONF_SH_DIR" ]; then
    grep -qxF '[ -e ~/.shrc ] && . ~/.shrc' ~/.bashrc 2>/dev/null || echo "[ -e ~/.shrc ] && . ~/.shrc" >> ~/.bashrc
fi
