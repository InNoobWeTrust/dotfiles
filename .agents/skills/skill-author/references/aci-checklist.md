# ACI Checklist

ACI = **Agent–Computer Interface**: the skill, command, prompt package, or tool surface another agent has to use. Design it like an API for a competent junior engineer.

Run this checklist when creating or materially changing any agent-facing interface.

## What good ACI looks like

- Clear names that imply intent, not internal history
- Inputs/outputs that are easy to validate
- Examples that show the happy path
- Failure modes that are explicit instead of silent
- Formats that make misuse harder (absolute paths, fixed sections, constrained actions)

## Checklist

- [ ] **Name clarity** — would a new agent infer when to use this from the name and description alone?
- [ ] **Trigger clarity** — are the routing signals concrete, not vague synonyms?
- [ ] **Inputs declared** — what must be provided before execution starts?
- [ ] **Outputs declared** — what artifact, report, or state change must come back?
- [ ] **Absolute references** — should paths, commands, or schemas be forced into a safer format?
- [ ] **Examples included** — is there at least one copyable example for the main path?
- [ ] **Failure contract** — what does the agent do on ambiguity, missing context, invalid inputs, or unsafe requests?
- [ ] **Poka-yoke wording** — does the prompt steer away from common misuse (wrong files, over-broad scope, silent fallback)?
- [ ] **Overlap reduced** — is this interface distinct from neighboring skills/tools, or will agents confuse them?
- [ ] **Progressive disclosure respected** — is deep detail moved to `references/` instead of bloating the router surface?

## Common ACI upgrades

| Weak interface | Better interface |
|---|---|
| "investigate this" | exact files, questions, and stop condition |
| relative or implied paths | absolute paths or clearly rooted repo-relative paths |
| "return what you find" | fixed output sections + done signal |
| silent fallback on ambiguity | explicit stop/escalation rule |
| one giant prompt blob | router + examples + deep refs |

## ACI Evidence Block

When this checklist is used, leave lightweight evidence in one of these durable locations:
- the workflow/design outline being prepared for the skill or rule, or
- the short-term handoff/checkpoint entry if the design is being paused

```markdown
## ACI Pass
- Result: PASS | PASS WITH GAPS | NOT APPLICABLE
- Main risks: [list or NONE]
- Interface upgrades applied: [list]
```

## Delivery note

If the ACI pass finds ambiguity, fix the interface contract before polishing prose. A beautiful `SKILL.md` with a vague interface is still a bad skill.
