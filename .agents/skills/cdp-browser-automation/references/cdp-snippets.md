# CDP Snippets Reference

Minimal, copy-paste-ready implementations. Add to your own CDP class as needed.

---

## Minimal CDP Client

Requires only `websockets` (`pip install websockets`). Everything else is stdlib.

```python
import asyncio, base64, json, platform
from pathlib import Path
import websockets


# ── Connection ────────────────────────────────────────────────────────────────

def read_cdp_port() -> int:
    """Read the port Chrome wrote to DevToolsActivePort (works Chrome 115+).

    The file format is two lines: port number, then a browser token.
    Always read only the first line. Supports macOS and Linux paths.
    """
    if platform.system() == "Darwin":
        f = Path.home() / "Library/Application Support/Google/Chrome/Default/DevToolsActivePort"
    else:
        f = Path.home() / ".config/google-chrome/Default/DevToolsActivePort"
    return int(f.read_text().splitlines()[0])

async def get_ws_url(port: int = 9222, poll_timeout: float = 30.0) -> str:
    """Connect to Chrome, polling up to poll_timeout seconds for the port to appear.

    Chrome writes DevToolsActivePort only after binding — poll before assuming failure.
    """
    import urllib.request, time
    deadline = time.time() + poll_timeout
    last_err: Exception | None = None
    while time.time() < deadline:
        try:
            data = json.loads(
                urllib.request.urlopen(
                    f"http://localhost:{port}/json/version", timeout=2
                ).read()
            )
            return data["webSocketDebuggerUrl"]
        except Exception as e:
            last_err = e
            await asyncio.sleep(0.5)
    # Final fallback: read DevToolsActivePort file
    try:
        port = read_cdp_port()
        data = json.loads(
            urllib.request.urlopen(
                f"http://localhost:{port}/json/version", timeout=2
            ).read()
        )
        return data["webSocketDebuggerUrl"]
    except Exception:
        raise RuntimeError(
            f"Chrome not reachable after {poll_timeout}s. Last error: {last_err}"
        )


# ── Core class ────────────────────────────────────────────────────────────────

class CDP:
    def __init__(self, ws):
        self.ws = ws
        self._id = 0

    async def send(self, method: str, session_id: str | None = None, **params):
        self._id += 1
        msg: dict = {"id": self._id, "method": method, "params": params}
        if session_id:
            msg["sessionId"] = session_id
        await self.ws.send(json.dumps(msg))
        while True:
            resp = json.loads(await self.ws.recv())
            if resp.get("id") == self._id:
                if "error" in resp:
                    raise RuntimeError(resp["error"])
                return resp.get("result", {})

    # ── Visual ────────────────────────────────────────────────────────────────

    async def screenshot(self, path: str = "/tmp/shot.png", full_page: bool = False) -> str:
        r = await self.send("Page.captureScreenshot", format="png",
                            captureBeyondViewport=full_page)
        Path(path).write_bytes(base64.b64decode(r["data"]))
        return path

    # ── Input ─────────────────────────────────────────────────────────────────

    async def dom_click(self, selector: str, session_id: str | None = None):
        """Click an element via DOM — fires addEventListener('click') handlers.

        Prefer this over click(x, y) for all standard HTML controls.
        Raises if no element matches the selector.
        """
        clicked = await self.js(
            f"(function(){{"
            f"  var el = document.querySelector({json.dumps(selector)});"
            f"  if (!el) return false;"
            f"  el.click(); return true;"
            f"}})()",
            session_id=session_id,
        )
        if not clicked:
            raise RuntimeError(f"dom_click: no element matching {selector!r}")

    async def click(self, x: float, y: float, button: str = "left"):
        """Compositor-level click — use for canvas/WebGL or cross-origin iframes.

        Does NOT guarantee DOM addEventListener('click') handlers fire.
        For standard HTML buttons/links, use dom_click() instead.
        """
        for t in ("mousePressed", "mouseReleased"):
            await self.send("Input.dispatchMouseEvent",
                            type=t, x=x, y=y, button=button, clickCount=1)

    async def type_text(self, text: str):
        await self.send("Input.insertText", text=text)

    _KEYS = {
        "Enter": (13, "Enter", "\r"), "Tab": (9, "Tab", "\t"),
        "Escape": (27, "Escape", ""), "Backspace": (8, "Backspace", ""),
        "ArrowUp": (38, "ArrowUp", ""), "ArrowDown": (40, "ArrowDown", ""),
        "ArrowLeft": (37, "ArrowLeft", ""), "ArrowRight": (39, "ArrowRight", ""),
    }

    async def press_key(self, key: str, modifiers: int = 0):
        vk, code, text = self._KEYS.get(
            key, (ord(key[0]) if len(key) == 1 else 0, key, key if len(key) == 1 else "")
        )
        base = {"key": key, "code": code, "modifiers": modifiers,
                "windowsVirtualKeyCode": vk, "nativeVirtualKeyCode": vk}
        await self.send("Input.dispatchKeyEvent", type="keyDown",
                        **base, **({"text": text} if text else {}))
        if text and len(text) == 1:
            await self.send("Input.dispatchKeyEvent", type="char", text=text,
                            **{k: v for k, v in base.items() if k != "text"})
        await self.send("Input.dispatchKeyEvent", type="keyUp", **base)

    async def scroll(self, x: float, y: float, dy: float = -300, dx: float = 0):
        await self.send("Input.dispatchMouseEvent",
                        type="mouseWheel", x=x, y=y, deltaX=dx, deltaY=dy)

    # ── Navigation ────────────────────────────────────────────────────────────

    async def goto(self, url: str):
        return await self.send("Page.navigate", url=url)

    async def page_info(self) -> dict:
        r = await self.send("Runtime.evaluate",
            expression="JSON.stringify({url:location.href,title:document.title,"
                       "w:innerWidth,h:innerHeight,sx:scrollX,sy:scrollY,"
                       "pw:document.documentElement.scrollWidth,"
                       "ph:document.documentElement.scrollHeight})",
            returnByValue=True)
        return json.loads(r["result"]["value"])

    # ── JS ────────────────────────────────────────────────────────────────────

    async def js(self, expression: str, session_id: str | None = None):
        r = await self.send("Runtime.evaluate", session_id=session_id,
                            expression=expression, returnByValue=True,
                            awaitPromise=True)
        return r.get("result", {}).get("value")


# ── Entry point ───────────────────────────────────────────────────────────────

async def main():
    ws_url = await get_ws_url()
    async with websockets.connect(ws_url) as ws:
        cdp = CDP(ws)
        await cdp.goto("https://example.com")
        # Never use asyncio.sleep(N) — use wait_for_selector or wait_for_load
        await wait_for_selector(cdp, "h1")
        print(await cdp.page_info())
        await cdp.screenshot("/tmp/shot.png")  # for human inspection only
```

---

## Tab Management

```python
# Open a new tab without clobbering the user's active tab
async def new_tab(cdp: CDP, url: str = "about:blank") -> tuple[str, str]:
    tid = (await cdp.send("Target.createTarget", url="about:blank"))["targetId"]
    sid = (await cdp.send("Target.attachToTarget",
                          targetId=tid, flatten=True))["sessionId"]
    if url != "about:blank":
        await cdp.send("Page.navigate", url=url, session_id=sid)
    return tid, sid

# List only real user tabs (filter chrome:// internals)
async def list_tabs(cdp: CDP) -> list[dict]:
    targets = (await cdp.send("Target.getTargets"))["targetInfos"]
    skip = ("chrome://", "devtools://", "about:", "chrome-extension://")
    return [t for t in targets
            if t["type"] == "page" and not t["url"].startswith(skip)]

# Activate a tab (bring to front) and attach to it
async def switch_tab(cdp: CDP, target_id: str) -> str:
    await cdp.send("Target.activateTarget", targetId=target_id)
    sid = (await cdp.send("Target.attachToTarget",
                          targetId=target_id, flatten=True))["sessionId"]
    return sid
```

---

## Wait Patterns

```python
import asyncio, time

async def wait_for_load(cdp: CDP, timeout: float = 15.0, idle_ms: float = 500) -> bool:
    """Wait until no in-flight fetch/XHR for `idle_ms` ms (network-idle heuristic).

    WARNING: document.readyState == 'complete' is NOT sufficient for SPAs — the
    spinner dismisses before async data fetches finish. This helper polls the
    active request count via the Performance API instead.

    For known stable selectors, prefer wait_for_selector(); it is more reliable.
    """
    deadline = time.time() + timeout
    script = (
        "window.__cdpReqCount = window.__cdpReqCount || 0; "
        "window.__cdpReqCount"
    )
    # Inject XHR/fetch counters once
    await cdp.js("""
        if (!window.__cdpWaitPatched) {
            window.__cdpWaitPatched = true;
            window.__cdpReqCount = 0;
            const origOpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function(...a) {
                window.__cdpReqCount++;
                this.addEventListener('loadend', () => window.__cdpReqCount--);
                return origOpen.apply(this, a);
            };
            const origFetch = window.fetch;
            window.fetch = function(...a) {
                window.__cdpReqCount++;
                return origFetch.apply(this, a).finally(() => window.__cdpReqCount--);
            };
        }
    """)
    idle_start: float | None = None
    while time.time() < deadline:
        count = await cdp.js("window.__cdpReqCount || 0")
        if count == 0:
            if idle_start is None:
                idle_start = time.time()
            elif (time.time() - idle_start) * 1000 >= idle_ms:
                return True
        else:
            idle_start = None
        await asyncio.sleep(0.1)
    return False

async def wait_for_selector(cdp: CDP, selector: str, timeout: float = 10.0) -> bool:
    deadline = time.time() + timeout
    while time.time() < deadline:
        found = await cdp.js(f"!!document.querySelector({json.dumps(selector)})")
        if found:
            return True
        await asyncio.sleep(0.3)
    return False

async def wait_for_text(cdp: CDP, text: str, timeout: float = 10.0) -> bool:
    deadline = time.time() + timeout
    while time.time() < deadline:
        body = await cdp.js("document.body.innerText")
        if body and text in body:
            return True
        await asyncio.sleep(0.3)
    return False
```

---

## Iframes and Shadow DOM

```python
# Find an iframe target by URL substring, attach, get session
async def attach_iframe(cdp: CDP, url_substr: str) -> str | None:
    targets = (await cdp.send("Target.getTargets"))["targetInfos"]
    match = next(
        (t for t in targets if t["type"] == "iframe" and url_substr in t.get("url", "")),
        None
    )
    if not match:
        return None
    return (await cdp.send("Target.attachToTarget",
                           targetId=match["targetId"], flatten=True))["sessionId"]

# Shadow DOM: pierce with JS (clicks still use coordinates — no special handling)
async def shadow_query(cdp: CDP, host_selector: str, inner_selector: str):
    return await cdp.js(
        f"document.querySelector({json.dumps(host_selector)})"
        f"?.shadowRoot?.querySelector({json.dumps(inner_selector)})"
        f"?.getBoundingClientRect()"
    )
```

---

## Dialogs

```python
# Accept any JS dialog (alert / confirm / prompt / beforeunload)
async def accept_dialog(cdp: CDP, prompt_text: str = ""):
    await cdp.send("Page.handleJavaScriptDialog",
                   accept=True, promptText=prompt_text)

# Dismiss
async def dismiss_dialog(cdp: CDP):
    await cdp.send("Page.handleJavaScriptDialog", accept=False)
```

---

## Session / Auth Helpers

```python
import json as _json

async def get_cookies(cdp: CDP) -> list[dict]:
    """Return all cookies for the current session."""
    return (await cdp.send("Network.getAllCookies"))["cookies"]

async def set_cookies(cdp: CDP, cookies: list[dict]):
    """Inject saved cookies — use to restore an authenticated session."""
    await cdp.send("Network.setCookies", cookies=cookies)

async def save_session(path: str, cdp: CDP):
    """Save cookies to a JSON file for later reuse."""
    cookies = await get_cookies(cdp)
    # Strip sensitive fields before storing if needed
    Path(path).write_text(_json.dumps(cookies, indent=2))

async def load_session(path: str, cdp: CDP):
    """Restore cookies from a previously saved session file."""
    cookies = _json.loads(Path(path).read_text())
    await set_cookies(cdp, cookies)

async def is_auth_wall(cdp: CDP, login_patterns: list[str] | None = None) -> bool:
    """Return True if the current page looks like a login/auth wall.

    Checks URL against common login path patterns. Override login_patterns
    with site-specific values from your domain knowledge file.
    """
    patterns = login_patterns or ["/login", "/signin", "/auth", "/account/login"]
    url = (await cdp.page_info())["url"]
    return any(p in url for p in patterns)
```

**Auth-wall pattern:**
1. Before navigating to a protected page, call `load_session()` if a saved
   session file exists.
2. After navigation, call `is_auth_wall()`. If `True`, surface a structured
   error — do not attempt to type credentials from a screenshot.
3. After a successful authenticated run, call `save_session()` so future runs
   can skip re-auth.

Never hardcode credentials. Accept session file paths from the caller.

---

Requires `httpx` (`pip install httpx`). Use `urllib.request` only if httpx is
unavailable — it does not follow POST redirects by default.

```python
from concurrent.futures import ThreadPoolExecutor
import httpx

_HTTP_CLIENT = httpx.Client(
    follow_redirects=True,
    timeout=20,
    headers={"User-Agent": "Mozilla/5.0"},
)

def http_get(url: str, headers: dict | None = None) -> str:
    r = _HTTP_CLIENT.get(url, headers=headers or {})
    r.raise_for_status()
    return r.text

def bulk_get(urls: list[str], workers: int = 20) -> list[str]:
    with ThreadPoolExecutor(max_workers=workers) as pool:
        return list(pool.map(http_get, urls))
```

Use for static pages and JSON APIs. 100+ pages/second, no Chrome overhead.
