#compdef dev_slurm dev_slurm.sh

_dev_slurm() {
    local curcontext="$curcontext" state line
    typeset -A opt_args

    local -a commands
    commands=(
        'tunnel:Submit or manage VS Code tunnel Slurm jobs'
        'tailscale:Submit or manage integrated Tailscale SSH Slurm jobs'
        'status:Check active tunnel jobs'
        'stop:Cancel all tunnel jobs'
        'completion:Generate shell completion script (bash or zsh)'
    )

    local -a tunnel_cmds
    tunnel_cmds=(
        'host:Submit full VS Code tunnel job (defaults to host)'
        'stop:Cancel active VS Code tunnel job'
    )

    _arguments -C \
        '1:command:->cmd' \
        '*::args:->args'

    case $state in
        cmd)
            _describe -t commands 'dev_slurm command' commands
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
                        '1:subcommand:(host stop)' \
                        '*:repository directory:_files -/'
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
    compdef _dev_slurm dev_slurm dev_slurm.sh
fi
