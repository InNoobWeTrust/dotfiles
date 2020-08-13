#!/usr/bin/env sh

if grep -qEi "(Microsoft|WSL)" /proc/version &> /dev/null ; then
    test -n $DISPLAY && export DISPLAY=localhost:0.0
fi
