# OpenObserve + MegaLinter: Self-Hosted Quality Telemetry

> **Validated 2026-08-10.** This page documents a composition, not a drop-in SonarQube replacement.

> **MVP operational setup:** Start with the [OpenObserve + MegaLinter GitLab CI MVP getting-started guide](../playbook/openobserve-megalinter-gitlab-cicd-playbook.md) for one repository. Return to this canonical guide for advanced operating decisions.

## Positioning

**MegaLinter + OpenObserve is a self-hosted quality-telemetry plane.** MegaLinter runs heterogeneous linters in CI; OpenObserve stores, queries, and visualizes normalized run and finding telemetry. CI still owns the pass/fail policy, and the team still owns the normalization contract.

This composition is useful when a team wants an open-source-first, self-hosted record of polyglot lint activity and trends. It does not recreate SonarQube's centralized quality model merely by placing reports in a dashboard.

### License and operating model

Both OSS components are AGPL-3.0: [OpenObserve's license](https://raw.githubusercontent.com/openobserve/openobserve/main/LICENSE) and [MegaLinter's license](https://raw.githubusercontent.com/oxsecurity/megalinter/main/LICENSE).

| Component | OSS role | Commercial license fee | Operating caveat |
|---|---|---|---|
| [MegaLinter](https://github.com/oxsecurity/megalinter) | Executes many language, format, repository, and security linters in CI | The upstream project describes MegaLinter as free for all uses; an OSS deployment can be used without a commercial license fee | AGPL obligations, image/version management, CI runner time, and report retention remain |
| [OpenObserve](https://github.com/openobserve/openobserve) OSS | Self-hosted log/analytics store with SQL, Log Explorer, and dashboards | The OSS edition can be self-hosted without a commercial license fee; an Enterprise edition also exists | AGPL obligations plus compute, storage, networking, backups, upgrades, access control, and operations remain |

Here, **no commercial license fee** does not mean “license-free” or “zero cost.” Preserve applicable notices and source-availability obligations, and have legal counsel review the way the software is modified, conveyed, or offered as a service. Self-hosting also has infrastructure and operator costs. The [OpenObserve downloads and edition material](https://openobserve.ai/downloads/) is the authoritative place to check OSS/Enterprise boundaries. A sample `50Mi` Kubernetes request sometimes shown in OpenObserve examples is not a general runtime requirement; size the deployment from ingestion volume, query load, retention, storage backend, and availability needs.

## Composition and validated workflow

```text
repository
   │
   ▼
CI runner ── MegaLinter (current pinned GHCR image)
   │              ├─ raw per-linter reports and logs → CI artifacts
   │              └─ raw/full MegaLinter JSON report
   ▼
versioned Python normalizer
   │              ├─ quality_runs records
   │              └─ quality_findings records
   ▼
OpenObserve `_json` ingestion API → streams → SQL / Log Explorer / dashboards
```

1. **Execute.** Run the current MegaLinter release in the CI job against the intended workspace. Keep the image or action version explicit and update it deliberately.
2. **Preserve raw evidence.** Keep `megalinter-reports/`, console output, and the job metadata as CI artifacts. Raw reports are the forensic source; they are not assumed to be a stable cross-linter schema.
3. **Normalize.** A small, versioned adapter reads the raw/full MegaLinter JSON report and emits a stable contract for this organization. Treat its fields and nesting as report/version/linter-specific; do not assume it is the flat finding array often used in illustrative samples.
4. **Upload safely.** Upload the normalized records after lint execution, including on a lint failure. A reporting failure must be visible and must not silently turn a failed scan into a passing job.
5. **Explore.** Send the request body to an OpenObserve stream through the [`_json` ingestion endpoint](https://openobserve.ai/docs/reference/api/ingestion/logs/json/), then use [SQL](https://openobserve.ai/docs/reference/sql-reference/), Log Explorer, and [dashboards](https://openobserve.ai/docs/user-guide/analytics/dashboards/dashboards-in-openobserve/) for run history, linter failure rates, severity trends, and hotspots.

### Raw reports versus normalized streams

Keep these concerns separate:

| Data product | What it contains | Retention and purpose |
|---|---|---|
| **Raw CI artifacts** | MegaLinter's per-linter text files, logs, markdown summary, and raw/full JSON report | Short/medium retention for reproduction and audit; retain according to CI artifact policy |
| **`quality_runs` stream** | One normalized record per run: outcome, counts, duration, repository, commit, ref, pipeline, image, normalizer version, and source links | Longer retention for trend and management dashboards |
| **`quality_findings` stream** | One normalized record per finding: linter key, rule, severity, message, path, line/column, fixability, fingerprint, and run metadata | Retain long enough to investigate regressions; expire or compact according to issue-volume and privacy needs |

The normalized streams are an **owned integration contract**, not a promise that MegaLinter emits those exact records. Prefer an adapter per report-version/linter family over a universal parser that guesses fields. Preserve the raw artifact whenever a linter's output cannot be mapped confidently.

## Coverage and complexity: separate evidence producers

### Tool boundaries

MegaLinter is the **lint/policy orchestration** job in this composition, not the coverage engine. Its current [capability overview](https://megalinter.io/latest/), [supported-linter catalog](https://megalinter.io/latest/all_linters/), and [reporter catalog](https://megalinter.io/latest/reporters/) do not document native test execution, Cobertura/JaCoCo/LCOV artifact generation, or a coverage reporter. [`POST_COMMANDS`](https://megalinter.io/latest/config-postcommands/) can run user commands, but that is an extension hook rather than native coverage integration. Keep test and coverage thresholds in separate CI jobs.

MegaLinter can surface **language-specific complexity policy findings** when an underlying linter is enabled: for example, [Java PMD](https://megalinter.io/latest/descriptors/java_pmd/), [JavaScript ESLint](https://megalinter.io/latest/descriptors/javascript_eslint/), and [Python Ruff](https://megalinter.io/latest/descriptors/python_ruff/) rules. Those findings have different rule definitions and are not a comparable cross-language metric stream. The supported catalog does not document a [Lizard integration](https://github.com/terryyin/lizard); if Lizard is selected, run it as a dedicated complexity producer rather than implying that MegaLinter bundles it.

### Recommended CI topology

```text
lint job:       MegaLinter ───────────────┐
test/coverage job: native tests + report ─┼─> normalizer/uploader ─> OpenObserve streams
complexity job: Lizard or stack metric ──┘
```

Each producer owns its threshold and original exit status:

| Stack | Native test/coverage producer | GitLab-facing report | OpenObserve event |
|---|---|---|---|
| Java | JUnit + [JaCoCo](https://www.jacoco.org/jacoco/trunk/doc/) | JaCoCo coverage report plus JUnit test report | `coverage_run` with line/branch/function totals and percentage |
| .NET | `dotnet test` + [Coverlet](https://github.com/coverlet-coverage/coverlet) | Cobertura coverage report plus test report | `coverage_run` with assembly/module and coverage totals |
| JS/TS | [Jest](https://jestjs.io/docs/configuration#collectcoverage-boolean) / [Istanbul](https://istanbul.js.org/) | Supported coverage report plus unit-test report | `coverage_run` with file/module and line/branch/function totals |
| Python | `pytest` + [pytest-cov](https://pytest-cov.readthedocs.io/en/latest/) / [Coverage.py](https://coverage.readthedocs.io/) | Supported coverage report plus test report | `coverage_run` with package/module and line/branch totals |

The exact command and report path stay stack-specific. Use GitLab's [coverage-report artifact contract](https://docs.gitlab.com/ci/yaml/artifacts_reports/#artifactsreportscoverage_report), [coverage visualization](https://docs.gitlab.com/ci/testing/code_coverage/coverage_visualization/), [coverage guidance](https://docs.gitlab.com/ci/testing/code_coverage/), and [unit-test reports](https://docs.gitlab.com/ci/testing/unit_test_reports/) for MR/CI presentation. Those artifacts do **not** appear in OpenObserve automatically: a normalizer/uploader must explicitly read the artifact or summary and emit flat telemetry.

### Normalized coverage and complexity records

Keep per-run detail as flat log/event records. At minimum, `coverage_run` and `complexity_run` records should carry:

- identity: `event_type`, `schema_version`, `run_id`, `project`, `commit_sha`, `pipeline_id`, `mr_iid`, `ref`, `job_id`, and CI/artifact URL;
- scope: `language`, `module`, `tool`, `tool_version`, `report_format`, and `metric_type`;
- outcome: `status`, `threshold`, `duration_ms`, `normalizer_version`, and `_timestamp`;
- coverage: `line_percent`, `branch_percent`, `function_percent`, `covered`, `total`, and report completeness;
- complexity: `mean_complexity`, `max_complexity`, `functions_above_threshold`, `nloc`, and the threshold rule used.

If OpenObserve's metrics API is used, follow its [JSON metrics ingestion contract](https://openobserve.ai/docs/reference/api/ingestion/metrics/json/). Keep metric labels low-cardinality: `project`, `environment`, `module`, `language`, and `tool` are reasonable candidates. Keep `commit_sha`, `pipeline_id`, and `mr_iid` as event fields, not metric labels, to avoid an unbounded label set.

There is no single universal complexity score. Record the metric type, tool, language/module, threshold, mean/max complexity, functions above threshold, and NLOC; compare trends within the same tool, language, and module rather than ranking unrelated languages.

### Gates, drift, and Sonar semantics

The test/coverage and complexity jobs own threshold failures; OpenObserve observes, queries, and alerts on drift. It is not the only merge gate. Preserve the original job status while telemetry uploads on success or failure, using the failure-safe flow below.

This composition also does not turn producer-specific coverage or complexity into Sonar's centralized [quality-gate](https://docs.sonarsource.com/sonarqube-community-build/quality-standards-administration/managing-quality-gates/introduction-to-quality-gates.md), [new-code](https://docs.sonarsource.com/sonarqube-community-build/user-guide/about-new-code.md), and [metric](https://docs.sonarsource.com/sonarqube-community-build/user-guide/code-metrics/metrics-definition.md) semantics. It provides an owned evidence/telemetry contract; the team must define comparability, baselines, exceptions, and merge policy.

### OpenObserve ingestion and metadata contract

The OpenObserve `_json` API expects a JSON **array** of records, for example:

```json
[
  {
    "event_type": "quality_run",
    "schema_version": 1,
    "run_id": "project-12345",
    "project": "payments-api",
    "commit_sha": "abc123",
    "ref": "refs/heads/main",
    "pipeline_id": "12345",
    "status": "failed",
    "lint_error_count": 3,
    "normalizer_version": "2026-08-10.1",
    "_timestamp": "2026-08-10T07:00:00Z"
  }
]
```

Do not send a single object to `_json`, and do not assume that a newline-delimited or arbitrary nested JSON document is accepted by that endpoint. OpenObserve flattens deep JSON to a configured depth and supports configurable stream settings; see the [stream schema settings](https://openobserve.ai/docs/user-guide/data-processing/streams/schema-settings/) and [data/index type guidance](https://openobserve.ai/docs/user-guide/data-processing/streams/data-type-and-index-type-in-streams/). Schema inference/indexing is not equivalent to every field being natively indexed. Choose a small set of indexed/filter fields (`project`, `ref`, `commit_sha`, `status`, `severity`, `linter_key`, and `_timestamp` are typical candidates) and leave high-cardinality message or path fields unindexed unless query evidence justifies the cost. Respect the OpenObserve field/column limits and flattening settings for the selected edition and deployment.

Attach enough metadata to correlate a finding with its source without uploading source contents:

- repository/project identifier and owning team;
- commit SHA, branch/tag, merge request or change identifier, pipeline/job ID, and CI URL;
- run ID, event type, schema version, normalizer version, MegaLinter image/action reference, and timestamps;
- linter key, rule identifier, severity, message, relative path, line/column, fixability, and deterministic fingerprint;
- scan status, counts, duration, and whether the record is a complete or partial upload.

### Retention and security

- Keep raw reports in CI artifacts unless an explicit need justifies duplicating them in OpenObserve. Do not ingest source files, secrets, tokens, full diffs, or unredacted command output.
- Use a dedicated OpenObserve organization/stream and least-privilege ingestion credentials. Store credentials in masked CI variables, use TLS/private network paths, and restrict dashboard/query access by team and data sensitivity.
- Redact linter messages and paths if they can contain credentials, personal data, customer identifiers, or proprietary source fragments. Treat CI URLs and branch names as metadata that may still be sensitive.
- Set retention separately for raw artifacts, detailed findings, and run summaries. Configure backups, restore tests, capacity alerts, and upgrade ownership; AGPL software does not remove those operational controls.
- Confirm which authentication, RBAC, SSO, audit, or redaction capabilities belong to the selected OpenObserve edition and version. Do not infer them from the OSS ingestion API alone.

### Failure-safe upload design

GitLab does not execute later `script` lines after a command fails. Its [`after_script`](https://docs.gitlab.com/ci/yaml/#after_script) runs after the script section, and GitLab documents that artifacts are uploaded after `after_script`; see the [artifact reports](https://docs.gitlab.com/ci/yaml/artifacts_reports/) guidance. Use one of these deliberate patterns:

1. **Wrapper pattern:** run the scan under a wrapper that captures the tool exit code, completes the Python normalization/upload work with independent diagnostics, then explicitly re-exits with the saved code.
2. **`after_script` pattern:** use `after_script` for telemetry collection/upload after `script`. GitLab preserves the original `script` status because `after_script` does not affect the job exit code; it is not a status re-emission mechanism.

The wrapper invariant is:

```text
scan → save scan_status → normalize/upload (best effort but observable) → exit scan_status
```

If reporting is a release requirement, make an upload outage an explicit second failure policy; never hide it with `|| true`. If reporting is supplementary, record the upload failure in the job and alert on it while still returning the original lint status. Use Python's standard library or a pinned project utility for JSON transformation; do not assume `jq` exists in the MegaLinter image or runner.

## CI corrections relative to the supplied guide

Apply these corrections before copying a sample:

1. **Image/version:** current official guidance uses GHCR and v10 at this validation date: `ghcr.io/oxsecurity/megalinter:v10`. Do not use `oxsecurity/megalinter-cupcake:v7` as the default. Pin an exact release when reproducibility is more important than following the stable major tag; consult [version guidance](https://megalinter.io/latest/install-version/).
2. **Activation:** `ENABLE_LINTERS` takes linter keys such as `JAVASCRIPT_ES`, not a boolean string such as `"TRUE"`. Use `ENABLE` for descriptor groups and `ENABLE_LINTERS` for specific keys; see [activation/deactivation](https://megalinter.io/latest/config-activation/).
3. **Fixes:** `APPLY_FIXES: none` is a valid documented value and is a safe report-only baseline. Enable fixes only with an explicit branch/commit policy; see [apply fixes](https://megalinter.io/latest/config-apply-fixes/).
4. **Report-folder cleanup:** use `CLEAR_REPORT_FOLDER` when cleanup is wanted. `CLEAR_PHASE` is not a documented current MegaLinter variable; see [common variables](https://megalinter.io/latest/config-variables/).
5. **Markdown/JSON reporters:** use `MARKDOWN_SUMMARY_REPORTER`, not `MARKDOWN_REPORTER`. `JSON_REPORTER` is valid; it produces a JSON execution log/report whose schema should be treated as report-version-specific, not as a flat GitLab Code Quality array. See the [JSON reporter](https://megalinter.io/latest/reporters/JsonReporter/) and [GitLab Code Quality format](https://docs.gitlab.com/ci/testing/code_quality/) documentation.
6. **GitLab Code Quality:** MegaLinter's current documentation does not document native `artifacts:reports:codequality`/CodeClimate output. If a GitLab Code Quality widget is required, add a separate transform that emits the [required JSON array](https://docs.gitlab.com/ci/testing/code_quality/) with `description`, `check_name`, `fingerprint`, `location.path` plus line, and an allowed `severity`. Do not label the raw MegaLinter JSON as native GitLab Code Quality output.
7. **GitLab entrypoint:** the official GitLab example uses the current GHCR image with `script: ["true"]`; `/entrypoint.sh` is an explicit fallback only when the runner/image combination needs it. Do not replace the documented setup with an old image or an invented script contract; see [install on GitLab CI](https://megalinter.io/latest/install-gitlab/).
8. **Failure behavior:** later script lines do not run after a failed command. Use the wrapper pattern when the reporting flow must explicitly re-exit a saved status; use `after_script` for collection/upload because GitLab preserves the original `script` exit status. Normalize with Python rather than assuming `jq`, and upload on lint failure.

A minimal configuration baseline is therefore closer to:

```yaml
# .mega-linter.yml — select only the keys this repository intends to run
ENABLE_LINTERS:
  - JAVASCRIPT_ES
JSON_REPORTER: true
MARKDOWN_SUMMARY_REPORTER: true
APPLY_FIXES: none
CLEAR_REPORT_FOLDER: true
```

This is a configuration sketch, not a complete GitLab job. The [GitLab installation page](https://megalinter.io/latest/install-gitlab/) remains the source for the job image, `script`, workspace, and artifact wiring.

## Decision matrix: this composition versus SonarQube

| Need | MegaLinter + OpenObserve | SonarQube |
|---|---|---|
| Primary role | Heterogeneous CI execution plus self-hosted telemetry and dashboards | Integrated analysis, governance, quality gates, and portfolio control tower |
| Commercial license fee | OSS components can be used without a commercial license fee; AGPL obligations and operational costs remain | Depends on edition and commercial terms; verify current product/licensing terms |
| Local/CI lint breadth | Strong when the required linter exists in MegaLinter or is added to the CI composition | Strong analyzer coverage, but still does not eliminate every stack-native formatter/type/test tool |
| Normalization | Team-owned Python adapter and schema; raw reports remain authoritative | Platform-owned issue model, rule profiles, and lifecycle semantics within its supported analysis |
| Quality gates and new-code/diff semantics | CI policy and custom queries; not supplied centrally by this composition | Central quality gates and new-code policies are a core strength |
| Coverage | Add separate coverage producers and normalization; not inherent in this composition | Coverage ingestion and quality-gate integration are established platform capabilities |
| Duplication governance | Add a linter/report and define custom aggregation; no unified policy by default | Integrated duplication analysis and governance |
| PR decoration | Use CI-native comments/statuses and custom integration; not a unified promise | First-class supported workflow depends on edition/ALM integration |
| Security normalization | Run dedicated tools and map their findings explicitly; do not treat telemetry as SAST | Security rules and issue model exist, but dedicated SAST/SCA may still be needed |
| Best fit | Polyglot teams prioritizing self-hosting, data ownership, raw evidence, and customizable telemetry | Teams prioritizing centralized governance, comparable semantics, policy, workflow integration, and portfolio support |

### Use this composition when

- the primary pain is fragmented polyglot CI evidence, not the absence of a governance product;
- self-hosting and no commercial license fee matter, and the team accepts AGPL review plus infrastructure ownership;
- the team can maintain a versioned normalizer, retention policy, dashboards, and CI failure-path behavior;
- OpenObserve's SQL, Log Explorer, dashboards, and ingestion model are sufficient for the required visibility.

### Prefer SonarQube, or keep it alongside this composition, when the requirement includes

- centralized [quality gates](https://docs.sonarsource.com/sonarqube-community-build/quality-standards-administration/managing-quality-gates/introduction-to-quality-gates.md) across repositories;
- [new-code](https://docs.sonarsource.com/sonarqube-community-build/user-guide/about-new-code.md) and diff semantics with a consistent baseline;
- coverage governance and quality-gate integration, plus [metrics](https://docs.sonarsource.com/sonarqube-community-build/user-guide/code-metrics/metrics-definition.md) for coverage/duplication comparisons;
- a normalized issue lifecycle and centrally managed [quality profiles](https://docs.sonarsource.com/sonarqube-server/2025.2/quality-standards-administration/managing-quality-profiles.md), [rules](https://docs.sonarsource.com/sonarqube-community-build/quality-standards-administration/managing-rules/rules.md), and [issues](https://docs.sonarsource.com/sonarqube-community-build/user-guide/issues/solution-overview.md);
- duplication governance;
- PR decoration and supported ALM workflow integration through [pull-request analysis](https://docs.sonarsource.com/sonarqube-server/2026.1/discovering/code-analysis/pull-request-analysis.md); or
- normalized security analysis, prioritization, and remediation governance, including [security-hotspot workflows](https://docs.sonarsource.com/sonarqube-server/2026.2/user-guide/security-hotspots.md).

The practical model is often **native linters for the fast loop, MegaLinter for heterogeneous CI execution, OpenObserve for self-hosted telemetry, and Sonar or another governance layer where those semantic gaps are material**.

## Evidence detail

The canonical page keeps claim-level links near the relevant guidance. The complete grouped source map is in [OpenObserve + MegaLinter evidence sources](./details/openobserve-megalinter-sources.md).
