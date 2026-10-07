# Lessons from Agent-Guidance Failures

| | Scope |
|---|---|
| **Reader** | People building or maintaining AI-assisted workflows |
| **Purpose** | Recognize failure modes, understand the corrections, and choose what to test next |
| **Evidence** | Local workflow observations and guidance changes; not a controlled model comparison |
| **Boundary** | No deployment-specific model catalog, subscription advice, or promise that instructions alone prevent failures |

## 1. Write for the artifact's reader

An **artifact** is a reusable output: a document, configuration description, code comment, rule, skill, or report. The central failure is assuming its reader remembers the conversation that produced it.

That produces two different defects:

| Defect | What the reader receives | Example |
|---|---|---|
| **Context contamination** | Information irrelevant to the artifact's purpose, or presented with the wrong scope | A reusable workflow contains one deployment's model routes or account-access assumptions |
| **Missing necessary context** | Conclusions that depend on unstated definitions, rationale, or earlier discussion | A selection description explains a migration concern without explaining what the route is useful for |

These defects can coexist. Generic wording loses needed constraints; copying everything overwhelms the reader. Supply **the context this reader needs for this purpose**, with explicit references where appropriate.

### Observed boundary mistakes

| Observation | Why it was wrong | Correction |
|---|---|---|
| Deployment routes were documented under reusable skill references | A reference directory was treated as permission to broaden scope | Keep reusable methods separate from deployment records |
| Public lifecycle documentation was used to infer individual model access | It did not establish that account's entitlement | Separate public lifecycle evidence from account usability |
| Descriptions retained harness-origin prose, catalog snapshots, and investigation disclaimers | They recorded the investigation instead of helping selection | Describe capability and constraints; store observations in scoped evidence or memory |

Keep real privacy policies, native permissions, and provider-identity uncertainty. Removing residue must not erase safety facts or invent model equivalence.

### A proportionate reader check

- **Identify:** Who reads this, what must they do, and what knowledge or references can they reasonably have?
- **Select:** Include needed definitions, rationale, examples, and constraints. Exclude unrelated history; qualify account-, deployment-, date-, or experiment-dependent claims.
- **Read without the chat:** Can the reader use the artifact and its references? Which sentences assume or unnecessarily reproduce private history?
- **Keep it lightweight:** A small artifact needs a short clarification or mental check, not a mandatory specification or pasted checklist.

## 2. Related failures and corrections

Related corrections are present in the guidance; their behavioral effectiveness is unmeasured.

| Failure mode | Practical consequence | Correction and remaining limit |
|---|---|---|
| **Premature commitment** | Inquiry becomes implementation before options are understood | Explain material trade-offs and distinguish inquiry from authority; clear authorized work needs no ritual approval |
| **Role/model coupling** | Model selection silently supplies a personality or permissions assumption | Separate capability, principles, domain method, and authority; style cannot grant permissions |
| **Assumed worker inheritance** | Workers lack guidance the parent assumes they have | Supply usable discovery and bounded actions/evidence; workers select principles, with optional hints |
| **Orchestration overhead** | Small work expands into plans, worker chains, or mandatory retries | Weigh context cost, latency, and evidence value; the primary retains dialogue/integration; fallbacks are preferences |
| **Opaque code** | Clean names conceal ordering, side effects, ownership, or data flow | Prefer readable ordinary orchestration and explicit lifecycle ownership; abstraction must earn its complexity |
| **Overgeneralized tooling** | A transformation framework is expected to own unrelated scanner/service duties | Hamilton can suit Python transformation graphs; dbt can suit SQL transformations/lineage. Neither is mandatory or proves execution provenance |
| **Wrong verification target** | Structural tests pass while reader needs or claim scope are wrong | Define purpose-based acceptance independently of the draft; check structure and audience/context fit |
| **Incomplete review disguised as completion** | An interrupted review leaves unwarranted confidence | Report the gap; passing local checks do not replace an independent judgment that never returned |

Compact delegated evidence receipts preserve what was inspected or executed, uncertainty, and continuation state—not an exhaustive transcript or new ceremony.

## 3. What the checks established—and did not

The routing-profile cleanup behind these lessons passed checks for route uniqueness, configuration preservation, references, and unrelated edits. Yet those checks also enforced descriptions later rejected for inappropriate context. A large assertion count does not compensate for an acceptance target that omits the reader's needs.

| Evidence | Supports | Does not establish |
|---|---|---|
| Structural/preservation checks | The declared file and configuration invariants hold | The invariants were appropriate, or the prose is understandable |
| Vendor or provider documentation | A published claim with its stated model, date, and conditions | This account's access or this harness's measured performance |
| User-reported repeated failures | A recurring problem worth investigating | A measured frequency across models or a confirmed training cause |
| Guidance edits | The proposed correction is present in the source | Workers discover it, comply with it, or improve because of it |

The diagnosis is **an audience-and-context boundary failure**. Repetition across harnesses cannot isolate training from setup effects when models and guidance overlap.

## 4. Learn before adding more machinery

One possible experiment compares equivalent writing tasks with minimal guidance, existing guidance, and existing guidance plus the reader boundary. Repeat and assess irrelevant context and missing explanation against the same reader contract. This experiment has **not** been run; no benchmark or model call is implied.

- **Use real readers:** Ask whether someone without the conversation can explain and use the output; keyword absence alone cannot establish comprehension.
- **Preserve counterexamples:** Record where extra context helps, generic wording loses meaning, or a rule adds pointless ceremony.
- **Separate evidence from hypotheses:** Record the failure, correction rationale, and disconfirming evidence. Broader rules need justified audience and scope.

## Implementation trace and related reading

Commits `65f7e7ee` (inspectable code and context-aware delegation) and `c68ba619` (portable working principles) record the earlier guidance changes, not this human-facing lesson record. The reader boundary is a subsequent correction, not a completed effectiveness study.

- **Failure catalog:** [Naming and context failures](details/category-c.md) and [agreement bias in self-review](details/category-b.md#b5-agreement-bias-in-self-review).
- **Operational guidance:** [Context stewardship](../../skills/subagent-dispatch/references/context-stewardship.md), [portable worker contract](../../skills/subagent-dispatch/references/worker-contract.md), and [working-principle discovery](../../skills/working-principles/SKILL.md).
- **Code and analytical choices:** [Inspectable code](../../skills/code-craft/references/inspectable-code.md) and [dataflow stack selection](../../skills/architecture-design/references/dataflow-stack-selection.md).
- **Maintaining the lessons:** [Failure → rule evolution](failure-pattern-evolution.md). Keep execution checkpoints in memory and reader-facing explanations here.
