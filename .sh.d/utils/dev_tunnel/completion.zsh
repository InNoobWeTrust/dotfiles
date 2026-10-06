#compdef dev_tunnel
_dev_tunnel() {
  if (( CURRENT == 2 )); then
    local -a commands=('host:Host in foreground' 'help:Show help' 'completion:Emit completions')
    _describe 'command' commands
  elif (( CURRENT == 3 )); then
    case "$words[2]" in
      host) _files -/ ;;
      completion) _values 'shell' bash zsh ;;
    esac
  fi
}
if (( $+functions[compdef] )); then
  compdef _dev_tunnel dev_tunnel
fi
