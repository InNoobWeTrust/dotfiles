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
| `vpn` or `vpn connect` | Start VPN interactively in foreground with automatic SSO browser launch |
| `vpn daemon` / `vpn-daemon` | Start VPN as a detached background daemon and print SAML SSO link |
| `vpn log` / `vpn-log` | Stream background daemon logs in real time (`tail -f`) |
| `vpn disconnect` / `vpn-down` | Gracefully terminate the active VPN tunnel |
| `vpn status` / `vpn-status` | Display connection status (Connected / Awaiting authentication) and IP |
| `vpn config` | Open the active configuration file in `$EDITOR` |

### Connection Flows

#### 1. Background Daemon Flow (Recommended)

If you prefer not to hold a terminal window open:

1. **Start the daemon**:
   ```bash
   vpn daemon
   ```
   Prompts for `sudo` up front, launches `openfortivpn` detached in the background writing to `/tmp/openfortivpn.log`, prints the SAML SSO authentication link, and opens your default browser.
2. **View logs or inspect the SSO link at any time**:
   ```bash
   vpn log
   ```
   Streams output in real time. Press `Ctrl+C` at any time to exit the log view without stopping the VPN tunnel.
3. **Check status**:
   ```bash
   vpn status
   ```
4. **Disconnect when done**:
   ```bash
   vpn disconnect
   ```

#### 2. Interactive Foreground Flow

1. Run `vpn` (or `vpn connect`) in your terminal:
   ```bash
   vpn
   ```
2. Enter your `sudo` password when prompted.
3. `openfortivpn` starts listening for the SAML callback on port `8020`.
4. Your browser will automatically open to the SAML SSO portal.
5. Complete the login and MFA/FIDO prompt in your browser.
6. The browser redirects back to `http://127.0.0.1:8020/`, and `openfortivpn` establishes the `ppp0` tunnel.
7. To disconnect when you finish working:
   - Press `Ctrl+C` in the running terminal, or
   - Run `vpn disconnect` (or `vpn-down`) from any terminal.

### Custom SSO Browser Configuration

By default, the SAML authentication portal opens in your operating system's default browser. If your default browser hangs or blocks loopback redirects, you can select any installed browser (e.g., Chrome, Safari, Brave):

- **Per-Command Flag** (`-b` or `--browser`):
  ```bash
  vpn daemon -b chrome
  # or
  vpn daemon -b safari
  # or
  vpn connect -b "Google Chrome"
  ```

- **Environment Variable** (persistent in `~/.sh.d/vars.sh` or shell startup):
  ```bash
  export VPN_BROWSER="Google Chrome"   # or "Safari", "Brave Browser", "chrome"
  ```

---

## Background Services (Disabled / Deprecated)

Running `openfortivpn` as a headless background daemon (e.g. `brew services start openfortivpn` or `systemd`) is **not recommended** for SAML SSO workflows:
- SAML authentication requires an interactive browser session.
- Background daemons hide the login prompt in log files and can trigger repeated restart loops when sessions expire or disconnect.

If the background service was previously registered, ensure it is completely stopped and disabled:

```bash
sudo brew services stop openfortivpn
```

### Viewing Service Logs

If diagnosing background daemon errors or inspecting why a service is failing or looping:

- **macOS (Homebrew service)**:
  Homebrew directs standard output and error streams to its `var/log` directory:
  ```bash
  # Follow live daemon logs in real time
  tail -f "$(brew --prefix)/var/log/openfortivpn.log"

  # View recent entries
  tail -n 100 "$(brew --prefix)/var/log/openfortivpn.log"
  ```
  You can also inspect active service state and registered log paths:
  ```bash
  sudo brew services info openfortivpn
  ```

- **Linux (systemd service)**:
  Service logs are captured by `systemd-journald`:
  ```bash
  # Follow live service logs
  sudo journalctl -u openfortivpn -f

  # Jump to the most recent entries in pager
  sudo journalctl -u openfortivpn -e
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
- **Stream background logs**:
  ```bash
  # Shell daemon log
  vpn log

  # macOS Homebrew service log
  tail -f "$(brew --prefix)/var/log/openfortivpn.log"

  # Linux systemd service log
  sudo journalctl -u openfortivpn -f
  ```
- **Enable verbose output during interactive connection**:
  Pass `-v` or `-vv` to inspect detailed handshake logs:
  ```bash
  vpn connect -v
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
