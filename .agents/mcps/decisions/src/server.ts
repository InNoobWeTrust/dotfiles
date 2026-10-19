import { McpServer } from "@modelcontextprotocol/sdk@1/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk@1/server/stdio.js"
import { evaluate, failure } from "./api.ts"
import { discoverProviders } from "./availability.ts"
import { serializeAnonymousError } from "./response.ts"
import { evaluateSchema, parseResponseBody } from "./schema.ts"

const server = new McpServer({ name: "decisions", version: "1.1.0" }, {
  instructions: [
    "Use evaluate for a quick advisory decision when plausible options have meaningful trade-offs: an autonomous next step, a recommendation before asking the user, or a worker's safe continue-versus-return choice. Skip trivial deterministic choices; do not wait for the user to request a consultation.",
    "Startup verifies inherited credentials and model reachability with tiny inference probes. Evaluate is exposed only after a usable route is verified. If absent, use discover to inspect availability and explicitly refresh registration, then relist tools. Discovery consumes provider quota; do not repeat it before each evaluation. Availability is a snapshot, not an uptime guarantee. Failed provider calls can remove evaluate until discovery succeeds.",
    "Gather evidence first. The model sees only state and questions, not your chat, files, tools or repository. Include the goal, verified facts, unknowns, constraints, authority boundary and relevant costs; exclude secrets. Name 1–16 related questions, frame comparable neutral alternatives (choice), an ordered scale (score), or a proposition (boolean). Batch related questions, not parallel calls.",
    "Read ok and answers; if truncated, read resultPath for normalized answers. Compare estimates with evidence and explain your recommendation in your own words. Probabilities are not verified facts, authorization, calibrated risk or independent review. The responsible agent owns the decision; user-owned decisions still need user approval. Workers cannot consult their way past a hard stop, missing evidence or scope boundary.",
    "On error or unavailability, report the limitation and use ordinary evidence-based judgment only where allowed; preserve mandatory stops. No blind retries or service reconfiguration. Uses Zen Jev, then OpenRouter Clef-flash, Mercury Decide Free, and GPT-6 Luna Decisions. Advance only on HTTP 429; skip unconfigured or input-ineligible fallbacks. All fallbacks use inherited OPENROUTER_API_KEY; upstream BYOK stays in OpenRouter. Discovery probes configured routes, including paid Clef and GPT. Stateless, no tools or explanations, one in-flight call. One timeout covers all attempts, not spend or upstream cancellation.",
  ].join(" "),
})
// WHY: server-owned gate prevents parallel calls from multiplying account requests.
let evaluating = false
let evaluateHandle: ReturnType<typeof server.registerTool> | undefined
let refreshing: ReturnType<typeof discoverProviders> | undefined

function result<T extends { ok: boolean }>(payload: T) {
  return { content: [{ type: "text" as const, text: JSON.stringify(payload) }], isError: !payload.ok }
}

function removeEvaluation() {
  evaluateHandle?.remove()
  evaluateHandle = undefined
}

function registerEvaluation() {
  evaluateHandle = server.registerTool("evaluate", {
    description: "Get a quick advisory choice, score or probability for meaningful trade-offs: autonomous next steps, recommendations before asking the user, or worker continue/return triage. Gather facts first; include self-contained evidence, unknowns, goals, constraints and authority in state, then 1–16 named questions with neutral criteria. Skip trivial deterministic choices. Read ok/answers (or resultPath if truncated), check against evidence, and own the decision. Estimates are not explanations, verification, permission or a substitute for independent review; never override hard stops. One call at a time: Zen Jev → OpenRouter Clef-flash → Mercury Free → GPT-6 Luna Decisions. Advance only on HTTP 429, skip unconfigured/ineligible routes; never bypass auth/network/schema errors. All fallbacks use OPENROUTER_API_KEY; Clef and GPT are paid routes. Clef requires <=12,000 UTF-8 bytes and >=2 options per choice. One timeout covers all attempts, not spend or upstream cancellation.",
    inputSchema: evaluateSchema,
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
  }, async (args, extra) => {
    if (evaluating || refreshing) {
      const busyPayload = { ok: false as const, error: { code: "BUSY", message: "An evaluation or availability check is running; wait for it to finish." } }
      const resultPath = serializeAnonymousError(process.env, busyPayload)
      return result({ ...busyPayload, responsePath: null, resultPath, truncated: false })
    }
    evaluating = true
    try {
      return result(await evaluate(args, extra.signal, parseResponseBody))
    } catch (error) {
      const payload = failure(error)
      if (["HTTP_ERROR", "CONNECTION_FAILED", "INVALID_RESPONSE", "INVALID_PAYLOAD"].includes(payload.error.code)) {
        removeEvaluation()
      }
      return result(payload)
    } finally {
      evaluating = false
    }
  })
}

/** Same registration-handle lifecycle as LSP discovery; concurrent refreshes share one probe batch. */
function refreshAvailability(signal?: AbortSignal) {
  if (refreshing) return refreshing
  removeEvaluation()
  refreshing = discoverProviders(parseResponseBody, process.env, signal).then(availability => {
    if (availability.evaluateAvailable) registerEvaluation()
    return availability
  }).finally(() => { refreshing = undefined })
  return refreshing
}

server.registerTool("discover", {
  description: "Check inherited provider configuration and model reachability, and refresh evaluate registration. Makes up to four tiny parallel inference requests, including paid OpenRouter Clef and GPT when OPENROUTER_API_KEY is set; each bounded to 4 seconds. No retries or credential-file reads. Concurrent checks share one batch. If evaluate is absent, inspect sanitized statuses and relist tools after a successful refresh. Fallback credentials alone cannot enable evaluate: Zen must be available or return HTTP 429 with a reachable verified fallback.",
  inputSchema: {},
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
}, async (_, extra) => {
  if (evaluating) return result({ ok: false, error: { code: "BUSY", message: "An evaluation is running; discover after it finishes." } })
  return result({ ok: true, ...await refreshAvailability(extra.signal) })
})

await refreshAvailability()
await server.connect(new StdioServerTransport())
