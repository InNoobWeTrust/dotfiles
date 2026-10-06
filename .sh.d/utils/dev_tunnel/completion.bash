# Bash completion for the standalone foreground VS Code tunnel CLI.
_dev_tunnel() {
  local current="${COMP_WORDS[COMP_CWORD]}" directory
  COMPREPLY=()
  if [ "$COMP_CWORD" -eq 1 ]; then
    COMPREPLY=( $(compgen -W 'host help completion' -- "$current") )
  elif [ "$COMP_CWORD" -eq 2 ]; then
    case "${COMP_WORDS[1]}" in
      host) while IFS= read -r directory; do COMPREPLY+=("$directory"); done < <(compgen -d -- "$current") ;;
      completion) COMPREPLY=( $(compgen -W 'bash zsh' -- "$current") ) ;;
    esac
  fi
}
complete -F _dev_tunnel dev_tunnel
