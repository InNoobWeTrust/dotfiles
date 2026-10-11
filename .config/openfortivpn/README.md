# OpenFortiVPN Configuration & Usage Guide

| | |
|---|---|
| **Objective** | SAML login with a VPN that survives terminal closure on Bazzite or macOS. |
| **Prerequisites** | Gateway details, browser, administrator access, template environment variables. |
| **Boundaries** | `config.template` is tracked; generated `config` is secret and never committed. |

## Platform Routing

| Platform | Install | Run | Config path |
|---|---|---|---|
| **Bazzite** | `openfortivpn` via `rpm-ostree` or custom image | `openfortivpn@work.service` | `/etc/openfortivpn/work.conf` |
| **macOS** | `brew install openfortivpn` | `sudo brew services` root daemon | Homebrew config, synced by the shell hook |

> [!NOTE]
> Use a native host package: [Bazzite layering](https://docs.bazzite.gg/Installing_and_Managing_Software/rpm-ostree/) requires a reboot and can encounter upgrade conflicts; a [custom image](https://docs.bazzite.gg/Advanced/creating_custom_image/) can bundle the package instead.

## Bazzite: reproducible native SAML setup

The [service override](openfortivpn-saml.conf) keeps the packaged root service re-arming its login listener. See [compatibility notes](details/bazzite-compatibility.md) for evidence, limits and alternatives.

### 1. Install and prepare the config

**Install the native package** if it is not already included in your image:
```bash
rpm-ostree install openfortivpn
```

Reboot after the installation succeeds and when you are ready:
```bash
systemctl reboot
```

**Verify the package and supplied service** after reboot:
```bash
rpm -q openfortivpn
systemctl cat openfortivpn@.service
```

The instance `work` selects `/etc/openfortivpn/work.conf`; no NetworkManager plugin is needed.

**Prepare the private config** in a new shell with your template variables set, or create it yourself. Check the gateway, required realm, `persistent = 0` and `saml-login = 8020` (a port, not a boolean, matching the browser redirect).

### 2. Apply the reusable service recipe

Run from the **checkout root**. This replaces `work.conf` and this recipe's drop-in, enables boot startup, and restarts `work`; review/back up existing destination files privately first.
```bash
(
set -e
dropin_dir=/etc/systemd/system/openfortivpn@work.service.d
sudo install -d /etc/openfortivpn "$dropin_dir"
sudo install -o root -g root -m 600 "$HOME/.config/openfortivpn/config" /etc/openfortivpn/work.conf
sudo install -o root -g root -m 644 .config/openfortivpn/openfortivpn-saml.conf "$dropin_dir/zz-dotfiles-saml.conf"
sudo systemctl daemon-reload
sudo systemctl enable openfortivpn@work.service
sudo systemctl restart --no-block openfortivpn@work.service
)
```

For automation, deploy the private config separately and reuse this recipe. Other drop-ins remain untouched; verify effective `Type=exec`, `Restart=always`, `RestartUSec=2s`:
```bash
systemctl show openfortivpn@work.service -p Type -p Restart -p RestartUSec
```

Repeat after config changes: the hook does not sync `/etc/openfortivpn/work.conf`. Avoid competing clients on the callback port.

### 3. Apply SELinux compatibility only when needed

For a bind failure, follow the [port-owner, audit and label checks](details/bazzite-compatibility.md#selinux-listener-permission). The [local policy](local_openfortivpn_saml.cil) applies only to the documented `openfortivpn_t` → `hadoop_namenode_port_t` denial on TCP `8020`; keep SELinux enforcing and do not apply it blindly.

### 4. Authenticate without keeping a terminal open

```text
Boot / process exit → local SAML listener → browser SSO/2FA → root VPN tunnel
```

Get the login URL once, then bookmark the **gateway login URL**, not the token-bearing local callback:
```bash
sudo journalctl -u openfortivpn@work.service -f
```

**Normally, open the bookmark:** boot startup and process restarts re-arm the listener, not the old SAML session. Idle listeners do not contact the gateway; browser authentication is still required.

**Expect short gaps:** versions 1.23.1/1.24.1 have five ten-second callback attempts, then exit; restart follows after two seconds. Retry a refused callback once listening resumes, or begin a fresh login if its token expired.

**If you deliberately stopped the service**, start it again before opening the bookmark:
```bash
sudo systemctl start --no-block openfortivpn@work.service
```

**Verify the tunnel after login:**
```bash
systemctl is-active openfortivpn@work.service
ip -brief address show
```

`active` means the process started, not that login succeeded. Require `Tunnel is up and running`, a PPP address, and access to a known internal resource to verify routing/DNS.

**Close the terminal:** Ctrl+C exits log viewing only. The VPN survives terminal closure/logout while the host runs.

| Action | Command |
|---|---|
| **Stop until manually started or next boot** | `sudo systemctl stop openfortivpn@work.service` |
| **Stop and disable boot startup** | `sudo systemctl disable --now openfortivpn@work.service` |
| **Re-arm immediately** | `sudo systemctl restart --no-block openfortivpn@work.service` |
| **Inspect** | `systemctl status openfortivpn@work.service` |

Keep `persistent = 0`; its retry loop cannot re-arm SAML. For repeated failures despite a valid callback to a live listener, stop and [investigate compatibility](details/bazzite-compatibility.md)—restarts cannot repair it.

### Optional NetworkManager GUI

For password-based gateways, layer `NetworkManager-fortisslvpn-gnome`, reboot, then add **Fortinet SSLVPN** in **Settings → Network → VPN**; it uses its own profile. For TLS failures, obtain a verified CA/fingerprint from the administrator; do not disable verification.

## Configuration generation

`.sh.d/hooks.sh` renders `config.template` to `~/.config/openfortivpn/config` when the client is available and the output is missing or older than the template. Defaults: gateway `443`, callback `8020`, persistence `0`; environment changes alone do not regenerate it.

A newer template may regenerate your config on shell startup; protect manual additions first. Bazzite service sync is explicit; Homebrew sync attempts a mode-`600` copy to `$(brew --prefix)/etc/openfortivpn/openfortivpn/config`.

## Homebrew Service Usage (macOS Primary Workflow)

Homebrew runs the VPN as a root LaunchDaemon to manage PPP and routing. `brew services start` registers it for boot.

| Action | Command |
|---|---|
| **Start** | `sudo brew services start openfortivpn` |
| **Stop** | `sudo brew services stop openfortivpn` |
| **Reconnect** | `sudo brew services restart openfortivpn` |
| **Status** | `sudo brew services info openfortivpn` |

**Authenticate** using the URL printed in the service log:
```bash
tail -f "$(brew --prefix)/var/log/openfortivpn.log"
```

Complete SSO/2FA and the callback; closing the terminal or stopping `tail` leaves the daemon running. After a disconnect, restart and authenticate again.

## Direct CLI Execution (Manual / Debugging)

- **Bazzite foreground debugging**: Stop the service first, then `sudo openfortivpn -c "$HOME/.config/openfortivpn/config" -v`.
- **macOS foreground debugging**: `sudo openfortivpn` uses Homebrew's synced default config.

---

## Diagnostics

| Check | Bazzite / Linux | macOS |
|---|---|---|
| **Tunnel interface & IP** | `ip addr show ppp0` and `ip route show dev ppp0` | `ifconfig ppp0` |
| **VPN process** | `pgrep -fl openfortivpn` | `pgrep -fl openfortivpn` |
| **Service state** | `systemctl status openfortivpn@work.service` | `sudo brew services info openfortivpn` |
| **Logs** | `sudo journalctl -u openfortivpn@work.service -e` | `tail -n 100 "$(brew --prefix)/var/log/openfortivpn.log"` |

## References

- **Fedora package**: [openfortivpn](https://packages.fedoraproject.org/pkgs/openfortivpn/openfortivpn/).
- **Service contract**: [upstream 1.23.1 service template](https://github.com/adrienverge/openfortivpn/blob/v1.23.1/lib/systemd/system/openfortivpn%40.service.in).
