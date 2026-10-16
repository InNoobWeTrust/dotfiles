#!/usr/bin/env bash

# Ghosttext needs Bash 4+; leave older/non-terminal shells unchanged.
if (( BASH_VERSINFO[0] >= 4 )) && [[ $- == *i* && -t 0 && -t 1 && -z ${BLE_VERSION-} ]]; then
    if [[ -r ${XDG_DATA_HOME:-$HOME/.local/share}/blesh/ble.sh ]]; then
        # shellcheck source=/dev/null
        source "${XDG_DATA_HOME:-$HOME/.local/share}/blesh/ble.sh" --attach=none
    fi
fi
