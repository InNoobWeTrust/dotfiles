#!/usr/bin/env sh

# pyenv
usable pyenv && eval "$(pyenv init -)" && eval "$(pyenv virtualenv-init -)"

# nodenv
usable nodenv && eval "$(nodenv init -)"

# direnv
usable direnv && eval "$(direnv hook "${SHELL##*/}")"

# Linux brew
usable brew && eval "$(${BREW_HOME}/bin/brew shellenv)"

# If not running in CodeSpace, use git protocol instead of https
#[ -z "$CODESPACES" ] && git config --global url."git@github.com".insteadOf "https://github.com"

# cliproxyapi hook
if usable cliproxyapi; then
    TEMPLATE_CONF="$HOME/.config/cliproxyapi/cliproxyapi.conf.template"
    OUTPUT_CONF="$HOME/.config/cliproxyapi/cliproxyapi.conf"
    
    if [ -f "$TEMPLATE_CONF" ]; then
        # Regenerate if output is missing or older than the template
        if [ ! -f "$OUTPUT_CONF" ] || [ "$TEMPLATE_CONF" -nt "$OUTPUT_CONF" ]; then
            # Create directory if it doesn't exist
            mkdir -p "$(dirname "$OUTPUT_CONF")"
            # Safe replacement: only expand the specified environment variables
            envsubst '$FEATHERLESS_API_KEY $FEATHERLESS_BASE_URL $INK_GATEWAY_API_KEY $INK_GATEWAY_BASE_URL $LLM_BROKER_API_KEY $LLM_BROKER_BASE_URL' \
                < "$TEMPLATE_CONF" > "$OUTPUT_CONF"
        fi
    fi
fi
