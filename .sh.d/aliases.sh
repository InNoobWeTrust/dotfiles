#!/usr/bin/env sh

########################### Fancy prompt ######################################
if [ -n "$use_color" ]; then
    alias ls='ls --color=auto'
    alias dir='dir --color=auto'
    alias vdir='vdir --color=auto'
    alias grep='grep --colour=auto'
    alias egrep='egrep --colour=auto'
    alias fgrep='fgrep --colour=auto'

    # colored GCC warnings and errors
    export GCC_COLORS='error=01;31:warning=01;35:note=01;36:caret=01;32:locus=01:quote=01'
fi

if [ -n "$friendly_builtin" ]; then
    alias cp="cp -i"                          # confirm before overwriting something
    alias df='df -h'                          # human-readable sizes
    #alias free='free -g'                      # show sizes in GB
    alias np='nano -w PKGBUILD'
    alias more=less
    # some more ls aliases
    alias l='ls -hail'
    alias li='ls -hil'
    alias lh='ls -hl'
    alias la='ls -al'
fi

# Reload shell
alias reload-shell='exec $SHELL -l'

########################## Life hacks #########################################
# Add an "alert" alias for long running commands.  Use like so:
#   sleep 10; alert
usable notify-send && \
    alias alert='notify-send --urgency=low -i "$([ $? = 0 ] && echo terminal || echo error)" "$(history|tail -n1|sed -e '\''s/^\s*[0-9]\+\s*//;s/[;&|]\s*alert$//'\'')"'

# List processes run by current user
alias ps-me-not='ps -U `whoami` -u `whoami` u'

# Kill parallel processes running in another session
alias rampage='printf "what to kill? => "; victim=; read victim; ps -A | grep $victim | awk "{print $1}" | xargs -r kill'

# Random number generator
alias gacha='printf "Lower limit: "; read low; printf "Upper limit: "; read high; diff=$(($high - $low)); echo "Press ENTER key to stop!"; while ! read -t 0.25 -rsn 1; do printf "\r%5d" $(($RANDOM % $((diff + 1)) + $low)); done'

# Random string generators
alias alnumer='cat /dev/random | base64 | tr -cd "[:alnum:]" | head -c'
alias hexer='cat /dev/random | base64 | tr -cd "[0-9a-fA-F]" | head -c'

# Create tmpdir and cd into it
alias isekai='cd `mktemp -d`'

# Dummy sleep 5s with a spinner
alias lag5s='sleep 5 & job=$!; while kill -0 $job 2>/dev/null; do for s in / - \\ \|; do printf "\r%s" $s; sleep .1; done; done'

# Cron utilities
alias cron-routine='cron_routine'

# Batch open links.txt
usable open && \
    {
        alias batch-open='batch_open'
    }

# Git utilities
usable git && \
    {
        # Update all git repositories in current directory
        alias forgit-me-fetch='for d in $(ls -d */); do [ -d $d/.git/ ] && echo "Fetching git repo $d..." && (cd "$d" && git fetch --prune --all); done'
        alias forgit-me-pull='for d in $(ls -d */); do [ -d $d/.git/ ] && echo "Pulling git repo $d..." && (cd "$d" && git stash && git pull --rebase --all && git stash pop); done'
        alias forgit-me-config='forgit_me_config'
        alias git-web-url="git_web_url"
        alias gitlab-web-mr-create='gitlab_web_mr_create'
        alias gitlab-push-mr-create='gitlab_push_mr_create'
    }

# MicroK8s
usable microk8s && \
    {
        alias microk8s-kubectl='microk8s kubectl'
        # Selenium chromium on ARM
        alias selenium-arm-mircrok8s='microk8s-kubectl run selenium --image=seleniarm/standalone-chromium --port=4444 && mkctl expose pod selenium --type NodePort --port 4444 --target-port 4444'
    }

# Colima (container runtime on Mac/Linux with minimal setup)
usable colima && \
    {
        [ $(uname -s) = 'Darwin' ] && \
            {
            alias colima-start='colima start --cpu $(sysctl -n hw.ncpu) --memory $(system_profiler SPHardwareDataType | awk '"'"'/Memory/ {print $2}'"'"')'
            }

        [ $(uname -s) = 'Linux' ] && \
            {
                alias colima-start='colima start --cpu $(($(nproc) / 2)) --memory $(($(free -g | awk '"'"'/Mem/ {print $2}'"'"') / 2))'
            }
    }

# Docker utilities
usable docker && \
    {
        # Web browser in terminal
        alias browsh-docker='docker run --name browsh --rm -it browsh/browsh'
        # IDE on browser
        alias theia-docker='docker run --name theia -it -p 3000:3000 -v "$(pwd):/home/project:cached" theiaide/theia:next'
        # Full VsCode over browser
        alias code-server-docker='docker run --name code-server -it -p 127.0.0.1:8080:8080 -v "$PWD:/home/coder/project" codercom/code-server'
        # Postman alike interminal
    alias atac-docker='docker run --name atac --rm -it -v ${PWD}:/app juliencaposiena/atac'
        # Swagger api documentation generator
        alias swagger-docker='docker run --name swagger --rm -it  --user $(id -u):$(id -g) -e GOPATH=$(go env GOPATH):/go -v $HOME:$HOME -w $(pwd) quay.io/goswagger/swagger'
        # MongoDB
        alias mongo-docker='docker run --name mongo --rm -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=root -e MONGO_INITDB_ROOT_PASSWORD=root mongo:latest'
        # MySQL
        alias mysql-docker='docker run --name mysql --rm -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root mysql:latest'
        # PySpark notebook
        alias sparkbook-docker='docker run --name pyspark --rm -d -p 8888:8888 -v "$(pwd):/home/jovyan/work" jupyter/pyspark-notebook:latest'
        # Google's colab runtime
        alias colab-docker='docker run --name colab --rm -d -p 9000:8080 -v "$(pwd):/content" us-docker.pkg.dev/colab-images/public/runtime'
        # Selenium chromium
        alias selenium-docker='docker run --name selenium --rm -d -p 4444:4444 --shm-size 2g selenium/standalone-chrome:latest'
        # Selenium chromium on ARM
        alias selenium-arm-docker='docker run --name selenium --rm -d -p 4444:4444 --shm-size 2g seleniarm/standalone-chromium'
        # Convert markdown to pdf
        alias mdpdfinator-docker='docker run --name mdpdfinator --rm -v ${PWD}:/app yjpictures/mdpdfinator'
        # Rancher
        alias rancher-docker='docker run --name rancher --privileged -d --restart=unless-stopped -p 80:80 -p 443:443 rancher/rancher'
        # Cleanup docker data and cache
        alias docker-cleanup='yes | docker system prune -a --volumes && yes | docker builder prune -a'
    }

usable x && \
    {
        ## File manager
        ! usable yazi && alias yazi='pkgx yazi'
    }

usable pkgx && \
    {
        ## Advance devcontainer
        ! usable devpod && alias devpod='pkgx devpod'
        ## Terminal multiplexer
        ! usable zellij && alias zellij='pkgx zellij'
        ## File manager
        ! usable yazi && alias yazi='pkgx yazi'
        ## Code editors
        ! usable nvim && alias nvim='pkgx +neovim.io nvim'
        ! usable hx && alias hx='pkgx hx'
        ## Text document viewer
        ! usable bat && alias bat='pkgx bat'
        ## Listing files
        ! usable exa && alias exa='pkgx exa'
        ## System monitor
        ! usable btm && alias btm='pkgx btm'
        ## Docker management
        ! usable lazydocker && alias lazydocker='pkgx lazydocker'
        ## Git management
        ! usable lazygit && alias lazygit='pkgx lazygit'
        ## GNU Make
        ! usable make && alias make='pkgx make'
        ## Terraform
        ! usable terraform && alias terraform='pkgx terraform'
        ## Helm
        ! usable helm && alias helm='pkgx helm'
        ## K8s
        ! usable kubectl && alias kubectl='pkgx kubectl'
        ## K9s
        ! usable k9s && alias k9s='pkgx k9s'
        ## Lightweight kubernetes
        ! usable kind && alias kind='pkgx kind'
        ## Modern python package manager
        ! usable uv && alias uv='pkgx uv' && alias uvx='pkgx uvx'
        ## Nodejs package manager
        ! usable npm && alias npm='pkgx npm' &&  alias npx='pkgx npx'
        ## Jupyter notebook
        ! usable jupyter && alias jupyter='pkgx jupyter'
        ## yt-dlp
        ! usable yt-dlp && alias yt-dlp='pkgx yt-dlp'
        ## curl
        ! usable curl && alias curl='pkgx curl'
        ## wget
        ! usable wget && alias wget='pkgx wget'
    }

usable curl && \
    {
        # Quick terminal multiplexer
        alias netmux='bash <(curl -L zellij.dev/launch)'
        # Get random proxy
        alias http-proxy='curl --location "https://api.proxyscrape.com/v4/free-proxy-list/get?request=displayproxies&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all&skip=0&limit=1"'
    }

# Node utilities
usable npx && \
    {
        # http server
        alias http-server='npx http-server'
        # Smart contract development
        alias remixd='npx @remix-project/remixd'
        # Execute http files (http requests)
        alias httpyac='npx httpyac'
        # Serve live rendered markdown files
        alias markserv='npx markserv'
        # Render markdown to html
        alias marked='npx marked'
        # run commands from markdown files
        alias runme='npx runme'
        # Gemini-cli
        alias gemini='npx https://github.com/google-gemini/gemini-cli'
        # Claude code
        alias claude='npx @anthropic-ai/claude-code'
        # OpenAI Codex
        alias codex='npx @openai/codex'
    }

## Node-builtin package management for javascript
usable corepack && \
    {
        alias yarn='corepack yarn'
        alias pnpm='corepack pnpm'
    }

usable python3 && \
    {
        alias py-http-server='python3 -m http.server'
    }

usable uv && \
    {
        ! usable python && alias python='uv run python'
    }

usable uvx && \
    {
        ! usable marimo && alias marimo='uvx marimo'
        ! usable platformio && alias platformio='uvx platformio'
    }

# Find using ripgrep
usable rg && \
    {
        alias rgf='rg --files'
        alias rgfg='rg --files -g'
    }

# Exa aliases
usable exa && \
    {
        alias el='exa -l'
        alias ea='exa -a'
        alias ela='exa -la'
        alias etree='exa -l -TL'
        alias gtree='exa --git-ignore -l -T'
    }

# Start neovim server locally
usable nvim && \
    {
        alias nvim-server='nvim --headless --listen localhost:6666'
        alias nvim-remote='nvim --server localhost:6666'
    }

usable ssh && \
    {
        alias nvim-ssh-server='nvim_ssh_server '
    }

# Connect to neovim server
usable neovide && \
    {
        alias neovide-remote='neovide --server=localhost:6666'
    }


############################### PATH management ###############################

usable curl && alias install-pathman='curl -s https://webinstall.dev/pathman | bash'

alias install-pathman-npm='npm install -g pathman'

############################ Platform management ##############################

# List orphan packages with pacman
alias pac-orphan='pacman -Qdt'

# Remove orphan packages and dependencies with pacman
alias pac-orphan-rm='sudo pacman -Rs $(pacman -Qqdt)'

# automate pacman update
alias update-arch='sudo pacman -Syyu --noconfirm'

# automate update debian-based distros
alias update-debian='sudo apt update && sudo apt upgrade -y && sudo apt-get --purge autoremove -y && sudo apt autoclean -y'

# automate termux android
alias update-termux='pkg update && apt upgrade -y && apt-get autoremove -y && apt-get autoclean -y'

################################ Tooling ######################################

# Update possible tools (normal mode)
alias update-tooling='(update-rustup) || (update-pyenv) || (update-conda) || (update-brew)'

#################### X ########################

usable curl && alias install-x='eval "$(curl https://get.x-cmd.com)"'

#################### Pkgx ######################

usable curl && alias install-pkgx='curl -fsS https://pkgx.sh | sh'

#################### Brew ######################

usable curl && alias install-brew='/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"'

alias update-brew='usable brew && brew update && brew upgrade'

#################### Sdkman ####################

usable curl && alias install-sdkman='mkdir -p $HOME/.local && export SDKMAN_DIR="$HOME/.local/sdkman" && curl -s "https://get.sdkman.io" | bash'

################# Cheat sheet ##################

usable curl && alias install-cheat-sh='mkdir -p $HOME/.local/$USER/bin/ && curl https://cht.sh/:cht.sh > $HOME/.local/$USER/bin/cht.sh && chmod +x $HOME/.local/$USER/bin/cht.sh'

################### Python #####################

# automate conda update
alias update-conda='usable conda && conda update --all -y && conda clean --all -y'

# automate pip update
alias update-pip='usable pip && pip install -U $(pip list | tail -n +3 | cut -d " " -f 1 | tr "\n" " ")'
alias update-user-pip='usable pip && pip install -U --user $(pip list | tail -n +3 | cut -d " " -f 1 | tr "\n" " ")'

# install pyenv
usable curl && alias install-pyenv='curl https://pyenv.run | bash'

# update pyenv
alias update-pyenv='usable pyenv && pyenv update'

# install pipx
alias install-pipx='python3 -m pip install -U pipx && python3 -m pipx ensurepath'

# install poetry
usable curl && alias install-poetry='curl -sSL https://install.python-poetry.org | python -'
alias install-poetry-by-pipx='pipx install poetry'

# install micromamba
usable curl && alias install-micromamba='usable curl && "${SHELL}" <(curl -L micro.mamba.pm/install.sh)'
alias update-micromamba='usable micromamba && micromamba self-update'

################### NodeJs #####################

# install nvm
usable curl && alias install-nvm='mkdir -p $NVM_DIR && curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash -s -- --no-use'

# automate nvm update node
alias update-nvm='usable nvm && nvm install node --reinstall-packages-from=node -y && nvm use default'

# install volta
usable curl && alias install-volta='mkdir -p $VOLTA_HOME && curl https://get.volta.sh | bash -s -- --skip-setup'

usable curl && alias install-bun='usable bash && usable curl && BUN_INSTALL="$HOME/.local/bun" bash <(curl -fsSL https://bun.sh/install)'

# cleanup unused version of node
alias cleanup-nvm='nvm ls --no-colors | grep -o "^[[:blank:]]*v[0-9]*.[0-9]*.[0-9]*" | tr -d "[[:blank:]]v" | xargs -I % $SHELL -c ". $NVM_DIR/nvm.sh && nvm uninstall %"'

################### PHP ########################

usable curl && alias install-convertio='mkdir -p ~/.local/$USER/bin && curl -LJo ~/.local/$USER/bin/convertio https://api.convertio.co/convertio && chmod +x ~/.local/$USER/bin/convertio'

################### Editor #####################

# Update stable build of neovim
usable curl && alias install-nvim-stable='mkdir -p ~/.local/$USER/bin && curl -LJo ~/.local/$USER/bin/nvim https://github.com/neovim/neovim/releases/download/stable/nvim.appimage && chmod +x ~/.local/$USER/bin/nvim'

# Update nightly build of neovim
usable curl && alias install-nvim-nightly='mkdir -p ~/.local/$USER/bin && curl -LJo ~/.local/$USER/bin/nvim https://github.com/neovim/neovim/releases/download/nightly/nvim.appimage'

# Update code-server
usable curl && alias install-code-server='mkdir -p ~/.local/$USER/bin && curl -s https://api.github.com/repos/cdr/code-server/releases/latest | grep "browser_download_url.*linux-x86_64.tar.gz" | cut -d : -f 2,3 | tr -d \\\" | xargs -n 1 curl -LJs | tar xvz -C ~/.local/$USER/bin/ --wildcards "**/code-server" --strip-components 1'

# Download latest eclipse jdt language server
usable curl && alias install-jls='mkdir -p ~/.local/eclipse.jdt.ls/ && curl -s http://download.eclipse.org/jdtls/snapshots/jdt-language-server-latest.tar.gz | tar xvz -C ~/.local/eclipse.jdt.ls/'

################### Rust #######################

# install rustup
usable curl && alias install-rustup='curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- --no-modify-path --profile minimal -v'

alias install-rustup-noprompt='install-rustup -y'

# automate rustup update
alias update-rustup='usable rustup && rustup update'

# automate cargo update
alias update-cargo='usable cargo && cargo install --list | grep -o "^\S*" | xargs cargo install --force'

alias cargo-cross-install-armv6l='usable cargo && cargo install --target arm-unknown-linux-gnueabihf --root . '

# use cargo binstall to install cargo binaries
alias install-cargo-binstall='cargo install cargo-binstall'

# Jupyer kernel for Rust language
alias install-evcxr='(command -v cargo-binstall && cargo binstall evcxr_jupyter || cargo install --locked evcxr_jupyter) && evcxr_jupyter --install'

################ Shell toolings ################

## Advanced shell
alias install-nushell-cargo='cargo install --locked nu'
alias install-nushell-npm='npm install -g nushell'

## Smarter cd by using zoxide
usable curl && alias install-zoxide='curl -sSfL https://raw.githubusercontent.com/ajeetdsouza/zoxide/main/install.sh | sh'

## Terminal multiplexer
alias install-zellij-cargo='cargo install --locked zellij'

## AI Agent CLI
usable curl && alias install-opencode='curl -fsSL https://opencode.ai/install | bash'

################ DevSecMLOps ###################

alias install-garden='curl -sL https://get.garden.io/install.sh | bash'

############################# Custom ##########################################
# Import custom alias
# shellcheck source=/dev/null
[ -r "$CONF_SH_DIR/aliases.user.sh" ] && . "$CONF_SH_DIR/aliases.user.sh"
