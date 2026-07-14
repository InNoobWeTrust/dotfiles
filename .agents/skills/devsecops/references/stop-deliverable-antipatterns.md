## Stop Conditions

- **No platform identified**: Ask before generating config.
- **No quality commands available**: If `make test` etc. don't exist, bootstrap via `project-foundation` skill first.
- **Secret in git history** → CRITICAL. Rotate credential, rewrite history, re-scan.
- **Exploitable critical vulnerability (CVSS ≥ 9.0)** → CRITICAL. Do not proceed without fix or mitigation.

---

## Deliverable

- [ ] Pipeline context summary (Phase 1)
- [ ] Pipeline architecture design (Phase 2)
- [ ] Pipeline configuration file(s) (Phase 3)
- [ ] Secret detection report (Phase 4.A)
- [ ] Dependency vulnerability report (Phase 4.B)
- [ ] Static code analysis findings (Phase 4.C)
- [ ] IaC scan findings, if applicable (Phase 4.D)
- [ ] Audit trail compliance gaps, if applicable (Phase 4.E)
- [ ] Security scanning integrated into pipeline (Phase 5)
- [ ] Validated config and documentation (Phase 6)
- [ ] Aggregated severity summary with prioritized remediation

---

## Design Decision Anti-Patterns

| Temptation | Why It's Wrong | Correct Path |
|---|---|---|
| "I'll put everything in one job to keep it simple" | No parallelism, no change detection — every commit runs everything | Separate jobs with proper dependencies and path filters |
| "I'll hardcode the branch names" | Branch names change between repos | Use platform conventions (`$default_branch`, `$CI_DEFAULT_BRANCH`) |
| "I'll put secrets in the pipeline config for now" | Secrets in version control are permanently compromised | Use the platform's secret store; reference by name only |
| "No scanner available, I'll visually inspect" | Visual inspection misses 95% of secrets and vulnerabilities; proceeding with incomplete scans gives false confidence | Halt and route to `project-foundation` skill to bootstrap quality commands, then re-run scans |
| "This vulnerability doesn't apply because we don't use that feature" | Applying untested assumptions to security gaps | Verify against actual code — grep for the vulnerable API usage |
| "I'll add every available scanner — better safe than sorry" | Long-running pipelines with noisy output slow the team down | Add essential scanners first; add more when failure patterns emerge |
| "Change detection is too complex, I'll skip it" | Every docs commit triggers a full build | Implement basic path filters; they're 5 lines each |
| "I'll generate the pipeline and skip documentation" | The next person debugging a failure has zero context | Write a concise pipeline doc with the debug checklist |

---

## References

- `reviewer` skill — For security sub-reviewer lens (`references/sub-reviewers/security.md`)
- `project-foundation` skill — For bootstrapping quality gate commands if they don't exist
