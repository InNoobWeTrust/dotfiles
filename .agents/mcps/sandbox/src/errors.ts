import type { ContainerHandle } from "./contracts.ts"

/** Carries an exact allocation ID or unique name for cleanup after failed creation.
 * The manager must retain it until removal is confirmed; raw causes stay internal.
 */
export class ContainerCreationError extends Error {
  constructor(
    readonly handle: ContainerHandle,
    cause: unknown,
  ) {
    super("Container creation failed; its allocation requires cleanup.", { cause })
    this.name = "ContainerCreationError"
  }
}
