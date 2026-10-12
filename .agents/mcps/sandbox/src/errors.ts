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

/** Thrown before any container allocation when the requested image cannot be provisioned.
 * The public message is sanitized; raw engine output stays internal.
 */
export class ImageProvisioningError extends Error {
  static readonly MESSAGE =
    "Container image provisioning failed before allocation; check engine connectivity and registry access before retrying."
  constructor(cause: unknown) {
    super(ImageProvisioningError.MESSAGE, { cause })
    this.name = "ImageProvisioningError"
  }
}
