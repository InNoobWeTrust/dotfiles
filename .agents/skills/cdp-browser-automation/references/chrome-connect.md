# chrome-connect

## Connecting to Chrome (Zero Dependencies)

Chrome exposes CDP at a port written to `DevToolsActivePort`. Use these flags
to suppress all startup overlays (profile picker, restore-tabs dialog, translate
banner, notification prompt) that would block automation:

```bash
# Linux
google-chrome \
  --remote-debugging-port=9222 \
  --no-first-run \
  --no-default-browser-check \
  --disable-infobars \
  --disable-notifications \
  --disable-translate \
  --disable-extensions \
  --password-store=basic \
  --use-mock-keychain \
  --headless=new        # omit for headed automation

# macOS
open -a "Google Chrome" --args \
  --remote-debugging-port=9222 \
  --no-first-run --no-default-browser-check \
  --disable-infobars --disable-notifications --disable-translate \
  --disable-extensions --password-store=basic --use-mock-keychain
```

The only runtime requirements are `uv` plus Python with `websockets` and
`httpx`. Write your CDP script to a temp directory (`/tmp/` or repo scratch
dir), then run with
`uv run --with websockets --with httpx python /tmp/cdp_script.py` so
dependencies resolve on demand without touching the system environment
(`rules/execution-safety.md`). Do not `pip install` dependencies. See
[`cdp-snippets.md`](cdp-snippets.md) for the full `CDP`
class.

**Chrome 115+ note:** `/json/version` may 404. Fall back to reading the port
from `DevToolsActivePort`. Poll up to 30 s — the file appears only after Chrome
finishes binding the port. The snippet reference covers this.

---
