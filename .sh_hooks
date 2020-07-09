#!/usr/bin/env sh

# Hook pyenv
which pyenv >/dev/null 2>&1 && eval "$(pyenv init -)" && eval "$(pyenv virtualenv-init -)"

# Hook direnv
which direnv >/dev/null 2>&1 && eval "$(direnv hook ${SHELL##*/})"

# Hook starship
if [ -n "$with_starship" ]; then
    which starship &> /dev/null && eval "$(starship init ${SHELL##*/})"
fi
