## Stop Conditions

- **No platform identified**: Ask before generating config.
- **No quality commands available**: Stop the dependent pipeline-design work and request an authorized owner plus project state for quality-gate setup; do not invent commands or bootstrap outside scope.
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
| "No scanner available, I'll visually inspect" | Visual inspection cannot establish scanner coverage; proceeding gives false confidence | Halt claims requiring that scan, report the missing capability and exact coverage gap; request authorized scanner/quality setup before re-running |
| "This vulnerability doesn't apply because we don't use that feature" | Applying untested assumptions to security gaps | Verify against actual code — grep for the vulnerable API usage |
| "I'll add every available scanner — better safe than sorry" | Long-running pipelines with noisy output slow the team down | Add essential scanners first; add more when failure patterns emerge |
| "I'll set PARALLEL_PROCESS_NUMBER=0 to use all cores" | In MegaLinter v10, `0` crashes `multiprocessing.Pool(0)` | Leave `PARALLEL_PROCESS_NUMBER` unset to natively use `mp.cpu_count()` |
| "I'll run pure HTML linters on Angular/React templates" | Pure HTML linters reject framework bindings (`*ngIf`, JSX), creating thousands of false positives | Use framework AST linters (e.g. `@angular-eslint/template`) and format with Prettier |
| "I'll fail producer steps immediately on lint error" | Aborts the pipeline DAG, preventing report normalization and telemetry publishing | Use non-blocking producers with status envelopes (`producer.env`) and enforce at tail gate |
| "I'll put container build in the test step" | Redundant, slow, and couples build artifacts with test verification | Decouple build (`kind: Build`) into an independent job from quality verification |
| "Change detection is too complex, I'll skip it" | Every docs commit triggers a full build | Implement basic path filters; they're 5 lines each |
| "I'll generate the pipeline and skip documentation" | The next person debugging a failure has zero context | Write a concise pipeline doc with the debug checklist |

---

## References

- Independent security review — provide changed pipeline, threat/acceptance criteria, scan results and unverified coverage; if no independent reviewer is available, report review pending.
- Authorized project setup and quality-tooling capability — provide current quality commands/configuration and requested setup scope; if unavailable or unauthorized, do not bootstrap.
