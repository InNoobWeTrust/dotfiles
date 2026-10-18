// Trusted host shell. All remote/draft text uses textContent; only the iframe runs the bundled renderer.
(() => {
  const base = location.pathname
  const catalogVersion = document.body.dataset.catalogVersion
  const client_id = crypto.randomUUID()
  const byId = (id) => document.getElementById(id)
  const status = byId("status"), selector = byId("revisions")
  const preview = byId("preview"), emptyState = byId("empty-state"), reportStatus = byId("report-status")
  const historyToggle = byId("history-toggle"), historySidebar = byId("revision-sidebar"), revisionNotes = byId("revision-notes")
  const themeMode = byId("theme-mode")
  let snapshot = null, selection = "latest", currentIframe = null, frameRevision = null, channel = null
  let online = false, ended = false, lastOptions = "", lastNotes = ""
  let catalogError = ""
  const byteLength = (value) => new TextEncoder().encode(value).length
  function setHistory(open, restoreFocus = false) {
    historySidebar.hidden = !open
    historyToggle.setAttribute("aria-expanded", String(open))
    if (restoreFocus) historyToggle.focus()
  }
  historyToggle.addEventListener("click", () => setHistory(historySidebar.hidden))
  byId("history-close").addEventListener("click", () => setHistory(false, true))
  addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !historySidebar.hidden) {
      event.preventDefault()
      setHistory(false, true)
    }
  })
  themeMode.addEventListener("change", () => {
    if (["system", "light", "dark"].includes(themeMode.value)) document.documentElement.dataset.theme = themeMode.value
  })
  async function request(route, payload) {
    const response = await fetch(base + "/" + route, {
      method: payload === undefined ? "GET" : "POST", cache: "no-store", signal: AbortSignal.timeout(5000),
      ...(payload === undefined ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }),
    })
    const data = await response.json()
    if (!response.ok) {
      if (response.status === 404 || response.status === 410) ended = true
      throw new Error(data.error || "Request failed: " + response.status)
    }
    return data
  }
  function visibleRevision() {
    if (!snapshot) return null
    const id = selection === "latest" ? snapshot.current_revision : Number(selection)
    return snapshot.revisions.find((revision) => revision.revision === id) ?? null
  }
  function controls() {
    selector.disabled = !online || ended || !snapshot?.revisions.length
    for (const button of revisionNotes.querySelectorAll("button")) button.disabled = !online || ended
  }
  function mount(revision) {
    const id = revision?.revision ?? 0
    if (currentIframe && frameRevision === id) return
    channel = Array.from(crypto.getRandomValues(new Uint8Array(16)), (value) => value.toString(16).padStart(2, "0")).join("")
    frameRevision = id
    const iframe = document.createElement("iframe")
    iframe.title = revision ? "OpenUI draft revision " + id : "OpenUI catalog initialization"
    if (!revision) {
      iframe.className = "catalog-frame"
      iframe.tabIndex = -1
      iframe.setAttribute("aria-hidden", "true")
    }
    iframe.setAttribute("sandbox", "allow-scripts")
    iframe.setAttribute("referrerpolicy", "no-referrer")
    iframe.src = base + "/frame/" + id + "/" + channel
    currentIframe = iframe
    preview.replaceChildren(iframe)
    // Bind identity to this particular frame, not a mutable latest-revision variable or message field.
    const boundChannel = channel, boundRevision = id
    const handler = async (event) => {
      if (event.source !== iframe.contentWindow || currentIframe !== iframe || event.data?.channel !== boundChannel) return
      const message = event.data
      try {
        if (message.kind === "catalog") {
          if (typeof catalogVersion !== "string" || !catalogVersion || message.bundle_version !== catalogVersion || typeof message.prompt !== "string" || !message.prompt || byteLength(message.prompt) > 128 * 1024) throw new Error("Invalid browser catalog; release and acquire a new session")
          await request("catalog", { prompt: message.prompt, bundle_version: message.bundle_version })
          catalogError = ""
          return
        }
        if (!boundRevision) return
        const payload = { client_id, revision: boundRevision, kind: message.kind }
        if (message.kind === "render_observation") {
          if (message.status !== "observed" && message.status !== "error") throw new Error("Invalid render report")
          payload.status = message.status
        } else if (message.kind !== "mock_action") return
        if (message.text !== undefined) {
          if (typeof message.text !== "string" || !message.text || byteLength(message.text) > 4096) throw new Error("Invalid frame event text")
          payload.text = message.text
        }
        if (message.kind === "mock_action" && !payload.text) throw new Error("Missing mock action text")
        await request("events", payload)
      } catch (cause) {
        reportStatus.textContent = "Browser report failed: " + cause.message
        reportStatus.hidden = false
        if (!boundRevision) {
          catalogError = "Browser catalog unavailable: " + cause.message
          if (snapshot && online && !ended) paint()
        }
      }
    }
    // One listener per active frame; removing it prevents retained detached-frame closures.
    if (mount.handler) removeEventListener("message", mount.handler)
    mount.handler = handler
    addEventListener("message", handler)
  }
  function paint() {
    const revision = visibleRevision()
    const pinnedUnavailable = selection !== "latest" && !revision
    byId("title").textContent = snapshot.title
    document.title = snapshot.title + " · UI Studio"
    byId("visible").textContent = pinnedUnavailable ? "Revision " + selection + " unavailable (trimmed)" : revision ? "Revision " + revision.revision : "Waiting for agent draft"
    byId("badge").textContent = selection !== "latest" ? "Pinned · latest " + snapshot.current_revision : "Following latest · " + (revision?.render_status ?? "waiting")
    if (online) status.textContent = snapshot.catalog_status === "catalog_ready" ? "Connected" : "Initializing browser catalog…"
    const optionsKey = JSON.stringify([snapshot.revisions.map((r) => r.revision), selection])
    if (optionsKey !== lastOptions) {
      lastOptions = optionsKey
      const options = [new Option("Follow latest (" + snapshot.current_revision + ")", "latest")]
      for (const item of [...snapshot.revisions].reverse()) options.push(new Option("Revision " + item.revision + (item.label ? " · " + item.label : ""), String(item.revision)))
      if (pinnedUnavailable) options.push(new Option("Revision " + selection + " unavailable", selection))
      selector.replaceChildren(...options)
      selector.value = selection
    }
    const notesKey = JSON.stringify([snapshot.revisions.map((item) => [item.revision, item.label, item.render_status]), selection])
    if (notesKey !== lastNotes) {
      lastNotes = notesKey
      const focusedRevision = revisionNotes.contains(document.activeElement) ? document.activeElement.dataset.revision : null
      const notes = [...snapshot.revisions].reverse().map((item) => {
        const row = document.createElement("li")
        const button = document.createElement("button")
        button.type = "button"
        button.className = "cds--btn " + (item.revision === revision?.revision ? "cds--btn--secondary" : "cds--btn--ghost")
        button.dataset.revision = String(item.revision)
        button.setAttribute("aria-current", String(item.revision === revision?.revision))
        button.textContent = "Revision " + item.revision + (item.label ? " · " + item.label : "") + " — " + item.render_status + " (advisory)"
        button.addEventListener("click", () => selectRevision(String(item.revision)))
        row.append(button)
        return row
      })
      if (!notes.length) {
        const row = document.createElement("li")
        row.textContent = "No published revisions yet."
        notes.push(row)
      }
      revisionNotes.replaceChildren(...notes)
      if (focusedRevision) revisionNotes.querySelector('[data-revision="' + focusedRevision + '"]')?.focus()
    }
    emptyState.hidden = !!revision || pinnedUnavailable || !!catalogError || !online
    emptyState.querySelector(".empty-copy").textContent = snapshot.catalog_status === "catalog_ready"
      ? "The preview catalog is ready. The agent’s next published design will appear here; keep this tab open to review it."
      : "The agent’s next published design will appear here. Keep this tab open while the preview catalog initializes."
    let previewState = "waiting"
    if (pinnedUnavailable) previewState = "unavailable"
    else if (revision) previewState = "draft"
    else if (!online) previewState = "disconnected"
    else if (catalogError) previewState = "catalog-error"
    preview.dataset.state = previewState
    if (pinnedUnavailable) {
      currentIframe = null; frameRevision = null
      if (mount.handler) removeEventListener("message", mount.handler)
      preview.textContent = "This draft is no longer retained. Open revision history to select a retained revision or Follow latest."
    } else {
      mount(revision)
      preview.querySelector(".stage-message")?.remove()
      if (!revision && (catalogError || !online)) {
        const message = document.createElement("p")
        message.className = "stage-message"
        message.dataset.error = "true"
        message.textContent = !online ? "Connection interrupted. Waiting to reconnect before a draft can be shown." : catalogError
        preview.append(message)
      }
    }
    const report = revision?.render_report
    if (report?.status === "error") {
      byId("badge").textContent += " · Render error: " + (report.text || "Browser reported an error")
      byId("badge").dataset.error = "true"
    } else byId("badge").dataset.error = "false"
    controls()
  }
  function selectRevision(value) {
    if (!online || ended || !snapshot) return
    selection = value
    if (Number(selection) === snapshot.current_revision) selection = "latest"
    paint()
  }
  selector.addEventListener("change", () => selectRevision(selector.value))
  async function poll() {
    try {
      snapshot = await request("snapshot")
      online = true
      status.dataset.error = "false"
      paint()
    } catch (cause) {
      online = false
      emptyState.hidden = true
      status.dataset.error = "true"
      status.textContent = ended ? "Session released or unavailable. Ask the agent to acquire a new board." : "Disconnected — displayed draft may be stale. Retrying: " + cause.message
      if (ended) {
        currentIframe = null
        frameRevision = null
        snapshot = null
        if (mount.handler) removeEventListener("message", mount.handler)
        preview.dataset.state = "ended"
        preview.textContent = "This session was released or is unavailable. No draft is available."
        byId("visible").textContent = "Session ended"
        byId("badge").textContent = "No draft available · request a new session"
        byId("badge").dataset.error = "false"
        revisionNotes.replaceChildren()
      } else if (!visibleRevision() && selection === "latest") {
        preview.dataset.state = "disconnected"
        preview.querySelector(".stage-message")?.remove()
        const message = document.createElement("p")
        message.className = "stage-message"
        message.dataset.error = "true"
        message.textContent = "Connection interrupted. Waiting to reconnect before a draft can be shown."
        preview.append(message)
      }
      controls()
    }
    if (!ended) setTimeout(poll, 1000)
  }
  poll()
})()
