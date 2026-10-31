import { McpServer } from "@modelcontextprotocol/sdk@1/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk@1/server/stdio.js"
import { registerDecisionTools } from "./protocol/tools.ts"

const server = new McpServer({ name: "decisions", version: "1.1.0" }, {
  instructions: [
    "Use evaluate for a quick advisory decision when plausible options have meaningful trade-offs: an autonomous next step, a recommendation before asking the user, or a worker's safe continue-versus-return choice. Skip trivial deterministic choices; do not wait for the user to request a consultation.",
    "Startup verifies inherited credentials and model reachability with tiny inference probes. Evaluate is exposed only after a usable route is verified. If absent, use discover to inspect availability and explicitly refresh registration, then relist tools. Discovery consumes provider quota; do not repeat it before each evaluation. Availability is a snapshot, not an uptime guarantee. Failed provider calls can remove evaluate until discovery succeeds.",
    "Gather evidence first. The model sees only state and questions, not your chat, files, tools or repository. Include the goal, verified facts, unknowns, constraints, authority boundary and relevant costs; exclude secrets. Name 1–16 related questions, frame comparable neutral alternatives (choice), an ordered scale (score), or a proposition (boolean). Batch related questions, not parallel calls.",
    "Read ok and answers; if truncated, read resultPath for normalized answers. Compare estimates with evidence and explain your recommendation in your own words. Probabilities are not verified facts, authorization, calibrated risk or independent review. The responsible agent owns the decision; user-owned decisions still need user approval. Workers cannot consult their way past a hard stop, missing evidence or scope boundary.",
    "On error or unavailability, report the limitation and use ordinary evidence-based judgment only where allowed; preserve mandatory stops. No blind retries or service reconfiguration. Uses Zen Jev, then OpenRouter Clef-flash, Mercury Decide Free, and GPT-6 Luna Decisions. Advance only on HTTP 429; skip unconfigured or input-ineligible fallbacks. All fallbacks use inherited OPENROUTER_API_KEY; upstream BYOK stays in OpenRouter. Discovery probes configured routes, including paid Clef and GPT. Stateless, no tools or explanations, one in-flight call. One timeout covers all attempts, not spend or upstream cancellation.",
  ].join(" "),
})
const { refreshAvailability } = registerDecisionTools(server)
await refreshAvailability()
await server.connect(new StdioServerTransport())
