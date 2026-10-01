#!/usr/bin/env sh

if [ "$(uname -s)" = "Darwin" ]; then
    # Clean macOS-specific cache, temporary automation profiles, and junk
    macos_cleanup() {
        # Keep unmatched globs harmless without changing the caller's shell options.
        if [ -n "${ZSH_VERSION:-}" ]; then
            setopt local_options nonomatch
        fi
        local dry_run="${1:-0}" use_mac_cleanup="${2:-0}" tmp_dir="${TMPDIR:-/tmp}" found=0 2>/dev/null || true
        tmp_dir="${tmp_dir%/}"
        printf "==> Cleaning macOS platform artifacts...\n"

        # 1. Clean orphaned geckodriver profiles in TMPDIR
        for d in "$tmp_dir"/rust_mozprofile*; do
            if [ -e "$d" ]; then
                found=1
                break
            fi
        done
        if [ "$found" -eq 1 ]; then
            printf "Removing orphaned geckodriver profiles from %s...\n" "$tmp_dir"
            if [ "$dry_run" -eq 0 ]; then
                rm -rf "$tmp_dir"/rust_mozprofile* 2>/dev/null || true
            else
                printf "  [dry-run] Would remove %s/rust_mozprofile*\n" "$tmp_dir"
            fi
        fi

        # 2. Clean Chrome code-sign clones in Darwin cache (../X)
        if [ -d "$tmp_dir/../X/com.google.Chrome.code_sign_clone" ]; then
            printf "Removing stale Chrome code-sign clones...\n"
            if [ "$dry_run" -eq 0 ]; then
                rm -rf "$tmp_dir/../X/com.google.Chrome.code_sign_clone" 2>/dev/null || true
            else
                printf "  [dry-run] Would remove %s/../X/com.google.Chrome.code_sign_clone\n" "$tmp_dir"
            fi
        fi

        # 3. Clean macOS Trash
        if [ -d "$HOME/.Trash" ] && [ "$(ls -A "$HOME/.Trash" 2>/dev/null)" ]; then
            printf "Emptying Trash...\n"
            if [ "$dry_run" -eq 0 ]; then
                find "$HOME/.Trash" -mindepth 1 -maxdepth 1 -exec rm -rf {} + 2>/dev/null || true
            else
                printf "  [dry-run] Would empty %s\n" "$HOME/.Trash"
            fi
        fi

        # 4. Merge AppleDouble ._* files in dotfiles if system /usr/bin/dot_clean is available
        if [ -x /usr/bin/dot_clean ]; then
            if [ -d "${CONF_SH_DIR:-$HOME/.sh.d}" ]; then
                /usr/bin/dot_clean -m "${CONF_SH_DIR:-$HOME/.sh.d}" 2>/dev/null || true
            fi
        fi

        # 5. Clean Xcode DerivedData if present
        if [ -d "$HOME/Library/Developer/Xcode/DerivedData" ]; then
            printf "Cleaning Xcode DerivedData...\n"
            if [ "$dry_run" -eq 0 ]; then
                rm -rf "$HOME/Library/Developer/Xcode/DerivedData"/* 2>/dev/null || true
            else
                printf "  [dry-run] Would clean %s\n" "$HOME/Library/Developer/Xcode/DerivedData"
            fi
        fi

        # 6. Homebrew cleanup
        if usable brew; then
            printf "Cleaning Homebrew cache...\n"
            if [ "$dry_run" -eq 0 ]; then
                brew cleanup -s 2>/dev/null || true
            else
                printf "  [dry-run] Would run brew cleanup -s\n"
            fi
        fi

        # 7. Optional deep system cleanup via mac-cleanup utility
        if [ "$use_mac_cleanup" -eq 1 ] && usable mac-cleanup; then
            printf "Running mac-cleanup utility...\n"
            if [ "$dry_run" -eq 0 ]; then
                mac-cleanup
            else
                printf "  [dry-run] Would invoke mac-cleanup\n"
            fi
        fi

        printf "macOS platform cleanup complete.\n"
    }

    # macOS-specific aliases
    alias mac-clean='macos_cleanup'
    alias dot-clean-macos='macos_cleanup'
    alias empty-trash='find "$HOME/.Trash" -mindepth 1 -maxdepth 1 -exec rm -rf {} + 2>/dev/null'
    alias flush-dns='sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder'
fi
