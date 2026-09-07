# Design Intent template

Load for Phase 1 of non-trivial implementation, whenever a compact or full Design Intent is required, and before choosing a greenfield stack or substantial platform capability.

For Expansion / Refactor and Hardening, complete the full block. For Patch and MVP Slice, it may be compact, but required slice fields come first.

```text
DESIGN INTENT
=============
In scope        :
Non-goals       :
Milestone/phase/slice reference: [when present]
Acceptance criteria:
Constraints     :
Known compromises: [canonical register references when phased; local deferrals otherwise; or none]
Unit name       :
Responsibility  : [one sentence, no "and"]
Caller interface: [in → out]
Glossary Sync   : yes/no
Interface contract: [signature / schema]
Rewrite transition: [old semantics/interfaces → delete | preserve; or N/A]
Consumer contract/stubs: [required approved / N/A]
Docstring Spec  : yes/no
Interface sign-off: yes/no/assumed-approved (AFK only)
Module README   : yes/no/updated
Technology choice: [repo-native stack / established package + why]
Dependencies    : [existing first; new packages + maintenance/license/security fit]
Vendoring        : no / explicit user opt-in + rationale
Quality tools   : [repo-native commands first]
Complexity guard:
Isolation test  : yes/no
Error budget    :
Failure contract:
Ambiguity policy:
Traceability    :
```

For a Patch, `In scope`, `Non-goals`, acceptance criteria, constraints, and known compromises may each be one line. For an MVP Slice, those fields are mandatory even when all other fields are compact. Do not invent a milestone or canonical-register reference when none exists.

## Technology and dependency policy

Preserve the repository's established stack. Prefer a suitable standard library/platform capability; otherwise use a mature, maintained, production-proven ecosystem package rather than recreating an adequately supplied capability. Vendored third-party copies and deliberate dependency-free reimplementations require explicit user opt-in or an existing repository policy, and must record ownership, update, and security rationale.

When choosing a greenfield language/framework stack or adding a substantial platform capability, first load `languages/README.md`, then the smallest matching reference. Existing repository conventions and explicit project constraints always win.

## Stop conditions

- **Isolation test = no:** redesign.
- **Required consumer contract/stubs or interface sign-off missing or unapproved:** obtain approval before implementation.
- **Edge-case semantics unspecified:** ask; AFK must fail closed and not invent a fallback.
- **Proposed vendoring/reimplementation lacks explicit opt-in or documented repository policy:** choose the platform/established dependency or clarify.

For rewrite, overhaul, or delete-and-rebuild work, load Grooming first. Record each old semantic/interface as **delete** or **preserve** before Phase 1. When a public API or consumer app is affected, define consumer-facing signatures/schema and stubs and obtain sign-off; do not infer the contract, preserve old behavior by default, or patch old code when deletion is intended.
