// Resolve validated protocol targets through the single server-owned base resolver.

import type { BaseResolver, ScopeIdentifiers } from "../scopes/scope.ts"
import {
  configuredBase,
  resolveDirectoryTarget,
  resolveMemorySubdirectory,
  resolveScope,
} from "../scopes/scope.ts"
import type { IdentityCarrier, Target } from "./contracts.ts"

/** Identity presence per scope is already enforced by the input schema's superRefine. */
export function toIdentifiers(value: { scope?: string } & IdentityCarrier): ScopeIdentifiers {
  switch (value.scope) {
    case "harness":
      return { scope: "harness", harness: value.harness as string }
    case "repository":
      return { scope: "repository", repo_id: value.repo_id as string }
    case "task":
      return { scope: "task", repo_id: value.repo_id as string, task_id: value.task_id as string }
    case "session":
      return {
        scope: "session",
        harness: value.harness as string,
        session_id: value.session_id as string,
      }
    default:
      throw new Error(`unknown scope: ${value.scope}`)
  }
}

export function prepareTarget(
  target: Target,
  baseResolver: BaseResolver,
): {
  profile: "memory" | "custom"
  root: string
  files?: string[]
} {
  if (target.kind === "directory") {
    const resolved = resolveDirectoryTarget({ path: target.path as string, files: target.files })
    return { profile: "custom", ...resolved }
  }
  const base = configuredBase(process.env)
  const canonical = baseResolver.resolve(base)
  const scope = resolveScope(toIdentifiers(target), canonical)
  const root = resolveMemorySubdirectory(scope.path, target.subdirectory)
  return { profile: "memory", root }
}
