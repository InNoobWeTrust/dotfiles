#!/bin/bash
# Persistent WebDriver server for the automation browser. Started inside the
# container by the agent_computer CLI; idempotent restarts are the CLI's job.
set -eu

export HOME="${HOME:-/config}"
port="${WEBDRIVER_PORT:-4444}"
mkdir -p "$HOME/.local/state"

# The driving tool runs on the host and reaches this server through the
# container's published loopback port, so the peer address seen inside the
# container is the forwarded gateway, not 127.0.0.1. An empty --allowed-ips
# allowlist accepts that connection; reachability is still limited to the
# host's loopback because that is where the port is published.
exec /usr/local/bin/chromedriver \
  --port="$port" \
  --allowed-ips= \
  --log-path="$HOME/.local/state/chromedriver.log" \
  "$@"
