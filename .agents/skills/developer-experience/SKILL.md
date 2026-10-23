---
name: developer-experience
description: "Improve developer experience (DX/DevX): discoverable typed configuration and generated defaults, common-task commands, project/module dependency and dataflow views, optional diagnostics, reproducible runs/checkpoints, and consistent contribution paths. Use for workflow friction, configuration discoverability, task entry points, or codebase navigability. Not a replacement for root-cause investigation, architecture decisions, UI design, automatic refactoring, or project/platform bootstrap."
metadata:
  lifecycle: prototype
  created: "2026-10-23"
  review-after: "2027-01-23"
---

# Developer Experience

Make the next developer task easy to discover, understand, execute and verify.
Start from a concrete friction point, not a tooling wishlist. Assess coverage;
change only the authorized, useful slice.

## Contract and scale

- **Reader:** coding agents assisting developers; general software literacy, no required language, framework or harness.
- **Inputs:** project root, developer/task and friction, existing conventions/tools, allowed changes and execution effects. Resolve paths from that project; reference links here are relative to this skill.
- **Outputs:** scoped improvement or assessment, usable entry points/evidence, verification and remaining gaps. Reuse project files; no mandatory `DX-SPEC.md`, new platform, task runner or observability backend.
- Discover native capabilities first, then authorized existing integrations. Inspect their actual interface and scope; neither availability nor this skill authorizes installs, exports, remote writes or expensive runs.
- If automation is absent, use a bounded source-backed/manual view or explicitly report the gap. Do not silently omit requested coverage or claim an unperformed check.
- Small fixes use the same four phases briefly. Larger work takes multiple task-sized slices, not an all-area overhaul.

## 1 — Establish the developer task

1. Identify who is trying to do what, from which starting state, and what success looks like. Reuse known context; ask only consequential unresolved questions.
2. Inspect relevant configuration, help/task entry points, conventions and evidence. For unfamiliar behavior, use bounded path/search/read and available semantic tools; trace owners, consumers, imports/wiring and relevant normal/error paths. If those capabilities are unavailable, mark the source map partial rather than assuming behavior.
3. Record the current task path and one observable friction: an ambiguous setting, undiscoverable command, opaque dependency, failed recovery, etc. Reproduce only within allowed effects; otherwise label a source-only baseline.

**Gate:** task, scope and success check are clear before changing artifacts.

## 2 — Assess coverage and choose a slice

For a broad DX assessment, record each area as adequate / friction / unknown /
not applicable, with evidence. For a narrow request, mark unrelated areas out of
scope rather than demanding improvements to them.

| Area | What the developer should be able to discover | Load when relevant |
|---|---|---|
| Configuration | Types/validation, required values, safe template, code-authoritative defaults, precedence and effective values | [Configuration and tasks](references/configuration-and-tasks.md) |
| Invocation | Common tasks through existing CLI/task entry points; help, examples and useful failure output | Same reference |
| Dependencies | Focused project/package **and** module-internal relationships | [Structure and flow](references/structure-and-flow.md) |
| Dataflow and responsibility | Both scales: inputs, transformation/owner, outputs, effects and failure path; evidence level explicit | Same reference |
| Diagnostics | Whether a specific question warrants existing logs, optional event history or distributed tracing | [Diagnostics and reproducibility](references/diagnostics-and-reproducibility.md) |
| Reproducibility/recovery | Run identity/manifest, replay promise, checkpoint need and tested restore where applicable | Same reference |
| Consistency | Existing organization/naming/contribution owner and a predictable path for the next change | [Structure and flow](references/structure-and-flow.md) |

For dependency/dataflow work, explicitly address **both scales for each view**.
Record why a scale is collapsed into another view, not applicable, or deferred;
never substitute a package graph for module internals without explanation.

Select the smallest slice that addresses the friction. Name compatibility and
safety constraints, observable checks and deferred gaps before implementation.

## 3 — Improve through existing owners

1. Load only the selected references. Reuse current configuration loaders, commands, graph tools, diagnostic channels and conventions before adding mechanisms.
2. Configuration examples/defaults come from one authoritative code/schema path; verify runtime behavior, not schema annotations alone. Small configs are not exempt from default-parity checks.
3. Keep maps focused and reproducible from source. A static dependency is not observed dataflow; coupling alone does not prove a responsibility violation.
4. Keep tracing optional and question-led. A lockfile, seed, manifest or saved state alone does not prove replay/resume.
5. Hand off non-trivial implementation with the approved behavior, writable scope, consumer constraints and checks to an implementation capability. Consequential responsibility/dependency changes require an architecture capability with current source map, proposed edge delta and affected consumers. Discovery is not permission to reorganize working code; absent capability blocks only that change.
6. Diagnose failures only after gathering the symptom, context and source evidence; do not substitute a DX recommendation for root-cause analysis. Foundation/pack bootstrap, when actually in scope, requires its own authorized owner and concrete project state. A separate documentation capability may improve substantial human-facing explanations without adding a DX documentation ceremony.

## 4 — Verify the developer path

From the declared starting state, follow the intended path: find configuration
and the command, supply valid/invalid input, understand relevant relationships,
and inspect or reproduce the result. Check only applicable paths, including
automation/non-TTY and failure/recovery paths where promised.

Record commands/actions, revision/context, observed results and unrun checks.
Separate source inspection, walkthrough, executed behavior and measured
performance. Do not infer faster onboarding/productivity from prettier docs or
tool adoption; use task observations and developer feedback, not individual rankings.

## Stop conditions

- Scope, compatibility, authority or consequential owner decision missing → clarify before the affected change.
- Required evidence/capability absent → report the gap and limit the affected claim; continue unrelated safe work only within scope.
- Secrets exposure, unauthorized telemetry/export, untrusted restore or duplicate external effects possible → stop that operation until a safe authorized path exists.
- A discoverability fix needs architecture migration, new tooling/platform or unsolicited cleanup → return to the appropriate owner for a bounded decision.

## Deliverables

- [ ] Developer task, starting state, friction and success check stated.
- [ ] Seven-area coverage scoped; both dependency/flow scales explicitly accounted for when relevant.
- [ ] Relevant configuration/commands discoverable, with validation/default parity and error behavior checked.
- [ ] Relevant maps labeled with scope, evidence, limitations and refresh path.
- [ ] Convention owner identified; representative contribution/naming/placement path checked.
- [ ] Optional diagnostics justified; replay/checkpoint promise and gaps stated when relevant.
- [ ] Verification distinguishes observed behavior from walkthroughs and unverified claims; deferred work explicit.

## Anti-patterns

| Temptation | Why wrong | Better path |
|---|---|---|
| Install a developer portal/task runner first | Adds machinery before proving friction | Reuse existing discoverable entry points |
| Treat every area as a mandatory change | Overhauls a narrow request | Assess broadly only when asked; improve a slice |
| Hand-maintain defaults or trust JSON Schema `default` | Documentation can diverge from runtime | Validate template and compare exposed runtime defaults |
| Call imports a dataflow/SRP proof | Confuses structural and behavioral evidence | Separate view types; trace and name unknowns |
| Require tracing everywhere | Adds cost and disclosure surface | Start from a diagnostic question |
| Call a seed/lockfile/checkpoint “reproducible” | Omits inputs/state/restore/effects | Declare and test the actual promise |
| Reorganize files for consistency alone | Risks compatibility without proven value | Follow existing owner; propose exceptions separately |

## Evidence and lifecycle

[Sources and limits](references/sources.md) distinguish documented capabilities,
practitioner observations and this guide's synthesis. Prototype: assess the first
1–2 real applications for retain/revise/remove; review by the metadata date.
Source walkthroughs are not measured developer-effectiveness results.
