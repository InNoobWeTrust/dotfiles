# OpenFortiVPN Configuration & Usage Guide

This directory contains configuration templates and dotfiles integration for `openfortivpn`.

## Architecture Overview

1. **Config Template**: `config.template` is tracked in git and uses environment variable placeholders (`${OPENFORTIVPN_HOST}`, `${OPENFORTIVPN_PORT}`, `${OPENFORTIVPN_SAML_PORT}`, `${OPENFORTIVPN_PERSISTENT}`, etc.).
2. **Dynamic Generation**: When the shell starts (`.sh.d/hooks.sh`), `config` is dynamically generated from the template with strict permissions (`chmod 600`) at `$HOME/.config/openfortivpn/config`.
3. **Homebrew Service Config**: `.sh.d/hooks.sh` automatically copies `$HOME/.config/openfortivpn/config` to `$(brew --prefix)/etc/openfortivpn/openfortivpn/config` with strict permissions (`chmod 600`) to satisfy macOS root daemon access rules.
4. **Retry Loop / Persistence**: Defaults to disabled (`persistent = 0`). Because SAML SSO requires an interactive browser authentication flow, `openfortivpn` cannot automatically re-authenticate headlessly upon disconnect; setting `persistent > 0` causes it to loop sending unauthenticated requests that spam the remote auth server. Setting `persistent = 0` allows it to terminate cleanly.

---

## Homebrew Service Usage (Primary Workflow)

Because `openfortivpn` requires root privileges to manage PPP interfaces and routing, it runs as a root system LaunchDaemon via `sudo brew services`.

### Service Commands

```bash
# Start the background service (registers to macOS launchd)
sudo brew services start openfortivpn

# Stop the service (unregisters from launchd and terminates tunnel)
sudo brew services stop openfortivpn

# Restart the service
sudo brew services restart openfortivpn

# Check service status
sudo brew services info openfortivpn
# or:
brew services list
```

### SAML SSO Authentication

When the service starts, open the SAML authentication portal in your browser:
```bash
https://${OPENFORTIVPN_HOST}:${OPENFORTIVPN_PORT}/remote/saml/start?redirect=1
```
*(The exact login link is also printed to the service log file on start).*

Complete the login and 2FA prompt in your browser. The portal redirects back to `http://127.0.0.1:8020/` and openfortivpn establishes the `ppp0` tunnel.

Because the process is managed by `launchd` in the system domain, **closing or quitting your terminal does NOT disconnect the VPN**.

### Viewing Service Logs

Follow daemon logs in real time:
```bash
tail -f "$(brew --prefix)/var/log/openfortivpn.log"

# View recent entries
tail -n 100 "$(brew --prefix)/var/log/openfortivpn.log"
```

### Tunnel Disconnect & SAML Re-authentication

If the network drops (e.g., Wi-Fi reconnection, ISP reset, or router reboot) or the gateway session reaches its server-side timeout:
1. The TCP stream terminates and `openfortivpn` closes `ppp0`.
2. Because SAML SSO sessions cannot be renewed headlessly without interactive browser login, `openfortivpn` exits cleanly (`persistent = 0`) instead of spamming the remote gateway with unauthenticated retry requests.
3. To reconnect, restart the background service and complete the SAML SSO prompt in your browser:
   ```bash
   sudo brew services restart openfortivpn
   ```

---

## Direct CLI Execution (Manual / Debugging)

To run `openfortivpn` interactively in the foreground (e.g. for verbose debugging `-v`):

```bash
sudo openfortivpn
```
*(Because `$(brew --prefix)/etc/openfortivpn/openfortivpn/config` is kept in sync with `~/.config/openfortivpn/config`, `-c` is optional).*


---

## Diagnostics

- **Check tunnel interface & IP**:
  ```bash
  ifconfig ppp0
  netstat -rn -f inet | grep ppp
  ```

- **Check active openfortivpn process**:
  ```bash
  pgrep -fl openfortivpn
  ```
