# some more ls aliases
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'

# Add an "alert" alias for long running commands.  Use like so:
#   sleep 10; alert
alias alert='notify-send --urgency=low -i "$([ $? = 0 ] && echo terminal || echo error)" "$(history|tail -n1|sed -e '\''s/^\s*[0-9]\+\s*//;s/[;&|]\s*alert$//'\'')"'

# Kill parallel processes running in another session
alias rampage='printf "what to kill? => "; victim=;read victim;ps -A | grep $victim | awk "{print $1}" | xargs -r kill'

# Gacha-inspired number generator
alias gacha='printf "Lower limit: ";read low;printf "Upper limit: ";read high;diff=$(($high - $low));echo "Press ENTER key to stop!";while ! read -t 0.25 -rsn 1;do printf "\r%5d" $(($RANDOM % $((diff + 1)) + $low));done'

# Update all git repositories in current directory
alias forgit-me-pull='for d in `ls -d */`; do [[ -d $d/.git/ ]] && echo "Updating git repo $d" && (cd $d; git stash; git pull --rebase --all; git stash pop); done'

# Web browser in terminal
alias browsh='docker run -it --rm browsh/browsh'

# IDE over browser
alias theia='docker run -it -p 3000:3000 -v "$(pwd):/home/project:cached" theiaide/theia:next'

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

# automate pip update
alias pipauto='pip install --user -U $(pip freeze | sed "s/=.*//" | paste -sd " ")'

# automate nvm update node
alias nvmauto='nvm install node --reinstall-packages-from=node -y'

# automate rustup update
alias rustupauto='rustup update'

# automate flutter upgrade
alias flutterauto='flutter upgrade'

# Update stable build of neovim
alias snvimauto='curl -LJo ~/.local/bin/nvim https://github.com/neovim/neovim/releases/download/stable/nvim.appimage'

# Update nightly build of neovim
alias nnvimauto='curl -LJo ~/.local/bin/nvim https://github.com/neovim/neovim/releases/download/nightly/nvim.appimage'

# automate neovim update
alias nvimauto='nvim +PlugUpgrade +PlugUpdate +UpdateRemotePlugins +PlugClean +qa'

# Download latest eclipse jdt language server
alias jlsauto='mkdir -p ~/.local/bin/eclipse.jdt.ls/ && curl -s http://download.eclipse.org/jdtls/snapshots/jdt-language-server-latest.tar.gz | tar xvz -C ~/.local/bin/eclipse.jdt.ls/'

# automate update system all
alias manjaroauto='pacauto && condauto && nvmauto && rustupauto && nvimauto && flutterauto && pipauto'

# automate termux android
alias termuxauto='pkg update && apt upgrade -y && apt-get autoremove -y && apt-get autoclean -y && nvimauto && pipauto'

# Import custom alias for current system
if [ -f ~/.bash_aliases.user ]; then
    . ~/.bash_aliases.user
fi
