import type { Plugin } from "@opencode/plugin"
import { canonicalHash, retryDecision, toolDecision, type HealthState } from "./policy"

/** Child-only policy adapter. No model requests, shell work, session removal or route changes. */
export default {
  id: "local.subagent-health",
  async setup(ctx) {
    const states = new Map<string, HealthState>()
    const timers = new Set<ReturnType<typeof setTimeout>>()
    const lifecycle = new AbortController()
    let disposed = false

    const requestOptions = () => ({ signal: AbortSignal.any([lifecycle.signal, AbortSignal.timeout(5_000)]) })

    async function ownedChild(sessionID: string) {
      const session = await ctx.session.get({ sessionID }, requestOptions())
      if (!session.parentID || session.fork || session.projectID !== ctx.location.project.id ||
        session.location.directory !== ctx.location.directory) return
      return session
    }

    function stateFor(sessionID: string): HealthState {
      let state = states.get(sessionID)
      if (!state) {
        state = { retries: 0, waitMs: 0, repeats: 0 }
        states.set(sessionID, state)
      }
      return state
    }

    // Defer control calls until the hook has returned: interrupt must not await itself.
    function stop(sessionID: string, parentID: string, state: HealthState, reason: string, interrupt: boolean) {
      if (state.stopped || disposed) return
      state.stopped = reason
      const timer = setTimeout(() => {
        timers.delete(timer)
        void (async () => {
          if (disposed) return
          const child = await ownedChild(sessionID)
          if (disposed || states.get(sessionID) !== state || !child || child.parentID !== parentID) return
          let outcome = "retry vetoed before scheduling"
          if (interrupt) {
            const result = await ctx.session.interrupt(
              { sessionID, resume: false }, requestOptions(),
            )
            outcome = `interrupt returned ${result.interrupted}`
          }
          if (disposed || states.get(sessionID) !== state) return
          await ctx.session.synthetic({
            sessionID: parentID, resume: false, delivery: "queue",
            text: `[subagent-health] Child ${sessionID}: ${reason}; ${outcome}. ` +
              "Inspect partial work and verify external-tool quiescence before replacement. " +
              "Choose an authorized alternative route; do not blindly replay side effects.",
          }, requestOptions())
        })().catch(() => console.error(`[subagent-health] control/notification failed for ${sessionID}; inspect child before recovery`))
      }, 0)
      timers.add(timer)
    }

    await ctx.session.hook("prompt", async event => {
      if (await ownedChild(event.sessionID)) states.delete(event.sessionID)
    })

    await ctx.session.hook("retry", async event => {
      const child = await ownedChild(event.sessionID)
      if (!child) return
      const state = stateFor(event.sessionID)
      if (state.stopped) {
        event.decision = { retry: false }
        return
      }
      if (!event.decision.retry) return
      const reason = retryDecision(state, event.attempt, event.decision.delay)
      if (!reason) return
      event.decision = { retry: false }
      stop(event.sessionID, child.parentID!, state, reason, false)
    })

    async function blockStopped(event: { sessionID: string }) {
      if (!await ownedChild(event.sessionID)) return
      const reason = states.get(event.sessionID)?.stopped
      if (reason) throw new Error(`[subagent-health] ${reason}; reconcile before a new prompt`)
    }
    await ctx.session.hook("context", blockStopped)
    await ctx.tool.hook("execute.before", blockStopped)

    await ctx.tool.hook("execute.after", async event => {
      const child = await ownedChild(event.sessionID)
      if (!child) return
      const state = stateFor(event.sessionID)
      if (state.stopped) return
      const pollingTools = child.metadata?.subagentHealthPollingTools
      if (event.status === "completed" && Array.isArray(pollingTools) && pollingTools.includes(event.tool)) {
        state.lastFingerprint = undefined
        state.repeats = 0
        return
      }
      let fingerprint: string
      try {
        const outcome = event.status === "completed"
          ? [event.result.content, event.result.output]
          : [event.error.message]
        fingerprint = canonicalHash([event.tool, event.input, event.status, outcome])
      } catch {
        state.lastFingerprint = undefined
        state.repeats = 0
        console.error(`[subagent-health] non-JSON fingerprint skipped for ${event.sessionID}`)
        return
      }
      const reason = toolDecision(state, fingerprint)
      if (reason) stop(event.sessionID, child.parentID!, state, reason, true)
    })

    return () => {
      disposed = true
      lifecycle.abort()
      for (const timer of timers) clearTimeout(timer)
      timers.clear()
      states.clear()
    }
  },
} satisfies Plugin.Plugin
