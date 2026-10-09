---
audience: "Maintainers and engineering leads reviewing agent guidance or product changes"
purpose: "Find usability regressions by comparing end-user outcomes before and after a change"
scope: "A trial review method and promotion criteria, not a new mandatory gate or skill"
---

# Review changes through end-user outcomes

| Property | Guidance |
|---|---|
| **Goal** | Check that a change improves what users can accomplish, not just internal correctness |
| **Inputs** | Original request, before/after artifacts, scope, permissions, and acceptance evidence |
| **Status** | Prototype [attack vector in the adversarial reviewer](../../skills/reviewer/references/sub-reviewers/adversarial.md#attack-vector-end-user-outcome-regression); real-delivery effectiveness remains unverified |
| **Boundary** | Review is not permission to implement, execute external tools, publish, or accept on the user's behalf |

An **end-user outcome review** asks whether someone can still accomplish the original goal after an update, with understandable instructions and proportionate effort. Pair it with an **agent-workflow review** when agents, skills, rules, or delegation are affected: check that the executor can discover guidance and complete the same task within its permissions.

## Use two complementary viewpoints

| Viewpoint | Questions to ask |
|---|---|
| **End user** | Can I get started and complete the main task? Are defaults, errors, recovery, privacy, and approval requests understandable? Has the update added avoidable work or changed my goal? |
| **Agent using the workflow** | Can I find the right guidance, determine who decides, delegate safely, obtain current evidence, and stop or resume correctly? Do the instructions conflict or depend on unavailable capabilities? |

Use only the relevant perspectives. These are review questions, not a requirement to create a panel for every small patch; multiple perspectives produced by one agent are not independent reviews.

### For agent definitions, check two readers separately

[OpenCode agent definitions](https://opencode.ai/v2/docs/agents) have two distinct readers: the caller choosing an agent sees its description; the Markdown body becomes the invoked agent's system prompt. Do not assume the worker receives the frontmatter or require it to read its own definition to discover its assignment or restrictions.

| Surface | Reader action to support | Usability failure to catch |
|---|---|---|
| **Description** | Choose by task fit, relevant characteristics and traceable benchmark evidence | Account history, paid/free labels or quota-pool comparisons displace useful selection signals |
| **Body** | Perform the assigned work with explicit behavioral constraints | Worker instructions exist only in the caller-facing description, or depend on invisible metadata |
| **Configuration** | Let the harness select the model and enforce permissions | Prose invents supported fields, assumes permissions from a model name, or treats task intent as permission |

Keep provider/account budgeting outside routine agent selection; do not make the caller research an imagined budget before dispatch. If a benchmark claim helps selection, identify its task, model, source and date; distinguish usage popularity from measured capability and remove unsupported superlatives rather than guessing scores.

## Run a bounded comparison

1. **Declare success first.** State the original outcome, non-goals, permissions, and observable acceptance criteria before judging the change. Choose a failure case that could disprove improvement, such as a previously valid task now stalling or silently losing a safety boundary.
2. **Choose a concrete journey.** Compare the same request against an explicit previous version and the proposed version. Include first use and a relevant failure/recovery path; do not invent future requirements or report unrelated legacy problems.
3. **Assign the viewpoints.** For independent review, use separate reviewers with one bounded perspective each, different from the author/implementers. Give each the original request with required redactions, relevant artifacts, rubric, constraints, and current evidence—not a persuasive summary or a directive to approve.
4. **Challenge findings.** Have a separate reviewer check whether each claim matches the changed text, has a realistic scenario, and is worth fixing. Drop false findings and recalibrate severity; agreement is not proof.
5. **Recheck corrections.** Re-evaluate the failed criteria and changed surface. Preserve useful protections, avoid expanding the review into a new wishlist, and distinguish ready for user acceptance from actual user acceptance.

For agent delegation, follow [Subagent Dispatch](../../skills/subagent-dispatch/SKILL.md); it owns action limits and the independent challenge requirement. Use [Reviewer](../../skills/reviewer/SKILL.md) for finding validation rather than creating a competing review workflow.

## Record evidence, not confidence theater

| Report item | Minimum useful content |
|---|---|
| **Finding** | Severity, exact changed path/snippet, before/after failure scenario, user or executor consequence, and minimal correction |
| **PASS** | The declared criterion is established by the supplied evidence |
| **FAIL** | Evidence shows a criterion is not met |
| **UNVERIFIED** | A required environment, observation, permission, or capability is missing; state the next safe check |
| **Verdict** | Improvements retained, remaining regressions, coverage, and limitations; no vote-based approval |

A source review can establish conflicting instructions, but cannot prove that a delivery or external tool actually behaves correctly. Report source-level checks separately from executed journeys; never label an unrun scenario as an observed failure or a passed runtime test.

## Examples that expose usability regressions

These are illustrative checks, not a claim that the scenarios have been executed.

| Request or situation | Improvement to preserve | Regression to look for |
|---|---|---|
| **Clear autonomous delivery** | Criteria are written before implementation | Task size alone introduces a blocking user sign-off |
| **Original request contains dummy sensitive data** | Intent is preserved for goal-alignment review | Unfiltered persistence or forwarding bypasses redaction/disclosure constraints |
| **A specific technical safety correction** | Real authority or specialist gaps stop safely | A concern label blocks an evidenced correction already inside authority |
| **Read-only external research** | Independent research returns useful sources | A proxy drops the caller's action boundary or accepts outside-scope edits afterward |

## Evaluate the prototype before further promotion

The adversarial reviewer now includes this method as a prototype vector; this guide supplies examples and evidence guidance, not another mandatory workflow. Before expanding it or creating a standalone skill, evaluate repeated, independently checked uses for benefit. For each use, retain only a concise assessment of real findings, false positives, review effort, and whether the resulting correction improved the intended outcome; task logs and reviewer transcripts belong in task memory, not this guide.

| Promotion question | Decision |
|---|---|
| **Does it add repeatable value?** | Look for actionable usability defects missed by ordinary review, not just more findings |
| **Is the added work proportionate?** | Check false positives, latency/cost where observable, and unnecessary approval stops |
| **Can it reuse existing guidance?** | Prefer a reference or lens in `reviewer`, composing with `subagent-dispatch`, before a standalone skill |
| **Is a separate skill justified?** | Only if a recurring need has distinct triggers, inputs, outputs, exclusions, and a workflow not already covered |
| **What authorizes promotion?** | A separate scoped decision using [Skill Author](../../skills/skill-author/SKILL.md) and the [skill lifecycle](skill-lifecycle.md); this note does not activate or register a skill |

Revisit after the next two applicable deliveries. Treat any proposed skill or reviewer extension as a prototype until its instructions and real use have both been evaluated.
