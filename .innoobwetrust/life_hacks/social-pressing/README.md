# social-pressing

All-in-one reporting tool for social networks (Facebook, Instagram, TikTok).

The tool connects to an **already-running WebDriver endpoint**, normally the
agent computer's published port at `http://127.0.0.1:4444`, and attaches to its
Chromium browser. Only the agent computer's Chromium/chromedriver setup is
supported; other browsers are not supported because the tool runs only against
that setup. It does not discover containers, start drivers, or manage processes.

| Purpose | Requirements | Boundary |
| ------- | ------------ | -------- |
| Run reports using your existing site logins | A running browser and attach-ready WebDriver endpoint | Browser, driver, and container lifecycle are managed externally |

## How it works

The agent computer serves WebDriver from its container; social-pressing only
talks HTTP to the published endpoint:

```text
social-pressing → host loopback :4444 → container WebDriver → running browser
```

- **Browser:** Logins come entirely from the container browser's persistent
  profile. Log in to the sites once in the desktop UI and keep the browser running.
  Attaching reuses that browser and its profile.
- **WebDriver:** The agent computer runs chromedriver before this tool starts.
  The tool requests a session using Chromium's attach mechanism:

  | Browser | Server configuration | Attach mechanism |
  | ------- | -------------------- | ---------------- |
  | Chromium | chromedriver listening on `4444` | `goog:chromeOptions.debuggerAddress` = `127.0.0.1:9222` inside the container |

- **After the run:** The browser and WebDriver server keep running. The tool
  persists the session rather than sending `DELETE /session` on client drop,
  because closing an attached session may close the user's browser.

## Requirements

Provisioning a ready container (image, browser, driver, and launchers) is owned
by the dedicated dotfiles `agent_computer` utility, separately from dev
workspaces. See the reference recipe in
[`agent_computer/`](../../../.sh.d/utils/agent_computer/README.md).

- **Browser:** A running browser with its attach endpoint enabled, as described
  below, and site logins already completed.
- **Server:** The matching WebDriver server running and configured to attach to
  that browser; Chromium and chromedriver major versions should match.
- **Endpoint:** A WebDriver URL reachable from the host, normally
  `http://127.0.0.1:4444`, with the container port published to host loopback only.

### Chromium

Launch Chromium once inside the container's desktop session, log in to the
sites, and keep it running:

```sh
chromium-browser --remote-debugging-port=9222 --user-data-dir="$HOME/.chromium-automation"
```

- **Profile:** `--user-data-dir` is required: Chromium ≥ 136 ignores
  `--remote-debugging-port` when the default profile directory is used. That
  non-default directory is also what persists your logins between runs.
- **Debugger:** The WebDriver server reaches Chromium at `127.0.0.1:9222`
  inside the container. This is a fixed attach endpoint, not a host-side port
  to pass to social-pressing.
- **Driver:** The agent computer keeps chromedriver listening on `4444` and
  publishes that endpoint to the host; social-pressing never launches it.

## Networking

The usual agent computer setup publishes container port `4444` to host
`127.0.0.1:4444`. Chromium's remote debugging endpoint stays on container
loopback at `127.0.0.1:9222`; it does not need to be published to the host.

If the WebDriver server is reachable at a different URL, pass that complete URL
with `--webdriver-url`. The tool uses it directly, without inspecting container
networking or discovering published-port mappings.

Publish WebDriver to `127.0.0.1` only — never expose it on a public interface.
The container's server configuration must accept the forwarded connection;
that configuration is the agent computer's responsibility, not this tool's.

## Usage

```sh
cargo run -- -f links.txt
cargo run -- -f links.txt --webdriver-url http://127.0.0.1:4444
```

| Env / flag | Default | Meaning |
| ---------- | ------- | ------- |
| `--webdriver-url` | `http://127.0.0.1:4444` | Already-running WebDriver endpoint, normally the agent computer's published port |
| `FILE` / `-f` / `--file` | *required* | File with links to report, one per line |
| `LOG_LEVEL` / `--log-level` | `DEBUG` | Log level |
| `LOGFILE` / `--logfile` | | Also append logs to this file |
| `-w` / `--wait` | `10m` | Per-target report timeout |
| `-t` / `--time-limit` | | Optional overall time limit |

## Caveats

- **Concurrency:** Use one WebDriver client at a time per browser; do not run
  this tool and other automation against the same browser simultaneously.
- **Attach mode:** Browser preferences cannot be changed after attachment, and
  window resizing is best-effort only; configure the profile yourself.
- **Connection errors:** Check the supplied URL and the externally managed
  browser/server setup. The tool neither waits for startup nor restarts them.
- **Session lifetime:** Sessions persist after the run, including interruption;
  manage session recovery through the external WebDriver setup before another
  run if the server refuses a new session. The tool does not stop the server.

## Development

```sh
cargo build
cargo test
```

The project uses `Makefile.toml` for an example cargo-make task
(`cargo make test-pressing`), which reads `test.txt` and writes `test.log` while
connecting to the default WebDriver endpoint.
