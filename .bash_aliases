# some more ls aliases
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'

# Add an "alert" alias for long running commands.  Use like so:
#   sleep 10; alert
alias alert='notify-send --urgency=low -i "$([ $? = 0 ] && echo terminal || echo error)" "$(history|tail -n1|sed -e '\''s/^\s*[0-9]\+\s*//;s/[;&|]\s*alert$//'\'')"'

# List orphan packages with pacman
alias pacorphan='pacman -Qdt'

# Remove orphan packages and dependencies with pacman
alias pacorphanrm='sudo pacman -Rs $(pacman -Qqdt)'

# automate pacman update
alias pacauto='sudo pacman -Syyu --noconfirm'

# automate apt update
alias aptauto='sudo apt update && sudo apt upgrade -y && sudo apt-get --purge autoremove -y && sudo apt autoclean -y'

# automate conda update
alias condauto='conda update --all -y && conda clean --all -y'

# automate nvm update node
alias nvmauto='nvm install node --reinstall-packages-from=node -y'

# automate update system all
alias manjaroauto='pacauto && condauto && nvmauto'

# automate termux android
alias termuxauto='apt update && apt upgrade -y && apt-get autoremove -y && apt-get autoclean -y'
