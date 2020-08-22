#!/usr/bin/env sh

if grep -qEi "(Microsoft|WSL)" /proc/version &> /dev/null ; then
    if test -n $DISPLAY ; then
        export DISPLAY=$(awk '/nameserver / {print $2; exit}' /etc/resolv.conf 2>/dev/null):0
        export LIBGL_ALWAYS_INDIRECT=0
    fi
fi
