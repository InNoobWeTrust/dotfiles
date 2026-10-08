import { z } from "zod@4"

const positive = z.number().int().positive().max(Number.MAX_SAFE_INTEGER)
export const budgetsSchema = z
  .object({
    cpus: z.number().positive().max(1024).default(1),
    memoryBytes: positive.default(536870912),
    pids: positive.default(128),
    tmpfsBytes: positive.default(67108864),
  })
  .strict()
export const acquireSchema = z
  .object({
    workspace: z
      .string()
      .min(1)
      .optional()
      .describe("Optional absolute workspace bind. Omit for a clean isolated scratch workspace."),
    access: z.enum(["ro", "rw"]).default("ro"),
    network: z.enum(["none", "bridge"]).default("none"),
    image: z
      .string()
      .min(1)
      .default("mcr.microsoft.com/devcontainers/base:ubuntu")
      .describe(
        "Already-local trusted Linux image. Default mcr.microsoft.com/devcontainers/base:ubuntu must be present; no automatic pulls.",
      ),
    idleSeconds: positive
      .max(86400)
      .default(900)
      .describe("Automatic inactivity expiry; exec refreshes it. Default 900 seconds."),
    budgets: budgetsSchema.default(() => budgetsSchema.parse({})),
  })
  .strict()
export const tokenSchema = z.string().regex(/^[a-f0-9]{64}$/)
export const execSchema = z
  .object({
    container: tokenSchema,
    command: z.string().min(1),
    wallTimeMs: positive.max(86400000).default(120000),
    maxOutputBytes: positive.max(67108864).default(4194304),
  })
  .strict()
export type AcquireInput = z.infer<typeof acquireSchema>
export type ExecInput = z.infer<typeof execSchema>
export interface Owner {
  session: string
}
export interface ContainerSpec extends AcquireInput {
  instance: string
}
export interface ContainerHandle {
  id: string
  imageId: string
}
export interface ContainerView {
  container: string
  containerId: string
  workspace?: string
  access: "ro" | "rw"
  network: "none" | "bridge"
  imageId: string
  budgets: AcquireInput["budgets"]
  expiresAt: string
}
export interface ExecResult {
  exitCode: number | null
  stdout: string
  stderr: string
  termination: "exited" | "timeout" | "output_limit" | "runtime_error"
  truncated: { stdout: boolean; stderr: boolean }
  containerDestroyed: boolean
  error?: string
}
export interface ContainerRuntime {
  create(spec: ContainerSpec): Promise<ContainerHandle>
  alive(id: string): Promise<boolean>
  deadline(id: string, seconds: number): Promise<void>
  exec(id: string, input: ExecInput): Promise<ExecResult>
  remove(id: string): Promise<void>
}
