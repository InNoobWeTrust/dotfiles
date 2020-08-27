#!/usr/bin/env sh

# Hook pyenv
usable pyenv && eval "$(pyenv init -)" && eval "$(pyenv virtualenv-init -)"

# Hook direnv
usable direnv && eval "$(direnv hook ${SHELL##*/})"

# Hook starship
if [ -n "$with_starship" ]; then
    usable starship && eval "$(starship init ${SHELL##*/})"
fi
