/** Inspects native harness readiness and captures OpenCode discovery evidence. */
import { devNull } from "node:os"
import type { HarnessSpec } from "../catalog/registry.ts"
import { evaluateOpenCodeEvidence, type OpenCodeEvidence } from "./evidence/opencode.ts"
import {
  createProbe,
  DiscoveryBusyError,
  type InspectionOptions,
  isCleanExit,
  isParseableExit,
  outputLines,
  parseDataArray,
  parseJsonFromRun,
} from "./inspection.ts"

export interface ReadinessResult {
  readiness: "configured" | "not_configured" | "unknown"
  reason: string
  models: string[]
  modelHints?: string[]
  modelHintsState?: "available" | "empty" | "unknown"
}

const AGY_CONFIGURED_REASON =
  "Antigravity CLI returned an account quota report; selected model access still depends on its plan and remaining quota."
const AGY_NOT_CONFIGURED_REASON =
  "Antigravity CLI requires authentication here; sign in interactively with `agy` and refresh the startup check."
const AGY_UNKNOWN_REASON =
  "Antigravity CLI readiness could not be determined from `agy --print /usage`; check that command manually and sign in with `agy` if needed."

const CLAUDE_CONFIGURED_REASON =
  "Claude Code reports a local signed-in session; custom model availability still depends on Claude's own account settings."
const CLAUDE_NOT_CONFIGURED_REASON =
  "Claude Code is installed but not logged in here; run `claude auth login` and rerun the startup check."
const CLAUDE_UNKNOWN_REASON =
  "Claude Code readiness could not be determined from `claude auth status`; rerun that command manually to inspect the local session."

const CODEX_CONFIGURED_REASON =
  "Codex reports a local logged-in session; custom provider compatibility still depends on Codex's own configuration."
const CODEX_NOT_CONFIGURED_REASON =
  "Codex is installed but not logged in here; run `codex login` and rerun the startup check."
const CODEX_UNKNOWN_REASON =
  "Codex readiness could not be determined from `codex login status`; rerun that command manually to inspect the local session."

const OPENCODE_CONFIGURED_REASON =
  "OpenCode has at least one enabled non-deprecated model on an active inspected connection."
const OPENCODE_NOT_CONFIGURED_REASON =
  "OpenCode has no enabled non-deprecated model on an active inspected connection; check `/api/integration`, `/api/provider`, and `/api/model`."
const OPENCODE_UNKNOWN_REASON =
  "OpenCode readiness could not be determined from its documented API inspection endpoints; inspect `/api/integration`, `/api/provider`, and `/api/model` manually."

const UNKNOWN_REASONS: Partial<Record<HarnessSpec["id"], string>> = {
  amp: "Sourcegraph Amp readiness is unknown: `amp account list` does not prove which saved account or environment override will actually run.",
  cursor:
    "Cursor CLI readiness is unknown: `agent status` exists, but no stable output contract is verified for automatic parsing yet.",
  crush:
    "Charm Crush readiness is unknown: no verified non-model CLI account or provider inspection command is documented.",
  droid:
    "Factory Droid readiness is unknown: no verified non-model CLI account or provider inspection command is documented.",
  gemini:
    "Gemini CLI readiness is unknown: no verified non-model CLI account or provider inspection command is documented.",
  hermes:
    "Hermes Agent readiness is unknown: no verified non-model CLI account or provider inspection command is documented.",
  kilo: "Kilo Code readiness is unknown: no verified non-model CLI account or provider inspection command is documented.",
  qwen: "Qwen Code readiness is unknown: the removed auth command is not a usable checker, and no verified non-model inspection contract remains.",
}

function result(
  readiness: ReadinessResult["readiness"],
  reason: string,
  models: string[] = [],
): ReadinessResult {
  return { readiness, reason, models }
}

function hasAgyQuotaPercentage(stdout: string): boolean {
  // Labels and report layout can change; only a plausible quota percentage is needed.
  for (const [percent] of stdout.matchAll(/(?<![\w.+-])\d+(?:\.\d+)?\s*%/g)) {
    if (Number.parseFloat(percent) <= 100) return true
  }
  return false
}

async function inspectAgy(
  executable: string,
  options: InspectionOptions,
): Promise<ReadinessResult> {
  const probe = createProbe(executable, {
    ...options,
    env: { ...options.env, AGY_CLI_DISABLE_AUTO_UPDATE: "true" },
  })
  // /usage is CLI-served account inspection, not a model turn. Suppress CLI log-file noise.
  const run = await probe(["--log-file", devNull, "--print", "/usage"])
  if (!run || !isParseableExit(run)) return result("unknown", AGY_UNKNOWN_REASON)

  const quotaReport = hasAgyQuotaPercentage(run.stdout)
  const authRequired = outputLines(run).some((line) =>
    /^Authentication required(?:[.!:]|$)/.test(line),
  )
  if (authRequired && !quotaReport) return result("not_configured", AGY_NOT_CONFIGURED_REASON)
  if (isCleanExit(run) && quotaReport && !authRequired)
    return result("configured", AGY_CONFIGURED_REASON)
  return result("unknown", AGY_UNKNOWN_REASON)
}

async function inspectClaude(
  executable: string,
  options: InspectionOptions,
): Promise<ReadinessResult> {
  const probe = createProbe(executable, options)
  const run = await probe(["auth", "status"])
  if (!run || !isParseableExit(run)) return result("unknown", CLAUDE_UNKNOWN_REASON)

  const parsed = parseJsonFromRun(run)
  if (!parsed || typeof parsed.loggedIn !== "boolean") {
    return result("unknown", CLAUDE_UNKNOWN_REASON)
  }
  if (parsed.loggedIn === false) return result("not_configured", CLAUDE_NOT_CONFIGURED_REASON)
  if (run.exitCode === 0) return result("configured", CLAUDE_CONFIGURED_REASON)
  return result("unknown", CLAUDE_UNKNOWN_REASON)
}

async function inspectCodex(
  executable: string,
  options: InspectionOptions,
): Promise<ReadinessResult> {
  const probe = createProbe(executable, options)
  const run = await probe(["login", "status"])
  if (!run || !isCleanExit(run)) return result("unknown", CODEX_UNKNOWN_REASON)

  let loggedIn = false
  let notLoggedIn = false
  for (const line of outputLines(run)) {
    if (/^Logged in using .+/.test(line)) loggedIn = true
    if (/^Not logged in(?:$|\b.*$)/.test(line)) notLoggedIn = true
  }

  if (loggedIn && !notLoggedIn) return result("configured", CODEX_CONFIGURED_REASON)
  if (notLoggedIn && !loggedIn) return result("not_configured", CODEX_NOT_CONFIGURED_REASON)
  return result("unknown", CODEX_UNKNOWN_REASON)
}

/** One shared admission covers all three ordered native evidence probes. */
export async function inspectOpenCodeEvidence(
  executable: string,
  options: InspectionOptions,
): Promise<OpenCodeEvidence | null> {
  const inspect = async (): Promise<OpenCodeEvidence | null> => {
    const probe = createProbe(executable, options)
    const arrays: unknown[][] = []
    for (const endpoint of ["integration", "provider", "model"]) {
      // A private model query drains large stdout; the first two reuse service discovery.
      const args = ["api", "get", `/api/${endpoint}`]
      if (endpoint === "model") args.push("--standalone")
      args.push("--log-level", "none")
      const run = await probe(args)
      const data = run ? parseDataArray(run) : null
      if (!data) return null
      arrays.push(data)
    }
    const [integrations, providers, models] = arrays
    if (!integrations || !providers || !models) return null
    return { integrations, providers, models }
  }
  return options.gate ? options.gate.run(inspect) : inspect()
}

async function inspectOpenCode(
  executable: string,
  options: InspectionOptions,
): Promise<ReadinessResult> {
  const evidence = await inspectOpenCodeEvidence(executable, options)
  if (!evidence) return result("unknown", OPENCODE_UNKNOWN_REASON)
  const evaluation = evaluateOpenCodeEvidence(evidence)
  if (evaluation.readiness === "configured") {
    return {
      ...result("configured", OPENCODE_CONFIGURED_REASON, evaluation.models),
      modelHints: evaluation.modelHints,
      modelHintsState: evaluation.modelHintsState,
    }
  }
  if (evaluation.readiness === "unknown") return result("unknown", OPENCODE_UNKNOWN_REASON)
  return result("not_configured", OPENCODE_NOT_CONFIGURED_REASON)
}

async function inspectHarness(
  spec: HarnessSpec,
  executable: string,
  options: InspectionOptions,
): Promise<ReadinessResult> {
  switch (spec.id) {
    case "agy":
      return inspectAgy(executable, options)
    case "claude":
      return inspectClaude(executable, options)
    case "codex":
      return inspectCodex(executable, options)
    case "opencode":
      return inspectOpenCode(executable, options)
    case "amp":
    case "cursor":
    case "crush":
    case "droid":
    case "gemini":
    case "hermes":
    case "kilo":
    case "qwen":
      return result("unknown", UNKNOWN_REASONS[spec.id] ?? "Readiness is unknown.")
    default:
      return result(
        "unknown",
        `${spec.label} readiness is unknown: no dedicated non-model inspection strategy is implemented for this harness.`,
      )
  }
}

export async function inspectReadiness(
  spec: HarnessSpec,
  executable: string,
  options: InspectionOptions,
): Promise<ReadinessResult> {
  try {
    const inspect = () => inspectHarness(spec, executable, options)
    // OpenCode's shared raw-evidence inspector owns its single admission.
    return await (options.gate && spec.id !== "opencode" ? options.gate.run(inspect) : inspect())
  } catch (error) {
    if (!(error instanceof DiscoveryBusyError)) throw error
    return result(
      "unknown",
      "Readiness inspection is busy; retry after current inspections finish.",
    )
  }
}
