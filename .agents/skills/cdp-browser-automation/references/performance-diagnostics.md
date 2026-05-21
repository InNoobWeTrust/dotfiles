# Performance Diagnostics via CDP

Use this reference when the task is about slow pages, Core Web Vitals,
Lighthouse, traces, frame drops, long tasks, render-blocking requests,
third-party overhead, or memory leaks.

Chrome's current guidance is clear: use **Lighthouse** for quick audits and
cross-category reports, but prefer **Performance traces** for actual diagnosis.
The Performance panel now exposes many of the same insights Lighthouse uses,
with much deeper trace data for root-cause work.

Within Kilo specifically, treat performance tracing as the primary tool surface:
`chrome-devtools_lighthouse_audit` does not replace Chrome's full Lighthouse
performance workflow here.

---

## Default Rule

- Start with **environment emulation**, not with a trace.
- Use **Lighthouse** when operating in Chrome directly, or when the task is about
  supported non-performance categories such as accessibility, best-practices, or SEO.
- Use a **performance trace** when the user wants to know *why* the page is slow.
- Use **memory tooling** when the symptom gets worse over time, pauses frequently,
  or the tab grows in RAM usage across repeated actions.

---

## Tool Selection

| User intent | Preferred tool | Why |
|-------------|----------------|-----|
| "Give me a quick perf audit" | Short navigation trace + insights | Available in Kilo and still points to causal events |
| "Why is LCP / INP / CLS bad?" | `chrome-devtools_performance_start_trace` + `chrome-devtools_performance_analyze_insight` | Trace + insights show subparts and causal events |
| "The page is slow only while I interact with it" | Runtime trace (`reload: false`) | Lighthouse navigation audit will miss interaction-only bottlenecks |
| "The page is slow during load" | Load trace (`reload: true`) | Best for cold-load diagnosis on Kilo's supported path |
| "Something is leaking memory" | `chrome-devtools_take_memory_snapshot` plus trace if needed | Lighthouse does not diagnose leaks |
| "Compare local behavior to real users" | Emulate device/CPU/network first; use field data if available | Lab results without realistic conditions mislead |
| "I need a lightweight metric check" | Raw CDP `Performance.getMetrics` or live metrics | Good for spot checks, not root cause |

---

## Recommended Workflow

1. Match the environment first.
2. Take the cheapest useful measurement.
3. Escalate to traces for root cause.
4. Correlate with network, console, and memory evidence.
5. Re-run under the same emulation after each fix.

### 1. Match the Environment First

- Apply CPU throttling, network throttling, viewport, and device mode **before**
  recording or auditing.
- Disable cache when investigating first-load performance.
- Remember CPU throttling is **relative to the current machine**, not a perfect
  simulation of a real mobile CPU.
- If field data or CrUX guidance exists, prefer those conditions over guessing.

In Kilo, the usual entry point is `chrome-devtools_emulate`.

At raw CDP level, the relevant domains are:

- `Emulation` for viewport, device metrics, color scheme, and user agent
- `Network` for request throttling and cache control
- `Performance` or live metrics for quick validation after emulation

### 2. Use Lighthouse for Coarse Direction

Use Lighthouse when you need:

- a quick performance baseline
- a report the user can compare with existing Lighthouse/PSI output
- non-performance audits in the same pass
- a current-state audit without building a custom trace workflow

In Kilo:

- Do **not** route performance-debugging tasks to
  `chrome-devtools_lighthouse_audit`.
- Use `chrome-devtools_lighthouse_audit` only for its supported non-performance
  categories (accessibility, best-practices, SEO).
- For performance work, capture a trace instead.

Important constraints:

- Lighthouse is useful for *finding likely problem areas* in Chrome itself.
- Lighthouse is **not** the preferred tool for deep debugging.
- For interaction-heavy flows, use a trace. DevTools also supports Lighthouse
  timespans, but if your tool surface does not expose them, runtime tracing is
  the better equivalent.

### 3. Use Traces for Actual Diagnosis

For root-cause work, record a trace and inspect the events behind the symptom.

In Kilo:

- Use `chrome-devtools_performance_start_trace` with `reload: true` for load
  performance.
- Use `chrome-devtools_performance_start_trace` with `reload: false` for
  interaction or steady-state issues, then reproduce the issue manually.
- Use `chrome-devtools_performance_analyze_insight` on the recorded trace when
  an insight set is available.
- For a quick baseline in Kilo, prefer a short load trace over a Lighthouse
  audit so the result stays on the supported performance path.

Trace-first diagnosis is especially important for:

- bad LCP, INP, or CLS
- long tasks and main-thread blocking
- render-blocking dependency chains
- third-party overhead
- duplicated or legacy JavaScript
- forced reflow and expensive style recalculation

### 4. Correlate With Supporting Evidence

- Use network request inspection to confirm whether latency is network-bound,
  discovery-bound, cache-related, or third-party.
- Use console messages to catch runtime errors that invalidate perf runs.
- Use screenshots or snapshots when layout shifts, late content, or visual
  instability are part of the symptom.

### 5. Use Memory Tools for "Gets Worse Over Time"

Symptoms that point to memory work instead of Lighthouse work:

- the tab becomes slower after repeated interactions
- pauses become more frequent over time
- DOM nodes, listeners, or heap usage keep rising
- performance recovers after refresh but degrades again later

Preferred tools:

- `chrome-devtools_take_memory_snapshot` for heap state
- performance trace with memory information when the leak aligns with a flow
- raw CDP `HeapProfiler` or `Tracing.requestMemoryDump` when implementing a
  custom client

---

## Lighthouse vs. Trace

| Need | Lighthouse | Trace |
|------|------------|-------|
| Fast baseline | Best | Good but heavier |
| Load-only audit | Good | Best for diagnosis |
| Interaction latency | Limited unless timespan is available | Best |
| CWV breakdowns | Good summary | Best detail |
| Third-party attribution | Good summary | Best correlation |
| JS flame chart | No | Yes |
| Event initiators and long tasks | No | Yes |
| Memory leak diagnosis | No | Partial; pair with heap tools |
| Accessibility / SEO / best-practices | Yes | No |

Rule of thumb:

- **Lighthouse tells you where to look.**
- **A trace tells you what actually happened.**

---

## Raw CDP Tracing Patterns

If you are writing or extending a direct CDP client, the core protocol surface
is the `Tracing` domain.

Use these practices by default:

- Prefer `Tracing.start` over trying to infer root cause from
  `Performance.getMetrics` alone.
- Prefer `transferMode: ReturnAsStream` for non-trivial traces.
- Prefer `streamCompression: gzip` for large captures.
- Check `Tracing.bufferUsage` when available for long recordings.
- Treat `Tracing.tracingComplete.dataLossOccurred == true` as a degraded run.
- Use sampling and advanced instrumentation only when the question needs them;
  they add overhead and can perturb the page.

Example baseline config:

```json
{
  "method": "Tracing.start",
  "params": {
    "transferMode": "ReturnAsStream",
    "streamFormat": "json",
    "streamCompression": "gzip",
    "traceConfig": {
      "recordMode": "recordAsMuchAsPossible",
      "enableSampling": true,
      "includedCategories": [
        "devtools.timeline",
        "disabled-by-default-devtools.timeline",
        "v8",
        "blink.user_timing",
        "loading"
      ]
    }
  }
}
```

For memory-heavy investigations, add `memory-infra` and use
`Tracing.requestMemoryDump` or `HeapProfiler` depending on the question.

Notes:

- The CDP spec marks JSON trace format as legacy and says it will be deprecated;
  prefer `proto` only if your downstream tooling can consume Perfetto-style data.
- Attach tracing to the correct target/session before recording. If the wrong tab
  or frame is selected, the trace is noise.

---

## What `Performance.getMetrics` Is Good For

Use `Performance.getMetrics` for:

- quick counters in automation
- smoke checks before and after a change
- confirming that emulation and navigation are active

Do **not** use it as your main debugging tool. It does not explain:

- which tasks blocked the main thread
- which request delayed LCP discovery
- which script caused long INP presentation delay
- which third-party resource consumed the time

If the question is "why", escalate to tracing.

---

## Common Pitfalls

- Do not chase Lighthouse score deltas without checking the underlying trace.
- Do not record traces under desktop-fast defaults if the real problem is mobile.
- Do not compare audits from different machines as if they were identical.
- Do not leave expensive instrumentation on unless you need paint or selector data.
- Do not use a navigation audit for a problem that appears only after interaction.
- Do not call a perf run "clean" when console errors or failed network requests
  occurred during the run.
- Do not ignore third-party cost; many regressions are dependency-chain or tag
  related rather than app-code related.

---

## References

- Chrome DevTools: Performance panel overview
  `https://developer.chrome.com/docs/devtools/performance/overview/`
- Chrome DevTools: Performance features reference
  `https://developer.chrome.com/docs/devtools/performance/reference/`
- Chrome DevTools: Lighthouse panel
  `https://developer.chrome.com/docs/devtools/lighthouse/`
- Chrome for Developers: Performance Insights catalog
  `https://developer.chrome.com/docs/performance/insights/`
- Chrome DevTools Protocol: `Tracing` domain
  `https://chromedevtools.github.io/devtools-protocol/tot/Tracing/`
- Chrome DevTools Protocol: `Performance` domain
  `https://chromedevtools.github.io/devtools-protocol/tot/Performance/`
- Chrome DevTools: Fix memory problems
  `https://developer.chrome.com/docs/devtools/memory-problems/`
