#!/usr/bin/env sh


if [ -n "$BASH_VERSION" ]; then
    # Load nvm bash_completion on demand
    [[ -n "$autocomplete_nvm" ]] && [[ -s "$NVM_DIR/bash_completion" ]] && \. "$NVM_DIR/bash_completion"

    # Add python argcomplete's bash completion globally
    if [ -r $HOME/bash_completion.d/python-argcomplete ]; then
        . $HOME/bash_completion.d/python-argcomplete
    fi
    if [ -n "$BREW_HOME" ] && [ -d $BREW_HOME/etc/bash_completion.d ]; then
        for s in $(find $BREW_HOME/etc/bash_completion.d -maxdepth 1 -follow -type f -readable); do
            . $s
        done
    fi

    # Custom completion
    if [ -d $HOME/.bash_completion.d/ ]; then
        for s in $(find $HOME/.bash_completion.d/ -maxdepth 1 -follow -type f -readable); do
            . $s
        done
    fi
fi

