---
name: devsecops
description: "Use this skill to design CI/CD pipelines with integrated security scanning — change detection, environment separation, secret detection, dependency auditing, SAST, IaC scanning, and audit trails. Activate when setting up CI/CD, configuring GitHub Actions or GitLab CI, automating deployments, or running security audits and compliance checks. Skip for one-off scripts, local-only changes, or code reviews (use reviewer)."
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
