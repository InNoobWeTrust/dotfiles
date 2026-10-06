#compdef dev_workspace dev_workspace.sh

_dev_workspace() {
    local curcontext="$curcontext" state line
    typeset -A opt_args

    local -a commands
    commands=(
        'prepare:Print the static devcontainer configuration'
        'up:Start the development container'
        'stop:Stop the development container'
        'status:Show the development container status'
        'tunnel:VS Code remote tunnel commands (defaults to host)'
        'tailscale:Rootless Tailscale inside container (defaults to host)'
        'completion:Generate shell completion script (bash or zsh)'
    )

    local -a tunnel_cmds
    tunnel_cmds=(
        'host:Start VS Code tunnel in foreground'
        'login:Log in to VS Code tunnel inside container'
    )

    _arguments -C \
        '1:command:->cmd' \
        '*::args:->args'

    case $state in
        cmd)
            _describe -t commands 'dev_workspace command' commands
            ;;
        args)
            case $words[1] in
                tunnel)
                    _arguments -C \
                        '1:subcommand:->tunnel_sub' \
                        '*:repository directory:_files -/'
                    case $state in
                        tunnel_sub)
                            _describe -t tunnel_cmds 'tunnel subcommand' tunnel_cmds
                            ;;
                    esac
                    ;;
                tailscale)
                    _arguments -C \
                        '1:subcommand:(host login ssh)' \
                        '*::args:->ts_args'
                    if [[ $state == ts_args ]]; then
                        _arguments \
                            '*:repository directory:_files -/'
                    fi
                    ;;
                up)
                    _arguments \
                        '--config[Configuration file]:config file:_files' \
                        '*:repository directory:_files -/'
                    ;;
                prepare|stop|status)
                    _files -/
                    ;;
                completion)
                    local -a shells
                    shells=('bash:Generate bash completion script' 'zsh:Generate zsh completion script')
                    _describe -t shells 'shell' shells
                    ;;
            esac
            ;;
    esac
}

if (( $+functions[compdef] )); then
    compdef _dev_workspace dev_workspace dev_workspace.sh
fi
