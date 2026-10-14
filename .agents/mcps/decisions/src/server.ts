import { McpServer } from "@modelcontextprotocol/sdk@1/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk@1/server/stdio.js"
import { evaluate, failure } from "./api.ts"
import { serializeAnonymousError } from "./response.ts"
import { evaluateSchema, parseResponseBody } from "./schema.ts"

const server = new McpServer({ name: "decisions", version: "1.0.0" }, {
  instructions: [
    "Use evaluate for a quick advisory decision when plausible options have meaningful trade-offs: an autonomous next step, a recommendation before asking the user, or a worker's safe continue-versus-return choice. Skip trivial deterministic choices; do not wait for the user to request a consultation.",
    "Gather evidence first. The model sees only state and questions, not your chat, files, tools or repository. Include the goal, verified facts, unknowns, constraints, authority boundary and relevant costs; exclude secrets. Name 1–16 related questions, frame comparable neutral alternatives (choice), an ordered scale (score), or a proposition (boolean). Call evaluate directly; there is no status prerequisite. Batch related questions, not parallel calls.",
    "Read ok and answers; if truncated, read resultPath for normalized answers. Compare estimates with evidence and explain your recommendation in your own words. Probabilities are not verified facts, authorization, calibrated risk or independent review. The responsible agent owns the decision; user-owned decisions still need user approval. Workers cannot consult their way past a hard stop, missing evidence or scope boundary.",
    "On error or unavailability, report the limitation and use ordinary evidence-based judgment only where allowed; preserve mandatory stops. No blind retries, service reconfiguration or model fallback. Uses fixed Jev through the inherited OpenCode account key; stateless, no tools or explanations, one in-flight call. Timeout does not cap spend or guarantee upstream cancellation.",
  ].join(" "),
})
// WHY: server-owned gate prevents parallel calls from multiplying account requests.
let evaluating = false

function result<T extends { ok: boolean }>(payload: T) {
  return { content: [{ type: "text" as const, text: JSON.stringify(payload) }], isError: !payload.ok }
}

server.registerTool("evaluate", {
  description: "Get a quick advisory choice, score or probability for meaningful trade-offs: autonomous next steps, recommendations before asking the user, or worker continue/return triage. Gather facts first; include self-contained evidence, unknowns, goals, constraints and authority in state, then 1–16 named questions with neutral criteria. Skip trivial deterministic choices. Read ok/answers (or resultPath if truncated), check against evidence, and own the decision. Estimates are not explanations, verification, permission or a substitute for independent review; never override hard stops. One call at a time; fixed Jev, inherited account key, no tools/chat access, retries or fallback. Timeout does not cap spend or guarantee upstream cancellation.",
  inputSchema: evaluateSchema,
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
}, async (args, extra) => {
  if (evaluating) {
    const busyPayload = { ok: false as const, error: { code: "BUSY", message: "One evaluation is already running; wait for it to finish." } }
    const resultPath = serializeAnonymousError(process.env, busyPayload)
    return result({ ...busyPayload, responsePath: null, resultPath, truncated: false })
  }
  evaluating = true
  try {
    return result(await evaluate(args, extra.signal, parseResponseBody))
  } catch (error) {
    return result(failure(error))
  } finally {
    evaluating = false
  }
})

await server.connect(new StdioServerTransport())
