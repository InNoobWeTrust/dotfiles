// Wire schemas and input/output contract types shared by protocol owners.
import { z } from "zod@4"

const ident = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/)
const scopes = z.enum(["harness", "repository", "task", "session"])

export const MAX_QUERY_CHARS = 512
export const MAX_TOKENS = 32
export const DEFAULT_LIMIT = 10

const identityKeys = ["harness", "repo_id", "task_id", "session_id"] as const
type IdentityKey = (typeof identityKeys)[number]
const requiredIdents: Record<string, IdentityKey[]> = {
  harness: ["harness"],
  repository: ["repo_id"],
  task: ["repo_id", "task_id"],
  session: ["harness", "session_id"],
}

interface RefineContext {
  addIssue(issue: { code: "custom"; message: string; path?: (string | number)[] }): void
}

export interface IdentityCarrier {
  harness?: string
  repo_id?: string
  task_id?: string
  session_id?: string
}

/** Enforce exactly the identity fields each scope requires and reject irrelevant ones. */
function checkScopeIdents(scope: string, value: IdentityCarrier, ctx: RefineContext) {
  const required = requiredIdents[scope]
  if (required === undefined) {
    ctx.addIssue({ code: "custom", message: `unknown scope: ${scope}` })
    return
  }
  for (const key of identityKeys) {
    if (required.includes(key)) {
      if (value[key] === undefined)
        ctx.addIssue({ code: "custom", message: `${scope} scope requires ${key}`, path: [key] })
    } else if (value[key] !== undefined) {
      ctx.addIssue({ code: "custom", message: `${scope} scope rejects ${key}`, path: [key] })
    }
  }
}

export const resolveRootShape = {
  scope: scopes,
  harness: ident.optional(),
  repo_id: ident.optional(),
  task_id: ident.optional(),
  session_id: ident.optional(),
  create: z.boolean().optional(),
}
export const resolveRootInput = z
  .strictObject(resolveRootShape)
  .superRefine((value, ctx) => checkScopeIdents(value.scope, value, ctx))

// One strict object per contract wire shape; raw shapes are kept for SDK typing (see registerTool casts).
const targetShape = {
  kind: z.enum(["memory", "directory"]),
  scope: scopes.optional(),
  harness: ident.optional(),
  repo_id: ident.optional(),
  task_id: ident.optional(),
  session_id: ident.optional(),
  subdirectory: z.string().optional(),
  path: z.string().optional(),
  files: z.array(z.string()).optional(),
}
const targetInput = z.strictObject(targetShape).superRefine((value, ctx) => {
  if (value.kind === "memory") {
    if (value.path !== undefined)
      ctx.addIssue({ code: "custom", message: "memory target rejects path", path: ["path"] })
    if (value.files !== undefined)
      ctx.addIssue({ code: "custom", message: "memory target rejects files", path: ["files"] })
    if (value.scope === undefined)
      ctx.addIssue({ code: "custom", message: "memory target requires scope", path: ["scope"] })
    else checkScopeIdents(value.scope, value, ctx)
  } else {
    if (value.path === undefined)
      ctx.addIssue({ code: "custom", message: "directory target requires path", path: ["path"] })
    for (const key of ["scope", ...identityKeys, "subdirectory"] as const) {
      if (value[key] !== undefined)
        ctx.addIssue({
          code: "custom",
          message: `directory target rejects ${key}`,
          path: [key],
        })
    }
  }
})

export const indexShape = { target: targetInput }
export const indexInput = z.strictObject(indexShape)
export const searchShape = {
  target: targetInput,
  query: z.string().max(MAX_QUERY_CHARS).optional(),
  limit: z.number().int().min(1).max(50).optional(),
  fields: z.array(z.string().min(1)).optional(),
  filters: z.record(z.string(), z.string()).optional(),
}
export const searchInput = z.strictObject(searchShape)
export const resolveOutput = {
  path: z.string(),
  scope: z.string(),
  schema_version: z.number().int(),
  harness: z.string().optional(),
  repo_id: z.string().optional(),
  task_id: z.string().optional(),
  session_id: z.string().optional(),
}

export type Target = z.infer<typeof targetInput>
