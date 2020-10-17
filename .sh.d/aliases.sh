#!/usr/bin/env sh

########################### Fancy prompt ######################################
if [ -n "$use_color" ]; then
    alias ls='ls --color=auto'
    alias dir='dir --color=auto'
    alias vdir='vdir --color=auto'
    alias grep='grep --colour=auto'
    alias egrep='egrep --colour=auto'
    alias fgrep='fgrep --colour=auto'
    alias ls='ls --color=auto'

    # colored GCC warnings and errors
    export GCC_COLORS='error=01;31:warning=01;35:note=01;36:caret=01;32:locus=01:quote=01'
fi

if [ -n "$friendly_builtin" ]; then
    alias cp="cp -i"                          # confirm before overwriting something
    alias df='df -h'                          # human-readable sizes
    alias free='free -m'                      # show sizes in MB
    alias np='nano -w PKGBUILD'
    alias more=less
    # some more ls aliases
    alias li='ls --almost-all --classify --human-readable --inode -l'
    alias lh='ls --almost-all --classify --human-readable -l'
    alias ll='ls --almost-all --classify -l'
    alias la='ls --almost-all --classify'
    alias l='ls --almost-all --classify'
fi

# Activate starship prompt
alias env_starship='with_starship=true'

# Reload shell
alias reload-shell='exec $SHELL'

# Reload master config
alias reload-shrc='. ~/.shrc'

# Force colorful prompt for current session
alias env_rainbow='use_color=true'
alias rainbow-shell='env_rainbow reload-shrc'

# Force friendly builtin for current session
alias env_friendly='friendly_builtin=true'
alias friendly-shell='env_friendly reload-shrc'

# Force all enhancement for current sessions
alias godmode='env_rainbow env_friendly env_starship reload-shrc'

# install starship prompt
alias install-starship="mkdir -p ~/.local/$USER/bin && curl -fsSL https://starship.rs/install.sh | bash -s -- --bin-dir ~/.local/$USER/bin --platform unknown-linux-gnu"
alias install-starship-cargo='cargo install starship'
alias install-starship-x86="mkdir -p ~/.local/$USER/bin && curl -s https://api.github.com/repos/starship/starship/releases/latest | grep 'browser_download_url.*starship-x86_64-unknown-linux-gnu.tar.gz' | head -n1 | cut -d : -f 2,3 | tr -d \\\" | xargs -n 1 curl -LJs | tar xvz -C ~/.local/$USER/bin/ starship"

########################## Life hacks #########################################
# Add an "alert" alias for long running commands.  Use like so:
#   sleep 10; alert
alias alert='notify-send --urgency=low -i "$([ $? = 0 ] && echo terminal || echo error)" "$(history|tail -n1|sed -e '\''s/^\s*[0-9]\+\s*//;s/[;&|]\s*alert$//'\'')"'

# List processes run by current user
alias ps-me-not='ps -U `whoami` -u `whoami` u'
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

# Full VsCode over browser
alias code-server-docker='docker run -it -p 127.0.0.1:8080:8080 -v "$PWD:/home/coder/project" codercom/code-server'

############################### PATH management ###############################

alias install-pathman='curl -s https://webinstall.dev/pathman | bash'

alias install-pathman-npm='npm install -g pathman'

############################ Platform management ##############################

# List orphan packages with pacman
alias pacorphan='pacman -Qdt'

# Remove orphan packages and dependencies with pacman
alias pacorphanrm='sudo pacman -Rs $(pacman -Qqdt)'

# automate pacman update
alias update-arch='sudo pacman -Syyu --noconfirm'

# automate apt update
alias update-apt='sudo apt update && sudo apt upgrade -y && sudo apt-get --purge autoremove -y && sudo apt autoclean -y'

# automate update manjaro
alias update-manjaro='update-arch'

# automate update debian-based distros
alias update-debian='update-apt'

# automate termux android
alias update-termux='pkg update && apt upgrade -y && apt-get autoremove -y && apt-get autoclean -y'

################################ Tooling ######################################

# Update possible tools (normal mode)
alias tooling-update='update-nvim || update-rustup || update-pyenv || update-nvm || update-brew'
# Update all tools below (nuke mode, force update all cargo packages is slow)
alias tooling-nuke-update='tooling-update || update-cargo'

#################### Brew ######################

alias install-brew='/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"'

alias update-brew='usable brew && brew update && brew upgrade'

################# Cheat sheet ##################

alias install-cheat-sh="mkdir -p $HOME/.local/$USER/bin/ && curl https://cht.sh/:cht.sh > $HOME/.local/$USER/bin/cht.sh && chmod +x $HOME/.local/$USER/bin/cht.sh"

################### Python #####################

# automate conda update
alias update-conda='usable conda && conda update --all -y && conda clean --all -y'

# automate pip update
alias update-pip='usable pip && pip install -U $(pip freeze | sed "s/=.*//" | paste -sd " ")'
alias update-user-pip='usable pip && pip install -U --user $(pip freeze | sed "s/=.*//" | paste -sd " ")'

# install pyenv
alias install-pyenv='curl https://pyenv.run | bash'

# update pyenv
alias update-pyenv='usable pyenv && pyenv update'

# install poetry
alias install-poetry='curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python'

################### NodeJs #####################

# install nvm
alias install-nvm='mkdir -p $NVM_DIR && curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.2/install.sh | bash -s -- --no-use'

# automate nvm update node
alias update-nvm='usable nvm && nvm install node --reinstall-packages-from=node -y'

################### Editor #####################

# Update stable build of neovim
alias install-nvim-stable="mkdir -p ~/.local/$USER/bin && curl -LJo ~/.local/$USER/bin/nvim https://github.com/neovim/neovim/releases/download/stable/nvim.appimage && chmod +x ~/.local/$USER/bin/nvim"

# Update nightly build of neovim
alias install-nvim-nightly="mkdir -p ~/.local/$USER/bin && curl -LJo ~/.local/$USER/bin/nvim https://github.com/neovim/neovim/releases/download/nightly/nvim.appimage"

# automate neovim update
alias update-nvim='usable nvim && nvim +PlugUpgrade +PlugUpdate +UpdateRemotePlugins +PlugClean +qa'

# Update code-server
alias install-code-server="mkdir -p ~/.local/$USER/bin && curl -s https://api.github.com/repos/cdr/code-server/releases/latest | grep 'browser_download_url.*linux-x86_64.tar.gz' | cut -d : -f 2,3 | tr -d \\\" | xargs -n 1 curl -LJs | tar xvz -C ~/.local/$USER/bin/ --wildcards '**/code-server' --strip-components 1"

# Download latest eclipse jdt language server
alias install-jls='mkdir -p ~/.local/eclipse.jdt.ls/ && curl -s http://download.eclipse.org/jdtls/snapshots/jdt-language-server-latest.tar.gz | tar xvz -C ~/.local/eclipse.jdt.ls/'

################### Rust #######################

# install rustup
alias install-rustup='curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- --no-modify-path --profile minimal --component rls rust-analysis rust-src clippy --target wasm32-unknown-unknown -v'

alias install-rustup-noprompt='curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- --no-modify-path --profile minimal --component rls rust-analysis rust-src clippy --target wasm32-unknown-unknown -v -y'

# automate rustup update
alias update-rustup='usable rustup && rustup update'

# automate cargo update
alias update-cargo='usable cargo && cargo install --list | grep -o "^\S*" | xargs cargo install --force'

############################# Custom ##########################################
# Import custom alias
if [ -r $CONF_SH_DIR/aliases.user.sh ]; then
    source $CONF_SH_DIR/aliases.user.sh
fi
