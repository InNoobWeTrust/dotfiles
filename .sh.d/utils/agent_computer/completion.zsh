#compdef agent_computer
# Zsh completion for the agent computer CLI.
# Uses previous-token dispatch so --mode values and file paths work at
# arbitrary argument positions, not only at fixed CURRENT offsets.
# Syntax is believed correct for zsh 5.x; runtime unverified (zsh not
# available on the reference host — disclose and do not install).

_agent_computer_names() {
  local -a names
  names=( ${(f)"$(agent_computer names 2>/dev/null)"} )
  _describe 'instance' names
}

_agent_computer() {
  local prev="${words[CURRENT-1]}"
  if (( CURRENT == 2 )); then
    local -a commands=(
      'up:Build/pull and start the container'
      'stop:Stop the container'
      'rm:Remove the container'
      'status:Show state or list all'
      'names:List instance names'
      'help:Show help'
      'completion:Emit shell completion'
    )
    _describe 'command' commands
    return
  fi
  case "$prev" in
    --mode)
      compadd -- webtop tuxee
      return ;;
    --password-file)
      _files
      return ;;
    --gpu-device)
      _files
      return ;;
    --cpus|--memory|--puid|--pgid|--desktop-port|--webdriver-port|--tz)
      # Scalar value; no completions.
      return ;;
  esac
  # --pull is boolean; next word falls through to command-level suggestions.
  case "$words[2]" in
    up)
      # Offer NAME (instance) then flags; both valid at any position after 'up'.
      _agent_computer_names
      compadd -- --mode --password-file --gpu-device --tz --puid --pgid \
                 --desktop-port --webdriver-port --cpus --memory \
                 --rebuild --pull --no-browser
      ;;
    stop|status)
      _agent_computer_names ;;
    rm)
      _agent_computer_names
      compadd -- --purge ;;
    completion)
      compadd -- bash zsh ;;
  esac
}

if (( $+functions[compdef] )); then
  compdef _agent_computer agent_computer
fi
