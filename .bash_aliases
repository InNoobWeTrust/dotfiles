# some more ls aliases
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'

# Add an "alert" alias for long running commands.  Use like so:
#   sleep 10; alert
alias alert='notify-send --urgency=low -i "$([ $? = 0 ] && echo terminal || echo error)" "$(history|tail -n1|sed -e '\''s/^\s*[0-9]\+\s*//;s/[;&|]\s*alert$//'\'')"'

# automate pacman update
alias pacmanauto='sudo pacman -Syyu -y'

# automate conda update
alias condauto='conda update -n base conda -y && conda clean --all -y'

# automate nvm update node
alias nvmauto='nvm install node --reinstall-packages-from=node -y'

# automate update system all
alias auto='pacmanauto && condauto && nvmauto'
