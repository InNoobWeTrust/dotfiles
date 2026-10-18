#compdef agent_computer
_agent_computer_names() {
  local -a names
  names=( ${(f)"$(agent_computer names 2>/dev/null)"} )
  compadd -- $names
}
_agent_computer() {
  if (( CURRENT == 2 )); then
    local -a commands=(
      'up:Build and start the desktop'
      'stop:Stop the container'
      'rm:Remove the container'
      'status:Show state'
      'build:Build the image'
      'names:List instance names'
      'help:Show help'
      'completion:Emit completions'
    )
    _describe 'command' commands
  elif (( CURRENT == 3 )); then
    case "$words[2]" in
      up) _values 'option' '--gpu-device' '--rebuild' '--pull' '--no-browser' '--tz' '--puid' '--pgid' '--desktop-port' '--webdriver-port' ;;
      rm) _values 'option' '--purge' ;;
      stop|status) _agent_computer_names ;;
      build) _values 'option' '--pull' '--driver-url' ;;
      completion) _values 'shell' bash zsh ;;
    esac
  fi
}
if (( $+functions[compdef] )); then
  compdef _agent_computer agent_computer
fi
