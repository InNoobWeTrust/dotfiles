---
audience: Maintainers of the agent and sandbox MCP setup
purpose: Recognize and prevent container lifecycle failures caused by applying host workload restrictions to the wrong execution layer
scope: The observed local Podman/MCP failure; not a claim about every model or AI laboratory
---
# Failure case: host restrictions leaking into container lifecycle

Here, **context leakage** means applying a restriction outside the execution layer it governs—not leaking credentials or research data.

| Question | Answer |
| --- | --- |
| What failed? | A host-sandboxed Podman query and a separate direct MCP container acquisition |
| What should happen? | The MCP manages its engine on the host; commands execute inside its isolated container |
| What is authorized here? | Image downloads and engine state updates needed for container use |
| What remains protected? | Credentials, unrelated host files/containers, workload isolation and resource budgets |

## Observed evidence

On 2026-10-13, a Podman query inside the read-only host sandbox failed with `chmod …/libpod: read-only file system` in the user's runtime directory. Even inspection commands can update container-engine metadata; a read-only research goal does not mean every supporting operation performs zero writes.

A separate call to the MCP's `container_acquire` failed because `mcr.microsoft.com/devcontainers/base:ubuntu` was not locally available. The implementation invoked the engine directly, but required a pre-existing image and returned a generic creation error instead of explaining the missing-image prerequisite.

These are two different failures, not evidence that the MCP itself nested the host sandbox around acquisition. The agent's reasoning nevertheless carried host-command restrictions into discussion of image provisioning and lifecycle operations, creating unnecessary friction.

## The correct boundary

```text
Agent → MCP host lifecycle → container engine/image store
Agent → MCP container_exec → isolated workload inside container
Agent → host sandbox → ordinary host inspection or workspace commands
```

**Lifecycle management** includes resolving or downloading an image, creating/starting a container and removing the owned container. It legitimately writes engine metadata and image storage on the host; wrapping it in a read-only host filesystem sandbox can prevent the isolation mechanism from working.

**Workload execution** belongs inside the container. Removing an additional host sandbox from lifecycle management does not authorize privileged containers, host sockets, writable workspace mounts, workload network access or unlimited resources.

**Scope language** matters: image downloads are authorized supporting side effects in this task, not literally filesystem-read-only operations. Engine registry access is distinct from network access granted to the workload.

## Repair and verification

The requested repair must automatically download a missing requested image during acquisition, keep lifecycle operations outside host-command wrappers, preserve existing container isolation, and demonstrate actual acquire → execute → release behavior. A successful host sandbox smoke test or tool registration alone does not verify containers; manually preloading an image does not fix fresh-machine acquisition.

The repaired MCP inspects the requested image and automatically downloads it only when the engine positively reports it missing. Inspection or download failures abort before container allocation with a sanitized provisioning error; creation remains local-only after provisioning.

| Final check on 2026-10-13 | Observed result |
| --- | --- |
| Full MCP unit suite | 59 passed, zero failed |
| Existing quality check | Biome passed; not a type-checking claim |
| Fresh MCP process, previously absent Alpine image | Acquisition downloaded the image without manual preloading |
| Container execution on local Podman | Non-root, zero effective/bounding capabilities, no workload network or host mounts; RAM/swap/PID budgets verified |
| Release | Owned container removed; repeated release safely reported no remaining lease |

The final-source live check used Alpine 3.22; a preceding run also automatically acquired absent Alpine 3.23. This verifies the missing-image path on the tested host, not every engine or a completely new machine. No shared-service restart, research-model or dataset download, unrelated-container cleanup or Git publication was performed.

The authorized default-image download subsequently succeeded, but acquisition exposed a second implementation defect: Podman rejected `nr_inodes=16384` as an invalid mount option. Image availability and engine-option compatibility therefore require separate checks; downloading an image alone did not complete the repair.

A direct owned-container probe succeeded after removing that option, then exposed another compatibility issue: Podman expands `CapDrop` into named capabilities rather than returning Docker's `ALL` marker. Its effective/bounding capability fields were empty (`null`); a no-drop control reported eleven capabilities, showing why checking the actual engine-specific capability representation matters.

## Retrospective correction

Separate retrospective reviewers found that the shared shell-sandbox rule did not explicitly distinguish MCP-managed lifecycle operations from agent-issued host commands. The setup now clarifies that boundary in the installed shared `~/.agents/rules/execution-safety.md` and `~/.agents/AGENTS.md` summary, rather than adding another rule or disabling isolation.

A fresh worker selected the intended route for five post-edit scenarios: allowed image provisioning, metadata-denial recovery, ordinary sandboxed host commands, a whole-task network prohibition, and explicitly approved engine diagnostics. This is wording-adoption evidence, not a runtime test or controlled demonstration of the original cause.

**Supporting writes** are allowed within authorized container use; bare engine CLI commands still require sandboxing or explicit scoped approval. A whole-task network prohibition still forbids registry downloads, and workload restrictions remain intact. Reconnect the sandbox MCP through OpenCode's `/mcps` interface to load the patched server; refreshed shared guidance applies to subsequent sessions.

## What this case establishes—and does not

This is a representative **context-leakage failure**: a restriction for one execution layer was generalized to another layer with a different responsibility. Source inspection establishes the local-only image prerequisite and generic error reporting; instruction wording is a plausible contributor to the agent's routing mistake, not a controlled causal finding.

Training-derived overgeneralization is the user's proposed upstream explanation. This incident cannot establish a particular training cause, what AI laboratories know, or whether they can fix it; evaluating those claims requires evidence beyond this local trace.
