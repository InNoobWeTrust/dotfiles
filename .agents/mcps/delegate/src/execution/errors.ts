/** Failed-turn data retained for the protocol response envelope. */
import type { DelegateOutput } from "../protocol/contracts.ts"

/**
 * Carries DelegateOutput from a failed turn so the envelope can retain the
 * partial data while still setting ok=false and MCP isError=true.
 */
export class DelegatedTurnError extends Error {
  constructor(
    public readonly data: DelegateOutput,
    diagnostic?: string,
  ) {
    super(
      diagnostic === undefined ? "Delegated turn failed" : `Delegated turn failed: ${diagnostic}`,
    )
  }
}
