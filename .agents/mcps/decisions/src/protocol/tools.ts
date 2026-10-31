// MCP tool registration and the availability-gated evaluate lifecycle.
import type { McpServer } from "@modelcontextprotocol/sdk@1/server/mcp.js"
import { evaluate, failure } from "../evaluation/api.ts"
import { discoverProviders } from "../evaluation/providers/availability.ts"
import { serializeAnonymousError } from "../evaluation/capture/response.ts"
import { evaluateSchema, parseResponseBody } from "../evaluation/schema.ts"

function result<T extends { ok: boolean }>(payload: T) {
  return { content: [{ type: "text" as const, text: JSON.stringify(payload) }], isError: !payload.ok }
}

interface DiscoveryContext {
  isEvaluating: () => boolean
  refreshAvailability: (signal?: AbortSignal) => ReturnType<typeof discoverProviders>
}

function registerDiscoveryTool(
  server: McpServer,
  { isEvaluating, refreshAvailability }: DiscoveryContext,
): void {
  server.registerTool("discover", {
    description: "Check inherited provider configuration and model reachability, and refresh evaluate registration. Makes up to four tiny parallel inference requests, including paid OpenRouter Clef and GPT when OPENROUTER_API_KEY is set; each bounded to 4 seconds. No retries or credential-file reads. Concurrent checks share one batch. If evaluate is absent, inspect sanitized statuses and relist tools after a successful refresh. Fallback credentials alone cannot enable evaluate: Zen must be available or return HTTP 429 with a reachable verified fallback.",
    inputSchema: {},
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
  }, async (_, extra) => {
    if (isEvaluating()) return result({ ok: false, error: { code: "BUSY", message: "An evaluation is running; discover after it finishes." } })
    return result({ ok: true, ...await refreshAvailability(extra.signal) })
  })
}

/** Register decision tools and return the existing refresh closure for startup and discovery. */
export function registerDecisionTools(server: McpServer): {
  refreshAvailability: (signal?: AbortSignal) => ReturnType<typeof discoverProviders>
} {
  // WHY: server-owned gate prevents parallel calls from multiplying account requests.
  let evaluating = false
  let evaluateHandle: ReturnType<typeof server.registerTool> | undefined
  let refreshing: ReturnType<typeof discoverProviders> | undefined

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

  registerDiscoveryTool(server, { isEvaluating: () => evaluating, refreshAvailability })

  return { refreshAvailability }
}
