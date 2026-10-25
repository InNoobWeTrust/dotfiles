#!/usr/bin/env -S ${SHELL} -l
# shellcheck shell=sh

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

# Find pre-seeded pixi and stow without relying on shell startup files
export PATH="$HOME/.pixi/bin:$PATH"

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
# Pixi owns its live manifest; never stow the repo's manifest over it.
STOW_IGNORE_ARGS="$STOW_IGNORE_ARGS --ignore='\.pixi'"

# Prefer system Stow (including Termux); otherwise use Pixi's temporary environment.
STOW_COMMAND="stow"
if ! command -v stow >/dev/null 2>&1; then
    if ! command -v pixi >/dev/null 2>&1; then
        if command -v curl >/dev/null 2>&1; then
            (set -o pipefail; curl -fsSL --connect-timeout 5 --max-time 30 "https://pixi.sh/install.sh" | sh) || {
                echo "offline: install stow via system or pre-seeded ~/.pixi/bin" >&2
                exit 1
            }
        elif command -v wget >/dev/null 2>&1; then
            (set -o pipefail; wget -qO- --timeout=30 "https://pixi.sh/install.sh" | sh) || {
                echo "offline: install stow via system or pre-seeded ~/.pixi/bin" >&2
                exit 1
            }
        else
            echo "offline: install stow via system or pre-seeded ~/.pixi/bin" >&2
            exit 1
        fi
    fi
    STOW_COMMAND="pixi exec stow"
fi

# Existing folded links need a separate, backed-up migration; Stow won't
# unfold a link that already points to the same package.
for runtime_dir in "$HOME/.local" "$HOME/.local/share" "$HOME/.local/state"; do
    if [ -L "$runtime_dir" ]; then
        echo "Error: $runtime_dir is a directory symlink. Back up its data and replace it with a real directory before stowing." >&2
        exit 1
    fi
done

# Remove only obsolete, repository-owned links; never follow directory symlinks.
sh "$SCRIPT_DIR/.sh.d/utils/stow-prune.sh" --source "$SCRIPT_DIR" --target "$HOME" --apply || {
    echo "Error: obsolete-link cleanup failed; Stow was not run. Review the cleanup output before retrying." >&2
    exit 1
}

# Link individual files so application writes don't enter the dotfiles repo.
printf '\n%s\n' "Symlinking dotfiles..."
eval "$STOW_COMMAND -d '$SCRIPT_DIR' . -t ~ --dotfiles --no-folding $STOW_IGNORE_ARGS" || {
    echo "Error: stow failed; dotfiles were not fully linked. If Pixi cannot run Stow, install it with your system package manager and rerun." >&2
    exit 1
}

# Pixi global commands read the live manifest (they have no --manifest flag).
if command -v pixi >/dev/null 2>&1 && [ -f "$SCRIPT_DIR/.pixi/manifests/pixi-global.toml" ]; then
    pixi_manifest="$HOME/.pixi/manifests/pixi-global.toml"
    repo_manifest="$SCRIPT_DIR/.pixi/manifests/pixi-global.toml"
    if [ -L "$pixi_manifest" ]; then
        echo "Error: Pixi manifest is a symlink; replace it with a regular file before syncing: $pixi_manifest" >&2
        exit 1
    fi
    if [ -e "$pixi_manifest" ] && ! cmp -s "$repo_manifest" "$pixi_manifest"; then
        backup="$pixi_manifest.pre-dotfiles.$(date +%Y%m%d%H%M%S).$$"
        if [ -e "$backup" ] || ! command cp -pn "$pixi_manifest" "$backup"; then
            echo "Error: could not back up Pixi manifest to $backup" >&2
            exit 1
        fi
        echo "Backed up Pixi manifest to $backup"
    fi
    if ! cmp -s "$repo_manifest" "$pixi_manifest"; then
        # Login-shell aliases must not turn the backed-up replacement into a prompt.
        mkdir -p "$HOME/.pixi/manifests" && command cp -f "$repo_manifest" "$pixi_manifest" || {
            echo "Error: could not update Pixi manifest: $pixi_manifest" >&2
            exit 1
        }
    fi
    # Targeted update installs missing environments too; sync cannot select them.
    # Keep this required list aligned with the manifest; only lsps is optional.
    printf '\n%s\n' "Installing/updating required Pixi global environments..."
    pixi global update core-utils dev system-tools || {
        echo "Error: required Pixi environments failed; check connectivity or rerun when online (manifest: $pixi_manifest)." >&2
        exit 1
    }
    # Only install optional environments if flag --full is set; otherwise, skip them to avoid unnecessary downloads.
    if [ "$1" = "--full" ]; then
        for _env in networks containers db lsp rust; do
            printf '\n%s\n' "Installing/updating optional Pixi environment: $_env"
            pixi global update "$_env" || {
                echo "Warning: optional Pixi environment '$_env' failed (packages may be unavailable on this platform); continuing without guaranteed availability. Retry with: pixi global update $_env" >&2
            }
        done
    fi
    # Keep the five newest backups by filename timestamp, not preserved mtime.
    (
        cd "$(dirname "$pixi_manifest")" || exit 1
        find . ! -name . -prune -type f -name 'pixi-global.toml.pre-dotfiles.*' -print |
            LC_ALL=C sort -r | tail -n +6 | while IFS= read -r backup; do
            command rm -f -- "$backup" || exit 1
        done
    ) || {
        echo "Error: could not prune old Pixi manifest backups." >&2
        exit 1
    }
fi

# Optional Bash line editor; shell startup itself never downloads dependencies.
bash "$SCRIPT_DIR/.sh.d/utils/install-blesh.sh" || {
    echo "Warning: ble.sh installation failed; Bash autosuggestions are unavailable. Retry: bash '$SCRIPT_DIR/.sh.d/utils/install-blesh.sh'" >&2
}

# Load .shrc from shell config file by checking default shell
printf '\n%s\n' "Set autoload of .shrc from shell config file..."
if [ -n "$ZSH_VERSION" ] && [ -z "$CONF_SH_DIR" ]; then
    grep -qxF '[ -e ~/.shrc ] && . ~/.shrc' ~/.zshrc 2>/dev/null || echo "[ -e ~/.shrc ] && . ~/.shrc" >> ~/.zshrc
elif [ -n "$BASH_VERSION" ] && [ -z "$CONF_SH_DIR" ]; then
    grep -qxF '[ -e ~/.shrc ] && . ~/.shrc' ~/.bashrc 2>/dev/null || echo "[ -e ~/.shrc ] && . ~/.shrc" >> ~/.bashrc
fi
