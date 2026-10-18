# Bash completion for the agent computer CLI.
_agent_computer() {
  local current="${COMP_WORDS[COMP_CWORD]}" instances
  COMPREPLY=()
  if [ "$COMP_CWORD" -eq 1 ]; then
    COMPREPLY=( $(compgen -W 'up stop rm status build names help completion' -- "$current") )
    return
  fi
  case "${COMP_WORDS[1]}" in
    up)
      COMPREPLY=( $(compgen -W '--gpu-device --tz --puid --pgid --desktop-port --webdriver-port --rebuild --pull --no-browser' -- "$current") )
      ;;
    rm)
      COMPREPLY=( $(compgen -W '--purge' -- "$current") )
      ;;
    stop|status)
      instances=$(agent_computer names 2>/dev/null)
      COMPREPLY=( $(compgen -W "$instances" -- "$current") )
      ;;
    build)
      COMPREPLY=( $(compgen -W '--pull --driver-url' -- "$current") )
      ;;
    completion)
      COMPREPLY=( $(compgen -W 'bash zsh' -- "$current") )
      ;;
  esac
}
complete -F _agent_computer agent_computer
