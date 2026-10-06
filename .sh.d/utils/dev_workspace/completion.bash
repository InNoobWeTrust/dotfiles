_dev_workspace() {
    local cur prev words cword
    if declare -F _init_completion >/dev/null 2>&1; then
        _init_completion || return
    else
        COMPREPLY=()
        cur="${COMP_WORDS[COMP_CWORD]}"
        prev="${COMP_WORDS[COMP_CWORD-1]}"
        words=("${COMP_WORDS[@]}")
        cword=$COMP_CWORD
    fi

    local top_commands="prepare up stop status tunnel tailscale completion"
    local tunnel_commands="host"

    if [ "$cword" -eq 1 ]; then
        COMPREPLY=( $(compgen -W "$top_commands" -- "$cur") )
        return 0
    fi

    case "${words[1]}" in
        tunnel)
            if [ "$cword" -eq 2 ]; then
                COMPREPLY=( $(compgen -W "$tunnel_commands" -- "$cur") )
            else
                COMPREPLY=( $(compgen -d -- "$cur") )
            fi
            ;;
        tailscale)
            if [ "$cword" -eq 2 ]; then
                COMPREPLY=( $(compgen -W "host ssh" -- "$cur") )
            else
                COMPREPLY=( $(compgen -d -- "$cur") )
            fi
            ;;
        up)
            if [ "$prev" = "--config" ]; then
                COMPREPLY=( $(compgen -f -- "$cur") )
            elif [[ "$cur" == -* ]]; then
                COMPREPLY=( $(compgen -W "--config" -- "$cur") )
            else
                COMPREPLY=( $(compgen -d -- "$cur") )
            fi
            ;;
        prepare|stop|status)
            COMPREPLY=( $(compgen -d -- "$cur") )
            ;;
        completion)
            COMPREPLY=( $(compgen -W "bash zsh" -- "$cur") )
            ;;
    esac
}

complete -F _dev_workspace dev_workspace dev_workspace.sh
