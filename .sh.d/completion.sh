#!/usr/bin/env sh


if [ -n "$BASH_VERSION" ]; then
    # Load nvm bash_completion on demand
    [[ -n "$autocomplete_nvm" ]] && [[ -s "$NVM_DIR/bash_completion" ]] && \. "$NVM_DIR/bash_completion"

    # Add python argcomplete's bash completion globally
    if [ -r $HOME/bash_completion.d/python-argcomplete ]; then
        source $HOME/bash_completion.d/python-argcomplete
    fi
fi

