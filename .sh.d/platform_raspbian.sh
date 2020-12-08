#!/usr/bin/env sh

if test -r /etc/os-release && test 'raspbian' = "$(cat /etc/os-release | sed -n 's/^ID=\(.*\)/\1/p')"; then
    alias cpu-temp='vcgencmd measure_temp'
    alias clock_speed='vcgencmd measure_clock arm'
    alias vnc-serve='vncserver -geometry 720x640 -randr 1920x1080,1600x1200,1440x900,1024x768,720x640'
    alias vnc-res-640='xrandr -s 720x640'
    alias vnc-res-768='xrandr -s 1024x768'
    alias vnc-res-900='xrandr -s 1440x900'
    alias vnc-res-1200='xrandr -s 1600x1200'
    alias vnc-res-1080='xrandr -s 1920x1080'
    alias remote-it-now='sudo apt update && sudo apt install -y connectd && sudo connectd_installer'
    alias install-pikiss='curl -sSL https://git.io/JfAPE | bash'
fi
