# CLIProxyAPI Configuration & Service Setup

This directory contains the user configuration for `cliproxyapi`.

## Architecture Overview

1. **Config Template**: `cliproxyapi.conf.template` is tracked in git.
2. **Dynamic Generation**: When shell starts (`.sh.d/hooks.sh`), `cliproxyapi.conf` is dynamically generated from the template by substituting environment variables (`FEATHERLESS_API_KEY`, `INK_GATEWAY_API_KEY`, `LLM_BROKER_API_KEY`, etc.).
3. **Dotfiles Stowing**: `stow` links `.config/cliproxyapi` to `$HOME/.config/cliproxyapi`.

---

## Service Configuration

The `cliproxyapi` binary hardcodes its default configuration path at build time to `$(brew --prefix)/etc/cliproxyapi.conf`. When run as a background service via Homebrew (`brew services start cliproxyapi`), it invokes the binary without additional command-line flags.

### macOS Setup (Homebrew + LaunchAgent)

On macOS, Homebrew generates and manages `~/Library/LaunchAgents/sh.brew.cliproxyapi.plist` without native drop-in override support. Running `brew services restart` or formula upgrades can overwrite manual edits to the `.plist` file.

To ensure the service persistently loads the user config across restarts and upgrades:

1. **Symlink default config path to stowed user config**:
   ```bash
   BREW_PREFIX="$(brew --prefix)"
   CONFIG_PATH="$HOME/.config/cliproxyapi/cliproxyapi.conf"

   # Backup default unconfigured template if present
   if [ -f "$BREW_PREFIX/etc/cliproxyapi.conf" ] && [ ! -L "$BREW_PREFIX/etc/cliproxyapi.conf" ]; then
       cp "$BREW_PREFIX/etc/cliproxyapi.conf" "$BREW_PREFIX/etc/cliproxyapi.conf.default"
   fi

   # Symlink default service config path to user config
   ln -sfn "$CONFIG_PATH" "$BREW_PREFIX/etc/cliproxyapi.conf"
   ```

2. **Restart the service**:
   ```bash
   brew services restart cliproxyapi
   ```

### Linux Setup (Homebrew + systemd)

On Linux, systemd supports native drop-in overrides. The override file is tracked in dotfiles at `.config/systemd/user/homebrew.cliproxyapi.service.d/override.conf`:

```ini
[Service]
ExecStart=
ExecStart="/home/linuxbrew/.linuxbrew/opt/cliproxyapi/bin/cliproxyapi" -config "%h/.config/cliproxyapi/cliproxyapi.conf"
```

After stowing, reload systemd:
```bash
systemctl --user daemon-reload
systemctl --user restart homebrew.cliproxyapi.service
```

---

## Verification

1. **Verify Open Files**:
   Ensure the running process opened the stowed config rather than the example template:
   ```bash
   lsof -p "$(pgrep cliproxyapi)" | grep cliproxyapi.conf
   ```

2. **Health & Auth Check**:
   Query the models endpoint to confirm it returns `200 OK`:
   ```bash
   curl -i http://127.0.0.1:8317/v1/models
   ```
   > **Note**: If you receive `403 Forbidden` with `"error": "unsafe_example_api_key"`, the service is loading the unconfigured default Homebrew template (`$(brew --prefix)/etc/cliproxyapi.conf`) instead of your stowed config. Verify the symlink step above.
