#!/usr/bin/env sh

# Batch check commonly used commands for efficiency
usable_batch git docker curl npx uv pkgx rg eza nvim ssh neovide python3 corepack uvx brew rustup conda pyenv nvm yarn pnpm socat bwrap sandbox-exec


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

# Random string generators
alias alnumer='cat /dev/random | base64 | tr -cd "[:alnum:]" | head -c'
alias hexer='cat /dev/random | base64 | tr -cd "[0-9a-fA-F]" | head -c'
alias passgen="tr -dc 'A-Za-z0-9!@#$%^&*()_+-=[]{}|;:,.<>?' < /dev/urandom | head -c"

# Create tmpdir and cd into it
alias isekai='cd `mktemp -d`'

# Cron utilities
alias cron-routine='cron_routine'

# Maintenance and cleanup
alias dot-clean='dotfiles_clean'

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
        alias kubectl='microk8s kubectl'
        alias helm='microk8s helm'
        # Selenium chromium on ARM
        alias selenium-arm-mircrok8s='microk8s kubectl run selenium --image=seleniarm/standalone-chromium --port=4444 && mkctl expose pod selenium --type NodePort --port 4444 --target-port 4444'
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
        # Postman alike in terminal
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
        # Gitleaks
        alias gitleaks-docker='docker run -v "$(realpath .):/$(basename $(realpath .))" zricethezav/gitleaks:latest "dir" "/$(basename $(realpath .))" "-v"'
        # Docling-serve
        alias docling-docker='docker run --rm -it --name docling-serve -p 5001:5001 -e DOCLING_SERVE_ENABLE_UI=1 quay.io/docling-project/docling-serve'
        # Cleanup docker data and cache
        alias docker-cleanup='yes | docker system prune -a --volumes && yes | docker builder prune -a'
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
        ! usable nvim && alias nvim='pkgx +gnu.org/libiconv +neovim.io nvim'
        ! usable hx && alias hx='pkgx +helix-editor.com hx'
        ## Text document viewer
        ! usable bat && alias bat='pkgx bat'
        ## Datafile transform
        ! usable dasel && alias dasel='pkgx dasel'
        ## SQLite
        ! usable sqlite3 && alias sqlite3='pkgx sqlite3'
        ## Listing files
        ! usable eza && alias eza='pkgx eza'
        ## Trash
        ! usable trash && alias trash='pkgx trash'
        ## System monitor
        ! usable btm && alias btm='pkgx btm'
        ## Docker
        ! usable docker && alias docker='pkgx docker'
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
        ## cloudflared
        ! usable cloudflared && alias cloudflared='pkgx cloudflared'
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
        # DevContainer
        ! usable devcontainer && alias devcontainer='npx --yes @devcontainers/cli'
        # http server
        ! usable http-server && alias http-server='npx --yes http-server'
        # Smart contract development
        ! usable remixd && alias remixd='npx --yes @remix-project/remixd'
        # Execute http files (http requests)
        ! usable httpyac && alias httpyac='npx --yes httpyac'
        # http api client for opencollection format
        ! usable bru && alias bru='npx --yes @usebruno/cli'
        # Serve live rendered markdown files
        ! usable mdts && alias mdts='npx --yes mdts'
        # Render markdown to html
        ! usable marked && alias marked='npx --yes marked'
        ## Marp
        ! usable marp && alias marp='npx --yes @marp-team/marp-cli@latest'
        ! usable marp-serve && alias marp-serve='npx --yes @marp-team/marp-cli@latest -s'
        # run commands from markdown files
        ! usable runme && alias runme='npx --yes runme'
        # Copilot CLI
        ! usable copilot && alias copilot='npx --yes @github/copilot'
        # OpenAI Codex
        ! usable codex && alias codex='npx --yes @openai/codex'
        # Kilo code
        ! usable kilo && alias kilo="npx --yes @kilocode/cli@latest"
        # Opencode
        ! usable opencode && alias opencode="npx --yes @opencode/cli@latest"
        # Freebuff
        ! usable frebuff && alias frebuff='npx --yes freebuff'
        # Command code
        ! usable cmdc && alias cmdc='npx --yes command-code@latest'
        # Agent skills manager
        ! usable skills && alias skills="npx --yes skills"
        # Tree-sitter CLI
        ! usable tree-sitter && alias tree-sitter='npx --yes tree-sitter-cli'
    }

# Claude Code: project MCPs still merge; the symlink is not auto-discovered.
# Project the canonical config at launch so disabled entries cannot leak through.
# A subshell keeps configuration/launcher variables out of the calling shell.
_claude_with_mcp() (
    claude_launcher=$1
    shift
    claude_mcp_config=$(jq -ce '
        if (.mcpServers | type) != "object" then
            error("mcpServers must be an object")
        else
            {mcpServers: (.mcpServers | with_entries(
                select(.value.enabled != false and .value.disabled != true)
                | .value |= del(.enabled, .disabled)
            ))}
        end
    ' "$HOME/.claude/mcp.json") || exit 1

    if [ "$claude_launcher" = native ]; then
        command claude --mcp-config "$claude_mcp_config" "$@"
    else
        # Defined after the npx fallback so its pkgx alias can expand here too.
        npx --yes @anthropic-ai/claude-code --mcp-config "$claude_mcp_config" "$@"
    fi
)

# Ignore our own alias when re-sourced by x-cmd; bypass usable's cached misses.
if (unalias claude 2>/dev/null; command -v claude >/dev/null 2>&1); then
    alias claude='_claude_with_mcp native'
elif command -v npx >/dev/null 2>&1; then
    alias claude='_claude_with_mcp npx'
fi

## Node-builtin package management for javascript
usable corepack && \
    {
        ! usable yarn && alias yarn='corepack yarn'
        ! usable pnpm && alias pnpm='corepack pnpm'
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

# Eza aliases
usable eza && \
    {
        alias el='eza -l'
        alias ea='eza -a'
        alias ela='eza -la'
        alias etree='eza -l -TL'
        alias gtree='eza --git-ignore -l -T'
    }

# Start neovim server locally
usable nvim && \
    {
        alias nvim-server='nvim --headless --listen localhost:6666'
        alias nvim-remote='nvim --server localhost:6666'
    }

# Start neovim server in remote ssh
usable ssh && \
    {
        alias nvim-ssh-server='nvim_ssh_server '
    }

# Connect to neovim server
usable neovide && \
    {
        alias neovide-remote='neovide --server=localhost:6666'
    }

# Chrome debug
alias chrome-debug='chrome_debug'

############################### PATH management ###############################

usable curl && alias install-pathman='curl -s https://webinstall.dev/pathman | bash'

alias install-pathman-npm='npm install -g pathman'

############################ Platform management ##############################

usable pacman && \
    {
        # List all installed packages with pacman
        alias pac-list='pacman -Q'
        # List explicitly installed packages with pacman
        alias pac-explicit='pacman -Qe'
        # List dependencies installed with pacman
        alias pac-deps='pacman -Qd'
        # List packages installed as dependencies with pacman
        alias pac-deps-installed='pacman -Qdt'
        # Remove orphan packages and dependencies with pacman
        alias pac-orphan-rm='sudo pacman -Rs $(pacman -Qqdt)'
        # Update all packages with pacman
        alias pac-update='sudo pacman -Syu --noconfirm'
    }

usable apt && \
    {
        # List all installed packages with apt
        alias apt-list='apt list --installed'
        # List explicitly installed packages with apt
        alias apt-explicit='apt-mark showmanual'
        # List dependencies installed with apt
        alias apt-deps='apt-cache depends'
        # List packages installed as dependencies with apt
        alias apt-deps-installed='apt-mark showauto'
        # Remove orphan packages and dependencies with apt
        alias apt-orphan-rm='sudo apt-get autoremove -y'
        # Update all packages with apt
        alias apt-update='sudo apt update && sudo apt upgrade -y && sudo apt-get --purge autoremove -y && sudo apt autoclean -y'
    }

usable pkg && \
    {
        # List all installed packages with pkg
        alias pkg-list='pkg list-installed'
        # List explicitly installed packages with pkg
        alias pkg-explicit='pkg list-installed | grep -v "installed as a dependency"'
        # List dependencies installed with pkg
        alias pkg-deps='pkg depends'
        # List packages installed as dependencies with pkg
        alias pkg-deps-installed='pkg list-installed | grep "installed as a dependency"'
        # Remove orphan packages and dependencies with pkg
        alias pkg-orphan-rm='pkg autoremove'
        # Update all packages with pkg
        alias pkg-update='pkg update && pkg upgrade -y && pkg autoremove -y && pkg autoclean -y'
    }

################################ Tooling ######################################

#################### X ########################

usable curl && alias install-x='eval "$(curl https://get.x-cmd.com)"'

#################### Pkgx ######################

usable curl && alias install-pkgx='curl -fsS https://pkgx.sh | sh'

#################### Brew ######################

usable curl && alias install-brew='/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'

usable brew && alias brew-update='brew update && brew upgrade -y && brew cleanup -s && brew autoremove'

#################### devcontainer ######################

if usable bun; then
    alias install-devcontainer='bun i -g --trust @devcontainers/cli'
elif usable npm; then
    alias install-devcontainer='npm i -g --allow-scripts @devcontainers/cli'
fi

################# Cheat sheet ##################

usable curl && alias install-cheat-sh='mkdir -p $HOME/.local/$USER/bin/ && curl https://cht.sh/:cht.sh > $HOME/.local/$USER/bin/cht.sh && chmod +x $HOME/.local/$USER/bin/cht.sh'

################### Python #####################

# install pixi
if usable curl; then
    alias install-pixi='curl -fsSL https://pixi.sh/install.sh | sh'
elif usable wget; then
    alias install-pixi='wget -qO- https://pixi.sh/install.sh | sh'
fi

# Install Dev Tunnels CLI in user home only (no sudo or system packages).
if usable curl || usable wget; then
    alias install-devtunnel='devtunnel_cli_install && setPath "$HOME/.local/bin"'
fi


################### NodeJs #####################

# install nvm
usable curl && alias install-nvm='mkdir -p $NVM_DIR && curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash -s -- --no-use'

usable nvm &&  {
    # install node
    alias nvm-install-node='nvm install node'
    # use default node
    alias nvm-use-default='nvm use default'
    # update node
    alias nvm-update='nvm install node --reinstall-packages-from=node -y && nvm use default'
    # cleanup unused version of node
    alias nvm-cleanup='nvm ls --no-colors | grep -o "^[[:blank:]]*v[0-9]*.[0-9]*.[0-9]*" | tr -d "[[:blank:]]v" | xargs -I % $SHELL -c ". $NVM_DIR/nvm.sh && nvm uninstall %"'
}

# install volta, create $VOLTA_HOME if $VOLTA_HOME is set and directory does not exist
usable curl && alias install-volta='([ -n $VOLTA_HOME ] && mkdir -p $VOLTA_HOME || true) && curl https://get.volta.sh | bash -s -- --skip-setup'

usable curl && alias install-bun='usable bash && usable curl && BUN_INSTALL="$HOME/.local/bun" bash <(curl -fsSL https://bun.sh/install)'

################### PHP ########################

usable curl && alias install-convertio='mkdir -p ~/.local/$USER/bin && curl -LJo ~/.local/$USER/bin/convertio https://api.convertio.co/convertio && chmod +x ~/.local/$USER/bin/convertio'

################### Editor #####################

# Install code-server
usable curl && alias install-code-server='mkdir -p ~/.local/$USER/bin && curl -s https://api.github.com/repos/cdr/code-server/releases/latest | grep "browser_download_url.*linux-x86_64.tar.gz" | cut -d : -f 2,3 | tr -d \\\" | xargs -n 1 curl -LJs | tar xvz -C ~/.local/$USER/bin/ --wildcards "**/code-server" --strip-components 1'

# Install vscode CLI
usable curl && alias install-vscode-cli='vscode_cli_install && reload-shell'
# Start vscode CLI tunnel with accepted license terms
usable code && alias code-tunnel='VSCODE_CLI_USE_FILE_KEYCHAIN=1 code tunnel --accept-server-license-terms'
usable code-tunnel && alias code-tunnel-service='code-tunnel service'
# Install/uninstall code tunnel service
usable code-tunnel-service && alias code-tunnel-service-install='code-tunnel-service install'
usable code-tunnel-service && alias code-tunnel-service-uninstall='code-tunnel-service uninstall'
usable code-tunnel-service && alias code-tunnel-service-log='code-tunnel-service log'

################### Rust #######################

# install rustup
usable curl && alias install-rustup='curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- --no-modify-path --profile minimal -v'

alias install-rustup-noprompt='install-rustup -y'

# automate rustup update
usable rustup && alias rustup-update='rustup update'

# automate cargo update
usable cargo && alias cargo-update='cargo install --list | grep -o "^\S*" | xargs cargo install --force'

# use cargo binstall to install cargo binaries
usable cargo && alias install-cargo-binstall='cargo install cargo-binstall'

# Jupyer kernel for Rust language
usable cargo && alias install-evcxr='(command -v cargo-binstall && cargo binstall evcxr_jupyter || cargo install --locked evcxr_jupyter) && evcxr_jupyter --install'

################ Shell toolings ################

## Advanced shell
alias install-nushell-cargo='cargo install --locked nu'
alias install-nushell-npm='npm install -g nushell'

## Smarter cd by using zoxide
usable curl && alias install-zoxide='curl -sSfL https://raw.githubusercontent.com/ajeetdsouza/zoxide/main/install.sh | sh'

## Terminal multiplexer
alias install-zellij-cargo='cargo install --locked zellij'

################ AI Agent CLI ################

usable curl && usable bash && alias install-hermes='curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash'

if usable bun; then
    alias install-opencode='bun i -g --trust @opencode/cli'
elif usable npm; then
    alias install-opencode='npm i -g --allow-scripts @opencode/cli'
fi

usable curl && usable bash && alias install-agy='curl -fsSL https://antigravity.google/cli/install.sh | bash'
usable agy && alias agyolo='agy --dangerously-skip-permissions'

################ DevSecMLOps ###################

! usable pkgx && usable curl && alias install-k3s='curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION="v1.24.10+k3s1" sh -s - server --cluster-init'
usable pkgx && alias install-k3s='pkgx k3sup install --local --k3s-version v1.24.10+k3s1'
usable curl && alias install-garden='curl -sL https://get.garden.io/install.sh | bash'

################ Sandboxing (Bubblewrap / bwrap) ################
# Common isolation flags:
#   --ro-bind / /      : Mounts entire host filesystem as read-only.
#   --dev / --proc     : Mounts standard virtual devices and procfs.
#   --tmpfs /tmp       : Ephemeral in-memory tmpfs so temp files do not touch host.
#   --unshare-all      : Unshares IPC, PID, network, UTS, cgroup namespaces.
#   --share-net        : Retains network access (omitted in 'pure' for air-gapped isolation).
#   --die-with-parent  : Kills the sandbox immediately if the parent shell/command terminates.
#   --chdir "$PWD"     : Preserves the current working directory inside the sandbox.
#
# Flavor distinctions:
#   - bwrap-ro   (Read-Only): Both system and $PWD are read-only. Network is enabled.
#                Use for: Safe inspection (git status/diff, rg, cat, dry-runs, log reading).
#                Alias: bwrap-run
#   - bwrap-rw   (Read-Write $PWD): System is read-only, but $PWD is writable (--bind "$PWD" "$PWD").
#                Use for: Builds, test runners, linters with --fix that should only modify $PWD.
#   - bwrap-pure (Air-Gapped Offline): Both system and $PWD are read-only; network is completely cut.
#                Use for: Offline tests. Host files remain readable; not a clean hostile-code environment.
#   - bwrap-sh   (Interactive Shell): Opens an interactive $SHELL session inside the read-only sandbox.
#                Use for: Manually exploring/debugging commands inside the sandbox environment.

usable bwrap && \
    {
        # Strict Read-Only (System + $PWD read-only, network enabled)
        alias bwrap-ro='bwrap --ro-bind / / --dev /dev --proc /proc --tmpfs /tmp --tmpfs /var/tmp --unshare-all --share-net --die-with-parent --chdir "$PWD" --'
        alias bwrap-run='bwrap-ro'

        # Workspace Writable (System read-only, $PWD writable, network enabled)
        alias bwrap-rw='bwrap --ro-bind / / --dev /dev --proc /proc --tmpfs /tmp --tmpfs /var/tmp --bind "$PWD" "$PWD" --unshare-all --share-net --die-with-parent --chdir "$PWD" --'

        # Air-Gapped Offline (System + $PWD read-only, network disabled)
        alias bwrap-pure='bwrap --ro-bind / / --dev /dev --proc /proc --tmpfs /tmp --tmpfs /var/tmp --unshare-all --die-with-parent --chdir "$PWD" --'

        # Interactive Shell inside Read-Only Sandbox
        alias bwrap-sh='bwrap --ro-bind / / --dev /dev --proc /proc --tmpfs /tmp --tmpfs /var/tmp --unshare-all --share-net --die-with-parent --chdir "$PWD" -- "$SHELL"'
    }

################ Sandboxing (macOS Seatbelt / sandbox-exec) ################
# Same mode intent as bwrap, but no private mounts or PID isolation.
# Host files remain readable. sandbox-exec is deprecated by Apple.
# Use $TMPDIR for scratch writes; hard-coded /tmp writes are denied.
usable sandbox-exec && \
    {
        # A subshell keeps scratch variables/traps out of the calling shell.
        _sandbox_exec() (
            sandbox_mode=$1
            shift
            sandbox_workspace=$(pwd -P) || exit 1
            sandbox_temp=$(mktemp -d "${TMPDIR:-/tmp}/sandbox.XXXXXXXX") || exit 1
            trap 'rm -rf -- "$sandbox_temp"' EXIT
            trap 'exit 130' INT
            trap 'exit 143' TERM
            sandbox_temp=$(cd "$sandbox_temp" && pwd -P) || exit 1
            TMPDIR="$sandbox_temp" TMP="$sandbox_temp" TEMP="$sandbox_temp" \
                sandbox-exec \
                -D "MODE=$sandbox_mode" \
                -D "WORKSPACE=$sandbox_workspace" \
                -D "TEMP_DIR=$sandbox_temp" \
                -f "$HOME/.config/sandbox/command.sb" "$@"
        )

        alias sandbox-ro='_sandbox_exec ro'
        alias sandbox-run='sandbox-ro'
        alias sandbox-rw='_sandbox_exec rw'
        alias sandbox-pure='_sandbox_exec pure'
        alias sandbox-sh='_sandbox_exec ro "$SHELL"'
    }

############################# Custom ##########################################
# Remote user provisioning utility
alias setup-user='setup_remote_user'

# Port forwarding via socat
usable socat && {
    alias socat-bind='socat_bind'
}

# Import custom alias
# shellcheck source=/dev/null
[ -r "$CONF_SH_DIR/aliases.user.sh" ] && . "$CONF_SH_DIR/aliases.user.sh"
