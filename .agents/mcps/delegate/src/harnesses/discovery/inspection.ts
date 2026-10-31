/** Coordinates bounded inspection process calls through one shared gate. */
import { type RunResult, runProcess } from "../../execution/process/execute.ts"

/** Native process probing, bounded JSON parsing, and shared inspection admission. */
export interface InspectionOptions {
  cwd: string
  env: NodeJS.ProcessEnv
  run?: typeof runProcess
  gate?: InspectionGate
}

export interface InspectionGate {
  run<T>(action: () => Promise<T>): Promise<T>
}

export class DiscoveryBusyError extends Error {
  constructor() {
    super(
      "DISCOVERY_BUSY: Both inspection slots are occupied; retry after the current inspections finish.",
    )
  }
}

/** Hold a slot until the whole inspection and its process cleanup have settled. */
export function createInspectionGate(): InspectionGate {
  let active = 0
  return {
    async run<T>(action: () => Promise<T>): Promise<T> {
      if (active >= 2) throw new DiscoveryBusyError()
      active += 1
      try {
        return await action()
      } finally {
        active -= 1
      }
    },
  }
}

const AGGREGATE_WALL_TIME_MS = 8_000
const MAX_OUTPUT_BYTES = 4_194_304
const INSPECTION_MARKER = "DELEGATE_INSPECTION"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function parseJsonObject(text: string): Record<string, unknown> | null {
  if (text.trim().length === 0) return null
  try {
    const parsed: unknown = JSON.parse(text)
    return isRecord(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function parseJsonFromRun(run: RunResult): Record<string, unknown> | null {
  return parseJsonObject(run.stdout) ?? parseJsonObject(run.stderr)
}

export function isCleanExit(run: RunResult): boolean {
  return (
    run.stop === "exited" &&
    run.exitCode === 0 &&
    run.signal === null &&
    !run.truncated &&
    !run.error
  )
}

export function isParseableExit(run: RunResult): boolean {
  return run.stop === "exited" && run.signal === null && !run.truncated && !run.error
}

export function outputLines(run: RunResult): string[] {
  return `${run.stdout}\n${run.stderr}`.split(/\r?\n/)
}

export function createProbe(executable: string, options: InspectionOptions) {
  const run = options.run ?? runProcess
  const deadline = performance.now() + AGGREGATE_WALL_TIME_MS
  const env: Record<string, string> = {}
  for (const [key, value] of Object.entries(options.env)) {
    if (value !== undefined) env[key] = value
  }
  env[INSPECTION_MARKER] = "1"

  return async (args: string[]): Promise<RunResult | null> => {
    const remaining = Math.ceil(deadline - performance.now())
    if (remaining <= 0) return null
    return run(executable, args, {
      cwd: options.cwd,
      env,
      wallTimeMs: remaining,
      maxOutputBytes: MAX_OUTPUT_BYTES,
    })
  }
}

export function parseDataArray(run: RunResult): unknown[] | null {
  if (!isCleanExit(run)) return null
  const parsed = parseJsonFromRun(run)
  return parsed && Array.isArray(parsed.data) ? parsed.data : null
}
