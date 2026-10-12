import { McpServer } from "@modelcontextprotocol/sdk@1/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk@1/server/stdio.js"
import { evaluate, failure } from "./api.ts"
import { serializeAnonymousError } from "./response.ts"
import { evaluateSchema, parseResponseBody } from "./schema.ts"

const server = new McpServer({ name: "opencode-decisions", version: "1.0.0" })
// WHY: server-owned gate prevents parallel calls from multiplying account requests.
let evaluating = false

function result<T extends { ok: boolean }>(payload: T) {
  return { content: [{ type: "text" as const, text: JSON.stringify(payload) }], isError: !payload.ok }
}

server.registerTool("evaluate", {
  description: "Use for a decision-model second opinion on consequential trade-offs: selecting approaches, prioritizing options, or judging a proposal against explicit criteria. Decide trivial or obvious choices directly. Supply all relevant facts, goals and constraints in state; frame neutral alternatives or an ordered score scale. Returns choice, score or boolean probability estimates, not explanations, verified facts or proof. Batch related questions (1–16); only one call runs at a time. Uses fixed Jev via OpenCode Zen's proprietary /v1/systemone API and inherited account key. Stateless, no tools/sessions, no retries or model/anonymous fallback. Timeout does not guarantee upstream cancellation or cap spend.",
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
