#!/usr/bin/env sh
# shellcheck disable=SC3043

# Register the local Codespaces extension only in interactive shells.
case $- in
    *i*)
        if command -v gh >/dev/null 2>&1 &&
            [ -r "${CONF_SH_DIR:-$HOME/.sh.d}/utils/gh-codespace-sync/install.sh" ]; then
            command sh "${CONF_SH_DIR:-$HOME/.sh.d}/utils/gh-codespace-sync/install.sh" ||
                printf '%s\n' 'Could not register the local Codespaces extension; shell startup will continue.' >&2
        fi
        ;;
esac
#
# Default editor (nvim -> hx -> pkgx hx -> vim -> vi)
if usable nvim; then
    export EDITOR="nvim"
elif usable hx; then
    export EDITOR="hx"
elif usable pkgx; then
    export EDITOR="pkgx +helix-editor.com hx"
elif usable vim; then
    export EDITOR="vim"
else
    export EDITOR="vi"
fi
export VISUAL="$EDITOR"

# starship
if usable starship; then
    eval "$(starship init "$(basename "$SHELL")")"
fi

# nodenv
usable nodenv && eval "$(nodenv init -)"

# direnv
usable direnv && eval "$(direnv hook "$(basename "$SHELL")")"

# cliproxyapi hook
if usable cliproxyapi; then
    _cliproxyapi_hook() {
        local TEMPLATE_CONF OUTPUT_CONF TMP_CONF
        TEMPLATE_CONF="$HOME/.config/cliproxyapi/cliproxyapi.conf.template"
        OUTPUT_CONF="$HOME/.local/share/cli-proxy-api/cliproxyapi.conf"

        if [ -f "$TEMPLATE_CONF" ]; then
            # Regenerate if output is missing or older than the template
            if [ ! -f "$OUTPUT_CONF" ] || [ "$TEMPLATE_CONF" -nt "$OUTPUT_CONF" ]; then
                # Create directory if it doesn't exist
                mkdir -p "$(dirname "$OUTPUT_CONF")"
                # Normalize CKEY and LLM_BROKER variables if one is set
                export CKEY_API_KEY="${CKEY_API_KEY:-$LLM_BROKER_API_KEY}"
                export CKEY_BASE_URL="${CKEY_BASE_URL:-$LLM_BROKER_BASE_URL}"
                export LLM_BROKER_API_KEY="${LLM_BROKER_API_KEY:-$CKEY_API_KEY}"
                export LLM_BROKER_BASE_URL="${LLM_BROKER_BASE_URL:-$CKEY_BASE_URL}"
                # Atomic replacement: write to temp file then rename to avoid fsnotify partial reads
                TMP_CONF="${OUTPUT_CONF}.tmp.$$"
                envsubst '$HOME $KILO_API_KEY $KILO_BASE_URL $CKEY_API_KEY $CKEY_BASE_URL $LLM_BROKER_API_KEY $LLM_BROKER_BASE_URL $OPENCODE_API_KEY $ORCAROUTER_API_KEY $ORCAROUTER_BASE_URL $FEATHERLESS_API_KEY $FEATHERLESS_BASE_URL $INK_GATEWAY_API_KEY $INK_GATEWAY_BASE_URL' \
                    < "$TEMPLATE_CONF" > "$TMP_CONF" && mv -f "$TMP_CONF" "$OUTPUT_CONF"
            fi
        fi
    }
    _cliproxyapi_hook
    unset -f _cliproxyapi_hook
fi

# openfortivpn hook
if usable openfortivpn; then
    _openfortivpn_hook() {
        local TEMPLATE_CONF OUTPUT_CONF TMP_CONF BREW_CONF_DIR BREW_CONF
        TEMPLATE_CONF="$HOME/.config/openfortivpn/config.template"
        OUTPUT_CONF="$HOME/.config/openfortivpn/config"

        if [ -f "$TEMPLATE_CONF" ]; then
            # Regenerate if output is missing or older than the template
            if [ ! -f "$OUTPUT_CONF" ] || [ "$TEMPLATE_CONF" -nt "$OUTPUT_CONF" ]; then
                # Create directory if it doesn't exist
                mkdir -p "$(dirname "$OUTPUT_CONF")"
                # Default fallbacks if not explicitly exported
                export OPENFORTIVPN_PORT="${OPENFORTIVPN_PORT:-443}"
                export OPENFORTIVPN_SAML_PORT="${OPENFORTIVPN_SAML_PORT:-8020}"
                export OPENFORTIVPN_PERSISTENT="${OPENFORTIVPN_PERSISTENT:-0}"
                # Atomic replacement: write to temp file then rename to avoid fsnotify partial reads
                TMP_CONF="${OUTPUT_CONF}.tmp.$$"
                envsubst '$HOME $OPENFORTIVPN_HOST $OPENFORTIVPN_PORT $OPENFORTIVPN_SAML_PORT $OPENFORTIVPN_USERNAME $OPENFORTIVPN_PASSWORD $OPENFORTIVPN_TRUSTED_CERT $OPENFORTIVPN_PERSISTENT' \
                    < "$TEMPLATE_CONF" > "$TMP_CONF" && mv -f "$TMP_CONF" "$OUTPUT_CONF"
                chmod 600 "$OUTPUT_CONF"
            fi
        fi

        # Sync Homebrew openfortivpn service config if Homebrew is present
        # Note: Must be a direct file copy rather than a symlink to an external volume,
        # otherwise macOS TCC sandbox denies launchd root daemon read access (EPERM).
        if usable brew; then
            BREW_CONF_DIR="$(brew --prefix 2>/dev/null)/etc/openfortivpn/openfortivpn"
            BREW_CONF="$BREW_CONF_DIR/config"
            if [ -d "$BREW_CONF_DIR" ] || mkdir -p "$BREW_CONF_DIR" 2>/dev/null; then
                if [ -f "$OUTPUT_CONF" ]; then
                    if [ -L "$BREW_CONF" ] || [ ! -f "$BREW_CONF" ] || [ "$OUTPUT_CONF" -nt "$BREW_CONF" ]; then
                        rm -f "$BREW_CONF" 2>/dev/null || true
                        cp -f "$OUTPUT_CONF" "$BREW_CONF" 2>/dev/null || true
                        chmod 600 "$BREW_CONF" 2>/dev/null || true
                    fi
                fi
            fi
        fi
    }
    _openfortivpn_hook
    unset -f _openfortivpn_hook
fi

# opencode hook
if usable opencode; then
    _opencode_hook() {
        local SVC_CONF HOST_VAL PWD_VAL
        SVC_CONF="${XDG_CONFIG_HOME:-$HOME/.config}/opencode/service.json"

        # Set host to 0.0.0.0 explicitly if not already set
        HOST_VAL="${OPENCODE_HOST:-$OPENCODE_HOSTNAME}"
        if [ -n "$HOST_VAL" ]; then
            if [ ! -f "$SVC_CONF" ] || ! grep -q "\"hostname\": *\"$HOST_VAL\"" "$SVC_CONF" 2>/dev/null; then
                opencode service set hostname "$HOST_VAL" >/dev/null 2>&1
            fi
        elif [ ! -f "$SVC_CONF" ] || ! grep -q '"hostname":' "$SVC_CONF" 2>/dev/null; then
            opencode service set hostname "0.0.0.0" >/dev/null 2>&1
        fi

        if [ -n "$OPENCODE_PORT" ]; then
            if [ ! -f "$SVC_CONF" ] || ! grep -q "\"port\": *$OPENCODE_PORT" "$SVC_CONF" 2>/dev/null; then
                opencode service set port "$OPENCODE_PORT" >/dev/null 2>&1
            fi
        fi

        PWD_VAL="${OPENCODE_PASSWORD:-$OPENCODE_SERVER_PASSWORD}"
        if [ -n "$PWD_VAL" ]; then
            if [ ! -f "$SVC_CONF" ] || ! grep -q "\"password\": *\"$PWD_VAL\"" "$SVC_CONF" 2>/dev/null; then
                opencode service set password "$PWD_VAL" >/dev/null 2>&1
            fi
        fi
    }
    _opencode_hook
    unset -f _opencode_hook
fi
