# Bazzite SAML compatibility and recovery

| | |
|---|---|
| **Audience** | Operators deploying the [native SAML service](../README.md#bazzite-reproducible-native-saml-setup). |
| **Purpose** | Decide which workaround applies and what to check before automating it. |
| **Scope** | Generic Bazzite/Fedora guidance; no gateway identities, local logs or machine details. |

## Evidence and limits

The default recipe reuses the native package and systemd, with explicit browser authentication. Public reports corroborate several failure patterns, but do not establish that one solution works for most gateways or all Bazzite releases.

| Failure pattern | Evidence | Appropriate response |
|---|---|---|
| Tunnel starts, then systemd times out | [Upstream #1113](https://github.com/adrienverge/openfortivpn/issues/1113): openSUSE packaging omitted notification support; fixed by its packager. Inspection of Fedora 44 `1.23.1-3.fc44` also found no `sd_notify` linkage. | `Type=exec` avoids waiting for that notification; separately verify tunnel readiness. Recheck later package builds. |
| Browser callback uses 8020, client listens on port 1 | [Upstream #1271](https://github.com/adrienverge/openfortivpn/issues/1271), version 1.23.1. | Set `saml-login = 8020`, not `1`; match the actual redirect port. |
| Listener starts, then token retrieval fails | [1.23.1 listener source](https://github.com/adrienverge/openfortivpn/blob/v1.23.1/src/http_server.c) and [1.24.1 source](https://github.com/adrienverge/openfortivpn/blob/v1.24.1/src/http_server.c): five attempts with ten-second waits. Invalid requests can consume attempts sooner. | Confirm the browser reaches the live loopback listener with a valid callback. This error alone does not identify the cause. |
| Reconnect reuses an old SAML session | [1.24.1 main loop](https://github.com/adrienverge/openfortivpn/blob/v1.24.1/src/main.c) calls the listener before the persistence loop; [#867](https://github.com/adrienverge/openfortivpn/issues/867) discusses cookie-reuse limitations. | Keep `persistent = 0`; restart the whole process for a fresh listener. |
| Gateway redirects authentication to a different host | [Upstream #1284](https://github.com/adrienverge/openfortivpn/issues/1284), reported on 1.23.1. | Treat as a gateway-dependent compatibility issue; consult its administrator or evaluate another client. Not a confirmed cause of every timeout. |

**SELinux qualification:** the local policy below addresses a demonstrated Fedora-style listener denial, not a universally reproduced Bazzite bug. No independent public report of that exact Bazzite denial was found in this research; upstream policy changes and different port labels must be checked on each deployment.

## SELinux listener permission

Use this only after an audit event identifies `openfortivpn_t` being denied TCP `name_bind` to `hadoop_namenode_port_t` on `8020`, and the port is not occupied by another process. A listener timeout without that denial is a different problem.

**Check the port owner and audit:**
```bash
sudo ss -ltnp 'sport = :8020'
sudo ausearch -m AVC,USER_AVC -ts recent -c openfortivpn -i
```

**Check the label's assignments:**
```bash
sudo semanage port -l | grep '^hadoop_namenode_port_t[[:space:]]'
```

The supplied policy allows binding to every TCP port carrying that label, not just the number 8020. Review the output; if the relevant port has another label or the permission is no longer missing, do not apply this file or relabel the port blindly.

**Apply the reviewed policy** from the checkout root, then restart:
```bash
sudo semodule -i .config/openfortivpn/local_openfortivpn_saml.cil
sudo systemctl restart --no-block openfortivpn@work.service
```

The three rules permit port binding, node binding and listening/accepting connections for `openfortivpn_t`. Node binding covers nodes labelled `node_t`, not just loopback; the client source itself binds only to loopback. Enforcing mode and restrictions on other port types remain intact.

For configuration management, make this a **conditional compatibility task**, gated by the verified denial, current labels and reviewed policy. Keep the source file with the deployment rather than generating a broad policy from arbitrary audit output; do not enable unrelated SELinux booleans or use a blanket `audit2allow` result.

If `semanage` is unavailable, provide the native policy-management tools before doing the label check. If new denials appear later, investigate them separately rather than expanding this module automatically.

## Why process restart, and when to change approach

An idle native listener only waits locally and prints an authentication URL; it does not request a gateway session. `Restart=always` with `persistent = 0` therefore re-arms that listener without repeatedly authenticating to the gateway; explicit `systemctl stop` suppresses automatic restarts, as documented in [systemd's service manual](https://github.com/systemd/systemd/blob/main/man/systemd.service.xml).

**Remaining limitation:** the listener can be absent during the two-second restart delay, startup or shutdown. This improves bookmark convenience but is not guaranteed always-on availability, automatic SSO renewal or proof that the VPN is connected.

| Approach | Choose when | Limit / rejection criterion |
|---|---|---|
| **Native listener + packaged root service** | The gateway returns a compatible loopback callback; a small restart gap is acceptable. | Default recipe. If a valid callback reaches a live listener but authentication still fails repeatedly, stop retrying and investigate the protocol. |
| **Existing webview cookie helper + root VPN** | An alternative browser/cookie flow has been tested against the gateway. | [openfortivpn-webview](https://github.com/gm-vm/openfortivpn-webview) adds desktop dependencies and has compatibility reports such as [#1272](https://github.com/adrienverge/openfortivpn/issues/1272). Keep the webview unprivileged, pass secrets via stdin, and do not combine cookie mode with native `saml-login`. Not a guaranteed fallback. |
| **Administrator-supported client / NetworkManager / OpenConnect** | The specific client, version and Fortinet authentication flow are supported. | Fortinet support alone does not establish browser-SAML support; [OpenConnect's changelog](https://www.infradead.org/openconnect/changelog.html) distinguishes protocol-specific SSO features. Validate before switching. |

## Acceptance and rollback

**Check separately:** process running, local listener reachable while waiting, successful authentication, assigned PPP address, internal routing and DNS. `active` alone is insufficient; keep enforcing mode on and never share cookies, session IDs or verbose logs without redaction.

If the service repeatedly fails for anything other than an unattended callback timeout, stop it while diagnosing; the override deliberately disables systemd's restart-rate limit. After a known-good listener still fails, record only the generic symptom and client/package version for support, not private gateway details.

**Remove only this recipe's service override:**
```bash
sudo systemctl disable --now openfortivpn@work.service
sudo rm /etc/systemd/system/openfortivpn@work.service.d/zz-dotfiles-saml.conf
sudo systemctl daemon-reload
```

**Remove the optional policy only if you installed it:**
```bash
sudo semodule -r local_openfortivpn_saml
```

Restore your private config backup if the setup replaced an existing profile. These commands leave other overrides and the native package intact; decide separately whether to re-enable a previous service configuration.
