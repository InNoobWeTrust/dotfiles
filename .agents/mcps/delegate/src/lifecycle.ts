/**
 * Shutdown of the stdio transport is re-entrant: `transport.close()` calls the
 * protocol's `onclose` handler synchronously, and that handler asks for the
 * shutdown again. A plain `cached ??= action()` therefore runs `action` before
 * the cache holds anything, so every shutdown re-enters the next one until the
 * stack runs out. Deferring `action` by one microtask puts the guard in place
 * first, which makes the whole shutdown run exactly once.
 */
export function onceAsync(action: () => Promise<void>): () => Promise<void> {
  let started: Promise<void> | undefined
  return () => {
    started ??= Promise.resolve()
      .then(action)
      .catch(() => {})
    return started
  }
}
