#!/usr/bin/env sh

if grep -qEi "(Microsoft|WSL)" /proc/version >/dev/null 2>&1 ; then
    if test -n "$DISPLAY" ; then
        DISPLAY="$(awk '/nameserver / {print $2; exit}' /etc/resolv.conf 2>/dev/null)":0
        export DISPLAY
        export LIBGL_ALWAYS_INDIRECT=0
    fi
fi
