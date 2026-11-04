# Bash completion for the agent computer CLI.
# Syntax verified: bash -n. Runtime tested for --mode values, file paths, and
# boolean --pull (next word still receives flag suggestions).
# Read native compgen results without splitting file paths on spaces (Bash 3.2).
_agent_computer_reply() {
  local reply
  COMPREPLY=()
  while IFS= read -r reply; do COMPREPLY+=("$reply"); done
}

_agent_computer() {
  local current="${COMP_WORDS[COMP_CWORD]}" prev
  COMPREPLY=()
  prev="${COMP_WORDS[COMP_CWORD-1]}"
  if [ "$COMP_CWORD" -eq 1 ]; then
    _agent_computer_reply < <(compgen -W 'up stop rm status names help completion' -- "$current")
    return
  fi
  case "$prev" in
    --mode)
      _agent_computer_reply < <(compgen -W 'webtop tuxee' -- "$current")
      return ;;
    --password-file)
      _agent_computer_reply < <(compgen -f -- "$current")
      return ;;
    --gpu-device)
      _agent_computer_reply < <(compgen -f -- "$current")
      return ;;
    --cpus|--memory|--puid|--pgid|--desktop-port|--webdriver-port|--tz)
      return ;;
  esac
  case "${COMP_WORDS[1]}" in
    up)
      # Optional NAME before flags; offer both instance names and flags.
      if [ "$COMP_CWORD" -eq 2 ] && [[ "$current" != -* ]]; then
        local instances
        instances=$(agent_computer names 2>/dev/null)
        _agent_computer_reply < <(compgen -W "$instances --mode --password-file --gpu-device --tz --puid --pgid --desktop-port --webdriver-port --cpus --memory --rebuild --pull --no-browser" -- "$current")
      else
        _agent_computer_reply < <(compgen -W '--mode --password-file --gpu-device --tz --puid --pgid --desktop-port --webdriver-port --cpus --memory --rebuild --pull --no-browser' -- "$current")
      fi
      ;;
    stop|status)
      if [[ "$current" != -* ]]; then
        local instances
        instances=$(agent_computer names 2>/dev/null)
        _agent_computer_reply < <(compgen -W "$instances" -- "$current")
      fi
      ;;
    rm)
      local instances
      instances=$(agent_computer names 2>/dev/null)
      _agent_computer_reply < <(compgen -W "$instances --purge" -- "$current")
      ;;
    completion)
      _agent_computer_reply < <(compgen -W 'bash zsh' -- "$current")
      ;;
  esac
}
complete -F _agent_computer agent_computer
