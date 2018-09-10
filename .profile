export QT_QPA_PLATFORMTHEME="qt5ct"
export GTK2_RC_FILES="$HOME/.gtkrc-2.0"
# fix "xdg-open fork-bomb" export your preferred browser from here
export BROWSER=/usr/bin/firefox

# Set TERMINFO
#export TERMINFO=/usr/lib/terminfo

if [ -f ~/.sh_path ]; then
    . ~/.sh_path
fi
