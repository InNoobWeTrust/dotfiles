#!/usr/bin/env sh

# github's cli
usable gh && eval "$(gh completion)"

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
    if [ -n "$BREW_HOME" ] && [ -d "$BREW_HOME/etc/bash_completion.d" ]; then
        tmp="$(mktemp)"
        find "$BREW_HOME/etc/bash_completion.d" -maxdepth 1 -follow -type f -readable > "$tmp"
        while IFS= read -r s
        do
            # shellcheck source=/dev/null
            . "$s"
        done < "$tmp"
        rm "$tmp"
    fi

    # Custom completion
    if [ -d "$HOME/.bash_completion.d/" ]; then
        tmp="$(mktemp)"
        find "$HOME/.bash_completion.d/" -maxdepth 1 -follow -type f -readable > "$tmp"
        while IFS= read -r s
        do
            # shellcheck source=/dev/null
            . "$s"
        done < "$tmp"
        rm "$tmp"
    fi
fi

