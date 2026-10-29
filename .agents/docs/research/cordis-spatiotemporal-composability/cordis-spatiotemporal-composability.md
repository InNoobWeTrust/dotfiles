---
audience: technically literate maintainers and agents investigating modular systems
purpose: distinguish lifecycle composition from dataflow and assess conditional design/materialization lessons
scope: source-grounded research and optional experiments, not runtime adoption or accepted production guidance
---
# Cordis, spatiotemporal composability and flow-based programming

> **Research-phase, not battle-tested.** The concepts are source-grounded; their benefit to this agent setup has not been demonstrated by an accepted use. This is optional background, not a new gate or runtime recommendation.

| Reader question | Start here |
|---|---|
| What are the findings and limits? | Main points below |
| How do the mechanisms work, and what could we test? | [Complete research guide (PDF)](./main.pdf) |
| Where is the editable report? | [Typst source](./main.typ), including chapters and [bibliography](./references.bib) |

## Main points

- **Separate the axes:** Cordis's *spatial* composition reacts to declared dependency availability; *temporal* composition cleans up tracked effects when a component leaves. Neither means geography or general-purpose scheduling. See the [paper](https://arxiv.org/abs/2608.25512), especially §§2–5.
- **Keep dataflow distinct:** Morrison's [FBP](https://jpaulm.github.io/fbp/concepts.html) uses asynchronous black-box process instances, named ports, information packets, externally defined connections and bounded buffers. A task DAG or event bus alone is not that model; his [deadlock discussion](https://www.jpaulmorrison.com/fbp/deadlock.shtml) includes I/O and external coordination, so FBP should not be read as prohibiting all side effects.
- **Do not invent teardown order:** In the inspected [Cordis implementation](https://github.com/cordiverse/cordis/blob/main/packages/core/src/fiber.ts), cleanup is reverse-sequential within one `ctx.effect` registration, but teardown of separate fiber effects starts concurrently. Paper §5.1.3 describes the same distinction.
- **Bound reversibility:** A resource acquisition can have cleanup; a sent message or shared external write is not automatically undone. Correct atomic inverses are author obligations, and compensation is not an exact inverse (paper §§5.1.1, 6.1).
- **Keep guarantees narrow:** Lifecycle confluence under fixed orchestration inputs is not deterministic LLM output or distributed consistency. Context/dependency controls are not a hostile-code sandbox; names alone do not establish interface compatibility (paper §§4.3.5, 6.3, 6.6).
- **Treat buffering as a contract:** Bounded queues create flow control, not deadlock freedom. Morrison's [deadlock chapter](https://www.jpaulmorrison.com/fbp/deadlock.shtml) explains a count-before-records failure that can block a bounded stream.
- **Check the actual version:** The inspected upstream tree reported `4.0.0-rc.12`; [DSH's vendor manifest](https://github.com/deepseek-ai/deepseek-harness/blob/master/vendor/README.md) describes `4.0.0-rc.7` plus 24 local modifications. Neither the paper nor ecosystem adoption establishes this setup's effectiveness.

## Using the research without promoting it

**For design:** the PDF's conditional checklist separates dependency/lifecycle questions from dataflow questions, identifies cleanup and state boundaries, and provides disconfirming examples. Use it only when those concerns exist; ordinary linear code does not need a plugin framework or FBP runtime.

**For materialization:** existing implementation authority remains [explicit execution-flow guidance](../../../skills/code-craft/references/execution-flow.md), including ownership, buffer bounds, backpressure, ordering and termination. This research adds optional questions and limitations, not permission to change the approved stack or build a custom scheduler.

**Evidence boundary:** these are source interpretations and desk examples, not an executed Cordis/FBP integration or a measured improvement in agent output. No accepted local use, combined-model proof, runtime comparison or security validation is claimed; a bounded pilot is described in the PDF.

**Source correction:** the [AgentAtlas article](https://agentatlas.org/blog/cordis-explained-how-deepseek-harness-plugin-framework-works/) is a useful secondary introduction, but its preprint chronology conflicts with [arXiv v1's 26 August 2026 submission date](https://arxiv.org/abs/2608.25512). Prefer primary sources for mechanisms and dates.

## Rebuild and navigation

From this directory, with the existing **Typst 0.15.1** compiler:

```sh
typst compile main.typ main.pdf
```

The book uses built-in Typst features, locally available Libertinus Serif and DejaVu Sans Mono fonts, and no downloaded packages. Rebuild and inspect after source changes; local PDF delivery does not establish live GitHub viewing or accessibility conformance.

[Back to research topics](../INDEX.md)
