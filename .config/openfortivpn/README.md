# OpenFortiVPN Configuration & Usage Guide

This directory contains the user configuration for `openfortivpn`.

## Architecture Overview

1. **Config Template**: `config.template` is tracked in git and uses generic environment variable placeholders (`${OPENFORTIVPN_HOST}`, `${OPENFORTIVPN_PORT}`, `${OPENFORTIVPN_SAML_PORT}`, etc.).
2. **Dynamic Generation**: When the shell starts (`.sh.d/hooks.sh`), `config` is dynamically generated from the template with strict permissions (`chmod 600`).
3. **Dotfiles Stowing**: `stow` links `.config/openfortivpn` to `$HOME/.config/openfortivpn`.

---

## Direct Interactive Usage (Primary Workflow)

Because SAML SSO / MFA requires an interactive browser authentication step, running `openfortivpn` directly on demand provides the best user experience.

### Shell Shortcuts

Interactive helper functions and aliases are available in your shell:

| Command | Action |
|---|---|
| `vpn` or `vpn connect` | Start VPN and automatically launch SAML SSO login in default browser |
| `vpn-up` / `vpn-connect` | Aliases for `vpn connect` |
| `vpn disconnect` / `vpn-down` | Gracefully terminate the active VPN tunnel |
| `vpn status` / `vpn-status` | Display connection status, PID, and assigned `ppp0` IP |
| `vpn config` | Open the active configuration file in `$EDITOR` |

### Connection Flow

1. Run `vpn` (or `vpn-connect`) in your terminal when you start working:
   ```bash
   vpn
   ```
2. Enter your `sudo` password when prompted.
3. `openfortivpn` starts listening for the SAML callback on port `8020`.
4. Your default browser will automatically open to the SAML SSO portal.
5. Complete the login and MFA/FIDO prompt in your browser.
6. The browser redirects back to `http://127.0.0.1:8020/`, and `openfortivpn` establishes the `ppp0` tunnel.
7. To disconnect when you finish working:
   - Press `Ctrl+C` in the running terminal, or
   - Run `vpn disconnect` (or `vpn-down`) from any terminal.

---

## Background Services (Disabled / Deprecated)

Running `openfortivpn` as a headless background daemon (e.g. `brew services start openfortivpn` or `systemd`) is **not recommended** for SAML SSO workflows:
- SAML authentication requires an interactive browser session.
- Background daemons hide the login prompt in log files and can trigger repeated restart loops when sessions expire or disconnect.

If the background service was previously registered, ensure it is completely stopped and disabled:

```bash
sudo brew services stop openfortivpn
```

---

## Manual CLI Execution

If invoking the binary directly without shell helpers:
```bash
sudo openfortivpn -c ~/.config/openfortivpn/config
```
(Because `/opt/homebrew/etc/openfortivpn/openfortivpn/config` is symlinked to `~/.config/openfortivpn/config`, `-c` can be omitted).

---

## Verification & Diagnostics

- **Check connection status**:
  ```bash
  vpn status
  ```
- **Check network interface and routes**:
  ```bash
  ifconfig ppp0
  netstat -rn -f inet | grep ppp
  ```
- **Check open configuration files**:
  ```bash
  sudo lsof -p "$(pgrep openfortivpn)" | grep config
  ```
