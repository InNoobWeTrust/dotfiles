# shellcheck shell=bash
# Shared creation-time credentials. Source only; never read private file contents.
# Public: credential_validate PATH -> canonical host path; credential_prepare
# sets cmd_up's credential_path/credential_created without reading file contents.
# credential_status emits key-only metadata; print_login/credential_gate use caller state.
DEFAULT_LOGIN_USER=root
DEFAULT_LOGIN_PASSWORD=agent-computer
# shellcheck disable=SC2034 # Public native bind destination consumed by both modes.
CREDENTIAL_CONTAINER_PATH=/run/secrets/agent-computer-password

# shellcheck disable=SC2034 # Sets the caller's dynamic credential context.
credential_prepare() {
  local path="$1"
  credential_created=0
  if [ -z "$path" ]; then
    path="${XDG_CONFIG_HOME:-$HOME/.config}/agent-computer/password"
    if [ ! -e "$path" ] && [ ! -L "$path" ]; then
      (umask 077; mkdir -p -- "$(dirname -- "$path")") ||
        die 'Cannot create the default credential directory.'
      # Only the noclobber winner may advertise the known initial password.
      if (umask 077; set -C; printf '%s' "$DEFAULT_LOGIN_PASSWORD" > "$path") 2>/dev/null; then
        credential_created=1
      elif [ ! -e "$path" ] && [ ! -L "$path" ]; then
        die 'Cannot create the default credential file.'
      fi
    fi
  fi
  credential_path=$(credential_validate "$path") || return 1
}

# Metadata only: preserve the original Tuxee owner/mode/type/link checks.
# Reject mount-unsafe paths; canonicalize only the containing directory.
credential_validate() {
  local path="$1" directory metadata owner mode size links
  [ -n "$path" ] && [ -f "$path" ] && [ -r "$path" ] && [ ! -L "$path" ] ||
    die 'Credentials require a readable regular password file (not a symlink).'
  directory=$(cd -- "$(dirname -- "$path")" && pwd -P) ||
    die 'Cannot canonicalize the password file directory.'
  path="${directory%/}/$(basename -- "$path")"
  case "$path" in
    *:*|*$'\n'*|*$'\r'*) die 'Password file path cannot be bound safely.' ;;
  esac
  metadata=$(stat -c '%u %a %s %h' -- "$path" 2>/dev/null) ||
    metadata=$(stat -f '%u %Lp %z %l' "$path" 2>/dev/null) ||
    die 'Cannot inspect password file metadata.'
  read -r owner mode size links <<< "$metadata"
  [ "$owner" = "$(id -u)" ] && [ "$mode" = 600 ] &&
    [[ "$size" =~ ^[0-9]+$ ]] && [ "$size" -gt 0 ] && [ "$links" = 1 ] ||
    die 'Password file must be nonempty, owned by you, mode 0600 and dedicated (one link).'
  printf '%s\n' "$path"
}

# Main invokes this only for a new container, before any engine mutation.
# shellcheck disable=SC2034,SC2154 # cmd_up owns these dynamic locals.
credential_gate() {
  [ -z "$password_file" ] || credential_kind=override
  credential_prepare "$password_file"
}

credential_status() {
  local engine="$1" name="$2" mode="$3" keys key custom=0 password=0 pam=0
  # Native inspect renders only key names, never environment values.
  keys=$("$engine" inspect -f \
    '{{range .Config.Env}}{{index (split . "=") 0}}{{"\n"}}{{end}}' "$name" 2>/dev/null) || {
    note 'Login:      unknown (cannot inspect credential metadata)'
    return 1
  }
  while IFS= read -r key; do
    case "$key" in
      CUSTOM_USER) custom=1 ;;
      FILE__PASSWORD) password=1 ;;
      ROOT_PASSWORD_FILE) pam=1 ;;
    esac
  done <<< "$keys"
  if [ "$mode" = webtop ] && [ "$custom" -eq 1 ] && [ "$password" -eq 1 ]; then
    note 'Login:      CUSTOM_USER/FILE__PASSWORD configured (values not inspected)'
  elif [ "$mode" = tuxee ] && [ "$pam" -eq 1 ]; then
    note 'Login:      root (Linux PAM; ROOT_PASSWORD_FILE configured; value not inspected)'
  else
    note 'Login:      unmanaged (may be configured; recreate to manage)'
  fi
}

# Only a successful new creation may advertise the public default password.
# shellcheck disable=SC2154 # cmd_up owns credential_kind/path and mode.
print_login() {
  if [ "$mode" = webtop ]; then
    note "Login:      $DEFAULT_LOGIN_USER (HTTP basic; desktop user abc)"
  else
    note "Login:      $DEFAULT_LOGIN_USER (Linux PAM)"
  fi
  if [ "$credential_kind" = default ] && [ "$credential_created" -eq 1 ]; then
    note "Password:   $DEFAULT_LOGIN_PASSWORD (public default)"
  else
    note "Password:   from file $credential_path (value not displayed)"
  fi
}
