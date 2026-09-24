#!/usr/bin/env sh
# shellcheck disable=SC3043

# pyenv
usable pyenv && eval "$(pyenv init -)" && eval "$(pyenv virtualenv-init -)"

# nodenv
usable nodenv && eval "$(nodenv init -)"

# direnv
usable direnv && eval "$(direnv hook "${SHELL##*/}")"

# Linux brew
usable brew && eval "$(${BREW_HOME}/bin/brew shellenv)"

# cliproxyapi hook
if usable cliproxyapi; then
    local TEMPLATE_CONF OUTPUT_CONF TMP_CONF
    TEMPLATE_CONF="$HOME/.config/cliproxyapi/cliproxyapi.conf.template"
    OUTPUT_CONF="$HOME/.local/share/cli-proxy-api/cliproxyapi.conf"

    if [ -f "$TEMPLATE_CONF" ]; then
        # Regenerate if output is missing or older than the template
        if [ ! -f "$OUTPUT_CONF" ] || [ "$TEMPLATE_CONF" -nt "$OUTPUT_CONF" ]; then
            # Create directory if it doesn't exist
            mkdir -p "$(dirname "$OUTPUT_CONF")"
            # Atomic replacement: write to temp file then rename to avoid fsnotify partial reads
            TMP_CONF="${OUTPUT_CONF}.tmp.$$"
            envsubst '$HOME $KILO_API_KEY $KILO_BASE_URL $LLM_BROKER_API_KEY $LLM_BROKER_BASE_URL $OPENCODE_API_KEY $ORCAROUTER_API_KEY $ORCAROUTER_BASE_URL $FEATHERLESS_API_KEY $FEATHERLESS_BASE_URL $INK_GATEWAY_API_KEY $INK_GATEWAY_BASE_URL' \
                < "$TEMPLATE_CONF" > "$TMP_CONF" && mv -f "$TMP_CONF" "$OUTPUT_CONF"
        fi
    fi
fi

# openfortivpn hook
if usable openfortivpn; then
    local TEMPLATE_CONF OUTPUT_CONF TMP_CONF
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
            # Atomic replacement: write to temp file then rename to avoid fsnotify partial reads
            TMP_CONF="${OUTPUT_CONF}.tmp.$$"
            envsubst '$HOME $OPENFORTIVPN_HOST $OPENFORTIVPN_PORT $OPENFORTIVPN_SAML_PORT $OPENFORTIVPN_USERNAME $OPENFORTIVPN_PASSWORD $OPENFORTIVPN_TRUSTED_CERT' \
                < "$TEMPLATE_CONF" > "$TMP_CONF" && mv -f "$TMP_CONF" "$OUTPUT_CONF"
            chmod 600 "$OUTPUT_CONF"
        fi
    fi
fi
