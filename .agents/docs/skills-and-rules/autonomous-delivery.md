---
audience: "People requesting agent-owned work and maintainers of shared agent instructions"
purpose: "Choose how much decision-making to delegate and judge a completed delivery"
scope: "Delivery ownership, communication, safety boundaries, and final acceptance; not a background-runner setup guide"
---

# Ask for a result, not a project to manage

| Question | Answer |
|---|---|
| **Default** | Autonomous delivery for authorized build/fix requests |
| **You provide** | Desired outcome, constraints, and any preferences that matter |
| **Agent owns** | Research, ordinary product/technical choices, implementation, checks, and release preparation |
| **You retain** | Safety/authority approvals and final user acceptance |
| **Prerequisite** | A harness with the tools and permissions needed for the work; unattended execution additionally needs verified isolation and cleanup |

## Choose the mode upfront

No special command or configuration is needed: describe the work in your request. The agent states the mode before starting and does not ask you to reconfirm an already clear instruction.

| Say this | Expected behavior |
|---|---|
| “Build this feature and work until it is ready for me to test.” | Autonomous by default: research and decide within scope, verify, then hand over the result |
| “Own this end to end. Don't ask about implementation choices. Put decisions and usage in the product docs.” | Make in-scope decisions independently; interrupt only for a genuine blocker or safety/authority boundary |
| “Explore the options with me first.” | Collaborative discussion; exploration alone does not authorize implementation |
| “Ask before each iteration.” | Approval-gated work at the requested checkpoints |
| “You may run unattended inside this isolated environment.” | AFK execution only after resource controls, persistent state, cancellation, and cleanup are verified |

**Autonomous does not necessarily mean unattended.** It means you do not need to manage intermediate decisions; it does not promise that the harness keeps running after you close it.

## What you should receive

- **A usable result:** artifact location, startup/usage guide, and a concrete journey you can try without remembering the conversation.
- **Proof of readiness:** relevant executed checks and user-perspective evaluation of first use, ordinary use, and failure/recovery; applicable safety and compatibility checks.
- **Useful explanation:** consequential choices, sources, trade-offs, and constraints in product docs or an existing README, with deeper detail linked only where needed.
- **Honest limitations:** required missing evidence is a blocker or partial handoff, not a success claim; internal agent logs and plans are not dumped into your usage guide.

For substantial work, independent reviewers challenge the result from distinct user perspectives. Their agreement is not enough: the actual required behavior must be evidenced, and reviewers cannot waive failing tests or unexecuted required journeys.

## What “bounded” means now

There is no default total turn count or elapsed-time deadline. The agent keeps making useful, safe progress until the release criteria pass or a real boundary prevents it.

| Still bounded | Practical consequence |
|---|---|
| **Scope and permissions** | No unrelated repairs, publishing, deployment, commit, or push without authority |
| **Individual jobs and concurrent work** | Watchdogs, sandbox controls, cancellation, and cleanup prevent runaway workloads |
| **Available resources and authorized cost** | Provider quotas, storage, context, and approved spending still apply; absent total limits never authorize new paid services or larger resource budgets |
| **Safety and existing promises** | No destructive actions, secret exposure, production mutation, or unauthorized compatibility breaks |
| **Evidence** | Repeated failures trigger diagnosis and a changed approach, not blind retries or weaker tests |

You can still set an overall iteration, time, or cost cap. Sandbox access helps contain execution; it does not grant permission or guarantee product correctness.

## Accept the product, or give feedback

“Ready for user acceptance” means the agent completed its own release checks; it does **not** mean you accepted the result. Try the supplied journey and judge whether it serves your needs.

If it does not, give concrete context: what you tried, what happened, what you expected, and any preference the agent missed. That feedback starts another scoped loop rather than requiring you to redesign the implementation yourself.

If work is genuinely blocked, the agent must surface the affected boundary, completed work, evidence, safe checkpoint, and minimum question needed. It should not make you a blocker for ordinary technical uncertainty or hide a blocker in documentation while claiming completion.

## Maintainer references and adoption limits

- **Ownership authority:** [Delivery Ownership](../../rules/delivery-ownership.md).
- **Iteration workflow:** [Bounded Iteration](../../skills/bounded-iteration/SKILL.md) and [procedure](../../skills/bounded-iteration/references/procedure.md).
- **Execution safety:** [Harness safety](harness-safety.md).

These instructions guide the agent; they do not provide a service that keeps a session running after disconnect. Real deliveries are still needed to confirm that the workflow is followed, unattended execution is safe, and the result meets the user's needs.
