#!/usr/bin/env -S ${SHELL} -l

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Install pkgx if not already there (skip on Termux — no /usr access)
if [ -z "$TERMUX_VERSION" ]; then
    if ! command -v pkgx >/dev/null 2>&1; then
        echo "Installing pkgx..."
        curl -fsS "https://pkgx.sh" | sh
    fi
fi

# On Termux, install stow via pkg if not available
if [ -n "$TERMUX_VERSION" ]; then
    if ! command -v stow >/dev/null 2>&1; then
        echo "Installing stow on Termux..."
        pkg install -y stow
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
else
    STOW_CMD="stow"
fi

# Symlink dotfiles by running stow
echo "Symlinking dotfiles..."
eval "$STOW_CMD -d '$SCRIPT_DIR' . -t ~ --dotfiles $STOW_IGNORE_ARGS"

# Load .shrc from shell config file by checking default shell
echo "Set autoload of .shrc from shell config file..."
if [ -n "$ZSH_VERSION" ] && [ -z "$CONF_SH_DIR" ]; then
    echo "[ -e ~/.shrc ] && . ~/.shrc" >> ~/.zshrc
elif [ -n "$BASH_VERSION" ] && [ -z "$CONF_SH_DIR" ]; then
    echo "[ -e ~/.shrc ] && . ~/.shrc" >> ~/.bashrc
fi
