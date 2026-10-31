/** A fixed CLI stage and retained stream metadata, without command/request/environment objects. */
import type { ContainerEngine, ProcessResult } from "./contracts.ts"

export class CliStageError extends Error {
  readonly exitCode: ProcessResult["exitCode"]
  readonly stop: ProcessResult["stop"]
  readonly stdoutPath: string | null
  readonly stderrPath: string | null
  readonly stdoutBytes: number
  readonly stderrBytes: number
  readonly truncated: ProcessResult["truncated"]

  constructor(
    readonly engine: ContainerEngine,
    readonly stage: string,
    result: ProcessResult,
    cause: unknown = result.cause,
  ) {
    super(`${engine} ${stage} failed: exit ${result.exitCode}, stop=${result.stop}.`, { cause })
    this.name = "CliStageError"
    this.exitCode = result.exitCode
    this.stop = result.stop
    this.stdoutPath = result.stdoutPath
    this.stderrPath = result.stderrPath
    this.stdoutBytes = result.stdoutBytes
    this.stderrBytes = result.stderrBytes
    this.truncated = { ...result.truncated }
  }
}
