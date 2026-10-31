// Runs only inside the opaque-origin allow-scripts iframe. config is escaped JSON from the server.
(() => {
  const notice = document.getElementById("notice")
  const send = (payload) => parent.postMessage({ channel: config.channel, ...payload }, "*")
  const text = (value) => {
    const serialized = typeof value === "string" ? value : JSON.stringify(value)
    // Code-point iteration keeps UTF-8 below the wire bound, including non-ASCII feedback.
    let out = ""
    for (const char of serialized ?? "Unknown action") {
      if (new TextEncoder().encode(out + char).length > 4096) break
      out += char
    }
    return out || "Unknown action"
  }
  let failed = false
  let observed = false
  const error = (message) => {
    failed = true
    notice.textContent = "Render error: " + text(message)
    send({ kind: "render_observation", status: "error", text: text(message) })
  }
  addEventListener("error", (event) => error(event.message || "Asset or render failure"))
  addEventListener("unhandledrejection", (event) => error(String(event.reason)))
  document.addEventListener("click", (event) => {
    const anchor = event.target instanceof Element && event.target.closest("a")
    if (anchor) {
      event.preventDefault()
      event.stopImmediatePropagation()
      send({ kind: "mock_action", text: text("Blocked draft link: " + anchor.getAttribute("href")) })
    }
  }, true)
  document.addEventListener("submit", (event) => {
    event.preventDefault()
    event.stopImmediatePropagation()
    send({ kind: "mock_action", text: "Mock form submission (no data sent)" })
  }, true)
  try {
    const { React, createRoot, Renderer, library, catalogVersion } = window.__UIStudio
    if (typeof config.catalog_id !== "string" || !config.catalog_id || catalogVersion !== config.catalog_id) throw new Error("Catalog initialization failed: runtime identity mismatch")
    send({ kind: "catalog", prompt: library.prompt({ toolCalls: false, bindings: false }), bundle_version: catalogVersion })
    if (config.source === null) {
      notice.textContent = "Catalog ready. Waiting for the agent to publish a draft."
      return
    }
    class Boundary extends React.Component {
      constructor(props) { super(props); this.state = { failed: false } }
      static getDerivedStateFromError() { return { failed: true } }
      componentDidCatch(cause) { error(cause.message) }
      render() { return this.state.failed ? null : this.props.children }
    }
    createRoot(document.getElementById("root")).render(React.createElement(Boundary, null,
      React.createElement(Renderer, {
        key: config.channel, response: config.source, library,
        isStreaming: false, publishObservability: false,
        onAction: (action) => send({ kind: "mock_action", text: text(action) }),
        // Upstream RendererProps: ParseResult|null. No undocumented result fields are assumed.
        onParseResult: (result) => {
          if (result !== null && !failed && !observed) {
            observed = true
            notice.textContent = "Browser parse/mount observed — not validated correctness."
            send({ kind: "render_observation", status: "observed" })
          }
        },
        // Upstream RendererProps: OpenUIError[]. Preserve warnings as errors rather than claiming correctness.
        onError: (errors) => { if (Array.isArray(errors) && errors.length) error(errors) },
      })))
  } catch (cause) { error(cause instanceof Error ? cause.message : String(cause)) }
})()
