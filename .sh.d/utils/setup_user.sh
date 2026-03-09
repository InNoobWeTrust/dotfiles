#!/usr/bin/env sh
#
# setup_remote_user.sh
#
# Automates new user provisioning on a remote machine:
#   - Creates the user with a home directory
#   - Sets a password
#   - Adds the user to the sudo group
#   - Installs an SSH public key for key-based authentication
#
# Prerequisites:
#   - Root SSH key-based authentication to the remote host must already be configured
#   - sshpass is NOT required (password is set via chpasswd on the remote side)
#
# Usage:
#   setup_remote_user.sh -h <host> -u <username> -k <public_key_file> [-p <password>] [-P <ssh_port>]

set -eu

# ── Colors ──────────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# ── Helpers ─────────────────────────────────────────────────────────────────────
info()    { printf "%b\n" "${CYAN}[INFO]${NC}  $*"; }
success() { printf "%b\n" "${GREEN}[OK]${NC}    $*"; }
warn()    { printf "%b\n" "${YELLOW}[WARN]${NC}  $*"; }
error()   { printf "%b\n" "${RED}[ERROR]${NC} $*" >&2; }
die()     { error "$@"; exit 1; }

usage() {
    cat <<EOF
Usage: $(basename "$0") -h <host> -u <username> -k <public_key_file> [-p <password>] [-P <ssh_port>]

Required:
  -h <host>             Remote host (IP or hostname)
  -u <username>         Username to create on the remote machine
  -k <public_key_file>  Path to the SSH public key file to install

Optional:
  -p <password>         Password for the new user (prompted if not provided)
  -P <ssh_port>         SSH port on the remote host (default: 22)
  --help                Show this help message
EOF
    exit 0
}

# ── Parse Arguments ─────────────────────────────────────────────────────────────
REMOTE_HOST=""
USERNAME=""
PUBKEY_FILE=""
PASSWORD=""
SSH_PORT="22"

while [ "$#" -gt 0 ]; do
    case "$1" in
        -h)
            [ "$#" -lt 2 ] && die "Missing value for -h"
            REMOTE_HOST="$2"
            shift 2
            ;;
        -u)
            [ "$#" -lt 2 ] && die "Missing value for -u"
            USERNAME="$2"
            shift 2
            ;;
        -k)
            [ "$#" -lt 2 ] && die "Missing value for -k"
            PUBKEY_FILE="$2"
            shift 2
            ;;
        -p)
            [ "$#" -lt 2 ] && die "Missing value for -p"
            PASSWORD="$2"
            shift 2
            ;;
        -P)
            [ "$#" -lt 2 ] && die "Missing value for -P"
            SSH_PORT="$2"
            shift 2
            ;;
        --help)
            usage
            ;;
        *)
            die "Unknown option: $1. Use --help for usage."
            ;;
    esac
done

# ── Validate Inputs ─────────────────────────────────────────────────────────────
[ -z "$REMOTE_HOST" ] && die "Remote host is required (-h)."
[ -z "$USERNAME" ] && die "Username is required (-u)."
[ -z "$PUBKEY_FILE" ] && die "Public key file is required (-k)."
[ ! -f "$PUBKEY_FILE" ] && die "Public key file not found: $PUBKEY_FILE"

PUBKEY=$(cat "$PUBKEY_FILE")
[ -z "$PUBKEY" ] && die "Public key file is empty: $PUBKEY_FILE"

# Prompt for password if not provided
if [ -z "$PASSWORD" ]; then
    printf "Enter password for user '%s': " "$USERNAME"
    stty -echo
    IFS= read -r PASSWORD
    stty echo
    printf "\n"

    printf "Retype password: "
    stty -echo
    IFS= read -r PASSWORD_CONFIRM
    stty echo
    printf "\n"

    [ "$PASSWORD" != "$PASSWORD_CONFIRM" ] && die "Passwords do not match."
fi

[ -z "$PASSWORD" ] && die "Password cannot be empty."

ssh_base() {
    ssh \
        -o StrictHostKeyChecking=accept-new \
        -o ConnectTimeout=10 \
        -p "$SSH_PORT" \
        "$@"
}

# ── Verify connectivity ────────────────────────────────────────────────────────
info "Testing SSH connectivity to root@${REMOTE_HOST}:${SSH_PORT} ..."
if ! ssh_base "root@${REMOTE_HOST}" "echo ok" >/dev/null 2>&1; then
    die "Cannot connect to root@${REMOTE_HOST}:${SSH_PORT}. Ensure root key-based auth is configured."
fi
success "SSH connection verified."

# ── Run remote provisioning ────────────────────────────────────────────────────
info "Provisioning user '${USERNAME}' on ${REMOTE_HOST} ..."

ssh_base "root@${REMOTE_HOST}" sh -s -- "$USERNAME" "$PASSWORD" "$PUBKEY" <<'REMOTE_SCRIPT'
set -eu

USERNAME="$1"
PASSWORD="$2"
PUBKEY="$3"

# ── Create user ─────────────────────────────────────────────────────────────
if id "$USERNAME" >/dev/null 2>&1; then
    echo "[WARN]  User '$USERNAME' already exists. Skipping creation."
else
    adduser --gecos "" --disabled-password "$USERNAME"
    echo "[OK]    User '$USERNAME' created."
fi

# ── Set password ────────────────────────────────────────────────────────────
echo "${USERNAME}:${PASSWORD}" | chpasswd
echo "[OK]    Password set."

# ── Add to sudo group ──────────────────────────────────────────────────────
if groups "$USERNAME" | grep -qw sudo; then
    echo "[INFO]  User '$USERNAME' is already in the sudo group."
else
    usermod -aG sudo "$USERNAME"
    echo "[OK]    Added '$USERNAME' to sudo group."
fi

# ── Install SSH public key ──────────────────────────────────────────────────
SSH_DIR="/home/${USERNAME}/.ssh"
AUTH_KEYS="${SSH_DIR}/authorized_keys"

mkdir -p "$SSH_DIR"

# Append key only if it's not already present
if [ -f "$AUTH_KEYS" ] && grep -qF "$PUBKEY" "$AUTH_KEYS"; then
    echo "[INFO]  SSH key already present in authorized_keys."
else
    echo "$PUBKEY" >> "$AUTH_KEYS"
    echo "[OK]    SSH public key installed."
fi

chown -R "${USERNAME}:${USERNAME}" "$SSH_DIR"
chmod 700 "$SSH_DIR"
chmod 600 "$AUTH_KEYS"
echo "[OK]    Permissions set on .ssh directory."

echo ""
echo "[OK]    User '${USERNAME}' is fully provisioned!"
REMOTE_SCRIPT

# ── Verify remote login ────────────────────────────────────────────────────────
printf "\n"
info "Verifying SSH login as ${USERNAME}@${REMOTE_HOST} ..."
if ssh \
    -o StrictHostKeyChecking=accept-new \
    -o ConnectTimeout=10 \
    -p "$SSH_PORT" \
    -o PasswordAuthentication=no \
    "${USERNAME}@${REMOTE_HOST}" "whoami" >/dev/null 2>&1; then
    success "SSH key-based login verified for ${USERNAME}@${REMOTE_HOST}"
else
    warn "Could not verify key-based login as '${USERNAME}'. You may need to copy your private key or check sshd_config."
fi

printf "\n"
success "Done! User '${USERNAME}' is ready on ${REMOTE_HOST}."
printf "%b\n" "  ${CYAN}→${NC} ssh -p ${SSH_PORT} ${USERNAME}@${REMOTE_HOST}"
