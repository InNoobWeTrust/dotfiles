# CDP Browser Automation Skill — Swarm Review Report

**Swarm run:** 3-phase (Research → Spec → Execution) | 12 findings | All passed QA


## Summary

| # | Severity | Section | One-line summary |
|---|----------|---------|-----------------|
| 01 | CRITICAL | Common Failure Modes / CDP Error Handling | The skill lacks any CDP failure policy; add error classification, retries with exponential backoff and jitter, timeouts, circuit-breakers, checkpointed recovery, supervisor escalation, tests, and a runbook. |
| 02 | CRITICAL | Decision Table — Auth wall | Skill halts at auth walls with human-facing instructions; add programmatic detection, cookie/session restore (Network.setCookies), credential-vault integration, structured auth errors, and retry flows so unattended agents can recover. |
| 03 | CRITICAL | Core Mental Model / Decision Table | Input.dispatchMouseEvent is a low-level compositor primitive that can fail to trigger DOM addEventListener('click') handlers; prefer DOM-level click (element.click() or dispatchEvent) for standard HTML controls and use compositor clicks only as a fallback. |
| 04 | CRITICAL | Operational Loop — ORIENT step | Addressed the QA review by providing explicit, actionable changes: renamed the disk-only helper, added two new exported helpers with exact function names and behaviors (screenshotInline and takeA11ySnapshot), included exact code snippets for each change, provided README text to insert, and specified two CI test file names with minimal test code. This gives integrators and maintainers concrete instructions to implement and verify the ORIENT workflows. |
| 05 | CRITICAL | Connecting to Chrome | DevToolsActivePort is currently read in a brittle happy-path way and Chrome startup overlays are not suppressed; add automation flags, robust multi-line parsing, and a 30s poll-with-retry to fix reliability. |
| 06 | CRITICAL | Connecting to Chrome / Design Constraints | Skill lacks guidance on timeouts, sandboxing flags, and resource limits — provide concrete safe defaults (timeouts, Chrome flags, dialog handling) and require container/VM isolation for untrusted pages. |
| 07 | CRITICAL | Common Failure Modes / Knowledge System | The skill lacks any privacy/data-handling guidance for automation artifacts (screenshots, cookies, DOM dumps), risking exposure of PII and secrets; add an explicit Privacy & Data Handling section with ephemeral storage, redaction, token-avoidance, clearing state, pre-ingest checks, and CI tests. |
| 08 | MAJOR | Common Failure Modes | The skill documents anti-bot traps but gives no runtime guidance — agents must surface structured errors and halt when encountering CAPTCHAs/anti-bot walls instead of attempting programmatic bypass. |
| 09 | MAJOR | Wait Patterns | The skill warns that document.readyState=="complete" is insufficient for SPA stability but provides a helper that checks only readyState; replace it with selector-based waits or a network-idle heuristic and update the docs and examples. |
| 10 | MAJOR | Bulk HTTP / references/cdp-snippets.md | refs/cdp-snippets.md uses urllib.request while decision table prescribes httpx; urllib can mishandle redirects (especially for POST) and the snippets lack follow_redirects, timeout and proper error handling — standardize on httpx and update http_get/bulk_get accordingly. |
| 11 | MAJOR | references/cdp-snippets.md / Wait Patterns | The main example uses asyncio.sleep(1), which teaches brittle fixed sleeps instead of the provided polling helpers; replace the sleep with wait_for_load or wait_for_selector and add a comment warning against fixed sleeps. |
| 12 | MAJOR | Core Mental Model / Common Failure Modes | SKILL.md contradicts itself by forbidding persistent coordinates while naming them the primary primitive; clarify coordinates are ephemeral per-screenshot and recommend runtime selectors/element-fingerprints for durable scripted flows. |

---

## Findings

# Finding: Missing CDP error and recovery strategy

- id: finding_01
- severity: critical
- section: Common Failure Modes / CDP Error Handling

## Problem

The agent skill document does not define a coordinated policy for handling failures originating from the Chrome DevTools Protocol (CDP). When CDP calls fail (connection drops, protocol errors, timeouts, or unexpected responses), agents can silently fail, retry forever, or enter undefined or inconsistent states because there is no guidance on classification, retry behavior, escalation, or recovery.

## Why this matters

- CDP is a networked interface to a real browser process; failures are common (transient network blips, overloaded browser, unexpected prompts, or Chrome crashes).
- Without a standard failure model agents will behave inconsistently: some may block waiting for a response, others may spin retrying tight loops, and some may drop state and continue as if the operation succeeded.
- This results in flakiness, resource leaks, inaccurate results, and operational surprises that are hard to diagnose.

## Concrete example

Scenario:
1. An agent issues a CDP `Runtime.evaluate` call to run a page script and waits for a response.
2. The underlying Chrome process crashes or the DevTools websocket drops mid-flight.
3. The agent's call times out; there is no error classification or retry policy in the skill document.
4. The agent logs the error but continues with the next action, believing the evaluation succeeded, leaving saved state inconsistent.

Observed failure modes this produces:
- Silent data corruption: state advanced without required confirmation.
- Resource exhaustion: multiple agents concurrently reopen new Chrome instances without cleaning up the old ones.
- Hard-to-reproduce failures: the behavior depends on timing of transient network/Crome faults.

## Recommendation (actionable)

1. Define a CDP error-handling policy in the skill document that includes:
   - Error classification (examples below) and the allowed handling path for each class.
   - A default retry policy with parameters and examples.
   - Escalation rules: when to surface a fatal error to a supervisor agent or operator.
   - Recovery procedures and the checkpoint/resume model.

2. Error classification (minimum set):
   - Transient network error: websocket disconnects, short timeouts. Handling: retry with exponential backoff + jitter. Consider limited attempts (e.g., 5 attempts).
   - Recoverable protocol error: temporary protocol mismatch or recoverable internal browser error. Handling: retry after small backoff; if repeated, restart browser context and retry once.
   - Fatal error: corrupted session, unrecoverable protocol error, repeated timeouts beyond threshold, or unrecoverable Chrome crash. Handling: abort current workflow, surface to supervisor, run recovery procedure.

3. Implement retries with exponential backoff + jitter and a maximum attempt count. Example pseudocode (illustrative):

```javascript
// illustrative JS-style pseudocode
async function callCdpWithRetry(fn, opts = {}) {
  const maxAttempts = opts.maxAttempts || 5;
  const baseMs = opts.baseMs || 100; // initial backoff
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn(); // actual CDP call
    } catch (err) {
      if (isFatal(err)) throw err; // don't retry fatal errors
      if (attempt === maxAttempts) throw err;
      const backoff = Math.min(10000, baseMs * Math.pow(2, attempt - 1));
      const jitter = Math.random() * (backoff * 0.2);
      await sleep(backoff + jitter);
    }
  }
}
```

4. Add explicit timeouts for every CDP call and enforce them at the caller level (do not rely solely on socket timeouts). Example: each operation accepts a timeout, and when it elapses it returns a classified timeout error.

5. Circuit breaker / health-check for browser contexts:
   - Track recent failure rate per browser instance or session.
   - If failures exceed threshold, mark the session unhealthy, stop sending new work to it, and start a controlled restart sequence.

6. Checkpointing and idempotency:
   - Before performing non-idempotent actions, persist a lightweight checkpoint describing intent and necessary state to resume or roll back.
   - Design agent actions to be idempotent where possible or carry compensating actions for rollback.
   - Provide a documented resume procedure: how to detect the last successful checkpoint and continue from there (or roll back safely).

7. Supervisor escalation and observability:
   - Surface fatal errors to a supervisor agent or operator channel with a clear error envelope: {error_type, cdp_command, session_id, attempt_count, last_response, timestamp}.
   - Emit metrics: CDP call latency histogram, retry count, failure counts by class, session restarts.
   - Attach structured logs and a recent trace/span to make postmortems possible.

8. Automated tests and chaos scenarios:
   - Add unit and integration tests that inject simulated CDP failures (timeouts, partial responses, websocket drops).
   - Run chaos tests in CI that randomly drop CDP connections and verify the system follows the documented recovery policy (retries, restarts, escalation).

9. Documentation / runbook:
   - Add a recovery runbook describing step-by-step actions for operators when supervisor escalation fires (how to inspect sessions, restart browsers, replay from checkpoints).
   - Document SLA expectations and thresholds (e.g., max retry attempts, acceptable timeout values, when to create incident).

## Minimal acceptance criteria

- The skill repo contains a written CDP error-handling policy covering classification, default retry/backoff parameters, and escalation rules.
- All CDP calls use a shared wrapper implementing timeouts, retries with exponential backoff + jitter, and error classification.
- Fatal errors are surfaced to a supervisor agent with a structured payload.
- There is at least one automated integration test simulating a CDP websocket drop that validates the system recovers or escalates per the policy.
- A short runbook describing recovery steps and how to resume from checkpoints is checked into the repo.

## Prioritization

Severity: critical — implement within the next sprint for any production-facing agents that depend on CDP. This prevents silent corruption, operational surprises, and reduces mean time to recovery for Chrome-related failures.


---

# Finding: Unattended auth and session handling is non-actionable

## Problem

The skill currently treats authentication walls as a hard stop and instructs the agent to "Stop, ask user" when it encounters an auth gate. For headless or unattended agents (no interactive terminal, long-running autonomous runs, or CI contexts) this is a dead end: the agent cannot prompt a human and therefore halts indefinitely or fails silently. The skill provides no programmatic alternatives such as cookie injection, session restoration, credential-vault integration, or structured error reporting that calling code can handle.

Section: Decision Table / Auth wall
Severity: critical

## Concrete example

1. Agent navigates to https://example.com/dashboard to collect data.
2. Server responds with a 302 redirect to /login (or serves a login form).
3. The skill's decision table matches an "auth wall" and returns the instruction: "Stop, ask user".
4. The agent has no terminal, so it cannot prompt. The run ends in an unhandled failure or a generic error string.

This behavior means automated workflows (nightly crawls, test runners, scraping jobs, or multi-step agents) cannot recover or take programmatic corrective actions.

## Why this is critical

- Autonomous agents must either recover programmatically or surface precise, machine-readable errors so an orchestrator can decide next steps (retry, use stored credentials, escalate to human).
- Silent halts or human-facing instructions break automation and make the skill unusable in non-interactive contexts.

## Recommendation (summary)

Add a dedicated section on programmatic session handling and auth-wall handling that includes:

- Clear detection heuristics for auth-walls (redirects to login, presence of known login forms, HTTP 401/403 status patterns).
- A structured error format the skill returns when interactive resolution is required.
- Programmatic remediation patterns: cookie injection (Network.setCookies), restore/save session state between runs, retry after restoring credentials, and integration notes for credential vaults.

## Implementation details (actionable)

1. Detect auth walls deterministically

- Check responses for redirect status codes (301/302/303/307/308) with a Location header containing login/signin keywords.
- Check for 401/403 responses that are followed by HTML pages containing login forms (e.g., `<form`, `type="password"`, `name="username"`).
- Expose detection as a boolean with a short reason code, not as a user instruction.

2. Surface a structured, machine-readable error when unattended

Return a JSON error object instead of a human-facing string. Example schema:

```json
{
  "type": "auth_required",
  "reason": "redirect_to_login",
  "url": "https://example.com/dashboard",
  "login_url": "https://example.com/login",
  "action": "restore_session | provide_credentials",
  "details": {
    "cookie_domains": ["example.com"],
    "detected_by": "redirect|login_form|401",
    "timestamp": "2026-04-22T00:00:00Z"
  }
}
```

The orchestrator can parse this and either supply credentials, inject cookies/session, or escalate to human operators.

3. Programmatic session restoration and cookie injection

- Save session cookies and relevant storage (localStorage/sessionStorage) after successful authenticated runs.
- Restore these artifacts before accessing protected pages.
- Example using the Chrome DevTools Protocol (CDP) Network.setCookies:

```javascript
// client is a CDP session (e.g., puppeteer._client or chrome-remote-interface)
await client.send('Network.setCookies', {
  cookies: [
    {
      name: 'session',
      value: 'REDACTED_SESSION_VALUE',
      domain: 'example.com',
      path: '/',
      httpOnly: true,
      secure: true
    }
  ]
});
// then navigate to the protected page
await page.goto('https://example.com/dashboard');
```

- For Puppeteer/Playwright you can also use page.setCookie(...) or context.addCookies(...).

4. Credential vault integration

- Provide hooks for calling code to supply credentials securely (integration points with HashiCorp Vault, AWS Secrets Manager, or a local encrypted store).
- The skill should never hardcode secrets; instead accept opaque tokens/credentials from the caller and document the required scopes/format.

5. Retry flow

- On auth detection, the skill should:
  a. Return the structured auth_required error (see schema).
  b. Allow callers to call a recovery endpoint or pass back saved session artifacts (cookies/storage) to attempt a retry.
  c. Document retry limits and backoff to avoid lockouts.

6. Logging and telemetry

- Emit a compact audit event when an auth wall is detected (detection_reason, URL, timestamp) so operators can debug repeated failures.

## Example detection pseudocode

```javascript
function isAuthWall(response, bodyHtml) {
  const loc = (response.headers && response.headers.location) || '';
  if ([401,403].includes(response.status)) return {detected: true, reason: '401/403'};
  if ([301,302,303,307,308].includes(response.status) && /login|signin/.test(loc)) return {detected: true, reason: 'redirect_to_login', login_url: loc};
  if (/\b<form\b/i.test(bodyHtml) && /type=["']password["']/.test(bodyHtml)) return {detected: true, reason: 'login_form'};
  return {detected: false};
}
```

## Security considerations

- Treat session artifacts and credentials as sensitive. Always store encrypted at rest and limit access to in-memory use.
- Rotate session tokens where appropriate and enforce short lifetimes if possible.
- Sanitize any logs that might accidentally include secrets; never log full cookie values.
- When requesting credentials programmatically, require explicit caller consent and document least-privilege scopes.

## Acceptance criteria (tests)

- Unit tests that simulate 302->/login and assert the skill returns the structured auth_required object.
- E2E test that saves cookies after an authenticated session, clears browser state, restores cookies via Network.setCookies, and verifies access to a protected page succeeds.
- Test verifying that when no programmatic remediation is possible the skill returns the structured error rather than a human-facing "Stop, ask user" string.

## Summary of deliverables to add to the skill document

- New subsection: "Programmatic session handling and auth-wall remediation"
  - Detection heuristics (rules)
  - Structured error schema (example)
  - CDP cookie injection example + Puppeteer/Playwright equivalents
  - Credential vault integration guidance
  - Retry policy and telemetry guidance
  - Security and storage best practices

Adding these items will make the skill usable by unattended agents and orchestrators, prevent silent failures, and provide clear machine-readable signals for recovery or escalation.


---

# Compositor vs DOM click model is undocumented and misleading

## Problem

The skill recommends using Input.dispatchMouseEvent as the primary "click" primitive and states it "passes through all DOM boundaries at the compositor level." This guidance is incorrect and dangerously misleading. Input.dispatchMouseEvent is a low-level compositor input primitive — it can synthesize pointer activity at the compositor/thread level but does not guarantee that a matching DOM "click" event (the one delivered to listeners registered with addEventListener('click') or inline onclick handlers) will be dispatched on the page's main thread. On the majority of pages where UI widgets rely on DOM-level click listeners, using Input.dispatchMouseEvent will silently fail to trigger the intended handlers.

Severity: critical
Section: Core Mental Model / Decision Table

---

## Concrete example (minimal repro)

HTML (page):

```html
<!doctype html>
<html>
  <body>
    <button id="btn">Click me</button>
    <script>
      document.getElementById('btn').addEventListener('click', () => {
        console.log('DOM click handler fired');
        document.body.dataset.clicked = 'yes';
      });
    </script>
  </body>
</html>
```

Scenario A — what the skill recommends (compositor event):

- Using CDP Input.dispatchMouseEvent (or equivalent compositor-level coordinate click) to click the button by coordinates. This synthesizes a pointer event at the compositor/hardware-accelerated layer.
- Observed outcome: the compositor receives the input, but the page's DOM click listener does not run and the console log and dataset update do not occur.

Scenario B — correct approach for standard HTML buttons:

- Using a DOM-level dispatch such as Runtime.evaluate('document.querySelector("#btn").click()') or dispatching a MouseEvent on the element from the page (e.g. element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))).
- Observed outcome: the DOM click listener runs, console shows "DOM click handler fired", and dataset.clicked == 'yes'.

Note: whether Input.dispatchMouseEvent reaches the DOM depends on compositing, hit-testing, and how layers are implemented. It can work for some elements (canvas/WebGL or elements rendered into composited layers that forward events) and fail silently for others.

---

## Why this matters (technical explanation)

- Input.dispatchMouseEvent is routed at the compositor/input compositor level. The compositor can perform hit-testing, decide which layer receives the event, and may not forward a synthetic compositor event to the page's main thread in a way that triggers DOM-level "click" listeners.
- Most interactive controls (buttons, links, SPA widgets) rely on DOM click handlers registered via addEventListener('click') or onclick attributes. Those are delivered and processed on the main thread as DOM events — not necessarily triggered by compositor-only input synthesis.
- Relying on compositor-level coordinate clicks as the default will make the skill silently fail on a large class of real web pages, causing flaky automation and brittle behavior.

---

## Specific, actionable recommendation

1. Change the mental model and documentation immediately: mark Input.dispatchMouseEvent as a low-level compositor primitive, not the "primary" click API for standard HTML elements.

2. Provide a clear decision table and recipe that distinguishes two classes of targets and the recommended method for each:
   - Standard HTML controls (buttons, anchors, inputs, elements with click listeners): prefer DOM-level approaches as the default:
     - Runtime.evaluate('document.querySelector("... ").click()') or
     - Runtime.evaluate('var el = document.querySelector("..."); el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }))') or
     - Use Target/Runtime mechanisms to attach to the target and dispatch events on the element through the DOM (Target-attached DOM events).
   - Non-standard or compositor-only targets (canvas, WebGL, custom composited controls, elements intentionally using compositor-only hit regions): use Input.dispatchMouseEvent or coordinate-based compositor clicks as a fallback.

3. Demote coordinate-based compositor clicks in the decision table from "primary" to "fallback for non-standard elements". The default flow should attempt to use DOM-level click semantics first, then fall back to coordinate/compositor click if the DOM approach is not possible (for example when the element is offscreen, unreachable by selector, or is a raw canvas/WebGL surface).

4. Add detection heuristics and safe-fallback logic in implementations:
   - Prefer DOM click if an element reference can be obtained (querySelector) and it is interactive (has role/button semantics, is a <button>/<a>, or has click/keydown handlers).
   - If DOM click is not available or fails, fall back to coordinate click.
   - When falling back to compositor clicks, log a clear warning describing the risk and that the DOM handler may not run.

5. Update examples and code samples to show both methods and note which to use when. Show the DOM.click() method as the primary example for HTML controls.

6. Update test suites and add integration tests that assert DOM click handlers run when using the recommended default method (Runtime.evaluate('...click()')). Include a negative test demonstrating that Input.dispatchMouseEvent does not trigger DOM listeners on a sample page so the behavior is explicit and reproducible.

---

## Suggested documentation snippet to add

> Note: Input.dispatchMouseEvent is a low-level compositor input primitive. It can synthesize pointer activity at the compositor thread but does not guarantee dispatch of DOM "click" events on the main thread. For standard HTML buttons, links, and elements that register click handlers with addEventListener('click'), use a DOM-level click (for example Runtime.evaluate('document.querySelector("...").click()') or dispatching a MouseEvent through the page's JS context). Use Input.dispatchMouseEvent only for canvas/WebGL or other compositor-only targets where DOM click will not work.

---

## Decision table delta (concise)

Old: Primary click primitive = Input.dispatchMouseEvent (coordinate clicks)  
New: Primary click primitive = DOM-level click (Runtime.evaluate("el.click()") / element.dispatchEvent(...))  
Fallback: Input.dispatchMouseEvent = fallback for compositor-only targets (canvas, WebGL, composited controls)

---

## Tests to add

- Positive test: page with addEventListener('click') should run handler when using DOM click API.
- Negative/regression test: demonstrate that Input.dispatchMouseEvent may not trigger DOM listeners on a sample page — assert the difference and ensure skill logs a warning when falling back.
- Heuristic test: when a selector is present and element is interactive, the implementation uses DOM click by default.

---

## Summary

Update the skill documentation and decision table to reflect that Input.dispatchMouseEvent is a compositor-level primitive and should not be the default for standard HTML interactions. Prefer DOM-level click dispatch for buttons and links; use compositor coordinate clicks only as a fallback for compositor-only targets.


---

# Finding: ORIENT loop broken when screenshot() returns a file path

Severity: **critical**
Section: Operational Loop / The Core Mental Model

## Summary
The CDP snippet helper screenshot() currently writes a PNG to disk and returns only a filesystem path (e.g. `/tmp/shot.png`). Downstream agent logic expects inline image bytes (or a structured accessibility tree) to run vision models or compute screen coordinates. Returning just a string path severs the data flow and prevents programmatic ORIENT operations.

## Problem explained
- The CDP snippet helper `screenshot()` is implemented for human debugging: it writes an image file and returns its path.
- Programmatic ORIENT requires either:
  - raw image bytes (or base64) that can be passed to a vision model, or
  - a structured accessibility (a11y) snapshot with bounding boxes so coordinates can be derived without pixel processing.
- No documented, supported pipeline exists showing how an agent should convert a returned path into usable image bytes or an a11y tree: the helper returns only a path string.
- Agents receiving only `"/tmp/shot.png"` cannot call vision models or compute coordinates in a portable way across runtimes where the runner's filesystem may not be shared.

## Concrete recommendation (exact function changes and code)
Make the following three concrete code changes in the CDP snippet helpers and documentation. Each change is explicit (file, function name, exact behavior) and includes a minimal code example.

1) Rename the disk-only helper and keep it as "for human debugging".
- File: cdpsnippet.js
- Change: rename exported function `screenshot()` -> `screenshotToDiskForHumanDebug()` and keep its behavior (write PNG to disk and return the path).
- Rationale: prevents accidental programmatic use of the disk-only helper.

Example replacement (cdpsnippet.js):

```js
// BEFORE
// async function screenshot() { /* writes '/tmp/shot.png' and returns path */ }

// AFTER
async function screenshotToDiskForHumanDebug(page) {
  const path = '/tmp/shot.png';
  await page.screenshot({ path, type: 'png' });
  return path; // explicitly for human inspection only
}

module.exports = { screenshotToDiskForHumanDebug };
```

2) Add a new inline screenshot helper that returns base64 image bytes suitable for vision models.
- File: cdpsnippet.js (same file; export new function)
- Function name: `screenshotInline()`
- Behavior: call the CDP/tooling primitive that returns inline image data (base64) and return the raw Buffer or base64 string. Do NOT write to disk.

Example implementation (cdpsnippet.js):

```js
// returns base64 string or Buffer depending on consumer preference
async function screenshotInline(page, { format = 'png', asBuffer = true } = {}) {
  // Use the chrome-devtools_take_screenshot tool or Page.captureScreenshot CDP method
  // Example with a tools wrapper that returns base64:
  const imageBase64 = await tools.chromeDevtools.takeScreenshot({ format, inline: true });
  if (asBuffer) return Buffer.from(imageBase64, 'base64');
  return imageBase64;
}

module.exports = { screenshotToDiskForHumanDebug, screenshotInline };
```

Agent usage example (immediate ORIENT):

```js
const imageBytes = await helpers.screenshotInline(page); // Buffer
const detections = await visionModel.detect(imageBytes);
const coords = computeCoordsFromDetections(detections);
// proceed to ACT
```

3) Add a dedicated accessibility snapshot helper that returns the a11y tree.
- File: cdpsnippet.js
- Function name: `takeA11ySnapshot()`
- Behavior: call the `chrome-devtools_take_snapshot` primitive (or Page.getAccessibilityTree equivalent) and return the parsed accessibility tree (JSON). Agents compute coordinates from node.boundingBox without pixel-level vision.

Example implementation (cdpsnippet.js):

```js
async function takeA11ySnapshot(page) {
  // Use the provided tooling primitive
  const a11yTree = await tools.chromeDevtools.takeSnapshot();
  return a11yTree; // structured nodes with boundingBox fields
}

module.exports = { screenshotToDiskForHumanDebug, screenshotInline, takeA11ySnapshot };
```

4) Update all agent-side examples and the skill README to document the three helpers and recommend the correct one to use:
- Add a "Helpers and workflows" section describing:
  - `screenshotToDiskForHumanDebug(page)` — for humans only (returns path)
  - `screenshotInline(page, { asBuffer: true })` — preferred for programmatic ORIENT using vision models (returns bytes)
  - `takeA11ySnapshot(page)` — preferred for accessibility-driven ORIENT (returns a11y tree with bounding boxes)

Documentation snippet to insert into README (exact text to add or replace the current screenshot() mention):

```md
### Helpers and workflows
- screenshotToDiskForHumanDebug(page)
  - Writes a PNG to disk and returns the filesystem path. Intended for human debugging only.
- screenshotInline(page, { format = 'png', asBuffer = true })
  - Returns screenshot image bytes (Buffer) or base64 string. Use this when you need to feed images into vision/CV models.
  - Example: `const img = await helpers.screenshotInline(page); const detections = await visionModel.detect(img)`
- takeA11ySnapshot(page)
  - Returns the accessibility tree (a11y snapshot) with node bounding boxes. Use this to compute screen coordinates using semantic nodes without pixel analysis.
  - Example: `const tree = await helpers.takeA11ySnapshot(page); const btn = findNode(tree, 'Submit'); const coords = toScreenCoords(btn.boundingBox)`
```

5) Add two automated tests (CI) that validate ORIENT end-to-end using the new helpers.
- Test files (suggested paths):
  - `tests/ci/orient_inline.test.js` — asserts `screenshotInline()` returns non-empty Buffer/base64 and that the sample visionModel stub receives bytes and returns detections; test should assert coordinate computation runs to completion.
  - `tests/ci/orient_a11y.test.js` — asserts `takeA11ySnapshot()` returns a tree with at least one node having a boundingBox and that `toScreenCoords()` returns valid coordinates.

Minimal Jest-style pseudo-test for inline flow (exact file name: tests/ci/orient_inline.test.js):

```js
const { screenshotInline } = require('../../cdpsnippet');
const visionModel = require('../stubs/visionModelStub');

test('ORIENT inline-image flow works end-to-end', async () => {
  const img = await screenshotInline(page);
  expect(img).toBeDefined();
  const detections = await visionModel.detect(img);
  expect(Array.isArray(detections)).toBe(true);
  const coords = computeCoordsFromDetections(detections);
  expect(coords).toHaveProperty('x');
  expect(coords).toHaveProperty('y');
});
```

Minimal Jest-style pseudo-test for a11y flow (exact file name: tests/ci/orient_a11y.test.js):

```js
const { takeA11ySnapshot } = require('../../cdpsnippet');

test('ORIENT a11y flow works end-to-end', async () => {
  const tree = await takeA11ySnapshot(page);
  const node = findNodeByLabel(tree, 'Submit');
  expect(node).toBeDefined();
  expect(node.boundingBox).toBeDefined();
  const coords = toScreenCoords(node.boundingBox);
  expect(coords.x).toBeGreaterThanOrEqual(0);
  expect(coords.y).toBeGreaterThanOrEqual(0);
});
```

## Migration notes (exact steps integrators should follow)
- Find existing uses of `screenshot()` in agent code and replace with one of:
  - `screenshotInline(page)` if the agent needs to run vision/CV models on the image bytes, or
  - `takeA11ySnapshot(page)` if the agent needs semantic node bounding boxes.
- If a project legitimately used the disk path for human debugging, replace calls to `screenshot()` with `screenshotToDiskForHumanDebug()`.

Example automated migration diff (conceptual):

```diff
- const path = await helpers.screenshot(page);
- // read file and convert to bytes (ad-hoc)
+ // preferred: get inline bytes directly
+ const imageBytes = await helpers.screenshotInline(page);
+ const detections = await visionModel.detect(imageBytes);
```

## Acceptance criteria (concrete)
- cdpsnippet.js exposes these helpers and behaviors: `screenshotToDiskForHumanDebug`, `screenshotInline`, `takeA11ySnapshot`.
- README/skill docs updated with the "Helpers and workflows" section above (exact text included).
- At least two automated CI tests exist and pass: `tests/ci/orient_inline.test.js` and `tests/ci/orient_a11y.test.js` validating end-to-end ORIENT for each workflow.
- All existing agent examples in the skill docs replaced to use `screenshotInline()` or `takeA11ySnapshot()` where programmatic ORIENT is required.

## Rationale
Programmatic ORIENT requires data formats that models and coordinate-mapping logic can consume immediately. Returning only a filesystem path is ambiguous and non-portable across runtimes. The changes above make the integration explicit, provide safe helpers for both pixel-based and accessibility-based orientation, and keep a disk-writing helper strictly for human debugging.


---

# Finding: DevToolsActivePort handling is fragile and Chrome startup overlays are unaddressed

Severity: **critical**

## Problem

The skill's current logic for connecting to Chrome via DevToolsActivePort assumes a single happy-path: it reads only the first line of the DevToolsActivePort file and proceeds immediately. This is brittle for two reasons:

1. Chrome may be launched without the expected remote-debugging flags (or with an ephemeral port), in which case the DevToolsActivePort file is absent or contains unexpected contents and the skill fails silently or with an unclear error.
2. Chrome's interactive startup overlays (Restore Tabs dialog, profile picker, Translate banner, Allow notifications prompt, etc.) can appear during startup and block automation. The skill does not suppress or detect these overlays, so automation attempts can hang or fail with timeouts while Chrome appears to be running.

Both failures are subtle: the skill either errors early without a clear guidance message or proceeds to a hung automation state where subsequent DevTools calls never return.

## Concrete example / reproduction

- Launch Chrome without the automation-safe flags (for example, with a normal user profile). Chrome may not open a remote debugging port or may present the user with a profile picker dialog. The skill attempts to read `/path/to/profile/DevToolsActivePort`, reads the first line (or nothing), and either fails or uses an invalid port.

- Example of a brittle read (current behavior):

```pseudo
line = read_first_line("DevToolsActivePort")
port = parseInt(line)
connect_to_chrome(port)
```

If the file contains multiple lines, a header, or the port hasn't been written yet, parseInt(line) will fail or return NaN and connect attempts will break.

## Why this matters

- Automation reliability: missing or malformed DevToolsActivePort handling and unhandled overlays are common causes of flaky automation runs.
- User experience: when Chrome starts with UI overlays, automation can appear to hang with no actionable error message.
- Security & portability: relying on implicit environment assumptions (single-line file, no overlays) makes the skill fragile across platforms and Chrome releases.

## Recommended actionable changes

1. Start Chrome with a fixed set of automation-safe command-line flags and document why each is required. Recommended flags:

   - --remote-debugging-port=0        # request an ephemeral port and let Chrome write it to DevToolsActivePort
   - --no-first-run
   - --no-default-browser-check
   - --disable-infobars
   - --disable-notifications
   - --disable-translate
   - --disable-extensions
   - --password-store=basic           # Mac/Linux: avoid native keychain prompts
   - --use-mock-keychain              # macOS: avoid keychain UI

   Provide a sample launch command in the skill docs and the agent's README:

```bash
chrome \
  --remote-debugging-port=0 \
  --no-first-run \
  --no-default-browser-check \
  --disable-infobars \
  --disable-notifications \
  --disable-translate \
  --disable-extensions \
  --password-store=basic \
  --use-mock-keychain \
  --user-data-dir=/tmp/automation-profile
```

2. Treat DevToolsActivePort as multi-line and robustly parse it. Read the entire file, not only the first line, and extract the port using a regex; tolerate extra header/footer lines. Example parsing steps:

   - Wait for the DevToolsActivePort file to exist.
   - Read the full file contents and split into lines.
   - Search lines for an integer port (regex: /\d{2,5}/) or explicitly documented format if available.

   Example pseudocode:

```pseudo
start = time.now()
while time.now() - start < 30s:
  if file_exists(path):
    contents = read_all(path)
    for line in contents.splitlines():
      m = regex_search(line, "\\d{2,5}")
      if m:
        port = int(m.group())
        if port_open(localhost, port):
          return port
  sleep(0.5)
raise Error("DevTools port not available after 30s; ensure Chrome started with --remote-debugging-port and automation flags")
```

3. Add a poll-with-retry for port readiness (30-second timeout recommended).

   - Poll the DevToolsActivePort file and the HTTP JSON endpoint (e.g., http://127.0.0.1:<port>/json/version) until a successful response.
   - Use small backoff (e.g., 500ms) and a hard timeout of 30s. This covers slow Chrome startups and ensures deterministic failures with a clear error message.

4. Detect and fail fast with clear guidance when Chrome isn't launched with a remote debugging port.

   - If no DevToolsActivePort is written within the timeout, raise an error explaining exactly what to do: "Start Chrome with --remote-debugging-port=0 and the recommended automation flags (see docs)." Provide the sample command above.

5. Suppress or proactively handle UI overlays.

   - Enforce the recommended flags when launching Chrome so common overlays are suppressed.
   - When automation must attach to an already-running user Chrome, detect the presence of known overlays via the DevTools protocol (e.g., enumerating open targets) and fail with a descriptive message if overlays are present. Prefer attaching to a temporary profile created specifically for automation.

6. Document the DevToolsActivePort format and the skill's expectations.

   - Add a doc section: "DevToolsActivePort: format, parsing rules, and why we poll" explaining the multi-line format, examples of possible contents, and the polling strategy.

## Additional implementation notes / examples

- Use an ephemeral user-data-dir for reliable, repeatable automation runs; this avoids user profile dialogs.
- Example robust flow summary:
  1. Launch Chrome with recommended flags and --remote-debugging-port=0 and a dedicated user-data-dir.
  2. Poll DevToolsActivePort file for up to 30s, reading all lines and extracting a port via regex.
  3. Confirm the port by calling /json/version or /json/list and checking for a valid JSON response.
  4. If step 3 fails, provide a clear error describing required flags and a sample command.

## Summary recommendation (one-liner)

Add automation-safe Chrome flags, read and parse DevToolsActivePort robustly (multi-line), and implement a 30-second poll-with-retry that verifies the port is open and returns a clear, actionable error when Chrome is not started correctly.

---

# Finding: No safe defaults or sandboxing guidance for running arbitrary page content

- Severity: critical
- Section: Connecting to Chrome / Design Constraints

## Problem

The skill documentation does not provide any guidance or safe defaults for launching Chromium/Chrome or for executing untrusted web content. There are no recommended timeout values, no recommended Chrome flags, and no guidance on resource limits or isolation boundaries. Running arbitrary pages without these controls leaves operators exposed to pages that can: spin CPU forever, exhaust memory, open blocking native dialogs, perform long-running network activity, or otherwise destabilize the host.

## Why this is critical

Automation tools that drive real browser instances are exposed to arbitrary JavaScript from remote pages. A malicious or buggy page can easily consume unbounded CPU, leak memory, block progress with alert()/confirm()/prompt() dialogs, or keep network requests and timers running indefinitely. Without explicit guidance operators may run Chrome with insecure flags (for example --no-sandbox) or without any process watchdogs, increasing the blast radius and enabling denial-of-service on the agent, the host, or other tenants.

## Concrete examples

1) Infinite loop CPU burn

- A page with: while(true) { /* heavy computation */ } will peg a single core indefinitely. If launched repeatedly or across many pages, this can saturate the host.

2) Blocking native dialogs

- page.evaluate(() => alert('hi')) or malicious pages that open confirm()/prompt() repeatedly will block the automation unless the script listens for and dismisses dialog events.

3) No navigation / network timeouts

- A slow or frozen navigation (large assets, CDN stall) without a navigation timeout will hang the job indefinitely.

4) Running with --no-sandbox on a multi-tenant machine

- Launching Chrome with --no-sandbox expands the attack surface and makes container escape or privilege escalation easier if a renderer exploit exists.

## Recommendation (actionable)

Add a "Safe defaults" section to the skill that mandates or strongly recommends the following practical controls. Provide example CLI flags and a short code snippet for the common runtimes (Puppeteer / Playwright). Make the guidance prescriptive — give concrete defaults, not just high-level advice.

1. Prefer sandboxing; avoid --no-sandbox unless absolutely required

- Default: do NOT pass --no-sandbox.
- If you must run without the Chrome sandbox, document the explicit risk and require running inside a hardened isolation boundary (container/VM) and as non-root.

2. Enforce timeouts (navigation and operation-level)

- Navigation timeout: 30s (example). Expose this as a configurable value but set a sane default.
- Operation timeout (waitForSelector, evaluate, etc.): 30s default.
- Example APIs to set: page.setDefaultNavigationTimeout(ms), page.setDefaultTimeout(ms) in Puppeteer/Playwright.

3. Dismiss or handle native dialogs automatically

- Attach a dialog handler that immediately dismisses or logs and dismisses dialogs to prevent blocking.

4. Start Chrome with restrictive automation flags

- Recommended flags (example):
  --disable-background-networking
  --disable-sync
  --disable-extensions
  --disable-dev-shm-usage
  --no-first-run
  --no-default-browser-check
  --disable-gpu
  --disable-setuid-sandbox (only when necessary and documented)

- Avoid --no-sandbox as a default. If documentation shows examples with --no-sandbox, add a conspicuous warning.

5. Limit OS-level resources and run in an isolated boundary for untrusted pages

- Run each job inside a container or VM when processing untrusted content. Provide example container runtime options to limit resources:
  - Docker example: --memory=512m --cpus="0.5" --pids-limit=100 --security-opt=no-new-privileges --cap-drop=ALL
  - Prefer using a short-lived VM (Firecracker, gVisor, or full VM) for higher-risk workloads.

6. Add a watchdog and enforced kill policy

- Ensure the orchestrator kills browser/page processes that exceed CPU time, wall time, or memory thresholds. Provide example values and commands to detect and kill stuck processes.

7. Provide example safe starter code (Puppeteer)

Include a minimal, copy-pasteable snippet demonstrating the above safe defaults. Example:

```js
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--disable-background-networking',
      '--disable-sync',
      '--disable-extensions',
      '--disable-dev-shm-usage',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-gpu'
      // Do NOT include '--no-sandbox' here unless you document why and run inside a container/VM
    ],
  });

  const page = await browser.newPage();

  // Set conservative defaults
  page.setDefaultNavigationTimeout(30000); // 30s
  page.setDefaultTimeout(30000);

  // Auto-dismiss dialogs to prevent blocking
  page.on('dialog', async dialog => {
    console.warn('Dialog dismissed:', dialog.message());
    try { await dialog.dismiss(); } catch (e) { /* ignore */ }
  });

  // Example navigation with explicit timeout and try/catch
  try {
    await page.goto('https://example.com', { waitUntil: 'networkidle2', timeout: 30000 });
  } catch (err) {
    console.error('Navigation failed or timed out', err);
    // Clean up / report
  }

  // Always close/cleanup
  await page.close();
  await browser.close();
})();
```

8. Document recommended operational settings and examples for container runtimes

- Provide concrete docker run examples and recommended system limits (memory, cpu, pid limits, seccomp profile). Example:

```
docker run --rm \
  --memory=512m --cpus=0.5 --pids-limit=100 \
  --security-opt=no-new-privileges \
  --cap-drop=ALL \
  my-browser-image:latest
```

9. Add a "When to use --no-sandbox" subsection

- Explain when --no-sandbox might be necessary (e.g., some constrained CI environments), list mitigations (must run in container/VM, non-root, enforced cgroups, ephemeral instance), and require an explicit opt-in.

10. Surface these defaults prominently in the skill README and any quickstart examples

- If quickstart commands or examples are present, make sure they use the safe defaults or include an inline WARNING block if an example deviates.

## Implementation checklist (recommended)

- [ ] Add a "Safe defaults" section to the skill document.
- [ ] Publish recommended default timeouts (navigation + operation) and example code for Puppeteer/Playwright.
- [ ] Add a list of recommended Chrome flags and a warning about --no-sandbox.
- [ ] Provide sample Docker/VM run commands with resource limits.
- [ ] Add a watchdog/kill-policy recommendation and a short sample implementation.
- [ ] Add an explicit opt-in policy for disabling the sandbox and require operator acknowledgement in docs.

## Impact if not fixed

Leaving these omissions unaddressed means downstream users will likely copy insecure examples and run automation in unsafe ways. That can lead to host resource exhaustion, automation hangs, and greatly increased risk if a renderer vulnerability is later discovered.




---

# Finding: Privacy and secret management absent

Severity: **critical**

Summary

The skill document contains no guidance on handling sensitive artifacts produced during automation runs. Screenshots, DOM dumps, browser cookies/session tokens, and logs generated by the automation can capture or leak PII and secrets. Without explicit controls, artifacts may be written to persistent storage, logged in full, or retained in a knowledge system in violation of the project's Three Gates policy.

Problem explained

Automation commonly produces three kinds of artifacts that pose privacy and secret-exposure risks:

- Screenshots (full-page or element-level) that can capture visible PII or credentials rendered on-screen (e.g., a pre-filled login form, an e-mail address, SSNs shown in a table).
- Persistent browser state: cookies, localStorage, sessionStorage, or exported HARs that can contain session tokens, refresh tokens, or personally identifying metadata.
- DOM dumps or HTML/text logs that include sensitive input values or hidden fields.

The current skill has no rules for where these artifacts should be written, how long they should persist, whether they may be logged, or how to sanitize/redact them. This leaves implementers free to store artifacts in project worktrees, CI artifacts, or knowledge stores — all of which can permanently leak secrets or PII.

Concrete examples

1) Screenshot leakage

An automation test takes a screenshot while testing a login flow and saves it as ./artifacts/screenshot-login.png. The image shows the user's email and a partially visible token displayed by a debugging banner. The artifact is then uploaded to CI build artifacts and remains accessible.

2) Cookie/token logging

Automation code logs the Set-Cookie header or the entire cookies object for debugging: logger.info(`Cookies: ${JSON.stringify(await page.cookies())}`). The output contains session tokens which are sent to centralized logging and retained indefinitely.

3) DOM dump containing inputs

A DOM dump used for debugging is saved without filtering: fs.writeFileSync('dump.html', await page.content()). The dump contains <input value="user@example.com"> and hidden fields with API keys.

Actionable recommendation

Add a dedicated "Privacy & Data Handling" subsection to the skill that enforces the following controls. Make the guidance prescriptive and include short code/examples the implementer can copy.

Required controls (minimum):

1) Use ephemeral storage for artifacts and delete immediately

- Write screenshots and other temporary artifacts only to the system temp directory (e.g., /tmp or os.tmpdir()).
- Delete files as soon as they are no longer needed for the current run.
- Example (pseudocode):

```js
const tmpPath = path.join(os.tmpdir(), `screenshot-${Date.now()}.png`);
await page.screenshot({ path: tmpPath });
// If the screenshot contains sensitive UI, discard instead of keeping
fs.unlinkSync(tmpPath);
```

- CI/automation runners MUST not persist /tmp artifacts to long-term storage or attach them to permanent build artifacts without an explicit privacy review.

2) Never log full cookie values or tokens

- Do not log raw Set-Cookie headers, cookies arrays containing token values, or authorization headers. Replace token-like values with a fixed placeholder.
- Example masking function:

```js
function maskSecrets(s) {
  return s.replace(/(session|token|access|refresh)=[^;\s]+/gi, '$1=[REDACTED]');
}
logger.info(maskSecrets(headerString));
```

- Centralized logging sinks must be configured to drop or redact token-looking strings. Add automated log-scrubbing tests where feasible.

3) Sanitize DOM dumps and screenshots that capture sensitive forms

- Before saving DOM or HTML dumps, remove or redact values of sensitive input elements (passwords, emails, SSNs, API keys, hidden inputs that look like secrets).
- Example DOM sanitation (run inside page context):

```js
await page.evaluate(() => {
  document.querySelectorAll('input[type=password], input[type=email], input[name*=token], input[name*=key]').forEach(el => el.value = '[REDACTED]');
});
const safeHtml = await page.content();
fs.writeFileSync(tmpDomPath, safeHtml);
```

- For screenshots, implement an explicit detection-and-redact step: if a screenshot contains a visible form, either redact the region (blur) before saving or discard the artifact.

4) Clear browser state and avoid persistent contexts

- After each run, explicitly clear cookies, localStorage, and sessionStorage, and close browser contexts to avoid tokens persisting across runs:

```js
await context.clearCookies();
await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
await context.close();
```

- Avoid creating automation flows that reuse a long-lived browser profile unless there's a documented, approved reason.

5) Enforce the Three Gates and prevent knowledge ingestion of sensitive artifacts

- Reference and enforce the Three Gates rule from knowledge-system.md: no PII or secrets may be persisted into the knowledge system.
- Automation MUST include an artifact-inspection step that prevents uploading or ingesting artifacts that contain PII or tokens. If the artifact fails the inspection, it must be deleted and a non-sensitive error recorded.

6) Add auditing, tests, and CI checks

- Add unit/integration tests that verify no cookies/tokens are logged and that temporary artifacts are deleted.
- Add a CI check (script) that searches artifact directories and the repository for common patterns (session=, token=, api_key=) and fails the build if matches are found in committed artifacts.
- Run a periodic secret-scan on produced artifacts before any storage or knowledge ingestion.

Suggested wording to add to the skill (copyable)

"Privacy & Data Handling"

- All ephemeral artifacts (screenshots, DOM dumps, HARs) MUST be written only to an ephemeral directory (os.tmpdir() or /tmp) and deleted as soon as possible. Do not persist these artifacts to the repository or CI artifacts without a documented privacy review.
- Do not log full cookie values, authorization headers, or tokens. Mask or redact token-like values before logging.
- Sanitize DOM dumps and redact values of sensitive inputs (passwords, emails, API keys) prior to saving. If a screenshot contains a sensitive form, blur or discard it rather than storing it.
- Always clear cookies/localStorage/sessionStorage and close browser contexts at the end of each run.
- The automation layer must implement a pre-ingest validator that prevents PII/secrets from being added to the knowledge system (enforcing the project's Three Gates)." 

Implementation notes and low-level suggestions

- Provide example helper utilities in the skill repo (e.g., utils/screenshot-safe.js, utils/mask-logs.js, utils/sanitize-dom.js) so implementers reuse a vetted approach rather than inventing ad-hoc rules.
- Include a short append-only checklist that automation must follow; make it part of the PR template for changes to automation code.
- Where redaction is infeasible, require manual review and an explicit approval step before any artifact is stored.

Why this must be fixed now

Sensitive artifacts are a common and high-impact leak vector. Automated tests and instrumentation run frequently and can quickly propagate secrets into backups, CI logs, or knowledge stores. The absence of explicit guidance creates a large accidental-privacy risk for users and for the organisation — this justifies marking the finding as critical.

References

- knowledge-system.md — the Three Gates policy (must be enforced at automation layer)



---

# CAPTCHA and anti-bot is a showstopper with no guidance

## Problem

The skill references "anti-bot traps" as items worth capturing in domain files but provides no operational guidance for what the agent should do when it encounters them at runtime. In practice many real-world sites present CAPTCHAs or bot-detection walls (Cloudflare JS challenges, hCaptcha, reCAPTCHA, visual CAPTCHAs, behavioral checks) that prevent automated agents from progressing. Without a clear escalation path the agent may:

- spin on retries or exponential backoff trying to bypass transient checks,
- attempt unsafe programmatic bypasses, or
- return vague errors that are useless to a human operator.

This is a showstopper: when a CAPTCHA or anti-bot wall is encountered the agent must stop and give a structured, actionable handoff to a human rather than attempting to evade it.

## Concrete example

An agent scraping product pages for price updates requests https://example.com/product/123. The site returns a Cloudflare JS challenge that first requires executing inline JavaScript and then an hCaptcha. The current skill has no instruction for this case, so the agent keeps retrying requests, generating noisy traffic, and eventually triggers rate-limits or IP-blocking. The human reviewing logs receives only "fetch failed" with no context (no URL snapshot, no challenge type), so resolving the issue requires time-consuming manual investigation.

## Why this is important

- CAPTCHAs and anti-bot walls are common and often intentional barriers to automation.
- Programmatic bypass attempts can violate site terms, increase legal/risk exposure, and cause collateral blocking of downstream automation.
- Clear, structured errors enable fast human resolution and reduce repeated failed attempts that increase operational cost.

## Recommendation (actionable)

Add an "Anti-bot & CAPTCHA" subsection to the skill document with the following mandatory behavior and implementation guidance:

1. Detection and immediate halt
   - When a CAPTCHA or bot-detection wall is detected (visual CAPTCHA, Cloudflare challenge, hCaptcha, reCAPTCHA, JS challenge, behavioral challenge), the agent MUST surface a structured error and cease further automated attempts for that target.
   - Do NOT attempt to bypass CAPTCHAs programmatically or by using third-party CAPTCHA solving services unless explicitly authorized in writing by the project owner and legal counsel.

2. Structured error payload
   - Return a structured error object that includes key fields for human triage (see suggested schema below). This should be logged and surfaced to the operator UI.

3. Logging & artifacts
   - Always log: target URL, timestamp, detected challenge type, response HTTP status code, response headers, HTML snapshot, and a screenshot when running in a browser context.
   - Include raw server response body (or path to saved copy) for forensic analysis.

4. Recommended retry policy (limited and explicit)
   - For transient Cloudflare JS challenges that may clear after a short delay, allow a single optional retry after a configurable delay (e.g., 5–30 seconds). Retry must be configurable, and the retry attempt must still honor the detection/halt rule if the challenge is still present.
   - Do not implement repeated or indefinite retries; default to one retry then halt.

5. Escalation
   - Provide clear instructions for human resolution: open saved snapshot, follow the provided URL, resolve the CAPTCHA manually in a browser, then mark the domain/file as "resolved" in domain metadata so future runs skip automated retries.
   - Optionally provide a link or instructions to re-run the agent against the same URL after human resolution.

6. Safety and policy
   - Explicitly forbid programmatic CAPTCHA solving or attempts to circumvent bot defenses unless a documented, approved exception exists.

## Suggested structured error schema (JSON example)

```json
{
  "error_type": "anti_bot_challenge",
  "challenge_type": "hcaptcha|recaptcha|cloudflare_js|visual_captcha|behavioral",
  "url": "https://example.com/product/123",
  "http_status": 403,
  "detection_timestamp": "2026-04-22T12:34:56Z",
  "artifacts": {
    "html_snapshot_path": "/var/log/agent/snapshots/example.com_product_123.html",
    "screenshot_path": "/var/log/agent/screenshots/example.com_product_123.png",
    "response_headers": {"server": "cloudflare", "cf-chl-bypass": "..."}
  },
  "notes": "Agent halted — manual resolution required. Do not attempt automatic bypass.",
  "resolution_suggestion": "Open URL in browser, complete CAPTCHA, update domain status to 'human_resolved'"
}
```

Include a small schema definition in the docs so operator tooling can parse and present the payload.

## Detection heuristics (practical guidance)

- Look for HTTP status codes 403, 429 combined with page content that contains keywords or elements such as: "h-captcha", "hcaptcha", "g-recaptcha", "recaptcha", "cf-chl-bypass", "Checking your browser before accessing", or prominent challenge forms.
- If running with a headless browser, inspect the DOM for elements with classes/ids commonly used by challenges (e.g., iframe[src*="hcaptcha"], div#g-recaptcha). Capture a screenshot and DOM snapshot immediately when detected.
- Treat uncommon JavaScript-only challenges (Cloudflare JS) as anti-bot walls unless the agent is explicitly running an approved browser automation flow that can legitimately handle them.

## Implementation notes for engineers

- Add a deterministic detector function that returns a (bool, challenge_type) tuple. Use that detector before any retry/backoff logic.
- On detection, call a centralized 'halt_and_report' routine that creates the structured error, stores artifacts, and emits the log/event to the operator channel.
- Document configuration knobs: max_retries_on_js_challenge (default 1), retry_delay_seconds (default 10), allow_captcha_solvers (default false).

## Do not:

- Do not silently drop the request or return a generic network error. Provide the structured anti-bot error with artifacts.
- Do not attempt to bypass by switching user agents, rotating proxies repeatedly, or invoking third-party CAPTCHA solving without explicit authorization.


---

Severity: major


---

# Finding: wait_for_load uses document.readyState == "complete" despite telling readers that's insufficient

## Problem
The skill text correctly warns that "document.readyState == complete is often not enough — spinners dismiss before async data fetches finish." However the example helper it ships (wait_for_load()) performs exactly that check (readyState == "complete"). This is an internal contradiction: the guidance warns about flakiness but the provided utility guarantees it. The mismatch will cause flaky automation on modern SPAs where most meaningful data loads happen after the load event.

Severity: major
Section: Wait Patterns / Common Failure Modes

## Why this breaks in practice
- Single-page apps frequently fetch data after the browser's load/DOMContentLoaded events; DOM readiness does not imply network quiescence or application stability.
- UI indicators (spinners, skeletons) are often removed before background requests finish; a readyState=="complete" check returns success while the app is still rendering real content.
- Tests or automation that rely on readyState alone will intermittently read stale or empty content, causing nondeterministic failures.

## Concrete example (failure timeline)
1. Page navigation finishes; document.readyState becomes "complete".
2. App code starts/continues async fetches to populate the view.
3. App removes a loading spinner as soon as route resolution happens (before fetch resolves).
4. wait_for_load() returns because readyState == "complete" and the caller proceeds to assert content that is not yet present -> flaky failure.

## Problematic snippet (illustrative)
```js
// Provided helper (problematic): returns when document.readyState is complete
async function wait_for_load(page, timeout = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const state = await page.evaluate(() => document.readyState);
    if (state === 'complete') return;
    await new Promise(r => setTimeout(r, 50));
  }
  throw new Error('wait_for_load: timeout waiting for readyState==complete');
}
```
This helper is precisely the anti-pattern the skill warns about.

## Recommendations (actionable)
1. Remove or change wait_for_load() in the skill. Do NOT ship a helper that only checks document.readyState as a recommended stability technique.

2. Preferred replacement: network-idle heuristic OR explicit content waits.
   - Recommend using targeted waits such as wait_for_selector, wait_for_text, or application-specific readiness signals wherever possible. Example: wait for the element that indicates the real content is present (table row, data container, main article node, etc.).
   - If a general-purpose helper is required, implement a network-idle heuristic (no in-flight XHR/fetch for a stable window like 300–500ms) and provide it as an opt-in utility with clear caveats.

3. Provide concrete, copy-paste safe code examples for the two approaches below and replace the existing simple readyState snippet in the documentation.

A. Prefer explicit selector-based wait (recommended):
```js
// Example (Playwright/Puppeteer-like):
await page.waitForSelector('#main-data-container', { timeout: 5000 });
// or wait for a specific text that indicates data arrived
await page.waitForFunction(() => document.querySelector('#main-data-container')?.innerText.trim().length > 0, { timeout: 5000 });
```

B. Network-idle heuristic (when selector is not available):
- Instrument fetch/XHR in the page to count in-flight requests, then wait for that counter to be zero for a short quiescence period (e.g., 500ms).
- Example instrumentation + wait (browser-eval + poll from test runner):
```js
// install a counter in the page context
await page.evaluate(() => {
  if (window.__inflightRequestsInstalled) return;
  window.__inflightRequestsInstalled = true;
  window.__inflight = 0;
  const origFetch = window.fetch;
  window.fetch = function(...args) {
    window.__inflight++;
    return origFetch.apply(this, args).finally(() => window.__inflight--);
  };
  const XHR = window.XMLHttpRequest;
  const origOpen = XHR.prototype.open;
  const origSend = XHR.prototype.send;
  XHR.prototype.open = function() { return origOpen.apply(this, arguments); };
  XHR.prototype.send = function() {
    window.__inflight++;
    this.addEventListener('loadend', () => { window.__inflight--; });
    return origSend.apply(this, arguments);
  };
});

// wait until there are no in-flight requests for 500ms
await page.waitForFunction(() => {
  if (window.__inflight > 0) {
    window.__lastNonZero = Date.now();
    return false;
  }
  // if it was never non-zero, allow a short baseline quiet time
  const last = window.__lastNonZero || Date.now();
  return (Date.now() - last) > 500;
}, { timeout: 10000 });
```
Notes: adapt APIs for Playwright/Puppeteer. Document the heuristic's limitations (third-party scripts, streaming responses, long-polling, service workers).

4. Documentation changes
- Replace the current function and example with:
  - A short explanation that readyState is only a minimal baseline and should never be the only wait for SPA pages.
  - Clear examples of selector-based waits, network-idle helper, and when each should be used.
  - A short troubleshooting checklist for flaky tests (inspect network timeline, identify spinner-to-content transitions, add more specific selectors or app-level readiness hooks).

5. Add tests/examples to the skill's test-suite or examples directory that demonstrate correct behavior on:
- A static page where readyState==complete is sufficient (show pass)
- A simple SPA that fetches data after load (show that readyState alone would fail and the new approaches succeed)

## Summary
Do not ship a wait_for_load helper that returns on document.readyState=="complete" while simultaneously warning that readyState is insufficient. Replace the function with explicit selector waits and/or a documented network-idle helper (with the provided instrumentation snippet), update the doc text to explicitly call out the limitation, and add example-driven tests to demonstrate the correct patterns for SPA pages.

---

# HTTP tooling inconsistency: urllib vs httpx — missing redirect handling

Severity: **major**
Section: Bulk HTTP / references/cdp-snippets.md

## Summary
The project's decision table identifies `httpx` as the preferred HTTP client, but `references/cdp-snippets.md` (the `bulk_get`/`http_get` examples) uses `urllib.request`. The examples do not handle redirects for non-GET requests in a robust way. This mismatch risks subtle bugs (lost request bodies, unexpected 301/302 responses, wrong HTTP method after redirect) and inconsistent behavior across code that reuses these snippets.

## Why this is a problem
- `urllib.request` does not expose an easy, explicit `follow_redirects` control and can mishandle redirects for non-idempotent methods (POST/PUT). Redirect handling can be implicit or convert a POST to a GET, which can change semantics and drop request payloads.
- The decision table and other parts of the codebase expect `httpx` (modern, async-capable, explicit redirect config). Having canonical examples use `urllib` creates confusion and increases the chance of developers copying buggy behavior.
- The current snippets also lack a configurable timeout and robust error handling; both are essential for bulk HTTP operations to avoid long hangs and to surface actionable errors.

## Concrete example (reproducible)
This example demonstrates the safer `httpx` approach and the kind of problems to guard against. Replace existing `urllib` examples with this pattern.

Bad (current-style) pseudocode using urllib (problematic for POST redirects):

```python
# references/cdp-snippets.md (problematic)
import urllib.request

req = urllib.request.Request("https://example.com/endpoint", data=b"payload", method="POST")
resp = urllib.request.urlopen(req, timeout=10)
# If the server returns a 302 redirect to /login, behaviour may be unexpected:
# - urllib may return the 302 response without following
# - or it may follow and change POST -> GET, dropping the body
print(resp.status, resp.read())
```

Safer replacement using httpx (explicit, follows redirects, timeout + error handling):

```python
# recommended pattern using httpx
import httpx

def http_post(url: str, data: bytes, timeout_seconds: float = 10.0) -> httpx.Response:
    try:
        with httpx.Client(follow_redirects=True, timeout=timeout_seconds) as client:
            response = client.post(url, content=data)
            response.raise_for_status()
            return response
    except httpx.HTTPStatusError as exc:
        # Server returned 4xx/5xx
        raise
    except httpx.RequestError as exc:
        # Network problem / timeout
        raise
```

Notes:
- httpx.Client(follow_redirects=True) ensures redirects are followed consistently and intentionally.
- httpx's timeout handling is explicit and granular (connect/read/write), avoid relying on default behavior.
- Use response.raise_for_status() (or explicit status checks) to prevent silent 3xx/4xx/5xx swallowing.

## Actionable recommendations
1. Standardize examples and snippets on httpx
   - Replace `urllib.request` usages in `references/cdp-snippets.md` with httpx examples.
   - Use `httpx.Client(follow_redirects=True, timeout=<n>)` (or `httpx.AsyncClient` equivalent if snippets demonstrate async code).

2. Update `http_get` and `bulk_get` implementations
   - Implement redirects explicitly: follow_redirects=True.
   - Add an explicit timeout parameter (configurable) and use it in calls.
   - Add solid error handling: catch httpx.RequestError and httpx.HTTPStatusError, log useful debugging info, and return/raise consistent error types for callers.

3. Remove `urllib.request` from examples
   - Delete or archive the old `urllib` examples to avoid accidental copying.
   - If the project must support stdlib-only environments, add a clear note and provide separate fallback snippets — but prefer httpx in main documentation.

4. Tests and verification
   - Add unit/integration tests for `http_get`/`bulk_get` that cover redirect scenarios (301/302/307) for both GET and POST.
   - Add tests for timeouts and network errors to ensure robust error paths.

5. Dependency and docs changes
   - Add `httpx` to requirements (requirements.txt / pyproject.toml) and document `pip install httpx` in the README or setup docs.
   - Update the decision table to include example snippets that match (`httpx`) so the documentation is consistent end-to-end.

## Recommended migration checklist (practical)
- [ ] Replace code examples in references/cdp-snippets.md with httpx (synchronous and async variants where applicable).
- [ ] Modify `http_get` and `bulk_get` implementations to use httpx with follow_redirects=True and timeouts.
- [ ] Add tests for redirects, POST/PUT redirect preservation, timeouts, and error handling.
- [ ] Add httpx to project dependencies and update installation docs.
- [ ] Remove remaining `urllib.request` examples or label them as deprecated compatibility snippets.

## Risk and impact
- Severity: major — incorrect redirect handling can silently break integrations, lose request bodies, or surface unexpected HTTP status codes in bulk operations.
- Fixing this reduces production surprises, aligns the codebase with the stated technology decision, and makes error behavior predictable for downstream code that relies on these snippets.


---

# Finding: Fixed asyncio.sleep(1) in main example defeats polling helpers

## Problem

The `cdp-snippets.md` `main()` example contains a hardcoded `asyncio.sleep(1)` after navigation. This contradicts and undermines the skill's own asynchronous polling helpers (`wait_for_load`, `wait_for_selector`, `wait_for_text`). Including a fixed sleep in the canonical example teaches users to rely on brittle, timing-based waits instead of the robust polling helpers the skill provides.

Section: `references/cdp-snippets.md / Wait Patterns`
Severity: major

## Concrete example

Before (current problematic example):

```python
async def main():
    await cdp.navigate("https://example.com")
    # BAD: fixed sleep — brittle and slow
    await asyncio.sleep(1)
    await cdp.do_something()
```

After (recommended replacement):

```python
async def main():
    await cdp.navigate("https://example.com")
    # Good: wait for load or a useful selector instead of sleeping
    await cdp.wait_for_load()
    # or, if the page signals readiness via a DOM marker:
    # await cdp.wait_for_selector('[data-loaded]')
    await cdp.do_something()
```

## Why this matters

- Fixed sleeps are brittle: network latency, slow pages, or CI variability can make the example unreliable. Users copying the example will introduce flaky behaviour in their agents.
- Fixed sleeps are inefficient: they either wait too long (wasting time) or too short (causing race conditions).
- The repository already provides polling helpers designed to wait for meaningful signals. The example should demonstrate best practice by using those helpers.

## Recommendation (actionable)

1. Remove `asyncio.sleep(1)` from the `main()` example in `cdp-snippets.md`.
2. Replace it with one of the polling helpers, depending on intent:
   - `await cdp.wait_for_load()` — when you want to wait for the navigation/page load to finish.
   - `await cdp.wait_for_selector('<selector>')` — when the app renders a specific DOM marker when ready (e.g. `[data-loaded]`).
   - `await cdp.wait_for_text('some text')` — when readiness is best signalled by visible text.
3. Add an inline comment in the example near the replacement: `# Never use fixed sleep — use wait_for_load, wait_for_selector, or wait_for_text`.
4. Optionally add a short note in the "Wait Patterns" section explaining why fixed sleeps are discouraged and listing the helpers with one-line guidance for when to use each.
5. Run a quick smoke test of the snippet across slow/fast networks or CI to ensure the examples behave reliably.

## One-line remediation summary

Remove the fixed `asyncio.sleep(1)` from the example and use the provided polling helpers (e.g. `wait_for_load`, `wait_for_selector`) with an inline comment warning against fixed sleeps.

---

# Finding: Contradictory guidance — coordinates described as ephemeral yet promoted as primary primitive

## Problem

The skill document contains contradictory guidance about using screen coordinates as an interaction primitive. In one place (Failure Mode #3) it says "never store coordinates — they are ephemeral viewport state." Elsewhere (Core Mental Model and Decision Table) it states that coordinate clicks are the PRIMARY interaction primitive. These two statements cannot both be true in practice: if coordinates must never be stored and are ephemeral, they cannot reliably serve as the canonical primitive for repeatable or scripted interactions that survive re-renders, scrolling, or modal changes.

## Concrete example

1. Agent captures a screenshot and records a click at (x=420, y=230) over a "Submit" button. That click works for the current screenshot session.
2. The application re-renders or the page scrolls; the element moves to (x=420, y=320). If the agent later replays the stored coordinates (or uses them as a primary primitive for subsequent steps), the click will miss or hit the wrong element.
3. A modal opens and changes layout: absolute coordinates that previously targeted the "Submit" button now target an unrelated control.

Because coordinates are relative to a particular viewport state, storing and replaying them across independent runs or after DOM changes is error-prone.

## Impact / Severity

Severity: major. This contradiction leads to confusion for implementers and authors of automation flows. Following the "coordinates are primary" guidance will encourage brittle, non-repeatable scripts; following "never store coordinates" without an alternative leaves users uncertain what to use for scripted or repeatable flows.

## Recommendation (actionable)

1. Resolve the contradiction by separating two distinct use-cases and their allowed primitives:
   - Ephemeral, single-screenshot interaction: coordinates are acceptable and often the fastest tool when operating inside one captured screenshot session (ad-hoc inspection, quick one-off clicks within the same screenshot). Coordinates must be treated as transient and not persisted beyond that session.
   - Durable, repeatable/scripted flows: do not rely on persisted absolute coordinates. Instead, locate elements via stable references (selectors or element handles) at runtime using DOM-aware evaluation (for example, Runtime.evaluate or document.elementFromPoint combined with attribute-based selectors). Store element descriptors (CSS selector, XPath, data-qa attributes, or a selector-generation record) rather than raw x/y.

2. Provide concrete API/implementation guidance in the skill document:
   - Add a recommended helper: resolveElementFromCoordinate(sessionScreenshotId, x, y) -> { selector, elementFingerprint } that (a) runs document.elementFromPoint using the live page, (b) returns a stable selector or an element fingerprint (tag, id, classes, data attributes, text snippet) that can be used for repeat clicks.
   - If the system must persist a reference to an element, persist a selector or fingerprint, not absolute coordinates. Persist coordinates only when explicitly marked as "ephemeral" and tied to a single screenshot session.
   - When coordinates are used, always validate before clicking: re-check that element at the coordinate currently matches expected tag/attributes/text; if mismatch, fail fast and surface a deterministic recovery (re-locate by selector or abort).

3. Update documentation text precisely. Replace the binary language with the following suggested rewording (or similar):

"Coordinate clicks are the fastest interaction tool within a single screenshot session and are appropriate for ad-hoc, per-screenshot operations. They are not a durable primitive. For repeated or scripted flows, prefer locating elements at runtime via stable selectors or Runtime.evaluate; use coordinates only as a transient aid or as a fallback when selectors cannot be resolved."

4. Add a short Decision Table / Flowchart guiding authors:
   - If the interaction is within the same screenshot session and not intended to be replayed later -> coordinates OK.
   - If the interaction must be repeatable, deterministic, resilient to re-renders/scrolls/modals -> compute a selector/fingerprint at runtime and use that.
   - If you only have coordinates but need durability -> call resolveElementFromCoordinate then persist the returned selector instead of the coordinates.

5. Add tests and examples to the skill repository:
   - Unit docs showing: (a) a coordinate-only click within a screenshot session, (b) how to convert a coordinate to a selector with Runtime.evaluate, (c) a failing scenario where replayed coordinates miss after scroll and the correct recovery.
   - Add a lint/check that flags persisted coordinate values in examples and warns: "persisting coordinates is discouraged; prefer selectors."

## Suggested wording changes (copy-paste ready)

- Replace the current Core Mental Model line that claims coordinates are the "PRIMARY interaction primitive" with:

  "Coordinate clicks are the fastest interaction tool within a single screenshot session. They are an ephemeral interaction primitive tied to a specific viewport state. For durable, repeatable, or scripted flows, locate elements at runtime using stable selectors (Runtime.evaluate, document.querySelector, etc.) and persist selectors or element fingerprints rather than raw x/y coordinates."

- In Failure Mode #3, clarify rather than prohibit: keep the "never store coordinates" guidance, but add the allowed exception and conversion approach: "Do not persist raw coordinates across sessions. If you need durability, convert coordinates to a runtime selector using document.elementFromPoint and persist the selector/fingerprint instead."

## Verification

- Update SKILL.md and add a short regression check: a sample flow that demonstrates converting coordinates -> selector and replaying the action after a simulated scroll/re-render should succeed.
- Add a small unit snippet that asserts stored coordinates do not appear in examples or user-facing sample flows (or that their use is clearly marked as ephemeral).

## Rationale

This change preserves the performance and simplicity benefits of coordinate-based interactions for micro, single-session tasks, while removing the misleading claim that coordinates can be the canonical primitive for all automation flows. It provides a deterministic, implementable alternative (runtime selectors) for durable automation and reduces brittle failures caused by replaying stale coordinates.


---
