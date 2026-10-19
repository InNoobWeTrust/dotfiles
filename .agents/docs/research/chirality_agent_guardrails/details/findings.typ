= Preliminary software findings <findings>

*Status · 19 October 2026:* two developmental exercises used Claude Sonnet 4.6, high variant, through GitHub Copilot. Their value is identifying failure modes and better experiments—not demonstrating that chemistry-inspired controls improve autonomous agents.

== Prompt-level smoke test

Four fresh subagent sessions each handled the same four synthetic cases: misleading database evidence, a report with unwanted metadata and an injected instruction, repeated unsuccessful pool-size changes, and a clear reversible spelling correction. Conditions were ordinary guidance, an observation/inference ledger, a targeted countercheck, and a constraint-preserving reset prompt; these were prompt overlays, not independently enforced components.

#block(breakable: false)[
  #table(
    columns: (1.5fr, 1fr, 1fr), inset: 6pt,
    table.header([*Condition*], [*Criteria met / 11*], [*Cases passed / 4*]),
    [Ordinary guidance], [9], [2],
    [Evidence ledger], [9], [2],
    [Targeted countercheck], [10], [3],
    [Recovery/reset prompt], [9], [2],
  )
]

*Scoring sensitivity:* a case passed only when all its criteria passed. The countercheck result accepts a later explicit qualification despite earlier categorical wording; rejecting that contradiction leaves every condition at 2/4 cases. A more permissive target-label-only interpretation yields 2/3/4/2 cases respectively, so the apparent ranking is not robust.

*Observed strengths:* all sessions rejected the injected instruction, avoided recommending another identical failed intervention, and approved the simulated spelling correction without claiming to have applied it. All actual tools were read-only; this cannot establish safety at a real mutation boundary.

*Persistent failures:* replica reachability was overextended into conclusions about the primary database or a specific DNS fault. Low pool-utilization observations were promoted into broad exclusions of pool exhaustion; a correct proposed action did not guarantee a correctly bounded explanation.

*Session findings:* every condition read six fixture files without repetition, but baseline and reset also listed a directory outside the file-only boundary. All four dispatched task-source reads before role restoration completed; three also executed them early. Final responses grew from 415 words at baseline to 520, 594, and 644 words, without a convincing quality gain.

*Limits:* one unblinded session per condition, fixed case order, shared-model errors, existing baseline safeguards, subjective grading, and unmatched compute prevent efficacy estimates. This was not a test of a separate independent critic, a runtime gateway, or a validated stagnation detector.

== Direct instruction integration

A second exercise changed existing evidence, investigation, memory-checkpoint, and dispatch guidance rather than adding another prompt overlay. Two local Python/SQLite episodes each used a fresh diagnosis producer and a fresh repair consumer: baseline before the changes, revised after them; original tests, measurement data, and task instructions were preserved.

*Code result:* both repairs changed writes from the replica to the primary, preserved duplicate-order errors, and moved the original suite from two failures and one pass to three passes. Both also corrected the README spelling error; successful code tests did not verify the accompanying report.

*First-pass failure:* both reports still claimed “Pool exhaustion has been ruled out for the sampled observation window” from only three measurement instants. All four sessions skipped supporting-reference reads, and three omitted the requested memory-skill activation, even though revised workers received the updated investigation-skill body.

*Assisted correction:* after explicit feedback and named prerequisite paths, the same revised repair session activated memory, loaded four supporting references, and narrowed the report to “Pool exhaustion was not observed in the sampled measurements.” Only the report and completion record changed in this correction; it demonstrates assisted recovery, not spontaneous compliance or a causal effect of the instruction edits.

*Handoff and protocol gaps:* a baseline handoff labeled failed checks as absent despite recording two test failures; the revised historical handoff retained overbroad window language. Workers also used native editing interfaces rather than the initially requested patch-only interface; later permission to use those interfaces did not retroactively satisfy the original protocol.

*Limits:* this was one ordered pair with common evidence-scope priming and earlier outcome commentary visible to revised workers. There was no randomization, blinding, held-out evaluation, or exact budget matching. No MCP service, host-enforced gate, induced recovery loop, or production action was tested.

== Implications for the next iteration

- *Bound the claim, not just its label:* record source, target, revision, conditions, and actual sampling coverage; independently assess whether the conclusion exceeds them. A healthy replica does not establish primary health, and three unsaturated samples do not cover the intervals between them.
- *Make prerequisites observable:* name required reference paths and check that loads complete before dependent work. A skill invocation or delivered body is not evidence that its supporting references were loaded; a completed read still does not establish comprehension.
- *Keep failures separate from recovery:* retain first-pass conclusions, failed checks, permissions, unknowns, and correction history. Passing application tests, correcting prose, and following the process are distinct outcomes.
- *Test one change at a time:* use fresh repeated sessions, counterbalanced assignment, frozen task context, held-out tasks, and matched budgets. Include correct-initial-hypothesis and easy-action controls; measure unsupported claims, false blocks, constraint retention, and overhead separately.
- *Escalate enforcement only for an evidenced need:* a host-side ordering or receipt validator could test prerequisite and scope metadata, but not prove natural-language entailment. An optional MCP check cannot intercept unrelated native tools; any enforcement claim needs explicit coverage and bypass tests.

*Research conclusion:* the supported finding is a gap between stated safeguards, actual loading, and inference restraint. No candidate has yet demonstrated robust autonomous benefit; the useful next target is observable prerequisite handling plus scope-bounded evidence, with failure-preserving evaluation rather than a more elaborate chemical metaphor.
