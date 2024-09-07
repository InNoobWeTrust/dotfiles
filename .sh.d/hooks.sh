#!/usr/bin/env sh

# pyenv
usable pyenv && eval "$(pyenv init -)" && eval "$(pyenv virtualenv-init -)"

# nodenv
usable nodenv && eval "$(nodenv init -)"

# direnv
usable direnv && eval "$(direnv hook "${SHELL##*/}")"

# starship
[ -n "$with_starship" ] && usable starship && eval "$(starship init "${SHELL##*/}")"

# If not running in CodeSpace, use git protocol instead of https
#[ -z "$CODESPACES" ] && git config --global url."git@github.com".insteadOf "https://github.com"
