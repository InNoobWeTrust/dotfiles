#!/usr/bin/env sh

# github's cli
if usable gh; then
    gh_completion_cache_dir="${XDG_CACHE_HOME:-$HOME/.cache}"
    gh_completion_cache_file="$gh_completion_cache_dir/gh-completion.$(basename "$SHELL")"
    [ -d "$gh_completion_cache_dir" ] || mkdir -p "$gh_completion_cache_dir"

    if [ ! -s "$gh_completion_cache_file" ] || [ "$(command -v gh)" -nt "$gh_completion_cache_file" ]; then
        gh completion --shell "$(basename "$SHELL")" > "$gh_completion_cache_file" 2>/dev/null || true
    fi

    [ -s "$gh_completion_cache_file" ] && . "$gh_completion_cache_file"
fi

# kitty terminal
# shellcheck source=/dev/null
usable kitty && kitty + complete setup bash | while IFS= read -r n
do
    . "$n"
done


if [ -n "$BASH_VERSION" ]; then
    # Load nvm bash_completion on demand
    # shellcheck source=/dev/null
    [ -n "$autocomplete_nvm" ] && [ -s "$NVM_DIR/bash_completion" ] && . "$NVM_DIR/bash_completion"

    # Add python argcomplete's bash completion globally
    if [ -r "$HOME/bash_completion.d/python-argcomplete" ]; then
        # shellcheck source=/dev/null
        . "$HOME/bash_completion.d/python-argcomplete"
    fi
    _brew_prefix="${HOMEBREW_PREFIX:-$(usable brew && brew --prefix 2>/dev/null)}"
    if [ -n "$_brew_prefix" ] && [ -d "$_brew_prefix/etc/bash_completion.d" ]; then
        for s in "$_brew_prefix"/etc/bash_completion.d/*; do
            [ -f "$s" ] && [ -r "$s" ] || continue
            # shellcheck source=/dev/null
            . "$s"
        done
    fi
    unset _brew_prefix

    # Custom completion
    if [ -d "$HOME/.bash_completion.d/" ]; then
        for s in "$HOME"/.bash_completion.d/*; do
            [ -f "$s" ] && [ -r "$s" ] || continue
            # shellcheck source=/dev/null
            . "$s"
        done
    fi
fi

# daytona
if usable daytona; then
    . <(daytona completion "$(basename "$SHELL")")
fi
