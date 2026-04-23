# Anti-Patterns

Use this file only when you need safety or failure-mode guidance.

## Contract-First Rule

For the `code` domain, Phase 2 must produce concrete API contracts before Phase 3.

## Phantom Agent Detection

Breaker agents should reject outputs that are empty, placeholder-only, or missing
 required contract symbols.

## Deterministic Before LLM

Use deterministic tools first for schema validation, syntax checks, and linting.

## No Direct Swarm File Writes

Swarm nodes must never write to the file system directly.

## Surgical Recovery

If a task is mostly correct, use maker-fix for surgical repair instead of restarting
from Phase 1.
