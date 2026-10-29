---
metadata:
  maintenance-review: "Audit false positives and notification delivery after the first 1–2 real uses."
---

# Subagent health guard

Local OpenCode V2 plugin for child sessions. Root sessions, forks, other projects and other plugin locations are excluded. It never switches models, submits prompts, deletes sessions or controls external delegate CLI processes.

## Behavior

- Before scheduling a provider retry, stop at the third retry decision or when cumulative proposed waiting reaches 60 seconds. Counts accumulate across the child's current prompt, not just a single HTTP request; a fresh prompt resets them.
- After three consecutive identical tool names, canonical JSON arguments and outcomes, latch the child as stopped and request an interrupt with `resume: false`. Successful results compare content/output, not incidental metadata; errors compare their message. Changed arguments or outcomes reset the streak. Narration alone does not.
- A stopped child cannot dispatch further tools or model continuations through these hooks. Already-running parallel tools can still finish; interruption is not proof external side effects stopped.
- Append a queued synthetic note to the parent with `resume: false`. This does not start a model request or guarantee that an idle/blocked parent wakes. The execution tool's own completion/failure notification remains important.
- A fresh admitted prompt clears the latch. Reconcile partial work first; do not automatically resume unchanged failures.

For deliberate polling, set the child's session metadata `subagentHealthPollingTools` to an array of exact effective tool IDs before polling. Example update payload: `{"metadata":{"subagentHealthPollingTools":["job_status"]}}`. Preserve other metadata when updating. This exempts successful polling results only, not errors or provider retry budgets. Keep a polling interval, deadline and runner-enforced whole-job deadline. Broad exemptions such as a general shell tool weaken loop protection.

## Loading and checks

Registered by [OpenCode configuration](../../../.config/opencode/opencode.jsonc) as `{env:OPENCODE_LOCAL_PLUGINS}/subagent-health`. Like the MCP packages, implementation lives in `src/` behind a small public entrypoint. OpenCode plugins run in-process, so [index.ts](index.ts) exports the plugin instead of launching a command; no PATH addition is needed.

[Shell variables](../../../.sh.d/vars.sh) exports `OPENCODE_LOCAL_PLUGINS` by resolving the deployed `vars.sh` file through `realpath` and deriving this checkout's `.agents/plugins` directory. Prerequisites: the usual `~/.shrc` setup, `realpath`, and a deployed `vars.sh` file linked to this checkout. An explicit environment value is preserved; set it to an absolute **physical source directory**, not a Stow directory containing individually linked entry files.

OpenCode 2.0.27 checks that a plugin's resolved entry lies inside its resolved directory. Pointing directly at `~/.agents/plugins/...` can fail that check with individual Stow links, just as the old config-relative path did. The canonical source-directory export avoids that failure without changing any links or hardcoding the checkout location.

The OpenCode service must inherit this variable when it starts; changing the launching shell does not update an already-running service's environment. Alternatively, from this checkout's root, launch with `OPENCODE_LOCAL_PLUGINS="$PWD/.agents/plugins" opencode` when starting a service at a safe time. No symlink changes or service restart were performed by this change. Verify the location's plugin list (`GET /api/plugin` with `location[directory]` set) contains `subagent-health` before relying on protection. Loading alone does not verify live stop or notification behavior.

No runtime package dependencies: the plugin is a structural V2 plugin object (`Plugin.define` is an identity function); its `@opencode/plugin` import is type-only. Source contracts were checked against published **2.0.27** and cached **2.0.22** types. Node crypto supplies SHA-256; only hashes/counts are retained in memory, not tool payloads.

Run from the repository root:

```sh
bun test ./.agents/plugins/subagent-health/src/policy.test.ts
```

Offline checks use mocked host methods, not real provider requests or live-session interruption. Activation and real parent wake-up require a separate safe smoke check after OpenCode loads the configuration. No service restart is required by this module or performed by its tests. Remove its config entry to disable on the next configuration load.

## Source ownership and runtime boundaries

`src/index.ts` owns hook registration, fresh child/location checks, deferred control calls and cleanup. `src/policy.ts` owns retry counting and fingerprints. Control requests have five-second deadlines. A control/notification failure logs only a sanitized category and child ID; it does not undo the stop latch or silently authorize replacement. Non-JSON/cyclic tool payloads are reported and excluded from fingerprint matching. The guard intentionally does not infer semantic equivalence or kill quiet workers. State is local to each loaded plugin instance; reloads reset history.
