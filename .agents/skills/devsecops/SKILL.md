---
name: devsecops
description: "Design CI/CD pipelines with integrated security scanning — change detection, environment separation, artifact retention, diagnostic collection, secret detection, dependency auditing, SAST, IaC scanning, and audit trail verification.\n\nLoad for \"set up CI/CD\", \"create pipeline\", \"configure GitHub Actions / GitLab CI\", \"automate deployments\", \"set up security scanning\", \"audit dependencies\", \"check for secrets\", \"security audit\", \"vulnerability scan\", \"compliance check\", or \"design deployment workflow\".\n\nSkip for one-off script runs, local-only changes, or security reviews handled by the reviewer skill."
---

# DevSecOps

Design CI/CD with integrated security. Phases are mandatory for pipeline design work.

| Phase | Detail |
|---|---|
| 1–6 full procedure | `references/phases.md` |
| Stop / deliverable / anti-patterns | `references/stop-deliverable-antipatterns.md` |

## Phase map

1. **Discover** — stack, existing CI, secrets handling, deploy targets.
2. **Architecture** — change detection, env separation, artifacts, diagnostics.
3. **Generate config** — platform-native pipeline files.
4. **Security posture audit** — secrets, deps, SAST, IaC, audit trails.
5. **Integrate scanners** into pipeline stages with fail policies.
6. **Validate & document** — quality-gates linkage, runbooks.

Compose with `project-foundation` (bootstrap first) and `reviewer` (security lens) after changes.

## Hard rules

- Never commit secrets; add secret scanning to `quality`/`CI`.
- Prefer existing org scanners over inventing one-off tools.
- Do not weaken gates silently — document waivers with owners.
